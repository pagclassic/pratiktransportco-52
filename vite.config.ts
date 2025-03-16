import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      external: ['fs', 'path', 'crypto'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('@tanstack/react-query')) {
              return 'vendor';
            }
            if (id.includes('zod') || id.includes('@hookform') || id.includes('react-hook-form')) {
              return 'form';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
          }
        }
      }
    },
    target: 'esnext',
    modulePreload: true,
    cssCodeSplit: true,
    minify: 'esbuild',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto'
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
    dedupe: ['zod', 'react', 'react-dom', 'react-hook-form'],
    mainFields: ['module', 'main', 'browser']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zod',
      '@hookform/resolvers/zod',
      'react-hook-form'
    ],
    exclude: ['fs', 'path', 'crypto'],
    esbuildOptions: {
      target: 'esnext',
      platform: 'browser',
      supported: {
        'top-level-await': true
      }
    }
  },
  plugins: [
    react({
      jsxImportSource: 'react'
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
    jsx: 'automatic',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'esnext',
    platform: 'browser',
    tsconfigRaw: {
      compilerOptions: {
        jsx: 'react-jsx',
        jsxImportSource: 'react',
        target: 'es2020',
        module: 'esnext',
        moduleResolution: 'node',
        allowJs: true,
        strict: false,
      }
    }
  },
}));
