import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QuoteResponse, AVDailyPoint, AVFundamentals } from '@/types'
import { getQuotes } from '@/services/finnhubService'
import { getTimeSeries, getOverview, filterByRange } from '@/services/alphaVantageService'
import { INSTRUMENTOS } from '@/data/instruments'

// Símbolos que usan API (tipo: 'api')
const API_SYMBOLS = INSTRUMENTOS
  .filter(i => i.tipo === 'api' && i.ticker)
  .map(i => i.ticker as string)

export const useMarketDataStore = defineStore('marketData', () => {

  // ─── Precios actuales (Finnhub) ──────────────────────────────
  const quotes = ref<Record<string, QuoteResponse>>({})
  const loadingQuotes = ref(false)
  const lastFetch = ref<Date | null>(null)

  // ─── Histórico + Fundamentales (Alpha Vantage) ───────────────
  const historicalData = ref<Record<string, AVDailyPoint[]>>({})
  const fundamentals = ref<Record<string, AVFundamentals>>({})
  const loadingHistorical = ref(false)

  // ─── Error compartido ─────────────────────────────────────────
  const error = ref<string | null>(null)

  // ─── Getters ─────────────────────────────────────────────────
  const hasQuotes = computed(() => Object.keys(quotes.value).length > 0)

  function getPrice(symbol: string): number | null {
    return quotes.value[symbol]?.price ?? null
  }

  function getHistory(symbol: string, range: '1W' | '1M' | '3M' | '6M' | '1Y' = '1M'): AVDailyPoint[] {
    const points = historicalData.value[symbol] ?? []
    return filterByRange(points, range)
  }

  // ─── Actions ─────────────────────────────────────────────────

  /**
   * Precios actuales vía Finnhub.
   * Silencioso si no hay API key — la app sigue con tasas curadas.
   */
  async function fetchQuotes() {
    if (loadingQuotes.value) return
    loadingQuotes.value = true
    error.value = null

    try {
      const results = await getQuotes(API_SYMBOLS)
      results.forEach(q => { quotes.value[q.symbol] = q })
      lastFetch.value = new Date()
    } catch (e) {
      error.value = 'No se pudieron obtener precios actuales'
      console.warn('[marketData] fetchQuotes:', e)
    } finally {
      loadingQuotes.value = false
    }
  }

  /**
   * Serie histórica diaria vía Alpha Vantage.
   * ⚠️ Plan free: 25 req/día — llamar solo bajo demanda, no en mount.
   */
  async function fetchHistorical(symbol: string) {
    if (loadingHistorical.value) return
    loadingHistorical.value = true
    error.value = null

    try {
      historicalData.value[symbol] = await getTimeSeries(symbol)
    } catch (e) {
      error.value = `No se pudo cargar el historial de ${symbol}`
      console.warn('[marketData] fetchHistorical:', e)
    } finally {
      loadingHistorical.value = false
    }
  }

  /**
   * Datos fundamentales de un ETF vía Alpha Vantage.
   * ⚠️ Plan free: llamar solo bajo demanda.
   */
  async function fetchFundamentals(symbol: string) {
    error.value = null
    try {
      fundamentals.value[symbol] = await getOverview(symbol)
    } catch (e) {
      error.value = `No se pudieron cargar los datos de ${symbol}`
      console.warn('[marketData] fetchFundamentals:', e)
    }
  }

  function reset() {
    quotes.value = {}
    historicalData.value = {}
    fundamentals.value = {}
    lastFetch.value = null
    error.value = null
  }

  return {
    // state
    quotes,
    historicalData,
    fundamentals,
    loadingQuotes,
    loadingHistorical,
    lastFetch,
    error,
    // getters
    hasQuotes,
    getPrice,
    getHistory,
    // actions
    fetchQuotes,
    fetchHistorical,
    fetchFundamentals,
    reset,
  }
})
