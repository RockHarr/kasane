# Servicios - Tesorería Simple

**Versión:** 1.0  
**Fecha:** 2025-01-30  
**Estado:** 📐 DISEÑO  
**Autor:** Rockwell Harrison

---

## 1. Overview

La capa de **servicios** es responsable de toda la comunicación con APIs externas. Actúa como abstracción entre las APIs REST y el resto de la aplicación.

### 1.1 Principios de Diseño

```
PRINCIPIO                     IMPLEMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Single Responsibility    →    1 servicio = 1 API externa
Singleton Pattern        →    Instancia única compartida
Stateless Operations     →    Sin estado interno (excepto cache)
Error Boundary           →    Nunca propagar errores HTTP raw
Type Safety              →    JSDoc completo para autocomplete
Testability              →    Mock-friendly, inyección de dependencias
```

### 1.2 Estructura de Directorios

```
src/services/
├── api/
│   ├── finnhubService.js          # Cliente Finnhub API
│   ├── alphaVantageService.js     # Cliente Alpha Vantage API
│   └── marketDataService.js       # Orquestador (ya documentado)
├── utils/
│   ├── httpClient.js              # Wrapper fetch con retry/timeout
│   ├── rateLimiter.js             # Control de rate limiting
│   └── cacheManager.js            # Gestión unificada de cache
├── validation/
│   └── symbolValidator.js         # Validación de tickers
└── index.js                       # Exports centralizados
```

---

## 2. httpClient.js - Cliente HTTP Base

### 2.1 Propósito

Wrapper sobre `fetch` nativo con:
- **Retry logic** automático con exponential backoff
- **Timeout** configurable
- **Interceptores** de request/response
- **Error normalization** (convertir HTTP errors a formato consistente)

### 2.2 Implementación

