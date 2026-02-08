# Requirements: SFD301 Kubernetes Intermediate Course

**Defined:** 2026-02-08
**Core Value:** Learners master intermediate Kubernetes concepts through a continuous, story-based progression with one realistic application

## v1 Requirements

Requirements for initial course launch. Each maps to roadmap phases.

### Site Foundation (SITE)

- [ ] **SITE-01**: Site displays syntax-highlighted code blocks with copy button on all code examples
- [ ] **SITE-02**: Site is fully responsive across desktop, tablet, and mobile devices
- [ ] **SITE-03**: Site supports dark mode toggle for developer preference
- [ ] **SITE-04**: Content uses readable typography with proper spacing and contrast
- [ ] **SITE-05**: Site is built with Docusaurus 3.9.2 and deployed to GitHub Pages
- [ ] **SITE-06**: GitHub Actions workflow automatically builds and deploys on push to main

### Navigation & Discovery (NAV)

- [ ] **NAV-01**: Left sidebar navigation shows all 10 sections with hierarchical structure
- [ ] **NAV-02**: Right sidebar shows table of contents for current page (H2/H3 headings)
- [ ] **NAV-03**: Search functionality allows users to find content across all sections
- [ ] **NAV-04**: Breadcrumbs show current location in course hierarchy
- [ ] **NAV-05**: Next/Previous buttons enable sequential navigation through content
- [ ] **NAV-06**: Navigation remains accessible and functional on mobile devices

### Course Content (CONTENT)

- [ ] **CONTENT-01**: Section 0 (Essentials Refresh & KIND Setup) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-02**: Section 1 (Advanced Pod Scheduling) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-03**: Section 2 (Resource Management & Autoscaling) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-04**: Section 3 (Gateway API) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-05**: Section 4 (Service Mesh Decision) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-06**: Section 5 (Security) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-07**: Section 6 (Helm) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-08**: Section 7 (CRDs) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-09**: Section 8 (Operators) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-10**: Section 9 (Agentic Kubernetes) has complete reading materials, diagrams, and lab
- [ ] **CONTENT-11**: Each section's reading materials target 10-20 minute read time with balanced depth
- [ ] **CONTENT-12**: Content uses simple language, analogies, and avoids unnecessary complexity
- [ ] **CONTENT-13**: Each section includes difficulty indicator (intermediate/advanced)
- [ ] **CONTENT-14**: Each section shows estimated time to complete (reading + lab)

### Diagrams & Visual Content (DIAGRAM)

- [ ] **DIAGRAM-01**: High-level conceptual diagrams created using Mermaid for workflow/sequence diagrams
- [ ] **DIAGRAM-02**: Architecture diagrams created using Excalidraw for system components
- [ ] **DIAGRAM-03**: All diagrams optimized for video explanation workflow (build-up animation friendly)
- [ ] **DIAGRAM-04**: Diagrams stored as source (`.mmd` or `.excalidraw`) for version control and updates
- [ ] **DIAGRAM-05**: Diagrams render correctly in Docusaurus site on all devices
- [ ] **DIAGRAM-06**: Each section has at least one technical diagram explaining key concepts

### Hands-on Labs (LAB)

- [ ] **LAB-01**: Section 0 lab sets up KIND cluster and deploys Example Voting App baseline
- [ ] **LAB-02**: Section 1 lab implements advanced pod scheduling on Example Voting App
- [ ] **LAB-03**: Section 2 lab configures resource management and autoscaling on Example Voting App
- [ ] **LAB-04**: Section 3 lab migrates Example Voting App from Ingress to Gateway API
- [ ] **LAB-05**: Section 4 lab evaluates service mesh decision for Example Voting App
- [ ] **LAB-06**: Section 5 lab implements security controls on Example Voting App
- [ ] **LAB-07**: Section 6 lab converts Example Voting App to Helm chart
- [ ] **LAB-08**: Section 7 lab creates Custom Resource for Example Voting App
- [ ] **LAB-09**: Section 8 lab designs Operator for Example Voting App
- [ ] **LAB-10**: Section 9 lab implements AI-assisted troubleshooting on Example Voting App
- [ ] **LAB-11**: Each lab includes clear setup instructions and expected outcomes
- [ ] **LAB-12**: Each lab includes manual verification checklist with kubectl commands and expected outputs
- [ ] **LAB-13**: All labs are verified working on KIND clusters before course launch
- [ ] **LAB-14**: Lab instructions are detailed enough for learners to complete independently
- [ ] **LAB-15**: Example Voting App evolves consistently across all labs (story-based progression)

