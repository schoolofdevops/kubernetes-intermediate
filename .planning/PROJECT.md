# SFD301 – Kubernetes Intermediate Course

## What This Is

An intermediate Kubernetes course for developers and DevOps engineers that bridges Kubernetes basics to production-grade systems. Uses a single realistic application (Example Voting App) that evolves through 10 sections covering scheduling, scaling, traffic management, security, Helm, CRDs, Operators, and Agentic Kubernetes. Delivered as a Docusaurus site with reading materials, technical diagrams, hands-on labs, and quizzes — designed as a reusable template for all future School of Devops courses.

## Core Value

Learners master intermediate Kubernetes concepts through a continuous, story-based progression with one realistic application — avoiding toy examples and teaching systems thinking.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Section Content (10 sections):**
- [ ] Reading materials for all 10 sections (balanced depth: 10-20 min read each)
- [ ] High-level conceptual diagrams optimized for video explanation (using Excalidraw)
- [ ] Quizzes for each section (mix of MCQs, scenario-based questions, concept checks)
- [ ] Content written in simple language with analogies and technical clarity

**Labs (Hands-on for each section):**
- [ ] KIND cluster setup lab (Section 0) - reuse and enhance existing lab
- [ ] Labs for Sections 1-9 using Example Voting App as continuous use case
- [ ] Each lab verified on actual KIND clusters during development
- [ ] Manual verification checklists for each lab (clear steps, expected outputs)
- [ ] Automated validation scripts for each lab

**Docusaurus Site:**
- [ ] Complete Docusaurus site structure with professional theme
- [ ] Navigation organized by sections with clear progression
- [ ] Search functionality
- [ ] GitHub Pages deployment via GitHub Actions workflow
- [ ] Responsive design for desktop and mobile

**Documentation & Licensing:**
- [ ] Apache 2.0 license file
- [ ] Beautiful README with course overview, index, and navigation
- [ ] Course browsable on both GitHub repo and Docusaurus site

**Reusable Template:**
- [ ] Docusaurus folder structure and configuration documented
- [ ] Consistent lab format template (setup → tasks → verification → outcome)
- [ ] Content structure templates (section layout, callouts, code blocks)
- [ ] Build and deploy workflow (GitHub Actions) ready to clone

### Out of Scope

- Video recording and editing — Author will handle separately using diagrams and content as script
- YouTube upload automation — v2
- TutorLMS integration — v2
- Deep Service Mesh implementation — Section 4 covers decision-making, not full implementation
- Complete Operator SDK bootcamp — Section 8 is lightweight operator design, not comprehensive Go training
- GitOps/ArgoCD — Not part of this intermediate course scope
- Cluster administration — Focus is application deployment, not cluster management

## Context

**Target Audience:**
- Software developers deploying apps on Kubernetes
- DevOps engineers supporting application teams
- Learners who completed Kubernetes Essentials (know Pods, Deployments, Services, ConfigMaps, Secrets)
- Professionals preparing for advanced K8s roles or platform engineering

**Section Structure (from OUTLINE.md):**
- **Section 0**: Essentials Refresh & KIND Setup
- **Section 1**: Advanced Pod Scheduling & Placement
- **Section 2**: Resource Management & Autoscaling
- **Section 3**: Gateway API & Traffic Control
- **Section 4**: Service Mesh Decision Making
- **Section 5**: Security for Application Teams
- **Section 6**: Helm for Real-World Applications
- **Section 7**: Extending Kubernetes with CRDs
- **Section 8**: Writing Kubernetes Operators
- **Section 9**: Intro to Agentic Kubernetes

**Section Dependencies:**
- Sections 0-2: Sequential foundation (cluster setup → scheduling → resources)
- Sections 3-7: More flexible (all use voting app but address independent concerns)
- Sections 8-9: Advanced/preview topics

**Use Case Application:**
- Example Voting App: https://github.com/schoolofdevops/example-voting-app
- Components: voting frontend, result backend, worker service, Redis, PostgreSQL
- Evolves through all sections from basic deployment to advanced patterns

**Existing Resources to Reuse:**
- KIND cluster setup: https://kubernetes-tutorial.schoolofdevops.com/kind_create_cluster/
- Other existing labs in `/Users/gshah/courses/kubernetes/intermediate/kubernetes-labguide` as reference only

**Course Metadata:**
- Author: Gourav J. Shah
- Publisher: School of Devops (www.schoolofdevops.com)
- Course Code: SFD301
- License: Apache 2.0

## Constraints

- **Timeline**: 2-3 weeks to launch — aggressive but achievable with focused execution
- **Tech Stack**: Docusaurus for site, KIND for Kubernetes clusters, Excalidraw for diagrams
- **Hosting**: GitHub Pages with GitHub Actions deployment automation
- **License**: Apache 2.0 (must include license file and attribution)
- **Lab Verification**: Every lab must work on actual KIND clusters before inclusion
- **Diagram Tool**: Excalidraw with MCP integration if available (https://github.com/yctimlin/mcp_excalidraw)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Example Voting App as continuous thread | Teaches systems thinking vs toy examples; realistic multi-service architecture exposes all course concepts naturally | — Pending |
| Hybrid section dependencies | Sections 0-2 sequential for foundation, 3-9 flexible for learning paths while maintaining story coherence | — Pending |
| Keep only KIND setup from existing labs | Ensures consistency; existing labs don't fit voting app story; fresh labs = cleaner narrative | — Pending |
| High-level conceptual diagrams | Simple visuals optimized for video explanation workflow; learners grasp concepts before details | — Pending |
| Both manual + automated lab verification | Manual checklists teach debugging skills; automated scripts enable self-validation; both ensure quality | — Pending |
| Balanced content length (10-20 min) | Core concepts + context + best practices without overwhelming; respects learner time | — Pending |
| Build as reusable template | Accelerates future course development; ensures consistency across School of Devops catalog | — Pending |

---
*Last updated: 2026-02-08 after initialization*
