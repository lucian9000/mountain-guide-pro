import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Broken packages: their ESM/MJS files were truncated or missing due to
// interrupted npm installs. Each alias points to a complete working build
// (CJS or browser bundle) that survived the intact install.
const nm = path.resolve(__dirname, "./node_modules");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.SUPABASE_URL || env.VITE_SUPABASE_URL || ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ""),
    },
    plugins: [react()].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "data-vendor": ["@tanstack/react-query", "@supabase/supabase-js"],
          },
        },
      },
    },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "tailwind-merge":        `${nm}/tailwind-merge/dist/bundle-cjs.js`,
      "@floating-ui/core":     `${nm}/@floating-ui/core/dist/floating-ui.core.esm.js`,
      "@floating-ui/dom":      `${nm}/@floating-ui/dom/dist/floating-ui.dom.browser.mjs`,
      "sonner":                `${nm}/sonner/dist/index.js`,
      "react-hook-form":       `${nm}/react-hook-form/dist/index.cjs.js`,
      "@radix-ui/react-select":`${nm}/@radix-ui/react-select/dist/index.js`,
      "@radix-ui/react-menu":  `${nm}/@radix-ui/react-menu/dist/index.js`,
      "@radix-ui/react-navigation-menu": `${nm}/@radix-ui/react-navigation-menu/dist/index.js`,
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
      "@radix-ui/react-menu",
      "@radix-ui/react-navigation-menu",
    ],
    // ESM-aliased packages — already valid ESM, skip the optimizer
    exclude: [
      "@floating-ui/core",
      "@floating-ui/dom",
    ],
    force: true,
  },
  };
});
