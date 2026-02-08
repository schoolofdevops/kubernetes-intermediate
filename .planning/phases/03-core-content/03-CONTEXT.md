# Phase 3: Core Content (Sections 0-4) - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Create complete learning modules for the first five course sections (Module 0: Introduction and Getting Started, Module 1: Advanced Pod Scheduling, Module 2: Autoscaling, Module 3: Gateway API, Module 4: Service Mesh). Each module includes reading materials (10-20 minutes), Mermaid diagrams, hands-on labs (30-60 minutes), and quizzes (10-15 questions). Uses templates from Phase 2 to ensure consistency.

</domain>

<decisions>
## Implementation Decisions

### Content Depth and Technical Level
- Baseline assumption: Learners completed K8s Essentials course (familiar with Pods, Deployments, Services, ConfigMaps, basic kubectl)
- 70/30 split: Mostly practical (70% hands-on labs, 30% reading/concepts) - learning by doing approach
- Quick concept introduction in reading materials, then dive into practical application in labs
- Troubleshooting content lives in labs only (using lab template's Troubleshooting section) - reading materials stay focused on concepts
- Target: 10-20 minute read time per module

### Example Voting App Evolution
- Starting state (Module 0): Basic deployment YAMLs (Deployments + Services for vote/result/worker/redis/postgres) - works but not production-ready
- Hybrid evolution approach: Major milestones carry forward (Module 0 → 1 → 2 build up), but some modules start clean for focused examples
- YAML provision: Mix of both - Module 0 provides base YAMLs in course repo (examples/ folder), later modules have learners modify/extend them
- Cleanup strategy: Carry forward when continuous (cleanup only when starting fresh next module, otherwise leave resources for build-up)

### Lab Complexity and Scope
- Duration target: 30-60 minutes per lab (comprehensive labs with 4-6 tasks covering multiple related concepts)
- Include optional failure tasks: Main tasks are success paths, but include "Challenge" sections with debugging scenarios for deeper learning
- Verification approach: Both kubectl checks (resource state) AND functional testing (app responds correctly, curl endpoints work)
- Labs use 8-section template from Phase 2: Objectives, Prerequisites, Setup, Tasks, Verification, Cleanup, Troubleshooting, Key Takeaways

### Diagram Creation Approach
- All diagram types needed: Architecture diagrams, concept visualizations, workflow/sequence diagrams, state/decision diagrams
- Quantity varies by module complexity - use judgment based on visual learning value (some modules need 1-2 diagrams, others need 3-4)
- Mix of Voting App and generic examples: Architecture diagrams use actual Voting App components, concept/workflow diagrams use generic 'app-a', 'app-b' for reusability
- Progressive detail: Start with overview diagram, then detailed diagrams for specific aspects
- All diagrams created with Mermaid (natively rendered in Docusaurus) following Phase 2 naming conventions

### Claude's Discretion
- When to explain internal mechanisms (e.g., scheduler scoring, service mesh proxy injection) vs. just what/why - use judgment per topic based on learning value
- Story arc connecting modules - create natural, motivating narrative (could be startup scaling journey, production readiness path, etc.)
- Specific diagram designs and visual styles within Mermaid constraints
- Exact number of diagrams per module based on complexity
- Which modules carry forward resources vs. start fresh

</decisions>

<specifics>
## Specific Ideas

- Reference existing lab: https://kubernetes-tutorial.schoolofdevops.com/advanced_pod_scheduling/#lab-k203-advanced-pod-scheduling can be used as-is or enhanced for Module 1
- Example Voting App components: vote service, result service, worker, redis, postgres
- Use conversational, friendly tone (per Phase 2 authoring guide)
- No emojis in content (per project memory)
- 10-20 minute reading time target aligns with "simple language, analogies welcome" from Phase 2

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 03-core-content*
*Context gathered: 2026-02-08*