```javascript
// src/services/utils/httpClient.js

/**
 * Configuración por defecto del cliente HTTP
 */
const DEFAULT_CONFIG = {
  timeout: 10000,        // 10 segundos
  retries: 2,            // Máximo 2 reintentos
  retryDelay: 1000,      // 1 segundo entre reintentos
  retryBackoff: 2,       // Multiplicador exponencial
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * Cliente HTTP con retry logic y timeout
 */
class HTTPClient {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.requestInterceptors = []
    this.responseInterceptors = []
  }

  /**
   * Realizar request GET con retry automático
   * @param {string} url - URL completa
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Response data
   */
  async get(url, options = {}) {
    return this._requestWithRetry(url, {
      method: 'GET',
      ...options
    })
  }

  /**
   * Realizar request POST
   * @param {string} url - URL completa
   * @param {Object} data - Payload
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Response data
   */
  async post(url, data, options = {}) {
    return this._requestWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }

  /**
   * Request con retry logic y timeout
   * @private
   */
  async _requestWithRetry(url, options, attempt = 0) {
    const mergedOptions = this._mergeOptions(options)
    
    try {
      // Aplicar interceptores de request
      const modifiedUrl = await this._applyRequestInterceptors(url, mergedOptions)
      
      // Crear timeout controller
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      )

      // Realizar request
      const response = await fetch(modifiedUrl, {
        ...mergedOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Verificar status HTTP
      if (!response.ok) {
        throw await this._createHTTPError(response)
      }

      // Parse JSON
      const data = await response.json()

      // Aplicar interceptores de response
      return await this._applyResponseInterceptors(data, response)

    } catch (error) {
      // Manejar timeout
      if (error.name === 'AbortError') {
        throw new HTTPError('Request timeout', 'TIMEOUT', 408, url)
      }

      // Retry logic
      if (this._shouldRetry(error, attempt)) {
        const delay = this._calculateRetryDelay(attempt)
        
        console.warn(
          `[HTTPClient] Retry ${attempt + 1}/${this.config.retries} for ${url} after ${delay}ms`
        )
        
        await this._sleep(delay)
        return this._requestWithRetry(url, options, attempt + 1)
      }

      throw error
    }
  }

  /**
   * Determinar si debe reintentar el request
   * @private
   */
  _shouldRetry(error, attempt) {
    // No reintentar si alcanzó máximo de intentos
    if (attempt >= this.config.retries) {
      return false
    }

    // Reintentar en errores de red
    if (error instanceof TypeError) {
      return true
    }

    // Reintentar en errores 5xx (server errors)
    if (error instanceof HTTPError && error.status >= 500) {
      return true
    }

    // Reintentar en rate limit (429)
    if (error instanceof HTTPError && error.status === 429) {
      return true
    }

    return false
  }

  /**
   * Calcular delay para retry con exponential backoff
   * @private
   */
  _calculateRetryDelay(attempt) {
    return this.config.retryDelay * Math.pow(this.config.retryBackoff, attempt)
  }

  /**
   * Crear error HTTP normalizado
   * @private
   */
  async _createHTTPError(response) {
    let message = `HTTP ${response.status}: ${response.statusText}`
    let details = null

    try {
      const data = await response.json()
      message = data.message || data.error || message
      details = data
    } catch {
      // Response no es JSON, usar mensaje por defecto
    }

    return new HTTPError(
      message,
      this._getErrorCode(response.status),
      response.status,
      response.url,
      details
    )
  }

  /**
   * Mapear status HTTP a código de error
   * @private
   */
  _getErrorCode(status) {
    const codeMap = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMIT',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE'
    }
    return codeMap[status] || 'UNKNOWN_ERROR'
  }

  /**
   * Merge options con defaults
   * @private
   */
  _mergeOptions(options) {
    return {
      headers: {
        ...this.config.headers,
        ...options.headers
      },
      ...options
    }
  }

  /**
   * Aplicar interceptores de request
   * @private
   */
  async _applyRequestInterceptors(url, options) {
    let modifiedUrl = url
    
    for (const interceptor of this.requestInterceptors) {
      modifiedUrl = await interceptor(modifiedUrl, options)
    }
    
    return modifiedUrl
  }

  /**
   * Aplicar interceptores de response
   * @private
   */
  async _applyResponseInterceptors(data, response) {
    let modifiedData = data
    
    for (const interceptor of this.responseInterceptors) {
      modifiedData = await interceptor(modifiedData, response)
    }
    
    return modifiedData
  }

  /**
   * Agregar interceptor de request
   * @param {Function} interceptor - (url, options) => url
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Agregar interceptor de response
   * @param {Function} interceptor - (data, response) => data
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Sleep helper para retry delays
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Error HTTP personalizado
 */
class HTTPError extends Error {
  constructor(message, code, status, url, details = null) {
    super(message)
    this.name = 'HTTPError'
    this.code = code
    this.status = status
    this.url = url
    this.details = details
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      url: this.url,
      details: this.details
    }
  }
}

// Exportar instancia singleton
export default new HTTPClient()

// Exportar clase para testing
export { HTTPClient, HTTPError }
```

### 2.3 Uso del Cliente

```javascript
import httpClient from '@/services/utils/httpClient'

// Request simple
const data = await httpClient.get('https://api.example.com/data')

// Con interceptor para logging
httpClient.addRequestInterceptor((url, options) => {
  console.log(`[HTTP] Request to ${url}`)
  return url
})

httpClient.addResponseInterceptor((data, response) => {
  console.log(`[HTTP] Response from ${response.url}`)
  return data
})
```

---

## 3. rateLimiter.js - Control de Rate Limiting

### 3.1 Propósito

Garantizar que no se excedan los límites de rate de las APIs mediante:
- **Token bucket algorithm**
- **Queue de requests** cuando se alcanza límite
- **Tracking de uso** por ventana temporal

### 3.2 Implementación

