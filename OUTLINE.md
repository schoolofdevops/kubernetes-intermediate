Perfect. Designing **SFD301** around the **Example Voting App** is an excellent pedagogical choice — it gives you a **single, evolving system** that naturally exposes scheduling, scaling, traffic, security, Helm, CRDs, Operators, and even Agentic concepts without feeling artificial.

Below is a **clean, final, instructor-grade design** you can directly use to build the course.

---

# 📘 SFD301 – Kubernetes Intermediate: For Developers & DevOps Engineers

---

## 1️⃣ FINAL COURSE OUTLINE (WITH VOTING APP + KIND)

---

## Course Title

**SFD301 – Kubernetes Intermediate: For Developers & DevOps Engineers**

---

## Course Positioning

> **The bridge between Kubernetes basics and real-world, production-grade systems.**

This course takes learners from *“I know Kubernetes objects”* to *“I can design, scale, secure, and extend Kubernetes workloads confidently”* — using a **single, realistic application** as the backbone.

---

## Who This Course Is For

This course is ideal for:

* **Software Developers / Application Engineers** deploying apps on Kubernetes
* **DevOps Engineers** supporting application teams
* Engineers who have completed **Kubernetes Essentials / Fundamentals**
* Professionals preparing to move into **Platform Engineering or Advanced Kubernetes roles**

This course is **not**:

* A GitOps or ArgoCD course
* A Kubernetes cluster administration course
* A deep Go or Operator SDK bootcamp

---

## Prerequisites

Learners should already be comfortable with:

* Pods, Deployments, Services
* ConfigMaps and Secrets
* Basic Ingress concepts
* kubectl usage
* Containers and Docker

A local Kubernetes cluster will be set up during the course.

---

## Core Use Case (Threaded Through the Entire Course)

### 🎯 Example Voting App

