import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    format: "esm",
    target: "es2020",
  },
  plugins: [vue(), vueJsx(), eslint()],
  resolve: {
    alias: {
      "~/vendor": fileURLToPath(new URL("./vendor", import.meta.url)),
      "~/wails": fileURLToPath(new URL("./wailsjs", import.meta.url)),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
