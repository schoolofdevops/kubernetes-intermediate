# Architecture Research

**Domain:** Technical Course Platform (Docusaurus-based)
**Researched:** 2026-02-08
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT LAYER (GitHub Pages)                      │
│                        Static HTML/JS/CSS + Assets                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ (GitHub Actions Deploy)
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BUILD LAYER (Node.js)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Plugins    │→ │ Data Layer   │→ │    Theme     │→ │   Webpack    │    │
│  │ (Content     │  │ (JSON temp   │  │ (React       │  │  (Bundle)    │    │
│  │  Loaders)    │  │  files)      │  │  Components) │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                               │
│  Key Plugins:                                                                │
│  - @docusaurus/plugin-content-docs (reading materials, labs)                 │
│  - @docusaurus/plugin-content-blog (announcements)                           │
│  - Custom plugins (quizzes, lab verification, diagrams)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ (Reads content files)
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONTENT LAYER (Git Repository)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  courses/                          # Multi-course support                    │
│  ├── sfd301/                       # Course-specific content                 │
│  │   ├── docs/                     # Reading materials (MDX)                 │
│  │   │   ├── section-0/            # Auto-generates sidebar sections         │
│  │   │   │   ├── _category_.json   # Section metadata                        │
│  │   │   │   ├── 01-intro.mdx      # sidebar_position: 1                     │
│  │   │   │   └── 02-concepts.mdx   # sidebar_position: 2                     │
│  │   │   ├── section-1/                                                      │
│  │   │   └── ...section-9/                                                   │
│  │   ├── labs/                     # Hands-on exercises                      │
│  │   │   ├── lab-01/                                                         │
│  │   │   │   ├── instructions.mdx  # Lab setup and steps                     │
│  │   │   │   ├── verify.sh         # Verification script                     │
│  │   │   │   └── solution/         # Reference implementation                │
│  │   │   └── lab-02/                                                         │
│  │   ├── quizzes/                  # Quiz definitions (JSON/YAML)            │
│  │   │   ├── section-0-quiz.json                                             │
│  │   │   └── section-1-quiz.json                                             │
│  │   └── course.config.js          # Course-specific configuration           │
│  │                                                                            │
│  └── [future-course]/              # Template for scaling                    │
│                                                                               │
│  shared/                           # Reusable components (monorepo pattern)  │
│  ├── components/                   # React components                        │
│  │   ├── Quiz/                     # Interactive quiz component              │
│  │   ├── LabEnvironment/           # Lab environment wrapper                 │
│  │   ├── DiagramViewer/            # Mermaid/PlantUML renderer               │
│  │   └── ProgressTracker/          # Course progress visualization           │
│  ├── utils/                        # Shared utilities                        │
│  │   ├── labVerification.js        # Lab verification helpers                │
│  │   └── quizScoring.js            # Quiz scoring logic                      │
│  └── styles/                       # Global styling                          │
│                                                                               │
│  static/                           # Static assets                           │
│  ├── img/                          # Images                                  │
│  ├── diagrams/                     # Architecture diagrams                   │
│  │   ├── source/                   # .mmd, .puml source files                │
│  │   └── rendered/                 # Pre-rendered .svg, .png                 │
│  └── downloads/                    # Lab files, samples                      │
│                                                                               │
│  docusaurus.config.js              # Site-wide configuration                 │
│  sidebars.js                       # Sidebar configuration (auto-generated)  │
│  package.json                      # Dependencies and scripts                │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Content Docs Plugin** | Discovers and processes MDX files in docs/, generates routes | Built-in `@docusaurus/plugin-content-docs` with auto-sidebar generation |
| **Custom Quiz Plugin** | Loads quiz definitions, provides quiz data to components | Custom plugin reading JSON/YAML, emitting data via `addRoute()` |
| **Custom Lab Plugin** | Manages lab instructions, verification scripts, progress tracking | Custom plugin with REST API integration for verification |
| **Diagram Plugin** | Processes Mermaid/PlantUML source into rendered diagrams | `docusaurus-plugin-diagrams` or custom plugin using remark transformers |
| **Theme Components** | React components for layout, navigation, interactive elements | Custom theme swizzling from `@docusaurus/theme-classic` |
| **Static Asset Handler** | Serves images, diagrams, downloadable files | Built-in static file serving from `static/` directory |
| **GitHub Actions Workflow** | Builds site, runs tests, deploys to GitHub Pages | `.github/workflows/deploy.yml` using `actions/deploy-pages` |

