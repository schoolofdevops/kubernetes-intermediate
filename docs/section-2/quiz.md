# Quiz: Module 2 - Autoscaling

**Module:** 2
**Topic:** Autoscaling
**Question Count:** 13

:::note[Format Purpose]
This quiz format is designed for manual conversion to TutorLMS spreadsheet import. Each question includes all fields needed for TutorLMS: question type, question text, options, correct answer, and explanation.
:::

---

## Question 1: HPA Utilization Calculation

**Question Type:** Multiple Choice

**Question:**
Your vote Deployment has pods with resource requests of `cpu: 100m` and current CPU usage of 80m. What is the CPU utilization percentage that HPA uses for scaling decisions?

**Options:**

A) 8% (80m / 1000m)
B) 80% (80m / 100m)
C) 125% (100m / 80m)
D) 20% (80m / 400m, assuming 4 CPU cores)

**Correct Answer:** B

**Explanation:**
HPA calculates utilization as (current usage / resource request) × 100. In this case, 80m CPU usage divided by 100m CPU request equals 80% utilization. The total CPU capacity of the node is irrelevant to HPA's calculation. This is why resource requests are mandatory for HPA - without a request, there is no denominator for the utilization percentage.

---

## Question 2: Metrics Server Requirement

**Question Type:** True/False

**Question:**
Metrics Server is automatically installed in all Kubernetes distributions, including KIND, so no additional installation is required for HPA to function.

**Correct Answer:** False

**Explanation:**
Metrics Server is NOT installed by default in most Kubernetes distributions, including KIND. KIND is a minimal Kubernetes distribution for local development and omits optional components like Metrics Server to keep the installation lightweight. You must install Metrics Server manually for HPA to work. Without Metrics Server, HPA will show `<unknown>` for targets and will not scale pods. Always verify Metrics Server is running with `kubectl top nodes` before creating HPA resources.

---

## Question 3: Stabilization Window Purpose

**Question Type:** Multiple Choice

**Question:**
What is the primary purpose of the HPA stabilization window configured with `scaleDown.stabilizationWindowSeconds: 300`?

**Options:**

A) Delay all scaling decisions by 5 minutes to reduce API server load
B) Prevent rapid scale-down during temporary traffic dips by waiting 5 minutes before removing replicas
C) Ensure pods have 5 minutes to warm up before receiving traffic
D) Limit the rate at which HPA queries the Metrics API to once every 5 minutes

**Correct Answer:** B

**Explanation:**
The stabilization window prevents flapping (rapid scale up and down cycles). A scaleDown stabilization window of 300 seconds means HPA will wait 5 minutes before scaling down, even if the current utilization is below the target. This prevents removing pods during temporary traffic dips. Scale-up typically has a stabilization window of 0 (immediate) because response times matter, while scale-down uses a longer window to ensure stability. This asymmetric approach keeps the app responsive while minimizing resource waste.

---

## Question 4: MinReplicas vs MaxReplicas

**Question Type:** Multiple Choice

**Question:**
You configure an HPA with `minReplicas: 2` and `maxReplicas: 10`. Current CPU utilization is 5% (well below the 70% target). How many replicas will HPA maintain?

**Options:**

A) 0 replicas (HPA scales to zero to save resources)
B) 1 replica (HPA uses minimum resources when utilization is low)
C) 2 replicas (HPA respects minReplicas constraint)
D) 10 replicas (HPA maintains maxReplicas for availability)

**Correct Answer:** C

**Explanation:**
HPA always respects the minReplicas constraint, even when utilization is very low. In this case, HPA will maintain 2 replicas despite the 5% CPU utilization. This prevents scaling to zero, which would make the service unavailable. If you need scale-to-zero behavior, use KEDA instead. The maxReplicas value (10) is only relevant when utilization is high - it prevents runaway scaling that could overwhelm the cluster.

---

## Question 5: HPA/VPA Conflict Scenario

**Question Type:** Scenario

**Context:**
You apply both HPA (targeting 70% CPU utilization) and VPA (in Auto mode) to the worker Deployment. The worker pod initially requests 100m CPU and uses 80m CPU. HPA calculates 80% utilization and adds replicas. Then VPA observes the usage pattern and reduces the CPU request to 80m to optimize resources.

**Question:**
What happens next, and why is this problematic?

**Options:**

