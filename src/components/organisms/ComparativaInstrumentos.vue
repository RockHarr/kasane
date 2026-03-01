<script setup lang="ts">
// ComparativaInstrumentos: muestra qué genera cada instrumento con los parámetros del usuario.
// Responsabilidad: calcular DCA individual por instrumento, ordenar según meta del usuario,
// y personalizar copy por género+horizonte (neuromarketing).
import { computed } from 'vue'
import { INSTRUMENTOS } from '@/data/instruments'
import { METAS } from '@/data/metas'
import { calcularDCA } from '@/services/calculations'
import BaseBadge from '@/components/atoms/BaseBadge.vue'
import type { BadgeVariant, MetaId } from '@/types'

interface Props {
  capital: number       // excedente disponible hoy (capitalInicial DCA)
  aporteMensual: number // aporte mensual
  horizonte: number     // meses
  primeraVez?: boolean  // muestra tip para usuarios sin simulaciones previas
  genero?: 'M' | 'F' | null // personaliza el copy del subtítulo (neuromarketing)
  meta?: MetaId | null       // ordena instrumentos según categoría relevante para la meta
}

const props = withDefaults(defineProps<Props>(), {
  primeraVez: false,
  genero: null,
  meta: null,
})

const emit = defineEmits<{
  explorar: []
}>()

// ─── Config de categorías ───────────────────────────────────────
const CATEGORIA: Record<string, { label: string; variant: BadgeVariant; emoji: string }> = {
  liquidez:     { label: 'Liquidez',     variant: 'neutral', emoji: '🛡️' },
  rentabilidad: { label: 'Rentabilidad', variant: 'growth',  emoji: '📊' },
  potencial:    { label: 'Potencial',    variant: 'alert',   emoji: '🚀' },
}

// Categoría de instrumento sugerida por la meta del usuario
const categoriaMetaActual = computed(() =>
  props.meta ? (METAS.find(m => m.id === props.meta)?.categoriaInstr ?? null) : null
)

// ─── Cálculo comparativo ────────────────────────────────────────
const resultados = computed(() => {
  const cat = categoriaMetaActual.value

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
      // 1. Disponibles antes que no disponibles
      if (a.disponible && !b.disponible) return -1
      if (!a.disponible && b.disponible) return 1
      // 2. Si hay meta: categoría recomendada va primero
      if (cat) {
        const aEsMeta = a.inst.categoria === cat ? -1 : 0
        const bEsMeta = b.inst.categoria === cat ? -1 : 0
        if (aEsMeta !== bEsMeta) return aEsMeta - bEsMeta
      }
      // 3. Mayor valor final
      return (b.valorFinal ?? 0) - (a.valorFinal ?? 0)
    })
})

// El mejor resultado disponible (para highlight principal)
const mejorId = computed(() => resultados.value.find(r => r.disponible)?.inst.id ?? null)

// El primer instrumento disponible que coincide con la categoría de la meta
const recomendadoMetaId = computed(() => {
  const cat = categoriaMetaActual.value
  if (!cat || !props.meta) return null
  return resultados.value.find(r => r.disponible && r.inst.categoria === cat)?.inst.id ?? null
})

// ─── Copy personalizado ─────────────────────────────────────────

// Título: usa la meta cuando está disponible
const titulo = computed(() => {
  if (!props.meta) return '¿Qué puedes lograr?'
  const m = METAS.find(x => x.id === props.meta)
  return m ? `Para tu ${m.label.toLowerCase()} ${m.emoji}` : '¿Qué puedes lograr?'
})

