# Lab: Creating the VoteConfig Custom Resource

## Objectives

By the end of this lab, you will be able to:

- Define a CustomResourceDefinition with OpenAPI v3 schema validation
- Install the CRD and verify API registration in your cluster
- Create VoteConfig custom resources using kubectl
- Test schema validation by submitting invalid resources
- Manually bridge VoteConfig to ConfigMap (the manual process Module 8 automates)

## Prerequisites

Before starting this lab, ensure you have:

- KIND cluster running
- kubectl installed and configured
- Basic understanding of Kubernetes resources and YAML syntax

## Setup

Follow these steps to prepare your environment for this lab:

**Step 1: Verify cluster status**

```bash
kubectl cluster-info
kubectl get nodes
```

Expected output:

```bash
Kubernetes control plane is running at https://127.0.0.1:xxxxx

NAME                       STATUS   ROLES           AGE   VERSION
voting-app-control-plane   Ready    control-plane   10d   v1.32.0
voting-app-worker          Ready    <none>          10d   v1.32.0
voting-app-worker2         Ready    <none>          10d   v1.32.0
```

**Step 2: Ensure voting-app namespace exists**

```bash
kubectl create namespace voting-app --dry-run=client -o yaml | kubectl apply -f -
```

Expected output:

```bash
namespace/voting-app created
```

Or if it already exists:

```bash
namespace/voting-app unchanged
```

**Step 3: Create working directory**

```bash
mkdir -p ~/voteconfig-crd
cd ~/voteconfig-crd
```

## Tasks

### Task 1: Define the VoteConfig CRD

We'll create a CustomResourceDefinition that teaches Kubernetes about voting configurations. The VoteConfig CRD will have validation rules to ensure data quality.

**Step 1: Create the CRD definition file**

Create a file named `voteconfig-crd.yaml` with the full CRD specification:

```yaml title="voteconfig-crd.yaml"
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  # CRITICAL: name must be plural.group
  name: voteconfigs.voting.example.com
spec:
  # Group for API versioning
  group: voting.example.com

  # Scope: Namespaced means each namespace can have its own VoteConfigs
  scope: Namespaced

  # Names for kubectl commands
  names:
    plural: voteconfigs      # kubectl get voteconfigs
    singular: voteconfig     # kubectl get voteconfig cats-vs-dogs
    kind: VoteConfig         # kind: VoteConfig in YAML
    shortNames:
    - vc                     # kubectl get vc (shorthand)

  # API versions
  versions:
  - name: v1
    served: true             # This version is active
    storage: true            # This is the version stored in etcd

    # OpenAPI v3 schema defines structure and validation
    schema:
      openAPIV3Schema:
        type: object
        properties:
          # spec: desired state (what user wants)
          spec:
            type: object
            required:
            - options            # Options field is mandatory
            properties:
              options:
                type: array
                minItems: 2      # Need at least 2 choices
                maxItems: 10     # Limit to 10 choices
                items:
                  type: object
                  required:
                  - id
                  - label
                  properties:
                    id:
                      type: string
                      pattern: "^[a-z]$"  # Single lowercase letter
                      description: "Single lowercase letter (a-z)"
                    label:
                      type: string
                      minLength: 1
                      maxLength: 50
                      description: "Display label for vote option"
                    color:
                      type: string
                      pattern: "^#[0-9A-Fa-f]{6}$"  # Hex color code
                      description: "Hex color code (e.g., #FF0000)"
              title:
                type: string
                default: "Vote Now!"
                description: "Voting page title"
              resultsTitle:
                type: string
                default: "Results"
                description: "Results page title"

          # status: observed state (what actually exists)
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

    # Enable status subresource (update status separately from spec)
    subresources:
      status: {}

    # Custom columns in kubectl get output
    additionalPrinterColumns:
    - name: Options
      type: string
      jsonPath: .spec.options[*].label
      description: Vote option labels
    - name: ConfigMap
      type: string
      jsonPath: .status.configMapRef
      description: Generated ConfigMap name
    - name: Age
      type: date
      jsonPath: .metadata.creationTimestamp
```

