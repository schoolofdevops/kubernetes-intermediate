# Quest: Service Mesh Exploration with Linkerd

## Objectives

By the end of this quest, you will be able to:

- Install Linkerd service mesh on a KIND cluster
- Inject service mesh sidecars into application workloads
- Visualize service topology and communication patterns with Linkerd Viz
- Observe automatic mTLS encryption between services
- Explore service mesh metrics (success rates, latency, request rates)
- Experience traffic splitting with weighted routing
- Understand when service mesh adds value and when simpler tools suffice

## Prerequisites

Before starting this quest, ensure you have:

- A running KIND cluster with the Example Voting App deployed (from Module 0)
- kubectl CLI configured to communicate with your cluster
- curl or a web browser for testing services
- At least 4GB available RAM (Linkerd is lightweight but needs some resources)

## What is This Quest?

This is an **exploratory quest** - you'll install Linkerd, explore its capabilities through hands-on experimentation, and then clean up. The goal is to understand what service mesh provides and when it's valuable, through direct experience rather than theory.

Linkerd is one of the lightest service meshes (~50MB control plane), making it perfect for local experimentation. Linkerd Viz provides:
- **Automatic mTLS** between services without code changes
- **Golden metrics** (success rate, request rate, latency p50/p95/p99) per service via CLI
- **Service topology visualization** in the web dashboard
- **Live request tapping** (like tcpdump for HTTP)
- **Traffic management** for canary deployments and traffic splitting

Note: This lab uses Linkerd Viz's built-in tools (CLI + web dashboard). For production, teams often add Grafana/Prometheus/Jaeger, but Viz provides everything needed for learning.

## Quest Path

This quest follows an exploration pattern:
1. **Install** Linkerd and inject sidecars
2. **Visualize** service communication with Linkerd Viz
3. **Observe** automatic mTLS and metrics
4. **Experiment** with traffic splitting
5. **Reflect** on when service mesh is valuable
6. **Clean up** and restore baseline

Let's begin!

## Task 1: Install Linkerd

**Step 1: Install the Linkerd CLI**

```bash
# Download and install Linkerd CLI
curl -fsL https://run.linkerd.io/install | sh

# Add to PATH
export PATH=$PATH:$HOME/.linkerd2/bin

# Verify installation
linkerd version
```

Expected output:
```
Client version: stable-2.16.x
Server version: unavailable
```

**Step 2: Validate cluster compatibility**

```bash
linkerd check --pre
```

Expected output: All checks should pass (green checkmarks). If "clock skew" warning appears, you can ignore it for local development.

**Step 3: Install Linkerd control plane**

```bash
# Install Linkerd control plane
linkerd install --crds | kubectl apply -f -
linkerd install | kubectl apply -f -

# Wait for Linkerd to be ready (takes ~30 seconds)
linkerd check
```

Expected output: All checks pass. The control plane includes several components in the `linkerd` namespace.

**Step 4: Verify Linkerd is running**

```bash
kubectl get pods -n linkerd
```

Expected output: All Linkerd pods should show STATUS: Running.

## Task 2: Inject Linkerd into the Voting App

Now let's add Linkerd sidecars to our application. The sidecars intercept all network traffic and provide observability and security.

**Step 1: Check current pod state**

```bash
kubectl get pods
```

Note: All pods currently show `1/1` containers (just the application).

**Step 2: Inject Linkerd sidecars into all deployments**

```bash
# Inject Linkerd proxy sidecars
kubectl get deploy -o yaml | linkerd inject - | kubectl apply -f -
```

This command:
1. Gets all deployments as YAML
2. Pipes through `linkerd inject` which adds sidecar configuration
3. Applies the modified YAML back to the cluster

**Step 3: Verify sidecar injection**

```bash
kubectl get pods
```

Expected output: All pods now show `2/2` containers (application + linkerd-proxy sidecar). You'll see pods terminating and recreating with the new sidecar.

**Step 4: Wait for all pods to be ready**

```bash
kubectl wait --for=condition=ready --timeout=120s pod --all
```

**Step 5: Test application still works**

```bash
# Test vote service
curl http://localhost:30000

# Test result service
curl http://localhost:30100
```

Expected output: Both should return HTML (no errors). The application works identically, but now all communication goes through Linkerd proxies.

