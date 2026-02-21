---
draft: true
---

# Quiz: Module 9 - Intro to Agentic Kubernetes

**Module:** 9
**Topic:** Intro to Agentic Kubernetes
**Question Count:** 11

---

## Question 1: MCP Protocol Fundamentals

**Question Type:** Multiple Choice

**Question:**
What is the primary purpose of Model Context Protocol (MCP) in agentic Kubernetes systems?

**Options:**

A) To enable AI models to directly modify Kubernetes API server code
B) To standardize how AI models discover and interact with external tools like kubectl
C) To replace kubectl with AI-generated commands permanently
D) To train AI models on Kubernetes documentation automatically

**Correct Answer:** B

**Explanation:**
Model Context Protocol (MCP) standardizes how AI models discover and interact with external tools, similar to how USB standardizes hardware connections. MCP enables any MCP-compatible AI client to connect to any MCP-compatible tool server (like kubectl-ai) without custom integration code. It provides tool discovery, input/output schemas, error handling, and security modes. MCP does not modify Kubernetes code (A), replace kubectl entirely (C), or handle model training (D).

---

## Question 2: Agentic AI Capability Levels

**Question Type:** Multiple Choice

**Question:**
Which statement BEST describes the difference between a Level 2 tool-using agent and a Level 3 autonomous agent in the context of Kubernetes operations?

**Options:**

A) Level 2 can only answer questions about Kubernetes concepts, while Level 3 can query cluster state
B) Level 2 can read cluster state and suggest changes requiring human approval, while Level 3 can execute approved changes with audit logging
C) Level 2 requires manual kubectl commands, while Level 3 eliminates the need for kubectl entirely
D) Level 2 is suitable for production, while Level 3 should only be used in development environments

**Correct Answer:** B

**Explanation:**
Level 2 tool-using agents can READ cluster state via kubectl and SUGGEST changes, but require human approval before executing. Level 3 autonomous agents can execute changes after approval with audit logging, representing higher autonomy. Option A describes Level 1 (chatbot) vs Level 2, not Level 2 vs Level 3. Option C is incorrect because both levels use kubectl as the underlying tool. Option D is misleading - Level 3 can be production-ready with proper safeguards, while Level 2 is about capability, not environment suitability.

---

## Question 3: MCP Architecture Components

**Question Type:** Multiple Choice

**Question:**
In an MCP-based Kubernetes AI system, which component is responsible for executing actual kubectl commands against the cluster?

**Options:**

A) The AI model (e.g., Claude, GPT-4)
B) The MCP protocol layer
C) The MCP server (e.g., kubectl-ai)
D) The AI client application (e.g., Claude Desktop)

**Correct Answer:** C

**Explanation:**
The MCP server (such as kubectl-ai) is responsible for executing actual kubectl commands against the cluster. The server translates MCP tool calls into kubectl operations, runs them, and returns results. The AI model (A) decides which tools to call but doesn't execute commands. The MCP protocol layer (B) is the communication standard, not an executor. The AI client application (D) facilitates user interaction but delegates tool execution to the MCP server.

---

## Question 4: Safety Mode Progression

**Question Type:** True/False

**Question:**
When deploying AI-assisted Kubernetes operations in production, it is safe to start with autonomous mode (Level 3) as long as audit logging is enabled.

**Correct Answer:** False

**Explanation:**
Starting with autonomous mode in production is NOT safe, even with audit logging. The recommended progression is: (1) Read-only mode first to build trust and understand AI reasoning, (2) Supervised mode with human approval gates for write operations, (3) Autonomous mode only after extensive validation and with additional safeguards (RBAC limits, approval workflows, extensive monitoring). Audit logging is necessary but not sufficient - it tells you what went wrong after the fact, but doesn't prevent destructive actions. Always start with the most restrictive mode and graduate gradually based on demonstrated reliability.

---

## Question 5: Human-in-the-Loop Scenario

**Question Type:** Scenario

