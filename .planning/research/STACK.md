# Stack Research

**Domain:** Technical Course Website (Kubernetes Training)
**Researched:** 2026-02-08
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Docusaurus | 3.9.2 | Static site generator | Meta-maintained, built for documentation/educational content. Excellent MDX support for interactive components, built-in versioning, i18n, and search. React-based for extensibility. Confirmed as production-ready for 2025-2026 with React 19 support in v3.7+. |
| React | 19.x | UI framework | Required by Docusaurus 3.7+. Enables interactive quiz components, labs, and custom educational widgets via MDX embedding. |
| TypeScript | 5.1+ | Type safety | First-class Docusaurus support. Recommended for configuration files (docusaurus.config.ts) and custom components. Improves maintainability for reusable course templates. |
| Node.js | 20.x LTS | Runtime | Modern LTS version. Compatible with GitHub Actions (actions/setup-node@v4). Docusaurus 3.x requires Node 18+ but 20.x recommended for stability. |
| npm | 10.x | Package manager | Default with Node 20. Use `npm ci` in CI/CD for reproducible builds. Alternative: pnpm for faster installs, but npm is simpler for templates. |

### Diagram Solutions

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @docusaurus/theme-mermaid | 3.9.2 | Code-based diagrams | Official Docusaurus plugin. Diagram-as-code approach (version controllable). Supports sequence, class, state, ER diagrams. Dark/light theme support. Dagre layout built-in, elk layout optional. MEDIUM confidence for Kubernetes architecture diagrams (limited expressiveness). |
| @excalidraw/excalidraw | 0.18.0 | Hand-drawn style diagrams | Excellent for architecture diagrams with visual appeal. Can embed via React component in MDX. Export as SVG for version control. Requires client-side rendering (use dynamic import). HIGH confidence for technical education (visual learners appreciate hand-drawn style). |
| Mermaid (via theme-mermaid) | Latest (via plugin) | Infrastructure/flow diagrams | Better than Excalidraw for sequence diagrams, state machines, Gantt charts. Prefer for lab workflow visualization. |

**Recommendation:** Use Mermaid for workflow/sequence diagrams (labs steps), Excalidraw for Kubernetes architecture diagrams. Store Excalidraw files in /static/diagrams/ directory, reference in docs.

### Quiz & Interactive Components

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Custom React components (MDX) | - | Quiz widgets | Build custom quiz components using React + MDX. No production-ready Docusaurus quiz plugin exists (verified via GitHub discussions). react-quiz-component (0.9.1) available but unmaintained (last update: 1 year ago). RECOMMENDATION: Build simple custom components using React state + localStorage for progress tracking. |
| @docusaurus/theme-live-codeblock | 3.9.2 | Live code playgrounds | Official plugin. Enables live React component demos. Useful for demonstrating YAML manifests with instant feedback. |
| Admonitions (built-in) | - | Callout boxes | Use for warnings, tips, important notes in labs. Built into Docusaurus markdown. Supports MDX inside admonitions. |
| Tabs (built-in) | - | Multi-language examples | Built into Docusaurus. Perfect for showing kubectl commands vs YAML vs Helm alternatives. |

**Confidence Level:** MEDIUM on quiz components (requires custom development). HIGH on live code blocks and built-in interactivity.

### Search Solutions

