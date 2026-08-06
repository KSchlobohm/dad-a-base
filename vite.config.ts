import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/dad-a-base/'

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      filename: 'service-worker.js',
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'icon.svg',
        'icon-192.png',
        'icon-512.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'Dad-A-Base',
        short_name: 'Dad-A-Base',
        description: 'A tap-to-reveal collection of dad jokes.',
        theme_color: '#5a3e2b',
        background_color: '#fdf6e3',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
