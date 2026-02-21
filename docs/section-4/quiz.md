---
draft: true
---

# Quiz: Module 4 - Service Mesh

**Module:** 4
**Topic:** Service Mesh
**Question Count:** 12

:::note[Format Purpose]
This quiz format is designed for manual conversion to TutorLMS spreadsheet import. Each question includes all fields needed for TutorLMS: question type, question text, options, correct answer, and explanation.
:::

---

## Question 1

**Question Type:** Multiple Choice

**Question:**
What is the primary purpose of the sidecar proxy pattern in a service mesh?

**Options:**

A) To replace the application container and run the service mesh control plane
B) To intercept all network traffic to and from the application container, enforcing policies and collecting metrics
C) To provide a backup container in case the application container fails
D) To run health checks on the application container

**Correct Answer:** B

**Explanation:**
The sidecar proxy pattern deploys a lightweight proxy container alongside every application container in a pod. The proxy intercepts all inbound and outbound network traffic, allowing it to enforce mTLS policies, collect observability metrics, manage retries and timeouts, and implement authorization rules - all without requiring changes to the application code. The application container continues to run normally, making standard HTTP or gRPC requests, while the sidecar handles the service mesh functionality transparently.

---

## Question 2

**Question Type:** Scenario

**Context:**
Your team is running a microservices application with 8 services in a Kubernetes cluster. You're considering adopting a service mesh to get automatic mTLS encryption between services. However, your team is small (3 developers) and still learning Kubernetes basics like Deployments, Services, and ConfigMaps.

**Question:**
Based on the service mesh decision framework, what would be the BEST approach?

**Options:**

A) Adopt Istio immediately because it has the most features and largest community
B) Adopt Linkerd because it's lightweight and easier to learn than Istio
C) Defer service mesh adoption and use NetworkPolicies + cert-manager for network security instead
D) Build a custom solution for mTLS using application-level encryption libraries

**Correct Answer:** C

**Explanation:**
While you're close to the 10+ services threshold, the team capacity factor is critical here. A small team still learning Kubernetes basics would be overwhelmed by service mesh operational overhead (debugging sidecar injection, managing mTLS certificates, learning new CRDs). NetworkPolicies provide network-level isolation without the complexity, and cert-manager can handle certificate management if mTLS is truly required. Revisit service mesh when the team has mastered Kubernetes fundamentals or when you scale past 10+ services. Option B (Linkerd) would be better than A (Istio) if you did adopt a mesh, but deferring is the best choice given team capacity constraints.

---

## Question 3

**Question Type:** Multiple Choice

**Question:**
In the Example Voting App's communication pattern (vote → redis → worker → postgres → result), which connection would benefit MOST from service mesh observability features?

**Options:**

A) External user → vote service (HTTP)
B) vote service → redis (synchronous write)
C) worker → postgres (synchronous write)
D) All connections equally benefit from mesh observability

**Correct Answer:** D

**Explanation:**
Service mesh provides observability for ALL service-to-service connections, which is valuable for understanding the complete request flow. You can see latency at each hop (vote → redis latency separate from worker → postgres latency), success rates per connection, and distributed traces showing the entire path from user request to result display. While you might debug individual connections differently (checking redis queue length vs postgres query performance), mesh observability's strength is seeing the WHOLE system, not just optimizing one connection. That said, for the Voting App with only 5 services, kubectl logs and Metrics Server might be sufficient without the mesh overhead.

---

## Question 4

**Question Type:** True/False

**Question:**
Service mesh is required to implement retry logic and circuit breaking patterns in microservices applications.

**Correct Answer:** False

**Explanation:**
Service mesh provides automatic, configuration-driven retry logic and circuit breaking through sidecar proxies, but it is NOT required. Applications can implement these patterns using libraries like Resilience4j (Java), Polly (.NET), or built-in retry mechanisms in HTTP client libraries. Gateway API also supports retry policies at the ingress level. The advantage of service mesh is that it standardizes these patterns across all services without requiring application code changes, but simpler alternatives work well for smaller deployments. Choose based on your scale and team capacity, not on the assumption that mesh is the only way to achieve resilience patterns.

---

## Question 5

**Question Type:** Scenario

**Context:**
You're evaluating whether to adopt a service mesh for a production e-commerce platform with 35 microservices. The platform handles credit card transactions and must comply with PCI-DSS requirements, which mandate encryption of data in transit. Your team has 2 dedicated platform engineers and 15 application developers.

