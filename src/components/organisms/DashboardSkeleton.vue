<script setup lang="ts">
// DashboardSkeleton: Esqueleto de carga específico para DashboardView
// Responsabilidad: imitar la estructura de Greeting, Progreso de Meta, Datos y Suggestion
import { computed } from 'vue'
import BaseSkeleton from '@/components/atoms/BaseSkeleton.vue'

const props = defineProps<{
  progress: number  // 0-100, drives the loading bar
}>()

const TIPS = [
  'La constancia es la llave del interés compuesto.',
  'Invertir el 10% de tu sueldo mensualmente puede duplicar tu capital en menos de 10 años.',
  'El mejor momento para invertir fue ayer. El segundo mejor momento es hoy.',
  'No inviertas en lo que no entiendes. El conocimiento es tu mejor activo.',
  'La diversificación reduce el riesgo sin sacrificar el retorno.',
  'Tu plan de ahorro más poderoso no es el monto que inviertes, es la fecha en que empiezas.',
]

const randomTip = computed(() =>
  TIPS[Math.floor(Math.random() * TIPS.length)]
)

// Segundos restantes basados en el progreso (3s total)
const secondsLeft = computed(() => {
  const remaining = Math.ceil(3 * (1 - props.progress / 100))
  return Math.max(0, remaining)
})
</script>

<template>
  <div class="dashboard-skeleton" aria-label="Cargando tu portafolio..." aria-busy="true">
    <!-- Nav Skeleton -->
    <div class="nav-skeleton">
      <BaseSkeleton width="w-24" height="h-4" />
      <div class="nav-right">
        <BaseSkeleton width="w-16" height="h-4" />
        <BaseSkeleton width="w-10" height="h-4" />
      </div>
    </div>

    <!-- Greeting Skeleton -->
    <div class="greeting-skeleton">
      <BaseSkeleton type="title" width="w-48" />
      <BaseSkeleton type="text" width="w-3/4" />
    </div>

    <!-- Meta Progress Card Skeleton -->
    <div class="meta-card-skeleton">
      <div class="meta-card-header">
        <BaseSkeleton type="avatar" width="w-8" height="h-8" rounded="rounded-full" />
        <div class="meta-info">
          <BaseSkeleton type="title" width="w-1/3" height="h-5" />
          <BaseSkeleton type="text" width="w-1/2" />
        </div>
        <BaseSkeleton width="w-20" height="h-5" />
      </div>
      <BaseSkeleton width="w-full" height="h-1.5" rounded="rounded-full" class="mt-3" />
      <BaseSkeleton width="w-24" height="h-3" class="mt-2" />
    </div>

    <!-- Profile Summary Skeleton -->
    <div class="profile-summary-skeleton">
      <div class="profile-grid">
        <div v-for="i in 4" :key="i" class="profile-item">
          <BaseSkeleton width="w-20" height="h-3" class="mb-1" />
          <BaseSkeleton width="w-24" height="h-6" />
        </div>
      </div>
    </div>

    <!-- Portfolio Suggestion Blocks Skeleton -->
    <div class="suggestion-skeleton">
      <BaseSkeleton type="title" width="w-40" class="mb-4" />
      <div class="instruments-grid">
        <BaseSkeleton v-for="i in 3" :key="i" type="card" height="h-28" />
      </div>
    </div>

    <!-- Loading Tip (al estilo videojuego) -->
    <div class="loading-tip" aria-live="polite">
      <div class="tip-header">
        <span class="tip-icon">💡</span>
        <span class="tip-label">Kasane Tip</span>
        <span class="tip-countdown" aria-label="Cargando en {{ secondsLeft }} segundos">{{ secondsLeft }}s</span>
      </div>
      <p class="tip-text">{{ randomTip }}</p>
      <!-- Barra de progreso al estilo RPG -->
      <div class="tip-progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <div class="tip-progress-fill" :style="{ width: progress + '%' }" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.dashboard-skeleton {
  @apply flex flex-col gap-8 w-full max-w-5xl mx-auto;
}

/* Nav */
.nav-skeleton {
  @apply flex items-center justify-between;
}

.nav-right {
  @apply flex items-center gap-4;
}

/* Greeting */
.greeting-skeleton {
  @apply flex flex-col gap-2;
}

/* Meta Card */
.meta-card-skeleton {
  @apply flex flex-col bg-bg-elevated rounded-xl p-5 border border-white/5;
}

.meta-card-header {
  @apply flex items-start gap-3;
}

.meta-info {
  @apply flex flex-col gap-1.5 flex-1 min-w-0;
}

/* Profile Summary */
.profile-summary-skeleton {
  @apply bg-bg-elevated rounded-xl p-5 border border-white/5;
}

.profile-grid {
  @apply grid grid-cols-2 gap-4;
}

@media (min-width: 640px) {
  .profile-grid {
    @apply grid-cols-4;
  }
}

.profile-item {
  @apply flex flex-col;
}

/* Suggestion */
.suggestion-skeleton {
  @apply flex flex-col pt-4;
}

.instruments-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

/* Loading Tip */
.loading-tip {
  @apply flex flex-col gap-3 mt-6;
  @apply bg-accent-neutral/5 border border-accent-neutral/15 rounded-xl px-5 py-4;
}

.tip-header {
  @apply flex items-center gap-2;
}

.tip-icon {
  @apply text-xl shrink-0;
}

.tip-label {
  @apply font-heading text-xs font-bold tracking-widest text-text-secondary uppercase flex-1;
}

.tip-countdown {
  @apply font-mono text-xs font-bold text-accent-growth;
  min-width: 2ch;
  text-align: right;
}

.tip-text {
  @apply font-body text-sm text-text-secondary leading-relaxed;
}

/* Progress bar track */
.tip-progress-track {
  @apply w-full rounded-full overflow-hidden;
  height: 4px;
  background: rgba(255,255,255,0.06);
}

/* Progress bar fill with glow */
.tip-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--color-accent-growth, #00ffaa);
  box-shadow: 0 0 8px var(--color-accent-growth, #00ffaa);
  transition: width 0.3s linear;
}
</style>
