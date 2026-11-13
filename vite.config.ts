/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import vercel from './vercel.json' with { type: 'json' }

// `npm run preview` applique les mêmes en-têtes de sécurité que Vercel, pour tester la CSP en local.
const securityHeaders = Object.fromEntries(vercel.headers[0].headers.map((h) => [h.key, h.value]))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { headers: securityHeaders },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