**Question:**
According to the service mesh decision framework, which decision factors MOST strongly support adopting a service mesh?

**Options:**

A) Service count (35 services) and observability needs
B) Regulatory compliance (PCI-DSS requiring mTLS) and team capacity (platform engineers available)
C) Performance optimization and cost reduction
D) Developer convenience and faster deployment cycles

**Correct Answer:** B

**Explanation:**
This scenario hits two strong signals for service mesh adoption: (1) Regulatory compliance requiring provable mTLS encryption between all services - service mesh automates this with certificate rotation and enforcement, providing audit trails that simpler tools can't match; (2) Team capacity with dedicated platform engineers who can manage the operational overhead. While service count (35 services) also supports adoption, the compliance requirement is the strongest factor - you MUST have mTLS, and manual certificate management at this scale is painful. Service mesh doesn't primarily optimize performance (it adds latency) or reduce costs (it adds resource overhead), so C is incorrect. Option D describes benefits but isn't the primary driver for this specific scenario.

---

## Question 6

**Question Type:** Multiple Choice

**Question:**
What is the main difference between Istio and Linkerd in terms of resource overhead?

**Options:**

A) Istio and Linkerd have identical resource overhead since both use Envoy proxy
B) Linkerd uses a custom Rust-based proxy that adds 40-400% less latency than Istio's Envoy proxy
C) Istio is lighter weight because it has fewer features
D) Linkerd requires more memory but less CPU than Istio

**Correct Answer:** B

**Explanation:**
Linkerd uses a purpose-built Rust-based proxy (linkerd2-proxy) that is significantly smaller and faster than Envoy, which Istio uses. Benchmarks show Linkerd adds 40-400% less latency compared to Istio. This makes Linkerd particularly well-suited for intermediate-complexity applications where you want core service mesh features (mTLS, observability, traffic management) without the resource overhead of Istio's more comprehensive feature set. Istio's Envoy proxy is written in C++ and provides more configuration options and advanced features, but at the cost of higher CPU and memory usage per sidecar.

---

## Question 7

**Question Type:** Multiple Choice

**Question:**
In the service mesh decision framework, what is the recommended service count threshold where mesh automation starts providing significant value over manual configuration?

**Options:**

A) 3+ services
B) 5+ services
C) 10+ services
D) 50+ services

**Correct Answer:** C

**Explanation:**
The decision framework uses 10+ services as the threshold where manual configuration of retries, timeouts, mTLS, and observability becomes painful enough that service mesh automation provides clear value. With 3-5 services (like the Example Voting App), manually configuring each service is manageable. At 10+ services, the number of service-to-service connections grows significantly (N² connections in a fully-meshed architecture), making centralized mesh configuration valuable. By 50+ services, service mesh is almost always justified if you have the team capacity. However, service count is just one factor - regulatory requirements or specific observability needs can justify mesh adoption even below 10 services.

---

## Question 8

**Question Type:** Scenario

**Context:**
After installing Linkerd on your KIND cluster and injecting sidecars into the Voting App, you notice that each pod now shows "2/2" containers instead of "1/1". The worker service starts crashing with connection timeout errors when trying to connect to postgres.

**Question:**
What is the MOST likely cause, and what should you check first?

**Options:**

A) The postgres database is overloaded - scale up postgres replicas
B) Linkerd sidecar proxy initialization is interfering with worker startup sequence - check linkerd-proxy container logs
C) NetworkPolicies are blocking Linkerd mesh traffic - delete all NetworkPolicies
D) The worker deployment needs higher resource limits - increase CPU and memory

**Correct Answer:** B

**Explanation:**
When you inject Linkerd sidecars, each pod gets an additional linkerd-proxy container (hence "2/2"). The most common issue is that the proxy initialization (linkerd-init init container) or proxy startup timing interferes with the application's connection logic. The worker service might try to connect to postgres before the proxy is ready, causing timeouts. Check logs with `kubectl logs <pod-name> -c linkerd-proxy` and `kubectl logs <pod-name> -c worker`. Common fix: restart the deployment with `kubectl rollout restart deploy/worker`. Option A is unlikely since the issue appeared immediately after mesh injection. Option C is wrong because you shouldn't have NetworkPolicies yet (Module 5). Option D addresses symptoms, not the root cause.

---

## Question 9

**Question Type:** True/False

