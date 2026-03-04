<script setup lang="ts">
/**
 * TradingPortfolioWidget — Kasane Trading Lab 🧪
 *
 * Muestra el resumen global de la cuenta de trading simulado:
 *   - Valor total del portafolio (cash + holdings a precio de mercado)
 *   - P&L (ganancia/pérdida) absoluto y porcentual vs el capital inicial
 *   - Barra de progreso visual del capital
 *   - Lista de posiciones abiertas con % ganancia por posición (chip clickeable)
 *
 * Emits:
 *   - selectHolding(symbol) → notifica a TradingView para abrir el StockDetailPanel
 */
import type { TradingHolding } from '@/types'
import { computed } from 'vue'

interface Props {
  /** Saldo disponible en USD para nuevas compras */
  cashUSD: number
  /** Lista de posiciones abiertas del usuario */
  holdings: TradingHolding[]
  /** Precios actuales de mercado por símbolo (de useMockPrices) */
  currentPrices: Record<string, number>
  /** Valor total: cash + valor de mercado de todos los holdings */
  portfolioValueUSD: number
  /** Ganancia/pérdida absoluta respecto al capital inicial */
  totalPnL: number
  /** P&L como porcentaje del capital inicial */
  totalPnLPercent: number
  /** Capital inicial de la cuenta (constante: $10,000) */
  initialCapital: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ selectHolding: [symbol: string] }>()

/** true si el portafolio está en ganancia o equilibrio */
const pnlPositive = computed(() => props.totalPnL >= 0)

/** Formatea un número como moneda USD */
function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n)
}

/**
 * Calcula P&L de una posición individual.
 * @param h - Holding del usuario
 * @returns gain (absoluto), pct (porcentual), current (precio actual)
 */
function holdingPnL(h: TradingHolding) {
  const current = props.currentPrices[h.symbol] ?? h.avgBuyPrice
  const gain = (current - h.avgBuyPrice) * h.quantity
  const pct = ((current - h.avgBuyPrice) / h.avgBuyPrice) * 100
  return { gain, pct, current }
}
</script>

<template>
  <section class="tpw-card" aria-label="Tu portafolio de trading">
    <!-- Cabecera: saldo + P&L global -->
    <div class="tpw-header">
      <div class="tpw-metric">
        <span class="tpw-label">Valor del portafolio</span>
        <span class="tpw-value">{{ fmt(portfolioValueUSD) }}</span>
      </div>
      <div class="tpw-metric tpw-metric--right">
        <span class="tpw-label">P&amp;L total</span>
        <span class="tpw-pnl" :class="pnlPositive ? 'tpw-pnl--pos' : 'tpw-pnl--neg'">
          {{ pnlPositive ? '+' : '' }}{{ fmt(totalPnL) }}
          <span class="tpw-pct">({{ totalPnLPercent.toFixed(1) }}%)</span>
        </span>
      </div>
    </div>

    <!-- Barra de progreso del capital -->
    <div class="tpw-progress-bar" role="progressbar" :aria-valuenow="portfolioValueUSD" :aria-valuemax="initialCapital * 2">
      <div
        class="tpw-progress-fill"
        :class="pnlPositive ? 'tpw-progress-fill--pos' : 'tpw-progress-fill--neg'"
        :style="{ width: Math.min(100, (portfolioValueUSD / (initialCapital * 1.5)) * 100) + '%' }"
      />
    </div>

    <div class="tpw-sub">
      <span class="tpw-cash">💵 Disponible: <strong>{{ fmt(cashUSD) }}</strong></span>
      <span class="tpw-capital">Capital inicial: {{ fmt(initialCapital) }}</span>
    </div>

    <!-- Holdings -->
    <div v-if="holdings.length > 0" class="tpw-holdings">
      <h4 class="tpw-holdings-title">Posiciones abiertas</h4>
      <div class="tpw-holdings-list">
        <button
          v-for="h in holdings"
          :key="h.symbol"
          class="tpw-holding-chip"
          @click="emit('selectHolding', h.symbol)"
        >
          <span class="tpw-chip-symbol">{{ h.symbol }}</span>
          <span class="tpw-chip-qty">× {{ h.quantity }}</span>
          <span
            class="tpw-chip-pnl"
            :class="holdingPnL(h).gain >= 0 ? 'tpw-chip-pnl--pos' : 'tpw-chip-pnl--neg'"
          >
            {{ holdingPnL(h).pct.toFixed(1) }}%
          </span>
        </button>
      </div>
    </div>

    <p v-else class="tpw-empty">Sin posiciones abiertas aún. ¡Compra tu primera acción!</p>
  </section>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.tpw-card {
  @apply bg-bg-elevated border border-white/10 rounded-2xl p-5 flex flex-col gap-4;
}

.tpw-header {
  @apply flex items-start justify-between;
}

.tpw-metric {
  @apply flex flex-col gap-0.5;
}

.tpw-metric--right {
  @apply items-end;
}

.tpw-label {
  @apply font-body text-xs text-text-muted uppercase tracking-wider;
}

.tpw-value {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.tpw-pnl {
  @apply font-heading text-lg font-bold;
}

.tpw-pnl--pos { @apply text-accent-growth; }
.tpw-pnl--neg { @apply text-accent-alert; }

.tpw-pct {
  @apply font-body text-sm font-normal;
}

.tpw-progress-bar {
  @apply w-full h-1.5 bg-white/5 rounded-full overflow-hidden;
}

.tpw-progress-fill {
  @apply h-full rounded-full transition-all duration-700;
}

.tpw-progress-fill--pos { @apply bg-accent-growth; }
.tpw-progress-fill--neg { @apply bg-accent-alert; }

.tpw-sub {
  @apply flex items-center justify-between;
}

.tpw-cash {
  @apply font-body text-sm text-text-secondary;
}

.tpw-capital {
  @apply font-body text-xs text-text-muted;
}

.tpw-holdings-title {
  @apply font-heading text-xs font-semibold text-text-muted uppercase tracking-wider mb-2;
}

.tpw-holdings-list {
  @apply flex flex-wrap gap-2;
}

.tpw-holding-chip {
  @apply flex items-center gap-1.5 bg-bg-primary border border-white/10 rounded-lg px-3 py-1.5;
  @apply hover:border-accent-neutral/40 transition-colors cursor-pointer;
}

.tpw-chip-symbol {
  @apply font-mono text-sm font-bold text-text-primary;
}

.tpw-chip-qty {
  @apply font-body text-xs text-text-muted;
}

.tpw-chip-pnl {
  @apply font-mono text-xs font-semibold;
}

.tpw-chip-pnl--pos { @apply text-accent-growth; }
.tpw-chip-pnl--neg { @apply text-accent-alert; }

.tpw-empty {
  @apply font-body text-sm text-text-muted text-center py-2;
}
</style>
