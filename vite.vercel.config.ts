import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// Standalone SPA build for Vercel.
// Intentionally avoids autoCodeSplitting and manualChunks — TanStack Router's
// auto code-splitter expects a Start-generated manifest at runtime, which a
// plain SPA build cannot provide and which caused production hangs.
export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist/vercel",
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
    minify: "esbuild",
    cssCodeSplit: true,
    rollupOptions: {
      input: "index.vercel.html",
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