**Context:**
You're troubleshooting a CrashLoopBackOff issue on the vote pod in your production voting-app namespace. You ask your AI assistant for help, and it responds: "The vote pod is failing. Execute this command to fix it: `kubectl delete pod vote-xxxx --force --grace-period=0 -n voting-app`"

**Question:**
What is the BEST response to this AI suggestion?

**Options:**

A) Execute the command immediately since AI identified the fix
B) Reject the suggestion and investigate the root cause manually, as force-deleting won't fix CrashLoopBackOff
C) Modify the command to remove --force but keep --grace-period=0
D) Execute the command with --dry-run flag first to preview changes

**Correct Answer:** B

**Explanation:**
Option B is correct because force-deleting a pod does NOT fix CrashLoopBackOff - the pod will restart with the same issue (wrong image, missing config, insufficient resources, etc.). This AI suggestion is a dangerous hallucination. The correct approach is diagnosing WHY the pod crashes (logs, events, resource status) and addressing the root cause. Option A blindly trusts AI, which is unsafe. Option C still deletes the pod without fixing the underlying issue. Option D is irrelevant because --dry-run doesn't work with delete operations in this way, and the fundamental approach is flawed.

---

## Question 6: AI Command Safety

**Question Type:** True/False

**Question:**
AI-generated kubectl commands are always syntactically correct and safe to execute if they don't include obvious danger flags like --force or --all-namespaces.

**Correct Answer:** False

**Explanation:**
AI-generated kubectl commands can be problematic even without obvious danger flags. AI can hallucinate invalid resource names, wrong namespaces, incorrect image tags, or commands that are syntactically correct but operationally wrong (e.g., scaling to 0 replicas, applying malformed YAML, changing security contexts inappropriately). Always review AI suggestions with these questions: (1) Is this syntactically correct? (2) Does it address the root cause? (3) What are the side effects? (4) Is the timing appropriate? Trust must be earned through verification, not assumed based on absence of danger flags.

---

## Question 7: Value Scaling Scenario

**Question Type:** Scenario

**Context:**
Your organization is evaluating whether to invest in AI-assisted Kubernetes operations tooling. Currently, you manage 2 clusters with 8 microservices total. Each troubleshooting incident takes about 10 minutes manually and AI assistance would reduce this to 3 minutes. You handle about 2 incidents per week.

**Question:**
What is the MOST reasonable assessment of AI assistance value at this scale?

**Options:**

A) Essential - the time savings justify immediate implementation with full autonomous mode
B) High value - implement immediately but start with supervised mode and limited scope
C) Marginal value - time savings exist but may not justify tooling complexity at this scale
D) No value - AI assistance only makes sense for clusters with 100+ services

**Correct Answer:** C

**Explanation:**
At this scale (2 clusters, 8 services, 2 incidents/week), AI assistance saves about 14 minutes per week (7 minutes per incident × 2 incidents). This is marginal value - the time savings exist but may not justify the complexity of setting up AI tooling, configuring MCP servers, managing API keys, training team, and maintaining the system. Option A is wrong because this scale doesn't justify autonomous mode risks. Option B overstates urgency. Option D is too absolute - AI can add value before 100+ services, but the inflection point is typically around 10+ clusters or 50+ services where manual investigation becomes overwhelming. The honest assessment is that smaller scales see marginal ROI.

---

## Question 8: MCP Server Security

**Question Type:** Scenario

**Context:**
You're configuring kubectl-ai as an MCP server for your production Kubernetes cluster. The AI will help with diagnostics and troubleshooting. You need to decide what RBAC permissions to grant the ServiceAccount that kubectl-ai will use.

**Question:**
What is the MOST appropriate RBAC configuration for this use case?

**Options:**

A) cluster-admin role to ensure AI can perform any necessary operation
B) read-only access (get, list, watch) for all resources, no write permissions initially
C) full access to the voting-app namespace only, no access to kube-system
D) write access for Deployments and Pods, but read-only for Secrets and ConfigMaps