### Quizzes & Assessments (QUIZ)

- [ ] **QUIZ-01**: Section 0 includes quiz with MCQ and concept check questions
- [ ] **QUIZ-02**: Section 1 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-03**: Section 2 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-04**: Section 3 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-05**: Section 4 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-06**: Section 5 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-07**: Section 6 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-08**: Section 7 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-09**: Section 8 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-10**: Section 9 includes quiz with scenario-based and concept check questions
- [ ] **QUIZ-11**: Quizzes implemented as React components in MDX (no production plugin available)
- [ ] **QUIZ-12**: Quiz answers stored in localStorage for learner reference
- [ ] **QUIZ-13**: Each quiz has 5-8 questions mixing formats (MCQ, scenario, concept check)

### Progress & Engagement (PROGRESS)

- [ ] **PROGRESS-01**: Progress indicator shows completion percentage for each section
- [ ] **PROGRESS-02**: Progress indicator shows overall course completion percentage
- [ ] **PROGRESS-03**: Progress state persists across browser sessions via localStorage
- [ ] **PROGRESS-04**: Learning path visualization shows all 10 sections with current position
- [ ] **PROGRESS-05**: Completed sections visually distinguished from incomplete sections
- [ ] **PROGRESS-06**: Progress tracking works without requiring user authentication

### Documentation & Publishing (DOCS)

- [ ] **DOCS-01**: README.md includes course overview, prerequisites, and learning outcomes
- [ ] **DOCS-02**: README.md includes section index with links to each topic
- [ ] **DOCS-03**: README.md includes setup instructions for running labs locally
- [ ] **DOCS-04**: Apache 2.0 LICENSE file included in repository root
- [ ] **DOCS-05**: Course credits School of Devops and author Gourav J. Shah
- [ ] **DOCS-06**: All content is properly licensed for open-source distribution

### Reusable Template (TEMPLATE)

- [ ] **TEMPLATE-01**: Docusaurus folder structure documented for future course replication
- [ ] **TEMPLATE-02**: Lab format template documented (setup → tasks → verification → outcome)
- [ ] **TEMPLATE-03**: Content structure template documented (section layout, callouts, code blocks)
- [ ] **TEMPLATE-04**: Build and deploy workflow documented for GitHub Actions
- [ ] **TEMPLATE-05**: Diagram creation workflow documented (Mermaid + Excalidraw)
- [ ] **TEMPLATE-06**: Quiz component template available for reuse in future courses

## v2 Requirements

Deferred to future release after v1 validation.

### Enhanced Lab Experience
- **LAB-AUTO-01**: Automated lab validation scripts that check lab completion
- **LAB-AUTO-02**: Auto-grading backend API for instant feedback on labs
- **LAB-AUTO-03**: Browser-based lab sandboxes requiring no local setup

### Video Integration
- **VIDEO-01**: Video recordings for all 10 sections with screen capture and voiceover
- **VIDEO-02**: Videos uploaded to YouTube with proper metadata and thumbnails
- **VIDEO-03**: Video timestamps/chapters for quick navigation to concepts
- **VIDEO-04**: TutorLMS integration with video, quizzes, and progress tracking

### Advanced Features
- **FEATURE-01**: Milestone badges awarded for completing sections
- **FEATURE-02**: Interactive code examples with in-browser execution
- **FEATURE-03**: Multi-language code examples (kubectl, Helm, YAML) with tabs
- **FEATURE-04**: AI-powered search for conversational queries
- **FEATURE-05**: Multi-device progress sync (requires backend)

## Out of Scope

Explicitly excluded from this course project.

| Feature | Reason |
|---------|--------|
| Real-time chat/forums | Point to existing Kubernetes community (Slack/Discord); focus on course quality not support infrastructure |
| Live cohort sessions | Pre-recorded content with high production value scales better; avoids timezone issues |
| Custom video player | Use standard embeds (YouTube); avoid reinventing wheel |
| Certificate of completion | Not accredited; focus on skill building; point learners to official CKAD/CKA paths |
| Social login | Email signup sufficient; technical audience prefers email control |
| Excessive gamification | Milestone badges only in v2; avoid leaderboards/points that distract from learning |
| GitOps/ArgoCD content | Out of scope for intermediate course; defer to advanced course |
| Cluster administration | Focus on application deployment not cluster management |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

