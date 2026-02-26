<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMarketWidgetStore } from '@/stores/marketWidget'
import { PanelLeftClose, PanelLeftOpen, Settings, TrendingUp, TrendingDown } from 'lucide-vue-next'

const store = useMarketWidgetStore()
const isSettingsOpen = ref(false)

// Catálogo base de tickers disponibles
const ALL_TICKERS = [
  { id: 'USD/CLP', label: 'Dólar (USD/CLP)', type: 'fx' },
  { id: 'EUR/CLP', label: 'Euro (EUR/CLP)', type: 'fx' },
  { id: 'COP/CLP', label: 'Colombia (COP/CLP)', type: 'fx' },
  { id: 'ARS/CLP', label: 'Argentina (ARS/CLP)', type: 'fx' },
  { id: 'BTC/USD', label: 'Bitcoin (BTC)', type: 'crypto' },
  { id: 'ETH/USD', label: 'Ethereum (ETH)', type: 'crypto' },
  { id: 'SOL/USD', label: 'Solana (SOL)', type: 'crypto' },
]

// Mock data generator para UI (Simulamos una conexión de streaming real de precios)
interface LiveRate {
  value: string
  change: number
  isUp: boolean
}

const liveRates = ref<Record<string, LiveRate>>({})

function generateMockRate(id: string): LiveRate {
  // Bases referenciales
  const basePrices: Record<string, number> = {
    'USD/CLP': 950,
    'EUR/CLP': 1020,
    'COP/CLP': 0.24,
    'ARS/CLP': 0.95,
    'BTC/USD': 85400,
    'ETH/USD': 3200,
    'SOL/USD': 140,
  }

  const base = basePrices[id] || 100
  // ±1% de variación diaria ficticia
  const randomFactor = 1 + (Math.random() * 0.02 - 0.01)
  const val = base * randomFactor
  const change = Math.random() * 4 - 2 // Variación de % en las ultimas 24h

  return {
    value: id.includes('CLP') && base > 10 ? `$${val.toFixed(0)}` : `$${val.toFixed(4)}`,
    change,
    isUp: change >= 0,
  }
}

function refreshRates() {
  ALL_TICKERS.forEach(t => {
    liveRates.value[t.id] = generateMockRate(t.id)
  })
}

onMounted(() => {
  refreshRates()
  // Mock de actualización en vivo cada 10 segundos
  setInterval(refreshRates, 10000)
})
</script>

