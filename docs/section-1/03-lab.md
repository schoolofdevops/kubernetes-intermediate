# Lab: Scheduling the Voting App for Production

## Objectives

By the end of this lab, you will be able to:

- Label cluster nodes for scheduling experiments and verify label application
- Apply node affinity to place postgres on SSD-labeled nodes for optimal I/O performance
- Use pod anti-affinity to spread vote replicas across different nodes for high availability
- Configure taints and tolerations for dedicated workload placement
- Verify scheduling decisions using kubectl and understand how to debug scheduling failures

## Prerequisites

Before starting this lab, ensure you have:

- Completed **Module 0: Introduction and Getting Started**
- A running **KIND cluster with 2 worker nodes** (standard 3-node cluster from Module 0)
- The **Example Voting App** deployed and functional from Module 0
- kubectl CLI configured to communicate with your cluster
- Basic understanding of Kubernetes Deployments and Services

:::note Cluster Configuration
This lab uses the standard 3-node KIND cluster (1 control-plane + 2 workers) from Module 0. We'll demonstrate scheduling concepts across these 2 worker nodes.
:::

## Setup

This lab builds on the Voting App deployment from Module 0. You do NOT need to create a new cluster or redeploy the application. We'll enhance the existing deployment with scheduling rules.

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

You should see 1 control-plane node and 2 worker nodes, all in Ready status.

**Step 2: Verify Voting App is running**

```bash
kubectl get pods -o wide
```

Expected: All Voting App pods (vote, result, worker, redis, postgres) should be Running. Note which nodes they're currently on - they're likely distributed randomly.

**Step 3: Verify Voting App functionality**

```bash
kubectl port-forward svc/vote 8080:80 &
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
pkill -f "port-forward svc/vote"
```

Expected output: `200` (Voting App is accessible)

## Tasks

### Task 1: Label Nodes for Scheduling

We'll simulate a production cluster where nodes have different hardware characteristics. In this case, we'll label one node as having SSD storage and the others as having HDD storage.

**Step 1: Label voting-app-worker as an SSD node**

```bash
kubectl label nodes voting-app-worker disktype=ssd
```

Expected output:

```bash
node/voting-app-worker labeled
```

**Step 2: Label voting-app-worker2 as an HDD node**

```bash
kubectl label nodes voting-app-worker2 disktype=hdd
```

**Step 3: Verify labels were applied**

```bash
kubectl get nodes -L disktype
```

Expected output:

```bash
NAME                       STATUS   ROLES           AGE   VERSION   DISKTYPE
voting-app-control-plane   Ready    control-plane   1d    v1.32.0
voting-app-worker          Ready    <none>          1d    v1.32.0   ssd
voting-app-worker2         Ready    <none>          1d    v1.32.0   hdd
```

The `-L disktype` flag shows the disktype label value for each node. We're simulating SSD vs HDD nodes. In production, these labels would represent real hardware differences.

### Task 2: Node Affinity for Postgres

Databases perform better on fast storage. Let's ensure postgres always runs on the SSD node using node affinity.

**Step 1: Create postgres deployment with node affinity**

Create a file named `postgres-affinity.yaml`:

```yaml title="postgres-affinity.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  labels:
    app: voting-app
    tier: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
        tier: backend
    spec:
      affinity:
        nodeAffinity:
          # REQUIRED: Must schedule on nodes with SSD
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: disktype
                operator: In
                values:
                - ssd
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          value: "postgres"
        ports:
        - containerPort: 5432
          name: postgres
```

**Step 2: Apply the updated deployment**

```bash
kubectl apply -f postgres-affinity.yaml
```

Expected output:

```bash
deployment.apps/postgres configured
```

**Step 3: Force postgres to reschedule**

Since scheduling happens once at pod creation, we need to delete the existing postgres pod to trigger rescheduling:

```bash
kubectl delete pod -l app=postgres
```

Wait a few seconds for the new pod to start:

```bash
kubectl wait --for=condition=ready pod -l app=postgres --timeout=60s
```

**Step 4: Verify postgres is on the SSD node**

```bash
kubectl get pod -l app=postgres -o wide
```

Expected output shows the pod on voting-app-worker (our SSD node):

```bash
NAME                        READY   STATUS    RESTARTS   AGE   NODE
postgres-xxxxx-xxxxx        1/1     Running   0          30s   voting-app-worker
```

You can also use jsonpath to extract just the node name:

```bash
kubectl get pod -l app=postgres -o jsonpath='{.items[0].spec.nodeName}'
```

Expected: `voting-app-worker`