## Recommended Project Structure

```
kubernetes-intermediate/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # GitHub Pages deployment
│       ├── test-labs.yml           # Lab verification testing
│       └── render-diagrams.yml     # Pre-render diagrams on commit
│
├── .planning/                      # Project management (not deployed)
│   ├── research/
│   └── roadmap/
│
├── courses/
│   └── sfd301/
│       ├── docs/                   # Reading materials
│       │   ├── section-0/
│       │   │   ├── _category_.json # {label: "Section 0", position: 1}
│       │   │   ├── 00-overview.mdx
│       │   │   └── 01-objectives.mdx
│       │   ├── section-1/
│       │   └── ...section-9/
│       │
│       ├── labs/                   # Hands-on exercises
│       │   ├── lab-01-first-pod/
│       │   │   ├── README.mdx      # Instructions (embedded in docs)
│       │   │   ├── verify.sh       # Verification script
│       │   │   ├── setup.yaml      # K8s manifests for lab
│       │   │   └── solution/
│       │   │       └── answer.yaml
│       │   └── lab-02-services/
│       │
│       ├── quizzes/                # Quiz definitions
│       │   ├── section-0.json
│       │   └── section-1.json
│       │
│       └── course.config.js        # Course metadata
│
├── shared/                         # Reusable across courses
│   ├── components/
│   │   ├── Quiz/
│   │   │   ├── QuizQuestion.tsx
│   │   │   ├── QuizResults.tsx
│   │   │   └── index.tsx
│   │   ├── LabEnvironment/
│   │   │   ├── LabInstructions.tsx
│   │   │   ├── VerificationStatus.tsx
│   │   │   └── index.tsx
│   │   ├── DiagramViewer/
│   │   │   └── MermaidDiagram.tsx
│   │   └── ProgressTracker/
│   │       └── CourseProgress.tsx
│   │
│   ├── plugins/
│   │   ├── docusaurus-plugin-quiz/
│   │   │   ├── index.js            # Plugin loader
│   │   │   └── theme/              # Theme components
│   │   ├── docusaurus-plugin-labs/
│   │   └── docusaurus-plugin-diagrams/
│   │
│   └── utils/
│       ├── labVerification.ts
│       └── quizScoring.ts
│
├── static/
│   ├── img/
│   │   ├── logo.svg
│   │   └── course-banners/
│   ├── diagrams/
│   │   ├── source/                 # Version-controlled source
│   │   │   ├── architecture.mmd
│   │   │   └── workflow.puml
│   │   └── rendered/               # Build artifacts (gitignored)
│   │       ├── architecture.svg
│   │       └── workflow.svg
│   └── downloads/
│       └── lab-files/
│
├── src/
│   ├── pages/                      # Custom standalone pages
│   │   ├── index.tsx               # Homepage
│   │   └── courses.tsx             # Course catalog
│   └── css/
│       └── custom.css
│
├── docusaurus.config.js            # Main site configuration
├── sidebars.js                     # Auto-generated sidebar config
├── package.json
├── tsconfig.json
└── README.md
```

### Structure Rationale

- **courses/[course-id]/:** Enables scaling to multiple courses while maintaining isolation. Each course is self-contained and can be independently versioned.
- **shared/:** Implements monorepo pattern for code reuse across courses. All courses share the same Quiz component, Lab environment, diagram rendering, and progress tracking.
- **static/diagrams/source/:** Diagrams are version-controlled as text (Mermaid/PlantUML), enabling review and diff in PRs. Rendered outputs are gitignored and generated during build.
- **labs/[lab-id]/:** Each lab is a self-contained directory with instructions, verification scripts, and solutions. This structure supports lab verification automation.
- **_category_.json:** Docusaurus convention for auto-generating sidebars. Eliminates manual sidebar.js maintenance for course sections.

## Architectural Patterns

### Pattern 1: Separation of Content and Presentation

