# Lab: Routing Traffic with Gateway API

## Objectives

By the end of this lab, you will be able to:

- Install Contour as a Gateway API controller in your Kubernetes cluster
- Create a Gateway resource with an HTTP listener
- Configure HTTPRoutes to route traffic to the Voting App vote and result services
- Implement path-based routing to serve multiple services from a single Gateway
- Explore traffic splitting for canary deployments using weighted backend references

## Prerequisites

Before starting this lab, ensure you have:

- A running KIND cluster (from Module 0)
- kubectl CLI configured to communicate with your cluster
- Basic understanding of Kubernetes Services and Pods
- The kind CLI tool installed

:::note[Fresh Start]
Module 3 starts with a clean slate. If you have autoscaling resources from Module 2 (HPA, VPA, KEDA), you can clean them up or leave them - we'll be deploying a fresh Voting App either way to focus on Gateway API routing concepts.
:::

## Setup

Follow these steps to prepare your environment for this lab.

**Step 1: Verify cluster status**

```bash
kubectl cluster-info
kubectl get nodes
```

You should see your KIND cluster running with a control plane and worker nodes.

**Step 2: Clean up previous deployments (optional)**

If you want a completely fresh start:

```bash
kubectl delete all --all -n default
```

Or, if you want to keep Module 2 resources and work in a separate namespace:

```bash
kubectl create namespace gateway-demo
kubectl config set-context --current --namespace=gateway-demo
```

For this lab, we'll work in the `default` namespace with a fresh deployment.

**Step 3: Deploy the base Voting App**

Deploy the base Voting App using the example YAMLs:

```bash
# Deploy all Voting App components
kubectl apply -f examples/voting-app/postgres-deployment.yaml
kubectl apply -f examples/voting-app/postgres-service.yaml
kubectl apply -f examples/voting-app/redis-deployment.yaml
kubectl apply -f examples/voting-app/redis-service.yaml
kubectl apply -f examples/voting-app/worker-deployment.yaml
kubectl apply -f examples/voting-app/vote-deployment.yaml
kubectl apply -f examples/voting-app/vote-service.yaml
kubectl apply -f examples/voting-app/result-deployment.yaml
kubectl apply -f examples/voting-app/result-service.yaml
```

**Step 4: Verify the Voting App is running**

```bash
kubectl get pods
kubectl get svc
```

Expected output:

```bash
NAME                        READY   STATUS    RESTARTS   AGE
postgres-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
redis-xxxxxxxxxx-xxxxx      1/1     Running   0          30s
result-xxxxxxxxxx-xxxxx     1/1     Running   0          30s
vote-xxxxxxxxxx-xxxxx       1/1     Running   0          30s
worker-xxxxxxxxxx-xxxxx     1/1     Running   0          30s

NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
postgres     ClusterIP   10.96.x.x       <none>        5432/TCP   30s
redis        ClusterIP   10.96.x.x       <none>        6379/TCP   30s
result       ClusterIP   10.96.x.x       <none>        80/TCP     30s
vote         ClusterIP   10.96.x.x       <none>        80/TCP     30s
```

**Step 5: Install Gateway API CRDs**

Gateway API requires custom resource definitions (CRDs) to be installed:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.0/standard-install.yaml
```

Expected output:

```bash
customresourcedefinition.apiextensions.k8s.io/gatewayclasses.gateway.networking.k8s.io created
customresourcedefinition.apiextensions.k8s.io/gateways.gateway.networking.k8s.io created
customresourcedefinition.apiextensions.k8s.io/httproutes.gateway.networking.k8s.io created
...
```

**Step 6: Verify CRDs are installed**

```bash
kubectl get crd | grep gateway
```

Expected output:

```bash
gatewayclasses.gateway.networking.k8s.io       2024-xx-xx...
gateways.gateway.networking.k8s.io             2024-xx-xx...
httproutes.gateway.networking.k8s.io           2024-xx-xx...
```

Your cluster is now ready for Gateway API resources.

## Tasks

### Task 1: Install Contour Gateway Controller

Contour is a lightweight Gateway API controller that's perfect for learning. Let's install it and verify it creates a GatewayClass.

**Step 1: Install Contour using the quickstart YAML**

```bash
kubectl apply -f https://projectcontour.io/quickstart/contour-gateway.yaml
```

This installs Contour in the `projectcontour` namespace with all necessary components.

**Step 2: Wait for Contour to be ready**

```bash
kubectl wait --for=condition=available --timeout=300s deployment -n projectcontour contour
```

Expected output:

```bash
deployment.apps/contour condition met
```

**Step 3: Verify the Contour components are running**

```bash
kubectl get pods -n projectcontour
```

Expected output:

```bash
NAME                       READY   STATUS    RESTARTS   AGE
contour-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
contour-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
envoy-xxxxx                1/1     Running   0          2m
envoy-xxxxx                1/1     Running   0          2m
```

**Step 4: Verify the GatewayClass was created**

```bash
kubectl get gatewayclass
```

Expected output:

```bash
NAME      CONTROLLER                             ACCEPTED   AGE
contour   projectcontour.io/gateway-controller   True       2m
```

**Explanation:** Contour registers a GatewayClass named `contour`. This tells Kubernetes that Contour is available to process Gateway resources. The `ACCEPTED: True` status means Contour is ready to handle Gateways.

### Task 2: Create a Gateway

Now let's create a Gateway that listens on port 80 for HTTP traffic. This Gateway will accept HTTPRoutes from the same namespace.

**Step 1: Create the Gateway resource**

Create a file named `gateway.yaml`:

```yaml title="gateway.yaml"
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: voting-app-gateway
  namespace: default
