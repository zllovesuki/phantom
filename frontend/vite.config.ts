import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    format: 'esm',
    target: 'es2020',
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "~/vendor": fileURLToPath(new URL("./vendor", import.meta.url)),
      "~/wails": fileURLToPath(new URL("./wailsjs", import.meta.url)),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
