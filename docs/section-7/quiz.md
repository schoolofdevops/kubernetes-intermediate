---
draft: true
---

# Quiz: Module 7 - Extending Kubernetes with CRDs

**Module:** 7
**Topic:** Extending Kubernetes with CRDs
**Question Count:** 13

---

## Question 1: CRD Purpose

**Question Type:** Multiple Choice

**Question:**
What is the primary purpose of a Custom Resource Definition (CRD) in Kubernetes?

**Options:**

A) To create new built-in Kubernetes resource types that are hardcoded into the API server
B) To extend the Kubernetes API by teaching the API server how to handle custom resource types
C) To replace existing Kubernetes resources like Pods and Services with custom implementations
D) To store configuration data that cannot be stored in ConfigMaps or Secrets

**Correct Answer:** B

**Explanation:**
CRDs extend the Kubernetes API by teaching the API server how to recognize and validate new resource types. Once a CRD is installed, you can create custom resources using kubectl just like built-in resources. Option A is incorrect because CRDs add custom types, not built-in ones. Option C is wrong because CRDs extend the API rather than replace existing resources. Option D is incorrect because while CRDs can store data, their primary purpose is API extension, not data storage.

---

## Question 2: CRD Naming Convention

**Question Type:** Multiple Choice

**Question:**
When creating a CustomResourceDefinition for VoteConfig resources in the voting.example.com group, what MUST the metadata.name field be set to?

**Options:**

A) voteconfig.voting.example.com
B) VoteConfig.voting.example.com
C) voteconfigs.voting.example.com
D) voting.example.com.voteconfigs

**Correct Answer:** C

**Explanation:**
The metadata.name field of a CRD MUST follow the pattern `plural.group`. For VoteConfig in the voting.example.com group, the plural form is "voteconfigs", so the name must be "voteconfigs.voting.example.com". This naming convention is how Kubernetes routes API requests to the correct CRD. Options A and B use the singular form, and Option D reverses the order.

---

## Question 3: Schema Validation Purpose

**Question Type:** True/False

**Question:**
A CRD without OpenAPI v3 schema validation will reject invalid resources at creation time, preventing bad data from entering the cluster.

**Correct Answer:** False

**Explanation:**
Without schema validation, the API server accepts any YAML that parses syntactically, regardless of whether the data makes semantic sense. Schema validation is what enables the API server to reject invalid resources at creation time. A CRD without validation is like a REST API that accepts any JSON—it stores garbage data that can crash controllers. Always define validation rules in the openAPIV3Schema section of your CRD.

---

## Question 4: Required Fields in CRD

**Question Type:** Multiple Choice

**Question:**
Which of the following are REQUIRED fields when defining a CustomResourceDefinition?

**Options:**

A) metadata.name, spec.group, spec.versions, spec.names
B) metadata.name, spec.group, spec.scope, spec.names, spec.versions
C) metadata.name, spec.group, spec.versions
D) metadata.name, spec.group, spec.versions, spec.schema

**Correct Answer:** B

**Explanation:**
All five fields are required: metadata.name (must be plural.group), spec.group (API group), spec.scope (Namespaced or Cluster), spec.names (plural, singular, kind), and spec.versions (at least one version with schema). While spec.schema is important for validation, it's technically part of the version definition, not a top-level required field. Option A is missing scope, Option C is missing scope and names, and Option D is incorrect about where schema is required.

---

## Question 5: Status Subresource

**Question Type:** Multiple Choice

**Question:**
What is the benefit of enabling the status subresource (`subresources.status: {}`) in a CRD?

**Options:**

A) It allows users to update the status field through the main resource endpoint
B) It creates a separate API endpoint for status updates, preventing accidental overwrites of spec changes
C) It automatically populates the status field with default values when resources are created
D) It makes the status field read-only for all users and controllers

**Correct Answer:** B

