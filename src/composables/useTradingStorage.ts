// ============================================================
// useTradingStorage.ts — Kasane Trading Lab 🧪
//
// Interfaz reactiva sobre localStorage para las preferencias
// del módulo de trading. Centraliza el acceso al storage
// en un único composable reutilizable.
//
// Keys de localStorage:
//   "kasane_trading_watchlist"  → símbolo[] favoritos del usuario
//   "kasane_trading_selected"   → último símbolo visto en el detalle
// ============================================================

import { ref } from 'vue'

const WATCHLIST_KEY = 'kasane_trading_watchlist'
const SELECTED_KEY = 'kasane_trading_selected'

function readWatchlist(): string[] {
    try {
        return JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? '[]') as string[]
    } catch {
        return []
    }
}

/**
 * Composable para persistir preferencias de trading en localStorage.
 *
 * - watchlist: lista de símbolos marcados como favoritos (⭐)
 * - lastSelected: último símbolo cuyo detalle visitó el usuario
 */
export function useTradingStorage() {
    // ─── Watchlist ────────────────────────────────────────────
    const watchlist = ref<string[]>(readWatchlist())

    function toggleWatchlist(symbol: string): void {
        const idx = watchlist.value.indexOf(symbol)
        if (idx === -1) {
            watchlist.value.push(symbol)
        } else {
            watchlist.value.splice(idx, 1)
        }
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist.value))
    }

    function isWatched(symbol: string): boolean {
        return watchlist.value.includes(symbol)
    }

    // ─── Última acción seleccionada ──────────────────────────
    const lastSelected = ref<string | null>(
        localStorage.getItem(SELECTED_KEY),
    )

    function setLastSelected(symbol: string | null): void {
        lastSelected.value = symbol
        if (symbol) {
            localStorage.setItem(SELECTED_KEY, symbol)
        } else {
            localStorage.removeItem(SELECTED_KEY)
        }
    }

    // ─── Limpieza (útil en logout) ────────────────────────────
    function clearTradingStorage(): void {
        localStorage.removeItem(WATCHLIST_KEY)
        localStorage.removeItem(SELECTED_KEY)
        watchlist.value = []
        lastSelected.value = null
    }

    return {
        watchlist,
        toggleWatchlist,
        isWatched,
        lastSelected,
        setLastSelected,
        clearTradingStorage,
    }
}
