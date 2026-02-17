<script setup lang="ts">
// HomeView: pantalla de entrada del diagnóstico
// Responsabilidad: mostrar DiagnosticoForm y navegar al dashboard al enviar
import { useRouter } from 'vue-router'
import type { UserProfile } from '@/types'
import { useUserInputsStore } from '@/stores/userInputs'
import DiagnosticoForm from '@/components/organisms/DiagnosticoForm.vue'

const router = useRouter()
const userInputsStore = useUserInputsStore()

function handleSubmit(profile: UserProfile) {
  userInputsStore.setProfile(profile)
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <main class="home-view">
    <div class="home-container">
      <!-- Hero -->
      <header class="home-hero">
        <h1 class="home-title">
          Tesorería <span class="home-title-accent">Simple</span>
        </h1>
        <p class="home-tagline">
          Gestión inteligente de inversiones. Sin complicaciones.
        </p>
      </header>

      <!-- Formulario de diagnóstico -->
      <DiagnosticoForm @submit="handleSubmit" />
    </div>
  </main>
</template>

<style scoped>
.home-view {
  @apply min-h-screen bg-bg-primary flex items-start justify-center px-4 py-12;
}

.home-container {
  @apply w-full max-w-2xl flex flex-col gap-10;
}

.home-hero {
  @apply text-center flex flex-col gap-3;
}

.home-title {
  @apply font-heading text-5xl font-extrabold text-text-primary;
}

.home-title-accent {
  @apply text-accent-growth;
}

.home-tagline {
  @apply font-body text-lg text-text-secondary;
}
</style>
