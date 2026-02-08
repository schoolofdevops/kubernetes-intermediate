# Phase 2: Content Infrastructure - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Build reusable templates and tooling that course authors need to efficiently create consistent, high-quality content across all 10 modules. This includes lab templates, diagram workflow, quiz preparation format, and content authoring guidelines. Does not include writing the actual course content (that's Phases 3-4).

</domain>

<decisions>
## Implementation Decisions

### Lab Template Structure
- Single file per module: one `lab.md` file containing all lab content
- Template sections (in order):
  - Objectives - clear learning outcomes
  - Prerequisites - what must be completed first
  - Setup - environment preparation steps
  - Tasks - step-by-step instructions
  - Verification - how to confirm successful completion
  - Cleanup - resource teardown steps
  - Troubleshooting - common issues and solutions
  - Key Takeaways - learning summary
- Task instructions: step-by-step with full commands (copy-pasteable)
- Format: Plain Markdown (.md) files, not MDX components

### Diagram Workflow
- Storage: Centralized `diagrams/` folder at project root with organized subfolders
- Embedding: Export diagrams to images (PNG/SVG), reference in docs with `![](path)`
- Export management: Manual export by author (commits both source and images)
- Naming convention: Module-prefixed (e.g., `01-pod-scheduling.mmd`, `03-gateway-routing.excalidraw`)
- Source files are version-controlled alongside exported images

### Quiz Preparation
- Purpose: Create quizzes for TutorLMS import (not embedded in Docusaurus)
- Question types: Multiple choice (single answer), True/False, Scenario-based
- Volume: 10-15 questions per module
- Format: Markdown files that can be converted to TutorLMS format later
- Organization: Single `quiz.md` file per module containing all questions
- Storage location: Module-specific (e.g., `docs/section-N/quiz.md` or centralized `quizzes/` folder)

### Content Authoring Guidelines
- Template approach: Flexible framework - suggested sections, authors adapt to module needs
- Code block conventions:
  - Language tags always specified (```yaml, ```bash, never plain ```)
  - Consistent formatting with standard indentation
  - Copy-friendly commands (single lines when possible, avoid line wraps)
- Voice and tone: Conversational and friendly (direct address with you/we, approachable teaching style)

### Claude's Discretion
- Callout/admonition usage patterns
- Exact quiz storage location (docs/section-N/ vs centralized quizzes/)
- Diagram subfolder organization within diagrams/
- Content template specifics (suggested H2/H3 patterns)
- Code comment density in examples
- Line length limits for code blocks

</decisions>

<specifics>
## Specific Ideas

- User will provide TutorLMS format for quiz conversion later (manual process, not automated)
- Labs should be practical and hands-on, verifiable on KIND clusters
- Example Voting App threads through all modules as continuous use case
- Course targets intermediate learners (completed Kubernetes Essentials)
- Reading time target: 10-20 minutes per module

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 02-content-infrastructure*
*Context gathered: 2026-02-08*