**Explanation:**
Enabling the status subresource creates a separate API endpoint for status updates (/status), which prevents accidental overwrites. If a controller reads a resource, updates status, and writes it back, the separate endpoint ensures the controller doesn't accidentally overwrite spec changes that a user made concurrently. Option A is incorrect because the status subresource creates a separate endpoint. Option C is wrong because status subresources don't auto-populate values. Option D is incorrect because controllers can still update status through the /status endpoint.

---

## Question 6: CRD Scope

**Question Type:** Multiple Choice

**Question:**
What is the difference between a Namespaced CRD and a Cluster-scoped CRD?

**Options:**

A) Namespaced CRDs can only have one instance per namespace, while Cluster-scoped CRDs are unique cluster-wide
B) Namespaced CRDs are isolated per namespace, while Cluster-scoped CRDs exist at the cluster level like Nodes
C) Namespaced CRDs require namespace permissions to create, while Cluster-scoped CRDs can be created by any user
D) Namespaced CRDs store data in etcd, while Cluster-scoped CRDs store data in the API server memory

**Correct Answer:** B

**Explanation:**
Namespaced CRDs (scope: Namespaced) exist within namespaces, meaning each namespace can have its own resources with the same name. Cluster-scoped CRDs (scope: Cluster) exist at the cluster level without namespace isolation, like Nodes or PersistentVolumes. Option A is incorrect because multiple instances can exist in a namespace. Option C is wrong because both types respect RBAC permissions. Option D is false because all resources are stored in etcd regardless of scope.

---

## Question 7: Validation Pattern

**Question Type:** Scenario

**Context:**
You're creating a VoteConfig CRD where vote option IDs must be single lowercase letters (a-z), and colors must be valid hex codes in the format #RRGGBB. You need to define validation rules to enforce these constraints.

**Question:**
Which OpenAPI v3 schema validation would correctly enforce these rules?

**Options:**

A) `id: {type: string, minLength: 1, maxLength: 1}` and `color: {type: string, minLength: 7, maxLength: 7}`

B) `id: {type: string, pattern: "^[a-z]$"}` and `color: {type: string, pattern: "^#[0-9A-Fa-f]{6}$"}`

C) `id: {type: string, enum: ["a","b","c"]}` and `color: {type: string, format: "color"}`

D) `id: {type: string, pattern: "[a-z]"}` and `color: {type: string, pattern: "#[0-9A-F]{6}"}`

**Correct Answer:** B

**Explanation:**
Option B correctly uses regex patterns: "^[a-z]$" matches exactly one lowercase letter (^ anchors to start, $ anchors to end), and "^#[0-9A-Fa-f]{6}$" matches a # followed by exactly 6 hex digits (case-insensitive). Option A uses length constraints but doesn't validate character content. Option C's enum approach doesn't scale and "color" format doesn't exist in OpenAPI. Option D is close but missing anchors (^$) and the color pattern is case-sensitive uppercase only.

---

## Question 8: Additional Printer Columns

**Question Type:** Multiple Choice

**Question:**
What is the purpose of the additionalPrinterColumns field in a CRD definition?

**Options:**

A) To control which fields are validated when resources are created
B) To define custom columns displayed in kubectl get output for better readability
C) To specify which fields can be updated after resource creation
D) To configure how resources are printed in JSON and YAML output formats

**Correct Answer:** B

**Explanation:**
additionalPrinterColumns defines custom columns that appear in kubectl get output, making it easier to see key information at a glance (like how kubectl get pods shows STATUS, READY, AGE). The columns use jsonPath expressions to extract values from resources. Option A is incorrect because validation is defined in the schema. Option C is wrong because field mutability is controlled by the schema, not printer columns. Option D is false because JSON/YAML output always shows all fields regardless of printer columns.

---

## Question 9: Short Names

**Question Type:** True/False

**Question:**
Short names in a CRD (like "vc" for VoteConfig) create kubectl aliases but do not affect the API paths or resource kind in YAML files.

**Correct Answer:** True