**Step 2: Understand the CRD structure**

Let's walk through the key sections:

- **metadata.name**: Must follow the pattern `plural.group`. For VoteConfig, that's `voteconfigs.voting.example.com`. This is how Kubernetes routes API requests.

- **spec.group**: The API group is `voting.example.com`. Combined with the version, this creates the full API path: `voting.example.com/v1`.

- **spec.names**: Controls kubectl behavior. Users will type `kubectl get voteconfigs` or the shorthand `kubectl get vc`.

- **spec.scope**: Namespaced means each namespace can have its own VoteConfigs (isolated per namespace).

- **schema.openAPIV3Schema**: This is where validation happens. The schema enforces:
  - At least 2 vote options, maximum 10
  - Option IDs must be single lowercase letters (a-z)
  - Labels must be 1-50 characters
  - Colors must be valid hex codes (#FF0000 format)

- **subresources.status**: Enables separate updates for status (what the operator will use in Module 8)

- **additionalPrinterColumns**: Custom columns shown in `kubectl get` output

**Step 3: Note the naming convention**

The most common CRD mistake is getting the name wrong. Remember:
```
metadata.name = plural + "." + group
              = voteconfigs.voting.example.com
```

If you get this wrong, the CRD won't register correctly.

### Task 2: Install CRD and Verify Registration

Now we'll install the CRD and confirm that Kubernetes recognizes the new resource type.

**Step 1: Apply the CRD**

```bash
kubectl apply -f voteconfig-crd.yaml
```

Expected output:

```bash
customresourcedefinition.apiextensions.k8s.io/voteconfigs.voting.example.com created
```

**Step 2: Verify CRD is registered**

```bash
kubectl get crd voteconfigs.voting.example.com
```

Expected output:

```bash
NAME                              CREATED AT
voteconfigs.voting.example.com    2026-02-09T12:34:56Z
```

**Step 3: Check API resources**

```bash
kubectl api-resources | grep voteconfig
```

Expected output:

```bash
voteconfigs    vc    voting.example.com/v1    true    VoteConfig
```

This confirms:
- The resource is registered
- Short name `vc` works
- API version is `voting.example.com/v1`
- It's namespaced (true)

**Step 4: Try kubectl with the new resource type**

```bash
kubectl get voteconfigs -n voting-app
```

Expected output:

```bash
No resources found in voting-app namespace.
```

This is expected! The CRD is registered, but no VoteConfig instances exist yet. The important part is that kubectl recognizes the resource type and doesn't return an error.

**Step 5: Try the short name**

```bash
kubectl get vc -n voting-app
```

Expected output:

```bash
No resources found in voting-app namespace.
```

The short name works! This confirms the CRD is fully registered.

**Step 6: Understand what just happened**

The API server now knows about VoteConfig. It's as real as any built-in resource. When you create a VoteConfig, the API server will validate it against the schema and store it in etcd.

### Task 3: Create Custom Resources and Test Validation

Now we'll create VoteConfig instances and test that validation works.

**Step 1: Create a valid VoteConfig (cats vs dogs)**

Create a file named `cats-vs-dogs.yaml`:

```yaml title="cats-vs-dogs.yaml"
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

**Step 2: Apply the VoteConfig**

```bash
kubectl apply -f cats-vs-dogs.yaml
```

Expected output:

```bash
voteconfig.voting.example.com/cats-vs-dogs created
```

**Step 3: Verify with kubectl get**

```bash
kubectl get vc -n voting-app
```

Expected output (note the custom printer columns):

```bash
NAME           OPTIONS        CONFIGMAP   AGE
cats-vs-dogs   Cats,Dogs                  10s
```

The Options column shows the vote option labels. The ConfigMap column is empty because no operator is running yet to populate the status.

**Step 4: Describe the VoteConfig**

```bash
kubectl describe voteconfig cats-vs-dogs -n voting-app
```

Expected output:

```yaml
Name:         cats-vs-dogs
Namespace:    voting-app
API Version:  voting.example.com/v1
Kind:         VoteConfig
Metadata:
  Creation Timestamp:  2026-02-09T12:35:00Z
Spec:
  Options:
    Color:  #FF6B6B
    Id:     a
    Label:  Cats
    Color:  #4ECDC4
    Id:     b
    Label:  Dogs
  Results Title:  And the winner is...
  Title:          Cats vs Dogs - The Ultimate Showdown
Events:           <none>
```

**Step 5: Create a second VoteConfig (pizza vs tacos)**

Create `pizza-vs-tacos.yaml`:

```yaml title="pizza-vs-tacos.yaml"
apiVersion: voting.example.com/v1
kind: VoteConfig
metadata:
  name: pizza-vs-tacos
  namespace: voting-app
spec:
  title: "Pizza vs Tacos - Food Fight!"
  resultsTitle: "The people have spoken"
  options:
  - id: "a"
    label: "Pizza"
    color: "#FFD93D"
  - id: "b"
    label: "Tacos"
    color: "#6BCB77"
```

Apply it:

```bash
kubectl apply -f pizza-vs-tacos.yaml
```

List all VoteConfigs:

```bash
kubectl get vc -n voting-app
```

Expected output:

```bash
NAME             OPTIONS           CONFIGMAP   AGE
cats-vs-dogs     Cats,Dogs                     5m
pizza-vs-tacos   Pizza,Tacos                   10s
```

**Step 6: Test validation with an invalid config**

Now let's verify that schema validation works by creating an invalid VoteConfig.

Create `invalid-config.yaml`:

```yaml title="invalid-config.yaml"
apiVersion: voting.example.com/v1
kind: VoteConfig
metadata:
  name: bad-config
  namespace: voting-app
spec:
  options:
  - id: "toolong"      # INVALID: Violates pattern ^[a-z]$ (more than one char)
    label: ""          # INVALID: Violates minLength 1
    color: "notahex"   # INVALID: Violates hex pattern
```

**Step 7: Try to apply the invalid config**

```bash
kubectl apply -f invalid-config.yaml
```

Expected output (the API server rejects it):

```bash
The VoteConfig "bad-config" is invalid:
* spec.options[0].color: Invalid value: "notahex": spec.options[0].color in body should match '^#[0-9A-Fa-f]{6}$'
* spec.options[0].id: Invalid value: "toolong": spec.options[0].id in body should match '^[a-z]$'
* spec.options[0].label: Invalid value: "": spec.options[0].label in body should be at least 1 chars long
```

**Step 8: Understand the validation errors**

Each validation error is clear:
1. The color "notahex" doesn't match the hex pattern
2. The id "toolong" violates the single-character pattern
3. The empty label violates the minimum length requirement

This validation happens at the API server level, BEFORE the resource enters etcd. No controller sees this garbage—the API server is the first line of defense.

**Step 9: Fix the invalid config**

Edit `invalid-config.yaml` to fix the errors:

```yaml title="invalid-config.yaml"
apiVersion: voting.example.com/v1
kind: VoteConfig
metadata:
  name: valid-config
  namespace: voting-app
spec:
  options:
  - id: "a"           # Fixed: single lowercase letter
    label: "Option A" # Fixed: non-empty label
    color: "#FF0000"  # Fixed: valid hex color
  - id: "b"
    label: "Option B"
    color: "#00FF00"
```

Apply the fixed version:

```bash
kubectl apply -f invalid-config.yaml
```

Expected output:

```bash
voteconfig.voting.example.com/valid-config created
```

Now it works because all validation rules are satisfied.

### Task 4: Bridge VoteConfig to ConfigMap (Manual Process)

Right now, VoteConfig resources exist in etcd, but they don't affect the Voting App. The vote service doesn't know about VoteConfig—it reads from environment variables or ConfigMaps. In Module 8, we'll build an operator that automatically bridges VoteConfig to ConfigMap. For now, we'll do it manually to understand what the operator will automate.

**Step 1: Understand the gap**

Run this command to see the VoteConfig data:

```bash
kubectl get voteconfig cats-vs-dogs -n voting-app -o jsonpath='{.spec.options}' | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))"
```

Expected output:

```json
[
  {
    "color": "#FF6B6B",
    "id": "a",
    "label": "Cats"
  },
  {
    "color": "#4ECDC4",
    "id": "b",
    "label": "Dogs"
  }
]
```

This data exists in Kubernetes, but the vote service can't read it. We need to bridge it to a format the vote service understands.

**Step 2: Manually create a ConfigMap from VoteConfig**

```bash
kubectl create configmap vote-options \
  --from-literal=option_a="Cats" \
  --from-literal=option_b="Dogs" \
  --from-literal=title="Cats vs Dogs - The Ultimate Showdown" \
  -n voting-app
