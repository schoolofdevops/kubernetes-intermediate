# Lab: AI-Assisted Kubernetes Operations

## Objectives

By the end of this lab, you will be able to:

- Install and configure kubectl-ai with MCP server mode for AI-assisted cluster operations
- Connect an AI client (or use interactive CLI mode) for cluster interaction via natural language
- Perform AI-assisted cluster diagnostics to understand cluster state and health
- Practice AI-assisted troubleshooting on deliberately broken deployments with safety awareness
- Evaluate AI suggestions with critical thinking and document safety observations

## Prerequisites

Before starting this lab, ensure you have:

- Completed **Module 0: Introduction and Getting Started**
- A running **KIND cluster** with the Example Voting App deployed
- kubectl CLI installed and configured to communicate with your cluster
- An MCP-compatible client (Claude Desktop, Cursor, VS Code, or similar) - **optional**
- Basic understanding of Kubernetes troubleshooting concepts

:::note Three Usage Modes
This lab works in ALL three modes:
1. **Interactive CLI** (no MCP client needed) - kubectl-ai responds directly in terminal
2. **MCP Server** (with Claude Desktop/Cursor) - AI client connects to kubectl-ai, natural conversation in IDE/app
3. **Manual** (if kubectl-ai cannot be installed) - Read labs conceptually, run kubectl commands manually, understand the pattern

Interactive CLI mode provides 80% of the learning value without requiring MCP client setup.
:::

## Setup

This lab builds on the Voting App deployment from Module 0. You do NOT need to create a new cluster or redeploy the application.

**Step 1: Verify cluster status**

```bash
kubectl cluster-info
kubectl get nodes
```

Expected output:

```bash
Kubernetes control plane is running at https://127.0.0.1:xxxxx

NAME                       STATUS   ROLES           AGE   VERSION
voting-app-control-plane   Ready    control-plane   1d    v1.32.0
voting-app-worker          Ready    <none>          1d    v1.32.0
voting-app-worker2         Ready    <none>          1d    v1.32.0
```

**Step 2: Verify Voting App is running**

```bash
kubectl get pods
kubectl get svc
```

Expected: All pods (vote, result, worker, redis, postgres) should be in Running status.

**Step 3: Install kubectl-ai**

Choose one installation method:

**Option A: Quick install via curl** (Linux/macOS):

```bash
curl -fsSL https://raw.githubusercontent.com/GoogleCloudPlatform/kubectl-ai/main/install.sh | bash
```

**Option B: Via Krew plugin manager**:

```bash
kubectl krew install ai
```

**Option C: Manual download**:

