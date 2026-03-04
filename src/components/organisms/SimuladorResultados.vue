<script setup lang="ts">
/**
 * SimuladorResultados — Kasane Simulator v2.0
 * (antes: OCASimulator)
 *
 * Muestra la comparativa "Bajo el colchón" vs "Magia Compuesta"
 * para un instrumento seleccionado. Ambos valores se muestran en CLP
 * con equivalencia secundaria en USD.
 *
 * Props:
 *   - profile: perfil del usuario (horizonte, aporteMensual, excedente)
 *   - instrumento: instrumento seleccionado actualmente
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
  instrumento: Instrument
}

const props = defineProps<Props>()

/** Total que acumularía guardando sin invertir */
const totalAportado = computed(() =>
  props.profile.excedente + props.profile.aporteMensual * props.profile.horizonte
)

/** Proyección DCA con el instrumento seleccionado */
const resultado = computed(() =>
  calcularDCA({
    capitalInicial: props.profile.excedente,
    aporteMensual: props.profile.aporteMensual,
    horizonte: props.profile.horizonte,
    tasaAnual: props.instrumento.tasaAnual,
  })
)

const ganancia = computed(() => resultado.value.ganancia)
const valorFinal = computed(() => resultado.value.valorFinal)
const rentabilidad = computed(() => resultado.value.rentabilidadTotal)
const enGanancia = computed(() => ganancia.value > 0)

/** Etiqueta legible del horizonte (años + meses) */
const horizonteLabel = computed(() => {
  const meses = props.profile.horizonte
  const años = Math.floor(meses / 12)
  const resto = meses % 12
  if (años === 0) return `${meses} meses`
  if (resto === 0) return `${años} año${años > 1 ? 's' : ''}`
  return `${años} año${años > 1 ? 's' : ''} y ${resto} mes${resto > 1 ? 'es' : ''}`
})
</script>

<template>
  <section class="sr-section" aria-label="Comparativa de estrategias">
    <!-- Badges de contexto -->
    <div class="sr-meta">
      <BaseBadge variant="neutral" size="sm">{{ horizonteLabel }}</BaseBadge>
      <BaseBadge variant="growth" size="sm">
        {{ (instrumento.tasaAnual * 100).toFixed(1) }}% anual — {{ instrumento.name }}
      </BaseBadge>
    </div>

    <!-- Kasane Educa -->
    <BaseCard variant="bordered" padding="md" class="sr-edu-banner">
      <div class="sr-edu-content">
        <span class="sr-edu-icon" aria-hidden="true">💡</span>
        <div>
          <p class="sr-edu-title">Kasane Educa: El poder de la constancia</p>
          <p class="sr-edu-desc">
            Esta proyección asume que invertirás tu aporte todos los meses sin fallar, independiente
            de si el mercado sube o baja. Esta técnica reduce el riesgo promedio de tus compras
            (Dollar Cost Averaging — DCA).
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Comparativa: 2 cards -->
    <div class="sr-comparison">
      <!-- Bajo el colchón -->
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

      <!-- Magia Compuesta -->
      <BaseCard
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
    </div>

    <!-- Disclaimer -->
    <p class="sr-disclaimer">
      * Proyecciones basadas en rendimientos históricos. Los resultados reales pueden variar.
      No constituye asesoría financiera.
    </p>
  </section>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.sr-section {
  @apply flex flex-col gap-5;
}

.sr-meta {
  @apply flex items-center gap-2 flex-wrap;
}

/* Edu banner */
.sr-edu-banner {
  @apply bg-accent-neutral/5 border-accent-neutral/20;
}
.sr-edu-content {
  @apply flex items-start gap-3;
}
.sr-edu-icon {
  @apply text-xl mt-0.5 shrink-0;
}
.sr-edu-title {
  @apply font-heading text-sm font-semibold text-accent-neutral mb-0.5;
}
.sr-edu-desc {
  @apply font-body text-xs text-text-secondary leading-relaxed;
}

/* Comparativa */
.sr-comparison {
  @apply grid grid-cols-1 gap-4;
}
@media (min-width: 640px) {
  .sr-comparison { @apply grid-cols-2; }
}

.sr-card {
  @apply flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-0.5;
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
</style>
