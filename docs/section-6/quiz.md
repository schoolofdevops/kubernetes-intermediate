# Quiz: Module 6 - Writing Helm Charts

**Module:** 6
**Topic:** Writing Helm Charts
**Question Count:** 13

---

## Question 1: Chart Versioning

**Question Type:** Multiple Choice

**Question:**
What is the difference between the `version` and `appVersion` fields in Chart.yaml?

**Options:**

A) `version` is the Kubernetes API version, `appVersion` is the Helm version
B) `version` tracks the chart structure/templates, `appVersion` tracks the application being deployed
C) `version` is for Helm 2, `appVersion` is for Helm 3
D) They are aliases and can be used interchangeably

**Correct Answer:** B

**Explanation:**
The `version` field tracks changes to the chart itself (templates, values structure, dependencies). Increment it when you modify the chart. The `appVersion` field tracks the version of the application being deployed (like the image tag). You might have chart version 2.5.0 deploying app version v1, or chart version 2.5.1 deploying app version v2. They change independently based on what's being updated.

---

## Question 2: Template Function Purpose

**Question Type:** Multiple Choice

**Question:**
In a Helm template, what does the expression `{{ .Values.replicaCount | default 1 }}` do?

**Options:**

A) Sets replicaCount to 1 and ignores any value in values.yaml
B) Uses the replicaCount value from values.yaml, or 1 if replicaCount is not defined
C) Throws an error if replicaCount is not defined in values.yaml
D) Creates a default values.yaml file with replicaCount set to 1

**Correct Answer:** B

**Explanation:**
The `default` function provides a fallback value. If `.Values.replicaCount` exists in values.yaml (or is overridden via `-f` or `--set`), that value is used. If it's not defined anywhere, the function returns the default value (1 in this case). This pattern makes chart values optional while providing sensible defaults.

---

## Question 3: Helper Template Purpose

**Question Type:** True/False

**Question:**
The _helpers.tpl file is mandatory and must exist in every Helm chart for the chart to be valid.

**Correct Answer:** False

**Explanation:**
The _helpers.tpl file is a convention, not a requirement. It provides a convenient place to define reusable template snippets (like label generators, name formatters, etc.) that can be included across multiple templates. Charts can work without it, but using helpers makes templates more maintainable by avoiding repetition. Files starting with underscore don't render to Kubernetes resources themselves.

---

## Question 4: Helm Template vs Install

**Question Type:** Multiple Choice

**Question:**
What is the primary difference between `helm template` and `helm install`?

**Options:**

A) `helm template` validates syntax, `helm install` skips validation
B) `helm template` renders YAML locally without deploying, `helm install` deploys to the cluster
C) `helm template` is for Helm 2, `helm install` is for Helm 3
D) They are identical, `helm template` is just an alias for `helm install --dry-run`

**Correct Answer:** B

**Explanation:**
`helm template` processes templates locally and outputs the rendered Kubernetes YAML to stdout. It never communicates with the Kubernetes API server or creates resources. This is useful for debugging templates, previewing changes, or generating manifests for other tools. `helm install` actually creates resources in the cluster and tracks the release state. Note: `helm install --dry-run` is different from `helm template` - it validates against the API server but doesn't create resources.

---

## Question 5: Dependency Management

**Question Type:** Scenario

**Context:**
You're building a Helm chart for the Voting App and want to use Bitnami's redis chart instead of maintaining your own redis manifests. You've added this to Chart.yaml:

```yaml
dependencies:
- name: redis
  version: "18.x"
  repository: https://charts.bitnami.com/bitnami
```

**Question:**
What is the problem with this dependency configuration?

**Options:**

A) The repository URL should use OCI format (oci://registry/chart)
B) Using a version range (18.x) creates unpredictable deployments as new versions are released
C) The redis chart requires a condition field to be installable
D) Bitnami charts must be vendored in the charts/ directory, not referenced by repository

**Correct Answer:** B

**Explanation:**
Version ranges (like "18.x", "~18.19", or "^18.0") seem convenient but are dangerous in production. Bitnami might release redis chart 18.20.0 with breaking changes tomorrow, and your chart would automatically pick it up on the next `helm dependency update`. Always lock to exact versions (e.g., "18.19.4") for reproducible builds. Test new versions explicitly before updating the dependency. Option A is incorrect because HTTP repositories are still valid in Helm 3 (OCI is optional). Option C is wrong because condition fields are optional. Option D is incorrect because referencing repositories is the standard approach.

---

## Question 6: Over-Templatization Anti-Pattern

**Question Type:** True/False

**Question:**
According to Helm best practices, every field in a Kubernetes manifest should be templatized as a value to provide maximum flexibility.

**Correct Answer:** False

**Explanation:**
This is the over-templatization anti-pattern. Making every field configurable creates an unmaintainable chart with hundreds of values. Users become overwhelmed and don't know what's safe to change. Instead, template only what varies between environments: replicas, image tags, resource limits, ingress hosts, and storage sizes. Hardcode things that should be consistent: port names, protocols, health check paths, and container names. The goal is maintainability, not maximum configurability.

---

## Question 7: Values File Precedence

**Question Type:** Multiple Choice

**Question:**
When installing a Helm chart with `helm install myapp ./chart -f custom-values.yaml --set image.tag=v2`, what is the order of precedence for values (highest to lowest)?

**Options:**

A) values.yaml → custom-values.yaml → --set flags
B) --set flags → custom-values.yaml → values.yaml
C) custom-values.yaml → --set flags → values.yaml
D) All values are merged equally with no precedence

**Correct Answer:** B

