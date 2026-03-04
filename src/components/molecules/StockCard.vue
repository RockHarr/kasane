<script setup lang="ts">
/**
 * StockCard — Kasane Trading Lab 🧪
 *
 * Tarjeta compacta para un instrumento financiero del catálogo.
 * Muestra precio animado, variación porcentual, nivel de riesgo
 * y botón de favorito (⭐) que persiste en localStorage.
 *
 * Emits:
 *   - select(symbol)      → abre el StockDetailPanel de ese símbolo
 *   - toggleWatch(symbol) → agrega/quita de la watchlist del usuario
 */
import type { AccionCatalogo } from '@/data/acciones'
import { computed } from 'vue'

interface Props {
  /** Metadata estática del instrumento (nombre, color, riesgo, etc.) */
  accion: AccionCatalogo
  /** Precio actual en USD (cambia cada 5s vía useMockPrices) */
  price: number
  /** Precio del tick anterior, usado para calcular la variación % */
  prevPrice: number
  /** Si el usuario marcó este símbolo como favorito en localStorage */
  isWatched: boolean
  /** Si el usuario tiene acciones de este instrumento en su cartera */
  hasHolding: boolean
  /** Cantidad de acciones en posesión (solo relevante si hasHolding=true) */
  holdingQty?: number
  /** Señal de mercado actual (ej: "green", "yellow", "red") */
  signalColor?: 'green' | 'yellow' | 'red'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  /** El usuario hizo click en la card para ver el detalle */
  select: [symbol: string]
  /** El usuario presionó el botón ⭐/☆ para cambiar favorito */
  toggleWatch: [symbol: string]
}>()

/** Diferencia absoluta de precio respecto al tick anterior */
const change = computed(() => props.price - props.prevPrice)

/** Variación porcentual respecto al tick anterior (0 si prevPrice=0) */
const changePct = computed(() =>
  props.prevPrice > 0 ? ((change.value / props.prevPrice) * 100) : 0,
)

/** true si el precio subió o se mantuvo igual en el último tick */
const isUp = computed(() => change.value >= 0)

/** Mapeo de nivel de riesgo a clase CSS de badge */
const riskColors: Record<string, string> = {
  'medio':    'badge--medium',
  'alto':     'badge--high',
  'muy alto': 'badge--very-high',
}

/** Formatea un número como moneda USD con 2 decimales */
function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
</script>

<template>
  <div class="stock-card" :style="{ '--accion-color': accion.color }" @click="emit('select', accion.symbol)">
    <!-- Fondo con color del instrumento -->
    <div class="stock-card__glow" aria-hidden="true" />

    <!-- Header: emoji + nombre + favorito -->
    <div class="stock-card__header">
      <div class="stock-card__identity">
        <div class="stock-card__logo-wrap">
          <img
            :src="accion.logoUrl"
            :alt="accion.name"
            class="stock-card__logo"
            @error="(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden') }"
          />
          <span class="stock-card__emoji hidden" aria-hidden="true">{{ accion.emoji }}</span>
        </div>
        <div>
          <p class="stock-card__symbol">{{ accion.symbol }}</p>
          <p class="stock-card__name">{{ accion.name }}</p>
        </div>
      </div>
      <button
        class="stock-card__watch"
        :class="{ 'is-watched': isWatched }"
        :aria-label="isWatched ? 'Quitar de favoritos' : 'Agregar a favoritos'"
        @click.stop="emit('toggleWatch', accion.symbol)"
      >
        {{ isWatched ? '⭐' : '☆' }}
      </button>
    </div>

    <!-- Precio + cambio -->
    <div class="stock-card__price-row">
      <span class="stock-card__price">{{ fmt(price) }}</span>
      <span class="stock-card__change" :class="isUp ? 'is-up' : 'is-down'">
        {{ isUp ? '▲' : '▼' }} {{ Math.abs(changePct).toFixed(2) }}%
      </span>
    </div>

    <!-- Footer: riesgo + holding indicator + Signal dot -->
    <div class="stock-card__footer">
      <div class="flex items-center gap-2">
        <span class="stock-card__badge" :class="riskColors[accion.riesgo]">
          {{ accion.riesgo }}
        </span>
        <!-- Indicador visual de la señal de nuestro "semáforo" inteligente -->
        <span v-if="signalColor" class="flex items-center justify-center w-4 h-4 rounded-full" :class="[
          signalColor === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
          signalColor === 'red' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-400/20 text-yellow-400'
        ]" title="Señal de mercado">
          <span class="text-[8px] leading-none">{{ signalColor === 'green' ? '🟢' : signalColor === 'red' ? '🔴' : '🟡' }}</span>
        </span>
      </div>
      <span v-if="hasHolding" class="stock-card__holding">
        {{ holdingQty }} acc.
      </span>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.stock-card {
  @apply relative bg-bg-elevated border border-white/8 rounded-2xl p-4 cursor-pointer;
  @apply flex flex-col gap-3 overflow-hidden;
  @apply transition-all duration-200;
  @apply hover:border-[var(--accion-color,theme(colors.white/20))] hover:shadow-lg;
}

.stock-card__glow {
  @apply absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300;
  background: radial-gradient(ellipse at top left, var(--accion-color, transparent) 0%, transparent 60%);
  pointer-events: none;
}

.stock-card:hover .stock-card__glow {
  opacity: 0.06;
}

.stock-card__header {
  @apply flex items-start justify-between;
}

.stock-card__identity {
  @apply flex items-center gap-2.5;
}

.stock-card__logo-wrap {
  @apply w-8 h-8 flex items-center justify-center;
}

.stock-card__logo {
  @apply w-7 h-7 rounded-md object-contain;
}

.stock-card__emoji {
  @apply text-2xl leading-none;
}

.stock-card__symbol {
  @apply font-mono text-sm font-bold text-text-primary;
}

.stock-card__name {
  @apply font-body text-xs text-text-muted;
}

.stock-card__watch {
  @apply text-base leading-none opacity-50 hover:opacity-100 transition-opacity cursor-pointer;
}

.stock-card__watch.is-watched {
  @apply opacity-100;
}

.stock-card__price-row {
  @apply flex items-end justify-between;
}

.stock-card__price {
  @apply font-heading text-xl font-bold text-text-primary;
}

.stock-card__change {
  @apply font-mono text-xs font-semibold;
}

.stock-card__change.is-up   { @apply text-accent-growth; }
.stock-card__change.is-down { @apply text-accent-alert; }

.stock-card__footer {
  @apply flex items-center justify-between;
}

.stock-card__badge {
  @apply font-body text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full;
}

.badge--medium    { @apply bg-accent-neutral/10 text-accent-neutral; }
.badge--high      { @apply bg-accent-alert/10 text-accent-alert; }
.badge--very-high { @apply bg-pink-500/10 text-pink-400; }

.stock-card__holding {
  @apply font-mono text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full;
}
</style>
