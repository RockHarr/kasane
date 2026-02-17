<script setup lang="ts">
type CardVariant = 'default' | 'elevated' | 'bordered'

interface Props {
  variant?: CardVariant
  padding?: 'sm' | 'md' | 'lg' | 'none'
  as?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  as: 'div',
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'card',
      `card-${variant}`,
      `card-p-${padding}`,
    ]"
  >
    <slot />
  </component>
</template>

<style scoped>
.card {
  @apply rounded-xl transition-colors duration-200;
}

/* Variantes */
.card-default {
  @apply bg-bg-secondary;
}
.card-elevated {
  @apply bg-bg-elevated border border-white/5;
}
.card-bordered {
  @apply bg-bg-secondary border border-white/10;
}

/* Padding */
.card-p-none { @apply p-0; }
.card-p-sm   { @apply p-3; }
.card-p-md   { @apply p-5; }
.card-p-lg   { @apply p-8; }
</style>
