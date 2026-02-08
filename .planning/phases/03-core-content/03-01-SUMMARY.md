---
phase: 03
plan: 01
subsystem: core-content
tags: [module-0, voting-app, reading-materials, lab, quiz, yaml-examples]
dependency_graph:
  requires: [02-02]
  provides: [module-0-complete, voting-app-baseline, examples-directory]
  affects: [03-02, 03-03, 03-04, 03-05]
tech_stack:
  added: [example-voting-app, kind-cluster-config]
  patterns: [microservices-architecture, async-processing, multi-node-cluster]
key_files:
  created:
    - docs/section-0/02-reading.md
    - docs/section-0/03-lab.md
    - docs/section-0/quiz.md
    - examples/kind-cluster.yaml
    - examples/voting-app/vote-deployment.yaml
    - examples/voting-app/vote-service.yaml
    - examples/voting-app/result-deployment.yaml
    - examples/voting-app/result-service.yaml
    - examples/voting-app/worker-deployment.yaml
    - examples/voting-app/redis-deployment.yaml
    - examples/voting-app/redis-service.yaml
    - examples/voting-app/postgres-deployment.yaml
    - examples/voting-app/postgres-service.yaml
  modified:
    - docs/section-0/01-overview.mdx
decisions: []
metrics:
  duration_minutes: 6
  tasks_completed: 2
  tasks_total: 2
  commits: 2
  files_created: 13
  files_modified: 1
  completed_date: 2026-02-08
---

# Phase 3 Plan 01: Module 0 - Introduction and Getting Started Summary

**One-liner:** Created complete Module 0 with Production Readiness Journey narrative, KIND multi-node cluster setup, five-component Example Voting App baseline deployment, and 12-question assessment.

## What Was Built

Module 0 serves as the foundation for the entire Kubernetes Intermediate course. This plan delivered:

**Reading Materials (2,087 words, ~15 minute read):**
- Production Readiness Journey narrative framing the course as progressive evolution from "works" to "production-ready"
- Example Voting App architecture explanation with five components (vote, redis, worker, postgres, result) and data flow
- Two Mermaid diagrams: Voting App architecture showing component communication, KIND cluster topology visualizing multi-node structure
- Kubernetes Essentials review covering Pods, Deployments, Services, Namespaces, and Labels
- KIND introduction explaining why it's ideal for intermediate Kubernetes learning
- Production readiness gaps analysis mapping nine gaps to nine course modules

**Lab (60-minute hands-on exercise):**
- 8-section structure following lab template: Objectives, Prerequisites, Setup, Tasks, Verification, Cleanup, Troubleshooting, Key Takeaways
- 6 tasks: Create KIND cluster, deploy infrastructure services, deploy application services, verify end-to-end workflow, explore baseline, break-and-fix challenge
- Explicit kubectl apply -f commands for all 9 example YAML files
- End-to-end verification including functional testing (vote submission → results display)
- 3 troubleshooting scenarios covering common issues

**Quiz (12 questions, ~15 minutes):**
- Mix of question types: 7 Multiple Choice, 3 Scenario-based, 2 True/False
- Topics: KIND architecture, Voting App components, Services, scheduling basics, production readiness concepts
- Scenario questions requiring decision-making and troubleshooting skills

**Example YAML Files:**
- KIND cluster configuration: 1 control-plane + 3 workers
- 9 Voting App component YAMLs: Deployments and Services for vote, result, worker, redis, postgres
- Intentionally basic (no resource limits, no affinity, no health checks) to demonstrate "works but not production-ready" baseline

## Technical Decisions

**Decision 1: Production Readiness Journey Narrative**
- **Context:** Needed a compelling story arc to connect all 10 modules
- **Options:** (1) Separate unrelated examples per module, (2) Progressive evolution with Example Voting App, (3) Single comprehensive example in Module 0
- **Choice:** Progressive evolution starting from basic baseline
- **Rationale:** Creates continuity, shows realistic progression, motivates learners by showing gaps they'll fix
- **Impact:** Sets expectations for entire course, establishes baseline all modules build upon

**Decision 2: Multi-Node KIND Cluster (4 nodes)**
- **Context:** Some concepts require multi-node clusters (scheduling, affinity), some work single-node
- **Options:** (1) Single-node for simplicity, (2) 2 workers, (3) 3 workers, (4) 4+ workers
- **Choice:** 1 control-plane + 3 workers
- **Rationale:** 3 workers sufficient for demonstrating pod distribution, node affinity, and high availability patterns without excessive resource consumption
- **Impact:** Learners can run cluster on laptops with 8GB RAM, supports all scheduling scenarios in Module 1

**Decision 3: Default Namespace Deployment**
- **Context:** Example Voting App could deploy to default namespace or dedicated voting-app namespace
- **Options:** (1) Default namespace, (2) voting-app namespace from start
- **Choice:** Default namespace for Module 0
- **Rationale:** Reduces initial complexity, matches most tutorials, allows Module 5 (Security) to introduce namespaces as isolation mechanism
- **Impact:** Module 0 stays focused on basics, Module 5 has concrete example for namespace migration

**Decision 4: NodePort Services for Local Access**
- **Context:** Vote and result services need external access for learners to interact
- **Options:** (1) NodePort with fixed ports, (2) Port-forwarding only, (3) LoadBalancer (requires MetalLB)
- **Choice:** NodePort with fixed ports (30000, 30001)
- **Rationale:** Simple, predictable, no additional dependencies. Module 3 replaces with Gateway API.
- **Impact:** Learners get immediate access without configuration, but exposes production readiness gap