**Question:**
For the Example Voting App with 5 services deployed in a single namespace on a trusted Kubernetes cluster network, service mesh is the simplest way to achieve network security.

**Correct Answer:** False

**Explanation:**
Service mesh is powerful but NOT the simplest way to achieve network security for a small application like the Voting App. NetworkPolicies (covered in Module 5) provide network-level isolation with far less complexity - no sidecars to manage, no mTLS certificates to debug, no proxy overhead. For a trusted cluster network with 5 services, NetworkPolicies can restrict "only vote pods can connect to redis port 6379" without the operational overhead of a service mesh. Service mesh becomes the better choice when you need service-level authorization (not just network-level), automatic mTLS for regulatory compliance, or when you scale past 10+ services. "Simplest" doesn't mean "most powerful" - choose tools based on actual needs.

---

## Question 10

**Question Type:** Multiple Choice

**Question:**
Which of the following is NOT automatically provided by a service mesh?

**Options:**

A) mTLS encryption between services with automatic certificate rotation
B) Per-service request rate, success rate, and latency metrics
C) Automatic horizontal pod autoscaling based on request volume
D) Retry logic and circuit breaking for failed service calls

**Correct Answer:** C

**Explanation:**
Service mesh does NOT provide horizontal pod autoscaling - that's the job of HorizontalPodAutoscaler (HPA) from Module 2 or KEDA for event-driven autoscaling. Service mesh provides observability (option B - per-service metrics), security (option A - automatic mTLS), and resilience (option D - retries and circuit breaking), but scaling decisions remain separate. However, service mesh metrics can be used as INPUT to HPA - for example, you could create an HPA that scales based on request rate metrics collected by the service mesh. But the mesh itself doesn't do the scaling. This is an important distinction: mesh observes and manages traffic, while HPA/KEDA scales workloads.

---

## Question 11

**Question Type:** Scenario

**Context:**
Your evaluation of the Voting App using the decision framework led to a "DEFER" decision - service mesh is not needed yet. Six months later, you've added 8 new microservices (13 total), deployed to a production environment with sensitive customer data, and your team now includes a dedicated platform engineer.

**Question:**
Which revisit condition from the decision framework has been met, and what should you do?

**Options:**

A) Only service count increased - still defer service mesh until you hit 50+ services
B) Multiple conditions met (service count 10+, sensitive data, team capacity) - re-evaluate with strong signal for adoption
C) Only team capacity improved - adopt Istio immediately without re-evaluation
D) Conditions haven't changed enough - continue deferring for another year

**Correct Answer:** B

**Explanation:**
This scenario hits THREE of the revisit conditions: (1) Service count exceeded 10+ threshold (13 services), (2) Sensitive customer data creates security requirements, (3) Platform engineer provides operational capacity. These are strong signals to re-evaluate the decision. You should go through the decision framework again with the new context - the answer might be "ADOPT Linkerd" (lightweight, sufficient for 13 services) or "ADOPT with conditions" (implement NetworkPolicies first, then add mesh if observability gaps persist). Option C (adopt Istio immediately) skips the evaluation process. Option A underestimates the impact of crossing multiple thresholds simultaneously. Option D ignores significant changes in requirements and capacity.

---

## Question 12

**Question Type:** Multiple Choice

**Question:**
In the context of the service mesh decision framework, what does "operational overhead" primarily refer to?

**Options:**

A) The monthly cloud infrastructure costs of running service mesh control plane components
B) The additional CPU and memory consumed by sidecar proxy containers
C) The team effort required to learn, configure, debug, and maintain the service mesh over time
D) The network latency added by routing traffic through proxy sidecars

**Correct Answer:** C

**Explanation:**
"Operational overhead" in the decision framework primarily refers to the ongoing team effort and expertise required to successfully run a service mesh: learning new CRDs and concepts, debugging sidecar injection failures, troubleshooting mTLS certificate issues, managing control plane upgrades, training developers on mesh-specific patterns, and monitoring proxy performance. While options B (resource overhead) and D (latency overhead) are real costs, they're typically manageable with proper resource limits and proxy tuning. The bigger challenge is the human cost - small teams without platform engineering capacity often struggle with the complexity, leading to abandoned mesh deployments or constant firefighting. This is why the decision framework includes "Can your team manage the operational overhead?" as a critical gate - the best technology is useless if your team can't operate it successfully.

---
