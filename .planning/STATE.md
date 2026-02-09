# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Learners master intermediate Kubernetes concepts through a continuous, story-based progression with one realistic application
**Current focus:** Phase 3 - Core Content (Sections 0-4)

## Current Position

Phase: 4 of 5 (Advanced Content - Modules 5-9)
Plan: 5 of 5
Status: 5 of 5 plans complete (PHASE COMPLETE)
Last activity: 2026-02-09 — Completed 04-04-PLAN.md (Module 8: Building Kubernetes Operators)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 15
- Average duration: 10 minutes
- Total execution time: 2.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Platform Foundation | 2/2 | 22 min | 11 min |
| 02 Content Infrastructure | 2/2 | 13 min | 7 min |
| 03 Core Content (0-4) | 5/5 | 33 min | 7 min |
| 04 Advanced Content (5-9) | 5/5 | 91 min | 18 min |

**Recent Trend:**
- Last 5 plans: 04-01 (19 min), 04-02 (13 min), 04-03 (27 min), 04-05 (24 min), 04-04 (8 min)
- Trend: Phase 4 COMPLETE - All 5 modules delivered
- Phase 4 average: 18 min/plan (efficient despite comprehensive content)
- Module 8 delivered: 3061-word reading (3 diagrams), 1270-line operator lab with Kubebuilder, 15-question quiz

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap Structure: Derived 5 core phases from 82 requirements with quick depth calibration, focusing on foundation-first approach to prevent rework
- Phase 6 (Optional): Included v2 automated lab validation as future phase per user instruction, clearly marked as deferred
- Content Grouping: Split 10 course sections into two content phases (Sections 0-4, Sections 5-9) for manageable sprint execution with story consistency
- D001 (01-01): Scaffold Docusaurus in temp directory due to create-docusaurus limitation with existing directories
- D002 (01-01): Explicitly set navbar logo href to '/intro' to fix broken link in docs-only mode where routeBasePath is '/'
- D003 (01-02): Use "Module" terminology instead of "Section" throughout course for better alignment with course structure
- D004 (01-02): Simplified homepage to clean, minimal design per user preference (no emojis, concise sections)
- D005 (01-02): Module 0 renamed to "Introduction and Getting Started" (from "Essentials Refresh")
- D006 (01-02): Enhanced module labels with specificity (e.g., "Advanced Pod Scheduling", "Security (NetworkPolicy, PSA, RBAC)")
- D007 (03-03): Use Metrics Server with --kubelet-insecure-tls patch for KIND compatibility
- D008 (03-03): Include KEDA for event-driven scaling to demonstrate queue-based autoscaling
- D009 (03-03): Add resource requests to vote/result in lab setup (required for HPA to function)
- D010 (03-03): End 0-1-2 build-up sequence - cleanup autoscaling resources but keep cluster
- D011 (03-04): Use Contour as Gateway controller (simplest for learning, well-documented)
- D012 (03-04): Module 3 starts with fresh Voting App deployment (not carry-forward from Module 2)
- D013 (03-04): Include traffic splitting for canary deployments (advanced pattern, high learning value)
- D014 (03-04): Add cross-namespace ReferenceGrant challenge (addresses common pitfall)
- D015 (03-05): Evaluation-focused lab for Module 4 (decision document as deliverable, not running mesh)
- D016 (03-05): Linkerd for optional hands-on (simpler than Istio, 5-minute install vs 30+ minutes)
- D017 (03-05): Service count threshold of 10+ microservices in decision framework
- D018 (Validation): Use schoolofdevops/vote:v1 consistently (user's image, v2-v9 reserved for updates)
- D019 (Validation): Replace Contour with NGINX Gateway Fabric (Contour installation failed, NGINX is enterprise-standard)
- D020 (Validation): Add URLRewrite filters to Gateway API path-based routing (services expect root path)
- D021 (Validation): Convert Module 4 from theoretical evaluation to hands-on Linkerd quest
- D022 (Validation): Keep Linkerd lightweight (Viz only, no Grafana/Jaeger for local learning)
- D023 (Validation): Test EVERY lab instruction on actual cluster before considering module complete
- D024 (04-01): Calico CNI for NetworkPolicy enforcement (KIND default Flannel doesn't enforce policies)
- D025 (04-01): DNS allowlist as critical pattern (default-deny breaks service discovery without it)
- D026 (04-01): PSA baseline enforcement with restricted audit/warn (balance security and compatibility)
- D027 (04-01): Secret volume mounts over environment variables (not visible in kubectl describe)
- D028 (04-01): Fresh KIND cluster for Module 5 (simpler than adding Calico to existing cluster)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Validation Session (2026-02-09)

**Phase 3 Testing & Fixes:**
All 5 modules tested on actual KIND cluster (3-node: 1 control-plane + 2 workers)

- **Module 1** - Tested all 5 scheduling tasks, fixed 59 lines (node names, replica counts)
- **Module 2** - Tested HPA/metrics, fixed node names + critical result image bug
- **Module 3** - Tested routing, replaced failing Contour with NGINX Gateway Fabric, added URL rewrite
- **Module 4** - Complete Linkerd installation tested, converted evaluation→exploratory quest

**Key Fixes:**
- Node names: kind-* → voting-app-* (all modules)
- Cluster size: 3 workers → 2 workers
- Kubernetes version: v1.27/v1.28 → v1.32.0
- Image consistency: schoolofdevops/vote:v1 maintained
- Gateway controller: Contour (failed) → NGINX Gateway Fabric (working)
- Module 4: Istio (heavy) → Linkerd (lightweight, tested)

**Result:** Every instruction in Modules 0-4 is now tested, working, and verified

## Session Continuity

Last session: 2026-02-09
Stopped at: Completed 04-04 (Module 8: Building Kubernetes Operators) - Complete operator workflow with Kubebuilder, reconciliation loops, finalizers
Next action: Phase 4 COMPLETE - All advanced content modules (5-9) delivered
Resume file: N/A (milestone ready for next phase)
Note: Phase 4 complete - Security, Helm, CRDs, Operators, Agentic Kubernetes all delivered

**Plan 04-04 complete** — VoteConfig operator with Kubebuilder: reconciliation loop, finalizers, controller-runtime patterns (3061-word reading, 1270-line lab, 15 questions) — 2026-02-09T12:27:36Z