This demonstrates **required** node affinity. The postgres pod MUST schedule on a node with `disktype=ssd`. If no such node existed, the pod would stay Pending forever.

### Task 3: Pod Anti-Affinity for Vote High Availability

Right now, if all vote replicas land on the same node and that node fails, your entire voting frontend goes down. Let's spread vote replicas across different nodes using pod anti-affinity.

**Step 1: Scale vote to 2 replicas**

First, let's scale vote to 2 replicas to demonstrate anti-affinity across our 2 worker nodes:

```bash
kubectl scale deployment vote --replicas=2
```

**Step 2: Check current vote pod distribution**

```bash
kubectl get pods -l app=vote -o wide
```

You'll likely see vote pods distributed randomly, possibly both on the same node.

**Step 3: Create vote deployment with pod anti-affinity**

Create a file named `vote-antiaffinity.yaml`:

```yaml title="vote-antiaffinity.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vote
  labels:
    app: voting-app
    tier: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vote
  template:
    metadata:
      labels:
        app: vote
        tier: frontend
    spec:
      affinity:
        podAntiAffinity:
          # PREFERRED: Try to spread replicas across different nodes
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - vote
              # Spread across different nodes (topology key = hostname)
              topologyKey: kubernetes.io/hostname
      containers:
      - name: vote
        image: dockersamples/examplevotingapp_vote
        ports:
        - containerPort: 80
          name: http
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

**Step 4: Apply the updated deployment**

```bash
kubectl apply -f vote-antiaffinity.yaml
```

**Step 5: Force vote pods to reschedule**

```bash
kubectl delete pods -l app=vote
```

Wait for new pods to start:

```bash
kubectl wait --for=condition=ready pod -l app=vote --timeout=60s
```

**Step 6: Verify vote pods are spread across nodes**

```bash
kubectl get pods -l app=vote -o wide
```

Expected output shows each vote pod on a different node:

```bash
NAME                    READY   STATUS    RESTARTS   AGE   NODE
vote-xxxxx-aaaaa        1/1     Running   0          20s   voting-app-worker
vote-xxxxx-bbbbb        1/1     Running   0          20s   voting-app-worker2
```

Now if one node goes down, 1/2 of your vote capacity survives. This is high availability through pod anti-affinity.

Note we used **preferred** anti-affinity, not required. This works perfectly with our 2-node cluster - each replica gets its own node. With required anti-affinity and more replicas than nodes, extra replicas would stay Pending.

### Task 4: Taints and Tolerations

Taints repel pods from nodes. Let's taint kind-worker to see how it affects scheduling, then add a toleration to postgres so it can still run there.

**Step 1: Taint voting-app-worker**

```bash
kubectl taint nodes voting-app-worker dedicated=database:NoSchedule
```

Expected output:

```bash
node/voting-app-worker tainted
```

This taint means "no new pods can schedule on voting-app-worker unless they tolerate the taint."

**Step 2: Try to scale vote replicas to 3**

```bash
kubectl scale deployment vote --replicas=3
```

Wait a moment, then check pod distribution:

```bash
kubectl get pods -l app=vote -o wide
```

Notice the new (3rd) vote pod does NOT schedule on voting-app-worker (the tainted node). It goes to voting-app-worker2 instead. The taint is working - it repels pods that don't have a matching toleration.

**Step 3: Check if postgres is affected**

```bash
kubectl get pod -l app=postgres -o wide
```

Postgres is still running on voting-app-worker because taints with the `NoSchedule` effect don't evict existing pods. They only prevent new pods from scheduling.

**Step 4: Delete postgres to see the taint in action**

```bash
kubectl delete pod -l app=postgres
```

Wait a moment and check:

```bash
kubectl get pod -l app=postgres -o wide
```

What happened? The postgres pod is Pending! Check the events:

```bash
kubectl describe pod -l app=postgres | grep -A 5 Events
```

You'll see events like:

```
Events:
  Warning  FailedScheduling  1s  default-scheduler  0/3 nodes are available: 1 node(s) had untolerated taint {dedicated: database}, 2 node(s) didn't match Pod's node affinity/selector
```

The scheduler can't place postgres because:
- The node affinity requires `disktype=ssd` (only voting-app-worker has this)
- But voting-app-worker is tainted, and postgres doesn't have a toleration

**Step 5: Add toleration to postgres**

Update `postgres-affinity.yaml` to include a toleration:

```yaml title="postgres-affinity.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  labels:
    app: voting-app
    tier: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
        tier: backend
    spec:
      # Add toleration for the database taint
      tolerations:
      - key: dedicated
        operator: Equal
        value: database
        effect: NoSchedule
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: disktype
                operator: In
                values:
                - ssd
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          value: "postgres"
        ports:
        - containerPort: 5432
          name: postgres
