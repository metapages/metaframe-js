import { defineConfig } from "vitepress";

export default defineConfig({
  title: "metaframe-js",
  description: "Run and edit JavaScript in the browser, embedded in the URL",
  base: "/docs/",

  ignoreDeadLinks: [/^http:\/\/localhost/],

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Integrations", link: "/integrations/jupyter" },
      { text: "Development", link: "/development/local-setup" },
      {
        text: "GitHub",
        link: "https://github.com/metapages/metaframe-js",
      },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "JavaScript API", link: "/guide/javascript-api" },
          { text: "URL State", link: "/guide/url-state" },
          { text: "Examples", link: "/guide/examples" },
        ],
      },
      {
        text: "Integrations",
        items: [
          { text: "Jupyter", link: "/integrations/jupyter" },
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
});
