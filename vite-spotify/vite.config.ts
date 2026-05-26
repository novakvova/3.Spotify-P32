import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8434', changeOrigin: true },
      '/register': { target: 'http://localhost:8434', changeOrigin: true },
      '/login': {
        target: 'http://localhost:8434',
        changeOrigin: true,
        bypass: (req) => {
          if (req.method === 'GET') return req.url
        },
      },
      '/profile': { target: 'http://localhost:8434', changeOrigin: true },
      '/mp3songs': { target: 'http://localhost:8434', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8434', changeOrigin: true },
      '/api/search': { target: 'http://localhost:8434', changeOrigin: true },
    },
  },
})