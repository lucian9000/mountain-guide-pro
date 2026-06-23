import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Broken packages: their ESM/MJS files were truncated or missing due to
// interrupted npm installs. Each alias points to a complete working build
// (CJS or browser bundle) that survived the install intact.
const nm = path.resolve(__dirname, "./node_modules");

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "tailwind-merge":        `${nm}/tailwind-merge/dist/bundle-cjs.js`,
      "@floating-ui/core":     `${nm}/@floating-ui/core/dist/floating-ui.core.esm.js`,
      "@floating-ui/dom":      `${nm}/@floating-ui/dom/dist/floating-ui.dom.browser.mjs`,
      "sonner":                `${nm}/sonner/dist/index.js`,
      "react-hook-form":       `${nm}/react-hook-form/dist/index.cjs.js`,
      "@radix-ui/react-select":`${nm}/@radix-ui/react-select/dist/index.js`,
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-dev-runtime",
      "react-dom/client",
      // CJS-aliased packages — Vite must pre-bundle these to get named ESM exports
      "tailwind-merge",
      "sonner",
      "react-hook-form",
      "@radix-ui/react-select",
    ],
    // ESM-aliased packages — already valid ESM, skip the optimizer
    exclude: [
      "@floating-ui/core",
      "@floating-ui/dom",
    ],
    force: true,
  },
}));