**Explanation:**
Short names (defined in spec.names.shortNames) create convenient kubectl aliases so users can type "kubectl get vc" instead of "kubectl get voteconfigs". However, they don't change the API paths (still voting.example.com/v1) or the kind field in YAML (still "kind: VoteConfig"). Short names are purely client-side convenience features that make kubectl commands shorter and easier to type.

---

## Question 10: CRD Without Controller

**Question Type:** True/False

**Question:**
A CRD without an associated controller (operator) can store custom resources in etcd and be queried with kubectl, but will not automatically reconcile or act on those resources.

**Correct Answer:** True

**Explanation:**
A CRD alone teaches the API server to recognize and store a new resource type, but it doesn't define any behavior. Without a controller watching those resources and implementing reconciliation logic, the resources are just data in etcd. This is like having a form without anyone to process it—you can create and read VoteConfigs, but nothing automatically updates ConfigMaps or deploys changes. Controllers (Module 8) provide the automation that brings CRDs to life.

---

## Question 11: VoteConfig Use Case

**Question Type:** Scenario

**Context:**
The Example Voting App currently stores vote options (which choices appear, their labels, and colors) in a generic ConfigMap with key-value pairs. You want to create a VoteConfig CRD to provide a Kubernetes-native API for managing these configurations with validation.

**Question:**
What is the MOST important benefit of using a VoteConfig CRD instead of a plain ConfigMap?

**Options:**

A) CRDs use less storage space in etcd than ConfigMaps
B) CRDs provide schema validation that prevents invalid configurations from being created
C) CRDs can be created faster than ConfigMaps using kubectl
D) CRDs automatically replicate data across multiple namespaces

**Correct Answer:** B

**Explanation:**
The most important benefit is schema validation—the VoteConfig CRD can enforce rules like "option IDs must be single lowercase letters" and "colors must be valid hex codes", preventing invalid configurations from reaching the application. ConfigMaps accept any key-value data with no validation. Option A is incorrect because storage size is similar. Option C is false because creation speed is the same. Option D is wrong because CRDs don't automatically replicate across namespaces unless you build that functionality into a controller.

---

## Question 12: Multi-Version CRDs

**Question Type:** Scenario

**Context:**
Your VoteConfig CRD has been in production with v1 for six months. You want to add a maxVotesPerUser field in v2 without breaking existing v1 clients that don't know about this field.

**Question:**
What is the correct approach to add v2 while maintaining v1 compatibility?

**Options:**

A) Delete the v1 version and replace it with v2 that includes the new field
B) Add v2 with storage: true and mark v1 with served: false to deprecate it immediately
C) Add v2 with storage: false, keep v1 with storage: true, and define conversion between versions
D) Create a new CRD named voteconfigs-v2.voting.example.com for the new version

**Correct Answer:** C

**Explanation:**
Option C is the correct multi-version pattern: keep v1 as the storage version (storage: true) so existing resources continue working, add v2 with storage: false (converted from v1), and define conversion logic (webhook or automatic for compatible changes). This allows old clients to use v1 and new clients to use v2 simultaneously. Option A breaks existing clients. Option B deprecates v1 too quickly. Option D creates a separate CRD which fragments the API.

---

## Question 13: CRD Ecosystem

**Question Type:** Multiple Choice

**Question:**
Which of the following popular Kubernetes tools use Custom Resource Definitions to extend the Kubernetes API?

**Options:**

A) kubectl, kubeadm, and kubelet
B) cert-manager, Prometheus Operator, and Istio
C) Docker, containerd, and CRI-O
D) etcd, CoreDNS, and kube-proxy

**Correct Answer:** B

**Explanation:**
cert-manager uses Certificate CRDs for TLS certificate management, Prometheus Operator uses ServiceMonitor CRDs for scrape target discovery, and Istio uses VirtualService and other CRDs for traffic management. These tools extend Kubernetes with domain-specific resources using CRDs. Option A lists Kubernetes core components that don't use CRDs. Option C lists container runtimes that operate below the Kubernetes API layer. Option D lists cluster infrastructure components that are built-in, not extensions.

---
