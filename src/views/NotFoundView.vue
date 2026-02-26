<script setup lang="ts">
// NotFoundView: página 404
// Responsabilidad: informar al usuario que la ruta no existe
import { useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
</script>

<template>
  <main class="not-found-view">
    <div class="not-found-container">
      <span class="not-found-code">404</span>
      <h1 class="not-found-title">Página no encontrada</h1>
      <p class="not-found-desc">La ruta que buscas no existe o fue movida.</p>
      <BaseButton variant="primary" @click="router.push({ name: 'login' })">
        Volver al inicio
      </BaseButton>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

.not-found-view {
  @apply min-h-screen bg-bg-primary flex items-center justify-center px-4;
}

.not-found-container {
  @apply flex flex-col items-center text-center gap-4;
}

.not-found-code {
  @apply font-heading text-7xl font-extrabold text-white/10;
}

.not-found-title {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.not-found-desc {
  @apply font-body text-[15px] text-text-secondary mb-4;
}
</style>
