# Module 8: Building Kubernetes Operators - Lab

## Lab Overview

In Module 7, you created the VoteConfig CRD and manually created ConfigMaps from VoteConfig data. You experienced the synchronization problem: when VoteConfig changes, the ConfigMap doesn't automatically update. In this lab, you'll build a VoteConfig operator using Kubebuilder that automates this reconciliation. By the end, you'll have a controller that watches VoteConfig resources and automatically creates and updates ConfigMaps—making your CRD truly declarative.

**Duration:** 60-75 minutes

**Learning Outcomes:**
- Scaffold an operator project with Kubebuilder
- Implement reconciliation logic that creates and updates ConfigMaps
- Test operators locally before deploying to cluster
- Deploy operators as pods in Kubernetes
- Add finalizers for cleanup logic

## Prerequisites

Before starting this lab, ensure you have:

- Completed Module 7 (VoteConfig CRD installed)
- Go 1.21+ installed (`go version` should show 1.21 or higher)
- Docker installed and running
- KIND cluster running
- kubectl configured

## Setup

### Install Kubebuilder

Kubebuilder is the scaffolding tool for building operators. Install it:

```bash
# Download Kubebuilder binary
curl -L -o kubebuilder "https://go.kubebuilder.io/dl/latest/$(go env GOOS)/$(go env GOARCH)"

# Make executable and move to PATH
chmod +x kubebuilder
sudo mv kubebuilder /usr/local/bin/

# Verify installation
kubebuilder version
```

**Expected output:**
```
Version: main.version{KubeBuilderVersion:"4.4.1", ...}
```

### Create Workspace

```bash
# Create lab directory
mkdir -p ~/k8s-labs/module-8
cd ~/k8s-labs/module-8
```

### Verify Prerequisites

```bash
# Check Go version
go version
# Should show: go version go1.21.x or higher

# Check Docker
docker --version
# Should show: Docker version 20.x or higher

# Check cluster
kubectl cluster-info
# Should show: Kubernetes control plane is running...

# Check VoteConfig CRD exists (from Module 7)
kubectl get crd voteconfigs.voting.schoolofdevops.com
# Should show the CRD
```

If the VoteConfig CRD doesn't exist, you need to complete Module 7 first.

---

## Task 1: Scaffold Operator Project

**Objective:** Use Kubebuilder to create the operator project structure.

**Why:** Scaffolding creates all the boilerplate code—manager setup, build scripts, deployment manifests—so you can focus on the reconciliation logic.

### Steps

**1. Initialize Kubebuilder Project**

```bash
# Initialize project
kubebuilder init --domain schoolofdevops.com --repo github.com/schoolofdevops/voteconfig-operator

# This creates:
# - go.mod with dependencies
# - main.go with manager setup
# - Makefile with build/deploy targets
# - config/ directory with RBAC and deployment manifests
```

**Expected output:**
```
Writing kustomize manifests for you to edit...
Writing scaffold for you to edit...
Get controller runtime:
$ go get sigs.k8s.io/controller-runtime@v0.19.3
...
Next: define a resource with:
$ kubebuilder create api
```

**2. Create API and Controller**

```bash
# Create VoteConfig API and controller
# When prompted "Create Resource [y/n]", enter: y
# When prompted "Create Controller [y/n]", enter: y
kubebuilder create api --group voting --version v1alpha1 --kind VoteConfig
```

**Expected output:**
```
Create Resource [y/n]
y
Create Controller [y/n]
y
Writing kustomize manifests for you to edit...
Writing scaffold for you to edit...
api/v1alpha1/voteconfig_types.go
api/v1alpha1/groupversion_info.go
controllers/voteconfig_controller.go
...
```

**3. Explore Project Structure**

