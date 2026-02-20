<script setup lang="ts">
// InstrumentSlider: slider individual para asignar un % a un instrumento
// Responsabilidad: renderizar un instrumento con su slider de porcentaje.
// El padre (InstrumentMixer) es quien valida que la suma sea 100.
import type { Instrument } from '@/data/instruments'

interface Props {
  instrument: Instrument
  modelValue: number // 0–100
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function onInput(event: Event) {
  const val = Number((event.target as HTMLInputElement).value)
  emit('update:modelValue', val)
}

const riesgoLabel: Record<string, string> = {
  bajo: 'Bajo riesgo',
  medio: 'Riesgo moderado',
  alto: 'Alto riesgo',
}

const riesgoCss: Record<string, string> = {
  bajo: 'badge--growth',
  medio: 'badge--neutral',
  alto: 'badge--alert',
}
</script>

<template>
  <article
    class="instrument-slider"
    :class="{ 'is-active': modelValue > 0 }"
    :style="{ '--instrument-color': instrument.color }"
  >
    <!-- Encabezado: nombre + badge de riesgo -->
    <header class="slider-header">
      <div class="slider-info">
        <span class="slider-name">{{ instrument.name }}</span>
        <span
          class="slider-badge"
          :class="riesgoCss[instrument.riesgo]"
          :aria-label="`Nivel de riesgo: ${riesgoLabel[instrument.riesgo]}`"
        >
          {{ riesgoLabel[instrument.riesgo] }}
        </span>
      </div>

      <!-- Porcentaje numérico editable -->
      <div class="slider-pct-wrap">
        <input
          type="number"
          class="slider-pct-input"
          :value="modelValue"
          min="0"
          max="100"
          :disabled="disabled"
          :aria-label="`${instrument.name}: porcentaje asignado`"
          @change="onInput"
        />
        <span class="slider-pct-symbol">%</span>
      </div>
    </header>

    <!-- Descripción del instrumento -->
    <p class="slider-desc">{{ instrument.descripcion }}</p>

    <!-- Slider accesible -->
    <input
      type="range"
      class="slider-range"
      min="0"
      max="100"
      step="1"
      :value="modelValue"
      :disabled="disabled"
      :aria-label="`${instrument.name}: ajustar porcentaje`"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="modelValue"
      :aria-valuetext="`${modelValue}%`"
      @input="onInput"
    />

    <!-- Etiquetas extremos -->
    <div class="slider-labels" aria-hidden="true">
      <span>0%</span>
      <span>100%</span>
    </div>

    <!-- Info de horizonte mínimo -->
    <p
      v-if="instrument.horizonteMinimo > 3"
      class="slider-hint"
    >
      ⏱ Recomendado mínimo {{ instrument.horizonteMinimo }} meses
    </p>
  </article>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.instrument-slider {
  @apply rounded-xl p-4 border border-white/5 bg-bg-secondary transition-all duration-200;
}

.instrument-slider.is-active {
  border-color: var(--instrument-color, #00FF88);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--instrument-color, #00FF88) 20%, transparent);
}

/* ── Header ── */
.slider-header {
  @apply flex items-center justify-between mb-2;
}

.slider-info {
  @apply flex items-center gap-2 flex-wrap;
}

.slider-name {
  @apply font-mono font-semibold text-sm text-text-primary;
}

.slider-badge {
  @apply text-xs font-body px-2 py-0.5 rounded-full;
}

.badge--growth { @apply bg-accent-growth/15 text-accent-growth; }
.badge--neutral { @apply bg-accent-neutral/15 text-accent-neutral; }
.badge--alert   { @apply bg-accent-alert/15 text-accent-alert; }

/* ── Porcentaje numérico ── */
.slider-pct-wrap {
  @apply flex items-center gap-0.5;
}

.slider-pct-input {
  @apply w-14 text-right bg-transparent font-mono font-bold text-lg text-text-primary;
  @apply border-b border-white/10 focus:border-accent-growth outline-none;
}

/* Ocultar flechas del input number */
.slider-pct-input::-webkit-outer-spin-button,
.slider-pct-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.slider-pct-symbol {
  @apply font-mono text-sm text-text-muted;
}

/* ── Descripción ── */
.slider-desc {
  @apply font-body text-xs text-text-muted mb-3 leading-relaxed;
}

/* ── Range input con color dinámico ── */
.slider-range {
  -webkit-appearance: none;
  appearance: none;
  @apply w-full h-1.5 rounded-full outline-none cursor-pointer;
  background: linear-gradient(
    to right,
    var(--instrument-color, #00FF88) 0%,
    var(--instrument-color, #00FF88) v-bind('modelValue + "%"'),
    rgba(255, 255, 255, 0.1) v-bind('modelValue + "%"'),
    rgba(255, 255, 255, 0.1) 100%
  );
}

.slider-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--instrument-color, #00FF88);
  cursor: pointer;
  border: 2px solid #0a0f0a;
  box-shadow: 0 0 6px color-mix(in srgb, var(--instrument-color, #00FF88) 50%, transparent);
  transition: transform 0.1s ease;
}

.slider-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-range:focus-visible::-webkit-slider-thumb {
  outline: 2px solid var(--instrument-color, #00FF88);
  outline-offset: 3px;
}

.slider-range:disabled {
  @apply opacity-40 cursor-not-allowed;
}

/* ── Etiquetas ── */
.slider-labels {
  @apply flex justify-between font-mono text-xs text-text-muted mt-1;
}

/* ── Hint horizonte mínimo ── */
.slider-hint {
  @apply text-xs font-body text-text-muted mt-2 italic;
}
</style>
