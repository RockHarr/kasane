// ============================================================
// stores/trading.ts — Kasane Trading Lab 🧪
//
// Pinia store central del módulo de trading simulado.
// Sigue el mismo patrón composition API del resto de stores.
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TradingAccount, TradingHolding, TradeOrder } from '@/types'
import {
    loadTradingAccount,
    saveTradingAccount,
    initializeTradingAccount,
    saveTradeOrder,
    loadTradeHistory,
} from '@/services/trading'

export const INITIAL_CAPITAL = 10_000

export const useTradingStore = defineStore('trading', () => {
    const account = ref<TradingAccount | null>(null)
    const trades = ref<TradeOrder[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // ─── Precio actual de cada holding (inyectado desde useMockPrices) ──
    // El store no conoce los precios directamente — la vista los pasa
    // a través de setPrices() para calcular los getters de P&L.
    const currentPrices = ref<Record<string, number>>({})

    function setPrices(prices: Record<string, number>) {
        currentPrices.value = prices
    }

    // ─── Getters ─────────────────────────────────────────────

    /** Valor de mercado de todos los holdings al precio actual */
    const holdingsValueUSD = computed(() => {
        if (!account.value) return 0
        return account.value.holdings.reduce((sum, h) => {
            const price = currentPrices.value[h.symbol] ?? h.avgBuyPrice
            return sum + h.quantity * price
        }, 0)
    })

    /** Valor total del portafolio = cash disponible + valor de holdings */
    const portfolioValueUSD = computed(() =>
        (account.value?.cashUSD ?? 0) + holdingsValueUSD.value,
    )

    /** P&L absoluto vs capital inicial */
    const totalPnL = computed(() => portfolioValueUSD.value - INITIAL_CAPITAL)

    /** P&L en porcentaje */
    const totalPnLPercent = computed(() => (totalPnL.value / INITIAL_CAPITAL) * 100)

    // ─── Actions ─────────────────────────────────────────────

    /** Carga la cuenta desde Firestore o la inicializa si es nueva. */
    async function fetch(uid: string) {
        loading.value = true
        error.value = null
        try {
            const remote = await loadTradingAccount(uid)
            account.value = remote ?? (await initializeTradingAccount(uid))
            trades.value = await loadTradeHistory(uid)
        } catch (e) {
            error.value = 'No se pudo cargar la cuenta de trading'
            console.error('[trading] fetch error:', e)
        } finally {
            loading.value = false
        }
    }

    /**
     * Compra N acciones al precio dado.
     * Valida saldo disponible antes de ejecutar.
     */
    async function executeBuy(
        uid: string,
        symbol: string,
        name: string,
        quantity: number,
        price: number,
    ) {
        if (!account.value) return
        const totalCost = quantity * price
        if (account.value.cashUSD < totalCost) {
            error.value = 'Saldo insuficiente para realizar esta compra'
            return
        }

        error.value = null

        // Actualizar cash
        account.value.cashUSD -= totalCost

        // Actualizar o crear holding (promedio ponderado)
        const existing = account.value.holdings.find(h => h.symbol === symbol)
        if (existing) {
            const totalQty = existing.quantity + quantity
            existing.avgBuyPrice =
                (existing.avgBuyPrice * existing.quantity + price * quantity) / totalQty
            existing.quantity = totalQty
        } else {
            account.value.holdings.push({ symbol, name, quantity, avgBuyPrice: price })
        }

        // Persistir
        const order: Omit<TradeOrder, 'id' | 'createdAt'> = {
            symbol,
            name,
            action: 'buy',
            quantity,
            priceAtOrder: price,
            totalUSD: totalCost,
        }
        await Promise.all([
            saveTradingAccount(uid, account.value),
            saveTradeOrder(uid, order).then(id => {
                trades.value.unshift({ ...order, id })
            }),
        ])
    }

    /**
     * Vende N acciones al precio dado.
     * Valida que el holding exista y tenga cantidad suficiente.
     */
    async function executeSell(
        uid: string,
        symbol: string,
        name: string,
        quantity: number,
        price: number,
    ) {
        if (!account.value) return
        const holding = account.value.holdings.find(h => h.symbol === symbol)
        if (!holding || holding.quantity < quantity) {
            error.value = 'No tienes suficientes acciones para vender'
            return
        }

        error.value = null
        const totalRevenue = quantity * price
        account.value.cashUSD += totalRevenue
        holding.quantity -= quantity

        // Eliminar el holding si llega a cero
        if (holding.quantity === 0) {
            account.value.holdings = account.value.holdings.filter(h => h.symbol !== symbol)
        }

        const order: Omit<TradeOrder, 'id' | 'createdAt'> = {
            symbol,
            name,
            action: 'sell',
            quantity,
            priceAtOrder: price,
            totalUSD: totalRevenue,
        }
        await Promise.all([
            saveTradingAccount(uid, account.value),
            saveTradeOrder(uid, order).then(id => {
                trades.value.unshift({ ...order, id })
            }),
        ])
    }

    /** Limpia el estado local (llamar en logout) */
    function reset() {
        account.value = null
        trades.value = []
        loading.value = false
        error.value = null
        currentPrices.value = {}
    }

    return {
        account,
        trades,
        loading,
        error,
        currentPrices,
        // getters
        holdingsValueUSD,
        portfolioValueUSD,
        totalPnL,
        totalPnLPercent,
        // actions
        fetch,
        executeBuy,
        executeSell,
        setPrices,
        reset,
    }
})
