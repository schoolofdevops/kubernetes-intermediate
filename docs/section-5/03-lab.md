# Lab: Securing the Voting App

## Objectives

By the end of this lab, you will be able to:

- Create a KIND cluster with Calico CNI for NetworkPolicy enforcement
- Implement default-deny NetworkPolicy with selective allow rules for application components
- Apply Pod Security Admission to enforce baseline security standards
- Create least-privilege ServiceAccounts and RBAC roles for application services
- Move database credentials from environment variables to Kubernetes Secrets with volume mounts

## Prerequisites

Before starting this lab, ensure you have:

- KIND and kubectl installed on your machine
- Familiarity with the Example Voting App architecture from Modules 0-4
- Voting App YAML manifests available (you'll deploy a fresh instance)
- Basic understanding of Kubernetes networking and security concepts

:::info[Fresh Cluster Setup]
This lab creates a NEW KIND cluster with Calico CNI. NetworkPolicy enforcement requires a CNI plugin that supports it. KIND's default Flannel CNI does not enforce NetworkPolicies, so we must disable the default CNI and install Calico explicitly.
:::

## Setup

Follow these steps to prepare your environment for this lab.

**Step 1: Delete existing KIND cluster (if any)**

```bash
kind delete cluster --name voting-app
```

**Step 2: Create KIND cluster with Calico CNI**

Create a cluster configuration file:

```yaml title="kind-calico-config.yaml"
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  disableDefaultCNI: true  # Don't install Flannel
  podSubnet: 192.168.0.0/16  # Calico's default pod network
nodes:
- role: control-plane
- role: worker
- role: worker
```

Create the cluster:

```bash
kind create cluster --name voting-app --config kind-calico-config.yaml
```

Expected output:

```
Creating cluster "voting-app" ...
✓ Ensuring node image (kindest/node:v1.32.0)
✓ Preparing nodes 📦 📦 📦
✓ Writing configuration 📜
✓ Starting control-plane 🕹️
✓ Installing StorageClass 💾
✓ Joining worker nodes 🚜
Set kubectl context to "kind-voting-app"
```

**Step 3: Install Calico CNI**

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml
```

Wait for Calico pods to be ready:

```bash
kubectl wait --for=condition=ready --timeout=300s pod -l k8s-app=calico-node -n kube-system
```

Expected output:

```
pod/calico-node-xxxxx condition met
pod/calico-node-yyyyy condition met
pod/calico-node-zzzzz condition met
```

Verify Calico is running:

```bash
kubectl get pods -n kube-system -l k8s-app=calico-node
```

All calico-node pods should show STATUS: Running.

**Step 4: Create voting-app namespace**

```bash
kubectl create namespace voting-app
```

**Step 5: Deploy base Voting App**

Create deployment manifests:

```yaml title="voting-app-base.yaml"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vote
  namespace: voting-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vote
  template:
    metadata:
      labels:
        app: vote
    spec:
      containers:
      - name: vote
        image: schoolofdevops/vote:v1
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: vote
  namespace: voting-app
spec:
  selector:
    app: vote
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: voting-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:alpine
        ports:
        - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: voting-app
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
  namespace: voting-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: worker
  template:
    metadata:
      labels:
        app: worker
    spec:
      containers:
      - name: worker
        image: schoolofdevops/worker:latest
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: db
  namespace: voting-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_PASSWORD
          value: "postgres"
        ports:
        - containerPort: 5432
---
apiVersion: v1
kind: Service
metadata:
  name: db
  namespace: voting-app
spec:
  selector:
    app: db
  ports:
  - port: 5432
    targetPort: 5432
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: result
  namespace: voting-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: result
  template:
    metadata:
      labels:
        app: result
    spec:
      containers:
      - name: result
        image: schoolofdevops/result:v1
        ports:
        - containerPort: 8080
        env:
        - name: POSTGRES_HOST
          value: "db"
        - name: POSTGRES_PORT
          value: "5432"
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          value: "postgres"
        - name: POSTGRES_DB
          value: "postgres"
---
apiVersion: v1
kind: Service
metadata:
  name: result
  namespace: voting-app
spec:
  selector:
    app: result
  ports:
  - port: 80
    targetPort: 8080
```

Deploy the application:

```bash
kubectl apply -f voting-app-base.yaml
```

Wait for all pods to be running:

```bash
kubectl wait --for=condition=ready --timeout=120s pod --all -n voting-app
```

**Step 6: Verify application works**

Test the vote service:

```bash
kubectl port-forward -n voting-app svc/vote 8080:80
```

In another terminal, open `http://localhost:8080` in your browser. You should see the voting interface. Cast a vote, then stop the port-forward (Ctrl+C).

Test the result service:

```bash
kubectl port-forward -n voting-app svc/result 8081:80
```

Open `http://localhost:8081` and verify you can see voting results.

Your Voting App is now running with Calico CNI. Currently, there are no security controls in place. Let's fix that.

## Tasks

### Task 1: Network Isolation with NetworkPolicy

Implement default-deny NetworkPolicy and selective allow rules to control pod-to-pod communication.

**Step 1: Create default-deny policy**

This policy blocks all ingress and egress traffic for all pods in the voting-app namespace:

```yaml title="01-default-deny-all.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: voting-app
spec:
  podSelector: {}  # Applies to all pods
  policyTypes:
  - Ingress
  - Egress
```

Apply the policy:

```bash
kubectl apply -f 01-default-deny-all.yaml
```

**Step 2: Verify traffic is blocked**

Try to port-forward to the vote service:

```bash
kubectl port-forward -n voting-app svc/vote 8080:80
```

Open `http://localhost:8080` in your browser and try to cast a vote. The vote submission will fail or timeout because the vote pod cannot reach redis. This confirms NetworkPolicy is being enforced.

Stop the port-forward (Ctrl+C).

**Step 3: Allow DNS queries**

Without DNS, services cannot resolve each other's names. This policy allows all pods to query kube-dns:

```yaml title="02-allow-dns.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: voting-app
spec:
  podSelector: {}  # All pods need DNS
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
    ports:
    - protocol: UDP
      port: 53
```

Apply the DNS policy:

```bash
kubectl apply -f 02-allow-dns.yaml
```

**Step 4: Allow vote to communicate with redis**

```yaml title="03-vote-to-redis.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-ingress
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: redis
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: vote
    ports:
    - protocol: TCP
      port: 6379
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: vote-to-redis-egress
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: vote
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

Apply the policies:

```bash
kubectl apply -f 03-vote-to-redis.yaml
```

**Step 5: Allow worker to communicate with redis and postgres**

The worker needs to read from redis and write to postgres:

```yaml title="04-worker-policies.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: worker-egress
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: worker
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to:
    - podSelector:
        matchLabels:
          app: db
    ports:
    - protocol: TCP
      port: 5432
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-from-worker
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: redis
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: worker
    ports:
    - protocol: TCP
      port: 6379
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-from-worker
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: worker
    ports:
    - protocol: TCP
      port: 5432
```

Apply the policies:

```bash
kubectl apply -f 04-worker-policies.yaml
```

**Step 6: Allow result to communicate with postgres**

```yaml title="05-result-to-db.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: result-to-db-egress
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: result
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: db
    ports:
    - protocol: TCP
      port: 5432
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-from-result
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: result
    ports:
    - protocol: TCP
      port: 5432
```

Apply the policies:

```bash
kubectl apply -f 05-result-to-db.yaml
```

**Step 7: Allow external access to vote and result services**

```yaml title="06-allow-external-ingress.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: vote-external-ingress
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: vote
  policyTypes:
  - Ingress
  ingress:
  - from: []  # Allow from anywhere
    ports:
    - protocol: TCP
      port: 80
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: result-external-ingress
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: result
  policyTypes:
  - Ingress
  ingress:
  - from: []  # Allow from anywhere
    ports:
    - protocol: TCP
      port: 80
```

Apply the policies:

```bash
kubectl apply -f 06-allow-external-ingress.yaml
```

**Step 8: Test the complete application flow**

Port-forward to vote:

```bash
kubectl port-forward -n voting-app svc/vote 8080:80
```

Open `http://localhost:8080` and cast a vote. It should work now. Stop the port-forward.

Port-forward to result:

```bash
kubectl port-forward -n voting-app svc/result 8081:80
```

Open `http://localhost:8081` and verify you see the vote results. The complete flow works with NetworkPolicy enforcement.

**Step 9: Verify enforcement by testing blocked traffic**

Try to reach postgres directly from a vote pod (this should fail):

```bash
# Get a vote pod name
VOTE_POD=$(kubectl get pod -n voting-app -l app=vote -o jsonpath='{.items[0].metadata.name}')

# Try to reach postgres (should timeout or fail)
kubectl exec -n voting-app $VOTE_POD -- nc -zv db 5432 -w 3
```

Expected output:

```
nc: db (10.96.x.x:5432): Operation timed out
command terminated with exit code 1
```

This confirms that vote cannot reach postgres directly, even though both are in the same namespace. NetworkPolicy is enforcing the rules.

### Task 2: Pod Security Standards with PSA

Apply Pod Security Admission to prevent pods from running with dangerous privileges.

**Step 1: Apply PSA labels to voting-app namespace**

```yaml title="voting-app-namespace-psa.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: voting-app
  labels:
    # Enforce baseline security
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/enforce-version: latest
    # Audit violations of restricted policy
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: latest
    # Warn users about restricted policy violations
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest
```

Apply the namespace configuration:

```bash
kubectl apply -f voting-app-namespace-psa.yaml
```

**Step 2: Restart deployments to trigger PSA evaluation**

PSA only evaluates pods at creation time. Existing pods are grandfathered:

```bash
kubectl rollout restart deployment --all -n voting-app
```

Wait for rollout to complete:

```bash
kubectl rollout status deployment --all -n voting-app
```

**Step 3: Verify pods restart successfully**

Check that all pods are running:

```bash
kubectl get pods -n voting-app
```

All pods should show STATUS: Running. If any pods fail to start, check for PSA violations:

```bash
kubectl get events -n voting-app --field-selector reason=FailedCreate
```

:::info[Voting App and Baseline PSA]
The Example Voting App images are designed to work with baseline PSA. They don't require privileged mode, host namespaces, or host path mounts. If you were using custom images that run as root or require privileged access, you would see violations here and would need to update your security contexts.
:::

**Step 4: Test PSA enforcement with a privileged pod**

Try to create a privileged pod:

```bash
kubectl run privileged-test --image=nginx --privileged -n voting-app
```

Expected error:

```
Error from server (Forbidden): pods "privileged-test" is forbidden:
violates PodSecurity "baseline:latest": privileged
(container "privileged-test" must not set securityContext.privileged=true)
```

This confirms PSA is enforcing baseline security.

**Step 5: Test with hostNetwork**

Try to create a pod with hostNetwork:

```bash
kubectl run host-network-test --image=nginx --overrides='{"spec":{"hostNetwork":true}}' -n voting-app
```

Expected error:

```
Error from server (Forbidden): pods "host-network-test" is forbidden:
violates PodSecurity "baseline:latest": host namespaces
(hostNetwork=true)
```

Baseline PSA blocks host network access.

**Step 6: Check audit logs for restricted violations**

The namespace is also configured to audit restricted policy violations. Check warnings:

```bash
kubectl get events -n voting-app --field-selector reason=FailedCreate,type=Warning
```

You may see warnings about pods not meeting the restricted profile (e.g., not running as non-root, not dropping capabilities). This is expected. Baseline is sufficient for the Voting App. The restricted audit mode gives you visibility into what would break if you enforced stricter policies.

### Task 3: Service Accounts and RBAC

Create least-privilege ServiceAccounts and RBAC roles for application services.

**Step 1: Create ServiceAccounts**

```yaml title="serviceaccounts.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: vote-sa
  namespace: voting-app
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: result-sa
  namespace: voting-app
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: worker-sa
  namespace: voting-app
```

Apply the ServiceAccounts:

```bash
kubectl apply -f serviceaccounts.yaml
```

**Step 2: Create minimal Role for vote service**

The vote service needs to read a ConfigMap (assuming we'll add vote configuration later):

```yaml title="vote-role.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: vote-role
  namespace: voting-app
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "watch"]
```

Apply the Role:

```bash
kubectl apply -f vote-role.yaml
```

**Step 3: Create RoleBinding for vote service**

```yaml title="vote-rolebinding.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: vote-binding
  namespace: voting-app
subjects:
- kind: ServiceAccount
  name: vote-sa
  namespace: voting-app
roleRef:
  kind: Role
  name: vote-role
  apiGroup: rbac.authorization.k8s.io
```

Apply the RoleBinding:

```bash
kubectl apply -f vote-rolebinding.yaml
```

**Step 4: Update vote Deployment to use vote-sa**

Edit the vote Deployment:

```bash
kubectl edit deployment vote -n voting-app
```

Add `serviceAccountName: vote-sa` under `spec.template.spec`:

```yaml
spec:
  template:
    spec:
      serviceAccountName: vote-sa
      containers:
      - name: vote
        image: schoolofdevops/vote:v1
```

Save and exit. The Deployment will perform a rolling update.

**Step 5: Verify vote service permissions**

Check what vote-sa can do:

```bash
kubectl auth can-i --list --as=system:serviceaccount:voting-app:vote-sa -n voting-app
```

You should see permissions for get/list/watch on configmaps.

Test specific permissions:

```bash
# Should return "yes"
kubectl auth can-i get configmaps --as=system:serviceaccount:voting-app:vote-sa -n voting-app

# Should return "no"
kubectl auth can-i delete pods --as=system:serviceaccount:voting-app:vote-sa -n voting-app

# Should return "no"
kubectl auth can-i get secrets --as=system:serviceaccount:voting-app:vote-sa -n voting-app
```

This confirms vote-sa has minimal permissions.

**Step 6: Create minimal roles for result and worker**

For result service (read configmaps):

```yaml title="result-rbac.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: result-role
  namespace: voting-app
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: result-binding
  namespace: voting-app
subjects:
- kind: ServiceAccount
  name: result-sa
  namespace: voting-app
roleRef:
  kind: Role
  name: result-role
  apiGroup: rbac.authorization.k8s.io
```

For worker service (no Kubernetes API access needed):

```yaml title="worker-rbac.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: worker-role
  namespace: voting-app
rules: []  # No permissions - worker doesn't need Kubernetes API access
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: worker-binding
  namespace: voting-app
subjects:
- kind: ServiceAccount
  name: worker-sa
  namespace: voting-app
roleRef:
  kind: Role
  name: worker-role
  apiGroup: rbac.authorization.k8s.io
```

Apply the RBAC configurations:

```bash
kubectl apply -f result-rbac.yaml
kubectl apply -f worker-rbac.yaml
```

**Step 7: Update result and worker Deployments**

Update result Deployment:

```bash
kubectl patch deployment result -n voting-app -p '{"spec":{"template":{"spec":{"serviceAccountName":"result-sa"}}}}'
```

Update worker Deployment:

```bash
kubectl patch deployment worker -n voting-app -p '{"spec":{"template":{"spec":{"serviceAccountName":"worker-sa"}}}}'
```

Verify all Deployments are using dedicated ServiceAccounts:

```bash
kubectl get deployment -n voting-app -o custom-columns=NAME:.metadata.name,SERVICE_ACCOUNT:.spec.template.spec.serviceAccountName
```

Expected output:

```
NAME      SERVICE_ACCOUNT
vote      vote-sa
redis     <none>
worker    worker-sa
db        <none>
result    result-sa
```

### Task 4: Secrets Management

Move database credentials from environment variables to Kubernetes Secrets with volume mounts.

**Step 1: Create Secret for postgres credentials**

```bash
kubectl create secret generic postgres-credentials \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_PASSWORD=postgres \
  -n voting-app
```

Verify the Secret was created:

```bash
kubectl get secret postgres-credentials -n voting-app
```

**Step 2: Update postgres Deployment to use Secret volume**

Edit the db Deployment:

```bash
kubectl edit deployment db -n voting-app
```

Replace the environment variable configuration with a volume mount:

```yaml
spec:
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD_FILE
          value: /etc/secrets/postgres/POSTGRES_PASSWORD
        volumeMounts:
        - name: postgres-credentials
          mountPath: /etc/secrets/postgres
          readOnly: true
      volumes:
      - name: postgres-credentials
        secret:
          secretName: postgres-credentials
          defaultMode: 0400  # Read-only for owner
```

Save and exit. The db pod will restart with the new configuration.

**Step 3: Verify Secret is mounted correctly**

Wait for the db pod to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=db -n voting-app --timeout=60s
```

Check that the Secret files are mounted:

```bash
DB_POD=$(kubectl get pod -n voting-app -l app=db -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n voting-app $DB_POD -- ls -la /etc/secrets/postgres/
```

Expected output:

```
total 0
drwxr-xr-x    3 root     root           100 Feb  9 06:00 .
drwxr-xr-x    3 root     root            60 Feb  9 06:00 ..
-r--------    1 root     root             8 Feb  9 06:00 POSTGRES_PASSWORD
-r--------    1 root     root             8 Feb  9 06:00 POSTGRES_USER
```

Note the file permissions: `-r--------` (0400) means only the owner can read. Much more secure than environment variables.

**Step 4: Verify credentials are NOT visible in pod description**

```bash
kubectl describe pod -n voting-app -l app=db | grep -A 10 Environment
```

Output should show:

```
    Environment:
      POSTGRES_PASSWORD_FILE:  /etc/secrets/postgres/POSTGRES_PASSWORD
```

The actual password value is NOT visible. Compare this to the old approach where `POSTGRES_PASSWORD: postgres` was plainly visible.

**Step 5: Create Secret for redis (optional)**

Even though redis doesn't require authentication in this setup, demonstrating the pattern:

```bash
kubectl create secret generic redis-credentials \
  --from-literal=REDIS_HOST=redis \
  -n voting-app
```

**Step 6: Demonstrate Secret visibility in kubectl describe**

Compare environment variables to Secret volumes:

```bash
# Create a test pod with env var
kubectl run env-test --image=nginx --env="SECRET_KEY=my-secret-password" -n voting-app

# Describe the pod - secret is visible
kubectl describe pod env-test -n voting-app | grep SECRET_KEY

# Clean up
kubectl delete pod env-test -n voting-app
```

Output shows: `SECRET_KEY: my-secret-password` - the value is visible.

With Secret volumes, the value is hidden. This is a critical security improvement.

### Challenge: Security Audit

Perform a comprehensive security audit of the secured Voting App.

**Step 1: List all NetworkPolicies**

```bash
kubectl get networkpolicy -n voting-app
```

You should see policies for default-deny, DNS allowlist, and specific service communication paths.

**Step 2: Check PSA enforcement**

```bash
kubectl get namespace voting-app --show-labels
```

Verify labels include `pod-security.kubernetes.io/enforce=baseline`.

**Step 3: Audit RBAC permissions**

Check permissions for each ServiceAccount:

```bash
echo "=== vote-sa permissions ==="
kubectl auth can-i --list --as=system:serviceaccount:voting-app:vote-sa -n voting-app

echo "=== result-sa permissions ==="
kubectl auth can-i --list --as=system:serviceaccount:voting-app:result-sa -n voting-app

echo "=== worker-sa permissions ==="
kubectl auth can-i --list --as=system:serviceaccount:voting-app:worker-sa -n voting-app
```

**Step 4: Attempt to break out**

Try to reach unauthorized services from a vote pod:

```bash
VOTE_POD=$(kubectl get pod -n voting-app -l app=vote -o jsonpath='{.items[0].metadata.name}')

# Try to reach postgres directly (should fail - NetworkPolicy blocks)
kubectl exec -n voting-app $VOTE_POD -- nc -zv db 5432 -w 3

# Try to exec with privileged (should fail - PSA blocks)
kubectl exec -n voting-app $VOTE_POD -- whoami
```

**Step 5: Document findings**

Create a security audit report documenting:

- What NetworkPolicies are protecting (network segmentation)
- What PSA is enforcing (baseline security, no privileged containers)
- What RBAC is limiting (least-privilege API access)
- What Secrets are protecting (credential exposure)
- What gaps remain (if any)

Remaining gaps might include:

- No encryption at rest for Secrets (base64 encoding only)
- No network encryption between pods (consider service mesh for mTLS)
- No resource limits preventing resource exhaustion attacks
- No audit logging of API access

## Verification

Confirm your security controls are working:

**1. NetworkPolicy blocks unauthorized traffic**

```bash
VOTE_POD=$(kubectl get pod -n voting-app -l app=vote -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n voting-app $VOTE_POD -- nc -zv db 5432 -w 3
```

Expected: Connection timeout or failure (vote cannot reach postgres).

**2. PSA rejects privileged pod creation**

```bash
kubectl run privileged-test --image=nginx --privileged -n voting-app
```

Expected: Error message about violating baseline policy.

**3. ServiceAccounts have minimal permissions**

```bash
kubectl auth can-i delete pods --as=system:serviceaccount:voting-app:vote-sa -n voting-app
```

Expected: `no`

**4. Secrets mounted as volumes**

```bash
DB_POD=$(kubectl get pod -n voting-app -l app=db -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n voting-app $DB_POD -- ls /etc/secrets/postgres/
```

Expected: POSTGRES_PASSWORD and POSTGRES_USER files exist.

**5. Voting App is fully functional**

```bash
kubectl port-forward -n voting-app svc/vote 8080:80
```

Open `http://localhost:8080`, cast a vote, then check results at `http://localhost:8081` (separate port-forward to result service).

Expected: Complete vote-to-result flow works despite all security controls.

## Cleanup

:::caution[Keep Security Controls]
This lab demonstrates defense-in-depth security. You may want to keep this cluster for reference or future modules. If you need to clean up, follow these steps.
:::

Remove the Voting App but keep the cluster:

```bash
kubectl delete namespace voting-app
```

Or delete the entire cluster:

```bash
kind delete cluster --name voting-app
```

:::info[Recreating Cluster]
If you need to recreate this cluster later, use the same KIND config with `disableDefaultCNI: true` and install Calico. Without Calico, NetworkPolicies will not be enforced.
:::

## Troubleshooting

### Issue: Calico pods not starting

**Symptom:** `kubectl get pods -n kube-system` shows calico-node pods in CrashLoopBackOff or Pending state.

**Cause:** Pod subnet mismatch between KIND config and Calico default.

**Solution:**

Verify KIND cluster pod subnet:

```bash
kubectl cluster-info dump | grep -m 1 cluster-cidr
```

If it doesn't show `192.168.0.0/16`, recreate the cluster with the correct podSubnet in the KIND config.

### Issue: All pods lose connectivity after default-deny

**Symptom:** After applying default-deny NetworkPolicy, no pods can communicate, even after adding specific allow rules.

**Cause:** Forgot to apply DNS allowlist policy.

**Solution:**

Apply the allow-dns policy:

```bash
kubectl apply -f 02-allow-dns.yaml
```

Verify DNS works:

```bash
VOTE_POD=$(kubectl get pod -n voting-app -l app=vote -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n voting-app $VOTE_POD -- nslookup redis
```

Expected: DNS resolution succeeds.

### Issue: PSA blocks existing pods on restart

**Symptom:** After applying PSA labels and restarting Deployments, pods fail to start with "violates PodSecurity" errors.

**Cause:** Pod configurations don't meet baseline security requirements (running as privileged, using host namespaces, etc.).

**Solution:**

Review pod security contexts:

```bash
kubectl get pods -n voting-app -o yaml | grep -A 5 securityContext
```

Fix violations by updating Deployments to remove privileged settings, host network access, or host path mounts. For the Voting App images, this shouldn't be necessary as they're designed to work with baseline PSA.

### Issue: RBAC denies expected operations

**Symptom:** Application pods cannot perform operations they need (e.g., reading ConfigMaps).

**Cause:** Role doesn't include required verbs, resources, or resource names.

**Solution:**

Check what the ServiceAccount can do:

```bash
kubectl auth can-i --list --as=system:serviceaccount:voting-app:vote-sa -n voting-app
```

Update the Role to add missing permissions:

```bash
kubectl edit role vote-role -n voting-app
```

Add the required verbs (get, list, watch, create, update, delete) and resources.

### Issue: Secret volume mount fails

**Symptom:** Pod fails to start with "MountVolume.SetUp failed" error mentioning Secret.

**Cause:** Secret doesn't exist or Secret name mismatch in volume configuration.

**Solution:**

Verify Secret exists:

```bash
kubectl get secret postgres-credentials -n voting-app
```

If missing, create it:

```bash
kubectl create secret generic postgres-credentials \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_PASSWORD=postgres \
  -n voting-app
```

Verify the volume configuration in the Deployment references the correct Secret name.

## Key Takeaways

- NetworkPolicy enforcement requires a CNI plugin that supports it (Calico, Cilium) - KIND's default Flannel does not enforce policies
- Default-deny NetworkPolicy must include a DNS allowlist or service discovery breaks completely
- Pod Security Admission evaluates pods at creation time only - existing pods must be restarted to apply new policies
- PSA offers three profiles (privileged, baseline, restricted) and three modes (enforce, audit, warn) for flexible security enforcement
- RBAC with ServiceAccounts implements least-privilege access - start with no permissions and add only what's needed
- Secrets mounted as volumes are more secure than environment variables (not visible in pod descriptions, support file permissions)
- Defense-in-depth layering (NetworkPolicy + PSA + RBAC + Secrets) provides resilience when individual security controls fail
- Base64 encoding in Secrets is NOT encryption - consider Sealed Secrets or External Secrets Operator for production
