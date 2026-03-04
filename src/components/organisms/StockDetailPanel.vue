<script setup lang="ts">
/**
 * StockDetailPanel — Kasane Trading Lab 🧪
 * Panel expandible con:
 *   1. Gráfico de precio (área) + línea SMA 20 superpuesta
 *   2. Gráfico RSI 14 con bandas de referencia en 30 y 70
 *   3. Panel de señal educativa (🟢/🟡/🔴)
 *   4. Formulario de orden (comprar/vender)
 */
import { computed, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { AccionCatalogo } from '@/data/acciones'
import type { TradingHolding } from '@/types'
import { calcSMA, calcRSI, interpretSignal } from '@/services/indicators'

interface Props {
  accion: AccionCatalogo
  price: number
  history: number[]
  holding: TradingHolding | undefined
  cashUSD: number
  isSubmitting?: boolean
  initialMode?: 'buy' | 'sell'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  buy:    [symbol: string, qty: number, price: number]
  sell:   [symbol: string, qty: number, price: number]
  close:  []
}>()

// ─── Formulario de orden ─────────────────────────────────────
const mode = ref<'buy' | 'sell'>(props.initialMode ?? 'buy')

watch(() => props.initialMode, (newMode) => {
  if (newMode) mode.value = newMode
})

const qty = ref(1)
const orderError = ref('')

const maxSell = computed(() => props.holding?.quantity ?? 0)
const totalCost = computed(() => qty.value * props.price)
const canBuy = computed(() => props.cashUSD >= totalCost.value && qty.value > 0)
const canSell = computed(() => (props.holding?.quantity ?? 0) >= qty.value && qty.value > 0)

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n)
}

function submitOrder() {
  orderError.value = ''
  if (mode.value === 'buy') {
    if (!canBuy.value) { orderError.value = 'Saldo insuficiente'; return }
    emit('buy', props.accion.symbol, qty.value, props.price)
  } else {
    if (!canSell.value) { orderError.value = 'Cantidad insuperable a tu posición'; return }
    emit('sell', props.accion.symbol, qty.value, props.price)
  }
  qty.value = 1
}

// ─── Indicadores ─────────────────────────────────────────────

const smaValues = computed(() => calcSMA(props.history, 20))
const rsiValues = computed(() => calcRSI(props.history, 14))

const latestSMA = computed(() => {
  const arr = smaValues.value
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i] as number
  }
  return null
})

const latestRSI = computed(() => {
  const arr = rsiValues.value
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i] as number
  }
  return null
})

const signal = computed(() => interpretSignal(props.price, latestSMA.value, latestRSI.value))

const signalColorMap = {
  green:  { bg: 'signal--green',  dot: '🟢' },
  yellow: { bg: 'signal--yellow', dot: '🟡' },
  red:    { bg: 'signal--red',    dot: '🔴' },
}

// ─── Chart 1: Precio + SMA ───────────────────────────────────

const priceChartOptions = computed(() => ({
  chart: {
    type: 'area' as const,
    background: 'transparent',
    toolbar: { show: false },
    sparkline: { enabled: false },
    animations: { enabled: true, speed: 400 },
  },
  colors: [props.accion.color, '#ffffff44'],
  stroke: { width: [2, 1.5], curve: 'smooth' as const, dashArray: [0, 4] },
  fill: {
    type: ['gradient', 'solid'],
    opacity: [0.2, 0],
    gradient: {
      shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100],
    },
  },
  xaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#888', fontSize: '11px' },
      formatter: (v: number) => `$${v.toFixed(0)}`,
    },
  },
  grid: { borderColor: '#ffffff0a', strokeDashArray: 4 },
  tooltip: {
    theme: 'dark',
    y: [
      { formatter: (v: number) => `$${v.toFixed(2)}` },
      { formatter: (v: number) => v ? `SMA $${v.toFixed(2)}` : '-' },
    ],
  },
  legend: {
    show: true, position: 'top' as const, horizontalAlign: 'right' as const,
    labels: { colors: '#888' },
    fontSize: '11px',
    markers: { size: 4 },
  },
}))

const priceChartSeries = computed(() => [
  { name: 'Precio', data: props.history },
  { name: 'SMA 20', data: smaValues.value.map(v => v ?? null) },
])

// ─── Chart 2: RSI 14 ─────────────────────────────────────────

const rsiChartOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: false },
  },
  colors: ['#a78bfa'],
  stroke: { width: 2, curve: 'smooth' as const },
  annotations: {
    yaxis: [
      { y: 70, borderColor: '#f87171', label: { text: 'Sobrecomprado (70)', style: { color: '#f87171', background: 'transparent', fontSize: '10px' } } },
      { y: 30, borderColor: '#34d399', label: { text: 'Sobrevendido (30)',   style: { color: '#34d399', background: 'transparent', fontSize: '10px' } } },
    ],
  },
  xaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 4,
    labels: {
      style: { colors: '#888', fontSize: '11px' },
      formatter: (v: number) => v.toFixed(0),
    },
  },
  grid: { borderColor: '#ffffff0a', strokeDashArray: 4 },
  tooltip: { theme: 'dark', y: { formatter: (v: number) => `RSI ${v?.toFixed(1) ?? '-'}` } },
  legend: { show: false },
}))

const rsiChartSeries = computed(() => [
  { name: 'RSI 14', data: rsiValues.value.map(v => v ?? null) },
])
</script>

<template>
  <div class="sdp-panel">
    <!-- Header -->
    <div class="sdp-header">
      <div class="sdp-title-row">
        <div class="sdp-logo-wrap">
          <img
            :src="accion.logoUrl"
            :alt="accion.name"
            class="sdp-logo"
            @error="(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden') }"
          />
          <span class="sdp-emoji hidden" aria-hidden="true">{{ accion.emoji }}</span>
        </div>
        <div>
          <h2 class="sdp-symbol">{{ accion.symbol }}</h2>
          <p class="sdp-name">{{ accion.name }}</p>
        </div>
        <div class="sdp-price-block">
          <span class="sdp-price">{{ fmt(price) }}</span>
        </div>
      </div>
      <button class="sdp-close" aria-label="Cerrar detalle" @click="emit('close')">✕</button>
    </div>

    <div class="sdp-body">
      <!-- Columna izquierda: Charts -->
      <div class="sdp-charts">
        <p class="sdp-chart-label">Precio + Media Móvil 20 días (SMA 20)</p>
        <VueApexCharts
          type="area"
          height="200"
          :options="priceChartOptions"
          :series="priceChartSeries"
        />

        <p class="sdp-chart-label sdp-chart-label--rsi">
          RSI 14 — Índice de Fuerza Relativa
        </p>
        <VueApexCharts
          type="line"
          height="140"
          :options="rsiChartOptions"
          :series="rsiChartSeries"
        />
      </div>

      <!-- Columna derecha: Señal + Orden -->
      <div class="sdp-sidebar">

        <!-- Panel de señal educativa -->
        <div class="signal-panel" :class="signalColorMap[signal.color].bg">
          <div class="signal-dot">{{ signalColorMap[signal.color].dot }}</div>
          <h4 class="signal-title">{{ signal.title }}</h4>
          <p class="signal-explanation">{{ signal.explanation }}</p>
          <div class="signal-indicators">
            <div class="signal-ind">
              <span class="signal-ind-label">SMA 20</span>
              <span class="signal-ind-val">{{ latestSMA ? fmt(latestSMA) : '—' }}</span>
            </div>
            <div class="signal-ind">
              <span class="signal-ind-label">RSI 14</span>
              <span class="signal-ind-val" :class="{ 'rsi--low': (latestRSI??50) < 30, 'rsi--high': (latestRSI??50) > 70 }">
                {{ latestRSI?.toFixed(1) ?? '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Formulario de orden -->
        <div class="order-form">
          <h4 class="order-title">Realizar operación</h4>

          <!-- Tabs Comprar/Vender -->
          <div class="order-tabs">
            <button
              class="order-tab"
              :class="{ 'is-active-buy': mode === 'buy' }"
              @click="mode = 'buy'; orderError = ''"
            >Comprar</button>
            <button
              class="order-tab"
              :class="{ 'is-active-sell': mode === 'sell' }"
              :disabled="!holding"
              @click="mode = 'sell'; orderError = ''"
            >Vender</button>
          </div>

          <!-- Input cantidad -->
          <div class="order-input-group">
            <label class="order-label" for="trading-qty">
              Cantidad de acciones
              <span v-if="mode === 'sell' && holding" class="order-max">
                (máx. {{ maxSell }})
              </span>
            </label>
            <input
              id="trading-qty"
              v-model.number="qty"
              type="number"
              min="1"
              :max="mode === 'sell' ? maxSell : undefined"
              class="order-input"
            />
          </div>

          <!-- Resumen de la operación -->
          <div class="order-summary">
            <div class="order-summary-row">
              <span>Total estimado</span>
              <span class="order-total">{{ fmt(totalCost) }}</span>
            </div>
            <div class="order-summary-row" v-if="mode === 'buy'">
              <span>Saldo tras la operación</span>
              <span :class="canBuy ? 'text-text-secondary' : 'text-accent-alert'">
                {{ fmt(Math.max(0, cashUSD - totalCost)) }}
              </span>
            </div>
          </div>

          <p v-if="orderError" class="order-error" role="alert">{{ orderError }}</p>

          <button
            class="order-btn"
            :class="mode === 'buy' ? 'order-btn--buy' : 'order-btn--sell'"
            :disabled="mode === 'buy' ? !canBuy : !canSell"
            @click="submitOrder"
          >
            {{ mode === 'buy' ? '🛒 Comprar' : '💸 Vender' }} {{ qty }} acc.
          </button>

          <p class="order-disclaimer">
            ⚠️ Este es un entorno de práctica con dinero ficticio. No es asesoramiento financiero real.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.sdp-panel {
  @apply bg-bg-elevated border border-white/10 rounded-2xl overflow-hidden;
}

.sdp-header {
  @apply flex items-center justify-between px-5 py-4 border-b border-white/8;
}

.sdp-title-row {
  @apply flex items-center gap-3;
}

.sdp-logo-wrap {
  @apply w-12 h-12 flex items-center justify-center shrink-0 bg-bg-elevated border border-white/5 rounded-xl overflow-hidden;
}

.sdp-logo {
  @apply w-10 h-10 object-contain drop-shadow-xl;
}

.sdp-emoji {
  @apply text-3xl leading-none;
}

.sdp-symbol {
  @apply font-heading text-xl font-bold text-text-primary;
}

.sdp-name {
  @apply font-body text-xs text-text-muted;
}

.sdp-price-block {
  @apply ml-4;
}

.sdp-price {
  @apply font-mono text-xl font-bold text-text-primary;
}

.sdp-close {
  @apply text-text-muted hover:text-text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 cursor-pointer;
}

.sdp-body {
  @apply grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/8;
}

.sdp-charts {
  @apply lg:col-span-3 p-5 flex flex-col gap-1;
}

.sdp-chart-label {
  @apply font-body text-xs text-text-muted font-semibold uppercase tracking-wider mt-2 mb-1;
}

.sdp-chart-label--rsi {
  @apply mt-4;
}

.sdp-sidebar {
  @apply lg:col-span-2 p-5 flex flex-col gap-5;
}

/* ── Signal Panel ── */
.signal-panel {
  @apply rounded-xl p-4 flex flex-col gap-2 border;
}

.signal--green  { @apply bg-emerald-500/8 border-emerald-500/20; }
.signal--yellow { @apply bg-yellow-400/8 border-yellow-400/20; }
.signal--red    { @apply bg-red-500/8 border-red-500/20; }

.signal-dot {
  @apply text-2xl leading-none;
}

.signal-title {
  @apply font-heading text-sm font-bold text-text-primary;
}

.signal-explanation {
  @apply font-body text-xs text-text-secondary leading-relaxed;
}

.signal-indicators {
  @apply flex gap-4 mt-1 pt-2 border-t border-white/5;
}

.signal-ind {
  @apply flex flex-col gap-0.5;
}

.signal-ind-label {
  @apply font-body text-[10px] text-text-muted uppercase tracking-wider;
}

.signal-ind-val {
  @apply font-mono text-sm font-semibold text-text-primary;
}

.rsi--low  { @apply text-emerald-400; }
.rsi--high { @apply text-red-400; }

/* ── Order Form ── */
.order-form {
  @apply flex flex-col gap-3;
}

.order-title {
  @apply font-heading text-sm font-bold text-text-primary;
}

.order-tabs {
  @apply flex bg-bg-primary rounded-xl p-1 border border-white/8;
}

.order-tab {
  @apply flex-1 font-body text-sm font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer;
  @apply text-text-muted hover:text-text-primary;
  @apply disabled:opacity-30 disabled:cursor-not-allowed;
}

.order-tab.is-active-buy  { @apply bg-emerald-500/15 text-emerald-400; }
.order-tab.is-active-sell { @apply bg-red-500/15 text-red-400; }

.order-label {
  @apply font-body text-xs text-text-muted block mb-1;
}

.order-max {
  @apply text-text-muted/70;
}

.order-input {
  @apply w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-2.5;
  @apply font-mono text-sm text-text-primary outline-none;
  @apply focus:border-accent-neutral/50 transition-colors;
}

.order-summary {
  @apply bg-bg-primary rounded-xl px-4 py-3 flex flex-col gap-1.5 border border-white/5;
}

.order-summary-row {
  @apply flex items-center justify-between font-body text-xs text-text-secondary;
}

.order-total {
  @apply font-mono text-sm font-bold text-text-primary;
}

.order-error {
  @apply font-body text-xs text-accent-alert bg-accent-alert/10 rounded-lg px-3 py-2;
}

.order-btn {
  @apply w-full font-heading text-sm font-bold py-3 rounded-xl transition-all cursor-pointer;
  @apply disabled:opacity-40 disabled:cursor-not-allowed;
}

.order-btn--buy  { @apply bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30; }
.order-btn--sell { @apply bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30; }

.order-disclaimer {
  @apply font-body text-[10px] text-text-muted text-center leading-relaxed;
}
</style>
