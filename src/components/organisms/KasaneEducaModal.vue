<script setup lang="ts">
/**
 * KasaneEducaModal — Modal educativo del Simulador DCA
 *
 * Se muestra la primera vez que el usuario ingresa al simulador.
 * Contiene un carrusel de 3 tips sobre DCA e interés compuesto.
 * El usuario puede cerrarlo o marcarlo para no volver a verlo.
 *
 * Persistencia: localStorage key 'kasane_educa_dismissed'
 */
import { ref, onMounted } from 'vue'
const STORAGE_KEY = 'kasane_educa_dismissed'

const emit = defineEmits<{
  (e: 'closed'): void
}>()

const visible = ref(false)
const noMostrarMas = ref(false)
const slideActual = ref(0)

const slides = [
  {
    emoji: '📅',
    titulo: 'El poder de aportar mes a mes',
    cuerpo:
      'Invertir una cantidad fija cada mes — aunque sea pequeña — es más efectivo que esperar el "momento perfecto". Esta técnica se llama Dollar Cost Averaging (DCA) y reduce el riesgo de comprar en el peor momento.',
  },
  {
    emoji: '✨',
    titulo: 'Tu dinero genera más dinero',
    cuerpo:
      'El interés compuesto hace que cada peso que ganas también empiece a generar ganancias. Al principio parece lento, pero con el tiempo el efecto se acelera exponencialmente. Es la base de toda estrategia de inversión a largo plazo.',
  },
  {
    emoji: '📊',
    titulo: 'Cómo leer el gráfico',
    cuerpo:
      'La línea gris muestra cuánto acumularías solo guardando tu dinero sin invertirlo. La línea de color muestra cuánto generaría el instrumento que eliges. La diferencia entre ambas es tu ganancia potencial.',
  },
]

onMounted(() => {
  const dismissed = localStorage.getItem(STORAGE_KEY)
  if (!dismissed) {
    visible.value = true
  } else {
    // Si ya fue descartado, avisamos al padre para que fluya
    emit('closed')
  }
})

function siguiente() {
  if (slideActual.value < slides.length - 1) {
    slideActual.value++
  }
}

function anterior() {
  if (slideActual.value > 0) {
    slideActual.value--
  }
}

function cerrar() {
  if (noMostrarMas.value) {
    localStorage.setItem(STORAGE_KEY, 'true')
  }
  visible.value = false
  emit('closed')
}
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="ke-backdrop" role="dialog" aria-modal="true" aria-labelledby="ke-title">
      <div class="ke-panel">
        <!-- Header -->
        <div class="ke-header">
          <span class="ke-header-label">💡 Kasane Educa</span>
          <button class="ke-close" aria-label="Cerrar" @click="cerrar">✕</button>
        </div>

        <!-- Carrusel -->
        <div class="ke-carousel">
          <Transition name="slide-fade" mode="out-in">
            <div :key="slideActual" class="ke-slide">
              <span class="ke-slide-emoji" aria-hidden="true">{{ slides[slideActual].emoji }}</span>
              <h2 id="ke-title" class="ke-slide-title">{{ slides[slideActual].titulo }}</h2>
              <p class="ke-slide-body">{{ slides[slideActual].cuerpo }}</p>
            </div>
          </Transition>
        </div>

        <!-- Navegación del carrusel -->
        <div class="ke-nav">
          <button
            class="ke-nav-arrow"
            :disabled="slideActual === 0"
            aria-label="Anterior"
            @click="anterior"
          >
            ‹
          </button>

          <!-- Dots -->
          <div class="ke-dots" role="tablist" aria-label="Diapositivas">
            <button
              v-for="(_, i) in slides"
              :key="i"
              class="ke-dot"
              :class="{ 'ke-dot--active': i === slideActual }"
              role="tab"
              :aria-selected="i === slideActual"
              :aria-label="`Ir a diapositiva ${i + 1}`"
              @click="slideActual = i"
            />
          </div>

          <button
            class="ke-nav-arrow"
            :disabled="slideActual === slides.length - 1"
            aria-label="Siguiente"
            @click="siguiente"
          >
            ›
          </button>
        </div>

        <!-- Footer -->
        <div class="ke-footer">
          <label class="ke-checkbox-label">
            <input v-model="noMostrarMas" type="checkbox" class="ke-checkbox" />
            <span>No volver a mostrar</span>
          </label>
          <button class="ke-cta" @click="cerrar">
            Ir a mi Estrategia →
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

/* Backdrop */
.ke-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center px-4;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}

/* Panel */
.ke-panel {
  @apply w-full max-w-sm bg-bg-elevated rounded-2xl overflow-hidden;
  @apply border border-white/10 shadow-2xl shadow-black/60;
  @apply flex flex-col;
}

/* Header */
.ke-header {
  @apply flex items-center justify-between px-5 pt-5 pb-3;
}

.ke-header-label {
  @apply font-heading text-sm font-semibold text-accent-neutral;
}

.ke-close {
  @apply text-text-muted hover:text-text-primary text-base transition-colors;
  @apply w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10;
}

/* Carrusel */
.ke-carousel {
  @apply px-5 py-4 min-h-[180px] flex items-center;
}

.ke-slide {
  @apply flex flex-col gap-3 w-full;
}

.ke-slide-emoji {
  @apply text-4xl leading-none;
}

.ke-slide-title {
  @apply font-heading text-lg font-bold text-text-primary leading-tight;
}

.ke-slide-body {
  @apply font-body text-sm text-text-secondary leading-relaxed;
}

/* Navegación */
.ke-nav {
  @apply flex items-center justify-between px-5 py-3;
}

.ke-nav-arrow {
  @apply font-mono text-2xl text-text-muted hover:text-text-primary transition-colors;
  @apply w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10;
  @apply disabled:opacity-25 disabled:cursor-not-allowed;
}

.ke-dots {
  @apply flex gap-2 items-center;
}

.ke-dot {
  @apply w-2 h-2 rounded-full bg-white/20 transition-all duration-200;
}

.ke-dot--active {
  @apply w-4 bg-accent-growth;
}

/* Footer */
.ke-footer {
  @apply flex items-center justify-between px-5 py-4;
  @apply border-t border-white/8;
}

.ke-checkbox-label {
  @apply flex items-center gap-2 font-body text-xs text-text-muted cursor-pointer;
}

.ke-checkbox {
  @apply accent-accent-growth w-3.5 h-3.5;
}

.ke-cta {
  @apply font-heading text-sm font-bold text-bg-primary;
  @apply bg-accent-growth px-4 py-2 rounded-xl;
  @apply hover:bg-[#00e699] transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth;
}

/* Transición del modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Transición entre slides */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