## Task 3: Visualize Service Communication

Linkerd Viz provides a dashboard to visualize service topology and metrics.

**Step 1: Install Linkerd Viz extension**

```bash
# Install the Viz extension (includes web dashboard, Prometheus, and CLI tools)
linkerd viz install | kubectl apply -f -

# Wait for Viz to be ready
linkerd viz check
```

Expected output: All checks pass. Viz components are deployed to the `linkerd-viz` namespace.

**Step 2: Generate some traffic**

Before exploring the dashboard, generate traffic so there's data to visualize:

```bash
# Submit votes in a loop
for i in {1..30}; do
  curl -s http://localhost:30000 > /dev/null
  echo "Request $i"
  sleep 0.5
done
```

**Step 3: Open the Linkerd dashboard**

```bash
linkerd viz dashboard &
```

This opens the web dashboard at http://localhost:50750 in your browser. Explore the interface:

- **Overview tab**: Cluster-wide health and success rates
- **Namespaces tab**: Click "default" to drill into our services
- **Deployments view**: Shows all 5 Voting App components with live metrics
- **Top tab**: Real-time request rates across all services
- **Tap tab**: Live HTTP/gRPC request streaming

**Step 4: Explore service details in the dashboard**

In the dashboard, click on any deployment (e.g., "vote") to see its detail page with:

**Metrics panel:**
- Success rate (should be ~100%)
- Request rate (requests per second)
- Latency (P50, P95, P99 percentiles)

**Inbound/Outbound connections:**
- Which services send traffic TO this service (inbound)
- Which services THIS service calls (outbound)
- All connections show mTLS lock icon indicating encryption

**Live Traffic:**
- Click "TAP" button to stream live requests (like tcpdump for HTTP)
- See HTTP methods, paths, status codes, and latencies in real-time

This visibility is available **without any application code changes** - all from the service mesh.

**Step 5: View edges (service communication)**

```bash
linkerd viz edges deployment
```

Expected output shows which services communicate:
```
SRC           DST        SRC_NS   DST_NS   SECURED
vote          redis      default  default  √
worker        redis      default  default  √
worker        postgres   default  default  √
result        postgres   default  default  √
```

The `SECURED` column shows √ (checkmark) indicating mTLS encryption is active!

**Step 6: Check per-service metrics with CLI**

The CLI tools provide instant visibility into service behavior:

```bash
# View statistics for all deployments
linkerd viz stat deploy
```

Expected output:
```
NAME       MESHED   SUCCESS      RPS   LATENCY_P50   LATENCY_P95   LATENCY_P99   TCP_CONN
postgres      1/1   100.00%   0.3rps           1ms           9ms          10ms          5
redis         1/1   100.00%   0.3rps           1ms          28ms          30ms          5
result        1/1   100.00%   0.3rps           8ms          29ms          30ms          1
vote          1/1   100.00%   0.3rps           1ms           9ms          10ms          1
worker        1/1   100.00%   0.3rps           1ms          39ms          40ms          1
```

Notice the golden metrics you couldn't see with kubectl:
- **SUCCESS**: Percentage of successful requests (100% = healthy)
- **RPS**: Requests per second (actual traffic load)
- **LATENCY_P50/P95/P99**: Latency percentiles showing performance distribution
- **TCP_CONN**: Active TCP connections

```bash
# View top endpoints by request count (useful for finding hot paths)
linkerd viz top deploy

# Detailed stats for a specific service
linkerd viz stat deploy/vote -t 30s
```

The `-t` flag watches for 30 seconds, showing live updates.

## Task 4: Observe Automatic mTLS

One of service mesh's key benefits is automatic mutual TLS between services.

**Step 1: Verify mTLS is enabled**

```bash
linkerd viz edges deployment -o wide
```

Look for the `SECURED` column - all connections should show √ (secured with mTLS).

**Step 2: Understand what this means**

Without changing a single line of application code:
- All communication between services is **encrypted**
- Services **authenticate** each other with certificates
- Certificates are **automatically rotated** by Linkerd

This would normally require significant application changes and certificate management infrastructure.

**Step 3: View TLS details**

```bash
linkerd viz tap deploy/vote --to deploy/redis
```

