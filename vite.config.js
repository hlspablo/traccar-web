import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

/* eslint-disable no-template-curly-in-string */
export default defineConfig(() => ({
  server: {
    port: 3000,
    proxy: {
      '/api/socket': 'ws://coragemserver.top',
      '/api': 'http://coragemserver.top',
      '/asaas-proxy': {
        target: 'https://api-sandbox.asaas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/asaas-proxy/, ''),
      },
    },
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    svgr(),
    react(),
  ],
}));