spec:
  gatewayClassName: contour
  listeners:
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      namespaces:
        from: Same
```

**Step 2: Apply the Gateway**

```bash
kubectl apply -f gateway.yaml
```

Expected output:

```bash
gateway.gateway.networking.k8s.io/voting-app-gateway created
```

**Step 3: Verify the Gateway status**

```bash
kubectl get gateway
```

Expected output:

```bash
NAME                  CLASS     ADDRESS        PROGRAMMED   AGE
voting-app-gateway    contour   10.96.x.x      True         30s
```

**Step 4: Check the Gateway details**

```bash
kubectl describe gateway voting-app-gateway
```

Look for these conditions:

```bash
Conditions:
  Type               Status  Reason
  ----               ------  ------
  Accepted           True    Accepted
  Programmed         True    Programmed
```

**Explanation:** As a cluster operator, you've defined that HTTP traffic on port 80 is accepted by this Gateway. Application developers can now create HTTPRoutes to route their specific application traffic. The Gateway has been programmed into Contour's Envoy proxies and is ready to route traffic.

### Task 3: Create HTTPRoutes for Vote and Result

Let's create HTTPRoutes to expose the vote and result services using hostname-based routing.

**Step 1: Create HTTPRoute for the vote service**

Create a file named `vote-httproute.yaml`:

```yaml title="vote-httproute.yaml"
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: vote-route
  namespace: default
spec:
  parentRefs:
  - name: voting-app-gateway
  hostnames:
  - "vote.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: vote
      port: 80
```

**Step 2: Create HTTPRoute for the result service**

Create a file named `result-httproute.yaml`:

```yaml title="result-httproute.yaml"
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: result-route
  namespace: default
spec:
  parentRefs:
  - name: voting-app-gateway
  hostnames:
  - "result.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: result
      port: 80
```

**Step 3: Apply both HTTPRoutes**

```bash
kubectl apply -f vote-httproute.yaml
kubectl apply -f result-httproute.yaml
```

**Step 4: Verify the HTTPRoutes are accepted**

```bash
kubectl get httproute
```

Expected output:

```bash
NAME           HOSTNAMES                 AGE
result-route   ["result.example.com"]    30s
vote-route     ["vote.example.com"]      30s
```

**Step 5: Check route attachment status**

```bash
kubectl describe httproute vote-route
```

Look for these conditions:

```bash
Conditions:
  Type                Status  Reason
  ----                ------  ------
  Accepted            True    Accepted
  ResolvedRefs        True    ResolvedRefs
```

Both `Accepted: True` and `ResolvedRefs: True` mean the route successfully attached to the Gateway and found the backend service.

**Step 6: Test access using Host headers**

First, get the Envoy service address. In KIND, we'll use port-forwarding:

```bash
kubectl port-forward -n projectcontour svc/envoy 8080:80
```

Leave this running in one terminal, and in another terminal, test with curl:

```bash
# Test vote service
curl -H "Host: vote.example.com" http://localhost:8080

# Test result service
curl -H "Host: result.example.com" http://localhost:8080
```

You should see HTML responses from both services.

**Explanation:** Each service gets its own hostname. The Gateway handles routing based on the Host header. In a production environment with DNS configured, users would access `http://vote.example.com` and `http://result.example.com` directly without needing to set headers manually.

### Task 4: Path-Based Routing