```

Expected output:

```bash
configmap/vote-options created
```

**Step 3: Verify the ConfigMap**

```bash
kubectl get configmap vote-options -n voting-app -o yaml
```

Expected output:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vote-options
  namespace: voting-app
data:
  option_a: Cats
  option_b: Dogs
  title: Cats vs Dogs - The Ultimate Showdown
```

**Step 4: Understand the manual pain**

You just manually converted VoteConfig data to ConfigMap format. This process has problems:

1. **Manual labor**: Every time you change VoteConfig, you must manually update the ConfigMap
2. **Drift risk**: The ConfigMap can become out of sync with VoteConfig
3. **Error-prone**: Human operators make mistakes in manual conversions
4. **No automation**: Nothing watches for VoteConfig changes

Let's demonstrate the drift problem.

**Step 5: Update the VoteConfig**

```bash
kubectl patch voteconfig cats-vs-dogs -n voting-app --type='json' -p='[{"op": "replace", "path": "/spec/options/0/label", "value": "Felines"}]'
```

Expected output:

```bash
voteconfig.voting.example.com/cats-vs-dogs patched
```

**Step 6: Check if the ConfigMap updated**

```bash
kubectl get configmap vote-options -n voting-app -o jsonpath='{.data.option_a}'
```

Expected output:

```bash
Cats
```

The ConfigMap still says "Cats" but VoteConfig now says "Felines". They're out of sync! This is the problem operators solve—they watch for changes and reconcile automatically.

**Step 7: Manually reconcile (what an operator does automatically)**

```bash
kubectl patch configmap vote-options -n voting-app --type='json' -p='[{"op": "replace", "path": "/data/option_a", "value": "Felines"}]'
```

Now they're in sync again, but you had to do it manually. In Module 8, the operator watches VoteConfig resources and performs this reconciliation automatically every time a change is detected.

### Challenge: Create a Multi-Version CRD

Want to go further? Try adding a v2 version to the VoteConfig CRD with a new field.

**Goal:** Add a `maxVotesPerUser` field in v2 while keeping v1 working.

**Steps:**

1. Update `voteconfig-crd.yaml` to add a v2 version:
   - Keep v1 with `storage: true`
   - Add v2 with `storage: false` (converted from v1)
   - v2 schema includes all v1 fields plus `maxVotesPerUser: integer`

2. Apply the updated CRD

3. Create a v2 VoteConfig:
   ```yaml
   apiVersion: voting.example.com/v2
   kind: VoteConfig
   metadata:
     name: v2-config
   spec:
     maxVotesPerUser: 5
     options: [...]
   ```

4. Verify both v1 and v2 resources coexist:
   ```bash
   kubectl get voteconfig.v1.voting.example.com -n voting-app
   kubectl get voteconfig.v2.voting.example.com -n voting-app
   ```

In production, you version CRDs just like REST APIs. Old clients use v1, new clients use v2. The CRD handles conversion between versions.

## Verification

Confirm your lab setup is working correctly:

**1. CRD is registered**

```bash
kubectl get crd voteconfigs.voting.example.com
```

Expected: CRD exists with recent creation timestamp

**2. Custom resources created**

```bash
kubectl get vc -n voting-app
```

Expected: At least 2 VoteConfigs listed (cats-vs-dogs, pizza-vs-tacos)

**3. Validation works**

