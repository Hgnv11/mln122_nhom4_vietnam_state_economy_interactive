import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["fpt.tokyo", "www.fpt.tokyo", ".fpt.tokyo"],
    hmr: {
      host: "fpt.tokyo",
      protocol: "wss",
      clientPort: 443
    }
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["fpt.tokyo", "www.fpt.tokyo", ".fpt.tokyo"]
  }
});
