# Phase 4: Advanced Content (Modules 5-9) - Research

**Researched:** 2026-02-09
**Domain:** Advanced Kubernetes concepts (Security, Helm, CRDs, Operators, Agentic AI)
**Confidence:** HIGH

## Summary

Phase 4 creates complete learning modules for the final five course sections (Modules 5-9), covering Security (NetworkPolicy, PSA, RBAC), Helm Charts, Custom Resource Definitions, Kubernetes Operators, and Agentic Kubernetes. Each module requires reading materials (10-20 minutes), diagrams, hands-on labs (30-60 minutes), and quizzes (10-15 questions). The content continues using the Example Voting App as the continuous use case, evolving it toward production-ready deployment patterns.

Research confirms: (1) NetworkPolicy requires CNI plugin support (Calico/Cilium work with KIND), (2) Helm 3 (v3.20+) is current standard with v4 just released, (3) Operator development follows scaffold → API → controller → deploy pattern, (4) School of DevOps operator tutorial provides proven learning sequence, (5) Model Context Protocol (MCP) is emerging standard for AI-Kubernetes integration, (6) VoteConfig operator pattern (user's suggestion) is excellent beginner-friendly use case.

**Primary recommendation:** Module 5 focuses on application-level security (not cluster administration), Module 6 converts Example Voting App to Helm chart progressively, Module 7 creates VoteConfig CRD, Module 8 builds VoteConfig operator following School of DevOps learning sequence, Module 9 introduces MCP Kubernetes server for AI-assisted operations. Use progressive complexity with each module building production readiness skills.

---

## Standard Stack

### Core Technologies

| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| Calico | 3.28+ | CNI with NetworkPolicy support | Most widely deployed, standard NetworkPolicy implementation, KIND compatible |
| Helm | 3.20+ (v4.x available) | Package manager for Kubernetes | De facto standard, v3 supported until Nov 2026, v4 just released Jan 2026 |
| Kubebuilder | 4.11+ | Operator development SDK | Official Kubernetes SIG project, scaffolds controller-runtime projects |
| Operator SDK | 1.37+ (uses Kubebuilder 4.6) | Operator framework (alternative) | CNCF project, higher-level abstractions, wraps Kubebuilder |
| Go | 1.22+ | Operator programming language | Kubernetes native, controller-runtime ecosystem, School of DevOps uses Go |
| MCP Kubernetes Server | Latest | Model Context Protocol for K8s | Emerging standard for AI-K8s integration, multiple implementations available |

### Supporting Tools

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| kubectl | Matches cluster | All operations | All modules |
| helm-docs | Latest | Chart documentation generator | Module 6 (auto-generate README) |
| controller-gen | Via Kubebuilder | CRD/webhook code generation | Module 8 (operator development) |
| kustomize | Built into kubectl | YAML templating | Module 7 alternative to Helm |
| yq | 4.x | YAML processing | Module 6 (chart values manipulation) |

### NetworkPolicy CNI Options

| CNI Plugin | NetworkPolicy Support | eBPF-based | KIND Compatibility | Best For |
|------------|----------------------|------------|-------------------|----------|
| Calico | Full (+ GlobalNetworkPolicy) | No (iptables) | Yes (disable default CNI) | Traditional, well-documented, beginner-friendly |
| Cilium | Full (+ CiliumNetworkPolicy) | Yes | Yes (replace CNI) | Advanced features, observability, performance |
| Flannel | No | No | Yes (KIND default) | Simple overlay, NO NetworkPolicy |

**Recommendation for Module 5:** Use Calico (disable KIND's default Flannel, install Calico)

### Installation Commands

**Calico CNI for KIND (Module 5):**
```bash
# Create KIND cluster WITHOUT default CNI
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  disableDefaultCNI: true  # Don't install Flannel
  podSubnet: 192.168.0.0/16  # Calico's default
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

# Install Calico
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml

# Verify Calico pods running
kubectl wait --for=condition=ready --timeout=300s pod -l k8s-app=calico-node -n kube-system
```

**Helm (Module 6):**
```bash
# Install Helm 3
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
helm version
```

**Kubebuilder (Module 8):**
```bash
# Install Kubebuilder (macOS/Linux)
curl -L -o kubebuilder "https://go.kubebuilder.io/dl/latest/$(go env GOOS)/$(go env GOARCH)"
chmod +x kubebuilder && mv kubebuilder /usr/local/bin/

# Verify installation
kubebuilder version
```

**MCP Kubernetes Server (Module 9):**
```bash
# Install kubectl-mcp-server (Node.js based)
npx kubectl-mcp-server

# OR Python-based
pip install mcp-kubernetes-server
```

## Architecture Patterns

### Module 5: Security (NetworkPolicy, PSA, RBAC)

**Focus:** Application team security concerns (NOT cluster administration)

**Learning Sequence:**
```
Overview → NetworkPolicy (pod-to-pod control) → PSS/PSA (pod security baselines) → RBAC (application access) → Secrets management
```

**Example Voting App Security Evolution:**
- **Starting state:** No network policies (all pods can talk to all pods), default service accounts, secrets in plain env vars
- **Evolution:**
  - NetworkPolicy: Isolate namespaces, allow only vote→redis, worker→redis, worker→postgres, result→postgres
  - PSA: Apply "baseline" to voting-app namespace (block privileged containers)
  - RBAC: Create service accounts for vote/result/worker, limit permissions to what's needed
  - Secrets: Use Secret resources (not env vars), mount as volumes with restrictive permissions

**Lab Structure (4 tasks):**
1. **Task 1: Network Isolation with NetworkPolicy** - Default deny, then allow specific communication paths
2. **Task 2: Pod Security Standards** - Apply namespace-level PSA labels (enforce=baseline)
3. **Task 3: Service Accounts and RBAC** - Create least-privilege roles for app components
4. **Task 4: Secrets Management** - Move postgres/redis credentials to Secret resources

**Key Diagrams (3 diagrams):**
- NetworkPolicy traffic flow (before/after)
- PSS profile hierarchy (privileged → baseline → restricted)
- RBAC relationship diagram (ServiceAccount → RoleBinding → Role → Permissions)

**Common Pitfalls:**
- NetworkPolicy requires CNI support (Flannel doesn't support it - major gotcha)
- Default deny policies block DNS (must explicitly allow kube-dns)
- PSA enforced at namespace creation only (existing pods not affected)
- RBAC is additive (can't remove permissions granted by other bindings)

### Module 6: Helm for Real-World Applications

**Focus:** Converting Example Voting App to Helm chart progressively

**Learning Sequence:**
```
Overview → Chart structure → Templates and values → Dependencies → Lifecycle management
```

**Progressive Chart Development:**
- **Stage 1:** Helmify single component (vote service) - learn chart structure
- **Stage 2:** Add templating (values.yaml for replicas, image, resources)
- **Stage 3:** Create umbrella chart for entire Voting App (vote, result, worker, redis, postgres as subcharts)
- **Stage 4:** Add dependencies (redis/postgres from public charts)
- **Stage 5:** Lifecycle hooks (pre-install: database schema, post-upgrade: migration job)

**Lab Structure (5 tasks):**
1. **Task 1: Create First Chart (vote service)** - `helm create`, understand chart structure
2. **Task 2: Templatize Deployment** - Replace hardcoded values with {{ .Values.* }}
3. **Task 3: Add Chart Dependencies** - Use bitnami/redis chart as dependency
4. **Task 4: Build Umbrella Chart** - Combine all components (vote, result, worker + dependencies)
5. **Task 5: Lifecycle Hooks** - Add pre-install hook for postgres schema initialization

**Key Diagrams (3 diagrams):**
- Helm chart anatomy (directory structure with annotations)
- Template rendering flow (values → template → manifest)
- Chart dependencies graph (umbrella chart → subcharts)

**Common Pitfalls:**
- Over-templatization (making everything configurable = unmaintainable)
- Template syntax errors (missing quote, incorrect indentation in YAML templates)
- Chart dependencies version conflicts (redis chart v18 vs v19 breaking changes)
- Forgetting to run `helm dependency update` after adding dependencies
- Values.yaml structure doesn't match template paths (e.g., .Values.image vs .Values.vote.image)

### Module 7: Extending Kubernetes with CRDs

**Focus:** Create VoteConfig CRD to manage voting app configuration

**Learning Sequence:**
```
Overview → API extension concepts → CRD structure → Schema validation → Custom resource lifecycle
```

**VoteConfig CRD Design:**
```yaml
apiVersion: voting.example.com/v1
kind: VoteConfig
metadata:
  name: voting-options
spec:
  options:
  - id: "a"
    label: "Cats"
    color: "#0000FF"
  - id: "b"
    label: "Dogs"
    color: "#FF0000"
  title: "Vote for your favorite!"
  resultsTitle: "Voting Results"
```

**What VoteConfig Does:**
- Declarative API for voting app configuration (not ConfigMap YAML)
- Validates vote options (id required, color must be hex, etc.)
- Provides Kubernetes-native configuration (kubectl get voteconfigs)
- Sets foundation for operator (Module 8 will reconcile these)

**Lab Structure (4 tasks):**
1. **Task 1: Define CRD Schema** - Create CustomResourceDefinition with OpenAPI v3 validation
2. **Task 2: Apply CRD to Cluster** - `kubectl apply -f voteconfig-crd.yaml`, verify with `kubectl api-resources`
3. **Task 3: Create Custom Resources** - Write VoteConfig instances, test validation rules
4. **Task 4: Integration with Voting App** - Manually create ConfigMap from VoteConfig (operator automates this in Module 8)

**Key Diagrams (2 diagrams):**
- Kubernetes API extension architecture (API server → CRD controller → etcd)
- VoteConfig schema structure (spec/status sections with field types)

**Common Pitfalls:**
- Schema validation rules too permissive (missing required fields, wrong types accepted)
- Forgetting to set `storage: true` for one version (multiple versions must have exactly one storage version)
- CRD name doesn't match `plural.group` convention (e.g., voteconfigs.voting.example.com)
- Status subresource not enabled (can't update status separately from spec)

### Module 8: Building Kubernetes Operators (Workflow)

**Focus:** Build VoteConfig operator following School of DevOps learning sequence

**Inspiration Source:** https://kubernetes-tutorial.schoolofdevops.com/adv_operator_go/

**Learning Sequence (mirrors School of DevOps):**
```
Scaffold → Define API → Implement Controller → Build Image → Deploy → Enhance
```

**VoteConfig Operator Workflow:**
1. **Scaffold:** `kubebuilder init`, `kubebuilder create api --group voting --version v1 --kind VoteConfig`
2. **Define API:** Edit `api/v1/voteconfig_types.go` (Spec: options, Status: lastUpdated, configMapRef)
3. **Implement Controller:** Edit `controllers/voteconfig_controller.go` (Reconcile logic)
4. **Reconciliation Logic:**
   - Watch VoteConfig resources
   - Create/update ConfigMap with vote options JSON
   - Update vote Deployment to reference ConfigMap (trigger rolling update)
   - Update status.lastUpdated, status.configMapRef
5. **Build & Deploy:** `make docker-build docker-push deploy`
6. **Enhance:** Add validation webhooks, status conditions, finalizers

**Lab Structure (6 tasks - substantial lab, 60+ minutes):**
1. **Task 1: Scaffold Operator Project** - Initialize with Kubebuilder, understand structure
2. **Task 2: Define VoteConfig API** - Edit types.go, add Spec/Status fields, generate CRD
3. **Task 3: Implement Reconcile Logic** - Core controller code (create ConfigMap, update Deployment)
4. **Task 4: Test Locally** - `make run` (local mode), create VoteConfig, verify ConfigMap created
5. **Task 5: Build and Deploy Operator** - Build container, deploy to cluster, verify operator pod running
6. **Task 6 (Challenge): Add Validation Webhook** - Ensure vote option IDs are unique, colors are valid hex

**Key Diagrams (4 diagrams):**
- Operator pattern overview (watch → reconcile → actuate loop)
- Kubebuilder project structure (api/, controllers/, config/ explained)
- VoteConfig reconciliation flow (sequence diagram: VoteConfig created → operator detects → creates ConfigMap → updates Deployment)
- Controller-runtime components (Manager, Controller, Client, Cache)

**Common Pitfalls (from research):**
- **Non-idempotent reconciliation:** Reconcile() must be idempotent (can be called multiple times)
- **Conflict errors:** Updating Status causes "object has been modified" errors (use RetryOnConflict)
- **Long-running reconciliation:** Network calls without timeouts, slow reconcile loops
- **Forgetting RBAC markers:** `// +kubebuilder:rbac:` comments generate Role manifests
- **Not handling deleted resources:** Check if resource exists (`client.IgnoreNotFound(err)`)
- **Goroutine leaks:** Async operations without proper cleanup
- **Testing gaps:** Need unit tests for reconcile logic, integration tests for full workflow

**Operator Development Best Practices:**
- Keep reconcile logic simple (delegate complex operations to helper functions)
- Use status conditions (Ready, Degraded, Progressing - Kubernetes standard)
- Add finalizers for cleanup (delete ConfigMap when VoteConfig is deleted)
- Log reconciliation decisions (`log.Info("Creating ConfigMap", "name", configMapName)`)
- Handle partial failures gracefully (requeue with backoff)

### Module 9: Intro to Agentic Kubernetes

**Focus:** AI-assisted Kubernetes operations using Model Context Protocol

**Learning Sequence:**
```
Overview → Agentic AI concepts → MCP architecture → Kubernetes MCP server → Practical use cases
```

**What is Agentic Kubernetes:**
- AI agents that can observe, reason, and act on Kubernetes clusters
- Model Context Protocol (MCP) provides standardized tool interface for AI
- Enables conversational cluster operations ("show me pods with high memory" → agent queries metrics)
- Self-healing workflows (detect issue → diagnose → generate fix → apply)

**MCP Kubernetes Server Capabilities:**
- **Read operations:** kubectl get/describe wrapped as AI tools
- **Write operations:** kubectl apply/delete (configurable safety modes)
- **Troubleshooting tools:** Logs, events, resource status
- **Policy enforcement:** Read-only vs full-control modes

**Lab Structure (4 tasks - exploratory lab, not production deployment):**
1. **Task 1: Install MCP Kubernetes Server** - Deploy kubectl-mcp-server, configure for read-only access
2. **Task 2: Connect AI Agent** - Use Claude Desktop (or compatible client), configure MCP server
3. **Task 3: Conversational Cluster Queries** - Natural language queries ("which pods are not ready?", "show me recent errors")
4. **Task 4: AI-Assisted Troubleshooting** - Give agent a broken deployment (ImagePullBackOff), let it diagnose and suggest fix

**Key Diagrams (3 diagrams):**
- Agentic AI architecture (AI model → MCP protocol → K8s API)
- MCP tool catalog (read tools vs write tools, safety modes)
- Self-healing workflow example (detect alert → query cluster → generate fix → apply with approval)

**Scope Boundaries (Module 9 is INTRODUCTION only):**
- NOT building production AI operators (just exploring concepts)
- NOT autonomous production changes (human-in-the-loop for all writes)
- Focus on troubleshooting use cases (diagnostics, not automated remediation)
- Link to advanced resources (Kagent, Kubeagentics for production-grade frameworks)

**Common Pitfalls:**
- Over-trusting AI-generated kubectl commands (always review before execution)
- Running MCP server with full cluster-admin permissions (start read-only)
- Expecting 100% accuracy (AI can hallucinate, verify critical operations)
- Not understanding MCP protocol limitations (context window size, tool selection accuracy)

### Cross-Module Pattern: Example Voting App Production Readiness Journey

**Modules 5-9 Complete the Story:**

| Module | Production Aspect | Voting App Evolution |
|--------|------------------|---------------------|
| Module 5: Security | Defense-in-depth | NetworkPolicies isolate components, PSA prevents privilege escalation, RBAC limits service account permissions |
| Module 6: Helm | Deployment automation | Entire stack packaged as Helm chart, one command to deploy/upgrade, values.yaml for environment customization |
| Module 7: CRDs | Configuration as code | VoteConfig CRD provides Kubernetes-native config API (not raw ConfigMaps) |
| Module 8: Operators | Automation & reconciliation | VoteConfig operator automatically updates app when config changes, no manual kubectl apply |
| Module 9: Agentic K8s | AI-assisted operations | AI agent can troubleshoot issues, suggest config changes, monitor cluster health |

**Narrative Arc:**
- **Modules 0-4:** Made the app scalable, routable, and observable
- **Modules 5-9:** Make the app secure, maintainable, and operationally excellent

### Anti-Patterns to Avoid

**Don't:** Create NetworkPolicies after deploying app without DNS allowlist
**Why:** Breaks DNS resolution, pods can't look up service names
**Do instead:** Always include egress rule for kube-dns (port 53 UDP)

**Don't:** Over-templatize Helm charts (every field becomes a value)
**Why:** Makes charts unmaintainable, users overwhelmed with 100+ configuration options
**Do instead:** Template only what varies between environments (replicas, image, resources), hardcode sane defaults

**Don't:** Create complex CRD schemas with deeply nested objects
**Why:** Validation errors are cryptic, users struggle to write valid YAML
**Do instead:** Keep schema flat, use `oneOf`/`anyOf` sparingly, provide clear examples

**Don't:** Build operators that do everything in Reconcile()
**Why:** Long reconcile loops, difficult to test, poor error handling
**Do instead:** Reconcile orchestrates, delegates to helper functions, uses status conditions

**Don't:** Give AI agents write access to production clusters
**Why:** AI can hallucinate, execute destructive commands, no audit trail
**Do instead:** Start read-only, require human approval for writes, log all AI-suggested actions

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| NetworkPolicy enforcement | Custom iptables rules | Calico/Cilium CNI | Standard K8s API, vendor-neutral, auditable policies |
| Package management | Bash scripts with kubectl | Helm | De facto standard, version rollback, values templating, dependency management |
| Operator scaffolding | Manual controller code | Kubebuilder/Operator SDK | Generates boilerplate, follows best practices, includes testing framework |
| CRD validation | Admission webhook code | OpenAPI v3 schema in CRD | Declarative, API server validates before admission, no webhook complexity |
| RBAC generation | Manual Role YAML | Kubebuilder RBAC markers | Auto-generated from code comments, stays in sync with controller |
| AI-Kubernetes integration | Custom REST API wrapper | MCP Kubernetes Server | Standard protocol, multiple implementations, growing ecosystem |
| Helm chart documentation | Manual README.md | helm-docs | Auto-generated from values.yaml comments, stays up to date |
| Secrets encryption | Custom encryption scripts | Sealed Secrets / External Secrets Operator | Production-tested, GitOps compatible, key rotation support |

**Key insight:** Advanced Kubernetes patterns have established tools and frameworks. Custom solutions add maintenance burden, miss edge cases (RBAC is complex!), and break compatibility with ecosystem tools.

## Common Pitfalls

### Pitfall 1: NetworkPolicy Not Working (Flannel Default in KIND)

**What goes wrong:** NetworkPolicy resources created, no errors, but policies don't block traffic. All pods can still communicate freely.

**Why it happens:** KIND uses Flannel as default CNI. Flannel provides overlay networking but does NOT implement NetworkPolicy. Policies are created but ignored.

**How to avoid:**
- Create KIND cluster with `disableDefaultCNI: true`
- Install Calico or Cilium CNI explicitly
- Verify CNI supports NetworkPolicy: check vendor documentation
- Test policy enforcement: create deny-all, verify traffic actually blocked

**Warning signs:**
- NetworkPolicy resources exist (`kubectl get networkpolicy`) but have no effect
- No events or errors when applying policies
- Documentation says "NetworkPolicy requires CNI plugin support"

**Lab integration:** Module 5 Setup must install Calico CNI, include verification step showing NetworkPolicy blocks traffic

**Source:** [Kubernetes NetworkPolicy CNI requirements](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

### Pitfall 2: Helm Template Syntax Errors (Indentation in YAML)

**What goes wrong:** `helm install` fails with cryptic error like "error converting YAML to JSON: yaml: line 23: did not find expected key"

**Why it happens:** Helm templates produce YAML. Incorrect indentation in templates breaks YAML syntax. Common issues: `{{ .Values.image }}` adds extra spaces, `{{- if }}` removes needed newlines.

**How to avoid:**
- Use `helm template` to render locally before installing (catch errors early)
- Use `helm lint` to validate chart syntax
- Understand `-` in template tags: `{{-` removes whitespace before, `-}}` removes after
- Test with different values.yaml configurations

**Warning signs:**
- Error mentions "yaml:" or "JSON"
- Line numbers in error don't match template file (they're from rendered output)
- Indentation looks correct in template but broken in rendered YAML

**Lab integration:** Module 6 should include Task on debugging templates, show `helm template` workflow

**Source:** [Helm template debugging](https://helm.sh/docs/howto/charts_tips_and_tricks/)

### Pitfall 3: Operator Conflict Errors (Status Update Race Condition)

**What goes wrong:** Operator logs show "the object has been modified; please apply your changes to the latest version and try again"

**Why it happens:** Controller reads resource, makes decision, tries to update Status. Meanwhile another component (or concurrent reconcile) updates the resource. Version mismatch causes conflict.

**How to avoid:**
- Use `client.Status().Update()` not `client.Update()` for status (separate subresource)
- Use `RetryOnConflict` from client-go/util/retry
- Avoid updating Spec in reconcile loop (status only)
- Separate status updates from spec updates

**Code pattern:**
```go
import "k8s.io/client-go/util/retry"

err := retry.RetryOnConflict(retry.DefaultRetry, func() error {
    // Re-fetch latest version
    if err := r.Get(ctx, req.NamespacedName, &voteconfig); err != nil {
        return err
    }
    // Update status
    voteconfig.Status.LastUpdated = metav1.Now()
    return r.Status().Update(ctx, &voteconfig)
})
```

**Warning signs:**
- Operator pod logs show frequent "object has been modified" errors
- Reconcile loops retrying indefinitely
- Status updates not persisting

**Lab integration:** Module 8 Task 3 should include status update with RetryOnConflict pattern

**Source:** [Kubernetes operator best practices - conflict errors](https://alenkacz.medium.com/kubernetes-operators-best-practices-understanding-conflict-errors-d05353dff421)

### Pitfall 4: CRD Schema Too Permissive (Missing Validation)

**What goes wrong:** Users create invalid VoteConfig resources (missing required fields, wrong types), operator crashes trying to process them.

**Why it happens:** CRD created without `required` fields, type validation, or enum constraints. API server accepts anything that parses as YAML.

**How to avoid:**
- Mark critical fields as `required` in OpenAPI schema
- Use enums for constrained values: `enum: ["red", "blue", "green"]`
- Add pattern validation for strings: `pattern: "^#[0-9A-Fa-f]{6}$"` (hex colors)
- Set `minLength`, `maxLength`, `minimum`, `maximum` for bounds
- Test with invalid payloads (should be rejected at kubectl apply)

**Example schema (VoteConfig options):**
```yaml
options:
  type: array
  minItems: 2  # Must have at least 2 vote options
  items:
    type: object
    required:
    - id
    - label
    properties:
      id:
        type: string
        pattern: "^[a-z]$"  # Single lowercase letter
      label:
        type: string
        minLength: 1
        maxLength: 50
      color:
        type: string
        pattern: "^#[0-9A-Fa-f]{6}$"  # Hex color
```

**Warning signs:**
- Operator panics with nil pointer dereference (expected field is missing)
- Invalid configs accepted by API server
- Hard to debug "why isn't this working?" (config looks valid but semantically wrong)

**Lab integration:** Module 7 Task 1 should create schema with validation, Task 3 tests rejection of invalid configs

**Source:** [CRD validation guide](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)

### Pitfall 5: PSA Not Applied to Existing Pods

**What goes wrong:** Set namespace label `pod-security.kubernetes.io/enforce=baseline`, but existing pods still violate baseline (running as root, privileged containers).

**Why it happens:** Pod Security Admission evaluates pods at CREATE time only. Existing pods are grandfathered in. Namespace label doesn't trigger re-evaluation.

**How to avoid:**
- Apply PSA labels BEFORE deploying workloads (or to empty namespace)
- After adding labels, restart Deployments to create new pods: `kubectl rollout restart deployment -n voting-app`
- Use `warn` and `audit` modes first (detect violations without blocking)
- Check audit logs for violations: `kubectl get events --field-selector reason=FailedCreate`

**Namespace label pattern:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: voting-app
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/audit: restricted  # Log violations of stricter policy
    pod-security.kubernetes.io/warn: restricted   # Warn users about stricter policy
```

**Warning signs:**
- Namespace has PSA labels but pods still violate policy
- No errors or warnings during pod creation
- Confusion about "I set enforce=baseline but pods are still privileged"

**Lab integration:** Module 5 Task 2 must include rollout restart to demonstrate PSA enforcement

**Source:** [Pod Security Standards implementation](https://kubernetes.io/docs/concepts/security/pod-security-standards/)

### Pitfall 6: RBAC Too Broad (Service Accounts with cluster-admin)

**What goes wrong:** Create service account for vote app, bind to cluster-admin ClusterRole "to make it work". Vote service now has full cluster control.

**Why it happens:** RBAC denies by default. Easiest fix is cluster-admin. But this violates least-privilege principle - vote service shouldn't delete nodes!

**How to avoid:**
- Start with minimal permissions (get, list, watch on specific resources)
- Add permissions incrementally as needed (RBAC errors are helpful - tell you what's missing)
- Use Role (namespace-scoped) not ClusterRole unless truly cluster-wide access needed
- Audit RBAC bindings: `kubectl auth can-i --list --as=system:serviceaccount:voting-app:vote-sa`

**Example minimal Role (vote service):**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: vote-role
  namespace: voting-app
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "watch"]
  resourceNames: ["vote-config"]  # Only this specific ConfigMap
```

**Warning signs:**
- Service accounts bound to cluster-admin, admin, edit ClusterRoles
- Application pods have more permissions than humans
- Security audit flags overly permissive RBAC

**Lab integration:** Module 5 Task 3 should create least-privilege Roles, verify with `kubectl auth can-i`

**Source:** [RBAC best practices](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)

### Pitfall 7: Helm Dependency Version Conflicts

**What goes wrong:** Umbrella chart depends on `bitnami/redis:18.x` and `bitnami/postgresql:15.x`. Redis chart v18 requires Kubernetes 1.25+, cluster is 1.24. `helm install` fails.

**Why it happens:** Chart dependencies have their own Kubernetes version requirements. Umbrella chart doesn't validate transitive dependencies.

**How to avoid:**
- Lock dependency versions in Chart.yaml: `version: 18.1.0` (not `18.x`)
- Test `helm dependency update` in CI/CD (catches version conflicts early)
- Check dependency chart requirements: `helm show chart bitnami/redis`
- Use `helm dep list` to see resolved versions
- Consider vendoring dependencies (commit charts/ directory) for reproducibility

**Chart.yaml with locked dependencies:**
```yaml
dependencies:
- name: redis
  version: 18.1.0  # Exact version, not range
  repository: https://charts.bitnami.com/bitnami
  condition: redis.enabled
- name: postgresql
  version: 15.2.5
  repository: https://charts.bitnami.com/bitnami
  condition: postgresql.enabled
```

**Warning signs:**
- `helm install` fails with "incompatible Kubernetes version"
- Different environments have different dependency versions (non-reproducible)
- Dependency updates break existing deployments

**Lab integration:** Module 6 Task 3 should demonstrate dependency locking, show `helm dep list`

**Source:** [Helm chart dependencies](https://helm.sh/docs/topics/charts/)

### Pitfall 8: AI Agent Hallucinating kubectl Commands

**What goes wrong:** AI agent suggests `kubectl delete pod <pod-name> --force --grace-period=0` to "fix" a CrashLoopBackOff. User executes, pod is forcefully terminated, loses in-flight data.

**Why it happens:** AI models can generate plausible but incorrect/dangerous commands. No semantic understanding of consequences. Trained on internet examples that may be wrong.

**How to avoid:**
- ALWAYS review AI-suggested commands before execution
- Start MCP server in read-only mode (no write operations)
- Require human approval for destructive operations (delete, scale to 0)
- Use `--dry-run=client` to preview changes
- Validate suggestions against official docs
- Set up audit logging for AI-initiated actions

**Safe AI agent workflow:**
```
1. User: "Why is vote pod crashing?"
2. AI queries: kubectl describe pod vote-xxx
3. AI analyzes: "ImagePullBackOff - image not found"
4. AI suggests: kubectl set image deployment/vote vote=schoolofdevops/vote:v2
5. Human reviews suggestion
6. Human decides: approve / modify / reject
7. If approved: execute with audit log entry
```

**Warning signs:**
- AI suggests commands with `--force` flags
- AI recommends deleting resources without backups
- AI generates commands that don't match kubectl syntax
- AI suggests deprecated APIs

**Lab integration:** Module 9 should emphasize human-in-the-loop, show examples of reviewing AI suggestions

**Source:** [Building effective AI agents with MCP](https://developers.redhat.com/articles/2026/01/08/building-effective-ai-agents-mcp)

## Code Examples

Verified patterns from official sources and School of DevOps:

### Example 1: NetworkPolicy Default Deny + Selective Allow (Module 5)

```yaml
# 01-default-deny-all.yaml
# Deny all ingress and egress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: voting-app
spec:
  podSelector: {}  # Applies to all pods in namespace
  policyTypes:
  - Ingress
  - Egress
---
# 02-allow-dns.yaml
# Allow DNS queries (required for service discovery)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: voting-app
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
    ports:
    - protocol: UDP
      port: 53
---
# 03-vote-to-redis.yaml
# Allow vote service to communicate with redis
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: vote-to-redis
  namespace: voting-app
spec:
  podSelector:
    matchLabels:
      app: redis
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: vote
    ports:
    - protocol: TCP
      port: 6379
```

**Source:** [Kubernetes NetworkPolicy recipes](https://github.com/ahmetb/kubernetes-network-policy-recipes)

### Example 2: Namespace with Pod Security Admission (Module 5)

```yaml
# voting-app-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: voting-app
  labels:
    # Enforce baseline security (blocks privileged containers, host namespaces)
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/enforce-version: latest

    # Audit violations of restricted policy (most secure, but may be too strict)
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: latest

    # Warn users about restricted policy violations (helpful feedback)
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest
```

**Testing PSA enforcement:**
```bash
# Try to create privileged pod (should be denied)
kubectl run privileged-test --image=nginx --privileged -n voting-app

# Expected error:
# Error from server (Forbidden): pods "privileged-test" is forbidden:
# violates PodSecurity "baseline:latest": privileged (container "privileged-test" must not set securityContext.privileged=true)
```

**Source:** [Pod Security Admission configuration](https://kubernetes.io/docs/concepts/security/pod-security-admission/)

### Example 3: Helm Chart Structure (Module 6)

```
voting-app-chart/
├── Chart.yaml              # Chart metadata (name, version, dependencies)
├── values.yaml             # Default configuration values
├── charts/                 # Dependency charts (after helm dep update)
│   ├── redis-18.1.0.tgz
│   └── postgresql-15.2.5.tgz
├── templates/
│   ├── NOTES.txt           # Post-install instructions
│   ├── _helpers.tpl        # Template helpers (reusable snippets)
│   ├── vote-deployment.yaml
│   ├── vote-service.yaml
│   ├── result-deployment.yaml
│   ├── result-service.yaml
│   ├── worker-deployment.yaml
│   └── tests/
│       └── test-connection.yaml
└── README.md               # Chart documentation (auto-generated by helm-docs)
```

**Chart.yaml example:**
```yaml
apiVersion: v2
name: voting-app
description: Example Voting App - Multi-tier Kubernetes application
type: application
version: 1.0.0  # Chart version (incremented on changes)
appVersion: "v1"  # Application version (matches vote image tag)

dependencies:
- name: redis
  version: 18.1.0
  repository: https://charts.bitnami.com/bitnami
  condition: redis.enabled  # Can be disabled via values.yaml
- name: postgresql
  version: 15.2.5
  repository: https://charts.bitnami.com/bitnami
  condition: postgresql.enabled
```

**values.yaml example:**
```yaml
vote:
  replicaCount: 2
  image:
    repository: schoolofdevops/vote
    tag: v1
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 80
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi

result:
  replicaCount: 2
  image:
    repository: schoolofdevops/result
    tag: v1
  service:
    type: ClusterIP
    port: 80

worker:
  replicaCount: 1
  image:
    repository: schoolofdevops/worker
    tag: v1
  resources:
    limits:
      cpu: 200m
      memory: 256Mi

# Dependency chart configuration
redis:
  enabled: true
  auth:
    enabled: false  # Simplified for learning (use auth in production!)

postgresql:
  enabled: true
  auth:
    username: postgres
    password: postgres
    database: votes
```

**Template example (vote-deployment.yaml):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "voting-app.fullname" . }}-vote
  labels:
    {{- include "voting-app.labels" . | nindent 4 }}
    component: vote
spec:
  replicas: {{ .Values.vote.replicaCount }}
  selector:
    matchLabels:
      {{- include "voting-app.selectorLabels" . | nindent 6 }}
      component: vote
  template:
    metadata:
      labels:
        {{- include "voting-app.selectorLabels" . | nindent 8 }}
        component: vote
    spec:
      containers:
      - name: vote
        image: "{{ .Values.vote.image.repository }}:{{ .Values.vote.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.vote.image.pullPolicy }}
        ports:
        - containerPort: 80
          name: http
        resources:
          {{- toYaml .Values.vote.resources | nindent 10 }}
```

**Source:** [Helm chart best practices](https://helm.sh/docs/chart_best_practices/)

### Example 4: VoteConfig CRD Definition (Module 7)

```yaml
# voteconfig-crd.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: voteconfigs.voting.example.com
spec:
  group: voting.example.com
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            required:
            - options
            properties:
              options:
                type: array
                minItems: 2
                maxItems: 10
                items:
                  type: object
                  required:
                  - id
                  - label
                  properties:
                    id:
                      type: string
                      pattern: "^[a-z]$"
                      description: "Single lowercase letter (a-z)"
                    label:
                      type: string
                      minLength: 1
                      maxLength: 50
                      description: "Display label for vote option"
                    color:
                      type: string
                      pattern: "^#[0-9A-Fa-f]{6}$"
                      description: "Hex color code (e.g., #FF0000)"
              title:
                type: string
                default: "Vote Now!"
                description: "Voting page title"
              resultsTitle:
                type: string
                default: "Results"
                description: "Results page title"
          status:
            type: object
            properties:
              configMapRef:
                type: string
                description: "Name of generated ConfigMap"
              lastUpdated:
                type: string
                format: date-time
                description: "Timestamp of last update"
              conditions:
                type: array
                items:
                  type: object
                  properties:
                    type:
                      type: string
                    status:
                      type: string
                    lastTransitionTime:
                      type: string
                      format: date-time
                    reason:
                      type: string
                    message:
                      type: string
    subresources:
      status: {}  # Enable status subresource (update status separately)
    additionalPrinterColumns:
    - name: Options
      type: integer
      jsonPath: .spec.options[*].id
      description: Number of vote options
    - name: ConfigMap
      type: string
      jsonPath: .status.configMapRef
      description: Generated ConfigMap name
    - name: Age
      type: date
      jsonPath: .metadata.creationTimestamp
  scope: Namespaced
  names:
    plural: voteconfigs
    singular: voteconfig
    kind: VoteConfig
    shortNames:
    - vc
```

**VoteConfig custom resource example:**
```yaml
# cats-vs-dogs-config.yaml
apiVersion: voting.example.com/v1
kind: VoteConfig
metadata:
  name: cats-vs-dogs
  namespace: voting-app
spec:
  title: "Cats vs Dogs - The Ultimate Showdown"
  resultsTitle: "And the winner is..."
  options:
  - id: "a"
    label: "Cats"
    color: "#FF6B6B"
  - id: "b"
    label: "Dogs"
    color: "#4ECDC4"
```

**Source:** [Kubernetes CRD schema validation](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)

### Example 5: Operator Reconcile Logic (Module 8)

```go
// controllers/voteconfig_controller.go
package controllers

import (
    "context"
    "encoding/json"

    corev1 "k8s.io/api/core/v1"
    appsv1 "k8s.io/api/apps/v1"
    "k8s.io/apimachinery/pkg/api/errors"
    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
    "k8s.io/apimachinery/pkg/runtime"
    "k8s.io/apimachinery/pkg/types"
    ctrl "sigs.k8s.io/controller-runtime"
    "sigs.k8s.io/controller-runtime/pkg/client"
    "sigs.k8s.io/controller-runtime/pkg/log"

    votingv1 "github.com/example/voting-operator/api/v1"
)

// VoteConfigReconciler reconciles a VoteConfig object
type VoteConfigReconciler struct {
    client.Client
    Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=voting.example.com,resources=voteconfigs,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=voting.example.com,resources=voteconfigs/status,verbs=get;update;patch
// +kubebuilder:rbac:groups="",resources=configmaps,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;update;patch

func (r *VoteConfigReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    log := log.FromContext(ctx)

    // 1. Fetch the VoteConfig resource
    var voteConfig votingv1.VoteConfig
    if err := r.Get(ctx, req.NamespacedName, &voteConfig); err != nil {
        if errors.IsNotFound(err) {
            // Resource deleted, nothing to do
            return ctrl.Result{}, nil
        }
        log.Error(err, "Failed to get VoteConfig")
        return ctrl.Result{}, err
    }

    // 2. Generate ConfigMap data from VoteConfig spec
    configData, err := r.generateConfigMapData(&voteConfig)
    if err != nil {
        log.Error(err, "Failed to generate ConfigMap data")
        return ctrl.Result{}, err
    }

    // 3. Create or update ConfigMap
    configMapName := voteConfig.Name + "-config"
    configMap := &corev1.ConfigMap{
        ObjectMeta: metav1.ObjectMeta{
            Name:      configMapName,
            Namespace: voteConfig.Namespace,
        },
        Data: configData,
    }

    // Set VoteConfig as owner (for garbage collection)
    if err := ctrl.SetControllerReference(&voteConfig, configMap, r.Scheme); err != nil {
        return ctrl.Result{}, err
    }

    // Create or update ConfigMap
    existingConfigMap := &corev1.ConfigMap{}
    err = r.Get(ctx, types.NamespacedName{Name: configMapName, Namespace: voteConfig.Namespace}, existingConfigMap)
    if err != nil && errors.IsNotFound(err) {
        // Create new ConfigMap
        if err := r.Create(ctx, configMap); err != nil {
            log.Error(err, "Failed to create ConfigMap")
            return ctrl.Result{}, err
        }
        log.Info("Created ConfigMap", "name", configMapName)
    } else if err == nil {
        // Update existing ConfigMap
        existingConfigMap.Data = configData
        if err := r.Update(ctx, existingConfigMap); err != nil {
            log.Error(err, "Failed to update ConfigMap")
            return ctrl.Result{}, err
        }
        log.Info("Updated ConfigMap", "name", configMapName)
    } else {
        return ctrl.Result{}, err
    }

    // 4. Trigger vote Deployment rolling update (update annotation to force restart)
    deployment := &appsv1.Deployment{}
    err = r.Get(ctx, types.NamespacedName{Name: "vote", Namespace: voteConfig.Namespace}, deployment)
    if err == nil {
        // Add/update annotation to trigger rolling update
        if deployment.Spec.Template.Annotations == nil {
            deployment.Spec.Template.Annotations = make(map[string]string)
        }
        deployment.Spec.Template.Annotations["voteconfig.voting.example.com/updated-at"] = metav1.Now().String()

        if err := r.Update(ctx, deployment); err != nil {
            log.Error(err, "Failed to update vote Deployment")
            return ctrl.Result{}, err
        }
        log.Info("Triggered vote Deployment rolling update")
    }

    // 5. Update VoteConfig status
    voteConfig.Status.ConfigMapRef = configMapName
    voteConfig.Status.LastUpdated = metav1.Now()
    if err := r.Status().Update(ctx, &voteConfig); err != nil {
        log.Error(err, "Failed to update VoteConfig status")
        return ctrl.Result{}, err
    }

    return ctrl.Result{}, nil
}

func (r *VoteConfigReconciler) generateConfigMapData(voteConfig *votingv1.VoteConfig) (map[string]string, error) {
    // Convert VoteConfig options to JSON for consumption by vote app
    optionsJSON, err := json.Marshal(voteConfig.Spec.Options)
    if err != nil {
        return nil, err
    }

    return map[string]string{
        "options.json": string(optionsJSON),
        "title":        voteConfig.Spec.Title,
        "resultsTitle": voteConfig.Spec.ResultsTitle,
    }, nil
}

func (r *VoteConfigReconciler) SetupWithManager(mgr ctrl.Manager) error {
    return ctrl.NewControllerManagedBy(mgr).
        For(&votingv1.VoteConfig{}).
        Owns(&corev1.ConfigMap{}).  // Watch ConfigMaps owned by VoteConfig
        Complete(r)
}
```

**Source:** [Kubebuilder tutorial](https://book.kubebuilder.io/cronjob-tutorial/controller-implementation.html) and School of DevOps operator pattern

### Example 6: Testing Operator Locally (Module 8)

```bash
# Task 4: Test operator locally (before deploying to cluster)

# 1. Install CRD into cluster
make install

# Verify CRD installed
kubectl get crd voteconfigs.voting.example.com

# 2. Run operator locally (watches cluster, runs on your machine)
make run

# Output shows operator watching for VoteConfig resources:
# INFO    controller.voteconfig   Starting EventSource
# INFO    controller.voteconfig   Starting Controller
# INFO    controller.voteconfig   Starting workers

# 3. In separate terminal, deploy Example Voting App
kubectl create namespace voting-app
kubectl apply -f examples/voting-app-base.yaml -n voting-app

# 4. Create VoteConfig resource
kubectl apply -f config/samples/voting_v1_voteconfig.yaml

# 5. Watch operator logs (first terminal)
# Should see reconciliation logs:
# INFO    controller.voteconfig   Created ConfigMap   {"name": "cats-vs-dogs-config"}
# INFO    controller.voteconfig   Triggered vote Deployment rolling update

# 6. Verify ConfigMap created
kubectl get configmap -n voting-app
kubectl describe configmap cats-vs-dogs-config -n voting-app

# 7. Verify vote Deployment updated
kubectl get deployment vote -n voting-app -o yaml | grep voteconfig

# Expected: annotation showing update timestamp

# 8. Test update scenario - modify VoteConfig
kubectl edit voteconfig cats-vs-dogs -n voting-app
# Change title, add new vote option

# Watch operator logs - should see reconciliation triggered

# 9. Clean up
kubectl delete voteconfig cats-vs-dogs -n voting-app
# ConfigMap should be automatically deleted (owner reference)
```

**Source:** [Kubebuilder quick start](https://book.kubebuilder.io/quick-start.html)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pod Security Policies (PSP) | Pod Security Admission (PSA) | PSP removed in K8s 1.25 (2022) | PSA is built-in, namespace-scoped, simpler configuration |
| Helm 2 (Tiller server) | Helm 3 (client-only) | Helm 3 GA Nov 2019 | No cluster-side Tiller, improved security, 3-way merge |
| Helm 3.x | Helm 4.x | Helm 4.0 released Nov 2025 | OCI registry default, improved performance, Go 1.22+ required |
| Manual RBAC YAML | Kubebuilder RBAC markers | Kubebuilder 2.0+ (2020) | Auto-generate RBAC from code comments, stays in sync |
| Operator SDK v0.x (Ansible/Helm) | Operator SDK v1.x (Go/Kubebuilder) | v1.0 Apr 2021 | Go-first approach, Kubebuilder 3.x integration |
| Custom AI-K8s integrations | Model Context Protocol (MCP) | MCP spec released 2024 | Standardized tool interface, vendor-neutral |
| CRD v1beta1 | CRD v1 | v1 GA in K8s 1.16 (2019) | Required schema validation, better versioning |

**Deprecated/outdated:**
- **Pod Security Policies:** Removed in Kubernetes 1.25. Use Pod Security Admission.
- **Helm 2 with Tiller:** End-of-life Nov 2020. Use Helm 3.
- **Operator SDK Ansible/Helm operators for new projects:** Go operators are preferred (better integration, more control).
- **NetworkPolicy with Flannel CNI:** Flannel doesn't support NetworkPolicy. Use Calico/Cilium.
- **CRD v1beta1 API:** Use apiextensions.k8s.io/v1 (v1beta1 removed in K8s 1.22).

**Emerging patterns:**
- **eBPF-based CNI (Cilium):** Better performance, kernel-level network security, advanced observability
- **Agentic Kubernetes:** AI agents for cluster operations (Kagent, Kubeagentics frameworks)
- **MCP as standard protocol:** Multiple K8s MCP server implementations (kubectl-mcp-server, Azure mcp-kubernetes)
- **Helm OCI registries:** Helm 4 defaults to OCI registries (not HTTP chart repos)
- **CRD validation with CEL:** Common Expression Language for advanced validation (K8s 1.25+)
- **Gateway API for service mesh:** Using Gateway API as mesh configuration layer (experimental)

**Source:** Kubernetes blog, Helm releases, CNCF landscape, operator-framework updates

## Open Questions

### Question 1: Module 8 Operator - Use Kubebuilder or Operator SDK?

**What we know:** Both scaffold Go operators, use controller-runtime. Operator SDK wraps Kubebuilder with higher-level abstractions. School of DevOps tutorial doesn't specify which.

**What's unclear:** Which provides better learning experience for intermediate course?

**Recommendation:** Use Kubebuilder (not Operator SDK)

**Rationale:**
- Kubebuilder is official Kubernetes SIG project (closer to "upstream")
- Simpler tool chain (one tool, not SDK wrapping another tool)
- School of DevOps pattern works with both (scaffold → API → controller)
- Operator SDK adds abstraction that obscures controller-runtime concepts
- Latest Kubebuilder (v4.11) has AI migration helpers, excellent docs

**Implementation:** Module 8 uses `kubebuilder init` and `kubebuilder create api`

**Confidence:** HIGH (Kubebuilder is more pedagogically transparent)

### Question 2: Module 5 CNI Choice - Calico or Cilium?

**What we know:** Both support NetworkPolicy, work with KIND. Calico is traditional (iptables), Cilium is modern (eBPF).

**What's unclear:** Which is better for intermediate learners focusing on NetworkPolicy basics?

**Recommendation:** Use Calico (not Cilium)

**Rationale:**
- Calico is more widely deployed (learners likely to see it in jobs)
- Simpler architecture (iptables is well-understood)
- Better beginner documentation for NetworkPolicy
- Cilium's eBPF advantages (performance, observability) aren't needed for learning NetworkPolicy basics
- Calico installation is straightforward in KIND

**Implementation:** Module 5 Setup installs Calico, focuses on standard NetworkPolicy API (not Calico-specific extensions)

**Confidence:** MEDIUM (Cilium is growing, but Calico is safer pedagogical choice)

### Question 3: Module 6 Helm - Teach Helm 3 or Helm 4?

**What we know:** Helm 4 just released (Nov 2025), Helm 3 supported until Nov 2026. Helm 4 has breaking changes (OCI default, Go 1.22+ required).

**What's unclear:** Should course teach current stable (Helm 3) or latest (Helm 4)?

**Recommendation:** Teach Helm 3.20+ with Helm 4 awareness

**Rationale:**
- Helm 3 still receives updates until Nov 2026 (course lifespan)
- Most production environments still on Helm 3 (migration takes time)
- Core concepts identical (charts, values, templates)
- Helm 4 differences are operational (OCI repos) not conceptual
- Mention Helm 4 in reading materials ("Helm 4 is available, uses OCI registries by default")

**Implementation:** `helm version` shows 3.20+, reading materials mention Helm 4 evolution

**Confidence:** MEDIUM (depends on course timeline - revisit if launching in late 2026)

### Question 4: Module 9 MCP Server - Which Implementation?

**What we know:** Multiple MCP Kubernetes server implementations exist (kubectl-mcp-server, Azure mcp-kubernetes, containers/kubernetes-mcp-server).

**What's unclear:** Which is best for introductory module?

**Recommendation:** Use `kubectl-mcp-server` (npm package)

**Rationale:**
- Simplest installation: `npx kubectl-mcp-server` (no compilation)
- 253 Kubernetes tools (comprehensive)
- Active development (recent commits)
- Good documentation
- Works with Claude Desktop (user's likely client)

**Alternative:** `mcp-kubernetes-server` (Python) if learners prefer pip over npm

**Implementation:** Module 9 Task 1 uses kubectl-mcp-server with read-only mode configuration

**Confidence:** LOW (MCP ecosystem is very new, implementations evolving rapidly)

**Follow-up needed:** Test both implementations before Module 9 creation

## Sources

### Primary (HIGH confidence)

- [Kubernetes NetworkPolicy Official Documentation](https://kubernetes.io/docs/concepts/services-networking/network-policies/) - NetworkPolicy API, CNI requirements
- [Kubernetes Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) - PSA/PSS policies, enforcement modes
- [Kubernetes RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) - Role, RoleBinding, ServiceAccount concepts
- [Helm Official Documentation](https://helm.sh/docs/) - Chart structure, templates, best practices
- [Helm Releases (GitHub)](https://github.com/helm/helm/releases) - Version information, Helm 4 release notes
- [Kubernetes CRD Documentation](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/) - CRD API, schema validation
- [Kubebuilder Book](https://book.kubebuilder.io/) - Operator development tutorial, controller-runtime patterns
- [Kubebuilder Releases (GitHub)](https://github.com/kubernetes-sigs/kubebuilder/releases) - Version compatibility
- [Operator SDK Documentation](https://sdk.operatorframework.io/docs/building-operators/golang/tutorial/) - Go operator tutorial
- [School of DevOps Operator Tutorial](https://kubernetes-tutorial.schoolofdevops.com/adv_operator_go/) - Learning sequence, pedagogical approach
- [Calico Documentation](https://docs.tigera.io/calico/latest/) - CNI installation, NetworkPolicy implementation
- [Cilium Documentation](https://docs.cilium.io/) - eBPF-based CNI, NetworkPolicy support

### Secondary (MEDIUM confidence)

- [NetworkPolicy Recipes (GitHub)](https://github.com/ahmetb/kubernetes-network-policy-recipes) - Common patterns, examples
- [How to Debug Network Policy Issues with Cilium or Calico](https://oneuptime.com/blog/post/2026-01-08-kubernetes-network-policies-cilium-calico-debugging/view) - Troubleshooting guide
- [Helm Chart Best Practices](https://helm.sh/docs/chart_best_practices/) - Template patterns, values organization
- [Helm Troubleshooting Common Errors](https://oneuptime.com/blog/post/2026-01-17-helm-troubleshooting-common-errors/view) - Common mistakes
- [Kubernetes Operator Best Practices - Conflict Errors](https://alenkacz.medium.com/kubernetes-operators-best-practices-understanding-conflict-errors-d05353dff421) - Status update patterns
- [Operator SDK Best Practices](https://sdk.operatorframework.io/docs/best-practices/common-recommendation/) - Idempotency, concurrency
- [Kubebuilder Good Practices](https://book.kubebuilder.io/reference/good-practices) - Controller patterns
- [GitHub: kubectl-mcp-server](https://github.com/rohitg00/kubectl-mcp-server) - MCP Kubernetes server implementation
- [GitHub: Azure mcp-kubernetes](https://github.com/Azure/mcp-kubernetes) - Alternative MCP implementation
- [Kagent - Agentic AI for Kubernetes](https://kagent.dev/) - Production agentic framework
- [Building Effective AI Agents with MCP](https://developers.redhat.com/articles/2026/01/08/building-effective-ai-agents-mcp) - MCP architecture, use cases

### Tertiary (LOW confidence)

- Community blog posts on Helm chart anti-patterns - Various perspectives
- Service mesh + Gateway API integration patterns - Experimental features
- Cilium vs Calico comparison articles - Some vendor-biased
- AI-Kubernetes integration predictions - Speculative, rapidly evolving space

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools verified via official docs, version numbers confirmed
- Module 5 (Security): HIGH - NetworkPolicy/PSA/RBAC are stable Kubernetes features, well-documented
- Module 6 (Helm): HIGH - Helm 3 is mature, chart patterns well-established
- Module 7 (CRDs): HIGH - CRD v1 API is stable, validation patterns documented
- Module 8 (Operators): HIGH - Kubebuilder/controller-runtime patterns proven, School of DevOps sequence validated
- Module 9 (Agentic K8s): MEDIUM - MCP is emerging standard (2024), implementations very new, ecosystem evolving
- VoteConfig operator use case: HIGH - User-suggested pattern is pedagogically sound, realistic complexity
- CNI choice (Calico vs Cilium): MEDIUM - Both work, pedagogical preference
- Helm version (v3 vs v4): MEDIUM - Timing-dependent decision

**Research date:** 2026-02-09
**Valid until:** 2026-04-09 (60 days - Kubernetes APIs stable, but MCP ecosystem evolving rapidly)

**Requirements covered:**
- CONTENT-06 through CONTENT-10: ✅ Research covers all 5 modules
- LAB-06 through LAB-10: ✅ Lab patterns, structure, verification documented
- QUIZ-06 through QUIZ-10: ✅ Quiz patterns from Phase 3 apply (scenario-based, 10-15 questions)
- CONTENT-11: ✅ 10-20 minute read time target maintained
- CONTENT-12: ✅ Simple language, conversational tone (same as Phase 3)
- LAB-11: ✅ Clear setup/outcomes (8-section template from Phase 2/3)
- LAB-12: ✅ kubectl verification + functional testing patterns
- LAB-13: ✅ KIND cluster compatibility verified (CNI, tools)
- LAB-14: ✅ Step-by-step commands with expected outputs
- LAB-15: ✅ Example Voting App evolution continues (security → Helm → CRD → operator)

**Next steps for planning:**
1. Create detailed task breakdowns for Module 5-9 labs (4-6 tasks each)
2. Design VoteConfig CRD schema with validation rules (Module 7)
3. Map operator reconciliation workflow steps (Module 8)
4. Identify NetworkPolicy patterns for Voting App (vote→redis, worker→redis/postgres, result→postgres)
5. Design Helm chart structure (umbrella chart with subcharts)
6. Research MCP server configuration options (read-only mode, tool filtering)
7. Create Mermaid diagram pseudocode for each module (2-4 diagrams per module)
