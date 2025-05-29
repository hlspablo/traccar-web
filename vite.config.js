import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

/* eslint-disable no-template-curly-in-string */
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    // Only use proxy in development
    ...(mode === 'development' && {
      proxy: {
        '/api/socket': 'ws://coragemserver.top',
        '/api': 'http://coragemserver.top',
        '/asaas-proxy': {
          target: 'https://api.asaas.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/asaas-proxy/, ''),
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              if (proxyRes.headers['set-cookie']) {
                const cookies = proxyRes.headers['set-cookie'].map((cookie) => {
                  if (cookie.startsWith('JSESSIONID=') || cookie.startsWith('AWSALBTG=') || cookie.startsWith('AWSALBTGCORS=')) {
                    // Modify the cookie to expire it immediately or change its path/domain
                    // Simplest: just don't pass it along, or return an expired cookie
                    // To effectively remove it, we can try to set it to expire in the past.
                    // However, http-proxy might not allow direct removal.
                    // A common tactic is to overwrite it with an expired one.
                    // For now, let's log and see if we can prevent it.
                    console.log(`[Vite Proxy] ASaaS tried to set cookie: ${cookie}`);
                    // To effectively block it, we might need to remove it from the array
                    // or return a modified cookie that's benign.
                    // This part is tricky with http-proxy's direct manipulation.
                    // A more robust way is to use a more powerful proxy or a custom middleware if Vite's built-in is limited.
                    return cookie.replace(/Path=\//g, 'Path=/asaas-specific-path'); // Try to isolate path
                  }
                  return cookie;
                });
                // Filter out nulls if any cookies were meant to be removed
                // proxyRes.headers['set-cookie'] = cookies.filter(c => c);
                proxyRes.headers['set-cookie'] = cookies; // For now, just try path rewrite
                console.log('[Vite Proxy] Modified ASaaS Set-Cookie headers:', proxyRes.headers['set-cookie']);
              }
            });
          },
        },
      },
    }),
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,woff,woff2,mp3}'],
      },
      manifest: {
        short_name: 'Coragem Rastro',
        name: 'Coragem Rastro',
        theme_color: '#000',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
}));
