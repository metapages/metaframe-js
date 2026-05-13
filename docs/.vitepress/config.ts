import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: "framejs.io",
    description: "Run and edit JavaScript in the browser, embedded in the URL",
    base: "/docs/",

    ignoreDeadLinks: [/^http:\/\/localhost/],

    themeConfig: {
      nav: [
        { text: "Docs", link: "/guide/getting-started" },
        { text: "Examples", link: "/examples/" },
        { text: "Integrations", link: "/integrations/jupyter" },
        { text: "Development", link: "/development/local-setup" },
        { text: "Create", link: "framejs.io" },
      ],

      sidebar: [
        {
          text: "Guide",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "JavaScript API", link: "/guide/javascript-api" },
            { text: "URL State", link: "/guide/url-state" },
            { text: "Short URLs", link: "/guide/short-urls" },
            { text: "Embedding", link: "/guide/embedding" },
            { text: "Rendering in a Website", link: "/guide/rendering" },
          ],
        },
        {
          text: "AI",
          items: [
            { text: "Setup", link: "/ai/setup" },
            {
              text: "command-js.md",
              link: "https://framejs.io/command-js.md",
            },
            {
              text: "llms.txt",
              link: "https://framejs.io/llms.txt",
            },
          ],
        },
        {
          text: "Examples",
          items: [
            { text: "Gallery", link: "/examples/" },
            { text: "Multi Demo", link: "/examples/multi-demo" },
            { text: "Data Dashboard", link: "/examples/data-dashboard" },
            { text: "Plot Data", link: "/examples/plot-data" },
            { text: "Scientific Visualization", link: "/examples/scientific-visualization" },
            { text: "Cytoscape", link: "/examples/cytoscape" },
            { text: "NGLViewer", link: "/examples/nglviewer" },
          ],
        },
        {
          text: "Integrations",
          items: [
            { text: "Jupyter", link: "/integrations/jupyter" },
            { text: "JupyterLite (Live)", link: "/integrations/jupyterlite" },
            { text: "marimo", link: "/integrations/marimo" },
          ],
        },
        {
          text: "Story",
          items: [
            { text: "About", link: "/story/about" },
            {
              text: "What problem is this solving",
              link: "/story/what-problem-is-this-solving",
            },
            { text: "Open Infrastructure", link: "/story/open-infrastructure" },
          ],
        },
        {
          text: "Development",
          items: [
            { text: "Local Setup", link: "/development/local-setup" },
            { text: "Architecture", link: "/development/architecture" },
            { text: "Editor", link: "/development/editor" },
            { text: "Worker", link: "/development/worker" },
            { text: "Deployment", link: "/development/deployment" },
          ],
        },
      ],

      search: {
        provider: "local",
      },

      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/metapages/metaframe-js",
        },
      ],
    },
  }),
);
