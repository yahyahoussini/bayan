import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react-helmet-async',
      '@tanstack/react-query',
      'sonner',
      'next-themes',
      'lucide-react',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-toast',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    // Enable minification (using esbuild which is faster and included by default)
    minify: 'esbuild',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional, can disable for smaller builds)
    sourcemap: true,
  },
}));