**What:** Content (MDX files, quiz JSON) is completely separate from presentation logic (React components, plugins, themes). The build process mediates between them via the data layer.

**When to use:** Always. This is fundamental to Docusaurus architecture and enables content authors to work independently from developers.

**Trade-offs:**
- **Pro:** Content can be authored by non-developers using Markdown/MDX. Theme changes don't affect content. Multiple courses can share the same presentation layer.
- **Con:** Adding new interactive elements requires developer involvement to create components.

**Example:**
```typescript
// Content: courses/sfd301/docs/section-1/pods.mdx
---
sidebar_position: 1
title: Understanding Pods
---

import Quiz from '@site/shared/components/Quiz';
import MermaidDiagram from '@site/shared/components/DiagramViewer';

# Understanding Pods

<MermaidDiagram file="diagrams/source/pod-architecture.mmd" />

## Check Your Understanding

<Quiz quizId="section-1-pods" />

// Component: shared/components/Quiz/index.tsx
export default function Quiz({ quizId }: { quizId: string }) {
  const quizData = useQuizData(quizId); // Plugin provides this hook
  return <QuizQuestion questions={quizData.questions} />;
}
```

### Pattern 2: Plugin-Based Content Loading

**What:** Custom Docusaurus plugins load specialized content types (quizzes, labs) and make them available to theme components via the data layer.

**When to use:** When you need content types beyond standard docs and blog posts (quizzes, labs, course metadata, progress tracking).

**Trade-offs:**
- **Pro:** Clean separation of concerns. Plugins run in Node.js and can access filesystem, databases, APIs. Content is available as serializable JSON to React components.
- **Con:** Learning curve for Docusaurus plugin API. Debugging data flow from plugin to component requires understanding the temp file mechanism.

**Example:**
```javascript
// shared/plugins/docusaurus-plugin-quiz/index.js
module.exports = function quizPlugin(context, options) {
  return {
    name: 'docusaurus-plugin-quiz',

    async loadContent() {
      // Runs in Node.js during build
      const quizFiles = await loadQuizFilesFromDisk();
      return quizFiles; // Must be serializable
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions;

      // Emit JSON data files
      const quizDataPath = await createData(
        'quiz-data.json',
        JSON.stringify(content)
      );

      // Add routes that components can use
      addRoute({
        path: '/quiz/:quizId',
        component: '@site/shared/components/Quiz',
        exact: true,
      });
    },
  };
};
```

### Pattern 3: Auto-Generated Sidebars from Filesystem

**What:** Docusaurus automatically generates sidebar navigation from the folder structure. Frontmatter controls ordering and labels.

**When to use:** Always for course content. Eliminates manual sidebar.js maintenance and ensures sidebar matches filesystem reality.

**Trade-offs:**
- **Pro:** Zero maintenance. Add a file, it appears in sidebar. Rename a folder, sidebar updates. Clear relationship between files and navigation.
- **Con:** Limited control over complex nested structures. Custom sidebars require manual configuration.

**Example:**
```javascript
// sidebars.js - minimal configuration
module.exports = {
  sfd301: [
    {
      type: 'autogenerated',
      dirName: 'courses/sfd301/docs', // Docusaurus generates the rest
    },
  ],
};

// courses/sfd301/docs/section-0/_category_.json
{
  "label": "Section 0: Introduction",
  "position": 1,
  "collapsible": true,
  "collapsed": false
}

// courses/sfd301/docs/section-0/01-overview.mdx
---
sidebar_position: 1
title: Course Overview
---
```

### Pattern 4: Git-Based Content Workflow

**What:** All content lives in Git. Authors use branches and pull requests. GitHub Actions builds and deploys on merge to main.

**When to use:** Always. This enables review, approval, version history, and rollback.

**Trade-offs:**
- **Pro:** Full audit trail. Peer review on content changes. CI/CD automation. Free hosting on GitHub Pages.
- **Con:** Requires Git literacy from content authors. No real-time preview without local dev environment or PR preview deployments.

