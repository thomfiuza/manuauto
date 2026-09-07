import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/**
 * Na Vercel (builds com a variável VERCEL definida) o Nitro entra com o preset
 * "vercel" e compila o app para Vercel Functions — detecção automática.
 * Fora da Vercel mantemos o build Node padrão (dist/server/server.js),
 * usado em desenvolvimento, CI e em hosts Node (Render, Railway, VPS).
 */
const isVercel = Boolean(process.env.VERCEL)

export default defineConfig({
  server: { host: '0.0.0.0', port: 3000, allowedHosts: true },
  plugins: [tanstackStart(), ...(isVercel ? [nitro()] : []), viteReact()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
