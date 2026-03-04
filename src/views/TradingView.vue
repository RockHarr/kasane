<script setup lang="ts">
/**
 * TradingView.vue — Kasane Trading Lab 🧪
 * Vista pedagógica de trading simulado.
 * Ruta: /trading
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTradingStore, INITIAL_CAPITAL } from '@/stores/trading'
import { useUserInputsStore } from '@/stores/userInputs'
import { useMockPrices } from '@/composables/useMockPrices'
import { useTradingStorage } from '@/composables/useTradingStorage'
import { ACCIONES_TRADEABLE } from '@/data/acciones'
import { calcSMA, calcRSI, interpretSignal } from '@/services/indicators'
import TradingPortfolioWidget from '@/components/organisms/TradingPortfolioWidget.vue'
import StockCard from '@/components/molecules/StockCard.vue'
import StockDetailPanel from '@/components/organisms/StockDetailPanel.vue'
import TradeHistoryTable from '@/components/organisms/TradeHistoryTable.vue'
import KasaneLogo from '@/components/atoms/KasaneLogo.vue'

const router = useRouter()
const authStore = useAuthStore()
const tradingStore = useTradingStore()
const userInputsStore = useUserInputsStore()

// ─── Precios mock + localStorage ──────────────────────────────
const { prices, getHistory } = useMockPrices(ACCIONES_TRADEABLE)
const { watchlist, toggleWatchlist, isWatched, lastSelected, setLastSelected } = useTradingStorage()

// Mantener los precios del store sincronizados para los getters de P&L
watch(prices, p => tradingStore.setPrices(p), { deep: true, immediate: true })

// ─── Carga inicial ────────────────────────────────────────────
onMounted(async () => {
  if (authStore.user) {
    await tradingStore.fetch(authStore.user.uid)
  }
})

// ─── Filtro watchlist ──────────────────────────────────────────
const showOnlyWatched = ref(false)

const visibleAcciones = computed(() => {
  if (showOnlyWatched.value && watchlist.value.length > 0) {
    return ACCIONES_TRADEABLE.filter(a => isWatched(a.symbol))
  }
  return ACCIONES_TRADEABLE
})

// ─── Detalle de acción ─────────────────────────────────────────
const selectedSymbol = ref<string | null>(lastSelected.value)

// Precio anterior para calcular % de cambio visual en la card
const prevPrices = ref<Record<string, number>>(Object.fromEntries(
  ACCIONES_TRADEABLE.map(a => [a.symbol, a.priceBase])
))

watch(prices, (newP, oldP) => {
  ACCIONES_TRADEABLE.forEach(a => {
    prevPrices.value[a.symbol] = oldP[a.symbol] ?? a.priceBase
  })
}, { deep: true })

const initialOrderMode = ref<'buy' | 'sell'>('buy')

function selectStock(symbol: string, mode: 'buy' | 'sell' = 'buy') {
  selectedSymbol.value = symbol === selectedSymbol.value ? null : symbol
  initialOrderMode.value = mode
  setLastSelected(selectedSymbol.value)
}

const selectedAccion = computed(() =>
  ACCIONES_TRADEABLE.find(a => a.symbol === selectedSymbol.value)
)

const selectedHolder = computed(() =>
  tradingStore.account?.holdings.find(h => h.symbol === selectedSymbol.value)
)

const selectedHistory = computed(() =>
  selectedSymbol.value ? getHistory(selectedSymbol.value) : []
)

const selectedPrice = computed(() =>
  selectedSymbol.value ? (prices.value[selectedSymbol.value] ?? 0) : 0
)

// ─── Órdenes ──────────────────────────────────────────────────
const isSubmitting = ref(false)

async function handleBuy(symbol: string, qty: number, price: number) {
  if (!authStore.user) return
  const accion = ACCIONES_TRADEABLE.find(a => a.symbol === symbol)
  if (!accion) return
  isSubmitting.value = true
  await tradingStore.executeBuy(authStore.user.uid, symbol, accion.name, qty, price)
  isSubmitting.value = false
}

async function handleSell(symbol: string, qty: number, price: number) {
  if (!authStore.user) return
  const accion = ACCIONES_TRADEABLE.find(a => a.symbol === symbol)
  if (!accion) return
  isSubmitting.value = true
  await tradingStore.executeSell(authStore.user.uid, symbol, accion.name, qty, price)
  isSubmitting.value = false
}
</script>

<template>
  <main class="trading-view">
    <!-- Nav -->
    <nav class="trading-nav">
      <div class="trading-nav__inner">
        <div class="trading-nav__left">
          <KasaneLogo size="sm" />
          <span class="trading-lab-badge">Lab 🧪</span>
        </div>
        <button class="trading-nav__back" @click="router.push({ name: 'dashboard' })">
          ← Volver al dashboard
        </button>
      </div>
    </nav>

    <div class="trading-container">

      <!-- Intro educativa -->
      <header class="trading-header">
        <h1 class="trading-title">Simulador de Trading</h1>
        <p class="trading-subtitle">
          Practica comprando y vendiendo acciones con <strong>{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(INITIAL_CAPITAL) }}</strong> de dinero ficticio.
          Observa los gráficos y las señales para entender cuándo conviene comprar o vender.
        </p>
      </header>

      <!-- Widget de portafolio -->
      <TradingPortfolioWidget
        v-if="tradingStore.account"
        :cash-u-s-d="tradingStore.account.cashUSD"
        :holdings="tradingStore.account.holdings"
        :current-prices="prices"
        :portfolio-value-u-s-d="tradingStore.portfolioValueUSD"
        :total-pn-l="tradingStore.totalPnL"
        :total-pn-l-percent="tradingStore.totalPnLPercent"
        :initial-capital="INITIAL_CAPITAL"
        @select-holding="selectStock"
      />

      <div v-if="tradingStore.loading" class="trading-loading">
        <div class="trading-spinner" />
        <p>Cargando tu cuenta…</p>
      </div>

      <!-- Catálogo de acciones -->
      <section class="trading-catalog" aria-label="Acciones disponibles">
        <div class="trading-catalog__header">
          <h2 class="trading-section-title">Instrumentos disponibles</h2>
          <button
            class="trading-watch-filter"
            :class="{ 'is-active': showOnlyWatched }"
            @click="showOnlyWatched = !showOnlyWatched"
            :disabled="watchlist.length === 0"
          >
            ⭐ Mis favoritos<span v-if="watchlist.length > 0"> ({{ watchlist.length }})</span>
          </button>
        </div>

        <div class="trading-grid">
          <StockCard
            v-for="accion in visibleAcciones"
            :key="accion.symbol"
            :accion="accion"
            :price="prices[accion.symbol] ?? accion.priceBase"
            :prev-price="prevPrices[accion.symbol] ?? accion.priceBase"
            :is-watched="isWatched(accion.symbol)"
            :signal-color="interpretSignal(prices[accion.symbol] ?? accion.priceBase, calcSMA(getHistory(accion.symbol), 20).at(-1) || null, calcRSI(getHistory(accion.symbol), 14).at(-1) || null).color"
            :has-holding="!!tradingStore.account?.holdings.find(h => h.symbol === accion.symbol)"
            :holding-qty="tradingStore.account?.holdings.find(h => h.symbol === accion.symbol)?.quantity"
            @select="selectStock"
            @toggle-watch="toggleWatchlist"
          />
        </div>
      </section>

      <!-- Panel de detalle (charts + señal + orden) en MODAL -->
      <Transition name="fade">
        <div v-if="selectedAccion" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectStock(selectedSymbol!)">
          <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl hide-scrollbar shadow-2xl">
            <StockDetailPanel
              :accion="selectedAccion"
              :price="selectedPrice"
              :history="selectedHistory"
              :holding="selectedHolder"
              :cash-u-s-d="tradingStore.account?.cashUSD ?? 0"
              :is-submitting="isSubmitting"
              :initial-mode="initialOrderMode"
              @buy="handleBuy"
              @sell="handleSell"
              @close="selectStock(selectedSymbol!)"
            />
          </div>
        </div>
      </Transition>

      <!-- Historial -->
      <TradeHistoryTable :trades="tradingStore.trades" @select="selectStock" />

    </div>
  </main>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../tailwind.config.js";

.trading-view {
  @apply min-h-screen bg-bg-primary;
}

/* Nav */
.trading-nav {
  @apply border-b border-white/5 bg-bg-primary sticky top-0 z-10;
}

