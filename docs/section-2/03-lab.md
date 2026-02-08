# Lab: Making the Voting App Auto-Scale

## Objectives

By the end of this lab, you will be able to:

- Install and verify Metrics Server in your KIND cluster
- Configure HPA for vote and result services with CPU targets
- Generate load and observe autoscaling behavior in real-time
- Understand VPA recommendations for right-sizing resource requests
- Set up KEDA for event-driven worker scaling based on Redis queue length

## Prerequisites

Before starting this lab, ensure you have:

- Completed Module 0 and Module 1
- A running KIND cluster with 3 worker nodes
- Example Voting App deployed with scheduling rules from Module 1
- kubectl CLI configured to communicate with your cluster
- Basic understanding of resource requests and limits

## Setup

Follow these steps to prepare your environment for this lab.

**Step 1: Verify cluster status**

```bash
kubectl cluster-info
kubectl get nodes
```

Expected output:

```bash
Kubernetes control plane is running at https://127.0.0.1:xxxxx

NAME                 STATUS   ROLES           AGE   VERSION
kind-control-plane   Ready    control-plane   10d   v1.28.0
kind-worker          Ready    <none>          10d   v1.28.0
kind-worker2         Ready    <none>          10d   v1.28.0
kind-worker3         Ready    <none>          10d   v1.28.0
```

**Step 2: Verify Example Voting App is running**

```bash
kubectl get pods
kubectl get deployments
```

You should see vote, result, worker, redis, and postgres pods running. If the Voting App is not deployed, apply the base YAMLs from Module 0:

```bash
kubectl apply -f examples/voting-app/
```

**Step 3: Add resource requests to vote and result Deployments**

HPA requires resource requests to calculate utilization. The base Voting App from Module 0 does not have resource requests set. Update the vote and result Deployments:

Create a file named `vote-resources.yaml`:

```yaml title="vote-resources.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vote
spec:
  template:
    spec:
      containers:
      - name: vote
        image: schoolofdevops/vote:v1
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

Create a file named `result-resources.yaml`:

```yaml title="result-resources.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: result
spec:
  template:
    spec:
      containers:
      - name: result
        image: schoolofdevops/vote:v1
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

Apply the patches:

```bash
kubectl patch deployment vote --patch "$(cat vote-resources.yaml)"
kubectl patch deployment result --patch "$(cat result-resources.yaml)"
```

Verify resource requests are set:

```bash
kubectl describe deployment vote | grep -A 5 "Requests:"
kubectl describe deployment result | grep -A 5 "Requests:"
```

You should see:

```bash
    Requests:
      cpu:        100m
      memory:     128Mi
    Limits:
      cpu:        200m
      memory:     256Mi
```

## Tasks

### Task 1: Install Metrics Server

Metrics Server provides the Metrics API required by HPA. KIND does not include Metrics Server by default, so we must install it manually.

**Step 1: Apply Metrics Server YAML**

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

Expected output:

```bash
serviceaccount/metrics-server created
clusterrole.rbac.authorization.k8s.io/system:aggregated-metrics-reader created
clusterrole.rbac.authorization.k8s.io/system:metrics-server created
rolebinding.rbac.authorization.k8s.io/metrics-server-auth-reader created
clusterrolebinding.rbac.authorization.k8s.io/metrics-server:system:auth-delegator created
clusterrolebinding.rbac.authorization.k8s.io/system:metrics-server created
service/metrics-server created
deployment.apps/metrics-server created
apiservice.apiregistration.k8s.io/v1beta1.metrics.k8s.io created
```

**Step 2: Patch Metrics Server for KIND**

KIND uses self-signed certificates for kubelet TLS. Metrics Server will fail to connect to kubelets without a patch. Add the `--kubelet-insecure-tls` flag:

```bash
kubectl patch -n kube-system deployment metrics-server --type=json \
  -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

This tells Metrics Server to skip TLS certificate verification when connecting to kubelets.

**Step 3: Wait for Metrics Server to be ready**

```bash
kubectl wait --for=condition=available --timeout=300s deployment/metrics-server -n kube-system
```

**Step 4: Verify Metrics Server is working**

```bash
kubectl top nodes
```

Wait 60 seconds if you see an error. Metrics Server needs time to collect initial metrics. After the collection period:

```bash
kubectl top nodes
kubectl top pods
```

Expected output:

```bash
NAME                 CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
kind-control-plane   150m         3%     800Mi           10%
kind-worker          100m         2%     600Mi           7%
kind-worker2         80m          2%     550Mi           6%
kind-worker3         85m          2%     560Mi           6%

