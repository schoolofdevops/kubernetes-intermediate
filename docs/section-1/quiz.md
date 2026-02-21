---
draft: true
---

# Quiz: Module 1 - Advanced Pod Scheduling

**Module:** 1
**Topic:** Advanced Pod Scheduling
**Question Count:** 13

:::note[Format Purpose]
This quiz format is designed for manual conversion to TutorLMS spreadsheet import. Each question includes all fields needed for TutorLMS: question type, question text, options, correct answer, and explanation.
:::

---

## Question 1: Required vs Preferred Node Affinity

**Question Type:** Multiple Choice

**Question:**
What is the key difference between `requiredDuringSchedulingIgnoredDuringExecution` and `preferredDuringSchedulingIgnoredDuringExecution` in node affinity rules?

**Options:**

A) Required rules are evaluated first, preferred rules are evaluated only if required rules pass
B) Required rules block scheduling if unmet, preferred rules add weight to scoring but allow exceptions
C) Required rules apply to all pods, preferred rules apply only to pods with resource requests
D) Required rules persist after execution, preferred rules are ignored after the pod starts

**Correct Answer:** B

**Explanation:**
Required node affinity creates hard constraints - if no node matches the required rules, the pod stays Pending indefinitely. Preferred node affinity adds weighted scores (1-100) to nodes that match, but the scheduler will place the pod on a lower-scoring node if necessary. Both are "IgnoredDuringExecution" meaning they don't trigger pod rescheduling after initial placement. Option A is incorrect because both types of rules are evaluated during filtering/scoring. Options C and D misrepresent how the rules work.

---

## Question 2: TopologyKey Purpose

**Question Type:** Multiple Choice

**Question:**
In pod affinity and anti-affinity rules, what does the `topologyKey` field specify?

**Options:**

A) The label key used to identify which pods should be co-located or separated
B) The label key used to define topology domains for spreading or grouping pods
C) The Kubernetes API version for topology-aware scheduling features
D) The priority level for topology constraints when multiple rules conflict

**Correct Answer:** B

**Explanation:**
The topologyKey defines the boundary for affinity/anti-affinity rules. Common values include `kubernetes.io/hostname` (spread across nodes), `topology.kubernetes.io/zone` (spread across availability zones), and `topology.kubernetes.io/region` (spread across regions). The scheduler groups nodes by the topology key's value and applies affinity rules within those groups. Option A confuses the labelSelector (which identifies pods) with topologyKey (which defines topology domains).

---

## Question 3: Taint Effects

**Question Type:** Multiple Choice

**Question:**
Which taint effect immediately evicts existing pods that don't have a matching toleration?

**Options:**

A) NoSchedule
B) PreferNoSchedule
C) NoExecute
D) EvictImmediately

**Correct Answer:** C

**Explanation:**
The NoExecute taint effect is the most aggressive - it prevents new pods from scheduling AND evicts existing pods that don't tolerate the taint. NoSchedule only prevents new pods from scheduling but doesn't affect running pods. PreferNoSchedule is a soft version that tries to avoid scheduling but allows it if necessary. EvictImmediately is not a valid taint effect.

---

## Question 4: Toleration Misconception

**Question Type:** True/False

**Question:**
Adding a toleration to a pod spec guarantees that the pod will be scheduled on the tainted node.

**Correct Answer:** False

**Explanation:**
This is a critical misconception. Tolerations grant PERMISSION to schedule on tainted nodes - they don't ATTRACT pods to those nodes. A pod with a toleration might still schedule on an untainted node if the scheduler scores it higher. To guarantee placement on a specific tainted node, you must combine three things: (1) taint on the node, (2) toleration in the pod, and (3) node affinity attracting the pod to that node. Tolerations alone only remove the repelling force of taints; they don't create an attracting force.

---

## Question 5: Pod Anti-Affinity for High Availability

**Question Type:** Scenario

**Context:**
You're deploying the vote service for the Example Voting App with 3 replicas. You want to ensure that if any single node fails, at least some vote capacity remains available. Your cluster has 3 worker nodes.

**Question:**
Which configuration achieves this high availability requirement?

**Options:**

A) Node affinity with `requiredDuringSchedulingIgnoredDuringExecution` targeting different nodes for each replica
B) Pod anti-affinity with `requiredDuringSchedulingIgnoredDuringExecution` and `topologyKey: kubernetes.io/hostname`
C) Pod anti-affinity with `preferredDuringSchedulingIgnoredDuringExecution` and `topologyKey: kubernetes.io/hostname`
D) Pod affinity with `preferredDuringSchedulingIgnoredDuringExecution` targeting nodes with label `ha=enabled`

