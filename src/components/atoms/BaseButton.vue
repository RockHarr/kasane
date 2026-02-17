<script setup lang="ts">
import type { ButtonVariant } from '@/types'

interface Props {
  variant?: ButtonVariant
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  type: 'button',
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'btn',
      `btn-${variant}`,
      { 'btn-disabled': disabled },
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.btn {
  @apply font-mono text-sm px-6 py-3 rounded-lg cursor-pointer;
  @apply transition-all duration-300 min-h-[44px] min-w-[44px];
  @apply uppercase tracking-wide border-none;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2;
}

.btn-primary {
  @apply bg-accent-growth-bg text-bg-primary font-semibold;
  @apply focus-visible:outline-accent-growth;
}
.btn-primary:hover:not(:disabled) {
  @apply shadow-glow-growth -translate-y-0.5;
}

.btn-secondary {
  @apply bg-transparent text-accent-growth border-2 border-accent-growth;
  @apply focus-visible:outline-accent-growth;
}
.btn-secondary:hover:not(:disabled) {
  @apply bg-accent-growth/10 shadow-glow-growth;
}

.btn-alert {
  @apply bg-accent-alert-bg text-bg-primary font-semibold;
  @apply focus-visible:outline-accent-alert;
}
.btn-alert:hover:not(:disabled) {
  @apply shadow-glow-alert -translate-y-0.5;
}

.btn-disabled {
  @apply opacity-50 cursor-not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .btn { @apply transition-none; }
  .btn:hover { @apply translate-y-0; }
}
</style>
