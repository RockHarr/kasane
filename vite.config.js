import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false, // Desactivar sourcemaps en producción
    chunkSizeWarningLimit: 600, // Aumentar límite para chunks grandes (apexcharts, firebase)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          apexcharts: ['apexcharts', 'vue3-apexcharts'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          vendor: ['vue', 'vue-router', 'pinia'],
          ogl: ['ogl'], // DarkVeil (WebGL) — solo LandingView, chunk independiente
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
