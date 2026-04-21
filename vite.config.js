import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const TUNNEL_HOSTS = ["fpt.tokyo", "www.fpt.tokyo", ".fpt.tokyo"];

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: TUNNEL_HOSTS,
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: TUNNEL_HOSTS,
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