Visit [kubectl-ai releases](https://github.com/GoogleCloudPlatform/kubectl-ai/releases), download the binary for your platform, make it executable, and move to your PATH:

```bash
chmod +x kubectl-ai-*
sudo mv kubectl-ai-* /usr/local/bin/kubectl-ai
```

**Step 4: Verify installation**

```bash
kubectl ai version
```

Or if installed via Krew:

```bash
kubectl ai version
```

Expected: Version information displayed.

**Step 5: Test basic functionality in interactive mode**

```bash
kubectl ai "show me all pods in the voting-app namespace"
```

This validates kubectl-ai can communicate with your cluster even without MCP server mode.

:::note API Key Required
kubectl-ai supports multiple LLM providers: Gemini (Google), OpenAI, Azure OpenAI, or Ollama (local). You'll need an API key for your chosen provider. Set it via environment variable or kubectl-ai config. Refer to [kubectl-ai documentation](https://github.com/GoogleCloudPlatform/kubectl-ai) for provider-specific setup.
:::

**Step 6: Configure MCP Server Mode (optional - for Claude Desktop/Cursor users)**

For Claude Desktop, add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kubernetes": {
      "command": "kubectl-ai",
      "args": ["mcp-server", "--context", "kind-voting-app"]
    }
  }
}
```

For **read-only mode** (recommended to start), add `--read-only` to args:

```json
{
  "mcpServers": {
    "kubernetes": {
      "command": "kubectl-ai",
      "args": ["mcp-server", "--context", "kind-voting-app", "--read-only"]
    }
  }
}
```

Restart Claude Desktop to load the configuration.

**Configuration file locations:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Step 7: Verify Voting App functionality**

```bash
kubectl port-forward svc/vote 8080:80 &
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
pkill -f "port-forward svc/vote"
```

Expected output: `200` (Voting App is accessible)

## Tasks

### Task 1: Explore kubectl-ai Capabilities

In this task, you'll understand what kubectl-ai can and cannot do, and identify the safety boundary between read and write operations.

**Step 1: Test basic query in interactive mode**

```bash
kubectl ai "What namespaces exist in my cluster?"
```

Observe the response. Note which underlying kubectl command was used.

Expected behavior: kubectl-ai lists namespaces using `kubectl get namespaces`.

**Step 2: Try a diagnostic query**

```bash
kubectl ai "Show me all pods in the voting-app namespace with their status"
```

Note how kubectl-ai formats the output compared to raw kubectl.

Expected behavior: List of pods with STATUS column highlighted or explained in natural language.

**Step 3: Ask about cluster health**

```bash
kubectl ai "Are there any unhealthy pods in my cluster?"
```

Observe how kubectl-ai defines "unhealthy" (CrashLoopBackOff, ImagePullBackOff, Pending with errors, etc.).

Expected behavior: kubectl-ai checks all namespaces, identifies pods not in Running/Succeeded status, explains why each is unhealthy.

**Step 4: Categorize operations**

Create a table of queries you've tried:

| Query | Read or Write? | Safe without review? |
|-------|----------------|----------------------|
| "What namespaces exist?" | Read | Yes |
| "Show me pods" | Read | Yes |
| "Are there unhealthy pods?" | Read | Yes |
| "Delete pod X" | Write | NO - destructive |
| "Scale deployment Y to 0" | Write | NO - causes downtime |

**Step 5: Identify the safety boundary**

Based on your observations, answer:

- Which queries are read-only and safe to run without review?
- Which operations could modify the cluster and require caution?
- How does kubectl-ai indicate when it's about to perform a write operation?

**Step 6: Reflect on tool-using AI**

Write a brief note (3-4 sentences):

"kubectl-ai translated my natural language questions into precise kubectl commands, executed them, and explained results in human-readable format. This is tool-using AI at work: the AI model doesn't have Kubernetes knowledge built-in, but it knows how to use kubectl as a tool to answer my questions. The value is in compression - one sentence replaces five kubectl commands."

### Task 2: AI-Assisted Diagnostics

In this task, you'll use AI to perform comprehensive cluster diagnostics faster than manual kubectl sequences.

**Step 1: Ask the AI to describe Voting App health**

Via kubectl-ai CLI:

```bash
kubectl ai "Describe the health of my Voting App deployment"
```

Or ask your MCP-enabled AI client: "Describe the health of my Voting App deployment in the voting-app namespace"

Expected AI behavior:
- Query deployments in voting-app namespace
- Check pod statuses
- Review recent events
- Report replica counts and any issues

Document what the AI reported and how long it took compared to running these commands manually:

```bash
kubectl get deployments -n voting-app
kubectl get pods -n voting-app
kubectl get events --field-selector type=Warning -n voting-app
```

**Step 2: Ask about recent warnings or errors**

```bash
kubectl ai "Are there any recent warnings or errors in the voting-app namespace?"
```

Expected AI behavior: Query events with `kubectl get events --field-selector type=Warning -n voting-app`, filter recent entries, present findings.

**Step 3: Ask about resource configuration**

```bash
kubectl ai "What are the resource requests and limits for the vote deployment?"
```

Expected AI behavior:
- Query deployment YAML: `kubectl get deployment vote -n voting-app -o yaml`
- Extract resource configuration from container specs
- Present in readable format

Example expected output:

```text
The vote deployment has the following resource configuration:
- Requests: CPU 100m, Memory 128Mi
- Limits: CPU 200m, Memory 256Mi
```

**Step 4: Ask about resource usage**

```bash
kubectl ai "Which pods are using the most CPU in my cluster?"
```

Expected AI behavior: Run `kubectl top pods --all-namespaces --sort-by=cpu` if Metrics Server is available, or explain that metrics are not available if Metrics Server is not installed.

:::note Metrics Server
If you completed Module 2 (Autoscaling), Metrics Server should be running. If not, this query will explain that resource metrics are unavailable. This is expected and demonstrates how AI handles missing prerequisites.
:::

**Step 5: Document diagnostic efficiency**

Create a table comparing manual vs AI-assisted diagnostics:

| Task | Manual kubectl time | AI-assisted time | Time saved |
|------|---------------------|------------------|------------|
| Check deployment health | ~2 min (4 commands) | ~15 sec (1 question) | ~1:45 |
| Find warnings/errors | ~1 min (2 commands) | ~10 sec (1 question) | ~50 sec |
| Extract resource config | ~2 min (get + parse YAML) | ~10 sec (1 question) | ~1:50 |

**Step 6: Evaluate diagnostic accuracy**

For each AI response, verify accuracy by running the underlying kubectl commands manually. Document:

- **What tool(s) did the AI use?** (list kubectl commands)
- **Was the answer helpful?** (yes/no, why)
- **Was the answer accurate?** (yes/no, any hallucinations or errors)

This verification step is CRITICAL. Always validate AI outputs, especially when learning how the AI reasons.

### Task 3: AI-Assisted Troubleshooting (Broken Deployment)

In this task, you'll deliberately break the Voting App and use AI to troubleshoot it. This simulates real-world incident response.

**Step 1: Introduce deliberate failure - wrong image**

```bash
kubectl set image deployment/vote vote=schoolofdevops/vote:doesnotexist -n voting-app
```

**Step 2: Wait for failure**

```bash
kubectl get pods -n voting-app -w
```

Wait until you see ImagePullBackOff or ErrImagePull status. Press Ctrl+C to stop watching.

**Step 3: Ask AI to diagnose**

```bash
kubectl ai "Why is the vote pod failing in the voting-app namespace?"
```

Expected AI behavior:
1. Describe the failing pod: `kubectl describe pod vote-xxx -n voting-app`
2. Read events: identify ImagePullBackOff
3. Check image: `schoolofdevops/vote:doesnotexist`
4. Suggest fix: "The image tag 'doesnotexist' is invalid. Use a valid tag like 'v1'."

**Step 4: REVIEW the AI's suggestion before executing**

Critical safety check. Ask yourself:

- **Is the suggested image tag correct?** (should be v1 per course decision D018)
- **Is the kubectl command safe?** (set image is non-destructive, it's a rolling update)
- **Does the fix address the root cause?** (yes - wrong image tag is the problem)
- **Are there any side effects?** (pods will restart, brief downtime possible)

If the AI suggested something dangerous (like `--force`, `--grace-period=0`, or `kubectl delete deployment`), DO NOT execute it. This would be a teaching moment about AI hallucinations.

**Step 5: Apply the fix after human review**

```bash
kubectl set image deployment/vote vote=schoolofdevops/vote:v1 -n voting-app
```

**Step 6: Verify recovery**

```bash
kubectl get pods -n voting-app
```

Expected: All pods Running within 30-60 seconds.

**Step 7: Introduce second failure - scale worker to 0**

```bash
kubectl scale deployment worker --replicas=0 -n voting-app
```

**Step 8: Ask AI to diagnose broader issue**

```bash
kubectl ai "The Voting App is not processing votes. What is wrong?"
```

Expected AI behavior:
1. Check all components in voting-app namespace
2. Notice worker deployment has 0 replicas
3. Explain: "The worker service processes votes from Redis queue. With 0 replicas, votes are queued but not processed."
4. Suggest: "Scale worker deployment to at least 1 replica: `kubectl scale deployment worker --replicas=1 -n voting-app`"

**Step 9: IMPORTANT REFLECTION**

Before fixing, answer these questions:

- Did the AI suggest deleting pods? (red flag - doesn't fix 0 replicas)
- Did the AI suggest restarting the cluster? (red flag - overkill)
- Did the AI suggest force-killing processes? (red flag - dangerous)
- Did the AI follow methodical troubleshooting? (observe → diagnose → minimal fix)

Good AI troubleshooting is methodical:
1. **Observe** all relevant components
2. **Diagnose** root cause from observations
3. **Suggest** minimal fix that addresses root cause
4. **Explain** why this fix works

Bad AI troubleshooting jumps to destructive actions (delete, force restart) without understanding the issue.

**Step 10: Fix the worker scaling issue**

```bash
kubectl scale deployment worker --replicas=1 -n voting-app
```

**Step 11: Verify Voting App fully functional**

```bash
# Check all pods
kubectl get pods -n voting-app

