import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTimeSeries, getOverview, filterByRange, clearCache } from './alphaVantageService'

// Mock del objeto global `fetch`
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('alphaVantageService', () => {
  beforeEach(() => {
    // Limpiar mocks y el caché interno del servicio antes de cada test
    vi.clearAllMocks()
    clearCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getTimeSeries', () => {
    it('formatea y retorna correctamente los puntos de una serie histórica', async () => {
      const mockApiResponse = {
        'Time Series (Daily)': {
          '2023-10-01': {
            '1. open': '150.0',
            '2. high': '155.0',
            '3. low': '149.0',
            '4. close': '152.0',
            '5. volume': '10000',
          },
          '2023-10-02': {
            '1. open': '152.0',
            '2. high': '158.0',
            '3. low': '151.0',
            '4. close': '157.0',
            '5. volume': '12000',
          },
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })

      const result = await getTimeSeries('AAPL')

      // Debería estar ordenado del más reciente al más antiguo
      expect(result).toHaveLength(2)
      expect(result[0].date).toBe('2023-10-02') // El más reciente primero
      expect(result[0].close).toBe(157.0)
      expect(result[1].date).toBe('2023-10-01')
      expect(result[1].volume).toBe(10000)

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('utiliza la caché y no hace fetch duplicados en llamadas consecutivas', async () => {
      const mockApiResponse = {
        'Time Series (Daily)': {
          '2023-10-01': {
            '1. open': '10',
            '2. high': '10',
            '3. low': '10',
            '4. close': '10',
            '5. volume': '10',
          },
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })

      // Primera llamada real
      await getTimeSeries('TSLA')
      // Segunda llamada que debería ser desde caché
      await getTimeSeries('TSLA')

      expect(fetchMock).toHaveBeenCalledTimes(1) // Solo se disparó el primer fetch
    })

    it('lanza un error si se alcanza el Rate Limit diario (Note)', async () => {
      const mockRateLimitResponse = {
        Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 25 requests per day.',
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRateLimitResponse,
      })

      await expect(getTimeSeries('AAPL')).rejects.toThrow(/rate limit alcanzado/)
    })

    it('lanza un error general si el campo Error Message está presente', async () => {
      const mockErrorResponse = {
        'Error Message': 'Invalid API call. Please retry or visit the documentation.',
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      })

      await expect(getTimeSeries('AAPL')).rejects.toThrow(/Alpha Vantage: Invalid API call./)
    })
  })

  describe('getOverview', () => {
    it('mapea correctamente las propiedades fundamentales', async () => {
      const mockOverviewResponse = {
        Symbol: 'NVDA',
        Name: 'NVIDIA Corp',
        Description: 'Semiconductors',
        AssetType: 'Common Stock',
        DividendYield: '0.0003',
        DividendPerShare: '0.16',
        MarketCapitalization: '1000000000000',
        '52WeekHigh': '500.0',
        '52WeekLow': '120.0',
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOverviewResponse,
      })

      const result = await getOverview('NVDA')

      expect(result.symbol).toBe('NVDA')
      expect(result.name).toBe('NVIDIA Corp')
      expect(result.dividendYield).toBe(0.0003)
      expect(result.marketCap).toBe(1000000000000)
    })
  })

  describe('filterByRange', () => {
    it('filtra los datos históricos para dejar únicamente los del periodo solicitado (ej: 1W, 1M)', () => {
      // Fake now para no depender de la fecha del SO local
      const NOW = new Date('2023-11-01T00:00:00Z').getTime()
      vi.useFakeTimers()
      vi.setSystemTime(NOW)

      const points = [
        { date: '2023-10-30', close: 10, open: 10, high: 10, low: 10, volume: 1 }, // 2 días atrás
        { date: '2023-10-20', close: 10, open: 10, high: 10, low: 10, volume: 1 }, // 12 días atrás
        { date: '2023-09-01', close: 10, open: 10, high: 10, low: 10, volume: 1 }, // 2 meses atrás
      ]

      const oneWeek = filterByRange(points, '1W')
      expect(oneWeek).toHaveLength(1)
      expect(oneWeek[0].date).toBe('2023-10-30')

      const oneMonth = filterByRange(points, '1M')
      expect(oneMonth).toHaveLength(2)

      const tresMeses = filterByRange(points, '3M')
      expect(tresMeses).toHaveLength(3)

      vi.useRealTimers()
    })
  })
})
