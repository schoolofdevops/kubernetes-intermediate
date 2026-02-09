# Lab: Helm-ifying the Voting App

## Objectives

By the end of this lab, you will be able to:

- Scaffold a Helm chart with `helm create` and understand the generated structure
- Templatize Kubernetes manifests with values for configurable deployments
- Add chart dependencies for redis and postgresql from Bitnami repositories
- Build an umbrella chart deploying the entire Voting App with one command
- Add a pre-install lifecycle hook for database initialization tasks

## Prerequisites

Before starting this lab, ensure you have:

- **Helm 3 installed**: Run `helm version` to verify (should show v3.x or later)
- **KIND cluster running**: Your existing cluster from previous modules
- **kubectl configured**: Able to communicate with your cluster
- **Familiarity with Voting App YAML structure**: Understanding of the five components (vote, result, worker, redis, postgres)

If Helm is not installed:

```bash
# macOS
brew install helm

# Linux/WSL
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
helm version
```

## Setup

Prepare your environment for Helm chart development.

**Step 1: Verify cluster status**

```bash
kubectl get nodes
```

Expected output:

```bash
NAME                       STATUS   ROLES           AGE   VERSION
voting-app-control-plane   Ready    control-plane   1d    v1.32.0
voting-app-worker          Ready    <none>          1d    v1.32.0
voting-app-worker2         Ready    <none>          1d    v1.32.0
```

All nodes should show Ready status.

**Step 2: Create a working directory**

```bash
mkdir -p ~/voting-app-chart
cd ~/voting-app-chart
```

This directory will hold your Helm chart during development.

**Step 3: Create a namespace for Helm deployments**

```bash
kubectl create namespace helm-voting-app
```

This keeps Helm-deployed resources separate from previous module deployments.

**Step 4: Add Bitnami repository**

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

Expected output:

```bash
"bitnami" has been added to your repositories
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "bitnami" chart repository
Update Complete.
```

The Bitnami repository provides redis and postgresql charts we'll use as dependencies.

## Tasks

### Task 1: Create Your First Chart (Vote Service)

Start small: create a chart for just the vote service. This teaches chart structure without overwhelming complexity.

**Step 1: Scaffold a new chart**

```bash
helm create voting-app
```

Expected output:

```bash
Creating voting-app
```

Explore the generated structure:

```bash
tree voting-app
```

You should see:

```
voting-app/
├── Chart.yaml          # Chart metadata
├── charts/             # Dependencies (empty initially)
├── templates/          # Template files
│   ├── NOTES.txt
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── hpa.yaml
│   ├── ingress.yaml
│   ├── service.yaml
│   ├── serviceaccount.yaml
│   └── tests/
└── values.yaml         # Default configuration
```

**Step 2: Clean the templates directory**

The default templates are generic. We'll write our own for the Voting App:

```bash
rm -rf voting-app/templates/*
```

This removes all generated templates. We start fresh.

**Step 3: Create vote deployment template**

Create `voting-app/templates/vote-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "voting-app.fullname" . }}-vote
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
    component: vote
spec:
  replicas: {{ .Values.vote.replicaCount }}
  selector:
    matchLabels:
      {{- include "voting-app.selectorLabels" . | nindent 6 }}
      component: vote
  template:
    metadata:
      labels:
        {{- include "voting-app.selectorLabels" . | nindent 8 }}
        component: vote
    spec:
      containers:
      - name: vote
        image: "{{ .Values.vote.image.repository }}:{{ .Values.vote.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.vote.image.pullPolicy }}
        ports:
        - containerPort: 80
          name: http
        resources:
          {{- toYaml .Values.vote.resources | nindent 10 }}
```

**Step 4: Create vote service template**

Create `voting-app/templates/vote-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "voting-app.fullname" . }}-vote
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
    component: vote
spec:
  type: {{ .Values.vote.service.type }}
  ports:
  - port: {{ .Values.vote.service.port }}
    targetPort: http
    protocol: TCP
    name: http
  selector:
    {{- include "voting-app.selectorLabels" . | nindent 4 }}
    component: vote
```

**Step 5: Create helper templates**

