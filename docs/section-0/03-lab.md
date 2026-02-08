# Lab: Setting Up Your Kubernetes Playground

## Objectives

By the end of this lab, you will be able to:

- Create a multi-node KIND cluster with 1 control plane and 3 worker nodes
- Deploy all five components of the Example Voting App using provided YAML files
- Verify end-to-end application workflow from vote submission to results display
- Understand the communication flow between microservices in a Kubernetes cluster
- Identify baseline deployment limitations and gaps that later modules will address

## Prerequisites

Before starting this lab, ensure you have:

- Docker installed and running on your local machine
- kubectl CLI tool installed (version 1.27 or later)
- KIND CLI tool installed (version 0.20 or later)
- Terminal or shell access with administrative privileges
- At least 4GB of available RAM for the cluster

## Setup

Follow these steps to prepare your environment for this lab.

**Step 1: Verify Docker is running**

```bash
docker info
```

Expected output should include:

```bash
Server:
 Containers: X
 Running: X
 ...
```

If you see "Cannot connect to the Docker daemon," start Docker Desktop or the Docker service.

**Step 2: Verify kubectl is installed**

```bash
kubectl version --client
```

Expected output:

```bash
Client Version: v1.27.0 (or later)
```

If kubectl is not installed, follow the [official installation guide](https://kubernetes.io/docs/tasks/tools/).

**Step 3: Verify KIND is installed**

```bash
kind version
```

Expected output:

```bash
kind v0.20.0 (or later)
```

If KIND is not installed, follow the [KIND installation guide](https://kind.sigs.k8s.io/docs/user/quick-start/#installation).

## Tasks

### Task 1: Create a Multi-Node KIND Cluster

A multi-node cluster is essential for this course. Many intermediate concepts like advanced scheduling and pod distribution require multiple worker nodes to demonstrate effectively.

**Step 1: Create the cluster using the provided configuration**

```bash
kind create cluster --config examples/kind-cluster.yaml --name voting-app
```

This command creates a cluster named "voting-app" with the topology defined in the configuration file. The process takes 30-60 seconds.

Expected output:

```bash
Creating cluster "voting-app" ...
 ✓ Ensuring node image (kindest/node:v1.27.3)
 ✓ Preparing nodes
 ✓ Writing configuration
 ✓ Starting control-plane
 ✓ Installing CNI
 ✓ Installing StorageClass
 ✓ Joining worker nodes
Set kubectl context to "kind-voting-app"
You can now use your cluster with:

kubectl cluster-info --context kind-voting-app
```

**Step 2: Verify the cluster is running**

```bash
kubectl get nodes
```

Expected output:

```bash
NAME                       STATUS   ROLES           AGE   VERSION
voting-app-control-plane   Ready    control-plane   60s   v1.27.3
voting-app-worker          Ready    <none>          40s   v1.27.3
voting-app-worker2         Ready    <none>          40s   v1.27.3
voting-app-worker3         Ready    <none>          40s   v1.27.3
```

You should see four nodes: one control-plane and three worker nodes, all with STATUS "Ready".

**Step 3: Understand the cluster topology**

The control-plane node runs the Kubernetes API server, scheduler, controller manager, and etcd. It orchestrates the cluster but typically doesn't run application workloads (this is configurable, but KIND follows production patterns).

The three worker nodes will run your application pods. The scheduler distributes pods across these workers based on resource availability and scheduling rules. In Module 0, pods are placed randomly. In Module 1, you'll learn to control exactly where pods land.

### Task 2: Deploy Infrastructure Services

Infrastructure services (Redis and PostgreSQL) provide data storage and queuing for the application. We deploy these first because the application services depend on them being available.

**Step 1: Deploy Redis (message queue)**

```bash
kubectl apply -f examples/voting-app/redis-deployment.yaml
kubectl apply -f examples/voting-app/redis-service.yaml
```

Expected output:

```bash
deployment.apps/redis created
service/redis created
```

**Step 2: Deploy PostgreSQL (database)**

```bash
kubectl apply -f examples/voting-app/postgres-deployment.yaml
kubectl apply -f examples/voting-app/postgres-service.yaml
```

Expected output:

```bash
deployment.apps/postgres created
service/postgres created
```

**Step 3: Verify infrastructure pods are running**

```bash
kubectl get pods
```

Expected output (wait until STATUS shows "Running"):

```bash
NAME                        READY   STATUS    RESTARTS   AGE
redis-xxxxxxxxxx-xxxxx      1/1     Running   0          30s
postgres-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

If pods show "ContainerCreating", wait 10-20 seconds and run the command again. The first deployment takes longer because Docker must pull images.

**Why infrastructure first?** The worker service needs to connect to both Redis and PostgreSQL. If we deployed the worker before these services existed, it would crash and restart repeatedly until dependencies became available. Starting with infrastructure ensures a clean startup sequence.

### Task 3: Deploy Application Services

Now that infrastructure is ready, deploy the three application services: vote, worker, and result.

**Step 1: Deploy the Worker (background processor)**

```bash
kubectl apply -f examples/voting-app/worker-deployment.yaml
```

Expected output:

```bash
deployment.apps/worker created
```

The worker has no Service because it doesn't expose any ports. It's a background process that polls Redis and writes to PostgreSQL.

**Step 2: Deploy the Vote service (frontend)**

```bash
kubectl apply -f examples/voting-app/vote-deployment.yaml
kubectl apply -f examples/voting-app/vote-service.yaml
```

Expected output:

```bash
deployment.apps/vote created
service/vote created
```

**Step 3: Deploy the Result service (results dashboard)**

```bash
kubectl apply -f examples/voting-app/result-deployment.yaml
kubectl apply -f examples/voting-app/result-service.yaml
```

Expected output:

```bash
deployment.apps/result created
service/result created
```

**Step 4: Verify all application pods are running**

```bash
kubectl get pods
```

Expected output:

```bash
NAME                        READY   STATUS    RESTARTS   AGE
redis-xxxxxxxxxx-xxxxx      1/1     Running   0          2m
postgres-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
worker-xxxxxxxxxx-xxxxx     1/1     Running   0          1m
vote-xxxxxxxxxx-xxxxx       1/1     Running   0          45s
result-xxxxxxxxxx-xxxxx     1/1     Running   0          30s
```

All five pods should show STATUS "Running" and READY "1/1".

### Task 4: Verify End-to-End Application Workflow

Now that all components are deployed, test the complete data flow: vote submission → Redis → Worker → PostgreSQL → Results display.

**Step 1: Access the Vote service**

The vote service is exposed as a NodePort on port 30000. In KIND, you can access NodePort services through Docker port mapping.

```bash
kubectl port-forward svc/vote 8080:80
```

Leave this terminal running and open a new terminal for subsequent commands.

**Step 2: Submit a vote**

Open your browser to `http://localhost:8080`. You should see the voting interface with two options (typically Cats vs Dogs). Click one option to cast a vote.

You should see a confirmation message or the interface updating to show your vote was recorded.

**Step 3: Verify the vote reached Redis**

In your second terminal, check the Redis queue:

```bash
kubectl exec -it deployment/redis -- redis-cli LLEN votes
```

Expected output:

```bash
(integer) 1
```

This shows one vote is in the Redis queue waiting for the worker to process it.

**Step 4: Wait for worker to process the vote**

The worker polls Redis every few seconds, consumes votes, and writes them to PostgreSQL. Wait 5-10 seconds, then check if the worker has processed the vote:

```bash
kubectl exec -it deployment/redis -- redis-cli LLEN votes
```

Expected output:

```bash
(integer) 0
```

The queue length dropping to zero means the worker successfully consumed your vote.

**Step 5: Verify the vote reached PostgreSQL**

```bash
kubectl exec -it deployment/postgres -- psql -U postgres -c "SELECT COUNT(*) FROM votes;"
```

Expected output:

```bash
 count
-------
     1
(1 row)
```

Your vote is now permanently stored in the database.

**Step 6: View results in the Result service**

Stop the port-forward from Step 1 (Ctrl+C), then forward to the result service:

```bash
kubectl port-forward svc/result 8081:80
```

Open your browser to `http://localhost:8081`. You should see the results dashboard displaying the vote count for each option.

Congratulations! You've verified the complete end-to-end workflow: browser → vote service → Redis queue → worker processing → PostgreSQL storage → result service display.

### Task 5: Explore the Baseline Deployment

Now that the application works, let's examine what's missing from a production perspective.

**Step 1: Review all resources**

```bash
kubectl get all
```

Expected output shows all deployments, pods, and services. Notice:

- Each deployment has exactly 1 replica (no high availability)
- No resource requests or limits are defined (pods could consume unlimited resources)
- No readiness or liveness probes (Kubernetes can't tell if pods are healthy)
- No pod disruption budgets (nothing prevents all replicas from being evicted simultaneously)

**Step 2: Check where pods are running**

```bash
kubectl get pods -o wide
```

Expected output includes a NODE column showing which worker node each pod landed on. The distribution is essentially random - the scheduler placed pods on nodes with available resources, but without any guidance about optimal placement.

Questions to consider:

- What if the postgres pod landed on a node without fast storage?
- What if all vote pods ended up on the same node, leaving other nodes underutilized?
- What if the redis pod and postgres pod are on nodes far apart in a real cluster, increasing latency?

**Module 1 addresses these questions with advanced scheduling.**

**Step 3: Examine resource usage**

```bash
kubectl top nodes
kubectl top pods
```

If you see "error: Metrics API not available," that's expected. Metrics Server isn't installed in base KIND clusters. Without metrics, the Horizontal Pod Autoscaler can't function. **Module 2 installs Metrics Server and adds autoscaling.**

**Step 4: Review Services**

```bash
kubectl get svc
```

Notice the vote and result services use NodePort (ports 30000 and 30001). This works for local development but isn't production-ready. In production, you need path-based routing, TLS termination, and traffic splitting capabilities. **Module 3 introduces Gateway API for sophisticated traffic management.**

**Step 5: Test service-to-service communication**

```bash
kubectl exec -it deployment/vote -- wget -qO- http://redis:6379
```

This succeeds, demonstrating that services can communicate. But notice:

- Communication is unencrypted (plain text)
- No circuit breaking or retries if redis is temporarily unavailable
- No observability into the communication (request duration, failure rate, etc.)

**Module 4 evaluates whether adding a service mesh is worth the complexity for your use case.**

### Task 6 (Challenge): Break and Fix

Understanding failure modes helps build resilience. Let's intentionally break something and observe Kubernetes self-healing.

**Step 1: Delete the worker pod**

```bash
kubectl delete pod -l app=worker
```

Expected output:

```bash
pod "worker-xxxxxxxxxx-xxxxx" deleted
```

**Step 2: Immediately check pod status**

```bash
kubectl get pods -l app=worker --watch
```

You'll see the old pod terminating and a new pod being created. The Deployment controller noticed that the actual state (0 worker pods) doesn't match the desired state (1 replica), so it creates a replacement.

Expected progression:

```bash
NAME                      READY   STATUS        RESTARTS   AGE
worker-xxxxxxxxxx-old     1/1     Terminating   0          5m
worker-xxxxxxxxxx-new     0/1     Pending       0          1s
worker-xxxxxxxxxx-new     0/1     ContainerCreating   0   2s
worker-xxxxxxxxxx-new     1/1     Running       0          5s
```

Press Ctrl+C to stop watching.

**Step 3: Verify self-healing**

Submit another vote through the vote service (http://localhost:8080). Even though you deleted the worker, the new worker pod should process the vote normally.

This demonstrates Kubernetes self-healing - controllers continuously reconcile actual state with desired state. However, notice there was a brief window (5-10 seconds) when no worker was running. Votes queued in Redis during that window had to wait. **Module 1 explores replica distribution strategies to minimize this gap.**

## Verification

Confirm your lab setup is complete and working correctly:

**1. All pods are running**

```bash
kubectl get pods
```

Expected: Five pods, all showing STATUS "Running" and READY "1/1".

**2. Services are accessible**

```bash
kubectl get svc
```

Expected: Vote service on NodePort 30000, result service on NodePort 30001, redis and postgres with ClusterIP.

**3. End-to-end workflow functions**

- Submit a vote at http://localhost:8080
- Wait 5-10 seconds for worker to process
- View results at http://localhost:8081
- Vote count should match number of votes submitted

**4. All nodes are ready**

```bash
kubectl get nodes
```

Expected: Four nodes (1 control-plane, 3 workers), all STATUS "Ready".

## Cleanup

**Important:** Do NOT clean up this cluster. Module 1 builds on this exact deployment state. The labs in Module 1 assume the Example Voting App is already deployed.

If you need to stop working and restart later:

```bash
# Stop the cluster (preserves state)
docker stop voting-app-control-plane voting-app-worker voting-app-worker2 voting-app-worker3

# Resume the cluster
docker start voting-app-control-plane voting-app-worker voting-app-worker2 voting-app-worker3

# Verify cluster is back
kubectl get nodes
```

If you need to completely remove the cluster (you'll redo this lab to restore it):

```bash
kind delete cluster --name voting-app
```

## Troubleshooting

### Issue: KIND cluster creation fails with "failed to create cluster"

**Symptom:** `kind create cluster` fails with error "failed to create cluster: failed to pull image..."

**Cause:** Docker is not running, or Docker has insufficient resources allocated.

**Solution:**

```bash
# Verify Docker is running
docker info

# If Docker is not running, start Docker Desktop or Docker service
# If Docker is running but cluster creation still fails, increase Docker resources:
# Docker Desktop → Settings → Resources → Memory (set to at least 4GB)
```

### Issue: Pods stuck in ImagePullBackOff

**Symptom:** `kubectl get pods` shows STATUS "ImagePullBackOff" or "ErrImagePull"

**Cause:** Image name typo in YAML files, or network issues preventing Docker from pulling images.

**Solution:**

```bash
# Check pod events to see the exact error
kubectl describe pod <pod-name>

# Look for the "Events" section at the bottom - it will show image pull errors
# Common causes:
# - Image name typo (verify image exists on Docker Hub)
# - Network issues (check internet connectivity)
# - Rate limiting from Docker Hub (wait 10 minutes and try again)
```

### Issue: Vote service accessible but results show zero

**Symptom:** Vote submission works, but result service shows zero votes or outdated counts.

**Cause:** Worker pod not running, or worker can't connect to Redis or PostgreSQL.

**Solution:**

```bash
# 1. Verify worker is running
kubectl get pods -l app=worker

# 2. Check worker logs for connection errors
kubectl logs deployment/worker

# 3. Verify infrastructure services are accessible
kubectl exec -it deployment/worker -- nslookup redis
kubectl exec -it deployment/worker -- nslookup postgres

# 4. Check if votes are stuck in Redis queue
kubectl exec -it deployment/redis -- redis-cli LLEN votes
# If this number is growing, worker isn't processing votes

# 5. Restart worker to force reconnection
kubectl rollout restart deployment/worker
```

## Key Takeaways

- KIND provides fast, multi-node local Kubernetes clusters perfect for learning and experimentation
- The Example Voting App demonstrates real-world microservices patterns with asynchronous processing, message queues, and data persistence
- Infrastructure services (Redis, PostgreSQL) should be deployed before application services that depend on them
- End-to-end verification requires testing the complete data flow, not just checking that pods are running
- Baseline deployments work but lack production-readiness: no scheduling control, no autoscaling, no resource limits, no health checks, and no traffic management
- Kubernetes self-healing (via Deployment controllers) automatically replaces failed pods, though there may be brief service disruption
- Each gap in the baseline deployment will be addressed in subsequent modules, progressively evolving the application toward production readiness