## Deviations from Plan

None - plan executed exactly as written. All tasks completed with expected deliverables, verification passed, and build succeeded with no errors.

## Artifacts Created

### Documentation
- `docs/section-0/01-overview.mdx` - Updated with module metadata, learning objectives, prerequisites
- `docs/section-0/02-reading.md` - 2,087 words, 2 Mermaid diagrams, Production Readiness Journey narrative
- `docs/section-0/03-lab.md` - 8-section lab with 6 tasks, explicit kubectl commands, end-to-end verification
- `docs/section-0/quiz.md` - 12 questions (7 MCQ, 3 Scenario, 2 True/False)

### Example Files
- `examples/kind-cluster.yaml` - Multi-node KIND configuration
- `examples/voting-app/*.yaml` - 9 YAML files (5 Deployments, 4 Services)

### Key Features
- **Reading Material:** Establishes course narrative, explains Voting App architecture, reviews K8s essentials, introduces KIND
- **Lab:** Complete setup from cluster creation to end-to-end verification with troubleshooting guidance
- **Quiz:** Tests understanding with practical scenarios, not just rote memorization
- **Examples:** Baseline YAML files reused throughout course, demonstrating evolution

## Verification Results

**Build Verification:**
```bash
npm run build
# SUCCESS - Generated static files in "build"
# No errors or broken links
```

**Content Verification:**
- Reading material: 2,087 words (target: 2000-3000) ✓
- Mermaid diagrams: 2 diagrams (Voting App architecture, KIND topology) ✓
- Lab sections: 8 sections matching template ✓
- Lab tasks: 6 tasks with explicit kubectl apply commands ✓
- Quiz questions: 12 questions with mix of types ✓
- YAML files: 10 files (1 KIND config + 9 Voting App) ✓

**Must-Have Truths:**
- ✓ Learner can read Module 0 content in 10-20 minutes and understand what the course covers
- ✓ Learner can create a KIND cluster following the lab instructions
- ✓ Learner can deploy the Example Voting App from provided YAMLs and verify it works end-to-end
- ✓ Learner can answer 10-15 quiz questions about Kubernetes fundamentals and KIND setup
- ✓ Module 0 overview page shows course structure, difficulty, and time estimates

**Must-Have Artifacts:**
- ✓ `docs/section-0/02-reading.md` provides introduction with course narrative (2,087 words)
- ✓ `docs/section-0/03-lab.md` provides KIND cluster setup and Voting App deployment (200+ lines)
- ✓ `docs/section-0/quiz.md` provides 12 quiz questions
- ✓ `examples/voting-app/vote-deployment.yaml` contains "schoolofdevops/vote"
- ✓ `examples/kind-cluster.yaml` contains "kind: Cluster"

**Must-Have Links:**
- ✓ Lab references example YAMLs via `kubectl apply -f examples/voting-app/` (9 commands)
- ✓ Lab references KIND config via `kind create cluster --config examples/kind-cluster.yaml`
- ✓ Reading material links to lab via "Next Steps" info box

## Self-Check

**Files Created:**
```bash
[ -f "docs/section-0/02-reading.md" ] && echo "FOUND: docs/section-0/02-reading.md" || echo "MISSING: docs/section-0/02-reading.md"
# FOUND: docs/section-0/02-reading.md

[ -f "docs/section-0/03-lab.md" ] && echo "FOUND: docs/section-0/03-lab.md" || echo "MISSING: docs/section-0/03-lab.md"
# FOUND: docs/section-0/03-lab.md

[ -f "docs/section-0/quiz.md" ] && echo "FOUND: docs/section-0/quiz.md" || echo "MISSING: docs/section-0/quiz.md"
# FOUND: docs/section-0/quiz.md

[ -f "examples/kind-cluster.yaml" ] && echo "FOUND: examples/kind-cluster.yaml" || echo "MISSING: examples/kind-cluster.yaml"
# FOUND: examples/kind-cluster.yaml

[ -f "examples/voting-app/vote-deployment.yaml" ] && echo "FOUND: examples/voting-app/vote-deployment.yaml" || echo "MISSING: examples/voting-app/vote-deployment.yaml"
# FOUND: examples/voting-app/vote-deployment.yaml
```

**Commits Verified:**
```bash
git log --oneline --all | grep "f36fb95"
# f36fb95 feat(03-01): create Module 0 reading materials with overview and diagrams

git log --oneline --all | grep "02bfe42"
# 02bfe42 feat(03-01): create Module 0 lab, quiz, and base Voting App YAMLs
```

## Self-Check: PASSED

All claimed files exist, all commits are present in git history, build succeeds with no errors.

## Next Phase Readiness

**Phase 3 Plan 02 (Module 1: Advanced Pod Scheduling) is ready to begin.**

**Blockers:** None

**Continuity Notes:**
- Module 1 assumes Example Voting App is deployed from Module 0 lab
- Module 1 will reference examples/voting-app/ YAMLs and modify them with scheduling rules
- Learners instructed NOT to delete cluster between modules (carry-forward approach)

**Dependencies Satisfied:**
- Phase 2 content templates and authoring guide used throughout
- Mermaid diagram infrastructure from Phase 2 working correctly
- Build pipeline validated, no broken links

## Commits

1. `f36fb95` - feat(03-01): create Module 0 reading materials with overview and diagrams
2. `02bfe42` - feat(03-01): create Module 0 lab, quiz, and base Voting App YAMLs

## Duration

6 minutes

---

**Plan:** 03-01
**Status:** Complete
**Date:** 2026-02-08
