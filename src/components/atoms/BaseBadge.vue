<script setup lang="ts">
import type { BadgeVariant } from '@/types'

interface Props {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
})
</script>

<template>
  <span
    :class="[
      'badge',
      `badge-${variant}`,
      `badge-${size}`,
    ]"
    role="status"
  >
    <slot />
  </span>
</template>

<style scoped>
.badge {
  @apply inline-flex items-center font-mono font-medium rounded-full;
  @apply leading-none whitespace-nowrap;
}

/* Tamaños */
.badge-sm { @apply text-xs px-2 py-0.5; }
.badge-md { @apply text-sm px-3 py-1; }

/* Variantes — usa la paleta del sistema de diseño */
.badge-growth {
  @apply bg-accent-growth/15 text-accent-growth;
}
.badge-alert {
  @apply bg-accent-alert/15 text-accent-alert;
}
.badge-neutral {
  @apply bg-accent-neutral/15 text-accent-neutral;
}
</style>
