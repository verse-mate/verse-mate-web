import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function workerBinaryModules(): Plugin {
  return {
    name: "worker-binary-modules",
    enforce: "pre",
    load(id) {
      const file = id.split("?")[0];
      const read = `import { readFileSync } from "node:fs"; const bytes = readFileSync(${JSON.stringify(file)});`;
      if (file.endsWith(".wasm")) return `${read} export default new WebAssembly.Module(bytes);`;
      if (file.endsWith(".ttf")) return `${read} export default bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);`;
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), workerBinaryModules()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.test.ts"],
    server: { deps: { inline: ["workers-og"] } },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