**Example:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build/

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: actions/deploy-pages@v4
```

### Pattern 5: Diagram-as-Code

**What:** Diagrams are authored as text (Mermaid, PlantUML) and rendered during build or at runtime in the browser.

**When to use:** For architecture diagrams, workflows, and technical visualizations that need version control and easy updates.

**Trade-offs:**
- **Pro:** Diagrams in Git with diff support. Consistent styling. AI-assisted generation. Easy updates via text edits.
- **Con:** Limited visual control compared to tools like draw.io. Learning curve for syntax. Complex diagrams may be hard to express in text.

**Example:**
```mdx
<!-- courses/sfd301/docs/section-2/architecture.mdx -->
import MermaidDiagram from '@site/shared/components/DiagramViewer';

# Kubernetes Architecture

<MermaidDiagram file="diagrams/source/k8s-architecture.mmd" />

<!-- static/diagrams/source/k8s-architecture.mmd -->
graph TB
    User[User] -->|kubectl| API[API Server]
    API --> ETCD[(etcd)]
    API --> Scheduler
    API --> Controller[Controller Manager]
    Scheduler --> Node1[Node 1]
    Scheduler --> Node2[Node 2]
    Node1 --> Pod1[Pod]
    Node2 --> Pod2[Pod]
```

## Data Flow

### Build-Time Data Flow

```
1. Author commits content
   ↓
2. GitHub Actions triggered
   ↓
3. Docusaurus Build Process
   │
   ├─→ Plugins execute (Node.js)
   │   ├─→ plugin-content-docs scans courses/sfd301/docs/
   │   ├─→ plugin-quiz loads courses/sfd301/quizzes/*.json
   │   ├─→ plugin-labs loads courses/sfd301/labs/*/verify.sh
   │   └─→ Each plugin emits JSON to .docusaurus/
   │
   ├─→ Theme components receive data (React)
   │   ├─→ Quiz component gets quiz data via props
   │   ├─→ Lab component gets lab metadata via props
   │   └─→ DiagramViewer renders Mermaid/PlantUML
   │
   ├─→ Webpack bundles
   │   ├─→ Server bundle (for SSG)
   │   └─→ Client bundle (for hydration)
   │
   └─→ Static site generated to build/
       ├─→ HTML files (one per route)
       ├─→ JS bundles
       ├─→ CSS
       └─→ Assets (images, diagrams, downloads)
   ↓
4. Upload to GitHub Pages
   ↓
5. Site deployed and accessible
```

### Runtime Data Flow (User Interaction)

```
1. User navigates to course section
   ↓
2. React hydrates static HTML
   ↓
3. User interacts with Quiz component
   ↓
4. Quiz component reads quiz data from page context
   │   (Data was embedded during build via plugin)
   ↓
5. User submits quiz answers
   ↓
6. Client-side scoring (no backend needed for basic quizzes)
   ↓
7. Results displayed with explanations

For Lab Verification (requires backend):
   ↓
8. User clicks "Verify Lab"
   ↓
9. Lab component calls verification API
   │   (Separate service, not part of static site)
   ↓
10. Verification script runs in cloud environment
    ↓
11. Results returned to Lab component
    ↓
12. Progress updated and displayed
```

### Content Authoring Workflow

```
[Author] → [Local Branch] → [Write MDX] → [Preview Locally]
                                              ↓
                                       [Commit & Push]
                                              ↓
                                        [Open PR]
                                              ↓
                              [PR Preview Deployed] ←─ (optional)
                                              ↓
                              [Peer Review / Comments]
                                              ↓
                                       [Approval]
                                              ↓
                                    [Merge to main]
                                              ↓
                          [GitHub Actions Build & Deploy]
                                              ↓
                                    [Live on GitHub Pages]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **1 course, 10 sections** | Single `courses/sfd301/` directory. Auto-generated sidebars. No special infrastructure needed. GitHub Pages free tier sufficient. |
| **5-10 courses** | Monorepo structure with `courses/[course-id]/`. Shared components in `shared/`. Consider multi-sidebar approach with course selector. May hit GitHub Pages bandwidth limits (100GB/month) - consider CDN. |
| **10+ courses, multiple instructors** | Consider multi-repo approach with separate Docusaurus sites per course, shared component library as npm package. Centralized course catalog site linking to individual course sites. Alternatively, use Docusaurus multi-instance plugin. |

