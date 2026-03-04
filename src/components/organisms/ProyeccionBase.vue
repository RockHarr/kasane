<script setup lang="ts">
// ProyeccionBase: muestra el capital acumulado vs ganancia potencial.
// Responsabilidad: destacar el esfuerzo de ahorro puro versus el impacto del interés compuesto.
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseBadge from '@/components/atoms/BaseBadge.vue'
import { equivalenciaUSD } from '@/data/divisas'
import type { MetaId } from '@/types'
import { METAS } from '@/data/metas'

interface Props {
  capital: number       // excedente inicial
  aporteMensual: number // aporte todos los meses
  horizonte: number     // meses
  meta?: MetaId | null
}

const props = defineProps<Props>()

const router = useRouter()

// ─── Cálculos Base ──────────────────────────────────────────────
const totalAportado = computed(() => {
  return props.capital + (props.aporteMensual * props.horizonte)
})

// Tasa Tenpo Control — instrumento conservador de referencia para el dashboard
// Cuando el usuario hace click en el CTA, el simulador pre-selecciona Tenpo.
const INSTRUMENTO_DESTACADO = 'tenpo'
const TASA_ANUAL_MOCK = 0.07  // 7% anual — Tenpo Control
const TASA_MENSUAL_MOCK = TASA_ANUAL_MOCK / 12

// Fórmula DCA para ganancia compuesta
const valorInvertido = computed(() => {
  const r = TASA_MENSUAL_MOCK
  const n = props.horizonte
  const p = props.aporteMensual

  // Valor futuro del capital inicial
  const vfCapital = props.capital * Math.pow(1 + r, n)
  
  // Valor futuro de las anualidades (aportes)
  const vfAportes = p * ((Math.pow(1 + r, n) - 1) / r)

  return vfCapital + vfAportes
})

const gananciaPotencial = computed(() => valorInvertido.value - totalAportado.value)

// ─── Formateo ───────────────────────────────────────────────────
function formatCLP(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}

const metaData = computed(() =>
  props.meta ? METAS.find(m => m.id === props.meta) : null
)

// Barras proporcionales para el gráfico simple
const MAX_BAR_WIDTH = 100 // %
const ahorradoWidth = computed(() => {
  const ratio = totalAportado.value / valorInvertido.value
  return Math.round(ratio * 100)
})
</script>