| Solution | Version | Purpose | When to Use |
|----------|---------|---------|-------------|
| Algolia DocSearch | v5 (via plugin) | Production search | FREE for open-source documentation. Auto-crawls weekly. Best UX. Setup requires DocSearch application approval. Use for production deployment. |
| @cmfcmf/docusaurus-search-local | Latest | Client-side search | Open source, offline search. No external dependencies. Index downloads to browser. Use for development or if Algolia approval delayed. Adequate for course content (10-20 sections won't overload browser). |

**Recommendation:** Start with local search plugin, apply for Algolia DocSearch before launch.

### Deployment & CI/CD

| Tool | Purpose | Why Recommended |
|------|---------|-----------------|
| GitHub Pages | Static hosting | FREE for public repos. Native GitHub Actions integration. Perfect for educational content. Reliable CDN. |
| GitHub Actions | CI/CD automation | Native to GitHub. Modern workflow: actions/checkout@v4, actions/setup-node@v4, actions/upload-pages-artifact@v3, actions/deploy-pages@v4. Deploy on push to main. Test builds on PRs without deploying. |
| npm scripts | Build automation | Use package.json scripts: `npm run build` (production), `npm run serve` (local preview), `npm start` (dev mode). Standard across Docusaurus projects. |

**GitHub Pages Configuration:** Enable "GitHub Actions" deployment source (NOT legacy "Deploy from a branch"). Set url, baseUrl, organizationName, projectName in docusaurus.config.ts.

### Lab Automation & Verification

| Tool | Purpose | Notes |
|------|---------|-------|
| KIND (Kubernetes in Docker) | Local K8s clusters | Industry standard for K8s learning environments. Quick setup (`kind create cluster`). Multi-node support. Use for lab development and verification. |
| kubectl wait | Lab step verification | Built into kubectl. Wait for conditions: `--for=condition=Ready`, `--for=jsonpath=...`. Essential for reliable lab scripts. |
| Bash scripts | Lab automation | Store verification scripts in `/labs/scripts/`. Use kubectl wait + kubectl get for validation. Example: verify pod count, service endpoints, configmap data. |
| Docker | Container runtime | Required by KIND. Use for building custom images if needed for labs. |

**Lab Structure Recommendation:**
```
labs/
  lab-01-pods/
    README.md           # Lab instructions (MDX)
    solution/           # Solution YAML files
    verify.sh           # Automated verification script
  lab-02-services/
    ...
```

### Development Tools

| Tool | Purpose | Configuration Tips |
|------|---------|-------------------|
| ESLint | Code quality | Use @docusaurus/eslint-plugin. Catches MDX issues early. |
| Prettier | Code formatting | Configure for .md, .mdx, .ts, .tsx. Consistent formatting across team. |
| VS Code | IDE | Install MDX extension. TypeScript support built-in. Docusaurus snippets available via extensions. |
| @docusaurus/tsconfig | TypeScript config | Extend from this package. Provides correct settings for Docusaurus projects. |

## Installation

```bash
# Initialize Docusaurus (TypeScript template)
npx create-docusaurus@latest kubernetes-intermediate classic --typescript

# Core dependencies (included in template, versions shown for reference)
# @docusaurus/core@3.9.2
# @docusaurus/preset-classic@3.9.2
# react@19.x
# react-dom@19.x

# Diagram plugins
npm install @docusaurus/theme-mermaid@3.9.2
npm install @excalidraw/excalidraw@0.18.0

# Search (choose one)
npm install @cmfcmf/docusaurus-search-local  # Local search
# OR apply for Algolia DocSearch (free, external service)

# Development tools
npm install -D @docusaurus/eslint-plugin eslint prettier
npm install -D @docusaurus/tsconfig

# Lab tools (global installation for course authors)
# KIND: https://kind.sigs.k8s.io/docs/user/quick-start/
# kubectl: https://kubernetes.io/docs/tasks/tools/
```

## Docusaurus Configuration Highlights

**File:** `docusaurus.config.ts`

```typescript
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Kubernetes Intermediate (SFD301)',
  tagline: 'Master Intermediate Kubernetes Concepts',
  url: 'https://schoolofdevops.github.io',
  baseUrl: '/kubernetes-intermediate/',
  organizationName: 'schoolofdevops',
  projectName: 'kubernetes-intermediate',

  markdown: {
    mermaid: true,  // Enable Mermaid diagrams
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',  // Docs-only mode
        },
        blog: false,  // Disable blog for course site
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'SFD301',
      items: [
        {to: '/labs', label: 'Labs', position: 'left'},
        {to: '/diagrams', label: 'Diagrams', position: 'left'},
        {
          href: 'https://github.com/schoolofdevops/kubernetes-intermediate',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} School of Devops. Built with Docusaurus.`,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'forest'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Docusaurus | GitBook | If you need WYSIWYG editing for non-technical contributors. Not recommended for developer-focused courses (less customizable, vendor lock-in). |
| Docusaurus | MkDocs (Material theme) | If Python ecosystem preferred. Good for simple docs but weaker React component integration. Docusaurus better for interactive quizzes. |
| Docusaurus | VuePress | If Vue.js preferred over React. Similar capabilities but smaller ecosystem. Docusaurus has better educational content examples. |
| Docusaurus | Nextra (Next.js) | If you need SSR/ISR for dynamic content. Overkill for static course content. Docusaurus simpler for educational use cases. |
| Mermaid + Excalidraw | Lucidchart / Draw.io | If you prefer GUI diagramming. NOT recommended for course templates (not version-controllable as code, requires manual exports, breaks docs-as-code workflow). |
| Custom React Quiz | Interactive tutorial platforms (Katacoda, Killercoda) | If you need hosted lab environments with browser terminals. Different use case - those are full interactive platforms, not documentation sites. Use Docusaurus for reading materials, link to those platforms for browser-based labs. |
| GitHub Actions | GitLab CI / Netlify | GitHub Actions best for GitHub Pages. Use Netlify if deploying elsewhere, but adds complexity for free tier limits. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Docusaurus v2.x | Outdated. React 19 support added in v3.7. Missing recent features (SVGR plugin, Bun support, Algolia v5). | Docusaurus 3.9.2+ (current stable) |
| Jekyll / Hugo | Static site generators designed for blogs, not documentation. Weak support for interactive React components. Poor MDX support. | Docusaurus (designed for docs) |
| WordPress + LMS plugins | Massive overkill for technical course content. Security burden, performance issues, not docs-as-code friendly. | Docusaurus (static = secure, fast, version-controlled) |
| Google Docs / Notion | Not version-controlled. No support for code syntax highlighting, diagrams-as-code, or technical content workflows. | Docusaurus with Git workflow |
| react-quiz-component (npm) | Unmaintained (last update: 1 year ago). Limited features. Better to build custom components tailored to course needs. | Custom React components in MDX |
| Minikube (for labs) | Slower startup than KIND. More complex setup. KIND specifically designed for testing/learning. | KIND (Kubernetes in Docker) |
| Gatsby | Overcomplicated for documentation. Long build times. GraphQL layer unnecessary for static course content. | Docusaurus (faster builds, simpler) |

## Stack Patterns by Course Variant

**If building multi-course platform (multiple courses like SFD301, SFD401, etc.):**
- Use Docusaurus monorepo with multiple sites
- Share components via `src/components/shared/`
- Separate repos per course with shared template
- Use GitHub template repository feature
- Because: Independent deployment, cleaner git history per course

**If single course with frequent updates:**
- Enable Docusaurus versioning (`npm run docusaurus docs:version 1.0`)
- Archive old versions, keep latest editable
- Because: Learners can reference version they purchased

**If multilingual course:**
- Enable Docusaurus i18n (`npm run write-translations`)
- Use Crowdin (external SaaS) for translation management
- Because: Keeps translations out of Git, easier for translators

**If heavy on video content:**
- Embed YouTube/Vimeo via MDX components
- Use lite-youtube-embed for performance
- Because: Self-hosting video breaks GitHub Pages limits, CDN costs

## Version Compatibility

| Package | Compatible Version | Notes |
|---------|-------------------|-------|
| @docusaurus/core | 3.9.2 | All @docusaurus/* packages must match version exactly |
| @docusaurus/theme-mermaid | 3.9.2 | Must match core version |
| react | 19.x | React 19 support added in Docusaurus 3.7 |
| react-dom | 19.x | Must match react version |
| typescript | 5.1+ | Minimum required, latest 5.x recommended |
| node | 20.x LTS | Docusaurus 3.x requires 18+, but 20.x recommended |
| @excalidraw/excalidraw | 0.18.0 | Peer dependency: react 17-19 (compatible) |

**CRITICAL:** All @docusaurus/* packages must be the same version. Use `npm outdated` to check, `npm update` to sync.

## Sources

**HIGH Confidence (Official Documentation):**
- [Docusaurus Official Docs](https://docusaurus.io/docs) - Current version 3.9.2, features, configuration
- [Docusaurus TypeScript Support](https://docusaurus.io/docs/typescript-support) - TypeScript 5.1+ requirement
- [Docusaurus Markdown Features](https://docusaurus.io/docs/markdown-features) - MDX, admonitions, tabs, code blocks
- [Docusaurus Diagrams](https://docusaurus.io/docs/next/markdown-features/diagrams) - Mermaid integration
- [Docusaurus Deployment](https://docusaurus.io/docs/deployment) - GitHub Pages configuration
- [Excalidraw Integration Docs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration) - Version 0.18.0, React integration
- [GitHub: Docusaurus Releases](https://github.com/facebook/docusaurus/releases) - v3.7 React 19 support, v3.9.2 latest
- [Kubernetes kubectl wait](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_wait/) - Lab verification
- [KIND Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/) - Kubernetes in Docker

**MEDIUM Confidence (Verified Web Search):**
- [x-cmd blog: Docusaurus 3.7 Released](https://www.x-cmd.com/blog/250108/) - React 19 compatibility, SVGR plugin
- [FreeCodeCamp: Docusaurus + GitHub Actions](https://www.freecodecamp.org/news/set-up-docs-as-code-with-docusaurus-and-github-actions/) - CI/CD setup
- [Medium: Deploy Docusaurus on GitHub Pages (Dec 2025)](https://medium.com/@syedahoorainali/deploy-docusaurus-book-on-github-pages-240097aa6869) - actions/deploy-pages@v4
- [Docusaurus Community Plugin Directory](https://docusaurus.community/plugindirectory/) - No official quiz plugin confirmed
- [GitHub Discussion: How to add Quiz](https://github.com/facebook/docusaurus/discussions/8395) - Confirmed no official plugin
- [GitHub: Excalidraw in Docusaurus](https://github.com/excalidraw/excalidraw/discussions/9157) - Integration approaches
- [MDXblog: Using MDX for Educational Content](https://www.mdxblog.io/blog/using-mdx-for-e-learning-content-and-tutorials) - Quiz components via React
- [Algolia DocSearch Integration](https://www.algolia.com/developers/code-exchange/integrate-docusaurus-with-algolia-docsearch) - Free for open source
- [cmfcmf/docusaurus-search-local](https://github.com/cmfcmf/docusaurus-search-local) - Client-side search alternative

**MEDIUM Confidence (npm Package Status):**
- [@docusaurus/core npm](https://www.npmjs.com/package/@docusaurus/core) - Version 3.9.2 (3 months ago as of Feb 2026)
- [@excalidraw/excalidraw npm](https://www.npmjs.com/package/@excalidraw/excalidraw) - Version 0.18.0 (1 year ago)
- [react-quiz-component npm](https://www.npmjs.com/package/react-quiz-component) - Version 0.9.1 (1 year ago, unmaintained)

**LOW Confidence (Needs Validation for Production):**
- Specific Algolia DocSearch approval timeline (varies by application)
- Excalidraw updates beyond 0.18.0 (package maintained but releases infrequent)
- Performance limits for @cmfcmf/docusaurus-search-local with large course catalogs (tested up to ~100 pages typically)

---

*Stack research for: Kubernetes Intermediate Course (SFD301)*
*Researched: 2026-02-08*
*Next Step: Use this stack in ARCHITECTURE.md and FEATURES.md planning*
