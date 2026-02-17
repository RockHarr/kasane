<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  label: 'Cargando...',
})
</script>

<template>
  <div
    class="loader-wrapper"
    role="status"
    :aria-label="label"
  >
    <svg
      :class="['loader-ring', `loader-${size}`]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="2.5"
        class="loader-track"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="2.5"
        class="loader-arc"
        stroke-linecap="round"
      />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";
.loader-wrapper {
  @apply inline-flex items-center justify-center;
}

.loader-ring {
  @apply text-accent-growth animate-spin;
}

/* Tamaños */
.loader-sm { @apply w-4 h-4; }
.loader-md { @apply w-6 h-6; }
.loader-lg { @apply w-10 h-10; }

/* Track (fondo del anillo) */
.loader-track {
  @apply opacity-20;
}

/* Arco giratorio */
.loader-arc {
  stroke-dasharray: 60;
  stroke-dashoffset: 45;
}

@media (prefers-reduced-motion: reduce) {
  .loader-ring {
    @apply animate-none opacity-60;
  }
}
</style>