### Scaling Priorities

1. **First bottleneck: Sidebar complexity**
   - **What breaks:** Single sidebar with 10 courses × 10 sections = 100+ sidebar items becomes unwieldy.
   - **Fix:** Use Docusaurus multi-instance plugin or create separate sidebar per course with course selector in navbar.

2. **Second bottleneck: Build time**
   - **What breaks:** With 10+ courses, full site rebuild on every content change takes 5+ minutes.
   - **Fix:** Split courses into separate Docusaurus sites that build independently. Use workspace/monorepo tools (Turborepo, Nx) for selective builds.

3. **Third bottleneck: GitHub Pages bandwidth**
   - **What breaks:** Free tier provides 100GB/month. With video content or many students, bandwidth limits may be hit.
   - **Fix:** Move static assets (videos, large PDFs) to CDN (Cloudflare, Bunny CDN). Use external video hosting (YouTube, Vimeo).

## Component Integration

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Lab Verification API** | REST API called from LabEnvironment component | Separate Node.js service (not part of static site). Runs verification scripts in sandboxed environment. Returns pass/fail + feedback. |
| **Quiz Results Storage** | LocalStorage or external DB via API | For simple quizzes, use client-side localStorage. For persistent progress tracking, integrate with backend API (Firebase, Supabase). |
| **Diagram Rendering** | Mermaid.js in browser or pre-rendered SVG | Pre-render during build for faster page loads. Runtime rendering for user-editable diagrams (if needed). |
| **Analytics** | Google Analytics, Plausible, or PostHog | Add via Docusaurus plugin (`@docusaurus/plugin-google-gtag`). Track section completion, quiz scores, lab attempts. |
| **Search** | Algolia DocSearch (free for open source) | Apply for Algolia DocSearch program. Automatically indexes content on deploy. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Plugin ↔ Theme** | JSON data via `createData()` and `addRoute()` | Plugins run in Node.js, themes in React. Communication is one-way: plugin → theme. Themes cannot call plugin code. |
| **Course Content ↔ Shared Components** | MDX imports from `@site/shared/components` | Content files import and use shared components. Components receive props from content authors. |
| **Docs ↔ Labs** | Cross-linking via standard Markdown links | Labs can be standalone pages or embedded in docs sections. Use relative paths or Docusaurus `@site` alias. |
| **GitHub Actions ↔ Deployment** | `actions/upload-pages-artifact` + `actions/deploy-pages` | Build produces artifact (static files), deploy step publishes to GitHub Pages. |

## Anti-Patterns

### Anti-Pattern 1: Mixing Content and Code in Same Files

**What people do:** Embed complex React logic directly in MDX files instead of creating reusable components.

**Why it's wrong:** Content authors (who may not be React developers) can't modify or understand the logic. Hard to test, maintain, and reuse across courses.

**Do this instead:** Create reusable components in `shared/components/` and import them cleanly into MDX:
```mdx
<!-- BAD: Complex logic in content file -->
import { useState, useEffect } from 'react';

export function ComplexQuiz() {
  const [score, setScore] = useState(0);
  // 50 lines of quiz logic here...
}

<ComplexQuiz />

<!-- GOOD: Clean component import -->
import Quiz from '@site/shared/components/Quiz';

<Quiz quizId="section-1-pods" />
```

### Anti-Pattern 2: Manual Sidebar Management

**What people do:** Manually maintain `sidebars.js` with every file path, position, and label.

**Why it's wrong:** Every new file requires updating two places (the file itself + sidebar config). Prone to errors, breaks easily, creates merge conflicts.

**Do this instead:** Use auto-generated sidebars with `_category_.json` for customization:
```javascript
// BAD: Manual sidebar
module.exports = {
  sfd301: [
    'courses/sfd301/docs/section-0/overview',
    'courses/sfd301/docs/section-0/objectives',
    // ... 100 more lines
  ],
};

// GOOD: Auto-generated
module.exports = {
  sfd301: [{ type: 'autogenerated', dirName: 'courses/sfd301/docs' }],
};
```

### Anti-Pattern 3: Storing Rendered Diagrams in Git

**What people do:** Commit both source (.mmd, .puml) and rendered (.svg, .png) diagrams to Git.

