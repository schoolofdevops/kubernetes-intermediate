# Roadmap: SFD301 Kubernetes Intermediate Course

## Overview

This roadmap delivers a production-ready intermediate Kubernetes course through 5 core phases plus 1 future phase. Starting with platform foundation (Docusaurus site, CI/CD, navigation), moving through content infrastructure setup (templates, diagrams, lab structure), then executing two content sprints covering all 10 course sections with hands-on labs and quizzes, and finally polishing with progress tracking and documentation. An optional sixth phase (deferred to v2) adds automated lab validation scripts for enhanced learner experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Platform Foundation** - Docusaurus site with navigation and deployment pipeline ✅ Completed 2026-02-08
- [ ] **Phase 2: Content Infrastructure** - Templates, diagram tooling, and lab structure
- [ ] **Phase 3: Core Content (Sections 0-4)** - First half of course content with labs and quizzes
- [ ] **Phase 4: Advanced Content (Sections 5-9)** - Second half completing all course sections
- [ ] **Phase 5: Progress & Documentation** - Progress tracking, README, and course publishing
- [ ] **Phase 6: Automated Lab Validation (Optional/Future)** - v2 enhancement for automated lab verification

## Phase Details

### Phase 1: Platform Foundation ✅ COMPLETE
**Goal**: Learners can access a deployed Docusaurus site with working navigation and responsive design
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06 (12/12 ✅)
**Success Criteria** (what must be TRUE):
  1. ✅ Site displays syntax-highlighted code blocks with copy button on all examples
  2. ✅ Site is fully responsive on desktop, tablet, and mobile devices
  3. ✅ Dark mode toggle works and persists user preference
  4. ✅ Left sidebar shows course structure, right sidebar shows page TOC, search finds content
  5. ✅ GitHub Actions automatically deploys site to GitHub Pages on push to main
**Plans:** 2 plans (both complete)
**Verification:** Passed 5/5 must-haves — see 01-VERIFICATION.md
**Completed:** 2026-02-08
**Live Site:** https://schoolofdevops.github.io/kubernetes-intermediate/

Plans:
- [x] 01-01-PLAN.md — Scaffold Docusaurus project and configure site (config, sidebar, CSS, search) ✅
- [x] 01-02-PLAN.md — Create 10-section content structure, GitHub Actions workflow, and verify ✅

### Phase 2: Content Infrastructure
**Goal**: Course authors have reusable templates and tooling to create consistent content efficiently
**Depends on**: Phase 1
**Requirements**: TEMPLATE-01, TEMPLATE-02, TEMPLATE-03, TEMPLATE-04, TEMPLATE-05, TEMPLATE-06, DIAGRAM-01, DIAGRAM-02, DIAGRAM-03, DIAGRAM-04, DIAGRAM-05
**Success Criteria** (what must be TRUE):
  1. Lab format template exists with documented structure (setup → tasks → verification → outcome)
  2. Content structure template documents section layout, callouts, and code block patterns
  3. Mermaid and Excalidraw diagrams render correctly in Docusaurus on all devices
  4. Diagram source files (.mmd, .excalidraw) are version-controlled with build workflow
  5. Quiz component template is functional and reusable for all sections
**Plans:** 2 plans

Plans:
- [ ] 02-01-PLAN.md — Install Mermaid theme, configure Docusaurus, create diagram directory structure and workflow docs
- [ ] 02-02-PLAN.md — Create lab, content, and quiz templates with comprehensive authoring guide

### Phase 3: Core Content (Sections 0-4)
**Goal**: Learners can complete first five course sections with reading materials, diagrams, hands-on labs, and quizzes
**Depends on**: Phase 2
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-11, CONTENT-12, CONTENT-13, CONTENT-14, DIAGRAM-06, LAB-01, LAB-02, LAB-03, LAB-04, LAB-05, LAB-11, LAB-12, LAB-13, LAB-14, LAB-15, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-11, QUIZ-12, QUIZ-13
**Success Criteria** (what must be TRUE):
  1. Section 0 (Essentials Refresh & KIND Setup) is complete with reading materials, diagrams, lab, and quiz
  2. Section 1 (Advanced Pod Scheduling) is complete with all components working
  3. Section 2 (Resource Management & Autoscaling) is complete with all components working
  4. Section 3 (Gateway API) is complete with all components working
  5. Section 4 (Service Mesh Decision) is complete with all components working
  6. All labs (Sections 0-4) are verified working on actual KIND clusters
  7. Example Voting App progresses consistently across these sections with story-based narrative
  8. Each section reads in 10-20 minutes with balanced depth and simple language
