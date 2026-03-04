<script setup lang="ts">
/**
 * SimulatorLoadingTip.vue
 * 
 * Componente temporal que muestra un tip educativo y una barra de progreso 
 * durante 3 segundos antes de revelar la simulación principal.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const MIN_LOADING_MS = 3000
const progress = ref(0) // 0 a 100
const timerDone = ref(false)

const TIPS = [
  'Proyectando el poder del interés compuesto a futuro...',
  'Evaluando diferentes escenarios de mercado para tu estrategia...',
  'Calculando el impacto de aportes constantes en el tiempo...',
  'El Dollar Cost Averaging (DCA) reduce el riesgo de comprar en máximos...',
  'Recuerda: la paciencia es la mayor virtud del inversor a largo plazo.',
  'Simulando el comportamiento de ETFs bursátiles históricamente comprobados...',
]

const randomTip = ref(TIPS[Math.floor(Math.random() * TIPS.length)])

// Segundos restantes basados en el progreso (3s total)
const secondsLeft = computed(() => {
  const remaining = Math.ceil(3 * (1 - progress.value / 100))
  return Math.max(0, remaining)
})

let progressInterval: ReturnType<typeof setInterval>

onMounted(() => {
  const start = Date.now()
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - start
    progress.value = Math.min(100, Math.round((elapsed / MIN_LOADING_MS) * 100))
    if (elapsed >= MIN_LOADING_MS) {
      timerDone.value = true
      clearInterval(progressInterval)
      // Damos un pequeño delay extra para que la UI termine de dibujar el 100%
      setTimeout(() => emit('complete'), 200)
    }
  }, 50)
})

onUnmounted(() => clearInterval(progressInterval))
</script>

<template>
  <div class="simulator-loading-tip" aria-live="polite">
    <div class="tip-header">
      <span class="tip-icon">💡</span>
      <span class="tip-label">Kasane Tip</span>
      <span class="tip-countdown" :aria-label="`Calculando en ${secondsLeft} segundos`">{{ secondsLeft }}s</span>
    </div>
    <p class="tip-text">{{ randomTip }}</p>
    <!-- Barra de progreso estilo RPG -->
    <div class="tip-progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
      <div class="tip-progress-fill" :style="{ width: progress + '%' }" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.simulator-loading-tip {
  @apply flex flex-col gap-4 w-full max-w-lg mx-auto;
  @apply bg-accent-neutral/10 border border-accent-neutral/20 rounded-2xl px-6 py-5 shadow-2xl backdrop-blur-md;
}

.tip-header {
  @apply flex items-center gap-2 mb-1;
}

.tip-icon {
  @apply text-xl shrink-0;
}

.tip-label {
  @apply font-heading text-sm font-bold tracking-widest text-text-primary uppercase flex-1;
}

.tip-countdown {
  @apply font-mono text-sm font-bold text-accent-growth;
  min-width: 2.5ch;
  text-align: right;
}

.tip-text {
  @apply font-body text-base text-text-secondary leading-relaxed mb-2;
}

/* Progress bar track */
.tip-progress-track {
  @apply w-full rounded-full overflow-hidden;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
}

/* Progress bar fill with glow */
.tip-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--color-accent-growth, #00ffaa);
  box-shadow: 0 0 10px var(--color-accent-growth, #00ffaa);
  transition: width 0.3s linear;
}
</style>