// Subtítulo: diferenciado por género + horizonte (neuromarketing Klaric)
// F + corto: seguridad/descanso. F + largo: libertad/diseño de vida.
// M + corto: resultado concreto. M + largo: construcción/control.
const comparativaSub = computed(() => {
  const h = props.horizonte
  const g = props.genero
  const monto = formatCLP(props.aporteMensual)
  const plazo = h === 6 ? '6 meses' : h === 12 ? '1 año' : h === 24 ? '2 años' : '3 años'

  if (g === 'F' && h <= 6) {
    return `Con ${monto}/mes durante ${plazo}, tu dinero trabaja aunque tú descanses:`
  }
  if (g === 'F' && h === 12) {
    return `Con ${monto}/mes durante ${plazo}, cada mes es una capa más hacia lo que mereces:`
  }
  if (g === 'F' && h >= 24) {
    return `Con ${monto}/mes durante ${plazo}, cada capa te acerca a la vida que diseñas:`
  }
  if (g === 'M' && h <= 6) {
    return `Con ${monto}/mes durante ${plazo}, resultados concretos en poco tiempo:`
  }
  if (g === 'M' && h === 12) {
    return `Con ${monto}/mes durante ${plazo}, en un año ya ves el portafolio tomar forma:`
  }
  if (g === 'M' && h >= 24) {
    return `Con ${monto}/mes durante ${plazo}, construyes un motor que trabaja solo:`
  }
  return `Con ${monto}/mes durante ${plazo}, cada opción te daría:`
})

// Tip primera vez: adaptado a la categoría de la meta
const tipTexto = computed(() => {
  const cat = categoriaMetaActual.value
  if (cat === 'liquidez') {
    return '💡 Para tu meta, Tenpo o MercadoPago son el punto de entrada ideal — sin riesgo, retiras cuando lo necesites.'
  }
  if (cat === 'rentabilidad') {
    return '💡 Para tu meta a mediano plazo, Fintual es una entrada sólida — más retorno que una cuenta de ahorro, sin complejidad.'
  }
  if (cat === 'potencial') {
    return '💡 Para tu horizonte largo, considera empezar con Fintual y después explorar VTI cuando te familiarices con la volatilidad.'
  }
  // sin meta
  return '💡 Si es tu primera vez, empieza por Tenpo o MercadoPago — sin riesgo, sin mínimo, retiras cuando quieras.'
})

function formatCLP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CL')
}
</script>

<template>
  <section class="comparativa" aria-label="Comparativa de instrumentos">
    <header class="comparativa-header">
      <h2 class="comparativa-title">{{ titulo }}</h2>
      <p class="comparativa-sub">{{ comparativaSub }}</p>
      <!-- Tip primera vez: adaptado a la categoría de la meta -->
      <p v-if="primeraVez" class="comparativa-tip">{{ tipTexto }}</p>
    </header>

    <ul class="comparativa-list" role="list">
      <li
        v-for="r in resultados"
        :key="r.inst.id"
        class="comparativa-row"
        :class="{
          'is-best': r.inst.id === mejorId,
          'is-meta': r.inst.id === recomendadoMetaId && r.inst.id !== mejorId,
          'is-unavailable': !r.disponible,
        }"
        :aria-label="r.inst.name"
      >
        <!-- Dot color del instrumento -->
        <span
          class="inst-dot"
          :style="{ background: r.inst.color }"
          aria-hidden="true"
        />

        <!-- Nombre + badge categoría + badge meta -->
        <div class="inst-info">
          <span class="inst-name">{{ r.inst.name }}</span>
          <BaseBadge
            :variant="CATEGORIA[r.inst.categoria].variant"
            size="sm"
          >
            {{ CATEGORIA[r.inst.categoria].emoji }}
            {{ CATEGORIA[r.inst.categoria].label }}
          </BaseBadge>
          <span
            v-if="r.inst.id === recomendadoMetaId"
            class="meta-rec-badge"
            aria-label="Recomendado para tu meta"
          >✓ tu meta</span>
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

.comparativa-tip {
  @apply font-body text-sm text-text-muted mt-2;
  @apply bg-accent-neutral/5 border border-accent-neutral/20 rounded-lg px-3 py-2;
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

/* Instrumento recomendado por la meta (cuando no es el mejor absoluto) */
.comparativa-row.is-meta {
  @apply border-accent-neutral/25 bg-accent-neutral/5;
}

.comparativa-row.is-unavailable {
  @apply opacity-50;
}

/* Badge inline "✓ tu meta" */
.meta-rec-badge {
  @apply font-body text-[10px] font-semibold text-accent-neutral;
  @apply bg-accent-neutral/10 border border-accent-neutral/20 rounded-full px-2 py-0.5;
  @apply whitespace-nowrap shrink-0;
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