<template>
  <section class="proyeccion-base" aria-label="Proyección Base">
    <header class="pb-header">
      <h2 class="pb-title">
        Proyección de tu Plan
        <span v-if="metaData" class="pb-meta-inline" aria-hidden="true">
          {{ metaData.emoji }}
        </span>
      </h2>
      <p class="pb-sub">Descubre el poder de poner tu dinero a trabajar.</p>

      <!-- Params strip -->
      <div class="pb-params" aria-label="Parámetros activos">
        <span class="pb-param-chip">💰 ${{ props.aporteMensual.toLocaleString('es-CL') }}/mes</span>
        <span class="pb-param-sep" aria-hidden="true">·</span>
        <span class="pb-param-chip">📅 {{ props.horizonte }} meses</span>
        <template v-if="metaData">
          <span class="pb-param-sep" aria-hidden="true">·</span>
          <span class="pb-param-chip pb-param-chip--meta">{{ metaData.emoji }} {{ metaData.label }}</span>
        </template>
      </div>
    </header>

    <div class="pb-comparison">
      <!-- Escenario 1: Solo Ahorrar -->
      <BaseCard variant="elevated" padding="md" class="pb-card relative overflow-hidden">
        <div class="pb-card-content">
          <BaseBadge variant="neutral" size="sm" class="mb-2">Escenario Conservador</BaseBadge>
          <h3 class="pb-scenario-title">Bajo el colchón</h3>
          <p class="pb-scenario-desc">Si solo guardas tu plata sin que genere retornos.</p>
          
          <div class="pb-value-group mt-6">
            <span class="pb-value text-text-primary">{{ formatCLP(totalAportado) }}</span>
            <span class="pb-label">Línea base</span>
          </div>

          <!-- Gráfico visual -->
          <div class="pb-bar-container mt-4">
            <div class="pb-bar bg-accent-neutral/30 w-full" />
            <span class="pb-bar-label">100% tu esfuerzo</span>
          </div>
        </div>
      </BaseCard>

      <!-- Escenario 2: Invertir -->
      <BaseCard variant="bordered" padding="md" class="pb-card border-accent-growth/40 bg-accent-growth/5 relative overflow-hidden">
        <div class="pb-card-content">
          <BaseBadge variant="growth" size="sm" class="mb-2">Invirtiendo con Tenpo (~7% anual)</BaseBadge>
          <h3 class="pb-scenario-title">Magia Compuesta</h3>
          <p class="pb-scenario-desc">Dejando que tu dinero genere más dinero.</p>
          
          <div class="pb-value-group mt-6">
            <div class="flex items-baseline gap-2">
              <span class="pb-value text-accent-growth">{{ formatCLP(valorInvertido) }}</span>
            </div>
            <span class="pb-usd-equiv">{{ equivalenciaUSD(valorInvertido) }}</span>
            <span class="pb-label text-accent-growth/80">+{{ formatCLP(gananciaPotencial) }} de ganancia *</span>
          </div>

          <!-- Gráfico visual -->
          <div class="pb-bar-container mt-4">
            <div class="flex h-2 w-full rounded-full overflow-hidden">
              <div class="bg-accent-neutral/30" :style="{ width: `${ahorradoWidth}%` }" title="Tu esfuerzo" />
              <div class="bg-accent-growth" :style="{ width: `${100 - ahorradoWidth}%` }" title="Intereses ganados" />
            </div>
            <div class="flex justify-between w-full">
              <span class="pb-bar-label">Esfuerzo</span>
              <span class="pb-bar-label text-accent-growth font-bold">Ganancia</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- CTA -->
    <div class="pb-cta">
      <button class="pb-btn" @click="router.push({ name: 'simulator', query: { instrumento: INSTRUMENTO_DESTACADO } })">
        Descubrir cómo lograr esto en el Simulador →
      </button>
      <p class="pb-disclaimer">* Proyección referencial calculada a una tasa del 7% anual con Tenpo Control. En el simulador podrás explorar otros instrumentos con distintas tasas de retorno.</p>
    </div>
  </section>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.proyeccion-base {
  @apply flex flex-col gap-8;
}

/* Header */
.pb-header {
  @apply flex flex-col gap-1;
}

.pb-title {
  @apply font-heading text-2xl font-bold text-text-primary flex items-center gap-2;
}

.pb-sub {
  @apply font-body text-sm text-text-secondary;
}

/* Params strip dentro de la tarjeta */
.pb-params {
  @apply flex flex-wrap items-center gap-x-2 gap-y-1 mt-1;
}

.pb-param-chip {
  @apply font-mono text-xs font-medium text-text-secondary;
}

.pb-param-chip--meta {
  @apply font-body text-accent-growth/80;
}

.pb-param-sep {
  @apply text-text-muted text-xs;
}

/* Grillas */
.pb-comparison {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.pb-card {
  @apply flex flex-col justify-between h-full transition-transform duration-300 hover:-translate-y-1;
}

.pb-scenario-title {
  @apply font-heading text-lg font-bold text-text-primary mt-1;
}

.pb-scenario-desc {
  @apply font-body text-xs text-text-muted;
}

/* Valores */
.pb-value-group {
  @apply flex flex-col gap-0.5 mt-auto;
}

.pb-value {
  @apply font-mono text-3xl font-extrabold tracking-tight;
}

.pb-label {
  @apply font-body text-xs font-medium uppercase tracking-wider;
}

.pb-usd-equiv {
  @apply font-mono text-xs text-text-muted;
}

/* Barras simples */
.pb-bar-container {
  @apply flex flex-col gap-1 mt-auto;
}

.pb-bar {
  @apply h-2 rounded-full;
}

.pb-bar-label {
  @apply font-body text-[10px] text-text-muted uppercase tracking-wider mt-1;
}

/* CTA */
.pb-cta {
  @apply flex flex-col items-center gap-5 mt-6;
}

.pb-btn {
  @apply w-full md:w-auto bg-accent-growth text-bg-primary font-heading font-bold text-base px-8 py-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300;
  @apply hover:bg-[#00e699] hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent-growth)_40%,transparent)] hover:-translate-y-0.5;
  @apply active:scale-95;
}

.pb-disclaimer {
  @apply font-body text-xs text-text-secondary text-center max-w-lg leading-relaxed;
  @apply border border-white/5 bg-white/3 rounded-lg px-4 py-3;
}
</style>
