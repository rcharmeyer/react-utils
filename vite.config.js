import { resolve } from "path"

import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve (__dirname, "./src/index.tsx"),
      fileName: "index",
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: ["react"],
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
