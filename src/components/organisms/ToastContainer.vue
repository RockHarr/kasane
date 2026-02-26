<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'

const { toasts, remove } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle2
    case 'error':
      return AlertCircle
    default:
      return Info
  }
}

const getTypeClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-accent-growth text-accent-growth bg-accent-growth/10'
    case 'error':
      return 'border-accent-alert text-accent-alert bg-accent-alert/10'
    default:
      return 'border-accent-neutral text-accent-neutral bg-accent-neutral/10'
  }
}
</script>

<template>
  <div class="toast-container" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="getTypeClasses(toast.type)"
        role="alert"
      >
        <component :is="getIcon(toast.type)" :size="20" class="shrink-0" aria-hidden="true" />

        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <button class="toast-close" aria-label="Cerrar notificación" @click="remove(toast.id)">
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.toast-container {
  @apply fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full;
  /* z-50 para estar por encima de navbs y graficos */
}

.toast {
  @apply flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md pointer-events-auto;
}

.toast-content {
  @apply flex-1 min-w-0 pr-2;
}

.toast-message {
  @apply font-body text-sm font-medium text-text-primary;
}

.toast-close {
  @apply shrink-0 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-full p-1 hover:bg-white/10;
  @apply focus-visible:outline focus-visible:outline-1 focus-visible:outline-white;
}
</style>