```javascript
// src/services/utils/rateLimiter.js

/**
 * Rate Limiter basado en Token Bucket Algorithm
 */
class RateLimiter {
  constructor(config) {
    this.maxRequests = config.maxRequests      // Tokens máximos
    this.timeWindow = config.timeWindow        // Ventana en ms
    this.tokens = config.maxRequests           // Tokens disponibles
    this.queue = []                            // Cola de requests pendientes
    this.lastRefill = Date.now()               // Último refill
  }

  /**
   * Ejecutar función respetando rate limit
   * @param {Function} fn - Función a ejecutar
   * @returns {Promise} Resultado de la función
   */
  async execute(fn) {
    // Refill de tokens si es necesario
    this._refillTokens()

    // Si hay tokens disponibles, ejecutar inmediatamente
    if (this.tokens > 0) {
      this.tokens--
      return fn()
    }

    // Si no hay tokens, agregar a cola
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
      this._processQueue()
    })
  }

  /**
   * Refill de tokens según tiempo transcurrido
   * @private
   */
  _refillTokens() {
    const now = Date.now()
    const elapsed = now - this.lastRefill

    // Si pasó la ventana completa, refill completo
    if (elapsed >= this.timeWindow) {
      this.tokens = this.maxRequests
      this.lastRefill = now
      return
    }

    // Refill proporcional al tiempo transcurrido
    const tokensToAdd = Math.floor(
      (elapsed / this.timeWindow) * this.maxRequests
    )

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.maxRequests)
      this.lastRefill = now
    }
  }

  /**
   * Procesar cola de requests pendientes
   * @private
   */
  async _processQueue() {
    if (this.queue.length === 0) return

    // Esperar hasta que haya tokens disponibles
    const waitTime = this._calculateWaitTime()
    
    await new Promise(resolve => setTimeout(resolve, waitTime))

    // Refill y procesar
    this._refillTokens()

    while (this.queue.length > 0 && this.tokens > 0) {
      const { fn, resolve, reject } = this.queue.shift()
      this.tokens--

      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    // Si quedan items en cola, continuar procesando
    if (this.queue.length > 0) {
      this._processQueue()
    }
  }

  /**
   * Calcular tiempo de espera hasta próximo token
   * @private
   */
  _calculateWaitTime() {
    const elapsed = Date.now() - this.lastRefill
    const remaining = this.timeWindow - elapsed
    
    // Esperar proporcionalmente para obtener 1 token
    return Math.max(remaining / this.maxRequests, 100)
  }

  /**
   * Obtener estado actual del limiter
   */
  getStatus() {
    return {
      availableTokens: this.tokens,
      maxTokens: this.maxRequests,
      queueLength: this.queue.length,
      timeWindow: this.timeWindow
    }
  }

  /**
   * Reset completo del limiter
   */
  reset() {
    this.tokens = this.maxRequests
    this.queue = []
    this.lastRefill = Date.now()
  }
}

export default RateLimiter
```

### 3.3 Uso del Rate Limiter

```javascript
import RateLimiter from '@/services/utils/rateLimiter'

// Configurar limiter para Finnhub (60 req/min)
const finnhubLimiter = new RateLimiter({
  maxRequests: 60,
  timeWindow: 60000 // 1 minuto
})

// Uso
await finnhubLimiter.execute(async () => {
  return fetch('https://finnhub.io/api/v1/quote?...')
})
```

---

## 4. cacheManager.js - Gestión de Cache

### 4.1 Propósito

Sistema unificado de cache con:
- **Múltiples estrategias** (memory, localStorage, IndexedDB)
- **TTL configurable** por tipo de dato
- **LRU eviction** cuando se alcanza límite
- **Serialización automática** de objetos complejos

### 4.2 Implementación