A) HPA and VPA work together seamlessly - VPA right-sizes pods while HPA scales replicas
B) HPA recalculates utilization as 80m / 80m = 100%, sees it exceeds the target, and adds more replicas, causing thrashing
C) VPA overrides HPA decisions, so only VPA's Auto mode adjustments take effect
D) Kubernetes detects the conflict and disables VPA automatically to prevent issues

**Correct Answer:** B

**Explanation:**
When VPA changes the request from 100m to 80m, HPA's utilization calculation changes from 80% (80m / 100m) to 100% (80m / 80m), even though actual usage is constant. HPA sees 100% > 70% target and scales up. This triggers a thrashing cycle where VPA adjusts requests and HPA responds by changing replicas. The solution is to NEVER run HPA and VPA together on the same Deployment for the same resource. Use VPA in Off mode (recommendation only), apply requests manually, then use HPA for scaling.

---

## Question 6: KEDA vs HPA Use Cases

**Question Type:** Multiple Choice

**Question:**
Which autoscaling approach is MOST appropriate for the worker service in the Voting App, which consumes votes from a Redis queue?

**Options:**

A) HPA with CPU utilization target, because workers are CPU-intensive
B) HPA with memory utilization target, because queue data is stored in memory
C) KEDA with Redis list length scaler, because scaling should match actual work in the queue
D) VPA in Auto mode, because workers need dynamic resource adjustments

**Correct Answer:** C

**Explanation:**
KEDA is the best choice for queue consumers like the worker. CPU usage is a poor proxy for actual work - if the queue has 10,000 votes but the worker is idle waiting for Redis, HPA will not scale up. KEDA scales based on the actual Redis queue length, adding workers when the queue grows and removing them when the queue is empty. KEDA can even scale to zero when there is no work. HPA with CPU or memory targets would miss this queue-based scaling opportunity. VPA adjusts resource sizing, not replica count, so it does not help with queue processing capacity.

---

## Question 7: Resource Requests for HPA

**Question Type:** True/False

**Question:**
HPA can calculate CPU utilization percentage for pods that do not have resource requests defined, using the node's total CPU capacity as the baseline.

**Correct Answer:** False

**Explanation:**
HPA absolutely requires resource requests to calculate utilization percentage. The formula is (current usage / resource request) × 100. Without a request, there is no denominator, and the utilization percentage is undefined. If you create an HPA targeting a Deployment without resource requests, `kubectl get hpa` will show `<unknown>` for targets, and scaling will never occur. The node's total CPU capacity is irrelevant to HPA's calculation. Always set resource requests on pods using HPA.

---

## Question 8: Scale-Down Delay

**Question Type:** Multiple Choice

**Question:**
Your HPA has a scaleDown stabilization window of 300 seconds. After you delete the load generator, CPU utilization drops from 85% to 10% immediately. When will HPA start removing replicas?

**Options:**

A) Immediately, because utilization is well below the target
B) After 15 seconds (one HPA evaluation cycle)
C) After 300 seconds (5 minutes), respecting the stabilization window
D) Never, because HPA only scales up, not down

**Correct Answer:** C

**Explanation:**
The scaleDown stabilization window of 300 seconds means HPA will wait 5 minutes before scaling down, even when utilization drops immediately. This prevents rapid scale-down during temporary traffic dips. HPA evaluates metrics every 15 seconds, but the stabilization window delays the actual scaling action. After 5 minutes of consistently low utilization, HPA will start removing replicas gradually (respecting the scaleDown policies like "max 50% of pods at once"). This asymmetric scaling (fast up, slow down) is a best practice for production stability.

---

## Question 9: autoscaling/v2 API Features

**Question Type:** Multiple Choice

**Question:**
What is a key advantage of the autoscaling/v2 API over the older autoscaling/v1 API?

**Options:**

A) v2 supports only CPU metrics, making it simpler and more predictable
B) v2 supports CPU, memory, custom metrics, and external metrics, plus behavior configuration for scaling policies
C) v2 automatically installs Metrics Server when you create an HPA
D) v2 scales faster because it queries metrics every 5 seconds instead of 15 seconds

**Correct Answer:** B

**Explanation:**
The autoscaling/v2 API introduced support for multiple metric types beyond just CPU: memory, custom metrics from your application (e.g., request queue length, cache hit rate), and external metrics from outside the cluster (e.g., cloud provider queue length, CDN traffic). It also added the behavior section, which gives fine-grained control over scaling policies, stabilization windows, and scale-up/down rates. The v1 API only supported CPU metrics and had no behavior configuration. Always use autoscaling/v2 for new HPAs.

---

