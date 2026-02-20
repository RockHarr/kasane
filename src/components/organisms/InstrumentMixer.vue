<script setup lang="ts">
// InstrumentMixer: orquestador del mix de instrumentos
// Responsabilidad: gestionar los sliders, mantener la invariante de suma = 100%,
// y exponer el toggle de paso de hitos (3 | 6 | 12 meses).
import { ref, computed, watch } from 'vue'
import { INSTRUMENTOS, generarHorizontes } from '@/data/instruments'
import type { InstrumentMix } from '@/data/instruments'
import InstrumentSlider from '@/components/molecules/InstrumentSlider.vue'

const emit = defineEmits<{
  'update:mix': [mix: InstrumentMix[]]
  'update:horizontes': [horizontes: number[]]
}>()

// ─── Estado del mix ────────────────────────────────────────────

// Inicializar todos los instrumentos en 0%
const porcentajes = ref<Record<string, number>>(
  Object.fromEntries(INSTRUMENTOS.map(i => [i.id, 0]))
)

const totalPct = computed(() =>
  Object.values(porcentajes.value).reduce((sum, v) => sum + v, 0)
)

const estaCompleto = computed(() => totalPct.value === 100)
const excede      = computed(() => totalPct.value > 100)

// Emitir el mix actualizado cada vez que cambie un porcentaje
watch(porcentajes, () => {
  const mix: InstrumentMix[] = INSTRUMENTOS
    .filter(i => porcentajes.value[i.id] > 0)
    .map(i => ({ instrumentId: i.id, porcentaje: porcentajes.value[i.id] }))
  emit('update:mix', mix)
}, { deep: true })

/**
 * Ajusta el porcentaje de un instrumento y normaliza los demás
 * para que la suma no supere 100, redistribuyendo proporcionalmente.
 *
 * Regla: si mover A llevaría el total > 100, se reducen los demás
 * instrumentos activos de forma proporcional hasta dejar espacio.
 */
function onSliderChange(instrumentId: string, nuevoValor: number) {
  const resto = INSTRUMENTOS.filter(i => i.id !== instrumentId && porcentajes.value[i.id] > 0)
  const sumaResto = resto.reduce((s, i) => s + porcentajes.value[i.id], 0)

  const disponible = 100 - nuevoValor

  if (sumaResto > 0 && sumaResto > disponible) {
    // Reducir los demás proporcionalmente para caber en el 100%
    const factor = disponible / sumaResto
    for (const inst of resto) {
      porcentajes.value[inst.id] = Math.round(porcentajes.value[inst.id] * factor)
    }
    // Ajustar redondeo: asegurarse de que sumen exactamente disponible
    const diff = disponible - resto.reduce((s, i) => s + porcentajes.value[i.id], 0)
    if (diff !== 0 && resto.length > 0) {
      porcentajes.value[resto[0].id] += diff
    }
  }

  porcentajes.value[instrumentId] = nuevoValor
}

function resetMix() {
  for (const id of Object.keys(porcentajes.value)) {
    porcentajes.value[id] = 0
  }
}

// ─── Paso de hitos ─────────────────────────────────────────────

const pasoOpciones = [3, 6, 12] as const
type Paso = typeof pasoOpciones[number]

const pasoActual = ref<Paso>(12) // default: 12 meses (hitos en 12, 24, 36)

const horizontesActuales = computed(() => generarHorizontes(pasoActual.value))

watch(horizontesActuales, (val: number[]) => emit('update:horizontes', val), { immediate: true })

function setPaso(p: Paso) {
  pasoActual.value = p
}
</script>

