<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import BaseCard from '@/components/atoms/BaseCard.vue'
import type { SimulationRecord } from '@/services/firestore'

const props = defineProps<{
  record: SimulationRecord
  deletingId?: string | null
}>()

const emit = defineEmits(['delete'])

const isDeleting = computed(() => props.deletingId === props.record.id)

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

function handleDelete() {
  if (props.record.id && !isDeleting.value) {
    emit('delete', props.record.id)
  }
}
</script>

<template>
  <BaseCard variant="elevated" padding="md" class="simulation-card">
    <!-- Fecha y acciones -->
    <div class="sim-header">
      <time class="sim-date">{{ formatDate(record) }}</time>
      <button
        class="sim-delete group"
        :disabled="isDeleting"
        :aria-label="`Eliminar simulación del ${formatDate(record)}`"
        @click="handleDelete"
      >
        <span v-if="isDeleting" class="loading-dot" aria-hidden="true">...</span>
        <Trash2 v-else class="w-4 h-4" aria-hidden="true" />
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
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

/* Card de simulación */
.simulation-card {
  @apply transition-all duration-200 hover:border-white/10;
}

.sim-header {
  @apply flex items-center justify-between mb-3;
}

.sim-date {
  @apply font-body text-xs font-medium text-text-muted;
}

.sim-delete {
  @apply w-7 h-7 flex items-center justify-center rounded-md;
  @apply text-text-muted hover:text-accent-alert hover:bg-accent-alert/10;
  @apply transition-all duration-200;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert;
}

.sim-delete:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.loading-dot {
  @apply animate-pulse font-mono text-xs;
}

/* Métricas */
.sim-metrics {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4;
}

.sim-metric {
  @apply flex flex-col gap-1;
}

.sim-metric-label {
  @apply font-body text-[11px] font-semibold text-text-muted uppercase tracking-widest;
}

.sim-metric-value {
  @apply font-mono text-lg font-bold text-text-primary tracking-tight;
}

.sim-metric-value--growth {
  @apply text-accent-growth;
}

/* Parámetros */
.sim-params {
  @apply flex flex-wrap gap-2 pt-4 border-t border-white/5;
}

.sim-param {
  @apply font-mono text-xs text-text-secondary bg-white/5 rounded-md px-2.5 py-1.5 border border-white/5;
}
</style>
