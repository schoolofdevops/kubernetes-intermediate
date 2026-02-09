# Quiz: Module 5 - Security (NetworkPolicy, PSA, RBAC)

**Module:** 5
**Topic:** Security (NetworkPolicy, PSA, RBAC)
**Question Count:** 14

---

## Question 1: NetworkPolicy CNI Requirement

**Question Type:** Multiple Choice

**Question:**
You create a NetworkPolicy in your KIND cluster to block all traffic to your redis pod. After applying the policy, you test and find that the vote service can still reach redis. What is the MOST LIKELY cause?

**Options:**

A) The NetworkPolicy syntax is incorrect and was rejected by the API server
B) KIND uses Flannel CNI by default, which does not enforce NetworkPolicies
C) NetworkPolicy requires cluster-admin permissions to enforce
D) The podSelector doesn't match the redis pod labels

**Correct Answer:** B

**Explanation:**
KIND uses Flannel as its default CNI plugin. Flannel provides overlay networking but does NOT implement NetworkPolicy enforcement. Policies are created successfully (the API server accepts them) but they have no effect on traffic. To enforce NetworkPolicies in KIND, you must disable the default CNI and install a NetworkPolicy-capable CNI like Calico or Cilium. Option A is incorrect because the API server would reject invalid syntax. Option C is incorrect because NetworkPolicy enforcement doesn't require special permissions. Option D could cause issues but wouldn't explain why ALL traffic is allowed.

---

## Question 2: DNS Allowlist Requirement

**Question Type:** Scenario

**Context:**
You apply a default-deny NetworkPolicy to the voting-app namespace that blocks all ingress and egress traffic. Then you add specific NetworkPolicy rules allowing vote to communicate with redis on port 6379. However, when you test the application, the vote service still cannot reach redis even though you've explicitly allowed the traffic.

**Question:**
What is the MOST LIKELY missing configuration?

**Options:**

A) You forgot to add an ingress rule to the vote service to allow incoming traffic from users
B) You forgot to allow DNS queries to kube-dns, so services cannot resolve each other's names
C) You forgot to restart the vote Deployment after applying the NetworkPolicy
D) You forgot to create a NetworkPolicy for the redis service to allow outbound responses

**Correct Answer:** B

**Explanation:**
With a default-deny NetworkPolicy, all egress traffic is blocked, including DNS queries. Pods use kube-dns (in the kube-system namespace) to resolve service names like "redis" to ClusterIP addresses. Without a NetworkPolicy allowing egress to kube-dns on UDP port 53, service discovery fails. The vote pod cannot resolve "redis" to an IP address, so it cannot connect even though the vote-to-redis traffic is explicitly allowed. This is the number one gotcha with NetworkPolicy. Option A addresses user access but doesn't fix service-to-service communication. Option C is incorrect because NetworkPolicy changes take effect immediately without restarts. Option D is incorrect because responses to allowed connections are automatically permitted (stateful firewall behavior).

---

## Question 3: PSA Evaluation Timing

**Question Type:** True/False

**Question:**
Pod Security Admission continuously evaluates running pods and evicts any pods that violate the security policy when you add PSA labels to a namespace.

**Correct Answer:** False

**Explanation:**
Pod Security Admission evaluates pods ONLY at creation time. Existing pods are grandfathered in and continue running even if they violate the newly applied PSA policy. This is indicated by "IgnoredDuringExecution" in the PSA terminology. To enforce PSA on existing workloads, you must trigger pod recreation by performing a rolling restart: `kubectl rollout restart deployment -n voting-app`. This creates new pods that are evaluated against the current PSA policy.

---

## Question 4: PSA Profile Hierarchy

**Question Type:** Multiple Choice

**Question:**
Your voting-app namespace has the following PSA configuration: enforce=baseline, audit=restricted. You try to create a pod that runs as root (uid 0) with all capabilities dropped. What will happen?

**Options:**

A) The pod is blocked because baseline requires non-root users
B) The pod is created successfully with no warnings
C) The pod is created successfully but generates an audit log warning about not meeting the restricted profile
D) The pod is blocked because restricted is stricter than baseline

**Correct Answer:** C

**Explanation:**
The baseline profile allows running as root. It only blocks known privilege escalations like privileged containers, host namespaces, and hostPath mounts. Since enforce=baseline, the pod will be created successfully. However, the restricted profile requires pods to run as non-root users. Since audit=restricted, the pod creation will generate an audit log warning indicating it violates the restricted profile. The pod is NOT blocked because restricted is only in audit mode, not enforce mode. This configuration allows you to enforce basic security (baseline) while collecting data on what would break with stricter policies (restricted).

---

## Question 5: NetworkPolicy Default Behavior