```bash
kubectl apply -f - <<EOF
apiVersion: voting.example.com/v1
kind: VoteConfig
metadata:
  name: validation-test
  namespace: voting-app
spec:
  options:
  - id: "invalid-id-too-long"
    label: "Test"
    color: "#FF0000"
EOF
```

Expected: API server rejects with validation error

**4. Short name works**

```bash
kubectl get vc -n voting-app
```

Expected: Command succeeds and shows VoteConfigs

**5. ConfigMap manually created**

```bash
kubectl get configmap vote-options -n voting-app
```

Expected: ConfigMap exists with data from VoteConfig

## Cleanup

We'll keep the CRD and VoteConfig resources installed. Module 8 builds the operator that reconciles these resources. However, delete the manually-created ConfigMap since the operator will manage that:

```bash
kubectl delete configmap vote-options -n voting-app
```

If you want to clean up everything:

```bash
# Delete all VoteConfig instances
kubectl delete voteconfig --all -n voting-app

# Delete the CRD (this also deletes all VoteConfig instances)
kubectl delete crd voteconfigs.voting.example.com

# Delete working directory
cd ~
rm -rf ~/voteconfig-crd
```

## Troubleshooting

### Issue: CRD not registering

**Symptom:** `kubectl apply -f voteconfig-crd.yaml` succeeds but `kubectl api-resources | grep voteconfig` shows nothing

**Cause:** CRD name doesn't match the `plural.group` convention

**Solution:**

Verify the CRD name:

```bash
kubectl get crd | grep voting
```

Check that metadata.name equals `voteconfigs.voting.example.com`. If it doesn't, delete and recreate:

```bash
kubectl delete crd [wrong-name]
# Fix voteconfig-crd.yaml
kubectl apply -f voteconfig-crd.yaml
```

### Issue: Validation not working

**Symptom:** Invalid VoteConfigs are accepted instead of rejected

**Cause:** Schema validation is missing or incorrect in the CRD

**Solution:**

Check the CRD schema:

```bash
kubectl get crd voteconfigs.voting.example.com -o yaml | grep -A 50 openAPIV3Schema
```

Ensure the schema includes required fields, patterns, and constraints. Update the CRD if needed.

### Issue: "resource already exists" error

**Symptom:** `kubectl apply -f cats-vs-dogs.yaml` returns "already exists" error

**Cause:** You're using `kubectl create` instead of `kubectl apply`

**Solution:**

Use `kubectl apply` for updates:

```bash
kubectl apply -f cats-vs-dogs.yaml
```

Or delete and recreate:

```bash
kubectl delete voteconfig cats-vs-dogs -n voting-app
kubectl apply -f cats-vs-dogs.yaml
```

### Issue: Printer columns not showing

**Symptom:** `kubectl get vc` shows default columns (NAME, AGE) but not custom columns

**Cause:** jsonPath expressions don't match the actual resource structure

**Solution:**

Check the resource structure:

```bash
kubectl get voteconfig cats-vs-dogs -n voting-app -o yaml
```

Verify that the jsonPath in additionalPrinterColumns matches the actual field paths. Update the CRD if needed.

### Issue: Can't update VoteConfig after creation

**Symptom:** Changes to VoteConfig don't apply

**Cause:** Using the wrong command or namespace

**Solution:**

Always specify the namespace:

```bash
kubectl apply -f cats-vs-dogs.yaml -n voting-app
```

Or use kubectl edit:

```bash
kubectl edit voteconfig cats-vs-dogs -n voting-app
```

## Key Takeaways

- CRDs teach Kubernetes new resource types by defining schemas that the API server enforces—VoteConfig becomes a first-class resource like Pod or Service
- Schema validation with OpenAPI v3 prevents invalid data from entering the cluster, protecting controllers from garbage input and providing clear error messages to users
- A CRD without a controller stores data but doesn't act on it—VoteConfig exists in etcd but nothing reconciles it to the Voting App yet
- Manual bridging from VoteConfig to ConfigMap is error-prone and doesn't scale—this demonstrates exactly what operators automate (Module 8)
- Custom resource extensions are the foundation of the entire cloud native ecosystem—cert-manager, Prometheus Operator, Istio, and Gateway API all follow this pattern