.trading-nav__inner {
  @apply max-w-5xl mx-auto px-4 py-3 flex items-center justify-between;
}

.trading-nav__left {
  @apply flex items-center gap-3;
}

.trading-lab-badge {
  @apply font-body text-xs font-semibold bg-accent-neutral/15 text-accent-neutral px-2.5 py-1 rounded-full border border-accent-neutral/20;
}

.trading-nav__back {
  @apply font-body text-sm text-text-secondary hover:text-accent-growth transition-colors cursor-pointer;
}

/* Layout */
.trading-container {
  @apply max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8;
}

/* Header educativo */
.trading-header {
  @apply flex flex-col gap-2;
}

.trading-title {
  @apply font-heading text-3xl font-bold text-text-primary;
}

.trading-subtitle {
  @apply font-body text-sm text-text-secondary leading-relaxed max-w-xl;
}

.trading-subtitle strong {
  @apply text-accent-growth;
}

/* Loading */
.trading-loading {
  @apply flex flex-col items-center gap-3 py-12 text-text-muted text-sm;
}

.trading-spinner {
  @apply w-8 h-8 border-2 border-white/10 border-t-accent-neutral rounded-full animate-spin;
}

/* Catálogo */
.trading-catalog__header {
  @apply flex items-center justify-between mb-4;
}

.trading-section-title {
  @apply font-heading text-lg font-bold text-text-primary;
}

.trading-watch-filter {
  @apply font-body text-sm text-text-muted border border-white/10 rounded-full px-3 py-1.5 transition-all cursor-pointer;
  @apply hover:border-yellow-400/40 hover:text-yellow-400;
  @apply disabled:opacity-30 disabled:cursor-not-allowed;
}

.trading-watch-filter.is-active {
  @apply bg-yellow-400/10 border-yellow-400/30 text-yellow-300;
}

.trading-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3;
}

/* Transición del modal  */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Helper para esconder scrollbar en el modal pero permitir scroll */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