**Correct Answer:** B

**Explanation:**
Option B is correct: start with read-only access (get, list, watch verbs) for all resources with NO write permissions. This allows AI to perform comprehensive diagnostics while preventing accidental or malicious modifications. After building trust, you can graduate to supervised mode with limited write permissions. Option A (cluster-admin) is dangerous - never give AI full cluster control initially. Option C limits scope but still grants writes, which is premature. Option D grants write access to Deployments/Pods but those are among the most critical resources - this reverses appropriate caution. The principle is: minimum viable permissions, expand gradually based on demonstrated reliability.

---

## Question 9: AI Troubleshooting Workflow

**Question Type:** Multiple Choice

**Question:**
In the AI-assisted troubleshooting workflow described in this module, what is the correct sequence of steps the AI should follow when diagnosing a pod failure?

**Options:**

A) Suggest fix → Execute fix → Observe results → Diagnose root cause
B) Observe pod status → Suggest immediate restart → Wait for human approval
C) Observe relevant resources → Diagnose root cause → Suggest minimal fix → Human reviews and decides
D) Query all cluster resources → Generate comprehensive report → Email to operator

**Correct Answer:** C

**Explanation:**
Option C represents methodical troubleshooting: (1) OBSERVE relevant resources (pod status, logs, events, related services), (2) DIAGNOSE root cause by correlating signals, (3) SUGGEST minimal fix that addresses root cause with explanation, (4) HUMAN reviews suggestion and decides whether to execute. Option A gets the sequence backwards - you don't suggest fixes before diagnosis. Option B skips diagnosis and jumps to restart, which rarely fixes root cause. Option D is passive reporting, not troubleshooting assistance. Good AI troubleshooting is deliberate and methodical, not reactive or automated.

---

## Question 10: Automation vs Augmentation

**Question Type:** Multiple Choice

**Question:**
What is the key difference between automation and augmentation in the context of agentic Kubernetes operations?

**Options:**

A) Automation uses scripts, augmentation uses AI
B) Automation replaces human decision-making, augmentation enhances human capabilities
C) Automation is faster, augmentation is more accurate
D) Automation is for simple tasks, augmentation is for complex tasks

**Correct Answer:** B

**Explanation:**
The key difference is philosophical: automation REPLACES human decision-making (e.g., auto-scaling replicas based on CPU without human input), while augmentation ENHANCES human capabilities (e.g., AI performs investigation and suggests fix, human reviews and decides). Option A is superficial - both can use scripts or AI. Option C is incorrect - speed and accuracy depend on implementation, not category. Option D oversimplifies - both can handle simple or complex tasks. The distinction matters because agentic Kubernetes today focuses on augmentation (AI assists humans) rather than full automation (AI operates independently), though the field is evolving toward more autonomy with proper safeguards.

---

## Question 11: Audit Logging in Agentic Operations

**Question Type:** True/False

**Question:**
Comprehensive audit logging of all AI-suggested actions (what was suggested, why, whether approved, outcome) is sufficient to safely deploy autonomous AI agents with write access to production Kubernetes clusters.

**Correct Answer:** False

**Explanation:**
Audit logging is NECESSARY but NOT SUFFICIENT for safe autonomous AI in production. Logging tells you what went wrong after it happens - it's forensics, not prevention. Safe autonomous AI requires multiple layers: (1) RBAC limits (constrain blast radius), (2) Approval gates for high-risk operations (prevent destructive actions), (3) Dry-run previews (catch errors before execution), (4) Rate limiting (prevent runaway automation), (5) Anomaly detection (halt on unusual patterns), (6) Audit logging (forensics and compliance), and (7) Kill switches (emergency shutdown). Audit logging alone allows an AI to delete critical resources, then you discover it in the logs. Prevention through constraints and gates is essential, with audit logging providing accountability and learning, not safety.

---