### Phase 1: Platform Foundation
| Requirement | Status |
|-------------|--------|
| SITE-01 | Pending |
| SITE-02 | Pending |
| SITE-03 | Pending |
| SITE-04 | Pending |
| SITE-05 | Pending |
| SITE-06 | Pending |
| NAV-01 | Pending |
| NAV-02 | Pending |
| NAV-03 | Pending |
| NAV-04 | Pending |
| NAV-05 | Pending |
| NAV-06 | Pending |

### Phase 2: Content Infrastructure
| Requirement | Status |
|-------------|--------|
| TEMPLATE-01 | Pending |
| TEMPLATE-02 | Pending |
| TEMPLATE-03 | Pending |
| TEMPLATE-04 | Pending |
| TEMPLATE-05 | Pending |
| TEMPLATE-06 | Pending |
| DIAGRAM-01 | Pending |
| DIAGRAM-02 | Pending |
| DIAGRAM-03 | Pending |
| DIAGRAM-04 | Pending |
| DIAGRAM-05 | Pending |

### Phase 3: Core Content (Sections 0-4)
| Requirement | Status |
|-------------|--------|
| CONTENT-01 | Pending |
| CONTENT-02 | Pending |
| CONTENT-03 | Pending |
| CONTENT-04 | Pending |
| CONTENT-05 | Pending |
| CONTENT-11 | Pending |
| CONTENT-12 | Pending |
| CONTENT-13 | Pending |
| CONTENT-14 | Pending |
| DIAGRAM-06 | Pending |
| LAB-01 | Pending |
| LAB-02 | Pending |
| LAB-03 | Pending |
| LAB-04 | Pending |
| LAB-05 | Pending |
| LAB-11 | Pending |
| LAB-12 | Pending |
| LAB-13 | Pending |
| LAB-14 | Pending |
| LAB-15 | Pending |
| QUIZ-01 | Pending |
| QUIZ-02 | Pending |
| QUIZ-03 | Pending |
| QUIZ-04 | Pending |
| QUIZ-05 | Pending |
| QUIZ-11 | Pending |
| QUIZ-12 | Pending |
| QUIZ-13 | Pending |

### Phase 4: Advanced Content (Sections 5-9)
| Requirement | Status |
|-------------|--------|
| CONTENT-06 | Pending |
| CONTENT-07 | Pending |
| CONTENT-08 | Pending |
| CONTENT-09 | Pending |
| CONTENT-10 | Pending |
| LAB-06 | Pending |
| LAB-07 | Pending |
| LAB-08 | Pending |
| LAB-09 | Pending |
| LAB-10 | Pending |
| QUIZ-06 | Pending |
| QUIZ-07 | Pending |
| QUIZ-08 | Pending |
| QUIZ-09 | Pending |
| QUIZ-10 | Pending |

### Phase 5: Progress & Documentation
| Requirement | Status |
|-------------|--------|
| PROGRESS-01 | Pending |
| PROGRESS-02 | Pending |
| PROGRESS-03 | Pending |
| PROGRESS-04 | Pending |
| PROGRESS-05 | Pending |
| PROGRESS-06 | Pending |
| DOCS-01 | Pending |
| DOCS-02 | Pending |
| DOCS-03 | Pending |
| DOCS-04 | Pending |
| DOCS-05 | Pending |
| DOCS-06 | Pending |

### Phase 6: Automated Lab Validation (Optional/Future - v2)
| Requirement | Status |
|-------------|--------|
| LAB-AUTO-01 | Deferred (v2) |
| LAB-AUTO-02 | Deferred (v2) |
| LAB-AUTO-03 | Deferred (v2) |

**Coverage:**
- v1 requirements: 82 total
- Mapped to phases 1-5: 82 (100% coverage)
- Phase 6 (v2): 3 requirements (deferred)
- Unmapped: 0

---
*Requirements defined: 2026-02-08*
*Last updated: 2026-02-08 after roadmap creation*
