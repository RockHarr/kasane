<script setup lang="ts">
// NotFoundView: página 404
// Responsabilidad: informar al usuario que la ruta no existe y redirigir asistiéndolo
import { useRouter } from 'vue-router'
import { Map } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleGoBack() {
  if (authStore.user) {
    router.push({ name: 'dashboard' })
  } else {
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <main class="not-found-view" aria-labelledby="not-found-title">
    <div class="not-found-container text-center">
      <div class="icon-wrapper" aria-hidden="true">
        <Map class="w-12 h-12 text-white/20" />
      </div>

      <span class="not-found-code">404</span>
      <h1 id="not-found-title" class="not-found-title">Página no encontrada</h1>

      <p class="not-found-desc">La ruta que buscas no existe o fue movida.</p>

      <div class="actions">
        <BaseButton variant="primary" @click="handleGoBack">
          {{ authStore.user ? 'Ir al Dashboard' : 'Volver al Inicio' }}
        </BaseButton>
      </div>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

.not-found-view {
  @apply min-h-screen bg-bg-primary flex items-center justify-center px-6 py-12;
}

.not-found-container {
  @apply flex flex-col items-center max-w-md w-full;
}

.icon-wrapper {
  @apply w-24 h-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6;
  @apply shadow-xl shadow-black/20;
}

.not-found-code {
  @apply font-mono text-[100px] leading-none font-bold text-white/5 select-none -mb-4 tracking-tighter;
}

.not-found-title {
  @apply font-heading text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-3;
}

.not-found-desc {
  @apply font-body text-[15px] sm:text-base text-text-secondary mb-8;
}

.actions {
  @apply flex items-center justify-center gap-4 w-full;
}
</style>
