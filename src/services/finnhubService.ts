import HTTPClient from '@/services/utils/httpClient'
import type { FinnhubQuote, QuoteResponse } from '@/types'

const BASE_URL = 'https://finnhub.io/api/v1'
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string

const client = new HTTPClient({ baseURL: BASE_URL, timeout: 8000 })

/**
 * Normaliza la respuesta raw de Finnhub al tipo QuoteResponse.
 */
function normalizeQuote(symbol: string, raw: FinnhubQuote): QuoteResponse {
  return {
    symbol,
    price: raw.c,
    change: raw.d,
    changePercent: raw.dp,
  }
}

/**
 * Obtiene el precio actual de un símbolo (ej: 'AGG', 'VTI').
 * Retorna null si no hay API key configurada o si el símbolo no existe.
 */
export async function getQuote(symbol: string): Promise<QuoteResponse | null> {
  if (!API_KEY) {
    console.warn('[finnhubService] VITE_FINNHUB_API_KEY no configurada — usando datos curados')
    return null
  }

  const data = (await client.get(`/quote?symbol=${symbol}&token=${API_KEY}`)) as FinnhubQuote

  // Finnhub devuelve { c: 0 } cuando el símbolo no existe
  if (!data || data.c === 0) return null

  return normalizeQuote(symbol, data)
}

/**
 * Obtiene precios de múltiples símbolos en paralelo.
 * Los que fallen o no existan se omiten silenciosamente.
 */
export async function getQuotes(symbols: string[]): Promise<QuoteResponse[]> {
  const results = await Promise.allSettled(symbols.map(s => getQuote(s)))

  return results
    .filter(
      (r): r is PromiseFulfilledResult<QuoteResponse> =>
        r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value)
}