<template>
  <section class="instrument-mixer" aria-label="Mixer de instrumentos">

    <!-- Encabezado con título y reset -->
    <header class="mixer-header">
      <div>
        <h3 class="mixer-title">Mix de inversiones</h3>
        <p class="mixer-subtitle">Distribuye tu capital entre los instrumentos</p>
      </div>
      <button
        class="mixer-reset"
        type="button"
        :disabled="totalPct === 0"
        aria-label="Reiniciar mix"
        @click="resetMix"
      >
        Reiniciar
      </button>
    </header>

    <!-- Toggle de paso de hitos -->
    <div class="paso-toggle" role="group" aria-label="Granularidad del gráfico">
      <span class="paso-label">Ver proyección cada:</span>
      <div class="paso-buttons">
        <button
          v-for="p in pasoOpciones"
          :key="p"
          type="button"
          class="paso-btn"
          :class="{ 'is-active': p === pasoActual }"
          :aria-pressed="p === pasoActual"
          @click="setPaso(p)"
        >
          {{ p }}m
        </button>
      </div>
    </div>

    <!-- Sliders por instrumento -->
    <div class="slider-list">
      <InstrumentSlider
        v-for="instrumento in INSTRUMENTOS"
        :key="instrumento.id"
        :instrument="instrumento"
        :model-value="porcentajes[instrumento.id]"
        @update:model-value="onSliderChange(instrumento.id, $event)"
      />
    </div>

    <!-- Barra de total -->
    <footer class="mixer-footer">
      <div class="total-bar-track" aria-hidden="true">
        <div
          class="total-bar-fill"
          :class="{ 'is-full': estaCompleto, 'is-over': excede }"
          :style="{ width: Math.min(totalPct, 100) + '%' }"
        />
      </div>
      <p
        class="total-label"
        :class="{ 'text-accent-growth': estaCompleto, 'text-accent-alert': excede }"
        role="status"
        :aria-live="excede ? 'assertive' : 'polite'"
      >
        <template v-if="estaCompleto">✓ Mix completo (100%)</template>
        <template v-else-if="excede">⚠ Excede el 100% — ajusta los sliders</template>
        <template v-else>{{ totalPct }}% asignado — faltan {{ 100 - totalPct }}%</template>
      </p>
    </footer>

  </section>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

/* ── Layout general ── */
.instrument-mixer {
  @apply flex flex-col gap-5;
}

/* ── Header ── */
.mixer-header {
  @apply flex items-center justify-between;
}

.mixer-title {
  @apply font-heading text-base font-semibold text-text-primary;
}

.mixer-subtitle {
  @apply font-body text-xs text-text-muted mt-0.5;
}

.mixer-reset {
  @apply font-body text-xs text-text-muted hover:text-accent-alert transition-colors disabled:opacity-30 disabled:cursor-not-allowed;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert rounded;
}

/* ── Toggle de paso ── */
.paso-toggle {
  @apply flex items-center gap-3 flex-wrap;
}

.paso-label {
  @apply font-body text-xs text-text-muted;
}

.paso-buttons {
  @apply flex gap-1;
}

.paso-btn {
  @apply font-mono text-xs px-3 py-1 rounded-full border border-white/10 text-text-secondary transition-all;
  @apply hover:border-accent-growth/50 hover:text-accent-growth;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth;
}

.paso-btn.is-active {
  @apply bg-accent-growth/15 border-accent-growth text-accent-growth font-semibold;
}

/* ── Lista de sliders ── */
.slider-list {
  @apply grid grid-cols-1 gap-3 sm:grid-cols-2;
}

/* ── Footer con barra de total ── */
.mixer-footer {
  @apply flex flex-col gap-2;
}

.total-bar-track {
  @apply w-full h-1.5 rounded-full bg-white/5 overflow-hidden;
}

.total-bar-fill {
  @apply h-full rounded-full transition-all duration-300;
  @apply bg-text-muted;
}

.total-bar-fill.is-full {
  @apply bg-accent-growth;
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-growth, #00ffaa) 50%, transparent);
}

.total-bar-fill.is-over {
  @apply bg-accent-alert;
}

.total-label {
  @apply font-mono text-xs text-text-muted;
}
</style>
