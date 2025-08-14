import { defineConfig } from 'vite';
import angular from '@angular-devkit/build-angular/plugins/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    angular()
  ],
  server: {
    port: 4200,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('❌ Erreur proxy Vite:', err);
            if (!res.headersSent) {
              res.writeHead(500, {'Content-Type': 'application/json'});
            }
            res.end(JSON.stringify({error: 'Proxy Error', details: err.message}));
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📡 Requête proxy:', req.method, req.url, '->', proxyReq.path);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Réponse proxy:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
