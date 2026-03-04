<script setup lang="ts">
/**
 * SimuladorResultados v2.1 — Kasane Simulator
 *
 * Muestra la comparativa de la estrategia de inversión.
 * - "Bajo el colchón": siempre visible — línea base de ahorro puro
 * - "Magia Compuesta": aparece solo cuando hay un instrumento seleccionado
 *
 * Props:
 *   - profile: perfil del usuario (horizonte, aporteMensual, excedente)
 *   - instrumento: instrumento seleccionado (null = sin selección)
 */
import { computed } from 'vue'
import type { UserProfile } from '@/types'
import type { Instrument } from '@/data/instruments'
import { calcularDCA } from '@/services/calculations'
import { formatCLP, equivalenciaUSD } from '@/data/divisas'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseBadge from '@/components/atoms/BaseBadge.vue'

interface Props {
  profile: UserProfile
  instrumento: Instrument | null
}

const props = defineProps<Props>()

/** Total acumulado sin invertir */
const totalAportado = computed(() =>
  props.profile.excedente + props.profile.aporteMensual * props.profile.horizonte
)

/** Proyección DCA con el instrumento seleccionado */
const resultado = computed(() => {
  if (!props.instrumento) return null
  return calcularDCA({
    capitalInicial: props.profile.excedente,
    aporteMensual: props.profile.aporteMensual,
    horizonte: props.profile.horizonte,
    tasaAnual: props.instrumento.tasaAnual,
  })
})

const ganancia     = computed(() => resultado.value?.ganancia ?? 0)
const valorFinal   = computed(() => resultado.value?.valorFinal ?? 0)
const rentabilidad = computed(() => resultado.value?.rentabilidadTotal ?? 0)
const enGanancia   = computed(() => ganancia.value > 0)
</script>

<template>
  <div class="sr-root">
    <!-- ── Bajo el colchón — siempre visible ───────────────── -->
    <BaseCard variant="elevated" padding="md" class="sr-card">
      <BaseBadge variant="neutral" size="sm" class="mb-2">Sin invertir</BaseBadge>
      <h3 class="sr-scenario-title">Bajo el colchón</h3>
      <p class="sr-scenario-desc">Guardas tu plata sin que trabaje por ti.</p>
      <div class="sr-value-group">
        <span class="sr-value sr-value--neutral">{{ formatCLP(totalAportado) }}</span>
        <span class="sr-usd">{{ equivalenciaUSD(totalAportado) }}</span>
        <span class="sr-label">100% tu esfuerzo</span>
      </div>
    </BaseCard>

    <!-- ── Magia Compuesta — solo con instrumento seleccionado ─ -->
    <Transition name="magia-reveal">
      <BaseCard
        v-if="instrumento && resultado"
        variant="bordered"
        padding="md"
        class="sr-card sr-card--highlight"
        :style="{ '--instr-color': instrumento.color }"
      >
        <BaseBadge variant="growth" size="sm" class="mb-2">
          {{ instrumento.name }} · {{ (instrumento.tasaAnual * 100).toFixed(1) }}% anual
        </BaseBadge>
        <h3 class="sr-scenario-title">Magia Compuesta ✨</h3>
        <p class="sr-scenario-desc">Tu dinero genera más dinero mientras duermes.</p>
        <div class="sr-value-group">
          <span class="sr-value" :style="{ color: instrumento.color }">{{ formatCLP(valorFinal) }}</span>
          <span class="sr-usd">{{ equivalenciaUSD(valorFinal) }}</span>
          <span
            class="sr-label"
            :class="enGanancia ? 'sr-label--gain' : ''"
            :style="enGanancia ? { color: instrumento.color } : {}"
          >
            +{{ formatCLP(ganancia) }} de ganancia · {{ rentabilidad.toFixed(1) }}%
          </span>
        </div>
      </BaseCard>
    </Transition>

    <!-- Disclaimer — solo cuando hay resultado -->
    <p v-if="instrumento" class="sr-disclaimer">
      * Proyecciones basadas en rendimientos históricos. Los resultados reales pueden variar.
      No constituye asesoría financiera.
    </p>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.sr-root {
  @apply flex flex-col gap-4;
}

.sr-card {
  @apply flex flex-col gap-2 transition-transform duration-300 hover:-translate-y-0.5;
}

.sr-card--highlight {
  border-color: color-mix(in srgb, var(--instr-color) 40%, transparent);
  background: color-mix(in srgb, var(--instr-color) 5%, transparent);
}

.sr-scenario-title {
  @apply font-heading text-lg font-bold text-text-primary;
}

.sr-scenario-desc {
  @apply font-body text-xs text-text-muted;
}

.sr-value-group {
  @apply flex flex-col gap-0.5 mt-2;
}

.sr-value {
  @apply font-mono text-3xl font-extrabold tracking-tight text-text-primary;
}

.sr-value--neutral {
  @apply text-text-secondary;
}

.sr-usd {
  @apply font-mono text-xs text-text-muted;
}

.sr-label {
  @apply font-body text-xs text-text-muted uppercase tracking-wider mt-1;
}

.sr-label--gain {
  @apply font-semibold;
}

.sr-disclaimer {
  @apply font-body text-xs text-text-muted italic;
}

/* Transición Magia Compuesta */
.magia-reveal-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.magia-reveal-leave-active {
  transition: opacity 0.2s ease;
}
.magia-reveal-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}
.magia-reveal-leave-to {
  opacity: 0;
}
</style>
