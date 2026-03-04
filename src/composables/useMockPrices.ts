// ============================================================
// useMockPrices.ts — Kasane Trading Lab 🧪
//
// Genera precios animados sin depender de APIs externas.
// Usa sessionStorage para conservar el historial de la sesión:
//   - El usuario ve el mismo gráfico al navegar entre acciones
//   - Al cerrar el tab, el historial se regenera (fresh start)
//
// sessionStorage key: "kasane_mock_history_{symbol}"
// ============================================================

import { ref, onUnmounted } from 'vue'
import type { AccionCatalogo } from '@/data/acciones'

const HISTORY_DAYS = 60
const UPDATE_INTERVAL_MS = 5000
const VOLATILITY = 0.008 // ±0.8% por tick

/**
 * Genera un array de N precios de cierre simulados a partir de un precio base,
 * aplicando un random walk con volatilidad controlada.
 * Los guarda en sessionStorage para conservarlos durante la sesión.
 */
function getOrCreateHistory(symbol: string, basePrice: number): number[] {
    const key = `kasane_mock_history_${symbol}`
    const cached = sessionStorage.getItem(key)

    if (cached) {
        try {
            return JSON.parse(cached) as number[]
        } catch {
            // si el JSON está corrupto, regenerar
        }
    }

    const history: number[] = [basePrice]
    for (let i = 1; i < HISTORY_DAYS; i++) {
        const last = history[i - 1]
        const change = last * (Math.random() * VOLATILITY * 2 - VOLATILITY)
        history.push(Math.max(1, last + change))
    }

    sessionStorage.setItem(key, JSON.stringify(history))
    return history
}

/**
 * Extiende el historial de la sesión con un nuevo precio tick
 * y lo persiste en sessionStorage.
 */
function appendToHistory(symbol: string, newPrice: number): void {
    const key = `kasane_mock_history_${symbol}`
    const cached = sessionStorage.getItem(key)
    if (!cached) return
    try {
        const history = JSON.parse(cached) as number[]
        history.push(newPrice)
        // Mantener solo los últimos HISTORY_DAYS * 3 puntos para no crecer indefinidamente
        if (history.length > HISTORY_DAYS * 3) history.shift()
        sessionStorage.setItem(key, JSON.stringify(history))
    } catch {
        // si falla, no es crítico
    }
}

/**
 * Composable de precios mock animados.
 *
 * @param acciones Lista de instrumentos a simular
 * @returns
 *   - prices: Record<symbol, precioActual> — reactivo, se actualiza cada 5s
 *   - getHistory(symbol): historial completo desde sessionStorage
 */
export function useMockPrices(acciones: AccionCatalogo[]) {
    // Inicializar precios con los bases de la sesión
    const prices = ref<Record<string, number>>(
        Object.fromEntries(
            acciones.map(a => {
                const history = getOrCreateHistory(a.symbol, a.priceBase)
                return [a.symbol, history[history.length - 1]]
            }),
        ),
    )

    // Actualizar precios cada 5 segundos con variación aleatoria
    const interval = setInterval(() => {
        acciones.forEach(a => {
            const current = prices.value[a.symbol]
            const delta = current * (Math.random() * VOLATILITY * 2 - VOLATILITY)
            const next = Math.max(1, current + delta)
            prices.value[a.symbol] = next
            appendToHistory(a.symbol, next)
        })
    }, UPDATE_INTERVAL_MS)

    onUnmounted(() => clearInterval(interval))

    /** Retorna el historial de precios de la sesión para construir el chart */
    function getHistory(symbol: string): number[] {
        const accion = acciones.find(a => a.symbol === symbol)
        if (!accion) return []
        return getOrCreateHistory(symbol, accion.priceBase)
    }

    return { prices, getHistory }
}
