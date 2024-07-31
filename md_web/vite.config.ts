import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  eslint: {
    enabled: false,
  },
  server: {
    host: true,
    proxy: {
      "/xkx": {
        target: "http://123.57.91.8:81/",
        // target: "http://localhost:1125/",
        changeOrigin: true,
        // rewrite: (path) => {
        //   return path.replace(/\/xkx/, "/api");
        // },
      },
    },
  },
});
