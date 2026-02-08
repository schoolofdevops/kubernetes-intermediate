# Project Research Summary

**Project:** Kubernetes Intermediate Course (SFD301)
**Domain:** Technical Education Platform - Hands-On Kubernetes Training
**Researched:** 2026-02-08
**Confidence:** HIGH

## Executive Summary

This is an intermediate-level Kubernetes training course built on Docusaurus 3.9.2, following the proven educational model of platforms like KodeKloud and Pluralsight. The recommended approach combines static site generation for course materials with hands-on browser-based labs, centered around a story-based learning progression using a realistic application (Example Voting App). The course covers 10 sections spanning intermediate to advanced Kubernetes concepts, emphasizing practical application over theory with a 70% hands-on learning ratio.

The technical foundation is solid: Docusaurus 3.9.2 provides production-ready documentation infrastructure with React 19 support, MDX for interactive components, and seamless GitHub Pages deployment. The platform's plugin architecture enables custom quiz components, lab verification integration, and diagram-as-code workflows. This approach offers the best balance of development velocity (leverage Docusaurus's built-in features), maintainability (docs-as-code with version control), and learner experience (responsive, searchable, interactive content).

Key risks center on version skew (Kubernetes' fast release cycle makes labs brittle within months) and maintenance burden underestimation (courses require continuous updates, not "set and forget"). Mitigation strategies include version pinning with automated testing across multiple Kubernetes releases, modular architecture that limits change cascades, and establishing maintenance schedules before launch. The story-based approach using Example Voting App creates engagement but requires careful execution to avoid overwhelming learners with application complexity when the focus should be Kubernetes concepts.

## Key Findings

### Recommended Stack

Docusaurus 3.9.2 emerges as the clear choice for a developer-focused Kubernetes training platform. It's specifically designed for technical documentation with excellent MDX support for embedding interactive components (quizzes, labs, diagrams), built-in versioning for maintaining multiple course versions, and a plugin ecosystem that enables extending core functionality. The Meta-maintained project has strong momentum with React 19 support added in v3.7 and is proven at scale by major tech companies.

**Core technologies:**
- **Docusaurus 3.9.2:** Static site generator with MDX support - Meta-maintained, built specifically for documentation and educational content with excellent developer experience
- **React 19.x:** UI framework for interactive components - Required by Docusaurus 3.7+, enables quizzes, labs, and custom learning widgets via MDX embedding
- **Node.js 20.x LTS:** Runtime and build environment - Compatible with GitHub Actions (actions/setup-node@v4) and provides stable foundation for builds
- **Mermaid + Excalidraw:** Diagram solutions - Diagram-as-code approach keeps visualizations version-controlled; Mermaid for workflows/sequences, Excalidraw for architecture diagrams
- **KIND (Kubernetes in Docker):** Lab environment - Industry standard for local Kubernetes clusters; quick setup, multi-node support, ideal for hands-on verification
- **GitHub Actions + Pages:** CI/CD and hosting - Native integration, free for public repos, provides reliable CDN with zero infrastructure management

**Critical version requirements:**
- All @docusaurus/* packages must match exactly (3.9.2)
- React 19 requires Docusaurus 3.7+
- Node.js 20.x LTS (minimum 18+)
- Pin Kubernetes versions explicitly in lab instructions (K8s follows N-2 support with 14-month lifecycle)

### Expected Features

Research reveals a clear hierarchy between table stakes (features users assume exist) and competitive differentiators (features that set courses apart). The platform must nail basics before adding sophistication.

**Must have (table stakes):**
- Syntax-highlighted code blocks with copy button - Industry standard in 2026; missing this causes immediate negative impression
- Responsive mobile design - 45% of learners complete courses faster on mobile; accessibility requirement
- Search functionality - Expected by learners; Algolia integration is standard for Docusaurus
- Progress indicators - Shows completion percentage; proven engagement boost across course platforms
- Video support with diagrams - 60% higher engagement than text-only; technical Kubernetes concepts require visual + verbal explanation
- Section/page navigation - Left sidebar (course structure) + right sidebar (page structure) standard across all modern documentation platforms
- Downloadable resources - YAML files, scripts, cheat sheets provide practical reference value beyond course completion

**Should have (competitive differentiators):**
- Hands-on labs per section - 70% of learning happens through practice; 75% better retention than passive reading (KodeKloud's core model)
- Story-based progression via Example Voting App - Narrative structure increases completion by making abstract Kubernetes concepts concrete and relatable
- Real-world scenarios - Practical application over theory builds job-ready skills; context from consistent application use case
- Lab validation/auto-grading - Instant feedback on exercises builds confidence and validates understanding before progression
- Technical diagrams optimized for video - Complex Kubernetes architecture requires synchronized visual and verbal explanation
- Contextual quiz integration - 30-45 minute assessments after sections (not just end-of-course) reinforce learning
- Dark mode - Developer audience expectation; reduces eye strain during extended learning sessions
- Difficulty indicators - Setting expectations per section (intermediate to advanced) prevents frustration or boredom

**Defer (v2+):**
- Interactive code environments beyond labs - Full IDE integration is very high complexity
- Real-time community features - Forums/chat create moderation burden without strong completion correlation; link to existing Kubernetes communities instead
- Gamification beyond simple milestones - Feature bloat risk; use sparingly (milestone badges only)
- Advanced analytics - Track rewatch patterns and time per section for optimization; needs learner data at scale
- Video transcripts/translations - Accessibility and global reach; significant localization effort

### Architecture Approach

Docusaurus follows a clean separation between content (MDX files, quiz JSON, lab definitions), build process (Node.js plugins transforming content into data layer), and presentation (React components rendering from data). This architecture enables content authors to work independently from developers while maintaining flexibility for custom interactive elements.

**Major components:**
1. **Content Layer (Git Repository)** - MDX documentation, lab directories with verification scripts, quiz JSON definitions, diagram source files (Mermaid/PlantUML). Structured as courses/[course-id]/ for multi-course scaling, shared/ for reusable components.
2. **Build Layer (Docusaurus Plugins)** - Custom plugins load specialized content (quizzes, labs) and make data available to React components via temp JSON files. Auto-generates sidebars from filesystem structure using _category_.json for customization.
3. **Presentation Layer (React Theme Components)** - Custom components for Quiz, LabEnvironment, DiagramViewer, ProgressTracker imported into MDX content. Swizzle from @docusaurus/theme-classic for layout customization.
4. **Deployment Layer (GitHub Actions → GitHub Pages)** - Git-based workflow with branch/PR review, automated builds on merge to main, static HTML/JS/CSS deployed to GitHub Pages CDN. Free hosting for public repositories.

**Key architectural patterns:**
- **Separation of Content and Presentation:** MDX content completely separate from React components; build process mediates via data layer
- **Plugin-Based Content Loading:** Custom plugins for quizzes/labs run in Node.js, emit serializable JSON to React components
- **Auto-Generated Sidebars:** Filesystem structure drives navigation; eliminates manual sidebar.js maintenance
- **Diagram-as-Code:** Mermaid/PlantUML source in Git, rendered during build or at runtime; version-controllable with diff support
- **Monorepo Pattern:** courses/[course-id]/ for isolation, shared/ for reusable components across multiple courses

### Critical Pitfalls

Research identified eight critical pitfalls with clear prevention strategies. Top three require immediate attention in roadmap planning:

1. **Version Skew and Breaking Changes** - Labs work during development but break within 3-6 months due to Kubernetes API deprecations (N-2 support policy, 14-month lifecycle). Prevention: Pin exact versions in all scripts, create version compatibility matrix, set up automated monthly testing against new K8s releases, use semantic versioning for course materials tied to K8s versions. Address in Phase 0 (establish version pinning strategy) and ongoing (monthly compatibility checks).

2. **Lab Instructions Too Prescriptive or Too Vague** - Either creates click-monkeys with zero retention (step-by-step where to click) or causes frustration and abandonment (vague goals without guidance). Prevention: Challenge-centric design with Objective → Context → Requirements → Hints (not steps); include "check your understanding" points rather than copy-paste commands; provide multiple solution paths with trade-offs explained. Address in Phase 0 (establish lab design principles) and each phase (review against criteria).

3. **Untested Lab Instructions in Fresh Environments** - Labs work on instructor's machine (with accumulated dependencies/configs) but fail on student's clean KIND cluster. Prevention: Automated CI pipeline running EVERY lab from scratch on clean KIND cluster, Docker-based validation in fresh containers, multiple test environments (macOS, Linux, Windows if supported), "zero-state testing" that rebuilds cluster between tests. Address in Phase 0 (establish CI/CD testing infrastructure) and each phase (add automated tests before completion).

**Additional pitfalls to monitor:**
4. **Content-Diagram Desynchronization** - Diagrams drift from lab code over time; use diagram-as-code (Mermaid/PlantUML) versioned with content, update checklist requiring diagram updates before merge
5. **Prerequisites and Skill Level Mismatch** - Course assumes Docker/Linux knowledge students lack; create explicit prerequisites checklist with validation, "test your readiness" diagnostic
6. **Story-Based Learning Execution Failures** - Example Voting App either too simple (toy app) or too complex (obscures K8s concepts); introduce incrementally, keep narrative consistent, limit failures to one major scenario per module
7. **Poor Navigation and Content Discoverability** - Students can't find prerequisite material or know what order to complete labs; explicit learning path with numbered modules showing dependencies, visual progress tracking
8. **Maintenance Burden Underestimation** - Course launches successfully but becomes unmaintainable; set maintenance schedule (monthly tests, quarterly reviews, semi-annual updates), modular architecture, automation for testing/version checking

## Implications for Roadmap

Based on research, the roadmap should follow a foundation-first approach with 6-7 phases. The first phase establishes infrastructure and processes that prevent pitfalls, subsequent phases build content incrementally with story progression, and final phases add polish and optimization features.

### Phase 0: Foundation & Infrastructure
**Rationale:** All critical pitfalls require infrastructure and processes established before content creation. Attempting to add version pinning, automated testing, or diagram tooling after writing 10 sections of content creates massive rework. This phase delivers zero student-facing value but prevents technical debt that kills maintenance.

**Delivers:**
- Docusaurus 3.9.2 site scaffolding with TypeScript
- GitHub Actions CI/CD pipeline for automated testing and deployment
- Version pinning strategy with compatibility matrix
- Lab design principles and template structure
- Diagram-as-code tooling (Mermaid + Excalidraw integration)
- Custom plugin architecture for quizzes and labs
- Maintenance schedule and automation scripts

**Addresses pitfalls:**
- Version skew (automated testing, pinning strategy)
- Untested environments (CI/CD infrastructure)
- Maintenance burden (automation, modular architecture)
- Content-diagram desync (diagram-as-code tooling)

**Research flags:** Standard Docusaurus patterns (skip research-phase)

### Phase 1: Core Content Structure & First Section
**Rationale:** Validates the foundation by building one complete section (Section 0: Introduction). Proves the entire workflow (content authoring → diagram creation → lab development → automated testing → deployment) works before scaling to remaining sections. Establishes Example Voting App baseline.

**Delivers:**
- Course structure with 10 section placeholders
- Section 0 complete: Introduction, objectives, prerequisites diagnostic
- Example Voting App architecture and narrative arc defined
- First hands-on lab with verification script
- Quiz component integrated and working
- Navigation system (sidebar auto-generation, breadcrumbs, progress tracking)

**Features from FEATURES.md:**
- Section/page navigation (table stakes)
- Syntax-highlighted code blocks with copy button
- Responsive design
- Progress indicators
- Story-based progression baseline (Example Voting App intro)

**Avoids pitfalls:**
- Prerequisites mismatch (diagnostic lab validates skill level)
- Lab instructions quality (establish challenge-centric pattern)

**Research flags:** Standard content creation patterns (skip research-phase)

### Phase 2: Content Sprint - Sections 1-5 (Intermediate Concepts)
**Rationale:** Build core intermediate Kubernetes content in batch while patterns are fresh. These sections cover table-stakes topics (Pods, Services, Deployments, ConfigMaps, Secrets) using Example Voting App as the consistent narrative thread. Grouping ensures story consistency and allows reusing lab environment setup.

**Delivers:**
- Sections 1-5 complete with reading materials, diagrams, labs, quizzes
- Example Voting App deployment incrementally built across sections
- All labs with automated verification scripts passing in CI

**Uses stack elements:**
- Mermaid diagrams for workflow/sequence (lab steps)
- Excalidraw for Kubernetes architecture diagrams
- KIND for lab environment
- Custom Quiz plugin for contextual assessments

**Implements architecture:**
- Content layer structure (docs/section-N/, labs/lab-N/)
- Plugin-based quiz loading
- Auto-generated sidebars from filesystem

**Research flags:** Likely skip research-phase (intermediate K8s concepts well-documented)

### Phase 3: Content Sprint - Sections 6-9 (Advanced Concepts)
**Rationale:** Complete remaining advanced sections (StatefulSets, DaemonSets, Jobs, Network Policies, RBAC, etc.). These build on intermediate foundation and complete the Example Voting App narrative with production-readiness concerns (security, scheduling, state management).

**Delivers:**
- Sections 6-9 complete with full lab suite
- Example Voting App production-ready deployment (with security, monitoring, state management)
- Advanced troubleshooting scenarios and debugging workflows

**Addresses pitfalls:**
- Story execution (complete narrative arc, ensure complexity aligns with learning objectives)
- Navigation (students can discover advanced topics after mastering intermediate)

**Research flags:** May need targeted research-phase for niche topics (e.g., custom schedulers, advanced RBAC patterns)

### Phase 4: Search, Video, & Enhanced Features
**Rationale:** With content complete, add features that improve discoverability and engagement. Search enables quick reference during labs. Video support adds synchronized visual explanations for complex concepts. This phase transforms course from functional to polished.

**Delivers:**
- Algolia DocSearch integration (free for open-source)
- Video embedding with chapter support
- Technical diagrams optimized for video walkthroughs
- Dark mode theme implementation
- Downloadable resources (YAML files, scripts, cheat sheets)
- Difficulty indicators and time estimates per section

**Features from FEATURES.md:**
- Search functionality (table stakes)
- Video support (table stakes)
- Technical diagrams optimized for video (differentiator)
- Dark mode (differentiator)
- Downloadable resources (differentiator)
- Difficulty indicators (differentiator)

**Research flags:** Algolia DocSearch approval timeline uncertain (apply early); video embedding is standard pattern (skip research-phase)

### Phase 5: Lab Validation & Auto-Grading
**Rationale:** Most complex feature requiring backend integration. Delayed until content is stable to avoid rework. This differentiator provides instant feedback that builds learner confidence and validates understanding.

**Delivers:**
- LabEnvironment component with "Verify Lab" UI
- Verification API service (Node.js + Docker)
- Integration with existing verify.sh scripts
- Progress tracking with completion state

**Features from FEATURES.md:**
- Lab validation/auto-grading (differentiator - v1.x)
- Enhanced progress tracking tied to verified completion

**Avoids pitfalls:**
- Untested environments (verification runs in standardized sandbox)

**Research flags:** Needs research-phase for lab platform integration patterns (KodeKloud-style browser-based sandboxes, API design for secure verification)

### Phase 6: Beta Testing & Polish
**Rationale:** User testing reveals issues invisible to course creators. Beta testers validate skill level appropriateness, lab difficulty curve, navigation effectiveness, and story coherence. Feedback loop before public launch prevents costly post-launch fixes.

**Delivers:**
- Beta testing program with recruited learners
- Feedback collection and analysis
- Content revisions based on user testing
- Link validation and accessibility audit
- Performance optimization (image compression, lazy loading)
- Final documentation and troubleshooting guides

**Addresses pitfalls:**
- Prerequisites mismatch (beta testers validate skill level)
- Lab instructions quality (user testing shows retention, not just completion)
- Navigation effectiveness (users can find content in <30 seconds)
- Story execution (student feedback confirms narrative value)

**Research flags:** Standard beta testing patterns (skip research-phase)

### Phase 7: Launch & Post-Launch Maintenance
**Rationale:** Deployment to production with monitoring and support infrastructure. Establishes ongoing maintenance cadence to prevent degradation over time.

**Delivers:**
- Production deployment to GitHub Pages
- Analytics integration (course completion, quiz scores, lab attempts)
- Support channels (GitHub Discussions, link to Kubernetes community)
- Maintenance schedule execution (monthly automated tests, quarterly content reviews)
- Version update process for new Kubernetes releases

**Addresses pitfalls:**
- Maintenance burden (scheduled updates, technical debt tracking)
- Version skew (ongoing compatibility testing)

**Research flags:** Analytics platform selection may need brief research (Google Analytics vs Plausible vs PostHog)

### Phase Ordering Rationale

- **Foundation-first prevents rework:** Version pinning, automated testing, and diagram tooling are exponentially harder to retrofit after creating 10 sections of content. Phase 0 front-loads infrastructure investment.

- **Single section validation before scaling:** Phase 1 proves the entire workflow works end-to-end with Section 0 before committing to 9 more sections. Catches process issues early.

- **Content batching for narrative consistency:** Phases 2-3 group content sprints to maintain story coherence (Example Voting App progression) and reuse lab environment patterns. Breaking into two phases prevents fatigue and allows mid-point review.

- **Polish after content stabilization:** Search, video, and validation features (Phases 4-5) come after core content is complete to avoid rework when content changes. These features enhance but don't fundamentally alter course structure.

- **Beta testing validates before launch:** Phase 6 catches issues invisible to creators through user testing. Cheaper to fix before public launch than post-release.

- **Maintenance as explicit phase:** Phase 7 treats ongoing updates as first-class work, not afterthought. Prevents the "launch and abandon" pattern that leads to outdated courses.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 5 (Lab Validation):** Complex integration with browser-based lab environments; needs API design research for secure verification, KodeKloud-style sandbox patterns
- **Phase 3 (Advanced Content):** May need targeted research for niche topics like custom schedulers, advanced RBAC policies, or operator patterns if source quality is insufficient
- **Phase 7 (Analytics):** Brief research to compare analytics platforms (Google Analytics, Plausible, PostHog) for educational tracking

**Phases with standard patterns (skip research-phase):**
- **Phase 0 (Foundation):** Well-documented Docusaurus setup, GitHub Actions deployment, standard CI/CD patterns
- **Phase 1 (Core Structure):** Standard content creation and navigation patterns
- **Phase 2 (Intermediate Content):** Intermediate Kubernetes concepts have excellent documentation (official K8s docs, KodeKloud, Pluralsight)
- **Phase 4 (Search & Video):** Algolia integration and video embedding are standard Docusaurus patterns
- **Phase 6 (Beta Testing):** Standard user testing methodologies

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Docusaurus 3.9.2 proven at scale with official documentation; React 19 compatibility verified; GitHub Actions deployment pattern standard; KIND industry-standard for K8s learning |
| Features | HIGH | Feature expectations validated across multiple leading platforms (KodeKloud, Pluralsight, Coursera); table stakes vs differentiators clear from 2026 research; prioritization matrix based on user value and implementation cost |
| Architecture | HIGH | Standard Docusaurus architecture patterns well-documented; plugin system proven; content-as-code workflow battle-tested; scaling considerations address 1-course to 10+ courses |
| Pitfalls | HIGH | Pitfalls derived from multiple authoritative sources (Kubernetes official docs, educational research, platform-specific gotchas); prevention strategies actionable and specific |

**Overall confidence:** HIGH

The research is based on official documentation (Docusaurus, Kubernetes), leading platform analysis (KodeKloud, Pluralsight), and current 2026 educational research. All four research dimensions (stack, features, architecture, pitfalls) cross-validate and point to consistent recommendations. The recommended stack (Docusaurus + Mermaid + KIND + GitHub Pages) is production-proven with minimal technical risk.

### Gaps to Address

While overall confidence is high, several areas need attention during planning and implementation:

- **Algolia DocSearch approval timeline:** Applying for free tier requires approval; timeline uncertain (varies by application). Mitigation: Start with @cmfcmf/docusaurus-search-local for development, apply for Algolia early, switch when approved.

- **Quiz component implementation details:** No production-ready Docusaurus quiz plugin exists (verified via GitHub discussions). Custom development required using React + MDX. Gap: Exact schema for quiz JSON and scoring logic. Mitigation: Design quiz schema in Phase 0, reference existing educational platforms' quiz UX patterns.

- **Lab verification API architecture:** Multiple implementation options (manual local execution, web-based API, GitHub Actions verification). Gap: Need to evaluate security model for handling student cluster credentials, sandbox environment design. Mitigation: Research-phase in Phase 5 targeting lab platform integration patterns.

- **Example Voting App complexity calibration:** Balance between too simple (toy app that doesn't reflect real-world complexity) and too complex (obscures Kubernetes learning objectives). Gap: Need to validate incremental complexity progression with beta testers. Mitigation: User testing in Phase 6 specifically focused on story effectiveness.

- **Multi-OS lab testing:** Labs should work on macOS, Linux, and ideally Windows (WSL2). Research identified OS-specific issues (KIND networking conflicts with VPNs, different Docker setups). Gap: Windows support validation. Mitigation: Explicitly test Windows/WSL2 in Phase 1 or document as limitation if unsupported.

- **Kubernetes version support matrix:** With 15-week release cycle and N-2 support policy, need clear policy on which K8s versions to support. Gap: Decision on whether to support only current stable, or current + previous two minors. Mitigation: Define in Phase 0 based on target audience Kubernetes versions in production.

## Sources

### Primary (HIGH confidence)

**Docusaurus:**
- [Docusaurus Official Docs](https://docusaurus.io/docs) - Architecture, features, configuration (v3.9.2)
- [Docusaurus GitHub Releases](https://github.com/facebook/docusaurus/releases) - v3.7 React 19 support, v3.9.2 latest stable
- [Docusaurus Architecture Guide](https://docusaurus.io/docs/advanced/architecture) - Plugin system, build process, theming

**Kubernetes:**
- [Kubernetes Official Docs](https://kubernetes.io/docs/) - API reference, concepts, best practices
- [Kubernetes Releases](https://kubernetes.io/releases/) - Version support policy, deprecation timelines
- [KIND Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/) - Local cluster setup, configuration

**GitHub Actions:**
- [GitHub Pages Deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) - Custom workflows, deployment actions

### Secondary (MEDIUM confidence)

**Course Platform Analysis:**
- [KodeKloud Kubernetes Learning Path](https://kodekloud.com/learning-path/kubernetes) - Hands-on lab approach, browser-based environments
- [Pluralsight 2026 Features](https://www.pluralsight.com/resources/blog/software-development/tech-documentation-best-practices) - Skill assessments, learning paths
- [Docusaurus Review 2026](https://ferndesk.com/blog/docusaurus-review) - Platform strengths/limitations
- [Meta Releases Docusaurus 3.9](https://www.infoq.com/news/2025/10/docusaurus-3-9-ai-search/) - AI search feature

**Educational Research:**
- [13 Proven Ways To Increase Online Course Completion Rates](https://www.learningrevolution.net/online-course-completion-rates/) - Engagement strategies, completion factors
- [Hands-On Virtual Labs in Tech Training](https://trainingindustry.com/articles/learning-technologies/hands-on-virtual-labs-in-tech-training-preparing-learners-for-real-world-challenges/) - Lab effectiveness research
- [Story-Based Learning](https://bcltraining.com/learning-library/story-based-learning/) - Narrative pedagogy effectiveness
- [Using MDX for Educational Content](https://www.mdxblog.io/blog/using-mdx-for-e-learning-content-and-tutorials) - Interactive component patterns

**Version Compatibility:**
- [Kubernetes endoflife.date](https://endoflife.date/kubernetes) - Support lifecycle tracking
- [Kubernetes 1.35 Upgrade Guide](https://scaleops.com/blog/kubernetes-1-35-release-overview/) - Breaking changes, deprecations

**Technical Writing:**
- [10 Essential Technical Documentation Best Practices](https://www.documind.chat/blog/technical-documentation-best-practices) - 2026 documentation standards
- [Tech Documentation Trends 2025](https://www.fluidtopics.com/blog/industry-insights/technical-documentation-trends-2025/) - Emerging patterns

### Tertiary (LOW confidence - needs validation)

- Specific Algolia DocSearch approval timeline (varies by application - cannot predict)
- Excalidraw updates beyond 0.18.0 (package maintained but infrequent releases)
- Performance limits for @cmfcmf/docusaurus-search-local with 10+ courses (tested typically up to ~100 pages)
- Windows/WSL2 KIND support quality (documented as working but limited testing data)

---

*Research completed: 2026-02-08*
*Ready for roadmap creation: YES*

**Next step:** Roadmapper agent can use this synthesis to structure detailed phase plans, leveraging:
- Suggested 7-phase structure with clear rationale
- Feature prioritization (table stakes vs differentiators vs v2+)
- Pitfall prevention strategies mapped to phases
- Research flags identifying which phases need deeper research
- Confidence assessment highlighting areas needing validation
