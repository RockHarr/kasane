<script setup lang="ts">
// MarketTicker: banda horizontal compacta con precios en vivo
// Muestra los tickers seleccionados por el usuario, auto-actualiza cada 10s
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMarketWidgetStore } from '@/stores/marketWidget'

const store = useMarketWidgetStore()

interface LiveRate {
  value: string
  change: number
  isUp: boolean
}

const BASE_PRICES: Record<string, number> = {
  'USD/CLP': 950,
  'EUR/CLP': 1020,
  'COP/CLP': 0.24,
  'ARS/CLP': 0.95,
  'BTC/USD': 85400,
  'ETH/USD': 3200,
  'SOL/USD': 140,
}

const liveRates = ref<Record<string, LiveRate>>({})

function generateRate(id: string): LiveRate {
  const base = BASE_PRICES[id] ?? 100
  const val = base * (1 + (Math.random() * 0.02 - 0.01))
  const change = Math.random() * 4 - 2
  return {
    value: id.includes('CLP') && base > 10 ? `$${val.toFixed(0)}` : `$${val.toFixed(2)}`,
    change,
    isUp: change >= 0,
  }
}

function refreshAll() {
  Object.keys(BASE_PRICES).forEach(id => {
    liveRates.value[id] = generateRate(id)
  })
}

// Solo mostrar los seleccionados por el usuario (máx 4 para el ticker compacto)
const visibleTickers = computed(() =>
  store.selectedTickers.slice(0, 4)
)

let interval: ReturnType<typeof setInterval>
onMounted(() => {
  refreshAll()
  interval = setInterval(refreshAll, 10000)
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="market-ticker" aria-label="Indicadores de mercado en vivo" role="marquee">
    <div class="ticker-track">
      <div
        v-for="id in visibleTickers"
        :key="id"
        class="ticker-item"
      >
        <span class="ticker-id">{{ id }}</span>
        <span class="ticker-val">{{ liveRates[id]?.value ?? '—' }}</span>
        <span
          class="ticker-change"
          :class="liveRates[id]?.isUp ? 'is-up' : 'is-down'"
        >
          {{ liveRates[id]?.isUp ? '▲' : '▼' }}
          {{ Math.abs(liveRates[id]?.change ?? 0).toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.market-ticker {
  @apply fixed z-40 left-0 right-0;
  /* Sits just above the bottom tab bar (60px) */
  bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  @apply bg-bg-secondary/80 border-t border-white/5;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  @apply overflow-hidden;
}

.ticker-track {
  @apply flex items-center divide-x divide-white/5;
}

.ticker-item {
  @apply flex items-center gap-1.5 px-3 py-1.5 flex-1 min-w-0;
}

.ticker-id {
  @apply font-heading text-[9px] font-bold tracking-wider text-text-muted uppercase truncate;
}

.ticker-val {
  @apply font-mono text-[11px] font-bold text-text-primary;
}

.ticker-change {
  @apply font-mono text-[9px] font-semibold ml-auto;
}

.ticker-change.is-up {
  @apply text-accent-growth;
}

.ticker-change.is-down {
  @apply text-accent-alert;
}
</style>
