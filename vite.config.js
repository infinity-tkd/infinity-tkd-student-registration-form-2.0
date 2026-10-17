import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { securityHeaders, securityPlugin } from "./build/security.mjs";
import { offlinePlugin } from "./build/offline.mjs";

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, ".", "VITE_");
  if (
    command === "build" &&
    (!env.VITE_GAS_WEB_APP_URL ||
      env.VITE_GAS_WEB_APP_URL.includes("YOUR_DEPLOYMENT_ID"))
  ) {
    throw new Error(
      "Set VITE_GAS_WEB_APP_URL to the deployed HTTPS registration endpoint before building. Use .env.local locally or the repository Actions variable for GitHub Pages.",
    );
  }
  const options = {
    development: command === "serve" && !isPreview,
    endpoint: env.VITE_GAS_WEB_APP_URL || "",
  };
  return {
    plugins: [react(), securityPlugin(options), offlinePlugin()],
    base: "./",
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react-vendor",
                test: /[\\/]node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              },
            ],
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      headers: securityHeaders({ ...options, development: true }),
    },
    preview: {
      host: "127.0.0.1",
      headers: securityHeaders({ ...options, development: false }),
    },
  };
});