**Correct Answer:** C

**Explanation:**
Preferred pod anti-affinity with topologyKey kubernetes.io/hostname spreads replicas across different nodes (hostname = node boundary) while allowing flexibility. Option B (required anti-affinity) would also work but is overly strict - if you later scale to 4 replicas with only 3 nodes, the 4th pod would stay Pending. Option A uses node affinity which requires you to hard-code specific node names. Option D uses affinity (not anti-affinity) which would group pods together, the opposite of what we want.

---

## Question 6: Node Affinity Operators

**Question Type:** Multiple Choice

**Question:**
Which node affinity operator allows you to schedule a pod on any node that has a specific label key, regardless of the label's value?

**Options:**

A) In
B) Exists
C) NotIn
D) DoesNotExist

**Correct Answer:** B

**Explanation:**
The Exists operator matches any node that has the specified label key, ignoring the value. For example, `key: disktype, operator: Exists` would match nodes with `disktype=ssd`, `disktype=hdd`, or `disktype=anything`. The In operator requires the value to be in a specific list. NotIn and DoesNotExist are the inverse operations. This is useful when you care that a node has been classified but don't care about the specific classification value.

---

## Question 7: Debugging Pending Pods

**Question Type:** Scenario

**Context:**
You've deployed a new postgres pod with node affinity requiring `disktype=ssd`. The pod has been in Pending state for 5 minutes. When you run `kubectl describe pod`, you see the event: "0/3 nodes are available: 3 node(s) didn't match Pod's node affinity/selector."

**Question:**
What should you check first to resolve this issue?

**Options:**

A) Increase the pod's CPU and memory resource requests
B) Verify that at least one node has the label `disktype=ssd` using `kubectl get nodes --show-labels`
C) Check if the postgres image is available in the container registry
D) Restart the kube-scheduler pod to clear any scheduling cache issues

**Correct Answer:** B

**Explanation:**
The error message clearly indicates an affinity mismatch. The most common cause is referencing a label that doesn't exist on any nodes. Running `kubectl get nodes --show-labels` (or `kubectl get nodes -L disktype`) shows which nodes have the disktype label and what values they have. Option A is wrong because the error is about affinity, not resources. Option C is wrong because image pull issues show different errors. Option D is rarely necessary and doesn't address the actual problem. Always verify labels exist before writing affinity rules.

---

## Question 8: Scheduler Scoring with Weights

**Question Type:** Scenario

**Context:**
You have a deployment with two preferred node affinity rules:
- Rule 1: `disktype=ssd` with weight 80
- Rule 2: `zone=us-west-1` with weight 50

Your cluster has three nodes:
- Node A: `disktype=ssd`, `zone=us-east-1`
- Node B: `disktype=hdd`, `zone=us-west-1`
- Node C: `disktype=ssd`, `zone=us-west-1`

All nodes have sufficient resources. Which node will the scheduler choose?

**Options:**

A) Node A (score: 80)
B) Node B (score: 50)
C) Node C (score: 130)
D) Random selection between all three nodes since preferred rules don't affect scheduling

**Correct Answer:** C

**Explanation:**
The scheduler adds up weights for all matching preferred rules. Node C matches both rules: disktype=ssd (+80 points) and zone=us-west-1 (+50 points) = 130 total. Node A only matches the first rule (80 points). Node B only matches the second rule (50 points). The scheduler picks the highest-scoring node. Option D is incorrect - preferred rules absolutely affect scheduling by influencing the scoring phase, they just don't block scheduling like required rules do.

---

## Question 9: IgnoredDuringExecution Meaning

**Question Type:** True/False

**Question:**
If you change a node's labels after a pod has been scheduled to that node based on node affinity rules, Kubernetes will automatically reschedule the pod to maintain affinity compliance.

**Correct Answer:** False

**Explanation:**
The "IgnoredDuringExecution" part of `requiredDuringSchedulingIgnoredDuringExecution` means that affinity rules are evaluated only at scheduling time, not continuously. Once a pod is bound to a node, it stays there even if node labels change. If you add a new node with better matching labels, existing pods won't move. If you remove labels from the node where a pod is running, the pod stays running. Scheduling is a one-time decision, not continuous optimization. To apply new affinity rules or respond to label changes, you must delete and recreate the pod.

