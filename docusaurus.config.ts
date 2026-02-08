import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Kubernetes Intermediate (SFD301)',
  tagline: 'Master Intermediate Kubernetes Concepts',
  favicon: 'img/favicon.ico',

  // Future flags
  future: {
    v4: true,
  },

  // Set the production url of your site here
  url: 'https://schoolofdevops.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/kubernetes-intermediate/',

  // GitHub pages deployment config
  organizationName: 'schoolofdevops',
  projectName: 'kubernetes-intermediate',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Serve docs at site root (docs-only mode)
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/schoolofdevops/kubernetes-intermediate/tree/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@cmfcmf/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        language: 'en',
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/kubernetes-social-card.jpg',
    metadata: [
      {name: 'keywords', content: 'kubernetes, intermediate, course, devops, containers, orchestration'},
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SFD301',
      logo: {
        alt: 'Kubernetes Logo',
        src: 'img/logo.svg',
        href: '/intro',
        target: '_self',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'courseSidebar',
          position: 'left',
          label: 'Course',
        },
        {
          href: 'https://github.com/schoolofdevops/kubernetes-intermediate',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Course',
          items: [
            {
              label: 'Getting Started',
              to: '/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'School of DevOps',
              href: 'https://schoolofdevops.com',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/schoolofdevops/kubernetes-intermediate',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} School of DevOps. Licensed under Apache-2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'typescript', 'docker', 'go', 'python', 'hcl'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