Repository:
[https://github.com/schoolofdevops/example-voting-app](https://github.com/schoolofdevops/example-voting-app)

The app consists of:

* Frontend voting service
* Backend result service
* Worker service
* Redis
* PostgreSQL

Each section of the course **evolves this same application**:

* From basic deployment
* To scaled, traffic-managed, secure workloads
* To custom APIs and Operators
* To AI-assisted troubleshooting

This avoids toy examples and teaches **systems thinking**.

---

## High-Level Topic List

1. Essentials Refresh & Environment Setup
2. Advanced Pod Scheduling & Placement
3. Resource Management & Autoscaling
4. Gateway API & Modern Traffic Control
5. Service Mesh Decision Making
6. Security for Application Teams
7. Helm for Real-World Applications
8. Extending Kubernetes with CRDs
9. Writing Kubernetes Operators
10. Intro to Agentic Kubernetes (Preview)

---

## 2️⃣ SECTION & HANDS-ON LAB BREAKDOWN

This is structured **exactly how you can build the course**.

---

## 🔹 Section 0: Essentials Refresh & Environment Setup

### Purpose

* Align everyone to a **common baseline**
* Avoid re-teaching theory
* Get hands-on immediately

### Topics Covered

* Kubernetes objects recap (Pods, Deployments, Services)
* How the Example Voting App is structured
* Local Kubernetes with KIND
* kubectl context hygiene

### 🧪 Hands-On Lab: Setting Up the Playground

**Lab Outline**

* Create a local Kubernetes cluster using KIND
  👉 [https://kubernetes-tutorial.schoolofdevops.com/kind_create_cluster/](https://kubernetes-tutorial.schoolofdevops.com/kind_create_cluster/)
* Verify cluster health
* Deploy the Example Voting App (baseline)
* Confirm all services are reachable
* Capture the “working baseline” state

**Outcome**

> Everyone starts from the *same known-good system*.

---

## 🔹 Section 1: Advanced Pod Scheduling & Placement

### Topics Covered

* Node affinity & anti-affinity
* Pod affinity for co-located services
* Topology spread constraints
* Scheduling failure modes

### 🧪 Lab: Making the Voting App Highly Available

**Lab Outline**

* Label nodes by zone / role
* Distribute frontend replicas across nodes
* Prevent Redis/Postgres from co-locating improperly
* Introduce bad constraints and debug Pending pods

**Outcome**

> Learners understand *why pods land where they do*.

---

## 🔹 Section 2: Resource Management & Autoscaling

### Topics Covered

* Requests vs limits (production heuristics)
* CPU throttling & memory OOMs
* HPA internals
* VPA trade-offs
* KEDA overview

### 🧪 Lab: Scaling the Voting App Under Load

**Lab Outline**

* Add load to the voting frontend
* Observe failures due to poor resource settings
* Configure HPA for frontend
* Evaluate VPA recommendations
* Discuss when KEDA would be appropriate

**Outcome**

> Learners can **design autoscaling intentionally**, not blindly.

---

## 🔹 Section 3: Kubernetes Gateway API & Traffic Control

### Topics Covered

* Why Ingress is insufficient
* Gateway API mental model
* Gateway vs Route vs Listener
* Multi-team traffic ownership
* Routing strategies

### 🧪 Lab: Migrating Voting App from Ingress to Gateway API

**Lab Outline**

* Identify Ingress limitations in current setup
* Deploy a Gateway
* Route traffic using HTTPRoute
* Split traffic between versions of frontend
* Simulate multiple teams owning routes

**Outcome**

> Learners adopt **modern Kubernetes traffic patterns**.

---

## 🔹 Section 4: When (and When Not) to Use a Service Mesh

### Topics Covered

* What Gateway API solves
* What it does not
* Clear service mesh adoption signals
* Sidecar vs ambient concepts
* Cost vs complexity trade-offs

### 🧪 Lab: Architecture Decision Workshop

**Lab Outline**

* Evaluate Voting App requirements
* Identify needs: mTLS, retries, observability
* Compare Gateway-only vs Mesh-based designs
* Make an explicit “mesh or no mesh” decision

**Outcome**

> Learners develop **architectural judgment**.

---

## 🔹 Section 5: Security for Application & DevOps Teams

### Topics Covered

* NetworkPolicies
* Pod Security Admission
* RBAC from a developer POV
* Secure-by-default manifests

### 🧪 Lab: Securing the Voting App Incrementally

**Lab Outline**

* Apply default-deny NetworkPolicy
* Allow only required service-to-service traffic
* Enable Pod Security Admission
* Fix blocked deployments
* Validate least-privilege access

**Outcome**

> Security added **without breaking the app**.

---

## 🔹 Section 6: Helm for Real-World Applications

### Topics Covered

* Helm mental model
* Chart structure best practices
* values.yaml patterns
* Avoiding chart sprawl

### 🧪 Lab: Helm-ifying the Voting App

**Lab Outline**

* Convert raw manifests into a Helm chart
* Parameterize environments
* Separate config, secrets, and resources
* Deploy same chart to multiple namespaces

**Outcome**

> Learners create **maintainable, reusable charts**.

---

## 🔹 Section 7: Extending Kubernetes with CRDs

### Topics Covered

* CRDs as APIs
* Schema validation
* Versioning strategies
* Status subresource

### 🧪 Lab: Creating a Custom Resource for the Voting App

**Lab Outline**

* Design a `VotingApp` Custom Resource
* Define desired state (replicas, limits)
* Add schema validation
* Update status to reflect health

**Outcome**

> Learners think in **Kubernetes APIs**, not YAML hacks.

---

## 🔹 Section 8: Writing Kubernetes Operators

### Topics Covered

* Operator pattern & reconciliation loop
* Mapping business logic to controllers
* Lifecycle management
* When not to write Operators

### 🧪 Lab: Operator Design (Lightweight)

**Lab Outline**

* Design reconciliation logic for VotingApp CR
* Identify desired vs observed state
* Walk through a minimal operator codebase
* Compare Operator vs CronJobs / Controllers

**Outcome**

> Learners know **when Operators are worth it**.

---

## 🔹 Section 9: Intro to Agentic Kubernetes (Preview)

### Topics Covered

* AI-assisted Kubernetes debugging
* Runbooks → agent skills
* Event → signal → action loops
* Human-in-the-loop automation

### 🧪 Lab: AI-Assisted Troubleshooting of Voting App

**Lab Outline**

* Introduce a failure in the Voting App
* Use AI to analyze logs and events
* Convert troubleshooting steps into a structured runbook
* Add approval checkpoints
* Discuss automation boundaries

**Outcome**

> Learners glimpse the **future of Kubernetes operations**.

---

## 🎯 Final Learning Outcome

By the end of **SFD301**, learners will:

* Design scalable Kubernetes workloads
* Apply modern traffic management patterns
* Secure applications correctly
* Extend Kubernetes using CRDs and Operators
* Be ready for **Advanced Kubernetes Ops, GitOps, and Agentic Kubernetes**

---


