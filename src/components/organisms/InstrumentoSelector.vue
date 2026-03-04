<script setup lang="ts">
/**
 * InstrumentoSelector — Kasane Simulator v2.0
 *
 * Dropdown estilizado para que el usuario elija un único instrumento
 * de inversión. Reemplaza los sliders del InstrumentMixer para el
 * flujo principal (mobile-friendly).
 *
 * Props:
 *   - modelValue: ID del instrumento actualmente seleccionado
 *   - instrumentos: catálogo completo de Instrument[]
 *   - destacadoId: ID del instrumento a marcar como "Recomendado ⭐"
 *
 * Emits:
 *   - update:modelValue: cuando el usuario cambia la selección
 */
import { computed, ref } from 'vue'
import type { Instrument } from '@/data/instruments'

interface Props {
  modelValue: string
  instrumentos: Instrument[]
  /** Instrumento a destacar como recomendado (viene del dashboard) */
  destacadoId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

const isOpen = ref(false)

/** Instrumento actualmente seleccionado */
const seleccionado = computed(() =>
  props.instrumentos.find(i => i.id === props.modelValue) ?? props.instrumentos[0]
)

/** Emoji según categoría del instrumento */
function categoriaEmoji(cat: Instrument['categoria']): string {
  return { liquidez: '💧', rentabilidad: '📈', potencial: '🚀' }[cat]
}

/** Color de badge de riesgo */
function riesgoBadgeClass(riesgo: Instrument['riesgo']): string {
  return {
    bajo: 'badge--bajo',
    medio: 'badge--medio',
    alto: 'badge--alto',
  }[riesgo]
}

function seleccionar(id: string) {
  emit('update:modelValue', id)
  isOpen.value = false
}
</script>

<template>
  <div class="is-wrapper" :class="{ 'is-open': isOpen }">
    <label class="is-label">¿Con qué instrumento quieres proyectar?</label>

    <!-- Trigger -->
    <button
      class="is-trigger"
      :style="{ '--instr-color': seleccionado?.color ?? '#00ffaa' }"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="is-trigger-left">
        <span class="is-cat-emoji" aria-hidden="true">{{ categoriaEmoji(seleccionado.categoria) }}</span>
        <span class="is-trigger-name">{{ seleccionado.name }}</span>
        <span v-if="seleccionado.id === destacadoId" class="is-recommended" aria-label="Recomendado">⭐</span>
      </span>
      <span class="is-trigger-right">
        <span class="is-tasa">{{ (seleccionado.tasaAnual * 100).toFixed(1) }}% anual</span>
        <span class="is-arrow" aria-hidden="true">▾</span>
      </span>
    </button>

    <!-- Dropdown list -->
    <Transition name="is-drop">
      <ul v-if="isOpen" class="is-list" role="listbox" :aria-label="'Seleccionar instrumento'">
        <li
          v-for="inst in instrumentos"
          :key="inst.id"
          class="is-option"
          :class="{ 'is-option--selected': inst.id === modelValue }"
          :style="{ '--instr-color': inst.color }"
          role="option"
          :aria-selected="inst.id === modelValue"
          @click="seleccionar(inst.id)"
        >
          <div class="is-option-top">
            <span class="is-cat-emoji" aria-hidden="true">{{ categoriaEmoji(inst.categoria) }}</span>
            <span class="is-option-name">{{ inst.name }}</span>
            <span v-if="inst.id === destacadoId" class="is-recommended" title="Recomendado">⭐</span>
            <span class="is-option-badge" :class="riesgoBadgeClass(inst.riesgo)">{{ inst.riesgo }}</span>
            <span class="is-option-tasa">{{ (inst.tasaAnual * 100).toFixed(1) }}%</span>
          </div>
          <p class="is-option-desc">{{ inst.descripcion }}</p>
        </li>
      </ul>
    </Transition>

    <!-- Overlay para cerrar al hacer click fuera -->
    <div v-if="isOpen" class="is-overlay" @click="isOpen = false" />
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.is-wrapper {
  @apply relative flex flex-col gap-2;
}

.is-label {
  @apply font-heading text-sm font-semibold text-text-secondary;
}

/* Trigger */
.is-trigger {
  @apply w-full flex items-center justify-between gap-3;
  @apply bg-bg-elevated border-2 border-white/10 rounded-xl px-4 py-3.5;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:border-[var(--instr-color,theme(colors.white/20))];
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-growth;
}

.is-open .is-trigger {
  border-color: var(--instr-color, theme(colors.white / 20));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--instr-color) 30%, transparent);
}

.is-trigger-left {
  @apply flex items-center gap-2;
}

.is-cat-emoji {
  @apply text-xl leading-none;
}

.is-trigger-name {
  @apply font-heading text-base font-bold text-text-primary;
}

.is-recommended {
  @apply text-sm leading-none;
}

.is-trigger-right {
  @apply flex items-center gap-2 ml-auto;
}

.is-tasa {
  @apply font-mono text-sm font-semibold;
  color: var(--instr-color, theme(colors.accent-growth));
}

.is-arrow {
  @apply text-text-muted text-sm transition-transform duration-200;
}

.is-open .is-arrow {
  transform: rotate(180deg);
}

/* Dropdown */
.is-list {
  @apply absolute top-full left-0 right-0 z-50 mt-1;
  @apply bg-bg-elevated border border-white/10 rounded-xl overflow-hidden;
  @apply shadow-2xl shadow-black/40;
  @apply flex flex-col;
}

.is-option {
  @apply px-4 py-3 cursor-pointer transition-colors duration-150;
  @apply border-b border-white/5 last:border-b-0;
  @apply hover:bg-white/5;
}

.is-option--selected {
  background: color-mix(in srgb, var(--instr-color) 8%, transparent);
}

.is-option-top {
  @apply flex items-center gap-2 mb-1;
}

.is-option-name {
  @apply font-heading text-sm font-bold text-text-primary;
}

.is-option-desc {
  @apply font-body text-xs text-text-muted leading-relaxed pl-7;
}

.is-option-tasa {
  @apply font-mono text-xs font-bold ml-auto;
  color: var(--instr-color, theme(colors.accent-growth));
}

/* Badges de riesgo */
.is-option-badge {
  @apply font-body text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full;
}
.badge--bajo   { @apply bg-accent-growth/10 text-accent-growth; }
.badge--medio  { @apply bg-accent-neutral/10 text-accent-neutral; }
.badge--alto   { @apply bg-accent-alert/10 text-accent-alert; }

/* Overlay */
.is-overlay {
  @apply fixed inset-0 z-40;
}

/* Transición del dropdown */
.is-drop-enter-active,
.is-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.is-drop-enter-from,
.is-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
