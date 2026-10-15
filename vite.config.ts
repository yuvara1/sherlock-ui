import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "decimal.js-light": path.resolve(
          __dirname,
          "./node_modules/decimal.js-light/decimal.mjs",
        ),
      },
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      force: true,
      include: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom",
        "react-dom/client",
        "react-router",
        "react-router/dom",
        "@xyflow/react",
        "decimal.js-light",
        "recharts",
      ],
    },
    server: {
      host: "0.0.0.0",
      port: Number(process.env.PORT || 5173),
      strictPort: true,
      proxy: {
        "/api": {
          target: environment.API_GATEWAY_URL || "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: Number(process.env.PORT || 4173),
    },
  }
})