```bash
# View generated structure
tree -L 2 -I 'bin|testdata'

# Expected output:
# .
# ├── Dockerfile
# ├── Makefile
# ├── PROJECT
# ├── README.md
# ├── api
# │   └── v1alpha1
# ├── cmd
# │   └── main.go
# ├── config
# │   ├── crd
# │   ├── default
# │   ├── manager
# │   ├── prometheus
# │   ├── rbac
# │   └── samples
# ├── controllers
# │   └── voteconfig_controller.go
# ├── go.mod
# ├── go.sum
# └── hack
```

**4. Understand Key Files**

```bash
# View main.go (manager setup)
head -n 20 cmd/main.go

# View controller stub
head -n 30 controllers/voteconfig_controller.go

# View API types
head -n 30 api/v1alpha1/voteconfig_types.go
```

### Verification

```bash
# Project should compile
go build ./...

# No errors should appear
echo $?
# Should output: 0
```

### What You Learned

- Kubebuilder generates complete operator projects with sensible defaults
- API definitions (in `api/`) are separate from controller logic (in `controllers/`)
- The `config/` directory contains Kubernetes manifests for deployment
- The project follows Go module conventions and includes a Makefile for common tasks

---

## Task 2: Define VoteConfig API

**Objective:** Update the API types to match Module 7's VoteConfig schema.

**Why:** The generated types are empty stubs. You need to define the spec and status fields that match your CRD.

### Steps

**1. Edit VoteConfig Types**

Open `api/v1alpha1/voteconfig_types.go` in your text editor.

**2. Replace VoteConfigSpec**

Find the `VoteConfigSpec` struct and replace it with:

```go
// VoteConfigSpec defines the desired state of VoteConfig
type VoteConfigSpec struct {
	// Options is the list of voting choices
	// +kubebuilder:validation:MinItems=2
	// +kubebuilder:validation:MaxItems=10
	Options []VoteOption `json:"options"`
}

// VoteOption represents a single voting choice
type VoteOption struct {
	// ID is a single lowercase letter identifier
	// +kubebuilder:validation:Pattern=`^[a-z]$`
	ID string `json:"id"`

	// Label is the display text for this option
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=50
	Label string `json:"label"`

	// Color is a hex color code
	// +kubebuilder:validation:Pattern=`^#[0-9A-Fa-f]{6}$`
	Color string `json:"color"`
}
```

**3. Replace VoteConfigStatus**

Find the `VoteConfigStatus` struct and replace it with:

```go
// VoteConfigStatus defines the observed state of VoteConfig
type VoteConfigStatus struct {
	// ConfigMapName is the name of the generated ConfigMap
	ConfigMapName string `json:"configMapName,omitempty"`

	// LastUpdated is the timestamp of last reconciliation
	LastUpdated string `json:"lastUpdated,omitempty"`
}
```

**4. Add Kubebuilder Markers**

Find the `VoteConfig` struct (it has the comment `//+kubebuilder:object:root=true`).

Add these markers **above** the struct:

```go
//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:printcolumn:name="Options",type=integer,JSONPath=`.spec.options`
//+kubebuilder:printcolumn:name="ConfigMap",type=string,JSONPath=`.status.configMapName`
//+kubebuilder:printcolumn:name="Age",type=date,JSONPath=`.metadata.creationTimestamp`

// VoteConfig is the Schema for the voteconfigs API
type VoteConfig struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   VoteConfigSpec   `json:"spec,omitempty"`
	Status VoteConfigStatus `json:"status,omitempty"`
}
```

The complete file should look like this (abbreviated):

```go
package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// VoteConfigSpec defines the desired state of VoteConfig
type VoteConfigSpec struct {
	// Options is the list of voting choices
	// +kubebuilder:validation:MinItems=2
	// +kubebuilder:validation:MaxItems=10
	Options []VoteOption `json:"options"`
}

// VoteOption represents a single voting choice
type VoteOption struct {
	// ID is a single lowercase letter identifier
	// +kubebuilder:validation:Pattern=`^[a-z]$`
	ID string `json:"id"`

	// Label is the display text for this option
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=50
	Label string `json:"label"`

	// Color is a hex color code
	// +kubebuilder:validation:Pattern=`^#[0-9A-Fa-f]{6}$`
	Color string `json:"color"`
}