**Plans:** 5 plans

Plans:
- [ ] 03-01-PLAN.md — Module 0: Introduction and Getting Started (base YAMLs, KIND setup, Voting App deployment)
- [ ] 03-02-PLAN.md — Module 1: Advanced Pod Scheduling (node affinity, pod anti-affinity, taints/tolerations)
- [ ] 03-03-PLAN.md — Module 2: Autoscaling (HPA, Metrics Server, KEDA event-driven scaling)
- [ ] 03-04-PLAN.md — Module 3: Gateway API (Contour, HTTPRoutes, traffic splitting)
- [ ] 03-05-PLAN.md — Module 4: Service Mesh (decision framework, evaluation exercise, optional Linkerd)

### Phase 4: Advanced Content (Sections 5-9)
**Goal**: Learners can complete remaining five advanced sections, finishing entire course with production-ready Example Voting App deployment
**Depends on**: Phase 3
**Requirements**: CONTENT-06, CONTENT-07, CONTENT-08, CONTENT-09, CONTENT-10, LAB-06, LAB-07, LAB-08, LAB-09, LAB-10, QUIZ-06, QUIZ-07, QUIZ-08, QUIZ-09, QUIZ-10
**Success Criteria** (what must be TRUE):
  1. Section 5 (Security) is complete with reading materials, diagrams, lab, and quiz
  2. Section 6 (Helm) is complete with all components working
  3. Section 7 (CRDs) is complete with all components working
  4. Section 8 (Operators) is complete with all components working
  5. Section 9 (Agentic Kubernetes) is complete with all components working
  6. All labs (Sections 5-9) are verified working on actual KIND clusters
  7. Example Voting App narrative arc completes with production-grade deployment patterns
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during phase planning

### Phase 5: Progress & Documentation
**Goal**: Learners see their progress tracked across sessions and course is published with complete documentation
**Depends on**: Phase 4
**Requirements**: PROGRESS-01, PROGRESS-02, PROGRESS-03, PROGRESS-04, PROGRESS-05, PROGRESS-06, DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06
**Success Criteria** (what must be TRUE):
  1. Progress indicator shows section completion percentage and overall course completion
  2. Progress state persists across browser sessions via localStorage
  3. Learning path visualization shows all 10 sections with current position
  4. README.md includes course overview, prerequisites, section index, and setup instructions
  5. Apache 2.0 LICENSE file exists with proper credits to School of Devops and author
  6. Course is browsable on both GitHub repository and deployed Docusaurus site
**Plans**: TBD

Plans:
- [ ] 05-01: TBD during phase planning

### Phase 6: Automated Lab Validation (Optional/Future)
**Goal**: Learners receive automated feedback on lab completion for self-validation and confidence building
**Depends on**: Phase 5
**Requirements**: LAB-AUTO-01, LAB-AUTO-02, LAB-AUTO-03 (v2 requirements - deferred)
**Success Criteria** (what must be TRUE):
  1. Automated validation scripts check lab completion for all 10 sections
  2. Scripts provide clear pass/fail feedback with diagnostic messages
  3. Validation runs in clean KIND cluster environments to prevent false positives
  4. Documentation explains how to run validation scripts locally
**Plans**: TBD
**Status**: DEFERRED to v2 - Not part of initial course launch

Plans:
- [ ] 06-01: TBD during v2 planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → (optional: 6)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Platform Foundation | 2/2 | Complete | 2026-02-08 |
| 2. Content Infrastructure | 0/2 | Planned | - |
| 3. Core Content (Sections 0-4) | 0/5 | Planned | - |
| 4. Advanced Content (Sections 5-9) | 0/TBD | Not started | - |
| 5. Progress & Documentation | 0/TBD | Not started | - |
| 6. Automated Lab Validation | 0/TBD | Deferred (v2) | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-08 — Phase 3 planned*