Hostname-based routing works well, but sometimes you want to serve multiple services from a single hostname using path prefixes. Let's create a combined HTTPRoute with path-based routing.

**Step 1: Delete the existing hostname-based routes**

```bash
kubectl delete httproute vote-route result-route
```

**Step 2: Create a combined path-based HTTPRoute**

Create a file named `combined-httproute.yaml`:

```yaml title="combined-httproute.yaml"
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: voting-app-route
  namespace: default
spec:
  parentRefs:
  - name: voting-app-gateway
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /vote
    backendRefs:
    - name: vote
      port: 80
  - matches:
    - path:
        type: PathPrefix
        value: /result
    backendRefs:
    - name: result
      port: 80
```

**Step 3: Apply the combined route**

```bash
kubectl apply -f combined-httproute.yaml
```

**Step 4: Verify the route**

```bash
kubectl get httproute voting-app-route
kubectl describe httproute voting-app-route
```

Check that both `Accepted` and `ResolvedRefs` are `True`.

**Step 5: Test path-based routing**

With your port-forward still running (or restart it):

```bash
kubectl port-forward -n projectcontour svc/envoy 8080:80
```

Test both paths:

```bash
# This should route to the vote service
curl http://localhost:8080/vote

# This should route to the result service
curl http://localhost:8080/result
```

**Understanding path matching:**

- **PathPrefix** matches any path that starts with the specified value
- `/vote` matches `/vote`, `/vote/`, `/vote/anything`
- `/result` matches `/result`, `/result/`, `/result/data`

For exact matches, you would use `type: Exact` which only matches the exact path specified (no trailing content).

**Step 6: Test in browser**

Open your browser to:
- `http://localhost:8080/vote` - You should see the voting interface
- `http://localhost:8080/result` - You should see the results page

**Explanation:** Path-based routing lets you expose multiple services from a single hostname and port. This is common in production - `example.com/api` goes to the API service, `example.com/admin` goes to the admin service, etc.

### Task 5: Traffic Splitting (Canary Pattern)

Gateway API makes it easy to split traffic between multiple backend versions using weights. This enables canary deployments - gradually shifting traffic to a new version while monitoring for errors.

**Step 1: Create a canary version of the vote service**

Create a file named `vote-canary-deployment.yaml`:

```yaml title="vote-canary-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vote-canary
  labels:
    app: voting-app
    tier: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vote-canary
  template:
    metadata:
      labels:
        app: vote-canary
        tier: frontend
    spec:
      containers:
      - name: vote
        image: schoolofdevops/vote:v1
        env:
        - name: CANARY_VERSION
          value: "true"
        ports:
        - containerPort: 80
          name: http
```

Create a service for the canary:

```yaml title="vote-canary-service.yaml"
apiVersion: v1
kind: Service
metadata:
  name: vote-canary
  labels:
    app: voting-app
    tier: frontend
spec:
  selector:
    app: vote-canary
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
```

**Step 2: Deploy the canary**

```bash
kubectl apply -f vote-canary-deployment.yaml
kubectl apply -f vote-canary-service.yaml
```

Verify:

```bash
kubectl get pods -l app=vote-canary
kubectl get svc vote-canary
```

**Step 3: Update the HTTPRoute with traffic splitting**

Modify `combined-httproute.yaml` to add weighted backends for the `/vote` path:

```yaml title="combined-httproute.yaml"
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: voting-app-route
  namespace: default
spec:
  parentRefs:
  - name: voting-app-gateway
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /vote
    backendRefs:
    - name: vote
      port: 80
      weight: 90
    - name: vote-canary
      port: 80
      weight: 10
  - matches:
    - path:
        type: PathPrefix
        value: /result
    backendRefs:
    - name: result
      port: 80
```

**Step 4: Apply the updated route**

```bash
kubectl apply -f combined-httproute.yaml
```

**Step 5: Test traffic distribution**

Send multiple requests and observe which backend handles them:

```bash
for i in {1..20}; do
  curl -s http://localhost:8080/vote | grep -o "vote\|vote-canary" || echo "response $i"
done
```

You should see approximately 90% going to the stable `vote` service and 10% to `vote-canary`.

**Explanation:** Traffic splitting enables canary deployments. You start with 95/5 or 90/10, monitor error rates and performance metrics, gradually shift to 50/50, then 10/90, and finally 0/100 once the new version is validated. If errors spike, you can instantly roll back by changing the weights.

**Step 6: Header-based routing (alternative canary pattern)**

