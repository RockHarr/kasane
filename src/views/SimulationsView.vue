<script setup lang="ts">
// SimulationsView: historial de simulaciones guardadas
// Responsabilidad: mostrar, comparar y eliminar simulaciones pasadas
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSimulationsStore } from '@/stores/simulations'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseLoader from '@/components/atoms/BaseLoader.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import type { SimulationRecord } from '@/services/firestore'

const router = useRouter()
const authStore = useAuthStore()
const simulationsStore = useSimulationsStore()

const deleting = ref<string | null>(null)

onMounted(async () => {
  if (authStore.user) {
    await simulationsStore.fetch(authStore.user.uid)
  }
})

function formatDate(record: SimulationRecord): string {
  if (!record.createdAt) return 'Sin fecha'
  const date = record.createdAt.toDate()
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function allocationLabel(record: SimulationRecord): string {
  const a = record.allocation
  const parts: string[] = []
  if (a.bonds > 0) parts.push(`${Math.round(a.bonds * 100)}% Bonos`)
  if (a.dividends > 0) parts.push(`${Math.round(a.dividends * 100)}% Div`)
  if (a.stocks > 0) parts.push(`${Math.round(a.stocks * 100)}% Acc`)
  return parts.join(' · ')
}

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
  router.replace({ name: 'login' })
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
          <span class="nav-brand">Kasane</span>
          <button class="nav-logout" aria-label="Cerrar sesión" @click="handleLogout">Salir</button>
        </div>
      </nav>

      <!-- Header -->
      <header class="simulations-header">
        <h1 class="simulations-title">Mis Simulaciones</h1>
        <p class="simulations-subtitle">Historial de tus proyecciones guardadas</p>
      </header>

      <!-- Loading -->
      <div v-if="simulationsStore.loading" class="simulations-loading">
        <BaseLoader size="lg" label="Cargando simulaciones..." />
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
          <span class="empty-icon" aria-hidden="true">📊</span>
          <p class="empty-title">Aún no tienes simulaciones guardadas</p>
          <p class="empty-desc">Crea un diagnóstico y guarda tu simulación para verla aquí</p>
          <BaseButton variant="primary" @click="router.push({ name: 'home' })">
            Ir al diagnóstico
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Lista de simulaciones -->
      <div v-else class="simulations-list">
        <BaseCard
          v-for="record in simulationsStore.records"
          :key="record.id"
          variant="elevated"
          padding="md"
          class="simulation-card"
        >
          <!-- Fecha y acciones -->
          <div class="sim-header">
            <time class="sim-date">{{ formatDate(record) }}</time>
            <button
              class="sim-delete"
              :disabled="deleting === record.id"
              :aria-label="`Eliminar simulación del ${formatDate(record)}`"
              @click="handleDelete(record.id!)"
            >
              {{ deleting === record.id ? '...' : '✕' }}
            </button>
          </div>

          <!-- Métricas principales -->
          <div class="sim-metrics">
            <div class="sim-metric">
              <span class="sim-metric-label">Valor final</span>
              <span class="sim-metric-value sim-metric-value--growth">
                ${{ record.resultado?.valorFinal?.toLocaleString('es-CL') ?? '—' }}
              </span>
            </div>
            <div class="sim-metric">
              <span class="sim-metric-label">Ganancia</span>
              <span class="sim-metric-value sim-metric-value--growth">
                +${{ record.resultado?.ganancia?.toLocaleString('es-CL') ?? '—' }}
              </span>
            </div>
            <div class="sim-metric">
              <span class="sim-metric-label">Rentabilidad</span>
              <span class="sim-metric-value sim-metric-value--growth">
                {{ record.resultado?.rentabilidadTotal?.toFixed(1) ?? '—' }}%
              </span>
            </div>
          </div>

          <!-- Parámetros -->
          <div class="sim-params">
            <span class="sim-param">
              Capital: ${{ record.profile.excedente.toLocaleString('es-CL') }}
            </span>
            <span class="sim-param">
              Aporte: ${{ record.profile.aporteMensual.toLocaleString('es-CL') }}/mes
            </span>
            <span class="sim-param"> Horizonte: {{ record.profile.horizonte }} meses </span>
            <span class="sim-param">
              {{ allocationLabel(record) }}
            </span>
          </div>
        </BaseCard>
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

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

.simulations-view {
  @apply min-h-screen bg-bg-primary px-4 py-8;
}

.simulations-container {
  @apply max-w-3xl mx-auto flex flex-col gap-6;
}

/* Nav */
.simulations-nav {
  @apply flex items-center justify-between;
}

.nav-back {
  @apply font-body text-sm text-text-secondary hover:text-accent-growth transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded;
}

.nav-right {
  @apply flex items-center gap-4;
}

.nav-brand {
  @apply font-heading text-sm font-semibold text-text-muted;
}

.nav-logout {
  @apply font-body text-xs text-text-muted hover:text-accent-alert transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert rounded;
}

/* Header */
.simulations-header {
  @apply flex flex-col gap-1;
}

.simulations-title {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.simulations-subtitle {
  @apply font-body text-sm text-text-secondary;
}

/* Loading */
.simulations-loading {
  @apply flex items-center justify-center py-24;
}

/* Empty state */
.empty-state {
  @apply flex flex-col items-center gap-3 py-6 text-center;
}

.empty-icon {
  @apply text-4xl;
}

.empty-title {
  @apply font-heading text-lg font-semibold text-text-primary;
}

.empty-desc {
  @apply font-body text-sm text-text-muted max-w-xs;
}

/* Error */
.error-text {
  @apply font-body text-sm text-accent-alert;
}

/* Lista */
.simulations-list {
  @apply flex flex-col gap-4;
}

/* Card de simulación */
.simulation-card {
  @apply transition-all duration-200 hover:border-white/10;
}

.sim-header {
  @apply flex items-center justify-between mb-3;
}

.sim-date {
  @apply font-body text-xs text-text-muted;
}

.sim-delete {
  @apply w-6 h-6 flex items-center justify-center rounded;
  @apply font-mono text-xs text-text-muted hover:text-accent-alert hover:bg-accent-alert/10;
  @apply transition-colors duration-150;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert;
}

.sim-delete:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Métricas */
.sim-metrics {
  @apply grid grid-cols-3 gap-3 mb-3;
}

.sim-metric {
  @apply flex flex-col gap-0.5;
}

.sim-metric-label {
  @apply font-body text-xs text-text-muted uppercase tracking-wider;
}

.sim-metric-value {
  @apply font-mono text-lg font-bold text-text-primary;
}

.sim-metric-value--growth {
  @apply text-accent-growth;
}

/* Parámetros */
.sim-params {
  @apply flex flex-wrap gap-2 pt-3 border-t border-white/5;
}

.sim-param {
  @apply font-mono text-xs text-text-secondary bg-white/5 rounded px-2 py-1;
}

/* Conteo */
.simulations-count {
  @apply font-body text-xs text-text-muted text-center;
}
</style>
