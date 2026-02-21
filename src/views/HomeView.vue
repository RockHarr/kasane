<script setup lang="ts">
// HomeView: pantalla de entrada del diagnóstico
// Responsabilidad: mostrar DiagnosticoForm y navegar al dashboard al enviar
import { useRouter } from 'vue-router'
import type { UserProfile } from '@/types'
import { useUserInputsStore } from '@/stores/userInputs'
import { useAuthStore } from '@/stores/auth'
import DiagnosticoForm from '@/components/organisms/DiagnosticoForm.vue'

const router = useRouter()
const userInputsStore = useUserInputsStore()
const authStore = useAuthStore()

function handleSubmit(profile: UserProfile) {
  userInputsStore.setProfile(profile)
  router.push({ name: 'dashboard' })
}

async function handleLogout() {
  await authStore.signOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <main class="home-view">
    <div class="home-container">
      <!-- Nav -->
      <nav class="home-nav">
        <span class="home-nav-brand">Kas<span class="home-nav-accent">ane</span></span>
        <button class="home-nav-logout" @click="handleLogout" aria-label="Cerrar sesión">
          Salir
        </button>
      </nav>

      <!-- Hero -->
      <header class="home-hero">
        <h1 class="home-title">
          Kas<span class="home-title-accent">ane</span>
        </h1>
        <p class="home-tagline">
          Tu tranquilidad financiera, capa a capa.
        </p>
      </header>

      <!-- Formulario de diagnóstico -->
      <DiagnosticoForm @submit="handleSubmit" />
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

.home-view {
  @apply min-h-screen bg-bg-primary flex items-start justify-center px-4 py-12;
}

.home-container {
  @apply w-full max-w-2xl flex flex-col gap-10;
}

.home-nav {
  @apply flex items-center justify-between;
}

.home-nav-brand {
  @apply font-heading text-xl font-bold text-text-primary;
}

.home-nav-accent {
  @apply text-accent-growth;
}

.home-nav-logout {
  @apply font-body text-sm text-text-secondary hover:text-accent-alert transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded px-2 py-1;
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