<template>
  <aside
    class="market-sidebar"
    :class="{ 'is-open': store.isOpen }"
    aria-label="Monedas y Mercados"
  >
    <!-- Botón Toggle de apertura (Flotante) -->
    <button
      class="toggle-btn"
      :aria-expanded="store.isOpen"
      aria-label="Alternar barra de herramientas de mercado"
      @click="store.toggleSidebar"
    >
      <PanelLeftClose v-if="store.isOpen" :size="20" aria-hidden="true" />
      <PanelLeftOpen v-else :size="20" aria-hidden="true" />
    </button>

    <!-- Panel de Contenido -->
    <div v-show="store.isOpen" class="sidebar-content">
      <div class="sidebar-header">
        <h3 class="sidebar-title">Vigilancia en VIVO</h3>
        <button
          class="settings-btn"
          aria-label="Configurar indicadores"
          @click="isSettingsOpen = !isSettingsOpen"
        >
          <Settings :size="16" aria-hidden="true" />
        </button>
      </div>

      <!-- Modo Edición: Configurar Tickers -->
      <div v-if="isSettingsOpen" class="settings-panel">
        <p class="settings-title">Selecciona las divisas de tu interés</p>
        <div class="settings-list">
          <label v-for="ticker in ALL_TICKERS" :key="ticker.id" class="ticker-option">
            <input
              type="checkbox"
              :checked="store.selectedTickers.includes(ticker.id)"
              class="accent-accent-growth w-4 h-4 cursor-pointer rounded"
              @change="store.toggleTicker(ticker.id)"
            />
            <span class="ticker-label">{{ ticker.label }}</span>
          </label>
        </div>
      </div>

      <!-- Modo Visualización: Lista de Tickers Activos -->
      <div v-else class="tickers-list">
        <div v-for="tickerId in store.selectedTickers" :key="tickerId" class="ticker-card">
          <div class="ticker-top">
            <span class="ticker-name">{{ tickerId }}</span>
            <component
              :is="liveRates[tickerId]?.isUp ? TrendingUp : TrendingDown"
              :size="14"
              :class="liveRates[tickerId]?.isUp ? 'text-accent-growth' : 'text-accent-alert'"
            />
          </div>
          <div class="ticker-bottom">
            <span class="ticker-val">{{ liveRates[tickerId]?.value }}</span>
            <span
              class="ticker-change"
              :class="liveRates[tickerId]?.isUp ? 'text-accent-growth' : 'text-accent-alert'"
            >
              {{ liveRates[tickerId]?.isUp ? '+' : ''
              }}{{ liveRates[tickerId]?.change.toFixed(2) }}%
            </span>
          </div>
        </div>

        <!-- Empty State si deseleccionó todo -->
        <p v-if="store.selectedTickers.length === 0" class="empty-state">
          Usa ⚙️ para agregar pares de divisas o criptomonedas y ver su valor referencial.
        </p>
      </div>

      <!-- Nota al pie -->
      <p class="sidebar-disclaimer">
        Precios referenciales con 15 minutos de retraso. No usar para tomar decisiones críticas.
      </p>
    </div>
  </aside>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.market-sidebar {
  @apply fixed top-0 left-0 h-full bg-bg-secondary border-r border-white/5 z-40 flex flex-col;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 260px;
  transform: translateX(-100%);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
}

.market-sidebar.is-open {
  transform: translateX(0);
}

.toggle-btn {
  @apply absolute -right-[42px] top-6 bg-bg-secondary border border-l-0 border-white/10;
  @apply p-2 rounded-r-xl text-text-secondary hover:text-text-primary transition-colors cursor-pointer;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.2);
}

.sidebar-content {
  @apply flex flex-col h-full w-full p-5 opacity-0 transition-opacity duration-300 overflow-y-auto;
}

.market-sidebar.is-open .sidebar-content {
  @apply opacity-100 delay-150;
}

.sidebar-header {
  @apply flex items-center justify-between mb-6 pb-4 border-b border-white/5;
}

.sidebar-title {
  @apply font-heading text-xs font-semibold tracking-widest text-text-primary uppercase;
}

.settings-btn {
  @apply text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors p-1.5 rounded-full cursor-pointer;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral;
}

/* ── Settings Panel ── */
.settings-panel {
  @apply flex flex-col flex-1 gap-4;
}

.settings-title {
  @apply font-body text-xs text-text-secondary leading-tight;
}

.settings-list {
  @apply flex flex-col gap-3;
}

.ticker-option {
  @apply flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors;
}

.ticker-label {
  @apply font-body text-sm text-text-primary select-none;
}

/* ── Tickers Panel ── */
.tickers-list {
  @apply flex flex-col flex-1 gap-3;
}

.ticker-card {
  @apply flex flex-col gap-1 p-3 rounded-lg bg-bg-primary border border-white/5 hover:border-white/10 transition-colors shadow-sm;
}

.ticker-top {
  @apply flex items-center justify-between;
}

.ticker-name {
  @apply font-heading text-xs font-bold tracking-wide text-text-secondary;
}

.ticker-bottom {
  @apply flex items-end justify-between mt-1;
}

.ticker-val {
  @apply font-mono text-base font-bold text-text-primary;
}

.ticker-change {
  @apply font-mono text-xs font-semibold;
}

.empty-state {
  @apply font-body text-xs text-text-muted text-center leading-relaxed mt-4 p-4 border border-white/5 rounded-lg border-dashed;
}

/* ── Footer ── */
.sidebar-disclaimer {
  @apply mt-6 pt-4 border-t border-white/5 font-body text-[10px] text-text-muted leading-relaxed italic text-center;
}
</style>
