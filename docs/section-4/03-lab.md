# Lab: Evaluating Service Mesh for the Voting App

## Objectives

By the end of this lab, you will be able to:

- Apply the service mesh decision framework to a real application
- Map service-to-service communication patterns and classify connections
- Evaluate service mesh benefits versus simpler alternatives
- Document a formal technology adoption decision with clear reasoning
- (Optional) Install Linkerd and observe mesh behavior in action

## Prerequisites

Before starting this lab, ensure you have:

- Completed Modules 0-3 (conceptual understanding of the Voting App architecture)
- A running KIND cluster with the base Voting App deployed
- kubectl CLI configured to communicate with your cluster
- Basic understanding of mTLS, observability, and traffic management concepts from the reading materials

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
kind-worker          Ready    <none>          10d   v1.27.3
kind-worker2         Ready    <none>          10d   v1.27.3
kind-worker3         Ready    <none>          10d   v1.27.3
```

**Step 2: Verify Example Voting App is running**

If you cleaned up from Module 3, redeploy the base Voting App:

```bash
kubectl apply -f examples/voting-app/
```

Verify all components are running:

```bash
kubectl get pods
kubectl get svc
```

Expected output: All 5 components (vote, result, worker, redis, postgres) should show STATUS: Running.

**Step 3: Prepare a working directory for your evaluation**

Create a file to document your findings:

```bash
touch service-mesh-evaluation.md
```

You'll use this file to record your answers for Tasks 1-4.

## Tasks

### Task 1: Map the Voting App Communication Patterns

The first step in evaluating service mesh is understanding how your services communicate. Let's map all service-to-service connections.

**Step 1: List all services**

```bash
kubectl get services
```

You should see: vote, result, worker, redis, postgres (plus kubernetes default service).

**Step 2: Examine service connections**

Check how services discover and connect to each other:

```bash
# Check vote service environment variables (how it finds redis)
kubectl exec deploy/vote -- env | grep -i redis

# Check worker service environment variables (how it finds redis and postgres)
kubectl exec deploy/worker -- env | grep -E 'REDIS|POSTGRES'

# Check result service environment variables (how it finds postgres)
kubectl exec deploy/result -- env | grep -i postgres
```

**Step 3: Document the communication map**

In your `service-mesh-evaluation.md` file, create a table with all service-to-service connections:

```markdown
## Task 1: Communication Map

| Source Service | Target Service | Protocol | Type | Critical? |
|----------------|----------------|----------|------|-----------|
| vote           | redis          | Redis protocol (TCP) | Synchronous write | High - votes lost if fails |
| worker         | redis          | Redis protocol (TCP) | Synchronous read | High - processing stops if fails |
| worker         | postgres       | PostgreSQL (TCP) | Synchronous write | High - results lost if fails |
| result         | postgres       | PostgreSQL (TCP) | Synchronous read | Medium - display only |
| External       | vote           | HTTP | Synchronous | High - user-facing |
| External       | result         | HTTP | Synchronous | Medium - user-facing |
```

**Step 4: Visualize the data flow**

Draw or describe the complete data flow:

```
User → vote (HTTP:30000) → redis (queue) → worker → postgres → result (HTTP:30001) → User
```

**Deliverable:** Communication map documenting 6 connections (4 internal service-to-service, 2 external).

### Task 2: Apply the Decision Framework

Now apply the service mesh decision framework from the reading materials to the Voting App. Answer each question with specific reasoning.

**Step 1: Evaluate mTLS requirements**

In your evaluation document, answer:

```markdown
## Task 2: Decision Framework Evaluation

### 1. Do we need mTLS between services?

**Answer:** [Yes / No / Nice-to-have]

**Reasoning:**
- Data sensitivity: [Is the Voting App handling sensitive data like PII, financial, or healthcare data?]
- Regulatory compliance: [Are there regulatory requirements (HIPAA, PCI-DSS, SOC 2)?]
- Multi-tenancy: [Is the cluster running multiple customer workloads needing strict isolation?]
- Network trust: [Is the cluster network trusted, or could there be eavesdropping?]

**Conclusion for Voting App:**
[Your assessment - likely "Nice-to-have but not required" since this is a development/learning environment with non-sensitive voting data, single namespace, internal cluster communication only]
```

**Step 2: Evaluate observability requirements**

```markdown
### 2. Do we need per-service observability beyond basic metrics?

