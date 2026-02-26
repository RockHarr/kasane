<script setup lang="ts">
// BaseSkeleton: componente puro de UI para estados de carga
// Responsabilidad: mostrar un contenedor animado ("pulse") simulando text/cards

interface Props {
  type?: 'text' | 'title' | 'avatar' | 'card'
  width?: string // Clases de Tailwind, ej. 'w-24' o 'w-full'
  height?: string // Clases de Tailwind, ej. 'h-4' o 'h-32'
  rounded?: string // Clases de Tailwind, ej. 'rounded-md'
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  width: 'w-full',
  height: '',
  rounded: '',
})
</script>

<template>
  <div
    class="skeleton-base animate-pulse bg-white/5"
    :class="[
      width,
      {
        'h-4 rounded': type === 'text' && !height && !rounded,
        'h-8 rounded-md': type === 'title' && !height && !rounded,
        'h-12 w-12 rounded-full': type === 'avatar' && !height && !width && !rounded,
        'h-32 rounded-xl': type === 'card' && !height && !rounded,
        [height]: height,
        [rounded]: rounded,
      },
    ]"
    aria-hidden="true"
  ></div>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.skeleton-base {
  @apply select-none pointer-events-none;
}
</style>
