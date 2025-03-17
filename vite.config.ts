import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

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
      external: ['fs', 'path', 'crypto', 'stream', 'http', 'https', 'url', 'zlib'],
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
          'form': ['zod', '@hookform/resolvers/zod', 'react-hook-form'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-slot']
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
      requireReturnsDefault: 'auto',
      esmExternals: true
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "stream": "stream-browserify",
      "http": "stream-http",
      "https": "https-browserify",
      "url": "url",
      "zlib": "browserify-zlib"
    },
    dedupe: ['zod', 'react', 'react-dom', 'react-hook-form'],
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
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
    exclude: ['fs', 'path', 'crypto', 'stream', 'http', 'https', 'url', 'zlib'],
    esbuildOptions: {
      target: 'esnext',
      platform: 'browser',
      supported: {
        'top-level-await': true
      },
      mainFields: ['module', 'main'],
      resolveExtensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      format: 'esm',
      loader: {
        '.js': 'jsx'
      }
    }
  },
  plugins: [
    react({
      jsxImportSource: 'react'
    }),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Transport Portal',
        short_name: 'Transport',
        description: 'Transport management and tracking application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean)
}));