**Explanation:**
Helm values have a clear precedence order: `--set` flags override `-f` custom values files, which override the chart's default values.yaml. This allows you to ship good defaults in values.yaml, provide environment-specific overrides in files (like values-production.yaml), and make one-off changes with --set. Later values override earlier ones, with command-line flags having the final say.

---

## Question 8: Lifecycle Hook Types

**Question Type:** Multiple Choice

**Question:**
You need to run a database migration before upgrading your application to ensure the new code doesn't fail due to schema mismatches. Which Helm hook type should you use?

**Options:**

A) post-install
B) pre-install
C) pre-upgrade
D) post-upgrade

**Correct Answer:** C

**Explanation:**
The `pre-upgrade` hook runs after the user executes `helm upgrade` but before Helm updates any existing resources. This is the perfect time for database migrations: the old application is still running (on the old schema), you run the migration (updating the schema), then Helm deploys the new application code (which expects the new schema). Using `post-upgrade` would be too late - the new code would already be deployed and potentially failing. `pre-install` only runs on first installation, not upgrades. `post-install` is for initialization after installation, not upgrades.

---

## Question 9: Helm Lint Purpose

**Question Type:** Multiple Choice

**Question:**
What is the primary purpose of the `helm lint` command?

**Options:**

A) To deploy the chart to a test cluster and verify it works
B) To perform static analysis of chart syntax and check best practices
C) To update chart dependencies to their latest versions
D) To format template files with proper YAML indentation

**Correct Answer:** B

**Explanation:**
`helm lint` performs static analysis without deploying anything. It checks Chart.yaml structure, validates template syntax, verifies values.yaml is valid YAML, and flags common mistakes (like missing Chart.yaml fields). It's fast and safe to run before every commit. It does NOT deploy to a cluster (that's `helm install`), update dependencies (that's `helm dependency update`), or reformat files (there's no auto-formatter for Helm).

---

## Question 10: Template Whitespace Control

**Question Type:** Scenario

**Context:**
You wrote this template snippet:

```yaml
labels:
  {{ include "myapp.labels" . }}
```

After rendering, you get a YAML syntax error because the labels are not properly indented. How should you fix this?

**Options:**

A) Change to: `labels: {{ include "myapp.labels" . }}`
B) Change to: `labels:\n{{- include "myapp.labels" . }}`
C) Change to: `labels:\n{{- include "myapp.labels" . | nindent 2 }}`
D) Change to: `labels: {{- include "myapp.labels" . | indent 2 }}`

**Correct Answer:** C

**Explanation:**
The `nindent` function adds a newline and then indents the content by the specified number of spaces. For labels that start at column 0, you need to indent the included content by 2 spaces. Using `{{-` removes the whitespace before the template tag to avoid extra blank lines. The correct pattern is `{{- include "helper" . | nindent N }}` where N is the desired indentation level. Option A doesn't indent at all. Option B is missing the indentation. Option D uses `indent` which doesn't add a newline, causing the labels to appear on the same line as "labels:".

---

## Question 11: Dependency Conditions

**Question Type:** Multiple Choice

**Question:**
In your Chart.yaml, you have `condition: redis.enabled` for the redis dependency. What does this accomplish?

**Options:**

A) It validates that redis is running in the cluster before installing
B) It allows users to disable the redis dependency by setting redis.enabled: false in values.yaml
C) It creates a conditional check that fails if redis.enabled is not defined
D) It automatically enables redis authentication

**Correct Answer:** B

**Explanation:**
The `condition` field in a dependency declaration creates a toggle. If you set `redis.enabled: false` in values.yaml (or via --set), Helm skips installing that dependency entirely. This is useful for testing (disable backing services temporarily), different deployment modes (maybe you have an external redis cluster in production), or optional features. The chart installs normally without the dependency. It doesn't check if redis is running, fail on missing values, or configure redis settings.

---

## Question 12: NOTES.txt Template

**Question Type:** Multiple Choice

**Question:**
What is the purpose of the NOTES.txt file in a Helm chart's templates directory?

**Options:**

A) It contains internal notes for chart developers and is never shown to users
B) It's a template that renders post-installation instructions displayed to users after helm install
C) It's required for helm lint to pass and must contain chart documentation
D) It defines notification webhooks that Helm calls after successful deployments

**Correct Answer:** B

**Explanation:**
NOTES.txt is a template file that renders after successful installation or upgrade, and the output is displayed to the user. Use it to provide helpful next steps: how to access the application, check deployment status, find credentials, or perform initial configuration. It can use template syntax to include dynamic information like service names, ports, or generated passwords. It's not mandatory (charts work without it), not hidden from users, and not related to webhooks.

---

## Question 13: Helm 3 vs Helm 2

**Question Type:** Multiple Choice

**Question:**
What is a key security improvement in Helm 3 compared to Helm 2?

**Options:**

A) Helm 3 encrypts chart packages with TLS by default
B) Helm 3 removed Tiller, the server-side component that required cluster-admin permissions
C) Helm 3 requires two-factor authentication for all helm commands
D) Helm 3 automatically scans charts for security vulnerabilities before installation

**Correct Answer:** B

**Explanation:**
Helm 2 used Tiller, a server-side component running in the cluster with cluster-admin permissions. This was a major security concern: anyone who could talk to Tiller had full cluster control. Helm 3 removed Tiller entirely. It's now a client-only tool that uses your existing kubeconfig credentials, following the principle of least privilege. Your helm commands have exactly the same permissions as your kubectl commands - no more, no less. Options A, C, and D describe features that don't exist in Helm 3.

---
