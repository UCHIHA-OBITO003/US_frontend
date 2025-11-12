import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['heart.svg', 'robots.txt'],
      manifest: {
        name: 'Private Chat App',
        short_name: 'Chat',
        description: 'Private messaging app for couples',
        theme_color: '#FFB6D9',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'heart.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: process.env.VITE_SOCKET_URL || 'http://localhost:5000',
        ws: true
      }
    }
  }
});

