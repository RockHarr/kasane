<script setup lang="ts">
/**
 * InstrumentoSelector — Kasane Simulator v2.1
 *
 * Chips seleccionables horizontales — reemplaza el dropdown anterior.
 * Todas las opciones visibles sin abrir nada, scroll horizontal en mobile.
 *
 * Props:
 *   - modelValue: ID del instrumento actualmente seleccionado
 *   - instrumentos: catálogo completo de Instrument[]
 *   - destacadoId: ID del instrumento a marcar como "Recomendado ⭐"
 *
 * Emits:
 *   - update:modelValue: cuando el usuario cambia la selección
 */
import type { Instrument } from '@/data/instruments'

interface Props {
  modelValue: string
  instrumentos: Instrument[]
  /** Instrumento a destacar como recomendado (viene del dashboard) */
  destacadoId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

/** Emoji según categoría del instrumento */
function categoriaEmoji(cat: Instrument['categoria']): string {
  return { liquidez: '💧', rentabilidad: '📈', potencial: '🚀' }[cat]
}

/** Clase de riesgo para el badge pequeño */
function riegoBadgeClass(riesgo: Instrument['riesgo']): string {
  return {
    bajo: 'chip-badge--bajo',
    medio: 'chip-badge--medio',
    alto: 'chip-badge--alto',
  }[riesgo]
}
</script>

<template>
  <div class="is-root">
    <p class="is-label">¿Con qué instrumento quieres proyectar?</p>

    <!-- Chips en scroll horizontal -->
    <div class="is-rail" role="radiogroup" :aria-label="'Seleccionar instrumento'">
      <button
        v-for="inst in instrumentos"
        :key="inst.id"
        class="is-chip"
        :class="{ 'is-chip--selected': inst.id === modelValue }"
        :style="{ '--c': inst.color }"
        role="radio"
        :aria-checked="inst.id === modelValue"
        @click="emit('update:modelValue', inst.id)"
      >
        <!-- Ícono + nombre -->
        <span class="is-chip-top">
          <span class="is-chip-emoji" aria-hidden="true">{{ categoriaEmoji(inst.categoria) }}</span>
          <span class="is-chip-name">{{ inst.name }}</span>
          <span v-if="inst.id === destacadoId" class="is-chip-star" title="Recomendado">⭐</span>
        </span>

        <!-- Tasa + riesgo -->
        <span class="is-chip-bottom">
          <span class="is-chip-rate">{{ (inst.tasaAnual * 100).toFixed(1) }}% anual</span>
          <span class="is-chip-badge" :class="riegoBadgeClass(inst.riesgo)">{{ inst.riesgo }}</span>
        </span>

        <!-- Indicador de selección -->
        <span v-if="inst.id === modelValue" class="is-chip-check" aria-hidden="true">✓</span>
      </button>
    </div>

    <!-- Descripción del instrumento seleccionado -->
    <Transition name="is-fade">
      <p
        v-if="instrumentos.find(i => i.id === modelValue)?.descripcion"
        class="is-desc"
      >
        {{ instrumentos.find(i => i.id === modelValue)?.descripcion }}
      </p>
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.is-root {
  @apply flex flex-col gap-3;
}

.is-label {
  @apply font-heading text-sm font-semibold text-text-secondary;
}

/* Rail de chips — scroll horizontal en mobile */
.is-rail {
  @apply flex gap-2.5 overflow-x-auto pb-1;
  /* Ocultar scrollbar pero mantener funcionalidad */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.is-rail::-webkit-scrollbar {
  display: none;
}

/* Chip individual */
.is-chip {
  @apply relative flex flex-col gap-1.5 shrink-0;
  @apply bg-bg-primary border-2 border-white/8 rounded-xl px-3.5 py-3;
  @apply cursor-pointer transition-all duration-200 text-left;
  @apply hover:border-[var(--c)] hover:bg-white/3;
  min-width: 140px;
  max-width: 160px;
}

.is-chip--selected {
  border-color: var(--c);
  background: color-mix(in srgb, var(--c) 10%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--c) 25%, transparent);
}

/* Contenido superior: emoji + nombre + star */
.is-chip-top {
  @apply flex items-center gap-1.5;
}

.is-chip-emoji {
  @apply text-base leading-none;
}

.is-chip-name {
  @apply font-heading text-xs font-bold text-text-primary leading-tight;
  /* Permite wrap en 2 líneas para nombres largos como 'Fintual Moderado' */
  white-space: normal;
  max-width: 90px;
}

.is-chip-star {
  @apply text-xs leading-none ml-auto;
}

/* Contenido inferior: tasa + badge riesgo */
.is-chip-bottom {
  @apply flex items-center gap-1.5 justify-between;
}

.is-chip-rate {
  @apply font-mono text-xs font-semibold;
  color: var(--c, var(--color-accent-growth, #00ffaa));
}

.is-chip-badge {
  @apply font-body text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full;
}

.chip-badge--bajo  { @apply bg-accent-growth/10 text-accent-growth; }
.chip-badge--medio { @apply bg-accent-neutral/10 text-accent-neutral; }
.chip-badge--alto  { @apply bg-accent-alert/10 text-accent-alert; }

/* Check de selección — esquina superior derecha */
.is-chip-check {
  @apply absolute top-2 right-2 text-[10px] font-bold;
  color: var(--c);
}

/* Descripción del instrumento seleccionado */
.is-desc {
  @apply font-body text-xs text-text-muted leading-relaxed;
  @apply bg-white/3 rounded-lg px-3 py-2 border border-white/5;
}

/* Fade de la descripción */
.is-fade-enter-active,
.is-fade-leave-active {
  transition: opacity 0.2s ease;
}
.is-fade-enter-from,
.is-fade-leave-to {
  opacity: 0;
}
</style>
