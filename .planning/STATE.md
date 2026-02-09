# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** Learners master intermediate Kubernetes concepts through a continuous, story-based progression with one realistic application
**Current focus:** Phase 3 - Core Content (Sections 0-4)

## Current Position

Phase: 4 of 5 (Advanced Content - Modules 5-9)
Plan: 3 of 5
Status: In progress
Last activity: 2026-02-09 — Completed 04-03-PLAN.md (Module 7: CRDs)

Progress: [██████░░░░] 60%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 8 minutes
- Total execution time: 1.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Platform Foundation | 2/2 | 22 min | 11 min |
| 02 Content Infrastructure | 2/2 | 13 min | 7 min |
| 03 Core Content (0-4) | 5/5 | 33 min | 7 min |
| 04 Advanced Content (5-9) | 3/5 | 31 min | 10 min |

**Recent Trend:**
- Last 5 plans: 03-03 (6 min), 03-04 (8 min), 03-05 (7 min), 04-02 (15 min), 04-03 (16 min)
- Trend: Phase 4 started - Module 6 (Helm) delivered in 15 minutes
- Phase 4 modules may take longer (advanced topics with more complexity)
- Module 6: 2619-word reading, 1089-line lab, 13-question quiz

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
- D024 (04-02): Helm 3 with Helm 4 awareness (core concepts identical, OCI differences noted)
- D025 (04-02): Progressive chart building (single component → full umbrella chart)
- D026 (04-02): Exact dependency version locking (18.19.4 not 18.x for reproducibility)
- D027 (04-02): Anti-pattern documentation (over-templatization warnings)
- D028 (04-02): Bitnami dependency pattern (reuse community charts, not custom manifests)
- D029 (04-03): VoteConfig CRD as learning example (simple voting options with validation, realistic patterns, Module 8 foundation)
- D030 (04-03): Manual CRD-to-ConfigMap bridging in lab (demonstrates reconciliation pain, motivates operator need)

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
Stopped at: Completed 04-02 (Module 6: Writing Helm Charts) - Reading, lab, and quiz delivered
Next action: Continue Phase 4 with remaining modules (5, 7, 8, 9) or validate Module 6 lab
Resume file: .planning/phases/04-advanced-content/04-03-PLAN.md