**Question Type:** True/False

**Question:**
In Kubernetes, if no NetworkPolicy exists in a namespace, all pod-to-pod communication is blocked by default as a security measure.

**Correct Answer:** False

**Explanation:**
The opposite is true. Kubernetes networking is completely open by default. If no NetworkPolicy exists, any pod can communicate with any other pod on any port. This "flat network" model makes development easy but creates security risks in production. NetworkPolicy must be explicitly created to restrict traffic. The recommended pattern is to start with a default-deny policy (blocking all traffic) and then add specific allow rules for required communication paths.

---

## Question 6: RBAC Least Privilege

**Question Type:** Scenario

**Context:**
You're creating a ServiceAccount for the vote service in the Voting App. The vote service needs to read a ConfigMap named "vote-config" to load its configuration. You're deciding what permissions to grant.

**Question:**
Which Role definition follows the principle of least privilege?

**Options:**

A) Grant get/list/watch on all ConfigMaps in the namespace
B) Grant get/list/watch/create/update/delete on the specific vote-config ConfigMap
C) Grant get/list/watch on all resources in the namespace
D) Bind the vote-sa to the cluster-admin ClusterRole

**Correct Answer:** A

**Explanation:**
While ideally you would restrict to only the vote-config ConfigMap, Kubernetes RBAC rules operate at the resource type level, not the instance level (you can use resourceNames for further restriction, but it's an advanced pattern). Option A grants read-only access (get/list/watch) to ConfigMaps in the namespace, which is the minimum needed. Option B grants unnecessary write permissions (create/update/delete) that the vote service doesn't need. Option C is overly broad, granting access to all resource types. Option D is extremely dangerous - cluster-admin grants full control over the entire cluster, violating least privilege catastrophically. For production, you could further restrict to resourceNames: ["vote-config"] to limit access to just that specific ConfigMap.

---

## Question 7: Secret Volume Mounts vs Environment Variables

**Question Type:** Multiple Choice

**Question:**
What is the PRIMARY security advantage of mounting Secrets as volumes instead of exposing them as environment variables?

**Options:**

A) Volume-mounted secrets are encrypted at rest while environment variables are not
B) Volume-mounted secrets are not visible in `kubectl describe pod` output while environment variables are
C) Volume-mounted secrets can be accessed by multiple containers while environment variables cannot
D) Volume-mounted secrets automatically rotate when the Secret is updated while environment variables do not

**Correct Answer:** B

**Explanation:**
The primary security advantage is visibility. Environment variables are displayed in `kubectl describe pod` output, making credentials visible to anyone with read access to pods. Volume-mounted secrets store credentials as files, which are not shown in pod descriptions. Option D is also true (volume-mounted secrets do auto-update while env vars don't), but this is an operational advantage, not primarily a security advantage. Option A is incorrect - both use the same underlying Secret resource with base64 encoding (not encryption). Option C is incorrect - both approaches can be used by multiple containers.

---

## Question 8: Pod Security Standard Profiles

**Question Type:** Multiple Choice

**Question:**
Which Pod Security Standard profile would BLOCK a pod that runs as root (uid 0) but otherwise has no special privileges?

**Options:**

A) Privileged profile
B) Baseline profile
C) Restricted profile
D) None of the above - running as root is always allowed

**Correct Answer:** C

**Explanation:**
The restricted profile requires pods to run as non-root users and enforces additional hardening best practices like dropping all capabilities and disallowing privilege escalation. The baseline profile blocks known privilege escalations (privileged containers, host namespaces, hostPath mounts) but allows running as root. The privileged profile allows everything, including root. Only the restricted profile enforces the non-root requirement.

---

## Question 9: RBAC Additive Nature

**Question Type:** True/False

**Question:**
If multiple RoleBindings grant different permissions to the same ServiceAccount, Kubernetes combines all permissions and the ServiceAccount has the union of all granted access.

**Correct Answer:** True

**Explanation:**
RBAC is additive. Multiple RoleBindings can grant permissions to the same ServiceAccount, and Kubernetes combines all permissions. There is no way to "subtract" or "deny" permissions in RBAC. If any RoleBinding grants a permission, the ServiceAccount has it. This is important for troubleshooting - if a ServiceAccount has unexpected permissions, check all RoleBindings and ClusterRoleBindings that reference it. The only way to remove a permission is to delete the RoleBinding that grants it.

---

## Question 10: Base64 Encoding in Secrets

**Question Type:** True/False

**Question:**
Kubernetes Secrets use base64 encoding, which provides strong encryption to protect credentials from unauthorized access.

**Correct Answer:** False

