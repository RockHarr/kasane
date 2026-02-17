<script setup lang="ts">
// PortfolioSuggestion: muestra la asignación recomendada de portafolio
// Responsabilidad: visualizar la distribución bonds/dividends/stocks con instrumentos sugeridos
import { computed } from 'vue'
import type { PortfolioAllocation, InvestmentInstrument } from '@/types'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseBadge from '@/components/atoms/BaseBadge.vue'
import MetricDisplay from '@/components/molecules/MetricDisplay.vue'
import InstrumentCard from '@/components/molecules/InstrumentCard.vue'

interface Props {
  allocation: PortfolioAllocation
  instruments: InvestmentInstrument[]
  capitalInicial: number
  selectedSymbols?: string[]
}

withDefaults(defineProps<Props>(), {
  selectedSymbols: () => [],
})

const emit = defineEmits<{
  selectInstrument: [symbol: string]
}>()

const props = defineProps<Props>()

// Distribución en pesos
const capitalBonds = computed(() =>
  props.capitalInicial * props.allocation.bonds
)
const capitalDividends = computed(() =>
  props.capitalInicial * props.allocation.dividends
)
const capitalStocks = computed(() =>
  props.capitalInicial * props.allocation.stocks
)

// Agrupar instrumentos por tipo
const bondInstruments = computed(() =>
  props.instruments.filter(i => i.type === 'bonds')
)
const dividendInstruments = computed(() =>
  props.instruments.filter(i => i.type === 'dividends')
)
const stockInstruments = computed(() =>
  props.instruments.filter(i => i.type === 'stocks')
)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <section class="portfolio" aria-label="Sugerencia de portafolio">
    <header class="portfolio-header">
      <h2 class="portfolio-title">Tu portafolio sugerido</h2>
      <p class="portfolio-subtitle">
        Basado en tu perfil, esta distribución equilibra crecimiento y estabilidad.
      </p>
    </header>

    <!-- Resumen de asignación -->
    <div class="allocation-grid">
      <BaseCard variant="elevated" padding="md" class="allocation-item">
        <BaseBadge variant="neutral" size="sm" class="mb-3">Bonos</BaseBadge>
        <MetricDisplay
          label="Asignación"
          :value="toPercent(allocation.bonds)"
          :trend="allocation.bonds >= 0.5 ? 'neutral' : 'up'"
        />
        <p class="allocation-amount">{{ formatCurrency(capitalBonds) }}</p>
      </BaseCard>

      <BaseCard variant="elevated" padding="md" class="allocation-item">
        <BaseBadge variant="growth" size="sm" class="mb-3">Dividendos</BaseBadge>
        <MetricDisplay
          label="Asignación"
          :value="toPercent(allocation.dividends)"
          trend="up"
        />
        <p class="allocation-amount">{{ formatCurrency(capitalDividends) }}</p>
      </BaseCard>

      <BaseCard variant="elevated" padding="md" class="allocation-item">
        <BaseBadge variant="alert" size="sm" class="mb-3">Acciones</BaseBadge>
        <MetricDisplay
          label="Asignación"
          :value="toPercent(allocation.stocks)"
          trend="up"
        />
        <p class="allocation-amount">{{ formatCurrency(capitalStocks) }}</p>
      </BaseCard>
    </div>

    <!-- Instrumentos por categoría -->
    <div class="instruments-section">
      <!-- Bonos -->
      <div v-if="bondInstruments.length" class="instrument-group">
        <h3 class="instrument-group-title">Bonos recomendados</h3>
        <div class="instrument-list">
          <InstrumentCard
            v-for="instrument in bondInstruments"
            :key="instrument.symbol"
            :instrument="instrument"
            :selected="selectedSymbols.includes(instrument.symbol)"
            @select="emit('selectInstrument', $event)"
          />
        </div>
      </div>

      <!-- Dividendos -->
      <div v-if="dividendInstruments.length" class="instrument-group">
        <h3 class="instrument-group-title">ETFs de dividendos</h3>
        <div class="instrument-list">
          <InstrumentCard
            v-for="instrument in dividendInstruments"
            :key="instrument.symbol"
            :instrument="instrument"
            :selected="selectedSymbols.includes(instrument.symbol)"
            @select="emit('selectInstrument', $event)"
          />
        </div>
      </div>

      <!-- Acciones -->
      <div v-if="stockInstruments.length" class="instrument-group">
        <h3 class="instrument-group-title">Acciones de crecimiento</h3>
        <div class="instrument-list">
          <InstrumentCard
            v-for="instrument in stockInstruments"
            :key="instrument.symbol"
            :instrument="instrument"
            :selected="selectedSymbols.includes(instrument.symbol)"
            @select="emit('selectInstrument', $event)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.portfolio {
  @apply flex flex-col gap-8;
}

.portfolio-header {
  @apply flex flex-col gap-1;
}

.portfolio-title {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.portfolio-subtitle {
  @apply font-body text-sm text-text-secondary;
}

/* Asignación */
.allocation-grid {
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 640px) {
  .allocation-grid { @apply grid-cols-3; }
}

.allocation-item {
  @apply flex flex-col;
}

.allocation-amount {
  @apply font-mono text-sm text-text-secondary mt-2;
}

/* Instrumentos */
.instruments-section {
  @apply flex flex-col gap-6;
}

.instrument-group-title {
  @apply font-heading text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3;
}

.instrument-list {
  @apply grid grid-cols-1 gap-3;
}

@media (min-width: 640px) {
  .instrument-list { @apply grid-cols-2; }
}

@media (min-width: 1024px) {
  .instrument-list { @apply grid-cols-3; }
}
</style>
