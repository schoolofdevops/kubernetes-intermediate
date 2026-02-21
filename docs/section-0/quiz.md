---
draft: true
---

# Quiz: Module 0 - Introduction and Getting Started

**Module:** 0
**Topic:** Introduction and Getting Started
**Question Count:** 12

---

## Question 1

**Question Type:** Multiple Choice

**Question:**
What is the primary role of Redis in the Example Voting App architecture?

**Options:**

A) Persistent storage for vote tallies
B) Message queue for asynchronous vote processing
C) Load balancer for distributing traffic to workers
D) Cache for improving result service performance

**Correct Answer:** B

**Explanation:**
Redis serves as a message queue in the Example Voting App. When users submit votes, the vote service pushes them onto a Redis queue. The worker service then consumes votes from this queue and processes them asynchronously. This decoupling pattern allows the frontend to respond quickly regardless of backend processing speed, and ensures votes aren't lost if the worker temporarily fails. PostgreSQL, not Redis, provides persistent storage for processed votes.

---

## Question 2

**Question Type:** True/False

**Question:**
In a KIND cluster, worker nodes can run both application workloads and Kubernetes control plane components.

**Correct Answer:** False

**Explanation:**
In KIND (and production Kubernetes clusters following best practices), control plane components run on control-plane nodes, while application workloads run on worker nodes. This separation ensures that application resource consumption doesn't interfere with cluster management operations. The control-plane node runs the API server, scheduler, controller manager, and etcd, while worker nodes are dedicated to running application pods. While it's technically possible to configure control-plane nodes to accept workloads (by removing taints), this violates production best practices and is not the default behavior in KIND.

---

## Question 3

**Question Type:** Scenario

**Context:**
You've deployed the Example Voting App in your KIND cluster. Users can successfully submit votes through the vote service, and you see votes appearing in the Redis queue. However, the result service consistently shows zero votes, and the PostgreSQL database is empty.

**Question:**
What is the most likely cause of this issue?

**Options:**

A) The vote service is misconfigured and not connecting to Redis properly
B) The worker pod is not running or cannot connect to Redis or PostgreSQL
C) The result service is reading from the wrong database
D) Redis is not persisting data correctly

**Correct Answer:** B

**Explanation:**
Since votes are successfully reaching Redis (confirmed by checking the queue), the vote service is working correctly. The problem is in the data flow between Redis and PostgreSQL. The worker is responsible for consuming votes from Redis and writing them to PostgreSQL. If the worker is not running, or if it cannot connect to either Redis or PostgreSQL, votes will accumulate in Redis but never reach the database. You can diagnose this by checking worker pod status with `kubectl get pods -l app=worker` and examining worker logs with `kubectl logs deployment/worker` for connection errors.

---

## Question 4

**Question Type:** Multiple Choice

**Question:**
Which Kubernetes Service type is used for the Redis service in the Example Voting App, and why?

**Options:**

A) NodePort, because Redis needs to be accessible from outside the cluster
B) LoadBalancer, to distribute load across multiple Redis instances
C) ClusterIP, because Redis only needs to be accessible within the cluster
D) ExternalName, to point to an external Redis service

**Correct Answer:** C

**Explanation:**
Redis uses ClusterIP because it only needs to be accessed by other services within the cluster (specifically, the vote service and worker). ClusterIP is the default Service type and provides internal cluster networking with a stable IP and DNS name. There's no need to expose Redis externally (NodePort) or use cloud load balancing (LoadBalancer). Only the vote and result services use NodePort in this setup because they need to be accessible from outside the cluster for user interaction.

---

## Question 5

**Question Type:** Multiple Choice

**Question:**
What is the main advantage of KIND over Minikube for this intermediate Kubernetes course?

**Options:**

A) KIND is faster and provides better multi-node cluster support
B) KIND uses less memory than Minikube
C) KIND comes pre-installed with all necessary tools
D) KIND is the only tool that supports Kubernetes 1.27+

**Correct Answer:** A

**Explanation:**
KIND (Kubernetes IN Docker) is faster at creating and destroying clusters compared to Minikube, and it provides excellent multi-node cluster support out of the box. This is crucial for this course because many intermediate concepts like pod affinity, anti-affinity, and node-based scheduling require multiple worker nodes to demonstrate effectively. While Minikube can create multi-node clusters, it requires additional configuration and is generally slower. Both tools support modern Kubernetes versions, and both require Docker to be installed separately.

---

## Question 6

**Question Type:** Scenario

**Context:**
You run `kubectl get pods` and see all five Example Voting App pods in "Running" status. You can access the vote service, submit votes, and see results updating correctly. However, when you run `kubectl top pods` to check resource usage, you receive an error: "Metrics API not available."

**Question:**
What does this error indicate, and how does it affect your cluster?

**Options:**

A) Your cluster is broken and needs to be recreated
B) Metrics Server is not installed; this prevents resource monitoring and autoscaling features
C) KIND clusters don't support metrics collection at all
D) You need to wait longer for metrics to be collected

**Correct Answer:** B

**Explanation:**
The "Metrics API not available" error means Metrics Server is not installed in your cluster. Metrics Server is not included by default in KIND clusters - it must be installed separately. Without Metrics Server, you cannot monitor pod resource usage with `kubectl top`, and critically, the Horizontal Pod Autoscaler cannot function because it relies on the Metrics API to collect CPU and memory data. The cluster is not broken - applications work fine, but resource-based monitoring and autoscaling features are unavailable. Module 2 covers installing Metrics Server as part of setting up autoscaling.

---

## Question 7

**Question Type:** True/False

