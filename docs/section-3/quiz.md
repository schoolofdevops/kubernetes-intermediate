---
draft: true
---

# Quiz: Module 3 - Gateway API

**Module:** 3
**Topic:** Gateway API
**Question Count:** 12

---

## Question 1

**Question Type:** Multiple Choice

**Question:**
Which resource in the Gateway API resource model is typically managed by the infrastructure provider or platform team, and defines which Gateway controller implementation to use?

**Options:**

A) Gateway
B) HTTPRoute
C) GatewayClass
D) Service

**Correct Answer:** C

**Explanation:**
GatewayClass is managed by infrastructure providers and defines the controller implementation (like Contour, NGINX, or Istio). It's similar to StorageClass for storage. Gateway resources are managed by cluster operators, HTTPRoutes by application developers, and Services are standard Kubernetes resources not specific to Gateway API.

---

## Question 2

**Question Type:** Multiple Choice

**Question:**
What is the primary advantage of Gateway API over the older Ingress API?

**Options:**

A) Gateway API is faster and has better performance
B) Gateway API provides role-oriented resource separation and expressive routing without vendor-specific annotations
C) Gateway API is easier to install and requires fewer resources
D) Gateway API automatically creates DNS entries for services

**Correct Answer:** B

**Explanation:**
Gateway API's main advantage is its design: role-oriented resources (GatewayClass, Gateway, HTTPRoute) with clear ownership boundaries, and expressive routing capabilities (path matching, header matching, traffic splitting) built into the standard without needing controller-specific annotations. Performance is implementation-dependent, installation complexity varies, and DNS management is outside Gateway API's scope.

---

## Question 3

**Question Type:** Scenario

**Context:**
You're deploying the Voting App with Gateway API. You create an HTTPRoute in the `voting-app` namespace that references a Gateway in the `infrastructure` namespace. When you check the route status with `kubectl describe httproute`, you see `Accepted: False` with an error about namespace references.

**Question:**
What is the most likely cause, and what should you do to fix it?

**Options:**

A) The Gateway doesn't exist - create a Gateway in the voting-app namespace
B) HTTPRoutes can't reference Gateways in different namespaces - move the HTTPRoute to the infrastructure namespace
C) Gateway API enforces namespace boundaries - create a ReferenceGrant in the infrastructure namespace allowing the voting-app namespace to reference the Gateway
D) The GatewayClass is misconfigured - update the Gateway to use the correct GatewayClass

**Correct Answer:** C

**Explanation:**
Gateway API enforces namespace isolation by default. An HTTPRoute can only reference a Gateway in a different namespace if a ReferenceGrant explicitly allows it. The ReferenceGrant must be created in the Gateway's namespace (infrastructure) and specify which namespaces (voting-app) can reference which resources. This is a security feature to prevent unauthorized cross-namespace access.

---

## Question 4

**Question Type:** Multiple Choice

**Question:**
In an HTTPRoute, what does the `PathPrefix` match type do?

**Options:**

A) Matches only the exact path specified, with no additional characters
B) Matches any path that starts with the specified value, including paths with additional segments
C) Matches paths using regular expression patterns
D) Matches paths based on query parameters

**Correct Answer:** B

**Explanation:**
PathPrefix matches any path that starts with the specified value. For example, `/vote` matches `/vote`, `/vote/`, and `/vote/anything`. For exact matching without trailing content, use `Exact` type. Gateway API doesn't use regex for path matching (uses PathPrefix, Exact, and RegularExpression types). Query parameter matching is separate from path matching.

---

## Question 5

**Question Type:** Scenario

**Context:**
You're implementing a canary deployment for the vote service. You have two services: `vote` (stable version) and `vote-canary` (new version). You want to send 90% of traffic to the stable version and 10% to the canary.

**Question:**
Which HTTPRoute configuration correctly implements this traffic split?

**Options:**

A) Create two HTTPRoutes with different priorities
B) Use a single HTTPRoute with two backendRefs, setting weight: 90 for vote and weight: 10 for vote-canary
C) Create two Gateways, one for each service
D) Use header matching to route 10% of requests to the canary

**Correct Answer:** B

**Explanation:**
Traffic splitting in Gateway API is done using the `weight` field in `backendRefs`. A single HTTPRoute can reference multiple backends with relative weights - weight: 90 and weight: 10 will distribute traffic in a 90/10 ratio. HTTPRoute priorities don't control traffic distribution. Multiple Gateways aren't needed for traffic splitting. Header matching can do canary routing but doesn't provide percentage-based distribution (all requests with the header go to canary, not 10%).

---

## Question 6

**Question Type:** True/False

**Question:**
An HTTPRoute can attach to multiple Gateways by listing multiple Gateway names in the parentRefs field.

**Correct Answer:** True

**Explanation:**
HTTPRoutes support multiple parent references, allowing a single route to attach to multiple Gateways. This is useful when you want the same routing rules to apply to multiple entry points (e.g., an internal Gateway and an external Gateway). Each parentRef specifies a Gateway name and optionally a namespace.