// VoteConfigStatus defines the observed state of VoteConfig
type VoteConfigStatus struct {
	// ConfigMapName is the name of the generated ConfigMap
	ConfigMapName string `json:"configMapName,omitempty"`

	// LastUpdated is the timestamp of last reconciliation
	LastUpdated string `json:"lastUpdated,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:printcolumn:name="Options",type=integer,JSONPath=`.spec.options`
//+kubebuilder:printcolumn:name="ConfigMap",type=string,JSONPath=`.status.configMapName`
//+kubebuilder:printcolumn:name="Age",type=date,JSONPath=`.metadata.creationTimestamp`

// VoteConfig is the Schema for the voteconfigs API
type VoteConfig struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   VoteConfigSpec   `json:"spec,omitempty"`
	Status VoteConfigStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// VoteConfigList contains a list of VoteConfig
type VoteConfigList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []VoteConfig `json:"items"`
}

func init() {
	SchemeBuilder.Register(&VoteConfig{}, &VoteConfigList{})
}
```

**5. Generate Manifests**

```bash
# Regenerate CRD manifests with updated schema
make manifests

# Generate DeepCopy methods
make generate
```

### Verification

```bash
# Check generated CRD has validation rules
grep -A 5 "pattern:" config/crd/bases/voting.schoolofdevops.com_voteconfigs.yaml

# Should see patterns for id and color fields:
#       pattern: ^[a-z]$
# ...
#       pattern: ^#[0-9A-Fa-f]{6}$

# Verify code compiles
go build ./...
```

### What You Learned

- API types define the schema for custom resources
- Kubebuilder markers (comments with `//+kubebuilder:`) control code generation
- `make manifests` regenerates CRD YAML from Go types
- Validation rules prevent invalid resources from being created

---

## Task 3: Implement Reconcile Logic

**Objective:** Write the controller logic that creates and updates ConfigMaps from VoteConfig.

**Why:** This is the core operator behavior—the reconciliation loop that automates ConfigMap management.

### Steps

**1. Edit Controller**

Open `controllers/voteconfig_controller.go`.

**2. Add Imports**

Replace the imports section with:

```go
import (
	"context"
	"fmt"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/log"

	votingv1alpha1 "github.com/schoolofdevops/voteconfig-operator/api/v1alpha1"
)
```

**3. Replace Reconcile Function**

Find the `Reconcile` function and replace it completely with:

```go
func (r *VoteConfigReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := log.FromContext(ctx)

	// 1. Fetch the VoteConfig instance
	voteConfig := &votingv1alpha1.VoteConfig{}
	err := r.Get(ctx, req.NamespacedName, voteConfig)
	if err != nil {
		if errors.IsNotFound(err) {
			// Resource deleted, nothing to do
			log.Info("VoteConfig resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		// Error reading the object - requeue
		log.Error(err, "Failed to get VoteConfig")
		return ctrl.Result{}, err
	}

	// 2. Check if being deleted (finalizer logic will be added in Task 5)
	if !voteConfig.ObjectMeta.DeletionTimestamp.IsZero() {
		// Resource is being deleted - for now, just return
		// We'll add finalizer handling in Task 5
		return ctrl.Result{}, nil
	}

	// 3. Define the ConfigMap
	configMapName := voteConfig.Name + "-config"
	configMap := &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      configMapName,
			Namespace: voteConfig.Namespace,
		},
	}

	// 4. Create or update ConfigMap
	op, err := controllerutil.CreateOrUpdate(ctx, r.Client, configMap, func() error {
		// Build ConfigMap data from VoteConfig
		if configMap.Data == nil {
			configMap.Data = make(map[string]string)
		}

		// Convert options to ConfigMap format (one line per option)
		optionsData := ""
		for _, opt := range voteConfig.Spec.Options {
			optionsData += fmt.Sprintf("%s:%s:%s\n", opt.ID, opt.Label, opt.Color)
		}
		configMap.Data["options.txt"] = optionsData

		// Set owner reference for garbage collection
		return controllerutil.SetControllerReference(voteConfig, configMap, r.Scheme)
	})

	if err != nil {
		log.Error(err, "Failed to create or update ConfigMap")
		return ctrl.Result{}, err
	}

	log.Info("ConfigMap reconciled", "operation", op, "name", configMapName)

	// 5. Update VoteConfig status
	voteConfig.Status.ConfigMapName = configMapName
	voteConfig.Status.LastUpdated = time.Now().Format(time.RFC3339)

	// Update status subresource
	if err := r.Status().Update(ctx, voteConfig); err != nil {
		log.Error(err, "Failed to update VoteConfig status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}
```

**4. Update SetupWithManager**

Find the `SetupWithManager` function and replace it with:

```go
// SetupWithManager sets up the controller with the Manager.
func (r *VoteConfigReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&votingv1alpha1.VoteConfig{}).
		Owns(&corev1.ConfigMap{}).
		Complete(r)
}
```

### Verification

```bash
# Code should compile
go build ./...

# Check for syntax errors
go vet ./...

# Both should complete without errors
```

### What You Learned

- Reconcile() is called whenever VoteConfig changes
- client.Get() fetches resources from the API server
- controllerutil.CreateOrUpdate() implements idempotent create-or-update logic
- SetControllerReference() adds owner reference for garbage collection
- Status().Update() writes to the status subresource separately from spec

---

## Task 4: Test Operator Locally

**Objective:** Run the operator locally and verify it creates ConfigMaps.

**Why:** Local testing is faster than building and deploying container images.

### Steps

**1. Install CRDs to Cluster**

```bash
# Install VoteConfig CRD
make install

# Verify CRD installed
kubectl get crd voteconfigs.voting.schoolofdevops.com

# Should show the CRD with columns for Options, ConfigMap, Age
```

**2. Run Operator Locally**

```bash
# Run operator (connects to your KIND cluster)
# Keep this terminal open - you'll watch logs here
make run
```

**Expected output:**
```
INFO    controller-runtime.metrics      Starting metrics server
INFO    Starting server
INFO    controller.voteconfig   Starting EventSource
INFO    controller.voteconfig   Starting Controller
INFO    controller.voteconfig   Starting workers
```

**3. Create VoteConfig (in new terminal)**

Open a second terminal and run:

```bash
# Create test VoteConfig
cat <<EOF | kubectl apply -f -
apiVersion: voting.schoolofdevops.com/v1alpha1
kind: VoteConfig
metadata:
  name: cats-vs-dogs
  namespace: default
spec:
  options:
    - id: "a"
      label: "Cats"
      color: "#FF6B6B"
    - id: "b"
      label: "Dogs"
      color: "#4ECDC4"
EOF
```

**4. Check Operator Logs (first terminal)**

You should see reconciliation logs:

```
INFO    controller.voteconfig   ConfigMap reconciled    {"operation": "created", "name": "cats-vs-dogs-config"}
```

**5. Verify ConfigMap Created**

In the second terminal:

```bash
# Check ConfigMap exists
kubectl get configmap cats-vs-dogs-config

# View ConfigMap data
kubectl get configmap cats-vs-dogs-config -o yaml
```

**Expected output (abbreviated):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cats-vs-dogs-config
  ownerReferences:
  - apiVersion: voting.schoolofdevops.com/v1alpha1
    kind: VoteConfig
    name: cats-vs-dogs
    ...
data:
  options.txt: |
    a:Cats:#FF6B6B
    b:Dogs:#4ECDC4
```

**6. Test Update Scenario**

Update the VoteConfig:

```bash
# Patch VoteConfig to change "Cats" to "Kittens"
kubectl patch voteconfig cats-vs-dogs --type='json' -p='[
  {"op": "replace", "path": "/spec/options/0/label", "value": "Kittens"}
]'
```

**Check operator logs** (first terminal) - should see reconciliation:

```
INFO    controller.voteconfig   ConfigMap reconciled    {"operation": "updated", "name": "cats-vs-dogs-config"}
```

**Verify ConfigMap updated:**

```bash
kubectl get configmap cats-vs-dogs-config -o yaml
# Should show "Kittens" instead of "Cats"
```

**7. Test Deletion**

```bash
# Delete VoteConfig
kubectl delete voteconfig cats-vs-dogs
```

**Verify ConfigMap auto-deleted** (owner reference triggers garbage collection):

```bash
kubectl get configmap cats-vs-dogs-config
# Should show: Error from server (NotFound)
```

**8. Stop Operator**

In the first terminal, press `Ctrl+C` to stop the operator.

### Verification

```bash
# VoteConfig status should have been updated
# (Re-create it first since we deleted it)
cat <<EOF | kubectl apply -f -
apiVersion: voting.schoolofdevops.com/v1alpha1
kind: VoteConfig
metadata:
  name: test-config
  namespace: default