Create `voting-app/templates/_helpers.tpl`:

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "voting-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "voting-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "voting-app.labels" -}}
helm.sh/chart: {{ include "voting-app.chart" . }}
{{ include "voting-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "voting-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "voting-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "voting-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}
```

**Step 6: Update values.yaml**

Replace the entire contents of `voting-app/values.yaml`:

```yaml
vote:
  replicaCount: 2
  image:
    repository: schoolofdevops/vote
    tag: v1
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 80
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

**Step 7: Test rendering**

Preview the generated YAML without installing:

```bash
helm template voting-app ./voting-app
```

Expected output: Valid Kubernetes YAML for Deployment and Service. Review the output and verify:
- Image is `schoolofdevops/vote:v1`
- Replicas is 2
- Service type is ClusterIP
- Resource limits are applied

**Step 8: Install the chart**

```bash
helm install voting-app ./voting-app -n helm-voting-app
```

Expected output:

```bash
NAME: voting-app
LAST DEPLOYED: [timestamp]
NAMESPACE: helm-voting-app
STATUS: deployed
REVISION: 1
```

**Step 9: Verify deployment**

```bash
kubectl get pods -n helm-voting-app
kubectl get svc -n helm-voting-app
```

Expected: Two vote pods running, one vote service created.

### Task 2: Templatize with Helpers and Add All Components

Expand the chart to include result and worker components, using helpers for consistency.

**Step 1: Create result deployment template**

Create `voting-app/templates/result-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "voting-app.fullname" . }}-result
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
    component: result
spec:
  replicas: {{ .Values.result.replicaCount }}
  selector:
    matchLabels:
      {{- include "voting-app.selectorLabels" . | nindent 6 }}
      component: result
  template:
    metadata:
      labels:
        {{- include "voting-app.selectorLabels" . | nindent 8 }}
        component: result
    spec:
      containers:
      - name: result
        image: "{{ .Values.result.image.repository }}:{{ .Values.result.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.result.image.pullPolicy }}
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: POSTGRES_HOST
          value: "{{ .Release.Name }}-postgresql"
        - name: POSTGRES_PORT
          value: "5432"
        - name: POSTGRES_USER
          value: {{ .Values.postgresql.auth.username | quote }}
        - name: POSTGRES_PASSWORD
          value: {{ .Values.postgresql.auth.password | quote }}
        - name: POSTGRES_DB
          value: {{ .Values.postgresql.auth.database | quote }}
        resources:
          {{- toYaml .Values.result.resources | nindent 10 }}
```

**Step 2: Create result service template**

Create `voting-app/templates/result-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "voting-app.fullname" . }}-result
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
    component: result
spec:
  type: {{ .Values.result.service.type }}
  ports:
  - port: {{ .Values.result.service.port }}
    targetPort: http
    protocol: TCP
    name: http
  selector:
    {{- include "voting-app.selectorLabels" . | nindent 4 }}
    component: result
```

**Step 3: Create worker deployment template**

Create `voting-app/templates/worker-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "voting-app.fullname" . }}-worker
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
    component: worker
spec:
  replicas: {{ .Values.worker.replicaCount }}
  selector:
    matchLabels:
      {{- include "voting-app.selectorLabels" . | nindent 6 }}
      component: worker
  template:
    metadata:
      labels:
        {{- include "voting-app.selectorLabels" . | nindent 8 }}
        component: worker
    spec:
      containers:
      - name: worker
        image: "{{ .Values.worker.image.repository }}:{{ .Values.worker.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.worker.image.pullPolicy }}
        resources:
          {{- toYaml .Values.worker.resources | nindent 10 }}
```

Note: Worker has no service because it doesn't receive incoming traffic.

**Step 4: Update values.yaml with result and worker sections**

Append to `voting-app/values.yaml`:

```yaml
result:
  replicaCount: 2
  image:
    repository: schoolofdevops/result
    tag: v1
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 80
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi

worker:
  replicaCount: 1
  image:
    repository: schoolofdevops/worker
    tag: v1
    pullPolicy: IfNotPresent
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

**Step 5: Upgrade the release**

```bash
helm upgrade voting-app ./voting-app -n helm-voting-app
```

Expected output:

```bash
Release "voting-app" has been upgraded. Happy Helming!
```

**Step 6: Verify all components**

```bash
kubectl get pods -n helm-voting-app
```

Expected: Vote pods (2), result pods (2), worker pod (1) all running.

**Step 7: Lint the chart**

```bash
helm lint ./voting-app
```

Expected output:

```bash
==> Linting ./voting-app
[INFO] Chart.yaml: icon is recommended

1 chart(s) linted, 0 chart(s) failed
```

The icon warning is informational only. No errors means the chart is valid.

### Task 3: Add Chart Dependencies (Redis and PostgreSQL)

Use Bitnami charts for redis and postgresql instead of maintaining your own manifests.

**Step 1: Edit Chart.yaml to add dependencies**

Edit `voting-app/Chart.yaml` and add the dependencies section:

```yaml
apiVersion: v2
name: voting-app
description: Example Voting App - Multi-tier Kubernetes application
type: application
version: 1.0.0
appVersion: "v1"

dependencies:
- name: redis
  version: "18.19.4"
  repository: https://charts.bitnami.com/bitnami
  condition: redis.enabled
- name: postgresql
  version: "15.5.38"
  repository: https://charts.bitnami.com/bitnami
  condition: postgresql.enabled
```

:::note[Version Availability]
Bitnami chart versions change frequently. If these exact versions are unavailable, find current versions:

```bash
helm search repo bitnami/redis --versions | head -5
helm search repo bitnami/postgresql --versions | head -5
```

Use the latest stable version (not prerelease).
:::

**Step 2: Add dependency configuration to values.yaml**

Append to `voting-app/values.yaml`:

```yaml
redis:
  enabled: true
  auth:
    enabled: false  # Simplified for learning (use auth in production!)
  master:
    persistence:
      enabled: false  # No persistence needed for labs

postgresql:
  enabled: true
  auth:
    username: postgres
    password: postgres
    database: votes
  primary:
    persistence:
      enabled: false  # No persistence needed for labs
```

**Step 3: Download dependency charts**

```bash
helm dependency update ./voting-app
```

Expected output:

```bash
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "bitnami" chart repository
Update Complete.
Saving 2 charts
Downloading redis from repo https://charts.bitnami.com/bitnami
Downloading postgresql from repo https://charts.bitnami.com/bitnami
Deleting outdated charts
```

**Step 4: Verify dependencies**

```bash
helm dep list ./voting-app
```

Expected output:

```bash
NAME        VERSION    REPOSITORY                              STATUS
redis       18.19.4    https://charts.bitnami.com/bitnami     ok
postgresql  15.5.38    https://charts.bitnami.com/bitnami     ok
```

Both should show "ok" status.

Check the charts directory:

```bash
ls -lh ./voting-app/charts/
```

You should see two .tgz files: `redis-18.19.4.tgz` and `postgresql-15.5.38.tgz`.

**Step 5: Update worker environment variables**

Edit `voting-app/templates/worker-deployment.yaml` and add environment variables:

```yaml
      containers:
      - name: worker
        image: "{{ .Values.worker.image.repository }}:{{ .Values.worker.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.worker.image.pullPolicy }}
        env:
        - name: REDIS_HOST
          value: "{{ .Release.Name }}-redis-master"
        - name: POSTGRES_HOST
          value: "{{ .Release.Name }}-postgresql"
        - name: POSTGRES_USER
          value: {{ .Values.postgresql.auth.username | quote }}
        - name: POSTGRES_PASSWORD
          value: {{ .Values.postgresql.auth.password | quote }}
        resources:
          {{- toYaml .Values.worker.resources | nindent 10 }}
```

**Step 6: Upgrade the release**

```bash
helm upgrade voting-app ./voting-app -n helm-voting-app
```

**Step 7: Verify all pods running**

```bash
kubectl get pods -n helm-voting-app
```

Expected: Vote (2), result (2), worker (1), redis (1), postgresql (1) all running. This may take 30-60 seconds as redis and postgresql initialize.

**Step 8: Check service names**

```bash
kubectl get svc -n helm-voting-app
```

Note the redis and postgresql service names: `voting-app-redis-master` and `voting-app-postgresql`. The worker connects to these.

### Task 4: Deploy to Multiple Environments

Use different values files to deploy the same chart to staging and production with different configurations.

**Step 1: Create values-staging.yaml**

Create `voting-app/values-staging.yaml`:

```yaml
vote:
  replicaCount: 1
  resources:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 50m
      memory: 64Mi

result:
  replicaCount: 1
  resources:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 50m
      memory: 64Mi

worker:
  replicaCount: 1
  resources:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 50m
      memory: 64Mi
```

Staging uses lower replicas and resources for cost savings.

**Step 2: Create values-production.yaml**

Create `voting-app/values-production.yaml`:

```yaml
vote:
  replicaCount: 3
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi

result:
  replicaCount: 3
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi

worker:
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
```

Production uses higher replicas and resources for performance.

**Step 3: Deploy to staging namespace**

```bash
kubectl create namespace staging
helm install voting-staging ./voting-app -n staging -f ./voting-app/values-staging.yaml
```

**Step 4: Deploy to production namespace**

```bash
kubectl create namespace production
helm install voting-prod ./voting-app -n production -f ./voting-app/values-production.yaml
```

**Step 5: Compare deployments**

```bash
kubectl get pods -n staging
kubectl get pods -n production
```

Staging should show 1 vote replica, production should show 3 vote replicas. Same chart, different configuration.

**Step 6: List all releases**

```bash
helm list --all-namespaces
```

Expected output shows three releases:

```bash
NAME            NAMESPACE       REVISION  STATUS    CHART             APP VERSION
voting-app      helm-voting-app 3         deployed  voting-app-1.0.0  v1
voting-staging  staging         1         deployed  voting-app-1.0.0  v1
voting-prod     production      1         deployed  voting-app-1.0.0  v1
```

**Step 7: Clean up extra namespaces**

```bash
helm uninstall voting-staging -n staging
helm uninstall voting-prod -n production
kubectl delete namespace staging production
```

We keep the helm-voting-app namespace for the next task.

### Task 5: Add Lifecycle Hook

Add a pre-install hook that simulates database initialization.

**Step 1: Create pre-install hook**

Create `voting-app/templates/pre-install-job.yaml`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "voting-app.fullname" . }}-db-init
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
    component: db-init
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    metadata:
      labels:
        component: db-init
    spec:
      containers:
      - name: db-init
        image: postgres:15
        command:
        - sh
        - -c
        - |
          echo "Database initialization starting..."
          echo "Connecting to {{ .Release.Name }}-postgresql:5432"
          echo "Would run schema migrations here"
          sleep 5
          echo "Database initialization complete"
      restartPolicy: Never
  backoffLimit: 3
```

This job runs before the main resources are created.

**Step 2: Explain hook annotations**

- **`helm.sh/hook: pre-install`**: Runs before any chart resources are created
- **`helm.sh/hook-weight: -5`**: Runs before other pre-install hooks (lower weight = earlier)
- **`helm.sh/hook-delete-policy: hook-succeeded`**: Deletes the Job after successful completion

**Step 3: Uninstall and reinstall to trigger pre-install hook**

```bash
helm uninstall voting-app -n helm-voting-app
helm install voting-app ./voting-app -n helm-voting-app
```

During installation, the hook job runs first.

**Step 4: Check hook job status**

```bash
kubectl get jobs -n helm-voting-app
```

If the job already completed and was deleted (hook-delete-policy), you won't see it. Check events:

```bash
kubectl get events -n helm-voting-app --sort-by='.lastTimestamp' | grep db-init
```

You should see events showing the db-init job was created and completed.

**Step 5: Understand hook use cases**

Real-world hook examples:
- **pre-install**: Validate cluster has required CRDs, check dependencies
- **post-install**: Load initial data, warm caches, send notification
- **pre-upgrade**: Run database migrations, backup data
- **post-upgrade**: Verify deployment, run smoke tests
- **pre-delete**: Backup data before uninstall
- **post-delete**: Clean up external resources (S3 buckets, DNS records)

### Challenge: Chart Testing

Add a test hook that verifies the vote service is reachable.

**Step 1: Create test hook**

Create `voting-app/templates/tests/test-connection.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: {{ include "voting-app.fullname" . }}-test-connection
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
spec:
  containers:
  - name: wget
    image: busybox
    command: ['wget']
    args: ['--spider', '--timeout=5', 'http://{{ include "voting-app.fullname" . }}-vote:80']
  restartPolicy: Never
```

**Step 2: Run the test**

```bash
helm test voting-app -n helm-voting-app
```

Expected output:

```bash
NAME: voting-app
LAST DEPLOYED: [timestamp]
NAMESPACE: helm-voting-app
STATUS: deployed
REVISION: 1
TEST SUITE:     voting-app-test-connection
Last Started:   [timestamp]
Last Completed: [timestamp]
Phase:          Succeeded
```

The test pod attempts to connect to the vote service. If successful, the test passes.

**Step 3: View test logs**

```bash
kubectl logs -n helm-voting-app voting-app-test-connection
```

You should see wget successfully connected (or an error if the service isn't ready).

## Verification

Confirm your Helm chart is complete and functional.

**1. Check release status**

```bash
helm list -n helm-voting-app
```

Expected: One release named "voting-app" in deployed status.

**2. Verify all pods running**

```bash
kubectl get pods -n helm-voting-app
```

Expected: Vote (2), result (2), worker (1), redis (1), postgresql (1) all Running.

**3. Test template rendering**

```bash
helm template ./voting-app | kubectl apply --dry-run=client -f -
```

Expected: No errors. All rendered manifests are valid Kubernetes YAML.

**4. Lint the chart**

```bash
helm lint ./voting-app
```

Expected: No errors, possibly informational warnings about icon or README.

**5. Verify Voting App functionality**

```bash
kubectl port-forward -n helm-voting-app svc/voting-app-vote 8080:80 &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
pkill -f "port-forward"
```

Expected: HTTP 200 response (vote service is accessible).

**6. Check dependency status**

```bash
helm dep list ./voting-app
```

Expected: Redis and postgresql both show "ok" status.

## Cleanup

The Voting App Helm release can remain deployed for reference in future modules.

To remove everything:

```bash
helm uninstall voting-app -n helm-voting-app
kubectl delete namespace helm-voting-app
```

To keep the chart source for reference:

```bash
# Chart source remains in ~/voting-app-chart/
ls -la ~/voting-app-chart/voting-app/
```

## Troubleshooting

### Issue: Template rendering errors during helm install

**Symptom:** Error like "error converting YAML to JSON: yaml: line 23: did not find expected key"

**Cause:** Template syntax produces invalid YAML (usually indentation problems)

**Solution:**

```bash
# Render templates locally to see the actual YAML
helm template ./voting-app > /tmp/rendered.yaml

# Check the problematic section around line 23
sed -n '20,30p' /tmp/rendered.yaml

# Common fixes:
# - Check nindent values match YAML nesting level
# - Ensure {{- removes extra newlines where needed
# - Verify toYaml outputs are properly indented
```

### Issue: Dependency not found error

**Symptom:** Error like "no repository definition for https://charts.bitnami.com/bitnami"

**Cause:** Helm repository not added

**Solution:**

```bash
# Add Bitnami repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Retry dependency update
helm dependency update ./voting-app
```

### Issue: Values not taking effect after upgrade

**Symptom:** Changed values.yaml but pods still use old configuration

**Cause:** Values path doesn't match template references

**Solution:**

```bash
# Check template for exact path
grep "Values.vote" ./voting-app/templates/vote-deployment.yaml

# Ensure values.yaml structure matches
# If template uses .Values.vote.image.tag
# Then values.yaml must have:
# vote:
#   image:
#     tag: v1

# Verify rendered values
helm template ./voting-app | grep "image:"
```

### Issue: Release stuck in pending-install

**Symptom:** `helm install` hangs, release shows pending-install status

**Cause:** Pre-install hook failed or is still running

**Solution:**

```bash
# Check hook job status
kubectl get jobs -n helm-voting-app

# Check hook pod logs
kubectl logs -n helm-voting-app -l component=db-init

# If hook failed, uninstall and fix
helm uninstall voting-app -n helm-voting-app --no-hooks

# Fix the hook template and reinstall
```

### Issue: Chart dependency version conflict

**Symptom:** Error like "redis version 18.19.4 not found"

**Cause:** Bitnami removed old chart versions from repository

**Solution:**

```bash
# Find available versions
helm search repo bitnami/redis --versions | head -10
helm search repo bitnami/postgresql --versions | head -10

# Update Chart.yaml with available versions
# Edit voting-app/Chart.yaml dependencies section

# Update dependencies
helm dependency update ./voting-app
```

## Key Takeaways

- **Helm transforms manual YAML management into automated package deployment** with a single `helm install` command deploying all components
- **Chart structure separates configuration (values.yaml) from templates** enabling the same chart to deploy to dev, staging, and production with different settings
- **Template helpers (_helpers.tpl) create consistency** by defining labels, selectors, and names once and reusing everywhere
- **Chart dependencies eliminate maintaining common services** by reusing battle-tested Bitnami charts for redis and postgresql
- **Lifecycle hooks bridge declarative resources and procedural tasks** running database migrations, health checks, and cleanup at the right moment in the deployment lifecycle