```javascript
// src/services/utils/cacheManager.js

/**
 * Cache Manager con soporte para múltiples backends
 */
class CacheManager {
  constructor(config = {}) {
    this.backend = config.backend || 'memory'    // 'memory' | 'localStorage' | 'indexedDB'
    this.maxSize = config.maxSize || 100         // Máximo de entries
    this.defaultTTL = config.defaultTTL || 300000 // 5 minutos por defecto
    
    // Cache en memoria (siempre presente)
    this.memoryCache = new Map()
    this.accessLog = new Map() // Para LRU
  }

  /**
   * Obtener valor del cache
   * @param {string} key - Clave
   * @returns {*} Valor o null si no existe/expiró
   */
  async get(key) {
    // 1. Intentar memoria primero
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)
      
      // Verificar TTL
      if (this._isExpired(entry)) {
        this.memoryCache.delete(key)
        return null
      }

      // Actualizar access log para LRU
      this.accessLog.set(key, Date.now())
      
      return entry.value
    }

    // 2. Si no está en memoria, buscar en backend persistente
    if (this.backend !== 'memory') {
      const value = await this._getFromBackend(key)
      
      if (value !== null) {
        // Cargar a memoria para próximos accesos
        this.memoryCache.set(key, {
          value,
          timestamp: Date.now(),
          ttl: this.defaultTTL
        })
      }

      return value
    }

    return null
  }

  /**
   * Guardar valor en cache
   * @param {string} key - Clave
   * @param {*} value - Valor
   * @param {number} ttl - Time to live en ms (opcional)
   */
  async set(key, value, ttl = this.defaultTTL) {
    const entry = {
      value,
      timestamp: Date.now(),
      ttl
    }

    // 1. Guardar en memoria
    this.memoryCache.set(key, entry)
    this.accessLog.set(key, Date.now())

    // 2. Eviction si se alcanza límite
    if (this.memoryCache.size > this.maxSize) {
      this._evictLRU()
    }

    // 3. Persistir en backend si está configurado
    if (this.backend !== 'memory') {
      await this._setInBackend(key, entry)
    }
  }

  /**
   * Eliminar valor del cache
   * @param {string} key - Clave
   */
  async delete(key) {
    this.memoryCache.delete(key)
    this.accessLog.delete(key)

    if (this.backend !== 'memory') {
      await this._deleteFromBackend(key)
    }
  }

  /**
   * Limpiar todo el cache
   */
  async clear() {
    this.memoryCache.clear()
    this.accessLog.clear()

    if (this.backend !== 'memory') {
      await this._clearBackend()
    }
  }

  /**
   * Verificar si entry ha expirado
   * @private
   */
  _isExpired(entry) {
    const age = Date.now() - entry.timestamp
    return age > entry.ttl
  }

  /**
   * Evictar entry menos recientemente usado (LRU)
   * @private
   */
  _evictLRU() {
    let oldestKey = null
    let oldestTime = Infinity

    for (const [key, accessTime] of this.accessLog) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime
        oldestKey = key
      }
    }

    if (oldestKey) {
      console.log(`[Cache] Evicting LRU entry: ${oldestKey}`)
      this.memoryCache.delete(oldestKey)
      this.accessLog.delete(oldestKey)
    }
  }

  /**
   * Obtener del backend persistente
   * @private
   */
  async _getFromBackend(key) {
    if (this.backend === 'localStorage') {
      try {
        const raw = localStorage.getItem(`cache_${key}`)
        if (!raw) return null

        const entry = JSON.parse(raw)
        
        if (this._isExpired(entry)) {
          localStorage.removeItem(`cache_${key}`)
          return null
        }

        return entry.value
      } catch (error) {
        console.error('[Cache] Error reading from localStorage:', error)
        return null
      }
    }

    // TODO: Implementar IndexedDB
    return null
  }

  /**
   * Guardar en backend persistente
   * @private
   */
  async _setInBackend(key, entry) {
    if (this.backend === 'localStorage') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
      } catch (error) {
        // QuotaExceededError: localStorage lleno
        console.error('[Cache] Error writing to localStorage:', error)
        
        // Limpiar entries expiradas e intentar nuevamente
        this._cleanExpiredFromLocalStorage()
        
        try {
          localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
        } catch {
          console.error('[Cache] localStorage permanently full')
        }
      }
    }
  }

  /**
   * Eliminar del backend persistente
   * @private
   */
  async _deleteFromBackend(key) {
    if (this.backend === 'localStorage') {
      localStorage.removeItem(`cache_${key}`)
    }
  }

  /**
   * Limpiar backend persistente
   * @private
   */
  async _clearBackend() {
    if (this.backend === 'localStorage') {
      // Eliminar solo items del cache (prefijo 'cache_')
      const keysToRemove = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }

  /**
   * Limpiar entries expiradas de localStorage
   * @private
   */
  _cleanExpiredFromLocalStorage() {
    const keysToRemove = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('cache_')) continue

      try {
        const raw = localStorage.getItem(key)
        const entry = JSON.parse(raw)

        if (this._isExpired(entry)) {
          keysToRemove.push(key)
        }
      } catch {
        // Entry corrupta, eliminar
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`[Cache] Cleaned ${keysToRemove.length} expired entries from localStorage`)
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    return {
      backend: this.backend,
      memorySize: this.memoryCache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.memoryCache.size / this.maxSize) * 100
    }
  }
}

export default CacheManager
```