spec:
  options:
    - id: "a"
      label: "Option A"
      color: "#FF0000"
    - id: "b"
      label: "Option B"
      color: "#00FF00"
EOF

# Restart operator temporarily
make run &
OPERATOR_PID=$!
sleep 5

# Check VoteConfig status
kubectl get voteconfig test-config -o jsonpath='{.status}'

# Should output: {"configMapName":"test-config-config","lastUpdated":"..."}

# Stop operator and cleanup
kill $OPERATOR_PID 2>/dev/null || true
kubectl delete voteconfig test-config
```

### What You Learned

- `make run` runs operator locally connected to cluster
- Operator watches for VoteConfig changes and reconciles automatically
- ConfigMaps are created with owner references for automatic cleanup
- Changes to VoteConfig trigger reconciliation
- Status updates reflect observed state

---

## Task 5: Add Finalizer for Cleanup

**Objective:** Add finalizer logic to clean up resources before VoteConfig deletion.

**Why:** Demonstrates advanced operator patterns for custom cleanup logic.

### Steps

**1. Edit Controller**

Open `controllers/voteconfig_controller.go`.

**2. Add Finalizer Constant**

Add this constant at package level (before the Reconcile function):

```go
const voteConfigFinalizer = "voting.schoolofdevops.com/finalizer"
```

**3. Update Reconcile for Finalizers**

Replace the deletion check section (step 2 in the Reconcile function) with:

```go
	// 2. Check if being deleted
	if !voteConfig.ObjectMeta.DeletionTimestamp.IsZero() {
		// Resource marked for deletion
		if controllerutil.ContainsFinalizer(voteConfig, voteConfigFinalizer) {
			// Run finalization logic
			if err := r.finalizeVoteConfig(ctx, voteConfig); err != nil {
				return ctrl.Result{}, err
			}

			// Remove finalizer
			controllerutil.RemoveFinalizer(voteConfig, voteConfigFinalizer)
			if err := r.Update(ctx, voteConfig); err != nil {
				return ctrl.Result{}, err
			}
		}
		return ctrl.Result{}, nil
	}

	// Add finalizer if not present
	if !controllerutil.ContainsFinalizer(voteConfig, voteConfigFinalizer) {
		controllerutil.AddFinalizer(voteConfig, voteConfigFinalizer)
		if err := r.Update(ctx, voteConfig); err != nil {
			return ctrl.Result{}, err
		}
	}
