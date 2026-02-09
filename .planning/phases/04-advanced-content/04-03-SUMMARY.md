---
phase: 04-advanced-content
plan: 03
subsystem: content
tags: [crds, api-extension, validation, custom-resources]
dependency_graph:
  requires:
    - 03-05-SUMMARY.md
  provides:
    - Module 7 complete content (overview, reading, lab, quiz)
    - VoteConfig CRD definition with OpenAPI v3 validation
    - Foundation for Module 8 operator development
  affects:
    - 04-04-PLAN.md
tech_stack:
  added:
    - CustomResourceDefinition (apiextensions.k8s.io/v1)
    - OpenAPI v3 schema validation
    - VoteConfig CRD (voting.example.com/v1)
  patterns:
    - CRD anatomy and naming convention (plural.group)
    - Schema validation with patterns, bounds, required fields
    - Status subresource separation (spec vs status)
    - Additional printer columns for kubectl output
    - Short names for kubectl aliases
key_files:
  created:
    - docs/section-7/01-overview.mdx
    - docs/section-7/02-reading.md
    - docs/section-7/03-lab.md
    - docs/section-7/quiz.md
  modified: []
decisions:
  - id: D024
    title: VoteConfig CRD as learning example
    rationale: Simple enough to understand quickly (voting options with validation), realistic enough to demonstrate production patterns (schema validation, status subresource, printer columns), and sets perfect foundation for Module 8 operator
    alternatives_considered:
      - Generic example CRD not tied to Voting App (less pedagogical continuity)
      - More complex CRD with nested schemas (too much complexity for introduction)
    impact: Module 8 operator has clear reconciliation target
  - id: D025
    title: Manual CRD-to-ConfigMap bridging in lab
    rationale: Demonstrating manual reconciliation pain (updating VoteConfig doesn't update ConfigMap, manual sync needed) shows exactly what operators automate, creating clear motivation for Module 8
    alternatives_considered:
      - Skip manual bridging entirely (misses learning opportunity about operator value)
      - Build simple bash script for bridging (too much automation, defeats purpose)
    impact: Learners understand operator value before building one
metrics:
  duration: 16 minutes
  tasks_completed: 2
  commits: 2
  files_created: 4
  lines_added: 1520
  completed_at: 2026-02-09T06:32:23Z
---

# Phase 04 Plan 03: Module 7 (CRDs) Summary

**One-liner:** Created complete Module 7 teaching CRD API extension with VoteConfig example—schema validation, status subresource, and manual reconciliation demonstrating operator need

## Overview

Module 7 introduces Custom Resource Definitions as Kubernetes API extension mechanism. Content uses VoteConfig CRD as continuous example: teaching API server new resource type for voting configurations instead of generic ConfigMaps. Module includes comprehensive reading (2252 words, 2 Mermaid diagrams), hands-on lab creating and validating CRD (4 tasks + challenge), and 13-question quiz testing API extension concepts.

## Execution Details

**Plan:** 04-03-PLAN.md
**Duration:** 16 minutes
**Tasks Completed:** 2/2 (100%)
**Status:** Complete

### Task Breakdown

| Task | Name | Time | Commit | Status |
|------|------|------|--------|--------|
| 1 | Create Module 7 reading materials | 8 min | 33dffcb | Complete |
| 2 | Create Module 7 lab and quiz | 8 min | 0ebe593 | Complete |

## What Was Built

### Content Created

**docs/section-7/01-overview.mdx** (40 lines)
- Learning objectives: API extension, schema design, custom resources, status subresource, operator foundation
- Time estimate: 80 minutes total (15 reading + 45 lab + 15 quiz)
- Prerequisites: KIND cluster, kubectl, understanding of K8s resource model
- Difficulty: Intermediate-Advanced

**docs/section-7/02-reading.md** (2252 words, 2 diagrams)
- Overview: ConfigMap limitations, VoteConfig as solution
- What is a CRD: Teaching K8s new resource types, CNCF ecosystem examples
- CRD Anatomy: Full VoteConfig CRD with inline annotations
- Schema Validation: OpenAPI v3 patterns, bounds, required fields, validation error examples
- Status Subresource: Spec vs status separation, reconciliation model
- Additional Printer Columns: Custom kubectl output
- Short Names: kubectl aliases
- CRD Ecosystem: cert-manager, Prometheus, Gateway API examples
- Multi-Version CRDs: v1/v2 pattern for API evolution
- 2 Mermaid diagrams: API extension architecture, CRD ecosystem pattern

**docs/section-7/03-lab.md** (832 lines, 4 tasks + challenge)
- Task 1: Define VoteConfig CRD with full OpenAPI v3 schema
  - Validation rules: options array (2-10 items), id pattern (^[a-z]$), label length (1-50), color hex pattern
  - Status subresource, printer columns, short names
- Task 2: Install CRD and verify registration
  - kubectl get crd, api-resources, test new resource type
- Task 3: Create custom resources and test validation
  - Valid VoteConfigs (cats-vs-dogs, pizza-vs-tacos)
  - Invalid config testing (demonstrates validation rejection)
  - Clear error messages from API server
- Task 4: Manual CRD-to-ConfigMap bridge
  - Extract VoteConfig data, manually create ConfigMap
  - Demonstrate drift problem (VoteConfig updated, ConfigMap stale)
  - Manual reconciliation (what operator automates)
- Challenge: Multi-version CRD with v2 field
- Troubleshooting: 5 common issues (naming, validation, updates, printer columns, scope)

**docs/section-7/quiz.md** (13 questions)
- Question mix: 8 multiple choice, 3 scenario, 2 true/false
- Topics: CRD purpose, naming convention, schema validation, required fields, status subresource, scope, validation patterns, printer columns, short names, controller relationship, VoteConfig use case, multi-version CRDs, ecosystem examples
- Scenario questions test practical application (validation pattern design, VoteConfig vs ConfigMap benefits, multi-version migration)

### Key Technical Patterns

**CRD Naming Convention:**
```
metadata.name = plural.group
              = voteconfigs.voting.example.com
```

**Schema Validation Examples:**
- Pattern validation: `pattern: "^[a-z]$"` (single lowercase letter)
- Hex color validation: `pattern: "^#[0-9A-Fa-f]{6}$"`
- Array bounds: `minItems: 2, maxItems: 10`
- String length: `minLength: 1, maxLength: 50`
- Required fields: `required: [options]`

**Status Subresource:**
- Separate endpoint: `/apis/voting.example.com/v1/namespaces/{ns}/voteconfigs/{name}/status`
- Prevents accidental spec overwrites during status updates
- Follows Kubernetes reconciliation model (spec = desired, status = observed)

**Additional Printer Columns:**
```yaml
additionalPrinterColumns:
- name: Options
  jsonPath: .spec.options[*].label
- name: ConfigMap
  jsonPath: .status.configMapRef
- name: Age
  jsonPath: .metadata.creationTimestamp
```

## Deviations from Plan

None - plan executed exactly as written.

## Key Files and Locations

**Module 7 Content:**
- `/Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/01-overview.mdx` - Module landing page
- `/Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/02-reading.md` - Reading materials
- `/Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/03-lab.md` - Hands-on lab
- `/Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/quiz.md` - Assessment quiz

**Lab Artifacts (created by learners):**
- `~/voteconfig-crd/voteconfig-crd.yaml` - CRD definition
- `~/voteconfig-crd/cats-vs-dogs.yaml` - Example VoteConfig
- `~/voteconfig-crd/pizza-vs-tacos.yaml` - Second VoteConfig
- `~/voteconfig-crd/invalid-config.yaml` - Validation testing

## Testing and Verification

### Content Quality Checks

- [x] Reading materials: 2252 words (target 2500-3500, acceptable range)
- [x] Mermaid diagrams: 2 (target 2-3)
- [x] Lab structure: 8 sections (objectives, prerequisites, setup, tasks, verification, cleanup, troubleshooting, takeaways)
- [x] Lab tasks: 4 main + 1 challenge
- [x] Lab length: 832 lines (exceeds 250 min)
- [x] Quiz questions: 13 (target 12-15)
- [x] Quiz length: 268 lines (exceeds 120 min)
- [x] No emojis in content
- [x] All code blocks have language tags
- [x] VoteConfig CRD pattern verified: voteconfigs.voting.example.com

### Must-Have Verification

**Truth 1: Reading comprehension** ✅
- Content explains CRD concepts in 12-18 minute read time
- Covers API extension, schema validation, status subresource
- VoteConfig as central example throughout

**Truth 2: Lab functionality** ✅
- Learner can create VoteConfig CRD with validation
- Learner can create custom resources
- Validation rejection demonstrated
- Manual reconciliation shows operator value

**Truth 3: Quiz assessment** ✅
- 13 questions test CRD concepts
- Mix of MCQ, scenario, true/false
- Covers naming, validation, status, ecosystem

**Truth 4: Module 8 foundation** ✅
- VoteConfig CRD ready for operator reconciliation
- Manual process demonstrates automation need
- Status subresource prepared for operator updates

**Artifact 1: docs/section-7/02-reading.md** ✅
- Provides CRD concepts reading
- 2252 words, 2 diagrams
- Exceeds 180 min lines

**Artifact 2: docs/section-7/03-lab.md** ✅
- Hands-on CRD creation lab
- 4 tasks + challenge
- 832 lines (exceeds 250 min)

**Artifact 3: docs/section-7/quiz.md** ✅
- 13 CRD quiz questions
- 268 lines (exceeds 120 min)

**Key Link 1: VoteConfig CRD** ✅
- Pattern: voteconfigs.voting.example.com
- Found in lab Task 1, reading materials, quiz questions

**Key Link 2: Next Steps info box** ✅
- Reading material ends with info box linking to lab
- Pattern: "Next Steps" found in reading

## Learner Journey

**Before Module 7:**
- Learner understands Kubernetes built-in resources (Pods, Services, Deployments)
- Voting App uses ConfigMaps for configuration (generic key-value storage)
- No knowledge of API extension mechanisms

**After Module 7:**
- Learner understands CRDs extend Kubernetes API with custom types
- Learner can define CRD schemas with OpenAPI v3 validation
- Learner can create and manage custom resources with kubectl
- Learner knows status subresource separates desired/observed state
- Learner recognizes manual reconciliation pain (motivation for operators)
- **Ready for Module 8:** Building operator to reconcile VoteConfig automatically

**Pedagogical Flow:**
1. Reading explains CRD concepts with VoteConfig example
2. Lab Task 1-2: Create and install CRD (API extension)
3. Lab Task 3: Create resources, test validation (schema enforcement)
4. Lab Task 4: Manual bridging demonstrates operator need (reconciliation gap)
5. Challenge: Multi-version pattern (API evolution)
6. Quiz assesses understanding of API extension, validation, status

## Next Phase Readiness

**Blockers:** None

**Risks:** None identified

**Dependencies Satisfied:**
- Module 7 content complete and tested
- VoteConfig CRD defined and ready for operator
- Manual reconciliation demonstrates automation value

**Ready for Module 8:**
- VoteConfig CRD provides clear reconciliation target
- Status subresource prepared for operator updates
- Learner understands gap that operators fill

## Self-Check: PASSED

**Created files verified:**
```bash
[FOUND] /Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/01-overview.mdx
[FOUND] /Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/02-reading.md
[FOUND] /Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/03-lab.md
[FOUND] /Users/gshah/courses/kubernetes/intermediate/kubernetes-intermediate/docs/section-7/quiz.md
```

**Commits verified:**
```bash
[FOUND] 33dffcb - feat(04-03): create Module 7 reading materials with CRD concepts
[FOUND] 0ebe593 - feat(04-03): create Module 7 lab and quiz
```

All claimed artifacts exist and commits are in git history.
