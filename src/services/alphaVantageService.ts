import type { AVDailyPoint, AVFundamentals } from '@/types'

const BASE_URL = 'https://www.alphavantage.co/query'
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY as string

// Cache en memoria — evita gastar cuota (25 req/día en plan free)
const cache = new Map<string, { data: unknown; timestamp: number }>()

const TTL = {
  timeSeries: 7 * 24 * 60 * 60 * 1000, // 7 días — histórico no cambia
  overview: 30 * 24 * 60 * 60 * 1000, // 30 días — fundamentales cambian poco
}

function getCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > TTL[key.startsWith('overview') ? 'overview' : 'timeSeries']) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Fetch simple a Alpha Vantage sin retry agresivo.
 * ⚠️ Plan free: 25 req/día y 5 req/min — no malgastar cuota con reintentos.
 */
async function fetchAV(params: Record<string, string>): Promise<Record<string, unknown>> {
  if (!API_KEY) {
    console.warn('[alphaVantageService] VITE_ALPHA_VANTAGE_API_KEY no configurada')
    // Retornamos objeto vacío si no hay key (para no romper en local si se olvidan)
  }

  const url = new URL(BASE_URL)
  Object.entries({ ...params, apikey: API_KEY || 'demo' }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  )

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`)

  const data = (await res.json()) as Record<string, unknown>

  // Las API keys a veces devuelven error 200 OK pero con un payload indicando error.
  if ('Error Message' in data) {
    throw new Error(`Alpha Vantage: ${data['Error Message']}`)
  }
  if ('Note' in data) {
    throw new Error('Alpha Vantage: rate limit alcanzado (25 req/día)')
  }
  if (
    'Information' in data &&
    typeof data['Information'] === 'string' &&
    data['Information'].includes('rate limit')
  ) {
    throw new Error('Alpha Vantage: rate limit alcanzado (25 req/día)')
  }

  return data
}

// ─── Serie histórica diaria ────────────────────────────────────

/**
 * Obtiene los últimos 100 días de precios diarios para un símbolo.
 * Cache: 7 días (los datos históricos no cambian).
 */
export async function getTimeSeries(symbol: string): Promise<AVDailyPoint[]> {
  const key = `timeseries_${symbol}`
  const cached = getCache<AVDailyPoint[]>(key)
  if (cached) return cached

  const data = await fetchAV({
    function: 'TIME_SERIES_DAILY',
    symbol,
    outputsize: 'compact', // 100 días — suficiente para MVP
  })

  // Revisar si viene la serie
  const series = data['Time Series (Daily)'] as Record<string, Record<string, string>> | undefined
  if (!series) throw new Error(`Sin datos históricos para ${symbol}`)

  const points: AVDailyPoint[] = Object.entries(series)
    .map(([date, v]) => ({
      date,
      open: parseFloat(v['1. open']),
      high: parseFloat(v['2. high']),
      low: parseFloat(v['3. low']),
      close: parseFloat(v['4. close']),
      volume: parseInt(v['5. volume']),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  setCache(key, points)
  return points
}

// ─── Datos fundamentales ────────────────────────────────────────

/**
 * Obtiene datos fundamentales de un ETF/acción (nombre, dividendo, 52w range…).
 * Cache: 30 días.
 */
export async function getOverview(symbol: string): Promise<AVFundamentals> {
  const key = `overview_${symbol}`
  const cached = getCache<AVFundamentals>(key)
  if (cached) return cached

  const data = await fetchAV({ function: 'OVERVIEW', symbol })

  // A veces alpha vantage falla y no tira errorMessage pero retorna un JSON sin Symbol
  if (Object.keys(data).length === 0 || !data['Symbol']) {
    return {
      symbol,
      name: '',
      description: '',
      assetType: '',
      dividendYield: 0,
      dividendPerShare: 0,
      marketCap: 0,
      week52High: 0,
      week52Low: 0,
      lastUpdated: new Date().toISOString(),
    }
  }

  const result: AVFundamentals = {
    symbol: (data['Symbol'] as string) ?? symbol,
    name: (data['Name'] as string) ?? '',
    description: (data['Description'] as string) ?? '',
    assetType: (data['AssetType'] as string) ?? '',
    dividendYield: parseFloat(data['DividendYield'] as string) || 0,
    dividendPerShare: parseFloat(data['DividendPerShare'] as string) || 0,
    marketCap: parseFloat(data['MarketCapitalization'] as string) || 0,
    week52High: parseFloat(data['52WeekHigh'] as string) || 0,
    week52Low: parseFloat(data['52WeekLow'] as string) || 0,
    lastUpdated: new Date().toISOString(),
  }

  setCache(key, result)
  return result
}

/**
 * Filtra una serie histórica según rango temporal.
 * @param points - Array ordenado más reciente primero
 * @param range  - '1W' | '1M' | '3M' | '6M' | '1Y'
 */
export function filterByRange(
  points: AVDailyPoint[],
  range: '1W' | '1M' | '3M' | '6M' | '1Y'
): AVDailyPoint[] {
  const days: Record<string, number> = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
  const cutoff = new Date(Date.now() - (days[range] ?? 30) * 24 * 60 * 60 * 1000)
  return points.filter(p => new Date(p.date) >= cutoff)
}

export function clearCache() {
  cache.clear()
}