```

**4. Add Finalizer Method**

Add this method after the Reconcile function:

```go
func (r *VoteConfigReconciler) finalizeVoteConfig(ctx context.Context, voteConfig *votingv1alpha1.VoteConfig) error {
	log := log.FromContext(ctx)

	// Perform cleanup
	// In this example, we just log the deletion
	// In production, you might:
	// - Call external API to deregister resource
	// - Clean up external resources not managed by Kubernetes
	// - Send notifications
	log.Info("Finalizing VoteConfig", "name", voteConfig.Name)

	// The ConfigMap will be deleted automatically via owner reference
	// So we don't need to explicitly delete it here

	return nil
}
```

### Verification

```bash
# Compile
go build ./...

# Run operator locally
make run &
OPERATOR_PID=$!
sleep 5

# Create VoteConfig
kubectl apply -f - <<EOF
apiVersion: voting.schoolofdevops.com/v1alpha1
kind: VoteConfig
metadata:
  name: finalizer-test
  namespace: default
spec:
  options:
    - id: "a"
      label: "Test"
      color: "#FF0000"
EOF

# Wait for reconciliation
sleep 2

# Check finalizer was added
kubectl get voteconfig finalizer-test -o jsonpath='{.metadata.finalizers}'
# Should output: ["voting.schoolofdevops.com/finalizer"]