**Current observability capabilities:**
```

Check what you can currently observe:

```bash
# Can you see pod resource usage? (requires Metrics Server from Module 2)
kubectl top pods

# Can you see logs from each service?
kubectl logs deploy/vote --tail=10
kubectl logs deploy/worker --tail=10

# Can you see service endpoints and connections?
kubectl get endpoints
```

Document in your evaluation:

```markdown
**What we can currently see:**
- Pod resource usage (CPU, memory) via Metrics Server
- Application logs via kubectl logs
- Basic service discovery via kubectl get endpoints

**What we CANNOT see without service mesh:**
- Per-service-pair latency (e.g., vote → redis latency separate from worker → redis latency)
- Success rate and error rate per service
- Distributed traces showing request flow across all 5 services
- Automatic golden signals (latency, traffic, errors, saturation) per service

**Answer:** [Yes / No]

**Reasoning:**
[Can you debug issues with kubectl logs and kubectl top? Or do you need detailed per-service metrics and distributed tracing? For the Voting App with 5 services, kubectl logs is usually sufficient for troubleshooting.]
```

**Step 3: Evaluate service count and complexity**

```markdown
### 3. Do we have 10+ microservices?

**Current count:** 5 services (vote, result, worker, redis, postgres)

**Complexity assessment:**
- Simple communication pattern (linear: vote → redis → worker → postgres → result)
- No complex routing logic (no canary deployments, A/B testing, or multi-path routing)
- Single namespace deployment
- All services in same cluster (no multi-cluster communication)

**Answer:** No (5 services, below the 10+ threshold where manual configuration becomes unmanageable)

