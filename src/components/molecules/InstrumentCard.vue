<script setup lang="ts">
// InstrumentCard: tarjeta de un instrumento de inversión (ETF/bono)
// Responsabilidad: mostrar nombre, tipo, precio y cambio de un instrumento
import type { InvestmentInstrument } from '@/types'
import BaseBadge from '@/components/atoms/BaseBadge.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import PercentageChange from '@/components/molecules/PercentageChange.vue'

interface Props {
  instrument: InvestmentInstrument
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
})

defineEmits<{
  select: [symbol: string]
}>()

const typeLabel: Record<string, string> = {
  bonds: 'Bonos',
  dividends: 'Dividendos',
  stocks: 'Acciones',
}

const typeBadgeVariant: Record<string, 'growth' | 'alert' | 'neutral'> = {
  bonds: 'neutral',
  dividends: 'growth',
  stocks: 'alert',
}
</script>

<template>
  <BaseCard
    as="button"
    variant="elevated"
    padding="md"
    :class="['instrument-card', { 'is-selected': selected }]"
    :aria-pressed="selected"
    @click="$emit('select', instrument.symbol)"
  >
    <div class="instrument-top">
      <div class="instrument-info">
        <span class="instrument-symbol">{{ instrument.symbol }}</span>
        <BaseBadge :variant="typeBadgeVariant[instrument.type]" size="sm">
          {{ typeLabel[instrument.type] }}
        </BaseBadge>
      </div>
      <PercentageChange :value="instrument.changePercent" />
    </div>

    <p class="instrument-name">{{ instrument.name }}</p>

    <div class="instrument-price">
      <span class="price-current">${{ instrument.price.toFixed(2) }}</span>
      <span
        class="price-change"
        :class="instrument.change >= 0 ? 'positive' : 'negative'"
      >
        {{ instrument.change >= 0 ? '+' : '' }}{{ instrument.change.toFixed(2) }}
      </span>
    </div>
  </BaseCard>
</template>

<style scoped>
.instrument-card {
  @apply w-full text-left cursor-pointer transition-all duration-200;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2;
  @apply focus-visible:outline-accent-neutral;
}

.instrument-card:hover {
  @apply border border-white/15;
}

.instrument-card.is-selected {
  @apply border border-accent-growth/50 bg-accent-growth/5;
}

.instrument-top {
  @apply flex items-center justify-between mb-2;
}

.instrument-info {
  @apply flex items-center gap-2;
}

.instrument-symbol {
  @apply font-mono font-bold text-text-primary text-base;
}

.instrument-name {
  @apply font-body text-sm text-text-secondary mb-3 text-left;
}

.instrument-price {
  @apply flex items-baseline gap-2;
}

.price-current {
  @apply font-mono font-bold text-xl text-text-primary;
}

.price-change {
  @apply font-mono text-sm;
}

.positive { @apply text-accent-growth; }
.negative { @apply text-accent-alert; }
</style>