# Delete VoteConfig
kubectl delete voteconfig finalizer-test

# Check operator logs - should see finalization message
# ConfigMap should be deleted automatically

# Verify deletion completed
kubectl get voteconfig finalizer-test
# Should show: Error from server (NotFound)

# Stop operator
kill $OPERATOR_PID 2>/dev/null || true
```

### What You Learned

- Finalizers prevent deletion until custom cleanup completes
- controllerutil helpers simplify finalizer management
- Owner references handle dependent resource cleanup automatically
- Finalizers are essential when managing external resources

---

## Task 6: Build and Deploy Operator

**Objective:** Build Docker image and deploy operator to cluster.

**Why:** Production operators run as pods in the cluster.

### Steps

**1. Build Operator Image**

```bash
# Build image (uses Dockerfile generated by Kubebuilder)
make docker-build IMG=schoolofdevops/voteconfig-operator:v1
```

**Expected output:**
```
docker build -t schoolofdevops/voteconfig-operator:v1 .
...
Successfully built abc123def456
Successfully tagged schoolofdevops/voteconfig-operator:v1
```

**2. Load Image into KIND**

KIND clusters need images loaded explicitly (they can't pull from remote registries):

```bash
# Load image into KIND
kind load docker-image schoolofdevops/voteconfig-operator:v1

# Verify image loaded
docker exec -it kind-control-plane crictl images | grep voteconfig-operator
```

**Expected output:**
```
schoolofdevops/voteconfig-operator   v1    abc123def456   ...
```

**3. Deploy Operator to Cluster**

```bash
# Deploy operator, CRD, RBAC
make deploy IMG=schoolofdevops/voteconfig-operator:v1
```

**Expected output:**
```
namespace/voteconfig-operator-system created
customresourcedefinition.apiextensions.k8s.io/voteconfigs.voting.schoolofdevops.com configured
serviceaccount/voteconfig-operator-controller-manager created
role.rbac.authorization.k8s.io/voteconfig-operator-leader-election-role created
...
deployment.apps/voteconfig-operator-controller-manager created
```

**4. Check Operator Pod**

```bash
# Check operator pod running
kubectl get pods -n voteconfig-operator-system

# Should show:
# NAME                                                        READY   STATUS    RESTARTS   AGE
# voteconfig-operator-controller-manager-xxxxxxxxxx-xxxxx    2/2     Running   0          30s
```

**5. Check Operator Logs**

```bash
# View operator logs
kubectl logs -n voteconfig-operator-system deployment/voteconfig-operator-controller-manager -c manager
```

**Expected output:**
```
INFO    setup   starting manager
INFO    controller.voteconfig   Starting EventSource
INFO    controller.voteconfig   Starting Controller
INFO    controller.voteconfig   Starting workers
```

**6. Test Deployed Operator**

```bash
# Create VoteConfig
kubectl apply -f - <<EOF
apiVersion: voting.schoolofdevops.com/v1alpha1
kind: VoteConfig
metadata:
  name: production-test
  namespace: default