---

## 5. finnhubService.js - Cliente Finnhub

### 5.1 Implementación Completa

```javascript
// src/services/api/finnhubService.js
import httpClient from '@/services/utils/httpClient'
import RateLimiter from '@/services/utils/rateLimiter'
import CacheManager from '@/services/utils/cacheManager'

const FINNHUB_CONFIG = {
  baseURL: 'https://finnhub.io/api/v1',
  apiKey: import.meta.env.VITE_FINNHUB_KEY,
  rateLimiter: new RateLimiter({
    maxRequests: 60,
    timeWindow: 60000 // 60 req/min
  }),
  cache: new CacheManager({
    backend: 'memory',
    maxSize: 50,
    defaultTTL: 60000 // 1 minuto
  })
}

/**
 * Cliente para Finnhub API
 * Proporciona precios en tiempo real y quotes actuales
 */
class FinnhubService {
  constructor() {
    this.baseURL = FINNHUB_CONFIG.baseURL
    this.apiKey = FINNHUB_CONFIG.apiKey
    this.rateLimiter = FINNHUB_CONFIG.rateLimiter
    this.cache = FINNHUB_CONFIG.cache
  }

  /**
   * Obtener quote actual de un símbolo
   * @param {string} symbol - Ticker (ej: 'AGG')
   * @returns {Promise<Object>} Quote data
   * @example
   * {
   *   c: 100.15,  // Current price
   *   d: 0.25,    // Change
   *   dp: 0.25,   // Percent change
   *   h: 100.50,  // High price of the day
   *   l: 99.80,   // Low price of the day
   *   o: 100.00,  // Open price of the day
   *   pc: 99.90,  // Previous close price
   *   t: 1640995200 // Timestamp
   * }
   */
  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`

    // 1. Verificar cache
    const cached = await this.cache.get(cacheKey)
    if (cached) {
      console.log(`[Finnhub] Cache hit for ${symbol}`)
      return cached
    }

    // 2. Request a API con rate limiting
    const url = `${this.baseURL}/quote?symbol=${symbol}&token=${this.apiKey}`

    const data = await this.rateLimiter.execute(async () => {
      try {
        const response = await httpClient.get(url)
        return response
      } catch (error) {
        throw this._normalizeError(error, symbol)
      }
    })

    // 3. Validar respuesta
    if (data.c === 0) {
      throw new FinnhubError(
        `Symbol '${symbol}' not found or has no data`,
        'INVALID_SYMBOL',
        symbol
      )
    }

    // 4. Guardar en cache
    await this.cache.set(cacheKey, data, 60000) // 1 minuto

    return data
  }

  /**
   * Obtener quotes para múltiples símbolos (batch)
   * @param {string[]} symbols - Array de tickers
   * @returns {Promise<Object>} { 'AGG': {...}, 'VYM': {...}, ... }
   */
  async getBatchQuotes(symbols) {
    const promises = symbols.map(async symbol => {
      try {
        const quote = await this.getQuote(symbol)
        return [symbol, quote]
      } catch (error) {
        console.error(`[Finnhub] Error fetching quote for ${symbol}:`, error)
        return [symbol, null]
      }
    })

    const results = await Promise.all(promises)
    return Object.fromEntries(results)
  }

  /**
   * Obtener perfil de empresa/ETF
   * @param {string} symbol - Ticker
   * @returns {Promise<Object>} Company profile
   */
  async getCompanyProfile(symbol) {
    const cacheKey = `profile_${symbol}`

    const cached = await this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    const url = `${this.baseURL}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`

    const data = await this.rateLimiter.execute(async () => {
      try {
        return await httpClient.get(url)
      } catch (error) {
        throw this._normalizeError(error, symbol)
      }
    })

    // Cache por 24 horas (datos de perfil cambian raramente)
    await this.cache.set(cacheKey, data, 24 * 60 * 60 * 1000)

    return data
  }

  /**
   * Normalizar errores de Finnhub
   * @private
   */
  _normalizeError(error, symbol) {
    if (error.code === 'RATE_LIMIT') {
      return new FinnhubError(
        'Rate limit exceeded for Finnhub API (60/min)',
        'RATE_LIMIT',
        symbol
      )
    }

    if (error.code === 'UNAUTHORIZED') {
      return new FinnhubError(
        'Invalid Finnhub API key',
        'INVALID_API_KEY',
        symbol
      )
    }

    return new FinnhubError(
      error.message || 'Unknown Finnhub error',
      'API_ERROR',
      symbol
    )
  }

  /**
   * Limpiar cache
   */
  clearCache() {
    this.cache.clear()
    console.log('[Finnhub] Cache cleared')
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    return {
      rateLimiter: this.rateLimiter.getStatus(),
      cache: this.cache.getStats()
    }
  }
}

