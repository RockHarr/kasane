<script setup lang="ts">
// SimulationsView: historial de simulaciones guardadas
// Responsabilidad: mostrar, comparar y eliminar simulaciones pasadas
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useSimulationsStore } from '@/stores/simulations'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseLoader from '@/components/atoms/BaseLoader.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import SimulationCard from '@/components/organisms/SimulationCard.vue'
import KasaneLogo from '@/components/atoms/KasaneLogo.vue'

const router = useRouter()
const authStore = useAuthStore()
const simulationsStore = useSimulationsStore()

const deleting = ref<string | null>(null)

onMounted(async () => {
  if (authStore.user) {
    await simulationsStore.fetch(authStore.user.uid)
  }
})

async function handleDelete(id: string) {
  if (!authStore.user) return
  deleting.value = id
  try {
    await simulationsStore.remove(authStore.user.uid, id)
  } finally {
    deleting.value = null
  }
}

function goBack() {
  router.push({ name: 'simulator' })
}

async function handleLogout() {
  await authStore.signOut()
  router.replace({ name: 'landing' })
}
</script>

<template>
  <main class="simulations-view">
    <div class="simulations-container">
      <!-- Nav -->
      <nav class="simulations-nav">
        <button class="nav-back" aria-label="Volver al simulador" @click="goBack">
          ← Simulador
        </button>
        <div class="nav-right">
          <KasaneLogo size="sm" class="scale-75" />
          <button class="nav-logout" aria-label="Cerrar sesión" @click="handleLogout">Salir</button>
        </div>
      </nav>

      <!-- Header -->
      <header class="simulations-header">
        <h1 class="simulations-title">Mis Simulaciones</h1>
        <p class="simulations-subtitle">Historial de tus proyecciones financieras guardadas.</p>
      </header>

      <!-- Loading -->
      <div v-if="simulationsStore.loading" class="simulations-loading">
        <div class="animation-fade-in text-center flex flex-col items-center gap-4">
          <BaseLoader size="lg" label="Cargando simulaciones..." />
        </div>
      </div>

      <!-- Error -->
      <BaseCard v-else-if="simulationsStore.error" variant="elevated" padding="lg">
        <p class="error-text">{{ simulationsStore.error }}</p>
        <BaseButton
          variant="secondary"
          class="mt-4"
          @click="authStore.user && simulationsStore.fetch(authStore.user.uid)"
        >
          Reintentar
        </BaseButton>
      </BaseCard>

      <!-- Empty state -->
      <BaseCard v-else-if="simulationsStore.records.length === 0" variant="elevated" padding="lg">
        <div class="empty-state">
          <div class="empty-icon-wrapper">
            <BarChart3 class="w-10 h-10 text-white/20" aria-hidden="true" />
          </div>
          <p class="empty-title">Aún no tienes simulaciones guardadas</p>
          <p class="empty-desc">Crea tu diagnóstico y asegúrate de guardar la simulación ideal.</p>
          <BaseButton variant="primary" @click="router.push({ name: 'dashboard' })">
            Ir al diagnóstico
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Lista de simulaciones -->
      <div v-else class="simulations-list">
        <div class="simulations-grid">
          <SimulationCard
            v-for="record in simulationsStore.records"
            :key="record.id"
            :record="record"
            :deleting-id="deleting"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Conteo -->
      <p
        v-if="!simulationsStore.loading && simulationsStore.records.length > 0"
        class="simulations-count"
      >
        {{ simulationsStore.records.length }} simulación{{
          simulationsStore.records.length !== 1 ? 'es' : ''
        }}
        guardada{{ simulationsStore.records.length !== 1 ? 's' : '' }}
      </p>
    </div>
  </main>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../tailwind.config.js";

.simulations-view {
  @apply min-h-screen bg-bg-primary px-4 py-8 md:py-12;
}

.simulations-container {
  @apply max-w-4xl mx-auto flex flex-col gap-8;
}

/* Nav */
.simulations-nav {
  @apply flex items-center justify-between pb-4 border-b border-white/5;
}

.nav-back {
  @apply font-body font-medium text-sm text-text-secondary hover:text-text-primary transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/20 rounded-md px-2 py-1 -ml-2;
}

.nav-right {
  @apply flex items-center gap-4;
}

.nav-brand {
  @apply font-heading font-semibold text-text-muted;
}

.nav-logout {
  @apply font-body font-medium text-sm text-text-muted hover:text-accent-alert transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert rounded-md px-2 py-1 -mr-2;
}

/* Header */
.simulations-header {
  @apply flex flex-col gap-2;
}

.simulations-title {
  @apply font-heading text-3xl font-bold text-text-primary tracking-tight;
}

.simulations-subtitle {
  @apply font-body text-[15px] text-text-secondary;
}

/* Loading */
.simulations-loading {
  @apply flex items-center justify-center py-24 min-h-[40vh];
}

.animation-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty state */
.empty-state {
  @apply flex flex-col items-center justify-center gap-4 py-12 text-center min-h-[40vh];
}

.empty-icon-wrapper {
  @apply w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2;
}

.empty-title {
  @apply font-heading text-xl font-bold text-text-primary;
}

.empty-desc {
  @apply font-body text-[15px] text-text-secondary max-w-sm mb-4;
}

/* Error */
.error-text {
  @apply font-body text-sm font-medium text-accent-alert;
}

/* Lista / Grilla */
.simulations-list {
  @apply flex flex-col w-full;
}

.simulations-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-5;
}

/* Conteo */
.simulations-count {
  @apply font-body font-medium text-xs text-text-muted text-center pt-8 border-t border-white/5;
}
</style>