## Question 10: Load Testing Impact Scenario

**Question Type:** Scenario

**Context:**
Your vote HPA has minReplicas: 2, maxReplicas: 8, and target CPU: 50%. Currently, 2 vote pods are running at 20% CPU utilization. You deploy a load generator that drives CPU utilization to 90% on each pod.

**Question:**
What replica count will HPA likely stabilize at, assuming CPU usage remains constant?

**Options:**

A) 2 replicas (minReplicas prevents scaling down)
B) 4 replicas (doubling capacity brings 90% down to 45%, below target)
C) 6 replicas (HPA adds replicas conservatively)
D) 8 replicas (maxReplicas to ensure maximum availability)

**Correct Answer:** B

**Explanation:**
HPA calculates desired replicas as: current replicas × (current utilization / target utilization). In this case: 2 × (90% / 50%) = 3.6, rounded up to 4 replicas. When 4 replicas are running, the total load distributes across them, reducing per-pod CPU to approximately 45% (90% / 2 = original load, then distributed across 4 pods instead of 2 = 45%). This is below the 50% target, so HPA stabilizes at 4 replicas. HPA does not jump to maxReplicas unless load continues increasing. The scaling policies (e.g., "add max 2 pods per 30s") may cause HPA to reach 4 replicas gradually rather than all at once.

---

## Question 11: VPA Modes

**Question Type:** Multiple Choice

**Question:**
Which VPA mode is safest for production workloads, allowing you to review recommendations before applying changes?

**Options:**

A) Auto mode, because it automatically adjusts resources without manual intervention
B) Initial mode, because it only sets resources when pods are first created
C) Off mode, because it generates recommendations without modifying pods
D) Recommendation mode, which is an alias for Auto mode

**Correct Answer:** C

**Explanation:**
VPA Off mode is the safest for production. It analyzes pod resource usage and generates recommendations without actually modifying pods. You can review the recommendations with `kubectl describe vpa <name>`, then manually update your Deployment with the recommended requests. Auto mode modifies running pods by evicting and recreating them, which causes downtime - risky for production. Initial mode sets resources only when pods are first created, but does not adjust running pods. There is no "Recommendation mode" - Off mode provides recommendations.

---

## Question 12: KEDA ScaledObject

**Question Type:** Multiple Choice

**Question:**
What does KEDA do when you create a ScaledObject targeting a Deployment?

**Options:**

A) KEDA replaces the Deployment with a custom resource that supports event-driven scaling
B) KEDA creates and manages an HPA automatically, translating event metrics into HPA targets
C) KEDA directly modifies the Deployment's replica count without using HPA
D) KEDA installs custom controllers in your application pods to monitor events

**Correct Answer:** B

**Explanation:**
KEDA creates and manages an HPA automatically when you create a ScaledObject. KEDA monitors the event source (e.g., Redis queue length, Kafka topic lag, cron schedule) and translates the event metric into an HPA target. You can verify this with `kubectl get hpa` - you will see an HPA named `keda-hpa-<scaledobject-name>` created by KEDA. KEDA does not replace Deployments or modify replica counts directly. It extends HPA's capabilities by adding 65+ event source scalers. This means KEDA complements HPA rather than replacing it.

---

## Question 13: Metrics API Availability Debugging

**Question Type:** Scenario

**Context:**
You create an HPA for the result Deployment, but `kubectl get hpa` shows `<unknown>/50%` in the TARGETS column. The result Deployment has resource requests set correctly (cpu: 100m, memory: 128Mi). You run `kubectl top nodes` and get an error: "error: Metrics API not available."

**Question:**
What is the most likely cause, and what should you do first?

**Options:**

A) HPA configuration is incorrect - check minReplicas and maxReplicas values
B) Metrics Server is not installed or not running - verify Metrics Server deployment and install if needed
C) Resource limits are too high - reduce CPU limits in the Deployment
D) The result service does not generate enough CPU load - deploy a load generator first

**Correct Answer:** B

**Explanation:**
The error "Metrics API not available" indicates Metrics Server is missing or not running. HPA absolutely requires the Metrics API to function. Verify with `kubectl get deployment -n kube-system metrics-server`. If Metrics Server is not present, install it following the lab instructions (Step 1). If it is present but not ready, check logs with `kubectl logs -n kube-system deployment/metrics-server`. The HPA configuration, resource limits, and load generation are all irrelevant if Metrics Server is not running. Always verify Metrics Server first when troubleshooting HPA issues.

---