NAME                      CPU(cores)   MEMORY(bytes)
vote-xxxxxxxxxx-xxxxx     2m           50Mi
result-xxxxxxxxxx-xxxxx   3m           55Mi
worker-xxxxxxxxxx-xxxxx   5m           60Mi
redis-xxxxxxxxxx-xxxxx    4m           20Mi
postgres-xxxxxxxxxx-xxxxx 8m           100Mi
```

If `kubectl top` returns metrics, Metrics Server is working correctly.

### Task 2: Configure HPA for Vote Service

Now that Metrics Server is running, create an HPA to automatically scale the vote service based on CPU utilization.

**Step 1: Create HPA for vote service**

Create a file named `hpa-vote.yaml`:

```yaml title="hpa-vote.yaml"
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vote-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vote
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50  # Scale up when CPU > 50%
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
      policies:
      - type: Percent
        value: 50  # Scale down max 50% of pods at once
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0  # Scale up immediately
      policies:
      - type: Percent
        value: 100  # Can double pods if needed
        periodSeconds: 30
      - type: Pods
        value: 2  # Add max 2 pods per 30s
        periodSeconds: 30
      selectPolicy: Max  # Use policy that adds more pods
```

**Step 2: Apply the HPA**

```bash
kubectl apply -f hpa-vote.yaml
```

Expected output:

```bash
horizontalpodautoscaler.autoscaling/vote-hpa created
```

**Step 3: Verify HPA is working**

```bash
kubectl get hpa
```

Expected output:

```bash
NAME       REFERENCE         TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
vote-hpa   Deployment/vote   15%/50%   2         8         2          30s
```

The TARGETS column shows `current/target` CPU utilization. If you see `<unknown>/50%`, wait 60 seconds for Metrics Server to collect data.

**Step 4: Watch HPA status**

```bash
kubectl get hpa vote-hpa --watch
```

This command watches HPA status in real-time. You should see the current CPU utilization updating every 15 seconds. Leave this running in a terminal window. We will observe scaling in the next task.

### Task 3: Generate Load and Observe Scaling

Now generate load on the vote service to trigger HPA scaling.

**Step 1: Get vote service endpoint**

```bash
VOTE_SERVICE_IP=$(kubectl get svc vote -o jsonpath='{.spec.clusterIP}')
VOTE_SERVICE_PORT=$(kubectl get svc vote -o jsonpath='{.spec.ports[0].port}')
echo "Vote service: http://$VOTE_SERVICE_IP:$VOTE_SERVICE_PORT"
```

**Step 2: Deploy load generator**

Create a pod that continuously sends requests to the vote service:

```bash
kubectl run load-generator \
  --image=busybox:1.36 \
  --restart=Never \
  -- /bin/sh -c "while true; do wget -q -O- http://$VOTE_SERVICE_IP:$VOTE_SERVICE_PORT; done"
```

**Step 3: Watch HPA scale up**

In the terminal window running `kubectl get hpa vote-hpa --watch`, you should see:

```bash
NAME       REFERENCE         TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
vote-hpa   Deployment/vote   25%/50%   2         8         2          2m
vote-hpa   Deployment/vote   85%/50%   2         8         2          3m  <- CPU exceeded target
vote-hpa   Deployment/vote   85%/50%   2         8         3          3m  <- scaled up to 3
vote-hpa   Deployment/vote   65%/50%   2         8         3          4m
vote-hpa   Deployment/vote   65%/50%   2         8         4          4m  <- scaled up to 4
vote-hpa   Deployment/vote   48%/50%   2         8         4          5m  <- stabilized
```

The HPA watches CPU utilization every 15 seconds. When it exceeds the target (50%), HPA adds replicas to bring utilization back below the target.

**Step 4: Verify replicas increased**

```bash
kubectl get pods -l app=vote
```

You should see at least 3-4 vote pods running.

**Step 5: Stop load generation and watch scale down**

```bash
kubectl delete pod load-generator
```

Watch the HPA in the other terminal. It will NOT scale down immediately. The stabilization window (300 seconds = 5 minutes) prevents rapid scale-down. After 5 minutes, you will see:

```bash
NAME       REFERENCE         TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
vote-hpa   Deployment/vote   5%/50%    2         8         4          8m
vote-hpa   Deployment/vote   5%/50%    2         8         3          8m  <- scaled down to 3
vote-hpa   Deployment/vote   5%/50%    2         8         2          9m  <- scaled down to 2 (minReplicas)
```

The stabilization window prevents flapping (rapid scale up and down). This is critical for production stability.

**Step 6: Functional verification**

Verify the vote service still works correctly:

```bash
kubectl port-forward svc/vote 8080:80 &
```

Open your browser to `http://localhost:8080` and submit a vote. The vote should register correctly. Stop the port-forward:

```bash
pkill -f "port-forward svc/vote"
```

### Task 4: Create HPA for Result Service

Repeat the HPA configuration for the result service.

**Step 1: Create HPA for result service**

Create a file named `hpa-result.yaml`:

```yaml title="hpa-result.yaml"
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: result-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: result
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

**Step 2: Apply and verify**

```bash
kubectl apply -f hpa-result.yaml
kubectl get hpa
```

You should see both `vote-hpa` and `result-hpa` listed.

### Task 5: KEDA for Event-Driven Worker Scaling

The worker service consumes votes from the Redis queue. CPU usage is a poor indicator of actual work. If the queue has 10,000 votes but the worker is idle waiting for Redis, HPA will not scale up. KEDA solves this by scaling based on queue depth.

**Step 1: Install KEDA**

```bash
kubectl apply -f https://github.com/kedacore/keda/releases/download/v2.14.0/keda-2.14.0.yaml
```

Expected output:

```bash
namespace/keda created
customresourcedefinition.apiextensions.k8s.io/clustertriggerauthentications.keda.sh created
customresourcedefinition.apiextensions.k8s.io/scaledjobs.keda.sh created
customresourcedefinition.apiextensions.k8s.io/scaledobjects.keda.sh created
customresourcedefinition.apiextensions.k8s.io/triggerauthentications.keda.sh created
serviceaccount/keda-operator created
clusterrole.rbac.authorization.k8s.io/keda-operator created
clusterrolebinding.rbac.authorization.k8s.io/keda-operator created
role.rbac.authorization.k8s.io/keda-operator created
rolebinding.rbac.authorization.k8s.io/keda-operator created
service/keda-operator created
service/keda-operator-metrics-apiserver created
deployment.apps/keda-operator created
deployment.apps/keda-operator-metrics-apiserver created
```

**Step 2: Wait for KEDA operator to be ready**

```bash
kubectl wait --for=condition=available --timeout=300s deployment/keda-operator -n keda
kubectl wait --for=condition=available --timeout=300s deployment/keda-operator-metrics-apiserver -n keda
```

**Step 3: Create ScaledObject for worker**

Create a file named `keda-worker.yaml`:

```yaml title="keda-worker.yaml"
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker-scaledobject
spec:
  scaleTargetRef:
    name: worker  # Target the worker Deployment
  minReplicaCount: 1
  maxReplicaCount: 5
  triggers:
  - type: redis
    metadata:
      address: redis:6379
      listName: votes
      listLength: "5"  # Scale when queue > 5 messages
```

Apply the ScaledObject:

```bash
kubectl apply -f keda-worker.yaml
```

**Step 4: Verify KEDA ScaledObject**

```bash
kubectl get scaledobject
```

Expected output:

```bash
NAME                  SCALETARGETKIND      SCALETARGETNAME   MIN   MAX   TRIGGERS   AUTHENTICATION   READY   ACTIVE   FALLBACK   AGE
worker-scaledobject   apps/v1.Deployment   worker            1     5     redis                       True    False    False      30s
```

**Step 5: Verify KEDA created an HPA**

```bash
kubectl get hpa
```

You should see an HPA named `keda-hpa-worker-scaledobject` automatically created by KEDA:

```bash
NAME                            REFERENCE            TARGETS     MINPODS   MAXPODS   REPLICAS   AGE
vote-hpa                        Deployment/vote      5%/50%      2         8         2          15m
result-hpa                      Deployment/result    3%/50%      2         8         2          10m
keda-hpa-worker-scaledobject    Deployment/worker    0/5 (avg)   1         5         1          2m
```

The TARGETS column shows current queue length vs. target (5 messages). KEDA translates Redis list length into an HPA metric.

**Step 6: Demonstrate worker scaling**

Submit many votes rapidly to fill the Redis queue:

```bash
kubectl port-forward svc/vote 8080:80 &
```

In another terminal, use curl to submit votes in a loop:

```bash
for i in {1..50}; do
  curl -s -X POST http://localhost:8080 -d "vote=a" > /dev/null
  echo "Submitted vote $i"