/**
 * Error personalizado de Finnhub
 */
class FinnhubError extends Error {
  constructor(message, code, symbol) {
    super(message)
    this.name = 'FinnhubError'
    this.code = code
    this.symbol = symbol
  }
}

// Exportar instancia singleton
export default new FinnhubService()

// Exportar clase para testing
export { FinnhubService, FinnhubError }
```

---

## 6. alphaVantageService.js - Cliente Alpha Vantage

### 6.1 Implementación Completa

```javascript
// src/services/api/alphaVantageService.js
import httpClient from '@/services/utils/httpClient'
import RateLimiter from '@/services/utils/rateLimiter'
import CacheManager from '@/services/utils/cacheManager'

const ALPHA_VANTAGE_CONFIG = {
  baseURL: 'https://www.alphavantage.co/query',
  apiKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY,
  rateLimiter: new RateLimiter({
    maxRequests: 5,
    timeWindow: 60000 // 5 req/min
  }),
  cache: new CacheManager({
    backend: 'localStorage', // Persistente
    maxSize: 100,
    defaultTTL: 7 * 24 * 60 * 60 * 1000 // 7 días
  })
}

/**
 * Cliente para Alpha Vantage API
 * Proporciona datos históricos y fundamentales
 */
class AlphaVantageService {
  constructor() {
    this.baseURL = ALPHA_VANTAGE_CONFIG.baseURL
    this.apiKey = ALPHA_VANTAGE_CONFIG.apiKey
    this.rateLimiter = ALPHA_VANTAGE_CONFIG.rateLimiter
    this.cache = ALPHA_VANTAGE_CONFIG.cache
  }