**Explanation:**
Base64 is encoding, NOT encryption. It's trivially reversible - anyone can decode base64 data with `echo <string> | base64 -d`. Secrets are stored in etcd in base64-encoded form, meaning anyone with etcd access can read them. Base64 is used to handle binary data and special characters, not for security. For production, consider Sealed Secrets or External Secrets Operator to encrypt secrets before storing them in Git or etcd. The security improvement with Secrets comes from separating credentials from pod definitions and supporting volume mounts (not visible in `kubectl describe`), not from encryption.

---

## Question 11: NetworkPolicy Enforcement Verification

**Question Type:** Scenario

**Context:**
You've applied NetworkPolicy rules to the Voting App. You want to verify that NetworkPolicy enforcement is actually working and not just silently ignored by the CNI.

**Question:**
Which test provides the BEST verification that NetworkPolicy is being enforced?

**Options:**

A) Check that NetworkPolicy resources exist using `kubectl get networkpolicy`
B) Try to create a privileged pod and verify it's blocked
C) Use `kubectl exec` to try reaching an unauthorized service and verify the connection fails
D) Check that all pods are running using `kubectl get pods`

**Correct Answer:** C

**Explanation:**
The only way to verify NetworkPolicy enforcement is to test blocked traffic actually fails. Use `kubectl exec` into a pod and try to connect to a service that should be blocked (e.g., vote pod trying to reach postgres directly). If the connection fails or times out, NetworkPolicy is enforced. If it succeeds, policies are being ignored (likely a CNI issue). Option A only verifies policies exist, not that they're enforced. Option B tests PSA, not NetworkPolicy. Option D shows pods are running but doesn't verify network isolation.

---

## Question 12: PSA Enforcement Modes

**Question Type:** Multiple Choice

**Question:**
You set a namespace with enforce=baseline and warn=restricted. A developer tries to create a pod with hostNetwork=true. What happens?

**Options:**

A) The pod is created with a warning about both baseline and restricted violations
B) The pod is blocked because restricted is stricter than baseline
C) The pod is blocked with an error about violating baseline policy
D) The pod is created successfully with no warnings because only enforce mode matters

**Correct Answer:** C

**Explanation:**
The pod violates baseline (hostNetwork is not allowed in baseline profile). Since enforce=baseline, the pod creation is blocked with an error message. The warn=restricted setting would show warnings for restricted violations, but since the pod is blocked at the enforce level (baseline), it never gets created and restricted warnings are not shown. PSA evaluates enforce first, and if that fails, the pod is rejected before warn or audit modes are evaluated.

---

## Question 13: Voting App NetworkPolicy Architecture

**Question Type:** Scenario

**Context:**
In the secured Voting App, you have applied NetworkPolicies following the default-deny pattern with selective allow rules. The architecture requires: vote talks to redis, worker talks to redis and postgres, result talks to postgres.

**Question:**
Which communication path should be BLOCKED by your NetworkPolicies?

**Options:**

A) vote pod to redis pod on port 6379
B) worker pod to postgres pod on port 5432
C) result pod to redis pod on port 6379
D) worker pod to redis pod on port 6379

**Correct Answer:** C

**Explanation:**
The result service only needs to read from postgres to display voting results. It does not need access to redis. According to the Voting App architecture, only vote and worker communicate with redis. Therefore, result-to-redis communication should be blocked by NetworkPolicy. All other options (A, B, D) are required communication paths that should be explicitly allowed. This demonstrates the principle of least privilege - each service should only be able to communicate with the exact services it needs, nothing more.

---

## Question 14: Defense in Depth

**Question Type:** Multiple Choice

**Question:**
You've secured the Voting App with NetworkPolicy, PSA, RBAC, and Secrets. An attacker compromises the vote service. Which layer would prevent the compromised vote service from reading database credentials stored in a Secret?

**Options:**

A) NetworkPolicy - prevents vote from reaching the database
B) Pod Security Admission - prevents vote from escalating privileges
C) RBAC - vote-sa ServiceAccount lacks permission to read Secrets
D) Secret volume mounts - credentials are encrypted and unreadable

**Correct Answer:** C

**Explanation:**
RBAC controls Kubernetes API access. The vote-sa ServiceAccount is configured with a Role that only allows reading ConfigMaps, not Secrets. If the attacker tries to read Secrets via the Kubernetes API (e.g., `kubectl get secret`), RBAC denies the request. Option A (NetworkPolicy) controls network traffic, not API access. Option B (PSA) prevents privilege escalation but doesn't control API access. Option D is incorrect because Secret volumes are mounted as readable files - the issue is whether the ServiceAccount has permission to access other Secrets. This demonstrates defense-in-depth: multiple layers protect different attack vectors.

---
