import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    }),
    {
      name: 'copy-dashboard',
      closeBundle() {
        // Copiar dashboard.html para dist/
        try {
          copyFileSync('public/dashboard.html', 'dist/dashboard.html');
          console.log('✅ dashboard.html copiado para dist/');
        } catch (e) {
          console.log('⚠️ Erro ao copiar dashboard.html:', e);
        }
      }
    }
  ]
})