spec:
  options:
    - id: "a"
      label: "Containers"
      color: "#FF6B6B"
    - id: "b"
      label: "Kubernetes"
      color: "#4ECDC4"
EOF

# Wait for reconciliation
sleep 3

# Check ConfigMap created
kubectl get configmap production-test-config

# View ConfigMap
kubectl get configmap production-test-config -o yaml
```

**7. Test Update**

```bash
# Update VoteConfig
kubectl patch voteconfig production-test --type='json' -p='[
  {"op": "replace", "path": "/spec/options/0/label", "value": "Docker"}
]'

# Wait a moment
sleep 2

# Check ConfigMap updated
kubectl get configmap production-test-config -o yaml | grep -A 3 "data:"
# Should show "Docker" instead of "Containers"
```

**8. Check Operator Logs**

```bash
# Watch operator reconciliation
kubectl logs -n voteconfig-operator-system deployment/voteconfig-operator-controller-manager -c manager --tail=20
```

**Expected logs:**
```
INFO    controller.voteconfig   ConfigMap reconciled    {"operation": "created", "name": "production-test-config"}
INFO    controller.voteconfig   ConfigMap reconciled    {"operation": "updated", "name": "production-test-config"}
```

### Verification

```bash
# Operator pod should be running
kubectl get pods -n voteconfig-operator-system
# Status should be: Running

# ConfigMap should exist
kubectl get configmap production-test-config

# VoteConfig status should be populated
kubectl get voteconfig production-test -o jsonpath='{.status}'
# Should output: {"configMapName":"production-test-config","lastUpdated":"..."}

# Delete VoteConfig - ConfigMap should auto-delete
kubectl delete voteconfig production-test
sleep 2
kubectl get configmap production-test-config
# Should show: Error from server (NotFound)
```

### What You Learned

- `make docker-build` creates operator container image
- KIND requires explicit image loading (can't pull from registries)
- `make deploy` installs CRD, RBAC, and operator deployment
- Deployed operator behaves identically to local operator
- Operator runs as a pod with proper RBAC permissions

---

## Challenge Task: Integrate with Voting App

**Objective:** Use VoteConfig operator to configure the vote service.

**Why:** Demonstrates real-world operator usage in your application.

### Steps

**1. Create Namespace**

```bash
# Create instavote namespace if not exists
kubectl create namespace instavote --dry-run=client -o yaml | kubectl apply -f -
```

**2. Create VoteConfig for Voting App**

```bash
cat <<EOF | kubectl apply -f -
apiVersion: voting.schoolofdevops.com/v1alpha1
kind: VoteConfig
metadata:
  name: vote-options
  namespace: instavote
spec:
  options:
    - id: "a"
      label: "Containers"
      color: "#FF6B6B"
    - id: "b"
      label: "Kubernetes"
      color: "#4ECDC4"
EOF
```

**3. Verify ConfigMap Created**

```bash
# Check ConfigMap created in instavote namespace
kubectl get configmap -n instavote vote-options-config

# View contents
kubectl get configmap -n instavote vote-options-config -o yaml
```

**Expected output (abbreviated):**
```yaml
data:
  options.txt: |
    a:Containers:#FF6B6B
    b:Kubernetes:#4ECDC4
```

**4. Update Voting App (if deployed)**

If you have the voting app deployed from previous modules:

```bash
# Deploy vote service that uses ConfigMap
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vote
  namespace: instavote
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vote
  template:
    metadata:
      labels:
        app: vote
    spec:
      containers:
      - name: vote
        image: schoolofdevops/vote:v1
        ports:
        - containerPort: 80
        volumeMounts:
        - name: config
          mountPath: /app/config
      volumes:
      - name: config
        configMap:
          name: vote-options-config
EOF
```

**5. Verify Configuration**

```bash
# Check vote pod has ConfigMap mounted
kubectl exec -n instavote deployment/vote -- cat /app/config/options.txt

