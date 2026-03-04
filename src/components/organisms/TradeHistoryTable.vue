<script setup lang="ts">
/**
 * TradeHistoryTable — Kasane Trading Lab 🧪
 *
 * Tabla con el historial de las últimas 15 operaciones del usuario.
 * Las filas de compra se resaltan en verde y las de venta en rojo.
 * Compatible con Timestamps de Firestore y objetos Date nativos.
 *
 * Props:
 *   - trades: TradeOrder[] — lista completa de órdenes (más recientes primero)
 */
import type { TradeOrder } from '@/types'
import { computed } from 'vue'

const props = defineProps<{ trades: TradeOrder[] }>()

/** Solo muestra las últimas 15 operaciones para no sobrecargar la UI */
const recent = computed(() => props.trades.slice(0, 15))

/**
 * Formatea la fecha de una orden para mostrarla en la tabla.
 * Acepta Timestamps de Firestore (con .toDate()) o strings/Date nativos.
 */
function fmtDate(createdAt: any): string {
  const d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt ?? Date.now())
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(d)
}

/** Formatea un número como moneda USD con 2 decimales */
function fmtUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n)
}
</script>

<template>
  <section class="tht-section" aria-label="Historial de operaciones">
    <h3 class="tht-title">Historial de operaciones</h3>

    <div v-if="recent.length === 0" class="tht-empty">
      <p>Aún no realizaste ninguna operación. ¡Compra tu primera acción!</p>
    </div>

    <div v-else class="tht-table-wrapper">
      <table class="tht-table" role="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Símbolo</th>
            <th class="tht-right">Cant.</th>
            <th class="tht-right">Precio</th>
            <th class="tht-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in recent"
            :key="t.id ?? t.symbol + t.priceAtOrder"
            class="tht-row"
            :class="t.action === 'buy' ? 'tht-row--buy' : 'tht-row--sell'"
          >
            <td class="tht-date">{{ fmtDate(t.createdAt) }}</td>
            <td>
              <span class="tht-action-badge" :class="t.action === 'buy' ? 'badge--buy' : 'badge--sell'">
                {{ t.action === 'buy' ? 'Compra' : 'Venta' }}
              </span>
            </td>
            <td class="tht-symbol">{{ t.symbol }}</td>
            <td class="tht-right tht-mono">{{ t.quantity }}</td>
            <td class="tht-right tht-mono">{{ fmtUSD(t.priceAtOrder) }}</td>
            <td class="tht-right tht-mono tht-bold">{{ fmtUSD(t.totalUSD) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";

.tht-section {
  @apply flex flex-col gap-4;
}

.tht-title {
  @apply font-heading text-lg font-bold text-text-primary;
}

.tht-empty {
  @apply font-body text-sm text-text-muted text-center p-8 bg-bg-elevated rounded-xl border border-white/5;
}

.tht-table-wrapper {
  @apply overflow-x-auto rounded-xl border border-white/8;
}

.tht-table {
  @apply w-full text-sm border-collapse;
}

.tht-table thead tr {
  @apply bg-bg-elevated;
}

.tht-table th {
  @apply font-heading text-xs font-semibold text-text-muted uppercase tracking-wider;
  @apply px-4 py-3 text-left border-b border-white/8;
}

.tht-row {
  @apply border-b border-white/5 transition-colors;
}

.tht-row:last-child { @apply border-b-0; }

.tht-row td {
  @apply px-4 py-3 font-body text-sm text-text-secondary;
}

.tht-row--buy  { @apply hover:bg-accent-growth/5; }
.tht-row--sell { @apply hover:bg-accent-alert/5; }

.tht-date {
  @apply text-xs text-text-muted whitespace-nowrap;
}

.tht-action-badge {
  @apply font-body text-xs font-semibold px-2 py-0.5 rounded-full;
}

.badge--buy  { @apply bg-accent-growth/15 text-accent-growth; }
.badge--sell { @apply bg-accent-alert/15 text-accent-alert; }

.tht-symbol { @apply font-mono font-bold text-text-primary; }
.tht-right  { @apply text-right; }
.tht-mono   { @apply font-mono text-text-secondary; }
.tht-bold   { @apply font-semibold text-text-primary; }
</style>
