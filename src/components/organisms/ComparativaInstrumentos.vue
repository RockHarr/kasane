<script setup lang="ts">
// ComparativaInstrumentos: muestra qué genera cada instrumento con los parámetros del usuario.
// Responsabilidad: calcular DCA individual por instrumento y presentarlo como tabla comparativa.
import { computed } from 'vue'
import { INSTRUMENTOS } from '@/data/instruments'
import { calcularDCA } from '@/services/calculations'
import BaseBadge from '@/components/atoms/BaseBadge.vue'
import type { BadgeVariant } from '@/types'

interface Props {
  capital: number       // excedente disponible hoy (capitalInicial DCA)
  aporteMensual: number // aporte mensual
  horizonte: number     // meses
}

const props = defineProps<Props>()

const emit = defineEmits<{
  explorar: []
}>()

// ─── Config de categorías ───────────────────────────────────────
const CATEGORIA: Record<string, { label: string; variant: BadgeVariant; emoji: string }> = {
  liquidez:     { label: 'Liquidez',     variant: 'neutral', emoji: '🛡️' },
  rentabilidad: { label: 'Rentabilidad', variant: 'growth',  emoji: '📊' },
  potencial:    { label: 'Potencial',    variant: 'alert',   emoji: '🚀' },
}

// ─── Cálculo comparativo ────────────────────────────────────────
const resultados = computed(() => {
  return INSTRUMENTOS
    .map(inst => {
      const disponible = props.horizonte >= inst.horizonteMinimo
      if (!disponible) {
        return { inst, valorFinal: null, ganancia: null, disponible: false }
      }
      const r = calcularDCA({
        capitalInicial: props.capital,
        aporteMensual: props.aporteMensual,
        horizonte: props.horizonte,
        tasaAnual: inst.tasaAnual,
      })
      return { inst, valorFinal: r.valorFinal, ganancia: r.ganancia, disponible: true }
    })
    .sort((a, b) => {
      if (a.disponible && !b.disponible) return -1
      if (!a.disponible && b.disponible) return 1
      return (b.valorFinal ?? 0) - (a.valorFinal ?? 0)
    })
})

// El mejor resultado disponible (para highlight)
const mejorId = computed(() => resultados.value.find(r => r.disponible)?.inst.id ?? null)

function formatCLP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CL')
}
</script>

<template>
  <section class="comparativa" aria-label="Comparativa de instrumentos">
    <header class="comparativa-header">
      <h2 class="comparativa-title">¿Qué puedes lograr?</h2>
      <p class="comparativa-sub">
        Con <strong class="text-text-primary">{{ formatCLP(aporteMensual) }}/mes</strong>
        durante <strong class="text-text-primary">{{ horizonte }} meses</strong>,
        cada opción te daría:
      </p>
    </header>

    <ul class="comparativa-list" role="list">
      <li
        v-for="r in resultados"
        :key="r.inst.id"
        class="comparativa-row"
        :class="{ 'is-best': r.inst.id === mejorId, 'is-unavailable': !r.disponible }"
        :aria-label="r.inst.name"
      >
        <!-- Dot color del instrumento -->
        <span
          class="inst-dot"
          :style="{ background: r.inst.color }"
          aria-hidden="true"
        />

        <!-- Nombre + badge categoría -->
        <div class="inst-info">
          <span class="inst-name">{{ r.inst.name }}</span>
          <BaseBadge
            :variant="CATEGORIA[r.inst.categoria].variant"
            size="sm"
          >
            {{ CATEGORIA[r.inst.categoria].emoji }}
            {{ CATEGORIA[r.inst.categoria].label }}
          </BaseBadge>
        </div>

        <!-- Valor o nota de no disponible -->
        <div v-if="r.disponible" class="inst-resultado">
          <span class="inst-valor">{{ formatCLP(r.valorFinal!) }}</span>
          <span class="inst-ganancia">
            +{{ formatCLP(r.ganancia!) }} generados
          </span>
        </div>
        <div v-else class="inst-nodisponible">
          <span>Mínimo {{ r.inst.horizonteMinimo }} meses</span>
        </div>

        <!-- Tasa anual -->
        <span class="inst-tasa">{{ (r.inst.tasaAnual * 100).toFixed(1) }}%/año</span>
      </li>
    </ul>

    <!-- CTA -->
    <div class="comparativa-cta">
      <p class="cta-hint">Estas son proyecciones basadas en retornos históricos. No garantizan rendimiento futuro.</p>
      <button class="cta-btn" @click="emit('explorar')">
        Explorar y personalizar mezclas →
      </button>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.comparativa {
  @apply flex flex-col gap-6;
}

.comparativa-header {
  @apply flex flex-col gap-1;
}

.comparativa-title {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.comparativa-sub {
  @apply font-body text-sm text-text-secondary;
}

/* Lista */
.comparativa-list {
  @apply flex flex-col gap-2;
}

.comparativa-row {
  @apply flex items-center gap-3 bg-bg-elevated rounded-xl px-4 py-3.5;
  @apply border border-white/5 transition-colors duration-200;
}

.comparativa-row.is-best {
  @apply border-accent-growth/30 bg-accent-growth/5;
}

.comparativa-row.is-unavailable {
  @apply opacity-50;
}

/* Dot */
.inst-dot {
  @apply w-2.5 h-2.5 rounded-full shrink-0;
}

/* Info */
.inst-info {
  @apply flex items-center gap-2 flex-1 min-w-0;
}

.inst-name {
  @apply font-body text-sm font-medium text-text-primary whitespace-nowrap;
}

/* Resultado */
.inst-resultado {
  @apply flex flex-col items-end shrink-0;
}

.inst-valor {
  @apply font-mono text-base font-bold text-text-primary;
}

.inst-ganancia {
  @apply font-mono text-xs text-accent-growth;
}

/* No disponible */
.inst-nodisponible {
  @apply font-body text-xs text-text-muted shrink-0;
}

/* Tasa */
.inst-tasa {
  @apply font-mono text-xs text-text-muted shrink-0 w-16 text-right;
}

/* CTA */
.comparativa-cta {
  @apply flex flex-col gap-2 pt-2;
}

.cta-hint {
  @apply font-body text-xs text-text-muted;
}

.cta-btn {
  @apply font-heading text-sm font-semibold text-accent-growth;
  @apply hover:text-accent-growth/80 transition-colors text-left;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded;
}
</style>
