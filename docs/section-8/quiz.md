# Module 8: Building Kubernetes Operators - Quiz

Test your understanding of Kubernetes operators, reconciliation loops, and the operator pattern.

---

**Question 1:** What is the primary purpose of the reconciliation loop in a Kubernetes operator?

A) To continuously poll resources every few seconds to check for changes
B) To observe current state, compare to desired state, and take action to align them
C) To delete resources that don't match the desired state exactly
D) To validate user input before creating custom resources

**Answer:** B

**Explanation:**
The reconciliation loop follows the pattern: observe (get current state) → compare (to desired state) → act (make changes if needed). This is a level-triggered pattern, not polling-based. Kubernetes triggers reconciliation when resources change, not on a fixed schedule. Option A is incorrect because reconciliation is event-driven, not time-based polling. Option C is too aggressive—reconciliation typically updates or creates resources, not deletes them. Option D describes validation, which happens before reconciliation at the API server level.

---

**Question 2:** Why must the Reconcile() function be idempotent?

A) To prevent the operator from consuming too much memory
B) To ensure running it multiple times with the same inputs produces the same result
C) To make the operator code easier to read and maintain
D) To comply with Kubernetes API conventions

**Answer:** B

**Explanation:**
Idempotency means running the function multiple times safely produces the same result. Kubernetes may call Reconcile() many times for the same resource—on creation, updates, periodic resyncs, or after operator restarts. If Reconcile() isn't idempotent (for example, it always creates a new ConfigMap even if one exists), running it repeatedly causes resource duplication or errors. Option A is incorrect because memory usage isn't related to idempotency. Option C is a benefit but not the primary reason. Option D is incorrect—while Kubernetes follows conventions, idempotency is a functional requirement, not just a convention.

---

**Question 3:** What does controllerutil.SetControllerReference() do?

A) Sets the operator as the owner of a resource for garbage collection
B) Validates that the operator has RBAC permissions to modify the resource
C) Creates a bidirectional link between two custom resources
D) Registers the operator with the Kubernetes API server

**Answer:** A

**Explanation:**
SetControllerReference() adds an owner reference to a resource, marking another resource (like a VoteConfig) as its owner. When the owner is deleted, Kubernetes automatically deletes owned resources (garbage collection). This is how the VoteConfig operator ensures ConfigMaps are cleaned up when VoteConfigs are deleted. Option B is incorrect—RBAC is checked at API server level, not by this function. Option C is incorrect—owner references are one-directional (owned → owner). Option D is incorrect—operator registration happens during manager setup, not when setting references.

---

**Question 4:** What happens when a VoteConfig resource is deleted and has a finalizer?

A) Kubernetes immediately deletes the resource from etcd
B) Kubernetes sets deletionTimestamp but waits for the finalizer to be removed
C) The operator receives an error and cannot proceed
D) All owned resources are deleted first, then the VoteConfig

**Answer:** B

**Explanation:**
When a resource with finalizers is deleted, Kubernetes sets the deletionTimestamp field but doesn't actually remove the resource from etcd yet. The operator sees the timestamp, runs its cleanup logic, then removes the finalizer. Only after all finalizers are removed does Kubernetes complete the deletion. This gives operators a chance to clean up external resources (like S3 buckets or DNS entries) before the custom resource is gone. Option A is incorrect because finalizers block immediate deletion. Option C is incorrect—deletion is not an error state. Option D is incorrect—owned resources are deleted via garbage collection, which is separate from finalizers.

---

**Question 5:** In the VoteConfig operator, why do we use r.Status().Update() instead of r.Update()?

A) Status().Update() is faster because it doesn't validate the spec
B) Status().Update() modifies only the status subresource, avoiding conflicts
C) Status().Update() automatically retries on conflict errors
D) r.Update() is deprecated in controller-runtime

**Answer:** B

**Explanation:**
Status is a separate subresource in Kubernetes. Using Status().Update() updates only the status field, not the spec. This is important because users update the spec (desired state) while operators update the status (observed state). Updating them separately avoids conflicts where both user and operator try to modify the resource simultaneously. Option A is incorrect—validation still happens. Option C is incorrect—you need to wrap updates with RetryOnConflict manually. Option D is incorrect—r.Update() is still used for spec changes, just not for status.