**Why it's wrong:** Rendered files bloat repository size, cause merge conflicts, and can become out of sync with source files.

**Do this instead:** Store only source files in Git. Render during build or at runtime:
```yaml
# .gitignore
static/diagrams/rendered/

# .github/workflows/deploy.yml
- name: Render diagrams
  run: npm run render-diagrams  # Generates SVGs from source
```

### Anti-Pattern 4: Monolithic Single-Course Structure

**What people do:** Build site for one course, then try to bolt on additional courses later by cramming everything into `docs/`.

**Why it's wrong:** Doesn't scale. Courses interfere with each other. Hard to version independently. Sidebar becomes unmanageable.

**Do this instead:** Plan for multiple courses from day one with course-scoped directories:
```
// BAD: Monolithic
docs/
├── kubernetes-basics/
├── kubernetes-advanced/
└── docker-fundamentals/  # All in one flat docs/

// GOOD: Course-scoped
courses/
├── sfd301/
│   └── docs/
├── sfd401/
│   └── docs/
└── docker101/
    └── docs/
```

### Anti-Pattern 5: Bypassing Git Workflow for "Quick Fixes"

**What people do:** Directly edit content in GitHub UI or push to main without PR review to "save time."

**Why it's wrong:** No peer review means typos, broken links, and technical errors make it to production. No rollback point if something breaks.

**Do this instead:** Always use branch → PR → review → merge workflow, even for small changes:
```yaml
# .github/branch-protection.yml (GitHub UI)
main:
  required_reviews: 1
  require_status_checks: true
  checks:
    - build
    - test-labs
```

## Build Order and Dependencies

### Dependency Graph

```
1. Install Dependencies (package.json)
   ↓
2. Render Diagrams (if source changed)
   ├─→ Mermaid CLI: .mmd → .svg
   └─→ PlantUML CLI: .puml → .svg
   ↓
3. Docusaurus Build
   ├─→ Plugin: content-docs (loads MDX)
   ├─→ Plugin: quiz (loads quiz JSON)
   ├─→ Plugin: labs (loads lab metadata)
   └─→ Theme: renders components with data
   ↓
4. Generate Static Site
   ├─→ SSG: pre-render all routes to HTML
   └─→ Bundle: client-side JS for hydration
   ↓
5. Test (optional but recommended)
   ├─→ Link validation (broken link checker)
   ├─→ Lab verification script syntax
   └─→ Quiz JSON schema validation
   ↓
6. Deploy to GitHub Pages
```

### Build Command Sequence

```bash
# package.json scripts
{
  "scripts": {
    "start": "docusaurus start",              # Dev server with hot reload
    "build": "npm run render-diagrams && docusaurus build",
    "render-diagrams": "node scripts/render-diagrams.js",
    "test": "npm run test:links && npm run test:labs && npm run test:quizzes",
    "test:links": "broken-link-checker http://localhost:3000",
    "test:labs": "node scripts/validate-labs.js",
    "test:quizzes": "ajv validate -s schemas/quiz.schema.json -d 'courses/*/quizzes/*.json'",
    "serve": "docusaurus serve",              # Preview production build locally
    "deploy": "docusaurus deploy"             # Manual deploy (not used with GitHub Actions)
  }
}
```

### Critical Dependencies

**Build-time:**
- `@docusaurus/core` (^3.0.0) - Core framework
- `@docusaurus/preset-classic` - Standard docs + blog plugins
- `@mermaid-js/mermaid-cli` - Diagram rendering
- `remark-math` + `rehype-katex` - Math equation support
- Custom plugins (quiz, labs) - Must be in `shared/plugins/`

**Runtime (browser):**
- `react` + `react-dom` - Required by Docusaurus
- `mermaid` (if using runtime rendering)
- Custom component dependencies

**Development:**
- `broken-link-checker` - Validate links before deploy
- `ajv` - JSON schema validation for quizzes
- `prettier` - Code formatting
- `eslint` - Linting

## Content Authoring Workflow Details

### Roles and Responsibilities