# Test vote service
kubectl port-forward svc/vote 8080:80 &
sleep 2
curl -s http://localhost:8080 | grep -q "Cats vs Dogs" && echo "Vote service working"
pkill -f "port-forward svc/vote"

# Test result service
kubectl port-forward svc/result 8081:80 &
sleep 2
curl -s http://localhost:8081 | grep -q "result" && echo "Result service working"
pkill -f "port-forward svc/result"
```

Expected: All services respond, Voting App is fully functional again.

### Task 4: Evaluate and Reflect

In this task, you'll critically evaluate the AI-assisted operations experience and document safety observations.

**Step 1: Write evaluation document**

Create a file named `ai-k8s-evaluation.md`:

```markdown
# AI-Assisted Kubernetes Operations Evaluation

**Date:** [Today's date]
**Cluster:** KIND voting-app cluster
**Tool:** kubectl-ai with [Interactive CLI | MCP Server | Manual mode]

## What worked well

1. [Describe 2-3 things the AI did effectively]
   - Example: "AI compressed multi-step diagnostics into single questions, saving 2-3 minutes per investigation"
   - Example: "AI identified root cause (ImagePullBackOff) and suggested correct fix without requiring deep YAML inspection"

2. [Additional positive observations]

3. [Additional positive observations]

## What was concerning

1. [Describe 1-2 things that need human oversight]
   - Example: "AI suggested exact kubectl commands but didn't explain WHY the commands would work"
   - Example: "AI couldn't verify if suggested image tag 'v1' actually exists in registry"

2. [Additional concerns]

## Safety observations

### Did the AI ever suggest a destructive command?

[Yes/No - if yes, describe what it suggested and why it was problematic]

### Did the AI explain WHY it suggested each command?

[Yes/No - describe level of explanation provided]

### Would you trust this AI with write access to a production cluster?

[Answer with reasoning - consider: supervision requirements, error handling, blast radius of mistakes]

### What safeguards would you require before granting write access?

- [ ] Read-only mode initially to build trust
- [ ] --dry-run for all write operations
- [ ] Human approval gates for destructive operations (delete, scale to 0)
- [ ] Audit logging of all AI-suggested actions
- [ ] RBAC limiting AI to specific namespaces
- [ ] Alert on failed AI operations
- [Add your own safeguards]

## When AI assistance adds value

Describe 3-4 scenarios where AI assistance is more valuable than manual kubectl:

1. **Rapid diagnostics across multiple resources** - [explain]
2. **Correlating signals from logs, events, and metrics** - [explain]
3. **Natural language exploration** - [explain]
4. [Your scenario]

## When to stay manual

Describe 3-4 scenarios where human judgment is essential and AI should not be trusted:

1. **Production deployments** - [explain why]
2. **Security-sensitive operations** - [explain why]
3. **Data deletion or migration** - [explain why]
4. [Your scenario]

## Overall assessment

[3-5 sentences summarizing your experience. Would you use AI-assisted K8s ops in your work? Under what conditions? What improvements would make it more trustworthy?]

## Recommendations

- For development clusters: [recommendation]
- For staging clusters: [recommendation]
- For production clusters: [recommendation]
```

**Step 2: Compare troubleshooting time**

Document:

- **Manual troubleshooting time** (Module 0-8 experience): How long does it typically take to diagnose ImagePullBackOff and fix it?
  - Estimate: ~5 minutes (describe pod, read events, check image, google correct tag, apply fix, verify)

- **AI-assisted troubleshooting time** (this lab): How long did it take with AI?
  - Estimate: ~1-2 minutes (ask question, review suggestion, apply fix, verify)

- **Time saved**: ~3-4 minutes per incident

- **Scaling impact**: If you troubleshoot 5 incidents per day, AI saves ~15-20 minutes daily

**Step 3: Discuss scaling threshold**

At what scale (number of services, clusters, incidents) does AI assistance become essential rather than nice-to-have?

Consider:

- **Small scale** (1-2 clusters, fewer than 10 services): Manual kubectl is manageable
- **Medium scale** (3-5 clusters, 10-50 services): AI assistance valuable but not critical
- **Large scale** (5+ clusters, 50+ services): AI assistance becomes essential to handle volume

Document your threshold: "AI assistance becomes essential at [X] clusters and [Y] services because [reasoning]."

**Step 4: Final reflection**

Write a 4-5 sentence reflection:

"Agentic Kubernetes is not about replacing operators. It is about augmenting them. The AI handles the routine investigation (reading logs, correlating events, checking resource status) so I can focus on the decisions (is this fix safe? what's the impact? what's the root cause?). The value proposition is compression: one question replaces five kubectl commands. But compression requires trust, and trust requires verification. I would use AI-assisted operations in development clusters with read-only mode, graduate to supervised mode in staging, and require extensive safeguards (approval gates, audit logging, RBAC limits) before considering production use."

## Verification

Confirm your lab is complete:

**1. kubectl-ai installed and working**

At least one usage mode functional:
- [ ] Interactive CLI: `kubectl ai "show me pods"` works
- [ ] MCP Server: AI client can query cluster via MCP
- [ ] Manual understanding: You understand the concepts without tool installation

**2. At least 3 AI-assisted queries performed**

- [ ] Query 1: [What you asked]
- [ ] Query 2: [What you asked]
- [ ] Query 3: [What you asked]

**3. Troubleshooting exercise completed**

- [ ] Broke vote deployment (ImagePullBackOff)
- [ ] Used AI to diagnose
- [ ] Reviewed AI suggestion with safety lens
- [ ] Fixed deployment
- [ ] Broke worker (scaled to 0)
- [ ] Used AI to diagnose
- [ ] Fixed worker

**4. Evaluation document written**

- [ ] `ai-k8s-evaluation.md` created
- [ ] Safety observations documented
- [ ] Use cases and limitations identified
- [ ] Recommendations provided

**5. Voting App restored to fully functional state**

```bash
kubectl get pods -n voting-app
```

Expected: All pods Running (vote, result, worker, redis, postgres).

## Cleanup

The Voting App should be fully functional after this lab. No cleanup is required unless you want to remove kubectl-ai:

```bash
# If installed via curl
rm /usr/local/bin/kubectl-ai

# If installed via Krew
kubectl krew uninstall ai
```

If you configured MCP server mode, you can remove the configuration from `claude_desktop_config.json` or leave it for future use.

## Troubleshooting

### Issue: kubectl-ai won't install

**Symptom:** Installation script fails or binary not found.

**Solution:**

Try alternative installation methods:

1. **Krew method**:
   ```bash
   kubectl krew update
   kubectl krew install ai
   ```

2. **Manual download**:
   - Visit [kubectl-ai releases](https://github.com/GoogleCloudPlatform/kubectl-ai/releases)
   - Download binary for your platform
   - Make executable: `chmod +x kubectl-ai-*`
   - Move to PATH: `sudo mv kubectl-ai-* /usr/local/bin/kubectl-ai`

3. **Manual mode**: If installation is not feasible, read the lab conceptually and run equivalent kubectl commands manually to understand the AI assistance pattern.

### Issue: kubectl-ai cannot connect to cluster

**Symptom:** Error: "Unable to connect to cluster" or "No kubeconfig found"

**Cause:** kubectl-ai cannot find or access your cluster configuration.

**Solution:**

Verify kubectl works first:

```bash
kubectl get nodes
```

If kubectl works but kubectl-ai doesn't, specify context explicitly:

```bash
kubectl ai --context kind-voting-app "show me pods"
```

### Issue: MCP server mode not working with Claude Desktop

**Symptom:** AI client cannot see Kubernetes tools or errors when trying to use them.

**Cause:** Configuration not loaded or kubectl-ai not in PATH for AI client.

**Solution:**

1. Verify kubectl-ai is in PATH:
   ```bash
   which kubectl-ai
   ```

2. Use full path in `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "kubernetes": {
         "command": "/usr/local/bin/kubectl-ai",
         "args": ["mcp-server", "--context", "kind-voting-app"]
       }
     }
   }
   ```

3. Restart Claude Desktop completely (quit and relaunch).

4. **Fallback**: Use interactive CLI mode instead:
   ```bash
   kubectl ai "your question"
   ```
   This provides the same learning value without MCP server complexity.

### Issue: AI gives wrong kubectl commands

**Symptom:** AI suggests a kubectl command that doesn't work or produces unexpected results.

**Cause:** This is expected. AI can hallucinate commands, especially for complex or ambiguous queries.

**Solution:**

This is a **learning moment**, not a bug. Document what the AI suggested and why it was wrong. This teaches you:

- AI is not infallible
- Human review is essential
- Trust must be earned through verification

Example: If AI suggests `kubectl delete pod POD_NAME --force` to fix CrashLoopBackOff, recognize this is wrong (pod will restart with same issue). The correct approach is diagnosing why the pod crashes (wrong image, missing config, insufficient resources).

### Issue: No LLM API key configured

**Symptom:** Error: "API key required" or "Authentication failed"

**Cause:** kubectl-ai needs an LLM provider configured (Gemini, OpenAI, Azure OpenAI, or Ollama).

**Solution:**

Choose an LLM provider and configure API key:

**Option 1: Gemini (Google, recommended for kubectl-ai)**

```bash
export GEMINI_API_KEY="your-api-key"
kubectl ai --provider gemini "show me pods"
```

**Option 2: OpenAI**

```bash
export OPENAI_API_KEY="your-api-key"
kubectl ai --provider openai "show me pods"
```

**Option 3: Ollama (local, no API key needed)**

Install Ollama, pull a model, and use:

```bash
kubectl ai --provider ollama --model llama2 "show me pods"
```

Refer to [kubectl-ai provider documentation](https://github.com/GoogleCloudPlatform/kubectl-ai#providers) for detailed setup.

## Key Takeaways

- **AI-assisted Kubernetes operations compress investigation time** by automating routine kubectl sequences and presenting findings in natural language
- **Human review is essential before executing AI suggestions** because AI can hallucinate dangerous commands that look plausible but cause data loss or downtime
- **Start with read-only mode to build trust** and only graduate to supervised write mode after verifying AI reasoning is sound and safe
- **The value of AI assistance scales with cluster complexity** - single cluster with 5 services sees marginal benefit, 10 clusters with 100 services sees transformational benefit
- **Agentic Kubernetes is augmentation, not automation** - AI handles routine investigation so humans can focus on judgment and decision-making
