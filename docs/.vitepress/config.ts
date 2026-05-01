import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(defineConfig({
  title: "js.mtfm.io/docs",
  description: "Run and edit JavaScript in the browser, embedded in the URL",
  base: "/docs/",

  ignoreDeadLinks: [/^http:\/\/localhost/],

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Integrations", link: "/integrations/jupyter" },
      { text: "Development", link: "/development/local-setup" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "JavaScript API", link: "/guide/javascript-api" },
          { text: "URL State", link: "/guide/url-state" },
          { text: "Short URLs", link: "/guide/short-urls" },
          { text: "Examples", link: "/guide/examples" },
          { text: "AI Usage", link: "/guide/ai" },
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
}));
