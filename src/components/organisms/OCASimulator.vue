<script setup lang="ts">
// OCASimulator: simulador de Dollar Cost Averaging
// Responsabilidad: recibir perfil + asignación, correr simulación y mostrar resultados
import { computed } from 'vue'
import type { UserProfile, PortfolioAllocation } from '@/types'
import { simularPortafolio, calcularTasaPortafolio, TASAS_ESTIMADAS } from '@/services/calculations'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseBadge from '@/components/atoms/BaseBadge.vue'
import MetricDisplay from '@/components/molecules/MetricDisplay.vue'

interface Props {
  profile: UserProfile
  allocation: PortfolioAllocation
}

const props = defineProps<Props>()

const resultado = computed(() => simularPortafolio(props.profile, props.allocation))
const tasaAnual = computed(() => calcularTasaPortafolio(props.allocation))
const tasaPct = computed(() => `${(tasaAnual.value * 100).toFixed(1)}%`)

const trend = computed(() => resultado.value.ganancia > 0 ? 'up' : 'neutral')

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Años y meses para mostrar el horizonte de forma legible
const horizonteLabel = computed(() => {
  const meses = props.profile.horizonte
  const años = Math.floor(meses / 12)
  const mesesRestantes = meses % 12
  if (años === 0) return `${meses} meses`
  if (mesesRestantes === 0) return `${años} año${años > 1 ? 's' : ''}`
  return `${años} año${años > 1 ? 's' : ''} y ${mesesRestantes} mes${mesesRestantes > 1 ? 'es' : ''}`
})

// Distribución del portafolio para mostrar
const distribucion = computed(() => [
  { label: 'Bonos', pct: props.allocation.bonds, tasa: TASAS_ESTIMADAS.bonds, variant: 'neutral' as const },
  { label: 'Dividendos', pct: props.allocation.dividends, tasa: TASAS_ESTIMADAS.dividends, variant: 'growth' as const },
  { label: 'Acciones', pct: props.allocation.stocks, tasa: TASAS_ESTIMADAS.stocks, variant: 'alert' as const },
])
</script>

<template>
  <section class="simulator" aria-label="Simulación DCA">
    <header class="simulator-header">
      <h2 class="simulator-title">Simulación DCA</h2>
      <div class="simulator-meta">
        <BaseBadge variant="neutral" size="sm">{{ horizonteLabel }}</BaseBadge>
        <BaseBadge variant="growth" size="sm">{{ tasaPct }} anual esperado</BaseBadge>
      </div>
    </header>

    <!-- Métricas principales -->
    <div class="metrics-grid">
      <BaseCard variant="elevated" padding="md">
        <MetricDisplay
          label="Valor final estimado"
          :value="formatCurrency(resultado.valorFinal)"
          :trend="trend"
          :trend-value="resultado.rentabilidadTotal > 0 ? `+${resultado.rentabilidadTotal.toFixed(1)}%` : ''"
        />
      </BaseCard>

      <BaseCard variant="elevated" padding="md">
        <MetricDisplay
          label="Total aportado"
          :value="formatCurrency(resultado.totalAportado)"
          trend="neutral"
        />
      </BaseCard>

      <BaseCard variant="elevated" padding="md">
        <MetricDisplay
          label="Ganancia estimada"
          :value="formatCurrency(resultado.ganancia)"
          :trend="trend"
        />
      </BaseCard>
    </div>

    <!-- Distribución del portafolio -->
    <BaseCard variant="bordered" padding="md">
      <h3 class="distrib-title">Distribución del portafolio</h3>
      <div class="distrib-list">
        <div
          v-for="item in distribucion"
          :key="item.label"
          class="distrib-item"
        >
          <div class="distrib-info">
            <BaseBadge :variant="item.variant" size="sm">{{ item.label }}</BaseBadge>
            <span class="distrib-tasa">{{ (item.tasa * 100).toFixed(1)}% anual est.</span>
          </div>
          <div class="distrib-bar-wrapper">
            <div
              class="distrib-bar"
              :class="`bar-${item.variant}`"
              :style="{ width: `${item.pct * 100}%` }"
              :aria-label="`${item.label}: ${Math.round(item.pct * 100)}%`"
            />
            <span class="distrib-pct">{{ Math.round(item.pct * 100) }}%</span>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Nota disclaimer -->
    <p class="simulator-disclaimer">
      * Proyecciones basadas en rendimientos históricos. Los resultados reales pueden variar.
      No constituye asesoría financiera.
    </p>
  </section>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.simulator {
  @apply flex flex-col gap-6;
}

.simulator-header {
  @apply flex flex-col gap-2;
}

.simulator-title {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.simulator-meta {
  @apply flex items-center gap-2;
}

/* Métricas */
.metrics-grid {
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 640px) {
  .metrics-grid { @apply grid-cols-3; }
}

/* Distribución */
.distrib-title {
  @apply font-heading text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4;
}

.distrib-list {
  @apply flex flex-col gap-4;
}

.distrib-item {
  @apply flex flex-col gap-1;
}

.distrib-info {
  @apply flex items-center justify-between;
}

.distrib-tasa {
  @apply font-mono text-xs text-text-muted;
}

.distrib-bar-wrapper {
  @apply flex items-center gap-3;
}

.distrib-bar {
  @apply h-2 rounded-full transition-all duration-500;
  min-width: 4px;
}

.bar-growth  { @apply bg-accent-growth; }
.bar-alert   { @apply bg-accent-alert; }
.bar-neutral { @apply bg-accent-neutral; }

.distrib-pct {
  @apply font-mono text-xs text-text-secondary w-8 text-right;
}

/* Disclaimer */
.simulator-disclaimer {
  @apply font-body text-xs text-text-muted italic;
}
</style>