  /**
   * Obtener serie de tiempo diaria
   * @param {string} symbol - Ticker
   * @param {string} outputSize - 'compact' (100 días) | 'full' (20+ años)
   * @returns {Promise<Array>} Array de datos históricos
   */
  async getTimeSeries(symbol, outputSize = 'compact') {
    const cacheKey = `timeseries_${symbol}_${outputSize}`

    // 1. Cache (7 días de validez)
    const cached = await this.cache.get(cacheKey)
    if (cached) {
      console.log(`[AlphaVantage] Cache hit for ${symbol} time series`)
      return cached
    }

    // 2. Request con rate limiting
    const url = `${this.baseURL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${this.apiKey}`

    const data = await this.rateLimiter.execute(async () => {
      try {
        return await httpClient.get(url)
      } catch (error) {
        throw this._normalizeError(error, symbol)
      }
    })

    // 3. Validar respuesta
    if (data['Error Message']) {
      throw new AlphaVantageError(
        `Invalid symbol: ${symbol}`,
        'INVALID_SYMBOL',
        symbol
      )
    }

    if (data['Note']) {
      throw new AlphaVantageError(
        'Rate limit exceeded (25/day)',
        'RATE_LIMIT',
        symbol
      )
    }

    // 4. Transformar datos
    const transformed = this._transformTimeSeries(data)

    // 5. Cache
    await this.cache.set(cacheKey, transformed)

    return transformed
  }

  /**
   * Obtener datos fundamentales (overview)
   * @param {string} symbol - Ticker
   * @returns {Promise<Object>} Fundamentals data
   */
  async getOverview(symbol) {
    const cacheKey = `overview_${symbol}`

    const cached = await this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    const url = `${this.baseURL}?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`

    const data = await this.rateLimiter.execute(async () => {
      try {
        return await httpClient.get(url)
      } catch (error) {
        throw this._normalizeError(error, symbol)
      }
    })

    if (data['Error Message']) {
      throw new AlphaVantageError(
        `Invalid symbol: ${symbol}`,
        'INVALID_SYMBOL',
        symbol
      )
    }

    if (data['Note']) {
      throw new AlphaVantageError(
        'Rate limit exceeded (25/day)',
        'RATE_LIMIT',
        symbol
      )
    }

    // Transformar a formato interno
    const transformed = {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      assetType: data.AssetType,
      dividendYield: parseFloat(data.DividendYield) || 0,
      dividendPerShare: parseFloat(data.DividendPerShare) || 0,
      marketCap: parseFloat(data.MarketCapitalization) || 0,
      week52High: parseFloat(data['52WeekHigh']) || 0,
      week52Low: parseFloat(data['52WeekLow']) || 0,
      lastUpdated: new Date().toISOString()
    }

    // Cache por 30 días
    await this.cache.set(cacheKey, transformed, 30 * 24 * 60 * 60 * 1000)

    return transformed
  }

  /**
   * Transformar respuesta TIME_SERIES_DAILY
   * @private
   */
  _transformTimeSeries(rawData) {
    const timeSeries = rawData['Time Series (Daily)']
    
    if (!timeSeries) {
      throw new Error('Invalid time series response')
    }

    const transformed = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    }))

    // Ordenar por fecha descendente
    return transformed.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  /**
   * Normalizar errores
   * @private
   */
  _normalizeError(error, symbol) {
    if (error.code === 'RATE_LIMIT') {
      return new AlphaVantageError(
        'Rate limit exceeded (25/day)',
        'RATE_LIMIT',
        symbol
      )
    }

    return new AlphaVantageError(
      error.message || 'Unknown Alpha Vantage error',
      'API_ERROR',
      symbol
    )
  }

  clearCache() {
    this.cache.clear()
    console.log('[AlphaVantage] Cache cleared')
  }

  getStats() {
    return {
      rateLimiter: this.rateLimiter.getStatus(),
      cache: this.cache.getStats()
    }
  }
}

/**
 * Error personalizado Alpha Vantage
 */
class AlphaVantageError extends Error {
  constructor(message, code, symbol) {
    super(message)
    this.name = 'AlphaVantageError'
    this.code = code
    this.symbol = symbol
  }
}

export default new AlphaVantageService()
export { AlphaVantageService, AlphaVantageError }
```

---

## 7. Testing de Servicios

### 7.1 finnhubService.test.js

```javascript
// tests/services/finnhubService.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FinnhubService } from '@/services/api/finnhubService'
import httpClient from '@/services/utils/httpClient'

