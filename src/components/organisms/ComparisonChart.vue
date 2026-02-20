<script setup lang="ts">
// ComparisonChart: gráfica apexcharts multi-serie
//
// Versión 0.2.0: se migró de recibir `:snapshots` (single-series, mes a mes)
// a recibir `:series` (ApexAxisChartSeries) directamente, lo que permite
// el gráfico comparativo del InstrumentMixer.
//
// El modo de snaphots mes a mes se preserva como prop alternativa `snapshots`
// para no romper el OCASimulator existente — si se pasa snapshots, se
// construyen internamente dos series (valor total + total aportado) como antes.
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { DCAMonthSnapshot } from '@/services/calculations'

// Tipo local para las series (evita importar apexcharts global)
type LocalSeries = { name: string; data: (number | null)[]; color?: string }[]

interface Props {
  // ── Modo multi-serie (InstrumentMixer) ──
  // Series ya construidas por calcularMix(); el eje X corresponde a `categories`.
  series?: LocalSeries
  categories?: string[]  // etiquetas del eje X (ej: ['12m', '24m', '36m'])

  // ── Modo snapshot único (OCASimulator — legado, no romper) ──
  // Si se pasa snapshots, se ignoran series/categories y se construyen internamente.
  snapshots?: DCAMonthSnapshot[]

  label?: string
  chartType?: 'area' | 'line'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Proyección comparativa',
  chartType: 'area',
})

// ── Construir series según el modo ──────────────────────────────

const resolvedSeries = computed<LocalSeries>(() => {
  // Modo legado: reconstruir desde snapshots mes a mes
  if (props.snapshots && props.snapshots.length > 0) {
    return [
      {
        name: 'Valor total',
        data: props.snapshots.map(s => s.valorTotal),
        color: '#00ffaa',
      },
      {
        name: 'Total aportado',
        data: props.snapshots.map(s => s.totalAportado),
        color: '#3b82f6',
      },
    ]
  }
  return props.series ?? []
})

const resolvedCategories = computed<string[]>(() => {
  if (props.snapshots && props.snapshots.length > 0) {
    return props.snapshots.map(s => (s.mes === 0 ? 'Hoy' : `M${s.mes}`))
  }
  return props.categories ?? []
})

// ── Configuración ApexCharts ────────────────────────────────────

const chartOptions = computed(() => ({
  chart: {
    type: props.chartType,
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: 'JetBrains Mono, monospace',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 600,
    },
  },
  // Si la serie tiene color definido, ApexCharts lo usa por serie
  colors: resolvedSeries.value.map(s => s.color ?? '#6b7280'),
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.25,
      opacityTo: 0.03,
      stops: [0, 100],
    },
  },
  stroke: {
    curve: 'smooth' as const,
    width: 2,
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.05)',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    categories: resolvedCategories.value,
    labels: {
      style: { colors: '#6b7280', fontSize: '11px' },
      formatter: (val: string, idx: number) => {
        // En modo snapshot mes a mes: mostrar solo algunos ticks para no saturar
        if (props.snapshots) {
          const total = resolvedCategories.value.length
          if (total <= 13) return val
          if (idx === 0 || idx === total - 1 || idx % 12 === 0) return val
          return ''
        }
        // En modo hitos: mostrar todos los labels (son pocos)
        return val
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#6b7280', fontSize: '11px' },
      formatter: (val: number) =>
        val >= 1000
          ? `$${(val / 1000).toFixed(0)}k`
          : `$${val.toFixed(0)}`,
    },
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) =>
        new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(val),
    },
  },
  legend: {
    labels: { colors: '#9ca3af' },
    markers: { size: 8, offsetX: 0, offsetY: 0 },
  },
  dataLabels: { enabled: false },
  // Permitir nulos (para hitos anteriores al horizonteMinimo del instrumento)
  markers: {
    size: 4,
    showNullDataPoints: false,
  },
}))

const hasSeries = computed(() =>
  resolvedSeries.value.length > 0 &&
  resolvedSeries.value.some(s => s.data.some(d => d !== null))
)
</script>

<template>
  <section class="chart-wrapper" aria-label="Gráfica de proyección comparativa">
    <h3 class="chart-title">{{ label }}</h3>

    <div v-if="hasSeries">
      <VueApexCharts
        :type="chartType"
        height="300"
        :options="chartOptions"
        :series="resolvedSeries"
      />
    </div>

    <!-- Estado vacío: sin instrumentos seleccionados aún -->
    <div v-else class="chart-empty" aria-label="Sin datos para mostrar">
      <p class="chart-empty-icon">📊</p>
      <p class="chart-empty-text">Asigna porcentajes a los instrumentos para ver la proyección</p>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.chart-wrapper {
  @apply flex flex-col gap-3;
}

.chart-title {
  @apply font-heading text-sm font-semibold text-text-secondary uppercase tracking-widest;
}

/* ── Estado vacío ── */
.chart-empty {
  @apply flex flex-col items-center justify-center gap-2 py-16 text-center;
}

.chart-empty-icon {
  @apply text-4xl opacity-30;
}

.chart-empty-text {
  @apply font-body text-sm text-text-muted max-w-xs;
}
</style>
