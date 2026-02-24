<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

withDefaults(defineProps<Props>(), {
  position: 'top',
})

const visible = ref(false)
const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`

function show() { visible.value = true }
function hide() { visible.value = false }
function toggle() { visible.value = !visible.value }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') hide()
}
</script>

<template>
  <span
    class="tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
    @click.stop="toggle"
    @keydown="onKeydown"
  >
    <slot :aria-describedby="tooltipId" />
    <span
      v-if="visible"
      :id="tooltipId"
      role="tooltip"
      :class="['tooltip', `tooltip-${position}`]"
    >
      {{ content }}
    </span>
  </span>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.tooltip-wrapper {
  @apply relative inline-flex items-center;
}

.tooltip {
  @apply absolute z-50 w-max max-w-[240px];
  @apply bg-bg-elevated text-text-primary text-xs leading-relaxed;
  @apply border border-white/10 rounded-lg px-3 py-2;
  @apply pointer-events-none whitespace-normal;
  @apply shadow-lg;
}

/* Posiciones */
.tooltip-top {
  @apply bottom-full left-1/2 -translate-x-1/2 mb-2;
}
.tooltip-bottom {
  @apply top-full left-1/2 -translate-x-1/2 mt-2;
}
.tooltip-left {
  @apply right-full top-1/2 -translate-y-1/2 mr-2;
}
.tooltip-right {
  @apply left-full top-1/2 -translate-y-1/2 ml-2;
}

@media (prefers-reduced-motion: reduce) {
  .tooltip { @apply transition-none; }
}
</style>