---

## Question 10: Combining Strategies for Dedicated Nodes

**Question Type:** Multiple Choice

**Question:**
What combination of Kubernetes features is required to create a dedicated database node where ONLY database pods can run and database pods PREFER to run there?

**Options:**

A) Node selector on the database pods
B) Taint on the node + toleration on database pods
C) Taint on the node + toleration on database pods + node affinity on database pods
D) Pod anti-affinity on non-database pods

**Correct Answer:** C

**Explanation:**
Creating a dedicated node requires three components working together: (1) Taint on the node (e.g., `dedicated=database:NoSchedule`) repels all pods, (2) Toleration on database pods grants them permission to schedule on the tainted node, and (3) Node affinity on database pods attracts them to that specific node. Without the taint, non-database pods could still schedule there. Without the toleration, database pods would be blocked. Without the affinity, database pods might schedule elsewhere. Option B provides isolation but no attraction. Option D doesn't prevent non-database pods from using the node.

---

## Question 11: Label Best Practices

**Question Type:** True/False

**Question:**
It's a best practice to use node affinity rules that reference standard Kubernetes labels like `kubernetes.io/hostname` rather than custom labels like `disktype=ssd`.

**Correct Answer:** False

**Explanation:**
This is backwards. Standard labels like `kubernetes.io/hostname` are useful for topology-aware spreading (in topologyKey fields), but for node selection you should use custom labels that represent actual node characteristics like hardware type, environment, or capability. Labels like `disktype=ssd`, `gpu=nvidia-t4`, or `workload=database` communicate meaningful distinctions. Using `kubernetes.io/hostname` in affinity matchExpressions hard-codes specific node names, which breaks when you add/remove nodes. Custom labels are semantic and transferable across cluster changes.

---

## Question 12: Voting App Scheduling Scenario

**Question Type:** Scenario

**Context:**
In the Example Voting App, you want to optimize scheduling for production. You have a 5-node cluster: 2 nodes with SSDs, 3 nodes with HDDs. Your requirements are:
- Postgres must run on SSD nodes for database performance
- Vote service (3 replicas) should spread across different nodes for HA
- Worker pods should avoid SSD nodes to leave those for the database

**Question:**
Which scheduling configuration correctly implements these requirements?

**Options:**

A) Required node affinity for postgres (disktype=ssd), preferred pod anti-affinity for vote, no configuration for worker
B) Required node affinity for postgres (disktype=ssd), required pod anti-affinity for vote, required node affinity for worker (disktype=hdd)
C) Required node affinity for postgres (disktype=ssd), preferred pod anti-affinity for vote, preferred node affinity for worker (disktype=hdd)
D) Taint SSD nodes with dedicated=database:NoSchedule, add tolerations to postgres and worker, preferred pod anti-affinity for vote

**Correct Answer:** C

**Explanation:**
Option C correctly balances hard requirements with soft preferences. Postgres gets required affinity for SSD (hard requirement for performance). Vote gets preferred anti-affinity (spread for HA but flexible if needed). Worker gets preferred affinity for HDD (preference but not blocking). Option A doesn't address keeping worker off SSDs. Option B makes anti-affinity required (problematic if you need to scale vote beyond node count) and makes worker HDD required (might cause scheduling failures). Option D uses taints but then gives worker a toleration, which allows but doesn't prevent it from using SSD nodes.

---

## Question 13: Taint vs Affinity Purpose

**Question Type:** Multiple Choice

**Question:**
What is the fundamental difference in purpose between taints/tolerations and node affinity?

**Options:**

A) Taints are for security isolation, affinity is for performance optimization
B) Taints are configured on nodes and repel pods, affinity is configured on pods and attracts them to nodes
C) Taints apply to all pods in a namespace, affinity applies to individual pods
D) Taints are evaluated during the filtering phase, affinity is evaluated during the scoring phase

**Correct Answer:** B

**Explanation:**
The core distinction is direction and configuration location. Taints are node-level configurations that push pods away (repel). Affinity rules are pod-level configurations that pull pods toward nodes (attract). This architectural difference matters: taints let cluster administrators control which workloads can use nodes without modifying pod specs. Affinity lets developers specify where their pods should run. Option A oversimplifies - both can serve security and performance. Option C is wrong - taints are node-scoped, not namespace-scoped. Option D is partially true but doesn't capture the fundamental purpose difference.
