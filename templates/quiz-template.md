# Quiz: Module [N] - [Module Topic]

**Module:** [N]
**Topic:** [Module Topic Name]
**Question Count:** [10-15]
**Target Volume:** 10-15 questions per module

:::note[Format Purpose]
This quiz format is designed for manual conversion to TutorLMS spreadsheet import. Each question includes all fields needed for TutorLMS: question type, question text, options, correct answer, and explanation.
:::

---

## Question 1: [Multiple Choice Example]

**Question Type:** Multiple Choice

**Question:**
In the context of the Example Voting App, which Kubernetes resource would you use to ensure that the vote service automatically scales based on CPU utilization?

**Options:**

A) ReplicaSet
B) HorizontalPodAutoscaler
C) Deployment
D) StatefulSet

**Correct Answer:** B

**Explanation:**
The HorizontalPodAutoscaler (HPA) is specifically designed to automatically scale pods based on observed metrics like CPU utilization or memory usage. While a Deployment manages the desired number of replicas, the HPA dynamically adjusts that number based on load. ReplicaSets are lower-level abstractions typically managed by Deployments, and StatefulSets are used for stateful applications requiring stable network identities.

---

## Question 2: [True/False Example]

**Question Type:** True/False

**Question:**
A Pod's resource requests guarantee that the Pod will never use more than the requested amount of CPU or memory.

**Correct Answer:** False

**Explanation:**
Resource requests define the minimum amount of resources a Pod needs and are used for scheduling decisions. However, requests do NOT limit resource usage - a Pod can consume more than its requested resources if available on the node. Resource limits (not requests) define the maximum resources a Pod can consume. If a Pod exceeds its memory limit, it will be OOMKilled. If it exceeds its CPU limit, it will be throttled.

---

## Question 3: [Scenario-Based Example]

**Question Type:** Scenario

**Context:**
You're managing the Example Voting App in production. Users report that during peak voting periods, the vote service becomes slow and unresponsive. You notice that the vote pods are hitting their CPU limits and being throttled. The pods have the following resource configuration:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 200m
    memory: 256Mi
```

**Question:**
What would be the BEST approach to resolve this performance issue?

**Options:**

A) Increase only the CPU request to 200m to ensure better scheduling
B) Remove the CPU limit entirely to allow unlimited CPU usage
C) Increase both the CPU request and limit proportionally (e.g., 200m request, 400m limit)
D) Add more replicas without changing resource specifications

**Correct Answer:** C

**Explanation:**
Option C is the best approach because it addresses both scheduling and runtime performance. Increasing the CPU request ensures the scheduler places pods on nodes with sufficient CPU capacity, while increasing the limit allows pods to handle peak load without throttling. Option A only affects scheduling but doesn't resolve the throttling during peaks. Option B could lead to resource contention and affect other workloads on the node. Option D (adding replicas) might help distribute load but doesn't address the fundamental issue that individual pods don't have enough CPU to handle their share of requests efficiently.

---

## Question Template Structure

For each additional question, follow this format:

**Question Type:** [Multiple Choice | True/False | Scenario]

**Context:** [Only for Scenario questions - provide 2-3 sentence setup]

**Question:**
[Clear, specific question text. Focus on practical application, not rote memorization. Connect to Example Voting App where possible.]

**Options:** [Only for Multiple Choice and Scenario questions]

A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]

**Correct Answer:** [A, B, C, D, or True/False]

**Explanation:**
[2-4 sentences explaining why the correct answer is right and why other options are wrong or less optimal. Help learners understand the reasoning, not just memorize answers.]

---

## Question Guidelines

**Multiple Choice Questions:**
- 4 options (A, B, C, D)
- One clearly correct answer
- Distractors should be plausible but incorrect
- Avoid "all of the above" or "none of the above" options
- Focus on understanding, not trick questions

**True/False Questions:**
- Clear, unambiguous statements
- Test important concepts, not edge cases
- Explanation should clarify why and provide additional context
- Avoid double negatives

**Scenario Questions:**
- Realistic situation from Example Voting App context
- Requires applying multiple concepts
- Options should represent different valid approaches (not obviously wrong answers)
- Best for testing judgment and decision-making skills
- 2-3 scenario questions per module maximum (they take longer to answer)

## TutorLMS Field Mapping

When converting to TutorLMS spreadsheet format, map fields as follows:

- **Question Type** → TutorLMS question_type column (map "Multiple Choice" to "single_choice", "True/False" to "true_false", "Scenario" to "single_choice")
- **Question** → question_title column
- **Context** → question_description column (for scenario questions)
- **Options** → answer_option columns (A, B, C, D map to option_1, option_2, option_3, option_4)
- **Correct Answer** → correct_answer column
- **Explanation** → answer_explanation column

## Content Tips

- Mix question types: aim for 60% Multiple Choice, 25% Scenario, 15% True/False
- Distribute questions across module topics (don't over-focus on one concept)
- Include at least 2-3 questions that reference the Example Voting App specifically
- Test practical application, not just definitions
- Difficulty: intermediate level (assume basic K8s knowledge)
- Time estimate: 1-2 minutes per question on average