done
```

Watch the worker scale up as the queue grows:

```bash
kubectl get hpa keda-hpa-worker-scaledobject --watch
```

You should see the TARGETS increase as votes accumulate in Redis, and the worker replicas increase accordingly:

```bash
NAME                            REFERENCE            TARGETS      MINPODS   MAXPODS   REPLICAS   AGE
keda-hpa-worker-scaledobject    Deployment/worker    12/5 (avg)   1         5         1          5m
keda-hpa-worker-scaledobject    Deployment/worker    12/5 (avg)   1         5         3          5m  <- scaled up
keda-hpa-worker-scaledobject    Deployment/worker    8/5 (avg)    1         5         3          6m
keda-hpa-worker-scaledobject    Deployment/worker    2/5 (avg)    1         5         3          7m
keda-hpa-worker-scaledobject    Deployment/worker    0/5 (avg)    1         5         1          10m <- scaled down
```

Stop the port-forward:

```bash
pkill -f "port-forward svc/vote"
```

KEDA scales the worker based on actual work in the queue, not CPU usage. This is more efficient for queue consumers.

### Challenge: Understanding the HPA/VPA Conflict

This challenge is conceptual, demonstrating why HPA and VPA should not target the same Deployment for the same metric.

**Scenario:**

Imagine you apply both HPA (targeting 70% CPU utilization) and VPA (in Auto mode) to the vote Deployment.

1. Vote pod uses 80m CPU with a request of 100m CPU. Utilization: 80%.
2. HPA sees 80% > 70% target and adds replicas.
3. VPA observes consistent 80m usage and reduces request to 80m CPU (optimizing resources).
4. Now the same 80m usage becomes 80m / 80m = 100% utilization.
5. HPA sees 100% > 70% target and adds more replicas.
6. The load distributes, and usage per pod drops to 50m.
7. VPA sees lower usage and reduces requests to 50m.
8. HPA sees 50m / 50m = 100% utilization again and scales up.
9. This cycle repeats, causing thrashing.

**Key learning:**

Never run HPA and VPA together on the same Deployment for the same resource. The solution:

- Use VPA in Off mode (recommendation only)
- Review VPA recommendations: `kubectl describe vpa worker-vpa`
- Apply recommended resource requests manually to your Deployment
- Then create HPA for horizontal scaling based on the new requests

This gives you right-sized pods with dynamic replica counts.

## Verification

Confirm your lab setup is working correctly:

**1. Metrics Server is running and returning metrics**

```bash
kubectl top nodes
kubectl top pods
```

Expected: Both commands return resource usage data without errors.

**2. HPA resources exist and show valid targets**

```bash
kubectl get hpa
```

Expected output:

```bash
NAME                            REFERENCE            TARGETS     MINPODS   MAXPODS   REPLICAS
vote-hpa                        Deployment/vote      5%/50%      2         8         2
result-hpa                      Deployment/result    3%/50%      2         8         2
keda-hpa-worker-scaledobject    Deployment/worker    0/5 (avg)   1         5         1
```

TARGETS should show current/target values, not `<unknown>`.

**3. Vote service scaled up under load**

During Task 3, you observed vote replicas increase from 2 to at least 3-4 when load was applied.

**4. Vote service scaled down after load removed**

After deleting the load generator, you observed vote replicas return to 2 (minReplicas) after the 5-minute stabilization window.

**5. KEDA ScaledObject exists and manages worker scaling**

```bash
kubectl get scaledobject
kubectl get hpa keda-hpa-worker-scaledobject
```

Expected: ScaledObject is READY and ACTIVE. HPA was created automatically by KEDA.

**6. Voting App still fully functional end-to-end**

```bash
kubectl port-forward svc/vote 8080:80 &
kubectl port-forward svc/result 8081:80 &
```

Open browser to `http://localhost:8080`, submit a vote. Open `http://localhost:8081`, verify the vote appears in results. Stop port-forwards:

