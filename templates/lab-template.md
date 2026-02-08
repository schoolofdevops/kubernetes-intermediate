# Lab: [Module Name] - [Lab Title]

## Objectives

By the end of this lab, you will be able to:

- [Replace with specific learning outcome 1]
- [Replace with specific learning outcome 2]
- [Replace with specific learning outcome 3]
- [Replace with specific learning outcome 4]
- [Replace with specific learning outcome 5]

## Prerequisites

Before starting this lab, ensure you have:

- Completed Module [N-1]: [Previous Module Name]
- A running KIND cluster with the Example Voting App deployed from the previous module
- kubectl CLI configured to communicate with your cluster
- [Additional tool or prerequisite if needed]
- Basic understanding of [relevant Kubernetes concept]

## Setup

Follow these steps to prepare your environment for this lab:

**Step 1: Verify cluster status**

```bash
kubectl cluster-info
kubectl get nodes
```

Expected output:

```bash
Kubernetes control plane is running at https://127.0.0.1:xxxxx
CoreDNS is running at https://127.0.0.1:xxxxx/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

NAME                 STATUS   ROLES           AGE   VERSION
kind-control-plane   Ready    control-plane   10d   v1.27.3
```

**Step 2: Verify Example Voting App is running**

```bash
kubectl get pods -n voting-app
kubectl get svc -n voting-app
```

**Step 3: [Additional setup step - e.g., create namespace, install dependencies]**

```bash
# [Replace with module-specific setup commands]
kubectl create namespace [namespace-name]
kubectl config set-context --current --namespace=[namespace-name]
```

## Tasks

### Task 1: [First Major Task Title]

[Brief description of what this task accomplishes and why it matters for the Example Voting App]

**Step 1: [Action description]**

Create a file named `[filename].yaml`:

```yaml title="[filename].yaml"
apiVersion: [api-version]
kind: [resource-kind]
metadata:
  name: [resource-name]
  namespace: voting-app
spec:
  # [Replace with module-specific configuration]
  # highlight-next-line
  [key-configuration]: [value]
```

**Step 2: Apply the configuration**

```bash
kubectl apply -f [filename].yaml
```

Expected output:

```bash
[resource-kind]/[resource-name] created
```

**Step 3: Verify the resource was created**

```bash
kubectl get [resource-kind] -n voting-app
kubectl describe [resource-kind] [resource-name] -n voting-app
```

**Step 4: [Continue with additional steps as needed]**

```bash
# [Additional commands]
kubectl [command] [args]
```

### Task 2: [Second Major Task Title]

[Brief description of what this task accomplishes]

**Step 1: [Action description]**

```bash
# [Replace with task-specific commands]
kubectl [command] [args]
```

**Step 2: [Action description]**

```yaml title="[another-file].yaml"
# [Replace with YAML configuration]
apiVersion: [api-version]
kind: [resource-kind]
metadata:
  name: [resource-name]
spec:
  [configuration]: [value]
```

Apply and verify:

```bash
kubectl apply -f [another-file].yaml
kubectl get [resource-kind] -n voting-app
```

### Task 3: [Third Major Task Title]

[Brief description - typically integrating everything together or testing the complete setup]

**Step 1: [Final integration step]**

```bash
# [Commands to test or integrate components]
kubectl [command] [args]
```

**Step 2: [Verification step]**

```bash
# [Commands to verify end-to-end functionality]
kubectl [command] [args]
```

## Verification

Confirm your lab setup is working correctly:

**1. Check all resources are running**

```bash
kubectl get all -n voting-app
```

Expected: All pods should show `STATUS: Running`, all deployments should show `READY: X/X`.

**2. Verify [specific functionality from this module]**

```bash
kubectl [verification-command]
```

Expected output:

```bash
[Expected output demonstrating successful configuration]
```

**3. Test the Example Voting App functionality**

```bash
# [Commands to test the app behavior with this module's changes]
kubectl port-forward -n voting-app svc/vote 8080:80
```

Open your browser to `http://localhost:8080` and verify [expected behavior].

**4. [Additional verification specific to this module]**

```bash
kubectl [module-specific-check]
```

## Cleanup

Remove resources created in this lab:

```bash
# Delete resources created in this lab
kubectl delete -f [filename].yaml
kubectl delete -f [another-file].yaml

# Or delete by resource name
kubectl delete [resource-kind] [resource-name] -n voting-app

# Optional: Remove the entire namespace if created
kubectl delete namespace [namespace-name]
```

Verify cleanup:

```bash
kubectl get [resource-kind] -n voting-app
```

Expected: Resources should no longer be listed.

## Troubleshooting

### Issue: [Common Problem 1]

**Symptom:** [What the user observes - error messages, unexpected behavior]

**Cause:** [Why this happens]

**Solution:**

```bash
# [Commands to diagnose]
kubectl [diagnostic-command]

# [Commands to fix]
kubectl [fix-command]
```

### Issue: [Common Problem 2]

**Symptom:** [What the user observes]

**Cause:** [Why this happens]

**Solution:**

```bash
# [Diagnostic and fix commands]
kubectl [command]
```

### Issue: [Common Problem 3]

**Symptom:** [What the user observes]

**Cause:** [Why this happens]

**Solution:**

```bash
# [Diagnostic and fix commands]
kubectl [command]
```

## Key Takeaways

- [Key learning point 1 - concept or skill mastered]
- [Key learning point 2 - how this relates to production Kubernetes]
- [Key learning point 3 - best practice or pattern learned]
- [Key learning point 4 - how this builds on previous modules]
- [Key learning point 5 - preparation for next module]