**Question:**
A Kubernetes Deployment with 1 replica provides high availability because Kubernetes will automatically restart the pod if it fails.

**Correct Answer:** False

**Explanation:**
While a Deployment with 1 replica does provide self-healing (Kubernetes will restart the pod if it crashes), this is not the same as high availability. High availability requires multiple replicas distributed across different nodes. With a single replica, there is always a brief period (5-30 seconds typically) when the service is unavailable while Kubernetes detects the failure, terminates the old pod, and starts a new one. If the entire node fails, this outage window can be even longer. True high availability requires at least 2-3 replicas with pod anti-affinity rules to ensure they run on different nodes, so failure of any single pod or node doesn't cause service disruption.

---

## Question 8

**Question Type:** Multiple Choice

**Question:**
In the Example Voting App, which component has no Kubernetes Service associated with it?

**Options:**

A) Vote
B) Redis
C) Worker
D) Result

**Correct Answer:** C

**Explanation:**
The worker component has no Service because it doesn't expose any ports or accept incoming connections. It's a background processor that actively polls Redis for new votes and writes to PostgreSQL. Services are only needed for components that receive incoming network traffic. The vote and result services need to accept HTTP requests from users, Redis needs to accept connections from vote and worker, and PostgreSQL needs to accept connections from worker and result. The worker only makes outbound connections, so it doesn't need a Service.

---

## Question 9

**Question Type:** Scenario

**Context:**
You notice that after deploying the Example Voting App, all five pods are running on the same worker node (kind-worker), while kind-worker2 and kind-worker3 are idle.

**Question:**
Why might this happen, and is it a problem?

**Options:**

A) This is normal behavior; Kubernetes prefers to pack pods onto fewer nodes to save resources
B) The other nodes are tainted and pods cannot schedule there
C) This is random scheduling behavior that will be addressed with affinity rules in Module 1
D) This indicates a scheduler malfunction and the cluster should be recreated

**Correct Answer:** C

**Explanation:**
Without any scheduling constraints, the Kubernetes scheduler places pods on nodes based on available resources and its default scoring algorithm. It might place all pods on one node if that node has sufficient capacity and happens to score highest. This isn't necessarily a problem for a simple lab deployment with minimal resource requirements, but it's not optimal for production. If that node fails, all services go down simultaneously. Module 1 introduces pod anti-affinity rules to spread replicas across nodes, and node affinity to place specific workloads on appropriate nodes (like databases on nodes with fast storage). This scenario demonstrates why scheduling control is essential for production deployments.

---

## Question 10

**Question Type:** True/False

**Question:**
The Production Readiness Journey means continuously adding more features and complexity to the application until it matches enterprise deployments.

**Correct Answer:** False

**Explanation:**
The Production Readiness Journey is about addressing specific gaps between "works" and "production-ready," not about adding complexity for its own sake. Each module addresses a concrete gap: scheduling control prevents random workload placement, autoscaling handles variable load, security policies enforce isolation, etc. The goal is thoughtful, justified improvements based on actual production requirements. Module 4, for example, evaluates whether adding a service mesh is worth the complexity for your specific use case - sometimes the answer is "no." Production readiness means having the right features for your requirements, not implementing every possible technology.

---

## Question 11

**Question Type:** Multiple Choice

**Question:**
What does the "IgnoredDuringExecution" part of "requiredDuringSchedulingIgnoredDuringExecution" mean in Kubernetes scheduling rules?

**Options:**

A) The rule is never enforced after the pod starts running
B) If a node's labels change after the pod is scheduled, the pod is not automatically evicted
C) The scheduler ignores the rule if no nodes match the requirements
D) Kubernetes will log a warning but allow the pod to run anyway

**Correct Answer:** B

**Explanation:**
The "IgnoredDuringExecution" suffix means that once a pod is running, changes to node labels won't trigger automatic pod eviction. For example, if you use requiredDuringSchedulingIgnoredDuringExecution to require nodes with label "disktype=ssd," the pod will only be scheduled on such nodes. But if you later remove that label from the node, the pod continues running. This prevents unexpected evictions when node labels change. The "required" part still means the scheduler must find a matching node during initial scheduling - it won't ignore the rule or place the pod on a non-matching node. This term is mentioned in the reading materials as preparation for Module 1's deep dive into scheduling.

---

## Question 12

**Question Type:** Scenario

**Context:**
You've completed the Module 0 lab and want to take a break. You stop Docker Desktop, shutting down your computer. The next day, you restart Docker Desktop and run `kubectl get nodes`, but receive an error: "The connection to the server localhost:8080 was refused."

**Question:**
What is the most likely cause and solution?

**Options:**

A) The cluster was permanently deleted; recreate it with `kind create cluster`
B) The KIND containers stopped; restart them with `docker start voting-app-control-plane voting-app-worker voting-app-worker2 voting-app-worker3`
C) kubectl lost its configuration; run `kind get kubeconfig` to restore it
D) Docker Desktop doesn't preserve KIND clusters across restarts; you must use a cloud provider instead

**Correct Answer:** B

**Explanation:**
When you stop Docker Desktop, all containers (including KIND nodes) are stopped but not deleted. When Docker restarts, the containers remain stopped. You need to explicitly start the KIND node containers. Running `docker start` with the node names will bring the cluster back to exactly the state you left it. Your deployments, pods, and all data will be preserved. Option A would work but unnecessarily destroys your work. Option C is incorrect because kubectl config is stored locally in ~/.kube/config and isn't affected by container state. This scenario is covered in the lab's Cleanup section, which emphasizes NOT deleting the cluster between modules.

---