| Role | Responsibilities | Tools Used |
|------|-----------------|------------|
| **Content Author** | Write reading materials, create quizzes, design labs | MDX, VS Code, Git, Local dev server |
| **Developer** | Build components, plugins, theme customizations | React, TypeScript, Docusaurus API |
| **Reviewer** | Review PRs for technical accuracy, clarity, formatting | GitHub PR interface, PR preview site |
| **Course Maintainer** | Approve merges, manage releases, deploy updates | GitHub, GitHub Actions |

### Typical Authoring Flow

**1. Setup:**
```bash
git clone <repo>
npm install
npm start  # Runs dev server at localhost:3000
```

**2. Create new section:**
```bash
mkdir -p courses/sfd301/docs/section-5
echo '{"label": "Section 5: Services", "position": 5}' > courses/sfd301/docs/section-5/_category_.json
```

**3. Write content:**
```mdx
<!-- courses/sfd301/docs/section-5/01-services-intro.mdx -->
---
sidebar_position: 1
title: Introduction to Services
---

# Introduction to Services

Content here...

<Quiz quizId="section-5-services" />
```

**4. Create quiz:**
```json
// courses/sfd301/quizzes/section-5-services.json
{
  "id": "section-5-services",
  "title": "Services Quiz",
  "questions": [
    {
      "question": "What is a Service in Kubernetes?",
      "options": ["A", "B", "C", "D"],
      "correct": 2,
      "explanation": "..."
    }
  ]
}
```

**5. Preview locally:**
- Navigate to http://localhost:3000/courses/sfd301/docs/section-5/services-intro
- Test quiz functionality
- Check navigation and links

**6. Commit and PR:**
```bash
git checkout -b add-section-5-services
git add courses/sfd301/docs/section-5/
git add courses/sfd301/quizzes/section-5-services.json
git commit -m "Add Section 5: Services content and quiz"
git push origin add-section-5-services
# Open PR on GitHub
```

**7. Review and merge:**
- Reviewer checks content in PR preview
- Suggests changes via PR comments
- Author updates content
- Reviewer approves
- Merge to main triggers deployment

## Lab Development Workflow

### Lab Structure

Each lab follows this pattern:

```
courses/sfd301/labs/lab-05-services/
├── README.mdx                # Instructions (embedded in docs or standalone)
├── setup.yaml                # Initial K8s manifests students start with
├── verify.sh                 # Verification script
├── solution/
│   ├── answer.yaml           # Complete solution
│   └── explanation.md        # Step-by-step walkthrough
└── assets/
    └── app-image/            # Container image source (if custom image needed)
```

### Verification Script Pattern

```bash
#!/bin/bash
# courses/sfd301/labs/lab-05-services/verify.sh

set -e

# Check 1: Service exists
if ! kubectl get service my-service &> /dev/null; then
  echo "FAIL: Service 'my-service' not found"
  exit 1
fi

# Check 2: Service has correct selector
SELECTOR=$(kubectl get service my-service -o jsonpath='{.spec.selector.app}')
if [ "$SELECTOR" != "my-app" ]; then
  echo "FAIL: Service selector should be 'app=my-app', got '$SELECTOR'"
  exit 1
fi

# Check 3: Service is accessible
POD_IP=$(kubectl get pods -l app=my-app -o jsonpath='{.items[0].status.podIP}')
if ! curl -s http://$POD_IP:8080 | grep "Hello"; then
  echo "FAIL: Service not responding correctly"
  exit 1
fi

echo "PASS: All checks passed!"
exit 0
```

### Lab Verification Integration Options

**Option 1: Manual execution (simplest)**
- Students run `verify.sh` locally on their own cluster
- No backend infrastructure needed
- Best for self-paced learning

**Option 2: Web-based verification API**
- Students click "Verify" button in LabEnvironment component
- Component calls REST API with student's cluster credentials
- API runs verification script in sandboxed environment
- Returns results to UI
- Requires separate backend service (Node.js + Docker)

**Option 3: GitHub Actions for verification**
- Students fork repo, push their solution
- GitHub Actions runs verification on their fork
- Results shown in Actions tab
- Good for graded courses with submission requirement

## Diagram Creation Workflow

### Mermaid Example