**Conclusion:**
[With only 5 services and a simple communication pattern, manually managing configuration (retries, timeouts, observability) is feasible. Service mesh automation becomes valuable at 10+ services when manual configuration doesn't scale.]
```

**Step 4: Evaluate team capacity**

```markdown
### 4. Can our team manage the operational overhead?

**Service mesh operational requirements:**
- Learning new CRDs (ServiceProfile for Linkerd, VirtualService/DestinationRule for Istio)
- Debugging sidecar injection issues (pods failing to start due to init container failures)
- Troubleshooting mTLS certificate issues (services unable to communicate after mesh installation)
- Managing proxy resource limits (preventing sidecar containers from consuming excessive CPU/memory)
- Control plane upgrades and monitoring
- Training developers on mesh-specific concepts

**Current team state:**
[Assess: Are you still learning Kubernetes fundamentals? Do you have platform engineering capacity? How many people on the team?]

**Answer:** [Yes / No]

**Reasoning:**
[For a learning environment or small team still mastering Kubernetes basics, service mesh adds complexity that may distract from core learning. For a production team with platform engineers, mesh operational overhead is manageable.]
```

**Deliverable:** Completed decision framework with all 4 questions answered and reasoned.

### Task 3: Evaluate Alternatives

For each benefit a service mesh provides, identify a simpler alternative that could achieve similar results for the Voting App.

**Step 1: Create an alternatives comparison table**

In your evaluation document:

```markdown
## Task 3: Alternatives Analysis

| Benefit | With Service Mesh | Without Service Mesh (Alternative) | For Voting App (5 services) |
|---------|-------------------|-------------------------------------|----------------------------|
| **mTLS Encryption** | Automatic sidecar-based mTLS with cert rotation | NetworkPolicy (Module 5) + pod security context + optional cert-manager for manual certs | NetworkPolicy provides network isolation. For internal cluster traffic, Kubernetes network is trusted. External traffic already uses HTTPS via NodePort/Gateway API. |
| **Observability** | Automatic per-service metrics (latency, error rate, traffic) without code changes | `kubectl top pods` (Metrics Server) for resources + Prometheus exporters in application code + centralized logging | Metrics Server shows resource usage. kubectl logs shows application logs. For 5 services, manual log correlation is manageable. |
| **Retries/Timeouts** | Proxy-based automatic retries, configurable timeout policies | Application-level retry logic (client libraries like resilience4j, polly) or Gateway API retry policies | Application libraries provide retries for HTTP calls. For the Voting App, redis and postgres clients have built-in retry logic. |
| **Authorization** | Service-level policies ("Only vote service can write to redis") | Kubernetes RBAC + NetworkPolicies (network-level isolation, not service-level) | NetworkPolicy can restrict "only pods with label app=vote can connect to redis port 6379". Less granular than service mesh but sufficient for simple cases. |
| **Traffic Management** | Canary deployments, traffic splitting, A/B testing | Gateway API weighted routing (HTTPRoute with multiple backendRefs and weights) | Gateway API supports traffic splitting at ingress level. For internal service-to-service traffic, Kubernetes Service provides round-robin load balancing. |
| **Circuit Breaking** | Automatic circuit breaking when service is unhealthy | Application-level circuit breaker libraries or health check based scaling (HPA) | Application libraries like Hystrix provide circuit breaking. HPA can scale down unhealthy pods. |
```

**Step 2: Assess tradeoffs**

For each alternative, note the tradeoffs:

```markdown
### Tradeoffs Analysis

**Using Simpler Alternatives (No Service Mesh):**

Pros:
- No sidecar overhead (no additional 50-200MB memory per pod, no proxy CPU usage)
- Simpler debugging (fewer moving parts, no proxy to troubleshoot)
- Lower learning curve (no new CRDs, no mesh-specific concepts)
- Application-level control (can customize retry logic, timeout behavior per service)

Cons:
- Requires application code changes (adding /metrics endpoints, retry logic, circuit breakers)
- Manual configuration doesn't scale (at 50+ services, configuring retries/timeouts individually is painful)
- No automatic mTLS (must manually manage certificates or trust network)
- Less visibility into service-to-service communication (no automatic golden signals per service pair)

**For the Voting App:**
[Your assessment - likely simpler alternatives are sufficient for 5 services, revisit at scale]
```

**Deliverable:** Alternatives comparison table with tradeoffs documented.

### Task 4: Write Your Decision Document

Based on Tasks 1-3, create a formal decision document. This is the primary deliverable of this lab.

**Step 1: Use the decision template**

In your `service-mesh-evaluation.md` file, add:

```markdown
## Task 4: Formal Service Mesh Adoption Decision

**Decision:** [ADOPT / DEFER / NEVER] Service Mesh for the Example Voting App

**Date:** [Today's date]

**Decision Maker:** [Your name/team]

### Context

[1-2 sentences about the application]

The Example Voting App is a 5-service microservices application with a simple linear communication pattern (vote → redis → worker → postgres → result). It is deployed in a development/learning environment with no regulatory compliance requirements and no multi-tenancy.

### Decision Criteria

[List the key factors that influenced your decision]

1. Service count: 5 services (below the 10+ threshold where mesh automation provides value)
2. Communication complexity: Simple linear pattern with synchronous HTTP and queue-based processing
3. Security requirements: No regulatory compliance (HIPAA, PCI-DSS), single-tenant cluster
4. Team capacity: [Your assessment - learning environment or small team]
5. Observability needs: [Your assessment - kubectl logs sufficient vs need distributed tracing]

### Evaluation Summary

[Summarize findings from Tasks 1-3]

**Communication Analysis (Task 1):**
- 4 internal service-to-service connections
- 2 external HTTP connections
- All connections are critical for application functionality

**Decision Framework (Task 2):**
- mTLS: Nice-to-have but not required (no sensitive data, trusted network)
- Observability: Current tools (Metrics Server, kubectl logs) sufficient for 5 services
- Service count: Below 10+ threshold
- Team capacity: [Your assessment]

**Alternatives Analysis (Task 3):**
- NetworkPolicy provides network isolation (Module 5 covers this)
- Metrics Server + Prometheus provides observability without mesh overhead
- Application-level or Gateway API retry policies handle failures
- Simpler tools cover 80% of use cases without mesh complexity

### Decision

[ADOPT / DEFER / NEVER] - [Clear reasoning]

**Example DEFER Decision:**

**DEFER** service mesh adoption for the Example Voting App.

**Reasoning:**

The Voting App currently has 5 services with a simple communication pattern. NetworkPolicy (Module 5) will provide network-level isolation. Metrics Server provides resource observability. kubectl logs provides sufficient application debugging for this scale.

Service mesh would add:
- 50-200MB memory overhead per pod (5 services × 2-3 replicas = 10-15 sidecars)
- Additional complexity in troubleshooting (proxy injection, mTLS cert issues)
- Learning curve for new CRDs and mesh concepts

These costs outweigh the benefits at the current scale. Simpler alternatives cover our needs.

### Revisit When

[Conditions that would change this decision]

Revisit service mesh adoption when any of these conditions are met:

1. **Service count grows to 10+ microservices** - Manual configuration no longer scales
2. **Regulatory compliance requirements emerge** - Need provable mTLS enforcement
3. **Multi-tenancy requirements** - Need strict service-level isolation guarantees
4. **Debugging service communication becomes painful** - Need automatic distributed tracing
5. **Team gains platform engineering capacity** - Can absorb operational overhead

### Next Steps

[Immediate actions based on this decision]

1. Implement NetworkPolicies in Module 5 for network isolation
2. Continue using Metrics Server for resource observability
3. Add Prometheus exporters to application code if deeper observability is needed
4. Revisit this decision in 6 months or when service count doubles
```

**Deliverable:** Formal decision document following the template with clear reasoning.

### Task 5 (Challenge - Optional): Hands-On with Linkerd

If you want to see service mesh behavior in action, try this optional hands-on challenge. This adds ~20 minutes to the lab.

:::note[Optional Challenge]
This challenge is purely exploratory. The evaluation tasks (1-4) are the core learning. Don't worry if you encounter installation issues - service mesh hands-on experience comes with more practice.
:::

**Step 1: Install Linkerd CLI**

```bash
# Install Linkerd CLI
curl -sL https://linkerd.io/install | sh

# Add to PATH
export PATH=$PATH:$HOME/.linkerd2/bin

# Verify installation
linkerd version
```

Expected output:

```bash
Client version: stable-2.15.x
Server version: unavailable
```

**Step 2: Validate cluster compatibility**

```bash
linkerd check --pre
```

Expected output: All checks pass (green checkmarks). If any checks fail, note the issue - common failures include:

- Kubernetes version too old (need 1.21+)
- Insufficient cluster resources
- Clock skew issues in KIND cluster

**Step 3: Install Linkerd control plane**

```bash
# Install Linkerd CRDs
linkerd install --crds | kubectl apply -f -

# Install Linkerd control plane
linkerd install | kubectl apply -f -

# Wait for Linkerd to be ready (may take 2-3 minutes)
linkerd check
```

Expected output: All checks pass. The control plane includes: linkerd-destination, linkerd-identity, linkerd-proxy-injector.

**Step 4: Inject Linkerd sidecars into the Voting App**

```bash
# Get current Voting App deployments
kubectl get deploy -o yaml > voting-app-backup.yaml

# Inject Linkerd sidecars
kubectl get deploy -o yaml | linkerd inject - | kubectl apply -f -

# Verify sidecars are injected (each pod should now have 2 containers)
kubectl get pods
```

Expected output: Each pod now shows `2/2` containers (application + linkerd-proxy sidecar).

**Step 5: Observe service mesh behavior**

```bash
# View service topology (which services are communicating)
linkerd viz install | kubectl apply -f -
linkerd viz check

# Open Linkerd dashboard (if available)
linkerd viz dashboard &

# OR use CLI to view metrics
linkerd viz stat deploy

# See mTLS in action (edges show which services are communicating securely)
linkerd viz edges deploy

# Check per-service success rate, request rate, latency
linkerd viz top deploy
```

**Step 6: Generate traffic and observe metrics**

```bash
# Port-forward vote service
kubectl port-forward svc/vote 8080:80 &

# Generate some votes
for i in {1..20}; do
  curl -s -X POST http://localhost:8080 -d "vote=a"
  sleep 1
done

# Check metrics again
linkerd viz stat deploy
```

**Step 7: Reflect on the experience**

In your evaluation document, add:

```markdown
## Challenge: Linkerd Hands-On Reflection

**What I observed:**
- [Did you see mTLS working? What did `linkerd viz edges` show?]
- [What metrics did you see that kubectl couldn't show? Per-service request rate? Success rate? Latency percentiles?]
- [Did the Linkerd dashboard provide useful visualizations?]

**Was this worth the setup?**
- Installation time: [How long did it take?]
- Complexity: [Did you encounter issues? How difficult was troubleshooting?]
- Value: [What did you learn that kubectl alone couldn't show you?]

**For the Voting App specifically:**
- [Did the mesh reveal any insights about service communication?]
- [Would you change your ADOPT/DEFER decision based on this hands-on experience?]
```

**Step 8: Clean up Linkerd**

```bash
# Remove Linkerd sidecars from Voting App
kubectl get deploy -o yaml | linkerd uninject - | kubectl apply -f -

# Uninstall Linkerd control plane
linkerd viz uninstall | kubectl delete -f -
linkerd uninstall | kubectl delete -f -

# Verify removal
kubectl get pods
```

Expected output: Pods should be back to `1/1` containers (application only, no sidecar).

## Verification

Confirm your lab work is complete:

**1. Communication map exists**

Check your `service-mesh-evaluation.md` file contains Task 1 with a table documenting all 6 connections (4 internal service-to-service + 2 external).

**2. Decision framework answered**

Check your evaluation document contains Task 2 with all 4 decision framework questions answered with specific reasoning for the Voting App.

**3. Alternatives comparison exists**

Check your evaluation document contains Task 3 with a table comparing service mesh benefits versus simpler alternatives, with tradeoffs documented.

**4. Decision document completed**

Check your evaluation document contains Task 4 with a formal decision (ADOPT/DEFER/NEVER) using the provided template, including:
- Context
- Decision criteria
- Evaluation summary
- Decision with reasoning
- Revisit conditions
- Next steps

**5. (Optional) Linkerd reflection**

If you completed the challenge, check your evaluation document contains reflections on the hands-on experience.

**6. Voting App still functional**

Verify the Voting App still works (if you did the Linkerd challenge, verify cleanup worked):

```bash
kubectl get pods
# All pods should show 1/1 containers (no sidecars) and STATUS: Running

kubectl port-forward svc/vote 8080:80 &
curl http://localhost:8080
# Should return HTML for voting page
```

## Cleanup

This module is evaluation-focused, so there's minimal cleanup needed:

```bash
# If you completed the Linkerd challenge, verify Linkerd is removed
kubectl get pods -n linkerd
# Should return "No resources found in linkerd namespace" or namespace not found

# Keep the Voting App running for future modules
# Your evaluation document is a standalone artifact - keep it for reference
```

**Note:** Keep your KIND cluster and Voting App running. Future modules may reference your decision document or build on the deployment.

## Troubleshooting

### Issue: Linkerd Pre-Check Fails (Clock Skew)

**Symptom:** `linkerd check --pre` shows error: "control plane clocks are not synced"

**Cause:** KIND cluster nodes have clock drift (common in Docker-based clusters)

**Solution:**

This is a known KIND limitation. You can ignore this warning for a development environment, or restart your KIND cluster:

```bash
kind delete cluster
kind create cluster --config examples/kind-cluster.yaml
# Redeploy Voting App
kubectl apply -f examples/voting-app/
```

### Issue: Linkerd Dashboard Not Accessible

**Symptom:** `linkerd viz dashboard` fails to open browser or shows connection refused

**Cause:** Port forwarding issues or viz extension not fully deployed

**Solution:**

Use CLI alternatives instead of the dashboard:

```bash
# Check viz extension status
linkerd viz check

# Use CLI commands instead of dashboard
linkerd viz stat deploy        # Service statistics
linkerd viz edges deploy       # Service communication graph
linkerd viz top deploy          # Live request metrics
linkerd viz tap deploy/vote    # Live request stream (like tcpdump)
```

### Issue: Voting App Pods Fail After Sidecar Injection

**Symptom:** After `linkerd inject`, worker pods show CrashLoopBackOff or vote/result services can't connect to redis/postgres

**Cause:** Linkerd proxy initialization may interfere with application startup or connection logic

**Solution:**

Check pod events and logs:

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> -c linkerd-proxy
kubectl logs <pod-name> -c <app-container-name>
```

Common fix: Restart the affected pods:

```bash
kubectl rollout restart deploy/worker
kubectl rollout restart deploy/vote
```

If issues persist, uninject and proceed without the hands-on challenge:

```bash
kubectl get deploy -o yaml | linkerd uninject - | kubectl apply -f -
```

## Key Takeaways

- Service mesh is a powerful tool, but it's not always necessary - decision-making skills matter more than implementation skills
- The decision framework (mTLS needs, observability needs, service count, team capacity) helps evaluate whether mesh benefits outweigh complexity costs
- For small applications (5-10 services), simpler alternatives (NetworkPolicy, Prometheus, Gateway API) often cover 80% of use cases without mesh overhead
- Service mesh becomes valuable at scale (10+ services) or when you have specific requirements (regulatory compliance, multi-tenancy) that simpler tools can't meet
- The Voting App (5 services, simple pattern, development stage) likely doesn't need service mesh yet - revisit when scaling to production or adding more services

The most important skill is knowing WHEN to adopt infrastructure tools, not just HOW to use them.
