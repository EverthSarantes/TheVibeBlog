import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Dev-server middleware: redirect /Blog (no trailing slash) to /Blog/
function redirectBasePlugin() {
  return {
    name: "redirect-base",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const base = "/Blog";
        if (req.url === base || req.url === base.toLowerCase()) {
          res.statusCode = 302;
          res.setHeader("Location", base + "/");
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH || "/Blog/";
  return {
    plugins: [react(), redirectBasePlugin()],
    base,
    build: { outDir: "dist" },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      css: true,
    },
  };
});