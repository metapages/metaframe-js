import { resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "/@/": resolve(__dirname, "../editor/src") + "/",
    },
    dedupe: ["react", "react-dom"],
  },
});
