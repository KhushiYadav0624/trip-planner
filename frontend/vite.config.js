import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Frontend calls "/api/..." and Vite forwards it to the Express
      // backend in dev, so the browser never needs to know the backend's
      // host/port (and never sees an API key).
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
