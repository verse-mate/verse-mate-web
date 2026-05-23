import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // The 18,100-entry _lemmas.json + ~1,189 lazy-loaded chapter chunks
    // make Vite's per-chunk gzip-size reporting blow past the default Node
    // heap during the "computing gzip size" phase. The report is purely
    // diagnostic — it doesn't change build output. Disabling cuts ~30s off
    // CI and eliminates the OOM. Cloudflare still gzips at the edge.
    reportCompressedSize: false,
  },
}));
