import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from "url";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import nodePolyfills2 from 'rollup-plugin-polyfill-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      plugins: [
        nodePolyfills2()
      ],
      external: ['fs', 'path', 'crypto', 'stream', 'http', 'https', 'url', 'zlib'],
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query"
          ],
          form: ["react-hook-form"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-slot",
            "@radix-ui/react-select",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-react"
          ],
          utils: [
            "date-fns"
          ],
          pdf: ["jspdf", "jspdf-autotable"]
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
      requireReturnsDefault: true,
      esmExternals: false
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: 'stream-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      url: 'url',
      zlib: 'browserify-zlib',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      util: 'util',
      process: 'process/browser',
      events: 'events',
      assert: 'assert',
      querystring: 'querystring-es3',
      punycode: 'punycode',
      os: 'os-browserify/browser',
      constants: 'constants-browserify',
      timers: 'timers-browserify',
      tty: 'tty-browserify',
      vm: 'vm-browserify',
      domain: 'domain-browser',
      fs: 'browserify-fs'
    }
  },
  optimizeDeps: {
    include: [
      'stream-browserify',
      'buffer',
      'process/browser',
      'util',
      'browserify-fs'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'empty-fs',
          setup(build) {
            build.onResolve({ filter: /^fs$/ }, () => {
              return { path: 'empty:fs', external: true }
            })
          }
        }
      ]
    }
  },
  plugins: [
    react({
      jsxImportSource: 'react'
    }),
    mode === 'development' && componentTagger(),
    nodePolyfills({
      include: ['stream', 'util', 'buffer', 'process', 'fs'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      overrides: {
        stream: 'stream-browserify',
        fs: 'browserify-fs'
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Pratik Transport Portal',
        short_name: 'Transport',
        description: 'Transport management and tracking application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg}'],
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
  ].filter(Boolean),
  define: {
    'process.env': {},
    global: {},
    'process.version': '"v16.0.0"',
    'process.platform': '"browser"',
    'process.browser': true,
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
