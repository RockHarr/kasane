<script setup lang="ts">
// ComparisonChart: gráfica de línea del crecimiento del portafolio mes a mes
// Responsabilidad: visualizar snapshots del DCA con ApexCharts
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { DCAMonthSnapshot } from '@/services/calculations'

interface Props {
  snapshots: DCAMonthSnapshot[]
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Crecimiento del portafolio',
})

// Series para ApexCharts
const series = computed(() => [
  {
    name: 'Valor total',
    data: props.snapshots.map(s => s.valorTotal),
  },
  {
    name: 'Total aportado',
    data: props.snapshots.map(s => s.totalAportado),
  },
])

// Categorías (meses en el eje X)
const categories = computed(() =>
  props.snapshots.map(s => (s.mes === 0 ? 'Hoy' : `M${s.mes}`))
)

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: 'JetBrains Mono, monospace',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 600,
    },
  },
  colors: ['#00ffaa', '#3b82f6'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.05)',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      style: { colors: '#6b7280', fontSize: '11px' },
      // Mostrar solo algunos ticks para no saturar
      formatter: (val: string, idx: number) => {
        const total = categories.value.length
        if (total <= 13) return val
        // Mostrar hoy, cada año (~12 meses) y el final
        if (idx === 0 || idx === total - 1 || idx % 12 === 0) return val
        return ''
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
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val),
    },
  },
  legend: {
    labels: { colors: '#9ca3af' },
    markers: { width: 8, height: 8, radius: 4 },
  },
  dataLabels: { enabled: false },
}))
</script>

<template>
  <section class="chart-wrapper" aria-label="Gráfica de crecimiento del portafolio">
    <h3 class="chart-title">{{ label }}</h3>
    <VueApexCharts
      type="area"
      height="300"
      :options="chartOptions"
      :series="series"
    />
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
</style>