Instead of random distribution, you can route specific users to the canary based on headers. Update your HTTPRoute:

```yaml
rules:
- matches:
  - path:
      type: PathPrefix
      value: /vote
    headers:
    - name: X-Canary
      value: "true"
  backendRefs:
  - name: vote-canary
    port: 80
- matches:
  - path:
      type: PathPrefix
      value: /vote
  backendRefs:
  - name: vote
    port: 80
```

Now only requests with `X-Canary: true` header go to the canary:

```bash
# Goes to stable version
curl http://localhost:8080/vote

# Goes to canary version
curl -H "X-Canary: true" http://localhost:8080/vote
```

This lets you give testers a browser extension or modify your mobile app to set the header, allowing them to test the canary while normal users see the stable version.

### Challenge: Cross-Namespace Routing with ReferenceGrant

Let's explore Gateway API's namespace isolation and how to enable controlled cross-namespace access.

**Step 1: Create a new namespace for a separate team**

```bash
kubectl create namespace team-b
```

**Step 2: Try to create an HTTPRoute in team-b that references the Gateway in default**

Create a file named `team-b-httproute.yaml`:

```yaml title="team-b-httproute.yaml"
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: team-b-route
  namespace: team-b
spec:
  parentRefs:
  - name: voting-app-gateway
    namespace: default
  hostnames:
  - "team-b.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: vote
      namespace: default
      port: 80
```

Apply it:

```bash
kubectl apply -f team-b-httproute.yaml
```

**Step 3: Check if the route attached**

```bash
kubectl describe httproute -n team-b team-b-route
```

Look at the conditions. You should see `Accepted: False` with an error message about namespace references not being permitted.

**Step 4: Create a ReferenceGrant to allow cross-namespace access**

In the `default` namespace (where the Gateway lives), create a ReferenceGrant:

```yaml title="reference-grant.yaml"
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-team-b
  namespace: default
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: team-b
  to:
  - group: gateway.networking.k8s.io
    kind: Gateway
```

Apply it:

```bash
kubectl apply -f reference-grant.yaml
```

**Step 5: Verify the route now attaches**

```bash
kubectl describe httproute -n team-b team-b-route
```

Now you should see `Accepted: True`.

**Explanation:** Gateway API enforces namespace boundaries by default to prevent security issues. ReferenceGrant explicitly allows specific namespaces to reference resources in other namespaces. This enables platform teams to manage shared Gateways while allowing application teams in different namespaces to create routes.

**Learning:** If your HTTPRoute doesn't attach, always check:
1. Are the Gateway and HTTPRoute in the same namespace?
2. If not, does a ReferenceGrant exist?
3. Are the service references correct?

## Verification

Confirm your lab setup is working correctly:

**1. Check Contour is running**

```bash
kubectl get pods -n projectcontour
```

All pods should show `STATUS: Running`.

**2. Verify GatewayClass exists**

```bash
kubectl get gatewayclass contour
```

Should show `ACCEPTED: True`.

**3. Verify Gateway is programmed**

```bash
kubectl get gateway voting-app-gateway
```

Should show `PROGRAMMED: True`.

**4. Check HTTPRoutes are accepted**

```bash
kubectl get httproute
```

All routes should show hostnames or have descriptions.

```bash
kubectl describe httproute voting-app-route
```

Should show `Accepted: True` and `ResolvedRefs: True`.

**5. Test end-to-end routing**

```bash
# Port-forward if not already running
kubectl port-forward -n projectcontour svc/envoy 8080:80 &

# Test vote service
curl -s http://localhost:8080/vote | grep -i vote

# Test result service
curl -s http://localhost:8080/result | grep -i result
```

Both should return HTML content.

**6. Verify traffic splitting works**

Send 10 requests and observe distribution:

```bash
for i in {1..10}; do curl -s http://localhost:8080/vote > /dev/null && echo "Request $i sent"; done
```

Check pod logs to see which backends handled requests:

```bash
kubectl logs -l app=vote --tail=5
kubectl logs -l app=vote-canary --tail=5
```

You should see approximately 9 requests in vote logs and 1 in vote-canary logs (90/10 split).

**7. Test Voting App functionality**

Open your browser:
- Navigate to `http://localhost:8080/vote`
- Cast a vote
- Navigate to `http://localhost:8080/result`
- Verify your vote appears

The Voting App should be fully functional through the Gateway.

## Cleanup

Clean up the Gateway API resources created in this lab:

```bash
# Delete HTTPRoutes
kubectl delete httproute voting-app-route
kubectl delete httproute -n team-b team-b-route

# Delete Gateway
kubectl delete gateway voting-app-gateway

# Delete canary deployment
kubectl delete deployment vote-canary
kubectl delete service vote-canary

# Delete ReferenceGrant
kubectl delete referencegrant -n default allow-team-b

# Delete team-b namespace
kubectl delete namespace team-b

# Optionally, uninstall Contour
kubectl delete -f https://projectcontour.io/quickstart/contour-gateway.yaml

# Optionally, clean up Voting App
kubectl delete -f examples/voting-app/
```

:::info[Keep for Module 4]
Module 4 (Service Mesh Decision) is an evaluation module, not a hands-on implementation. You can keep your KIND cluster running, but Gateway API resources aren't needed for the next module.
:::

## Troubleshooting

### Issue: HTTPRoute shows Accepted: False

**Symptom:** When you run `kubectl describe httproute`, you see `Accepted: False` in the conditions.

**Cause:** The HTTPRoute can't attach to the Gateway. Common reasons:
- Gateway and HTTPRoute are in different namespaces without a ReferenceGrant
- GatewayClass doesn't exist or isn't accepted
- Gateway doesn't exist or isn't programmed

**Solution:**

```bash
# Check if Gateway exists and is in the same namespace
kubectl get gateway -A

# Check GatewayClass
kubectl get gatewayclass

# If cross-namespace, check for ReferenceGrant
kubectl get referencegrant -A

# Describe HTTPRoute for detailed error message
kubectl describe httproute <name>
```

### Issue: HTTPRoute shows ResolvedRefs: False

**Symptom:** `Accepted: True` but `ResolvedRefs: False`.

**Cause:** The backend service referenced in `backendRefs` doesn't exist or is in the wrong namespace.

**Solution:**

```bash
# Check if the service exists
kubectl get svc vote result

# Check service name spelling in HTTPRoute
kubectl get httproute <name> -o yaml | grep -A 5 backendRefs

# If referencing cross-namespace service, ensure ReferenceGrant allows it
```

### Issue: Contour envoy service has no external IP in KIND

**Symptom:** `kubectl get svc -n projectcontour envoy` shows `<pending>` for EXTERNAL-IP.

**Cause:** KIND doesn't provide LoadBalancer services by default - this is expected behavior in local clusters.

**Solution:**

Use port-forwarding instead:

```bash
kubectl port-forward -n projectcontour svc/envoy 8080:80
```

Then access via `http://localhost:8080`.

For production clusters (AWS, GCP, Azure), the LoadBalancer service type will provision a real load balancer with an external IP.

### Issue: Gateway shows Programmed: False

**Symptom:** Gateway exists but `PROGRAMMED` column shows `False`.

**Cause:** The Gateway controller isn't running, or the GatewayClass doesn't match.

**Solution:**

```bash
# Check Contour pods are running
kubectl get pods -n projectcontour

# Check Gateway references correct GatewayClass
kubectl get gateway <name> -o yaml | grep gatewayClassName

# Check GatewayClass exists and is accepted
kubectl get gatewayclass

# Check Contour logs for errors
kubectl logs -n projectcontour deployment/contour
```

### Issue: curl returns "404 Not Found"

**Symptom:** Gateway and HTTPRoute both show as working, but curl returns 404.

**Cause:** The path or hostname doesn't match any route rules.

**Solution:**

```bash
# Check HTTPRoute rules
kubectl get httproute <name> -o yaml

# Ensure you're using the correct Host header (if hostname-based routing)
curl -H "Host: vote.example.com" http://localhost:8080

# Ensure you're using the correct path (if path-based routing)
curl http://localhost:8080/vote
```

## Key Takeaways

- **Gateway API separates concerns** - Infrastructure teams manage GatewayClasses, platform teams manage Gateways, app teams manage HTTPRoutes. Clean ownership boundaries.

- **HTTPRoutes are expressive** - Path matching, header matching, and traffic splitting are built-in, standardized features. No vendor-specific annotations for common use cases.

- **Namespace isolation is enforced** - HTTPRoutes can only reference Gateways in the same namespace unless ReferenceGrant explicitly allows cross-namespace access. This prevents accidental security holes.

- **Traffic splitting enables safe deployments** - Weighted backend references make canary deployments and blue-green migrations straightforward. Start with 90/10, monitor, gradually shift traffic.

- **Gateway API is portable** - Your HTTPRoutes and Gateways work with any compliant controller. Contour today, NGINX tomorrow, Istio in production - the core configs stay the same.