---

## Question 7

**Question Type:** Multiple Choice

**Question:**
Which field in a Gateway resource defines what ports are open, what protocols they accept, and what hostnames they serve?

**Options:**

A) routes
B) listeners
C) backendRefs
D) rules

**Correct Answer:** B

**Explanation:**
The `listeners` field in a Gateway defines the network entry points - which ports are open (e.g., 80, 443), which protocols they accept (HTTP, HTTPS, TCP), and which hostnames they serve. Routes, backendRefs, and rules are part of HTTPRoute configuration, not Gateway.

---

## Question 8

**Question Type:** Scenario

**Context:**
Your team is migrating from the Ingress API to Gateway API. You have an existing Ingress that uses the annotation `nginx.ingress.kubernetes.io/rewrite-target: /` to rewrite URL paths before sending them to backends.

**Question:**
How would you implement URL rewriting in Gateway API?

**Options:**

A) Gateway API doesn't support URL rewriting - you must change your application
B) Use the same annotation on the HTTPRoute resource
C) Use the `filters` field in HTTPRoute rules to specify URLRewrite filters
D) URL rewriting must be configured in the GatewayClass

**Correct Answer:** C

**Explanation:**
Gateway API provides URL rewriting through the `filters` field in HTTPRoute rules, specifically using the `URLRewrite` filter type. This is a standard Gateway API feature, not controller-specific. Annotations aren't needed for common features like rewriting. Applications don't need to change. GatewayClass is for controller selection, not routing configuration.

---

## Question 9

**Question Type:** Multiple Choice

**Question:**
What happens when a request arrives at a Gateway and doesn't match any HTTPRoute rules?

**Options:**

A) The Gateway forwards it to a default backend service
B) The Gateway returns a 404 Not Found response
C) The Gateway crashes and needs to be restarted
D) The request is queued until a matching route is created

**Correct Answer:** B

**Explanation:**
When no HTTPRoute matches a request, the Gateway returns a 404 Not Found response. There's no default backend in Gateway API (unlike Ingress which had a default backend). Gateways don't crash on unmatched requests. Requests aren't queued - they're handled immediately with an error response.

---

## Question 10

**Question Type:** Scenario

**Context:**
You're running the Voting App with Contour as your Gateway controller in a KIND cluster. You want to access the vote service from your local machine. When you check the Contour envoy service, you see `EXTERNAL-IP: <pending>`.

**Question:**
What is the correct way to access your services?

**Options:**

A) Wait for KIND to assign an external IP - it can take up to 10 minutes
B) Install MetalLB to provide LoadBalancer services in KIND
C) Use kubectl port-forward to forward traffic from your local machine to the envoy service
D) Change the envoy service type from LoadBalancer to NodePort

**Correct Answer:** C

**Explanation:**
KIND doesn't provide LoadBalancer services by default (no external IP assignment). The simplest solution for local development is using `kubectl port-forward -n projectcontour svc/envoy 8080:80` to forward traffic to the Gateway. KIND won't assign an IP no matter how long you wait. While MetalLB can provide LoadBalancer support in KIND, it's additional complexity for local development. Changing to NodePort works but port-forward is simpler for accessing services locally.

---

## Question 11

**Question Type:** True/False

**Question:**
Gateway API resources (Gateway, HTTPRoute) are portable across different Gateway controller implementations, meaning you can switch from Contour to NGINX Gateway Fabric without changing your HTTPRoute configurations.

**Correct Answer:** True

**Explanation:**
Gateway API is a standard specification. HTTPRoutes and Gateways (core features) work across any compliant controller. You change controllers by changing the GatewayClass, not your routing configs. This is a major advantage over Ingress, which required controller-specific annotations that locked you into one implementation. Some advanced features may still need controller-specific extensions, but the core routing functionality is portable.

---

## Question 12

**Question Type:** Scenario

**Context:**
You have created a Gateway and an HTTPRoute for your Voting App. The Gateway shows `Programmed: True`, but when you test with curl, you get a connection refused error. You've verified that the vote service exists and has endpoints.

**Question:**
What is the most likely issue and how would you debug it?

**Options:**

A) The HTTPRoute is misconfigured - check if Accepted and ResolvedRefs conditions are True
B) The Gateway controller is down - restart the Contour pods
C) The vote pods are not ready - check pod status with kubectl get pods
D) DNS is not configured - add entries to /etc/hosts

**Correct Answer:** A

**Explanation:**
Connection refused when the Gateway is Programmed usually means the HTTPRoute isn't correctly attached or can't resolve its backend references. Run `kubectl describe httproute <name>` and check the conditions: `Accepted: True` means it attached to the Gateway, `ResolvedRefs: True` means it found the backend service. If either is False, there's a configuration issue (wrong namespace, service name typo, missing ReferenceGrant). The Gateway being Programmed means the controller is running. Pod readiness would cause different symptoms (503 errors, not connection refused). DNS is only needed for hostname-based routing in production, not for basic functionality testing.

---