```bash
pkill -f "port-forward"
```

## Cleanup

Module 2 completes the 0-1-2 build-up sequence. Modules 3 and 4 start with focused, clean deployments rather than carrying forward autoscaling state. Clean up autoscaling resources but keep the base cluster.

**Step 1: Delete HPA resources**

```bash
kubectl delete hpa vote-hpa
kubectl delete hpa result-hpa
```

**Step 2: Delete KEDA ScaledObject**

```bash
kubectl delete scaledobject worker-scaledobject
```

KEDA will automatically delete the HPA it created.

**Step 3: Verify cleanup**

```bash
kubectl get hpa
kubectl get scaledobject
```

Expected: No resources listed.

**Step 4: Keep KIND cluster and base Voting App running**

Do not delete the cluster or Voting App. Learners will redeploy fresh from `examples/` as needed in subsequent modules.

## Troubleshooting

### Issue: HPA shows `<unknown>` for TARGETS

**Symptom:** `kubectl get hpa` shows `<unknown>/50%` in the TARGETS column. Pods do not scale.

**Cause:** Metrics Server is not running, not ready, or the target Deployment has no resource requests.

**Solution:**

```bash
# Check Metrics Server is running
kubectl get deployment -n kube-system metrics-server

# Check Metrics Server logs
kubectl logs -n kube-system deployment/metrics-server

# Verify Metrics API is available
kubectl top nodes

# Verify target Deployment has resource requests
kubectl describe deployment vote | grep -A 5 "Requests:"
```

If Metrics Server is not running, repeat Task 1. If resource requests are missing, repeat Setup Step 3.

### Issue: Pods do not scale up under load

**Symptom:** Load generator is running, but vote replicas remain at 2. HPA shows low CPU utilization.

**Cause:** CPU target utilization is too high, or load generator is not generating enough load.

**Solution:**

```bash
# Check current CPU utilization
kubectl top pods -l app=vote

# Check HPA events
kubectl describe hpa vote-hpa

# Verify load generator is running
kubectl get pod load-generator
kubectl logs load-generator
```

If CPU usage is below the target (50%), increase load by deploying multiple load generator pods:

```bash
kubectl run load-generator-2 \
  --image=busybox:1.36 \
  --restart=Never \
  -- /bin/sh -c "while true; do wget -q -O- http://$VOTE_SERVICE_IP:$VOTE_SERVICE_PORT; done"
```

Or lower the HPA target to 30% to trigger scaling at lower CPU usage.

### Issue: KEDA ScaledObject not working

**Symptom:** `kubectl get scaledobject` shows READY: False or ACTIVE: False. Worker does not scale based on Redis queue length.

**Cause:** KEDA operator is not running, Redis connection issue, or incorrect ScaledObject configuration.

**Solution:**

```bash
# Check KEDA operator is running
kubectl get deployment -n keda

# Check KEDA operator logs
kubectl logs -n keda deployment/keda-operator

# Verify Redis service is reachable
kubectl run test-redis --image=redis:alpine --rm -it --restart=Never -- redis-cli -h redis PING

# Check ScaledObject status
kubectl describe scaledobject worker-scaledobject
```

If KEDA operator is not running, repeat Task 5 Step 1. If Redis is not reachable, verify the Redis service is running: `kubectl get svc redis`.

### Issue: Pods scale down too quickly

**Symptom:** HPA removes replicas immediately when load drops, then has to scale up again when load returns. This causes instability.

**Cause:** Stabilization window is too short or not configured.

**Solution:**

Update the HPA behavior section to increase the scaleDown stabilizationWindowSeconds:

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 600  # Wait 10 minutes before scaling down
```

Apply the updated HPA:

```bash
kubectl apply -f hpa-vote.yaml
```

This prevents rapid scale-down during temporary traffic dips.

## Key Takeaways

- Metrics Server provides the Metrics API required by HPA and must be installed separately in KIND clusters
- HPA calculates utilization as (current usage / resource request), so resource requests are mandatory for HPA to function
- Stabilization windows prevent flapping by scaling up fast and scaling down slowly
- Never run HPA and VPA together on the same Deployment for the same resource to avoid thrashing
- KEDA extends HPA with event-driven scaling for queue consumers and scheduled workloads, scaling based on actual work rather than CPU usage
