import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadConfigFromFile, mergeConfig, type ViteDevServer } from "vite";

const app = fileURLToPath(new URL(".", import.meta.url));
const base = process.env.PROTOTYPE_BASE_URL?.replace(/\/+$/, "");

export default defineConfig(async (env) => {
  const own = await loadConfigFromFile(env, undefined, app);
  return mergeConfig(own?.config ?? {}, {
    root: resolve(app, "src/prototype/harness"),
    base: base ? `${base}/` : "/",
    publicDir: resolve(app, "public"),
    envDir: app,
    build: { emptyOutDir: true },
    plugins: [
      {
        name: "prototype-pages",
        configureServer: (server: ViteDevServer) => {
          server.watcher.add(resolve(app, "src/prototype-pages"));
        },
      },
    ],
  });
});
