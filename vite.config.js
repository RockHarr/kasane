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
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true, // CSS por chunk — evita bloquear render con un CSS gigante
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          apexcharts: ['apexcharts', 'vue3-apexcharts'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          vendor: ['vue', 'vue-router', 'pinia'],
          lucide: ['lucide-vue-next'],  // ~500kb — chunk independiente
          ogl: ['ogl'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