```

**Step 6: Apply the updated deployment**

```bash
kubectl apply -f postgres-affinity.yaml
```

The Pending postgres pod should now schedule successfully:

```bash
kubectl get pod -l app=postgres -o wide
```

Expected: Postgres is back on voting-app-worker, combining toleration (permission) and affinity (attraction).

**Step 7: Verify vote pods still avoid the tainted node**

```bash
kubectl get pods -l app=vote -o wide
```

All 4 vote pods should be on kind-worker2 and kind-worker3. None are on kind-worker because they lack the toleration.

**Key Learning:** Taints REPEL pods. Tolerations grant permission but don't attract. You need affinity to attract pods to specific nodes.

**Step 8: Scale vote back to 3 replicas**

```bash
kubectl scale deployment vote --replicas=3
```

### Task 5: Combined Strategy - Dedicated Database Node

Let's put it all together. We want voting-app-worker to be a dedicated database node: fast storage (SSD), isolated from general workloads (tainted), with postgres preferring to run there.

We already have:
- Label: `disktype=ssd` on voting-app-worker
- Taint: `dedicated=database:NoSchedule` on voting-app-worker
- Postgres affinity: requires `disktype=ssd`
- Postgres toleration: tolerates `dedicated=database`

**Step 1: Verify the complete configuration**

```bash
kubectl describe node voting-app-worker | grep -A 5 Labels
kubectl describe node voting-app-worker | grep Taints
```

Expected:
- Labels include `disktype=ssd`
- Taints include `dedicated=database:NoSchedule`

**Step 2: Verify postgres placement**

```bash
kubectl get pod -l app=postgres -o wide
```

Expected: Postgres is on voting-app-worker (the dedicated database node)

**Step 3: Verify other pods avoid voting-app-worker**

```bash
kubectl get pods -o wide | grep -v postgres | grep "voting-app-worker[^2]"
```

Expected: Only vote pods that existed before the taint (no new non-database pods on voting-app-worker)

**Step 4: Check overall pod distribution**

```bash
kubectl get pods -o wide
```

You should see:
- Postgres: voting-app-worker (dedicated database node)
- Vote (3 replicas): 1 on voting-app-worker (pre-taint), 2 on voting-app-worker2
- Result, worker, redis: voting-app-worker2

This is a realistic production pattern: dedicated nodes for stateful workloads, spread replicas for HA, keep workloads isolated.

### Challenge: Scheduling Failure Debugging

Let's intentionally create a scheduling failure and learn how to debug it.

**Step 1: Create a deployment with invalid node affinity**

Create a file named `broken-deployment.yaml`:

```yaml title="broken-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: broken-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: broken-app
  template:
    metadata:
      labels:
        app: broken-app
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: disktype
                operator: In
                values:
                - nvme  # This label doesn't exist!
      containers:
      - name: nginx
        image: nginx:1.25