---

**Question 6:** What does the Owns() method in SetupWithManager() configure?

A) It grants RBAC permissions to the operator
B) It tells the controller to watch resources owned by the custom resource
C) It creates a dependency between two controllers
D) It defines which resources the operator can create

**Answer:** B

**Explanation:**
The Owns() method configures the controller to watch resources that have an owner reference pointing to the custom resource. For example, `.Owns(&ConfigMap{})` means "watch ConfigMaps owned by VoteConfig, and reconcile the VoteConfig when those ConfigMaps change." This way, if someone manually edits a ConfigMap, the operator detects it and reconciles it back to match the VoteConfig spec. Option A is incorrect—RBAC is configured via kubebuilder markers, not Owns(). Option C is incorrect—Owns() doesn't link controllers. Option D is incorrect—it doesn't define what can be created, just what to watch.

---

**Question 7:** What is the main advantage of testing an operator with `make run` locally?

A) It deploys the operator to the cluster automatically
B) It runs faster than in-cluster deployment and allows IDE debugging
C) It doesn't require RBAC permissions
D) It works without a Kubernetes cluster

**Answer:** B

**Explanation:**
`make run` executes the operator binary on your local machine while connecting to your cluster. This is faster than building container images and deploying to the cluster. You can see logs directly in your terminal, set breakpoints in your IDE, and quickly test code changes. Option A is incorrect—`make run` runs locally, not in-cluster (that's `make deploy`). Option C is incorrect—the operator still needs RBAC permissions to interact with the cluster. Option D is incorrect—you need a cluster for the operator to connect to.

---

**Question 8:** Why do Kubebuilder markers (comments starting with //+kubebuilder:) matter?

A) They improve code readability for other developers
B) They generate CRD manifests, RBAC rules, and other configuration
C) They are required by the Go compiler
D) They enable the operator to run in production environments

**Answer:** B

**Explanation:**
Kubebuilder markers are special comments that control code generation. For example, `//+kubebuilder:validation:Pattern=^[a-z]$` generates OpenAPI validation in the CRD YAML, and `//+kubebuilder:rbac:` comments generate RBAC Role manifests. When you run `make manifests`, Kubebuilder reads these markers and generates the corresponding Kubernetes YAML files. Option A is a side benefit but not the primary purpose. Option C is incorrect—Go ignores comments. Option D is incorrect—markers affect configuration, not runtime behavior.

---

**Question 9:** When should you use an operator instead of simpler patterns like Helm charts or Kustomize?

A) Whenever you have a custom resource definition
B) When you need to automate complex multi-step operational workflows
C) Only for stateful applications like databases
D) When you want to package Kubernetes manifests

**Answer:** B

**Explanation:**
Operators make sense when you need to automate complex operational tasks—backup/restore, upgrades, scaling decisions, failover handling. If you're just templating YAML or packaging manifests, Helm or Kustomize is simpler. Option A is incorrect—CRDs don't require operators (you can have CRDs without controllers). Option C is incorrect—while databases are common operator use cases, operators can manage any complex workflow, stateful or not. Option D is incorrect—packaging manifests is what Helm does; operators are about operational automation.

---

**Question 10:** What would happen if you forgot to set an owner reference on the ConfigMap in the VoteConfig operator?

A) The operator would fail to create the ConfigMap
B) The ConfigMap would remain after deleting the VoteConfig
C) Kubernetes would automatically delete the ConfigMap anyway
D) The operator would lose track of the ConfigMap

**Answer:** B

**Explanation:**
Without an owner reference, Kubernetes doesn't know the ConfigMap is related to the VoteConfig. When you delete the VoteConfig, garbage collection doesn't trigger for the ConfigMap, leaving it orphaned in the cluster. You'd have to manually delete it. Option A is incorrect—the ConfigMap creation would succeed, it just wouldn't have an owner. Option C is incorrect—automatic deletion only happens when owner references exist. Option D is incorrect—the operator can still find the ConfigMap by name, but garbage collection won't work.

---

**Question 11:** In the reconciliation loop, what does client.IgnoreNotFound() do?

A) Prevents the operator from logging "not found" errors
B) Treats "not found" errors as non-errors, allowing reconciliation to continue
C) Automatically creates missing resources
D) Retries the Get operation until the resource is found