This shows live traffic from vote to redis. While the content is encrypted, Linkerd can show you metadata (HTTP status, duration, etc.) because it terminates TLS at the proxy.

## Task 5: Experiment with Traffic Splitting

Let's create a canary deployment and split traffic between versions.

**Step 1: Create a v2 version of the vote service**

```bash
# Create vote-v2 deployment
kubectl create deployment vote-v2 --image=schoolofdevops/vote:v2 --replicas=1

# Add labels to match the original vote service
kubectl patch deployment vote-v2 -p '{"spec":{"template":{"metadata":{"labels":{"app":"vote","version":"v2"}}}}}'

# Inject Linkerd into the new deployment
kubectl get deploy vote-v2 -o yaml | linkerd inject - | kubectl apply -f -

# Wait for it to be ready
kubectl wait --for=condition=ready pod -l app=vote,version=v2
```

**Step 2: Create a TrafficSplit resource**

```bash
cat <<EOF | kubectl apply -f -
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
metadata:
  name: vote-split
spec:
  service: vote
  backends:
  - service: vote
    weight: 90
  - service: vote-v2
    weight: 10
EOF
```

This sends 90% of traffic to the original vote service and 10% to vote-v2 (canary).

**Step 3: Observe traffic distribution**

```bash
# Generate traffic
for i in {1..50}; do
  curl -s http://localhost:30000 > /dev/null
  echo "Request $i"
done

# Check metrics for both versions
linkerd viz stat deploy/vote deploy/vote-v2
```

You should see vote-v2 receiving roughly 10% of the requests compared to vote.

**Step 4: View in dashboard**

In the Linkerd dashboard, navigate to the vote deployment. You'll see traffic being split according to the weights.

## Task 6: Reflect on Service Mesh Value

Now that you've explored Linkerd hands-on, consider:

**What did Linkerd provide automatically?**
- ✅ mTLS encryption between all services (zero code changes)
- ✅ Golden metrics (success rate, RPS, latency) per service
- ✅ Service topology visualization
- ✅ Traffic splitting for canary deployments
- ✅ Live request tapping for debugging

**What's the cost?**
- Extra containers (sidecars): 5 pods → 10 containers
- Extra control plane: ~50MB for Linkerd control plane
- Learning curve: Understanding service mesh concepts
- Troubleshooting complexity: Two places to look (app + proxy)

**For the Voting App (5 services, simple patterns):**

Consider simpler alternatives:
- **mTLS**: NetworkPolicy for pod security, cert-manager for TLS
- **Metrics**: Prometheus + Grafana (application instrumentation)
- **Visualization**: Kiali standalone mode
- **Traffic splitting**: Gateway API weighted routing

**When does service mesh make sense?**
- **Large scale**: 10+ microservices with complex communication
- **Regulatory needs**: PCI-DSS, HIPAA requiring encrypted service-to-service
- **Multi-tenancy**: Strict isolation between customer workloads
- **Zero-trust security**: Every connection must be authenticated
- **Advanced traffic patterns**: Frequent canaries, A/B tests, circuit breaking

For small applications (like our 5-service Voting App), service mesh capabilities are impressive but often overkill. The decision depends on your specific requirements.

## Task 7: Clean Up Linkerd

After exploration, remove Linkerd to restore the cluster to baseline.

**Step 1: Delete the traffic split**

```bash
kubectl delete trafficsplit vote-split
kubectl delete deployment vote-v2
```

**Step 2: Remove Linkerd sidecars from Voting App**

```bash
# Uninject Linkerd sidecars
kubectl get deploy -o yaml | linkerd uninject - | kubectl apply -f -
```

**Step 3: Uninstall Linkerd Viz**

```bash
linkerd viz uninstall | kubectl delete -f -
```

**Step 4: Uninstall Linkerd control plane**

```bash
linkerd uninstall | kubectl delete -f -
```

**Step 5: Verify removal**

```bash
# Pods should be back to 1/1 containers
kubectl get pods

# Linkerd namespace should be gone
kubectl get namespace linkerd
```

Expected output: Pods show `1/1` containers, linkerd namespace not found.

**Step 6: Verify Voting App still works**

```bash
curl http://localhost:30000
curl http://localhost:30100
```

Both should return HTML responses. The application works identically without the service mesh.

## Verification

Confirm you completed the quest:

**1. You installed Linkerd**
- Linkerd CLI installed and working
- Control plane deployed to cluster
- All pre-checks passed

**2. You injected sidecars**
- All Voting App pods ran with 2/2 containers (app + proxy)
- Application continued working normally

**3. You explored observability**
- Viewed Linkerd dashboard
- Saw service topology and metrics
- Observed mTLS-secured connections
- Used `linkerd viz stat`, `edges`, and `tap` commands

**4. You experimented with traffic splitting**
- Created vote-v2 canary deployment
- Configured 90/10 traffic split
- Observed weighted traffic distribution

**5. You cleaned up successfully**
- Pods back to 1/1 containers
- Linkerd namespace removed
- Application works without service mesh

## Troubleshooting

### Issue: `linkerd check --pre` shows clock skew warning

**Symptom:** Warning about control plane clocks not synced

**Solution:** This is common in Docker-based KIND clusters. You can safely ignore it for local development. The warning doesn't prevent Linkerd from working.

### Issue: Pods stuck in ContainerCreating after injection

**Symptom:** Pods show `1/2` or `0/2` containers after injection

**Solution:**
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check sidecar logs
kubectl logs <pod-name> -c linkerd-proxy

# Common fix: restart deployment
kubectl rollout restart deployment <deployment-name>
```

### Issue: Linkerd dashboard won't open

**Symptom:** `linkerd viz dashboard` fails or shows connection refused

**Solution:**
```bash
# Check Viz extension is installed
linkerd viz check

# Use CLI instead of dashboard
linkerd viz stat deploy
linkerd viz edges deploy
linkerd viz top deploy

# Manually port-forward if needed
kubectl port-forward -n linkerd-viz svc/web 8084:8084
# Then open http://localhost:8084
```

### Issue: TrafficSplit not working

**Symptom:** Traffic not splitting between vote and vote-v2

**Solution:**
```bash
# Verify TrafficSplit resource exists
kubectl get trafficsplit

# Check both deployments have Linkerd sidecars
kubectl get pods -l app=vote -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].name}{"\n"}{end}'
# Should show both app container and linkerd-proxy

# Verify services exist
kubectl get svc vote
```

## Key Takeaways

- **Service mesh provides powerful capabilities** without application code changes: automatic mTLS, detailed metrics, traffic management, and service topology visualization
- **Linkerd is lightweight** (~50MB control plane, simple architecture) making it ideal for learning and smaller deployments compared to Istio
- **Visual observability is valuable** - seeing service communication patterns and metrics in Linkerd Viz dashboard provides insights kubectl alone cannot show
- **mTLS comes for free** - encryption and mutual authentication between services works automatically once sidecars are injected
- **Trade-offs exist** - service mesh adds sidecar overhead (2x containers), operational complexity, and learning curve
- **Decision framework matters** - for small applications (5-10 services), simpler tools (NetworkPolicy, Prometheus, Gateway API) may suffice; service mesh becomes more valuable at scale (10+ services) or with specific requirements (regulatory compliance, zero-trust, advanced traffic patterns)
- **Hands-on exploration beats theory** - installing, using, and removing a service mesh provides better understanding than reading documentation

The most important skill is knowing **when** service mesh adds value versus when simpler alternatives are sufficient.

## Further Exploration

If you want to dive deeper:

**Linkerd specific:**
- Explore [Linkerd's authorization policies](https://linkerd.io/2.16/tasks/restricting-access/) for fine-grained access control
- Try [request retries and timeouts](https://linkerd.io/2.16/tasks/configuring-retries/) with ServiceProfiles
- Experiment with [circuit breaking](https://linkerd.io/2.16/features/circuit-breaking/) for resilience

**Service mesh concepts:**
- Compare Linkerd vs Istio tradeoffs (simplicity vs features)
- Research [Service Mesh Interface (SMI)](https://smi-spec.io/) standards
- Explore mesh-specific tools like [Flagger](https://flagger.app/) for progressive delivery

**Production considerations:**
- Multi-cluster service mesh with [Linkerd multicluster](https://linkerd.io/2.16/tasks/multicluster/)
- Integration with [cert-manager](https://linkerd.io/2.16/tasks/automatically-rotating-control-plane-tls-credentials/) for certificate management
- Monitoring and alerting on mesh metrics
