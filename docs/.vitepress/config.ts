import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    title: "framejs.io/docs",
    description: "Run and edit JavaScript in the browser, embedded in the URL",
    base: "/docs/",

    ignoreDeadLinks: [/^http:\/\/localhost/],

    themeConfig: {
      nav: [
        { text: "Guide", link: "/guide/getting-started" },
        { text: "Examples", link: "/examples/" },
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
            { text: "Embedding", link: "/guide/embedding" },
            { text: "Rendering in a Website", link: "/guide/rendering" },
            { text: "Examples", link: "/examples/" },
          ],
        },
        {
          text: "AI",
          items: [
            { text: "Guide", link: "/ai/guide" },
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
            { text: "Bouncing Ball", link: "/examples/bouncing-ball" },
            { text: "Data Dashboard", link: "/examples/data-dashboard" },
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
