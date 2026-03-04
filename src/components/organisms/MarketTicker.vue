<script setup lang="ts">
// MarketTicker: banda horizontal con precios en vivo.
// Modo compact (mobile): 3 items estáticos, columnar.
// Modo marquee (desktop): scroll continuo tipo Finnhub con todos los tickers.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMarketWidgetStore } from '@/stores/marketWidget'

const props = withDefaults(defineProps<{
  marquee?: boolean   // true → desktop scrolling strip
}>(), {
  marquee: false,
})

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

// All known ticker IDs for the marquee (use ALL, not just selected)
const ALL_TICKER_IDS = Object.keys(BASE_PRICES)

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
  ALL_TICKER_IDS.forEach(id => {
    liveRates.value[id] = generateRate(id)
  })
}

// Mobile compact: max 3 from user selection
const compactTickers = computed(() => store.selectedTickers.slice(0, 3))

// Desktop marquee: all IDs, duplicated for seamless loop
const marqueeItems = computed(() => [...ALL_TICKER_IDS, ...ALL_TICKER_IDS])

// Animation duration scales with number of items (each item ~4s)
const marqueeDuration = computed(() => `${ALL_TICKER_IDS.length * 5}s`)

let interval: ReturnType<typeof setInterval>
onMounted(() => {
  refreshAll()
  interval = setInterval(refreshAll, 10000)
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <!-- MARQUEE MODE: desktop scrolling strip -->
  <div v-if="marquee" class="market-ticker market-ticker--marquee" aria-label="Indicadores de mercado en vivo" role="marquee">
    <div class="ticker-scroll-track" :style="{ animationDuration: marqueeDuration }">
      <div
        v-for="(id, i) in marqueeItems"
        :key="`${id}-${i}`"
        class="ticker-scroll-item"
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

  <!-- COMPACT MODE: mobile 3-item static grid -->
  <div v-else class="market-ticker" aria-label="Indicadores de mercado en vivo">
    <div class="ticker-track">
      <div
        v-for="id in compactTickers"
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

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

/* ── Compact (mobile) ── */
.market-ticker {
  @apply w-full bg-bg-secondary/90 border-t border-white/8;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  @apply overflow-hidden flex-shrink-0;
}

.ticker-track {
  @apply flex items-stretch divide-x divide-white/8;
  min-height: 44px;
}

.ticker-item {
  @apply flex flex-col justify-center gap-0.5 px-3 py-2 flex-1 min-w-0;
}

/* ── Marquee (desktop) ── */
.market-ticker--marquee {
  @apply w-full overflow-hidden;
  background: transparent;
  border-bottom: none;
  height: 40px;
  display: flex;
  align-items: center;
  border-top: none;
}

.ticker-scroll-track {
  display: flex;
  align-items: center;
  gap: 0;
  /* Total width = 2× items → scrolls exactly one set then loops */
  animation: ticker-scroll linear infinite;
  will-change: transform;
  white-space: nowrap;
}

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.ticker-scroll-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  border-right: 1px solid rgba(255,255,255,0.06);
  height: 40px;
  min-width: 180px;
  flex-shrink: 0;
}

/* ── Shared label/value styles ── */
.ticker-id {
  @apply font-heading text-[10px] font-bold tracking-wider text-text-muted uppercase;
  white-space: nowrap;
}

.ticker-val {
  @apply font-mono text-sm font-bold text-text-primary;
  white-space: nowrap;
}

.ticker-change {
  @apply font-mono text-[11px] font-semibold;
  white-space: nowrap;
}

.ticker-change.is-up   { @apply text-accent-growth; }
.ticker-change.is-down { @apply text-accent-alert;  }
</style>
