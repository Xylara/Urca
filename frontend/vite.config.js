import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import ViteYaml from '@modyfi/vite-plugin-yaml'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteYaml(),
  ],
  server: {
    port: 7001,
    strictPort: true,
    host: true,
    allowedHosts: [
      '7001.hyghj.eu.org'
    ],
    proxy: {
      '/auth': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})