import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from '@tailwindcss/vite'
import Terminal from 'vite-plugin-terminal'

export default defineConfig({
  plugins: [
    react(), 
    cloudflare(), 
    tailwindcss(),
    Terminal({
      console: 'terminal',
      output: ['console', 'terminal'] 
    })
  ],
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  optimizeDeps: {
    include: ["react", "react-router"],
    exclude: ["agents"],
  },
  define: {
    global: "globalThis",
  },
});
