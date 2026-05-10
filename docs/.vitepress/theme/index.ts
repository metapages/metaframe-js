import DefaultTheme from "vitepress/theme";
import HomeLayout from "./HomeLayout.vue";
import ExamplesGrid from "./ExamplesGrid.vue";

export default {
  extends: DefaultTheme,
  Layout: HomeLayout,
  enhanceApp({ app }) {
    app.component("ExamplesGrid", ExamplesGrid);
  },
};