**Answer:** B

**Explanation:**
When you call client.Get() for a resource that has been deleted, it returns a NotFound error. This is expected behavior, not a failure—the resource was deleted, so reconciliation should just return successfully. client.IgnoreNotFound(err) converts NotFound errors to nil, signaling "this is fine." Any other error (like network issues) is still returned as an error. Option A is incorrect—it's about error handling, not logging. Option C is incorrect—IgnoreNotFound doesn't create anything. Option D is incorrect—it doesn't retry, it just ignores the specific error.

---

**Question 12:** What is the purpose of the status subresource in a custom resource?

A) To store configuration that users should not modify
B) To reflect the observed state of the resource as seen by the operator
C) To cache API server responses for faster access
D) To store internal operator state not visible to users

**Answer:** B

**Explanation:**
Status reflects observed state—what the operator has actually done or observed. Users declare desired state in the spec, and the operator updates status to report current state. For example, VoteConfig status shows which ConfigMap was created and when it was last updated. This separation is important: users update spec, operators update status. Option A is incorrect—configuration goes in spec, not status. Option C is incorrect—status is stored in etcd, not a cache. Option D is incorrect—status is visible to users (kubectl get shows it).

---

**Question 13:** Why does the lab use controllerutil.CreateOrUpdate() instead of separate Create() and Update() calls?

A) CreateOrUpdate() is faster because it combines two operations
B) CreateOrUpdate() implements idempotent create-or-update logic automatically
C) CreateOrUpdate() doesn't require RBAC permissions
D) Separate calls would cause race conditions

**Answer:** B

**Explanation:**
CreateOrUpdate() checks if the resource exists. If it doesn't, it creates it. If it does, it updates it. This is idempotent—running it multiple times is safe. If you used separate Create() and Update() calls, you'd have to manually check existence and handle "already exists" errors. CreateOrUpdate() handles this complexity for you. Option A is incorrect—it's not about speed, it's about correctness. Option C is incorrect—RBAC permissions are still required. Option D is incorrect—while races can happen, that's not why we use CreateOrUpdate().

---

**Question 14:** What does the For() method in SetupWithManager() specify?

A) The Kubernetes API version the operator supports
B) The primary resource type the controller watches and reconciles
C) The namespace where the operator should run
D) The number of worker threads for reconciliation

**Answer:** B

**Explanation:**
The For() method specifies the primary resource type that triggers reconciliation. For example, `.For(&VoteConfig{})` means "watch VoteConfig resources, and call Reconcile() when they change." This is the main resource the controller manages. You can also use Owns() to watch related resources, but For() defines the primary type. Option A is incorrect—API version is defined in the API types. Option C is incorrect—operators typically watch all namespaces (configurable, but not via For()). Option D is incorrect—worker count is configured in controller options.

---

**Question 15:** What would happen if the Reconcile() function returned an error?

A) The operator pod would crash and restart
B) Kubernetes would retry the reconciliation with exponential backoff
C) The custom resource would be marked as invalid
D) The error would be logged and ignored

**Answer:** B

**Explanation:**
When Reconcile() returns an error, controller-runtime automatically requeues the request and retries with exponential backoff (starting with a short delay, increasing if errors persist). This handles transient failures (like temporary API server unavailability) gracefully. The operator keeps running; it just retries that specific reconciliation. Option A is incorrect—errors don't crash the operator. Option C is incorrect—the resource isn't marked invalid. Option D is incorrect—errors aren't ignored; they trigger retries.

---

## Quiz Complete

**Scoring Guide:**
- 13-15 correct: Excellent understanding of operators and reconciliation patterns
- 10-12 correct: Good grasp of concepts, review areas you missed
- 7-9 correct: Decent foundation, revisit reading materials and lab
- Below 7: Re-read the module and work through the lab again

**Key Topics Covered:**
- Reconciliation loop patterns and idempotency
- Owner references and garbage collection
- Finalizers for cleanup logic
- Status subresources vs spec
- controller-runtime helpers (CreateOrUpdate, IgnoreNotFound)
- Kubebuilder markers and code generation
- When to use operators vs simpler patterns
- Testing and error handling strategies