# Should output:
# a:Containers:#FF6B6B
# b:Kubernetes:#4ECDC4
```

**6. Test Dynamic Updates**

```bash
# Update VoteConfig
kubectl patch voteconfig vote-options -n instavote --type='json' -p='[
  {"op": "add", "path": "/spec/options/-", "value": {"id":"c","label":"Docker","color":"#0DB7ED"}}
]'

# Check ConfigMap updated automatically
kubectl get configmap -n instavote vote-options-config -o yaml

# Should now include Docker option
```

**Success!** You've built a complete operator that automates ConfigMap creation from custom resources.

### Cleanup

```bash
# Delete VoteConfig (will auto-delete ConfigMaps)
kubectl delete voteconfig --all --all-namespaces

# Uninstall operator
make undeploy

# Uninstall CRD
make uninstall

# Delete workspace (optional)
cd ~
rm -rf ~/k8s-labs/module-8
```

---

## Troubleshooting

### Operator Pod Crash Looping

**Symptom:** Operator pod shows CrashLoopBackOff status.

**Diagnosis:**

```bash
# Check logs for errors
kubectl logs -n voteconfig-operator-system deployment/voteconfig-operator-controller-manager -c manager

# Common issues:
# - Missing RBAC permissions
# - Invalid owner references
# - CRD not installed properly
```

**Fix:**

```bash
# Reinstall CRD
make install

# Redeploy operator
make deploy IMG=schoolofdevops/voteconfig-operator:v1
```

### ConfigMap Not Created

**Symptom:** VoteConfig created but ConfigMap doesn't appear.

**Diagnosis:**

```bash
# Check operator logs
kubectl logs -n voteconfig-operator-system deployment/voteconfig-operator-controller-manager -c manager

# Check VoteConfig exists
kubectl get voteconfig

# Check VoteConfig status
kubectl get voteconfig <name> -o yaml
```

**Common causes:**
- Operator not running (check pod status)
- RBAC permissions missing (check operator logs for "Forbidden" errors)
- Namespace mismatch (VoteConfig and operator must have access)

### Reconciliation Not Triggered on Updates

**Symptom:** Updating VoteConfig doesn't update ConfigMap.

**Diagnosis:**

```bash
# Check if operator is watching the namespace
kubectl get deployment -n voteconfig-operator-system voteconfig-operator-controller-manager -o yaml | grep -A 5 "env:"

# Try deleting and recreating VoteConfig
kubectl delete voteconfig <name>
kubectl apply -f <voteconfig.yaml>
```

**Fix:**
- Operator watches all namespaces by default
- Check operator logs for reconciliation messages
- Verify SetupWithManager includes `.For(&VoteConfig{})` and `.Owns(&ConfigMap{})`

### Finalizer Prevents Deletion

**Symptom:** VoteConfig stuck in "Terminating" state.

**Diagnosis:**

```bash
# Check finalizers
kubectl get voteconfig <name> -o jsonpath='{.metadata.finalizers}'

# Check if operator is running
kubectl get pods -n voteconfig-operator-system
```

**Emergency fix** (if operator is completely broken):

```bash
# Manually remove finalizer
kubectl patch voteconfig <name> --type='json' -p='[{"op": "remove", "path": "/metadata/finalizers"}]'
```

---

## Lab Summary

Congratulations! You've successfully:

- Scaffolded an operator project with Kubebuilder
- Defined custom API types with validation
- Implemented reconciliation logic that creates and updates ConfigMaps
- Tested the operator locally and in-cluster
- Added finalizers for cleanup logic
- Deployed the operator as a production-style workload

**Key Concepts Reinforced:**
- Operators automate reconciliation of custom resources
- Reconciliation loops must be idempotent
- Owner references provide automatic garbage collection
- Finalizers enable custom cleanup logic
- Kubebuilder follows Kubernetes best practices

**Next Steps:**
- Take the quiz to test your understanding
- Explore advanced operator patterns (webhooks, multi-version APIs)
- Consider when operators add value vs unnecessary complexity
