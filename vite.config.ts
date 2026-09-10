import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_ORIGIN = env.VITE_API_BASE_URL
    ? new URL(env.VITE_API_BASE_URL).origin
    : 'http://localhost:3001'

  // GitHub Pages serves this as a project page at /atencion-domiciliaria-front/,
  // so asset URLs need that prefix in production. The dev server stays at "/".
  const base = mode === 'production' ? '/atencion-domiciliaria-front/' : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Registered manually via virtual:pwa-register/react (useAppUpdate)
        // instead of the auto-injected script. injectRegister:'auto' only
        // calls navigator.serviceWorker.register() — it never tells an
        // already-open tab that a new version installed, so the page keeps
        // running the old bundle (sometimes referencing code that no longer
        // exists) until someone clears the cache by hand. useAppUpdate polls
        // for updates and offers a reload as soon as one is found.
        injectRegister: false,
        // devOptions.enabled registers the service worker in `npm run dev` too.
        // vite-plugin-pwa marks this "experimental", and in practice the dev SW
        // (workbox generateSW + a cross-origin NetworkFirst route) starts
        // rejecting every GET to the backend origin a few seconds after it
        // activates and calls clientsClaim() — the exact same request succeeds
        // via curl and via fetch() before the SW takes control, so the failure
        // is inside the SW's own fetch handling, not the backend or CORS.
        // The production build (npm run build) is unaffected — this only
        // disables the SW while running the Vite dev server.
        devOptions: { enabled: false },
        includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Atención Domiciliaria',
          short_name: 'Atención Dom.',
          description: 'Coordinación de atención médica domiciliaria en tiempo real.',
          lang: 'es',
          start_url: `${base}overview`,
          scope: base,
          display: 'standalone',
          theme_color: '#0369a1',
          background_color: '#f8fafc',
          icons: [
            { src: `${base}pwa-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: `${base}pwa-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: `${base}pwa-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // App shell (JS/CSS/HTML) precached automatically by the plugin below.
          // Runtime caching only handles read (GET) API calls — mutations always
          // go through fetch directly so the offline queue in src/core/offline
          // can intercept network failures.
          //
          // IMPORTANT: generateSW mode serializes urlPattern functions via
          // .toString() into the emitted sw.js — any outer-scope variable
          // (like API_ORIGIN) becomes a dangling reference at runtime and the
          // route silently never matches. A RegExp has no closure, so the
          // origin must be baked in as a literal here.
          runtimeCaching: [
            {
              urlPattern: new RegExp(`^${API_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`),
              handler: 'NetworkFirst',
              method: 'GET',
              options: {
                cacheName: 'api-get-cache',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3003,
      // Backend CORS_ORIGINS (atencion-domiciliaria-backend/.env) only allows
      // localhost:3003/3004 — keep this pinned instead of Vite's 5173 default.
      watch: {
        // Force Vite to reload when Tailwind config changes
        ignored: ['!**/tailwind.config.js'],
      },
    },
  }
})