```

**Step 2: Apply the broken deployment**

```bash
kubectl apply -f broken-deployment.yaml
```

**Step 3: Check pod status**

```bash
kubectl get pods -l app=broken-app
```

Expected output:

```bash
NAME                          READY   STATUS    RESTARTS   AGE
broken-app-xxxxx-xxxxx        0/1     Pending   0          30s
```

The pod is stuck in Pending state.

**Step 4: Debug the scheduling failure**

```bash
kubectl describe pod -l app=broken-app
```

Look at the Events section at the bottom:

```
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  20s   default-scheduler  0/3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector
```

The error message tells you: "didn't match Pod's node affinity." This means no nodes have the required label.

**Step 5: Verify the problem**

```bash
kubectl get nodes -L disktype
```

You'll see nodes have `disktype=ssd` or `disktype=hdd`, but none have `disktype=nvme`.

**Step 6: Fix the issue (Option 1: Add the label)**

```bash
kubectl label nodes kind-worker3 disktype=nvme
kubectl get pods -l app=broken-app -w
```

The pod should schedule to kind-worker3 within seconds.

**Step 7: Clean up**

```bash
kubectl delete deployment broken-app
kubectl label nodes kind-worker3 disktype=hdd --overwrite
```

**Key Learning:** Always verify node labels exist BEFORE writing affinity rules. Use `kubectl get nodes --show-labels` to check. Pod stuck in Pending + "didn't match affinity" = label mismatch.

## Verification

Confirm your scheduling configuration is working correctly:

**1. Check postgres placement on SSD node**

```bash
kubectl get pod -l app=postgres -o jsonpath='{.items[0].spec.nodeName}'
```

Expected output: `kind-worker`

**2. Verify vote replicas are spread across nodes**

```bash
kubectl get pods -l app=vote -o wide | awk '{print $7}' | tail -n +2 | sort | uniq -c
```

Expected: Each node should have at most 2 vote pods (with 3 replicas across 2 untainted nodes)

**3. Confirm no non-database pods on tainted node**

```bash
kubectl get pods -o wide | grep -v postgres | grep kind-worker
```

Expected: No output (no non-database pods on kind-worker)

**4. Test Voting App functionality**

```bash
kubectl port-forward svc/vote 8080:80 &
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
pkill -f "port-forward svc/vote"
```

Expected output: `200` (Voting App still works after all scheduling changes)

## Cleanup

Do NOT clean up the resources from this lab. Module 2 (Autoscaling) builds on the current state.

However, we should remove the taint from voting-app-worker to have a cleaner starting point for Module 2:

```bash
kubectl taint nodes voting-app-worker dedicated=database:NoSchedule-
```

The `-` at the end removes the taint.

Verify the taint is removed:

```bash
kubectl describe node voting-app-worker | grep Taints
```

Expected output: `Taints: <none>`

Keep all labels and affinity rules. They don't hurt and demonstrate the evolution of our Voting App configuration.

## Troubleshooting

### Issue: Pod Stuck in Pending with "didn't match Pod's node affinity"

**Symptom:** Pod shows Pending status indefinitely. `kubectl describe pod` shows event: "didn't match Pod's node affinity/selector"

**Cause:** The node affinity rule references a label that doesn't exist on any nodes in the cluster.

**Solution:**

```bash
# Check what labels exist on nodes
kubectl get nodes --show-labels

# Check which label your pod is looking for
kubectl get pod <pod-name> -o yaml | grep -A 10 affinity

# Either add the label to a node
kubectl label nodes <node-name> <key>=<value>

# Or update the pod's affinity rule to match existing labels
# Edit the deployment and apply the changes
```

### Issue: Pod with Toleration Schedules to Untainted Node

**Symptom:** You added a toleration to a pod and expected it to schedule on the tainted node, but it went to a different node instead.

**Cause:** Toleration grants PERMISSION to schedule on tainted nodes, but doesn't ATTRACT pods there. You need node affinity to attract.

**Solution:**

```bash
# Combine toleration (permission) with node affinity (attraction)
# Update your deployment to include both:
# 1. Toleration for the taint
# 2. Node affinity targeting a label on the tainted node
```

See Task 5 for a complete example of combining taints, tolerations, and affinity.

### Issue: Voting App Breaks After Rescheduling

**Symptom:** After deleting pods to trigger rescheduling, the Voting App stops working. Vote submissions don't appear in results.

**Cause:** Network connectivity issues between components, or postgres data loss if the pod was deleted without persistent storage.

**Solution:**

```bash
# Verify all pods are Running
kubectl get pods

# Check pod logs for errors
kubectl logs -l app=worker
kubectl logs -l app=redis
kubectl logs -l app=postgres

# Test connectivity between components
kubectl exec -it deploy/worker -- ping redis
kubectl exec -it deploy/worker -- ping postgres

# Restart all pods if needed
kubectl rollout restart deployment vote result worker redis postgres
```

### Issue: Taint Doesn't Seem to Work

**Symptom:** You tainted a node but pods still schedule there.

**Cause:** Existing pods are not affected by taints with `NoSchedule` effect. Only new pods respect the taint.

**Solution:**

```bash
# Verify the taint is applied
kubectl describe node <node-name> | grep Taints

# Delete existing pods to force rescheduling
kubectl delete pods <pod-name>

# For immediate eviction, use NoExecute effect instead
kubectl taint nodes <node-name> key=value:NoExecute
# Warning: This evicts running pods immediately
```

## Key Takeaways

- **Node labels are prerequisites for affinity rules** - always verify labels exist before writing affinity rules, use `kubectl get nodes --show-labels`
- **Required vs preferred affinity** - required rules block scheduling if unmet, preferred rules add weights to scoring but allow exceptions
- **Pod anti-affinity spreads replicas** - use `topologyKey: kubernetes.io/hostname` to spread pods across nodes for high availability
- **Taints repel, affinity attracts** - taints push pods away, tolerations grant permission, affinity pulls pods toward nodes
- **Production patterns combine all three** - dedicated nodes need taints (isolation), tolerations (permission), and affinity (attraction)