**1. Author diagram as text:**
```mermaid
<!-- static/diagrams/source/pod-lifecycle.mmd -->
stateDiagram-v2
    [*] --> Pending
    Pending --> Running: Containers start
    Running --> Succeeded: Containers exit 0
    Running --> Failed: Containers exit non-zero
    Succeeded --> [*]
    Failed --> [*]
```

**2. Reference in content:**
```mdx
<!-- courses/sfd301/docs/section-2/pod-lifecycle.mdx -->
import MermaidDiagram from '@site/shared/components/DiagramViewer';

<MermaidDiagram file="diagrams/source/pod-lifecycle.mmd" />
```

**3. Render during build:**
```javascript
// scripts/render-diagrams.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const sourceDir = 'static/diagrams/source';
const outputDir = 'static/diagrams/rendered';

fs.readdirSync(sourceDir)
  .filter(f => f.endsWith('.mmd'))
  .forEach(file => {
    const input = path.join(sourceDir, file);
    const output = path.join(outputDir, file.replace('.mmd', '.svg'));
    exec(`mmdc -i ${input} -o ${output}`, (err) => {
      if (err) console.error(`Failed to render ${file}:`, err);
      else console.log(`Rendered ${file} → ${output}`);
    });
  });
```

**4. Or use runtime rendering:**
```tsx
// shared/components/DiagramViewer/MermaidDiagram.tsx
import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

export default function MermaidDiagram({ file }: { file: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/${file}`)
      .then(res => res.text())
      .then(diagram => {
        mermaid.render('mermaid-diagram', diagram).then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        });
      });
  }, [file]);

  return <div ref={ref} />;
}
```

## Sources

### Docusaurus Architecture and Best Practices
- [Architecture | Docusaurus](https://docusaurus.io/docs/advanced/architecture) - Official architecture documentation (HIGH confidence)
- [Sidebar | Docusaurus](https://docusaurus.io/docs/sidebar) - Sidebar configuration patterns (HIGH confidence)
- [What are the best practices for managing large documentation websites with Docusaurus?](https://github.com/facebook/docusaurus/discussions/11171) - Multi-site strategies (MEDIUM confidence)
- [Using Docusaurus to Build A Modern Documentation Website](https://semaphore.io/blog/docusaurus) - Build process overview (MEDIUM confidence)

### Course Platform Patterns
- [11 Steps to Create an Online Training Course Like a Pro](https://flearningstudio.com/create-an-online-training-course/) - Course structure best practices (MEDIUM confidence)
- [Using MDX for Educational Content and Tutorials](https://www.mdxblog.io/blog/using-mdx-for-e-learning-content-and-tutorials) - MDX for courses (MEDIUM confidence)

### Git-Based Workflows
- [Content Authoring and Approval in a Git-based CMS](https://commitspark.com/blog/content-authoring-and-approval-in-git-based-cms/) - Git workflow patterns (HIGH confidence)
- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) - GitHub Actions deployment (HIGH confidence)

### Monorepo and Scaling
- [Monorepo Explained](https://monorepo.tools/) - Monorepo concepts (HIGH confidence)
- [The Ultimate Guide to Building a Monorepo in 2026](https://medium.com/@sanjaytomar717/the-ultimate-guide-to-building-a-monorepo-in-2025-sharing-code-like-the-pros-ee4d6d56abaa) - Shared components (MEDIUM confidence)

### Diagram Tools
- [Mermaid vs. PlantUML: Comparing Popular Diagramming Tools](https://www.gleek.io/blog/mermaid-vs-plantuml) - Diagram tool comparison (MEDIUM confidence)
- [Automate Technical Diagrams with LLMs using Mermaid, PlantUML and CI/CD](https://cosmo-edge.com/automate-technical-diagrams-llm-mermaid-plantuml-cicd/) - Diagram automation (MEDIUM confidence)

### Lab Verification
- [Hands-On Challenge Labs | Practice in a Sandbox Environment](https://digitalcloud.training/hands-on-challenge-labs/) - Lab verification patterns (MEDIUM confidence)
- [Pluralsight Skills | Hands-on labs](https://www.pluralsight.com/product/labs) - Lab environment examples (MEDIUM confidence)

---
*Architecture research for: Technical Course Platform (Docusaurus)*
*Researched: 2026-02-08*
