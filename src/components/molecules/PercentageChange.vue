<script setup lang="ts">
// PercentageChange: muestra un valor porcentual con color e ícono según dirección
// Responsabilidad: representar visualmente un cambio (positivo/negativo/neutro)
import { computed } from 'vue'

interface Props {
  value: number        // ej: 5.23 o -2.1
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true,
})

const props = defineProps<Props>()

const direction = computed(() => {
  if (props.value > 0) return 'up'
  if (props.value < 0) return 'down'
  return 'neutral'
})

const icon = computed(() => {
  if (direction.value === 'up') return '▲'
  if (direction.value === 'down') return '▼'
  return '—'
})

const formatted = computed(() => {
  const abs = Math.abs(props.value).toFixed(2)
  return props.value > 0 ? `+${abs}%` : `${props.value.toFixed(2)}%`
})
</script>

<template>
  <span
    :class="['pct-change', `pct-${direction}`, `pct-${size}`]"
    :aria-label="`Cambio: ${formatted}`"
  >
    <span v-if="showIcon" class="pct-icon" aria-hidden="true">{{ icon }}</span>
    <span class="pct-value">{{ formatted }}</span>
  </span>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.pct-change {
  @apply inline-flex items-center gap-1 font-mono font-medium rounded-md px-2 py-0.5;
}

/* Tamaños */
.pct-sm { @apply text-xs; }
.pct-md { @apply text-sm; }
.pct-lg { @apply text-base; }

/* Colores */
.pct-up {
  @apply text-accent-growth bg-accent-growth/10;
}
.pct-down {
  @apply text-accent-alert bg-accent-alert/10;
}
.pct-neutral {
  @apply text-text-secondary bg-white/5;
}

.pct-icon {
  @apply text-[0.65em] leading-none;
}
</style>
