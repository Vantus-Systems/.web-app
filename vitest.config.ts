import path from "path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./"),
      "@server": path.resolve(__dirname, "./server"),
    },
  },
});
