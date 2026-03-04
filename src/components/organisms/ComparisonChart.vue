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
type LocalSeriesItem = { name: string; data: (number | null)[]; color?: string }
type LocalSeries = LocalSeriesItem[]

interface Props {
  // ── Modo multi-serie (InstrumentMixer — avanzado) ──
  series?: LocalSeries
  categories?: string[]

  // ── Modo snapshot único (legado OCASimulator — no romper) ──
  snapshots?: DCAMonthSnapshot[]

  // ── Modo DCA 2 líneas (SimulatorView v2.0) ──
  /** Datos de ahorro lineal (sin invertir) — línea gris */
  ahorroData?: number[]
  /** Datos de proyección con el instrumento seleccionado */
  proyeccionData?: number[]
  /** Color de la línea de proyección (hex del instrumento) */
  proyeccionColor?: string
  /** Nombre del instrumento para la leyenda */
  proyeccionLabel?: string
  /** Etiquetas del eje X para el modo 2 líneas (ej: ['1m','6m','12m']) */
  dcaCategories?: string[]

  label?: string
  chartType?: 'area' | 'line'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Proyección comparativa',
  chartType: 'area',
})

// ── Construir series según el modo ──────────────────────────────

const resolvedSeries = computed<LocalSeries>(() => {
  // Modo DCA 2 líneas (v2.0) — con instrumento seleccionado
  if (props.ahorroData && props.proyeccionData && props.proyeccionData.length > 0) {
    return [
      {
        name: 'Ahorro (sin invertir)',
        data: props.ahorroData,
        color: '#6b7280',
      },
      {
        name: props.proyeccionLabel ?? 'Proyección',
        data: props.proyeccionData,
        color: props.proyeccionColor ?? '#00ffaa',
      },
    ]
  }
  // Modo solo-ahorro — sin instrumento seleccionado (solo línea gris)
  if (props.ahorroData && props.ahorroData.length > 0) {
    return [
      {
        name: 'Tu ahorro sin invertir',
        data: props.ahorroData,
        color: '#6b7280',
      },
    ]
  }
  // Modo legado: reconstruir desde snapshots mes a mes
  if (props.snapshots && props.snapshots.length > 0) {
    return [
      {
        name: 'Valor total',
        data: props.snapshots.map((s: DCAMonthSnapshot) => s.valorTotal),
        color: '#00ffaa',
      },
      {
        name: 'Total aportado',
        data: props.snapshots.map((s: DCAMonthSnapshot) => s.totalAportado),
        color: '#3b82f6',
      },
    ]
  }
  return props.series ?? []
})

const resolvedCategories = computed<string[]>(() => {
  // Modo DCA 2 líneas
  if (props.ahorroData && props.dcaCategories) return props.dcaCategories
  // Modo legacy snapshots
  if (props.snapshots && props.snapshots.length > 0) {
    return props.snapshots.map((s: DCAMonthSnapshot) => (s.mes === 0 ? 'Hoy' : `M${s.mes}`))
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
  colors: resolvedSeries.value.map((s: LocalSeriesItem) => s.color ?? '#6b7280'),
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
        val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val.toFixed(0)}`,
    },
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) =>
        new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
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

const hasSeries = computed(
  () =>
    resolvedSeries.value.length > 0 &&
    resolvedSeries.value.some((s: LocalSeriesItem) => s.data.some((d: number | null) => d !== null))
)

/** Formatea como CLP para la tabla de accesibilidad */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <section class="chart-wrapper" aria-labelledby="chart-title">
    <h3 id="chart-title" class="chart-title">{{ label }}</h3>

    <!-- Gráfica visual (oculta para screen readers) -->
    <div v-if="hasSeries" aria-hidden="true">
      <VueApexCharts
        :type="chartType"
        height="300"
        :options="chartOptions"
        :series="resolvedSeries"
      />
    </div>

    <!-- Tabla alternativa para screen readers -->
    <table v-if="hasSeries" class="sr-only">
      <caption>
        {{
          label
        }}
        - Datos tabulados
      </caption>
      <thead>
        <tr>
          <th scope="col">Periodo</th>
          <th v-for="serie in resolvedSeries" :key="serie.name" scope="col">
            {{ serie.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cat, idx) in resolvedCategories" :key="cat">
          <th scope="row">{{ cat }}</th>
          <td v-for="serie in resolvedSeries" :key="serie.name">
            {{ formatCurrency(serie.data[idx] ?? 0) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Estado vacío -->
    <div v-else class="chart-empty" aria-label="Sin datos para mostrar">
      <p class="chart-empty-icon">📊</p>
      <p class="chart-empty-text">Selecciona un instrumento para ver la proyección</p>
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