vi.mock('@/services/utils/httpClient')

describe('FinnhubService', () => {
  let service

  beforeEach(() => {
    service = new FinnhubService()
    service.clearCache()
    vi.clearAllMocks()
  })

  describe('getQuote', () => {
    it('debería obtener quote correctamente', async () => {
      const mockQuote = {
        c: 100.15,
        d: 0.25,
        dp: 0.25,
        h: 100.50,
        l: 99.80,
        o: 100.00,
        pc: 99.90,
        t: 1640995200
      }

      httpClient.get.mockResolvedValue(mockQuote)

      const result = await service.getQuote('AGG')

      expect(result).toEqual(mockQuote)
      expect(httpClient.get).toHaveBeenCalledTimes(1)
    })

    it('debería usar cache en segunda llamada', async () => {
      httpClient.get.mockResolvedValue({ c: 100.15 })

      await service.getQuote('AGG')
      await service.getQuote('AGG')

      expect(httpClient.get).toHaveBeenCalledTimes(1)
    })

    it('debería lanzar error para símbolo inválido', async () => {
      httpClient.get.mockResolvedValue({ c: 0 })

      await expect(service.getQuote('INVALID')).rejects.toThrow('not found')
    })
  })

  describe('getBatchQuotes', () => {
    it('debería obtener múltiples quotes', async () => {
      httpClient.get
        .mockResolvedValueOnce({ c: 100.15 })
        .mockResolvedValueOnce({ c: 117.25 })

      const result = await service.getBatchQuotes(['AGG', 'VYM'])

      expect(result).toEqual({
        'AGG': { c: 100.15 },
        'VYM': { c: 117.25 }
      })
    })

    it('debería manejar errores parciales', async () => {
      httpClient.get
        .mockResolvedValueOnce({ c: 100.15 })
        .mockRejectedValueOnce(new Error('API Error'))

      const result = await service.getBatchQuotes(['AGG', 'VYM'])

      expect(result.AGG).toBeTruthy()
      expect(result.VYM).toBeNull()
    })
  })
})
```

---

## 8. Index de Exportaciones

```javascript
// src/services/index.js
export { default as finnhubService } from './api/finnhubService'
export { default as alphaVantageService } from './api/alphaVantageService'
export { default as marketDataService } from './api/marketDataService'

export { default as httpClient } from './utils/httpClient'
export { default as RateLimiter } from './utils/rateLimiter'
export { default as CacheManager } from './utils/cacheManager'
```

---

## 9. Resumen de Decisiones

| Decisión                     | Opción elegida           | Confianza | Razón                                |
|------------------------------|--------------------------|-----------|--------------------------------------|
| **HTTP Client**              | Custom wrapper sobre fetch | 🟢 ALTA | Control total, retry automático     |
| **Rate Limiting**            | Token bucket algorithm   | 🟢 ALTA   | Estándar de industria, eficiente     |
| **Cache Strategy**           | Multi-backend (mem+LS)   | 🟢 ALTA   | Balance performance/persistencia     |
| **Error Handling**           | Custom error classes     | 🟢 ALTA   | Debugging mejorado, type-safe        |
| **Singleton Pattern**        | Sí para servicios        | 🟢 ALTA   | Estado compartido, fácil testing     |
| **Cache TTL Finnhub**        | 1 minuto                 | 🟡 MEDIA  | Balance frescura/requests            |
| **Cache TTL AlphaVantage**   | 7 días                   | 🟢 ALTA   | Datos históricos no cambian          |

---

## 10. Próximos Pasos

1. ✅ **Documentación completada** (2025-01-30)
2. ⏳ **Implementar archivos de servicios** en `/src/services`
3. ⏳ **Testing unitario** de cada servicio
4. ⏳ **Integración con Pinia stores**
5. ⏳ **Component specs** (archivos 13-21)

---

**Última actualización:** 2025-01-30  
**Estado:** ✅ DOCUMENTACIÓN COMPLETA  
**Siguiente:** Component specs (archivos 13-21)