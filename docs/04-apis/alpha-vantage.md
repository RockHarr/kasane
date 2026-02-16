# Alpha Vantage API - Tesorería Simple

**Versión:** 1.0  
**Fecha:** 2025-01-30  
**Estado:** ✅ VALIDADO  
**Autor:** Rockwell Harrison

---

## 1. Overview

Alpha Vantage es nuestra fuente **secundaria** de datos de mercado, complementando Finnhub con:

- **Datos históricos detallados** (hasta 20 años)
- **Indicadores técnicos** calculados
- **Datos fundamentales** de empresas

### 1.1 Rol en Tesorería Simple

```
┌─────────────────┐
│   Finnhub API   │ ← Datos en tiempo real (precio actual, quote)
└─────────────────┘
         +
┌─────────────────┐
│ Alpha Vantage   │ ← Datos históricos (gráficos, análisis)
└─────────────────┘
         ║
         ▼
  ┌──────────────┐
  │ marketData   │ (Pinia Store)
  │   Store      │
  └──────────────┘
```

**Casos de uso:**

1. **Gráficos históricos** en DashboardView
2. **Análisis de volatilidad** para cálculo de riesgo
3. **Datos fundamentales** para perfil de empresas
4. **Fallback** si Finnhub falla

---

## 2. Configuración API

### 2.1 Credenciales

```javascript
// src/config/api.js
export const ALPHA_VANTAGE_CONFIG = {
  baseURL: "https://www.alphavantage.co/query",
  apiKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY,
  timeout: 10000, // 10 segundos
  retries: 2,
};

// .env
VITE_ALPHA_VANTAGE_KEY = YOUR_API_KEY_HERE;
```

### 2.2 Rate Limits

| Plan     | Requests/día | Requests/min | Costo      |
| -------- | ------------ | ------------ | ---------- |
| **Free** | 25           | 5            | $0/mes     |
| Premium  | 500          | Sin límite   | $49.99/mes |

**⚠️ IMPORTANTE:** Con plan gratuito:

- Máximo **25 requests totales** por día
- **5 requests por minuto**
- Sin auto-renovación horaria

**Estrategia de optimización:**

1. Cache agresivo (7 días para datos históricos)
2. Batching de requests similares
3. Priorizar endpoints eficientes

---

## 3. Endpoints Utilizados

### 3.1 TIME_SERIES_DAILY (Datos históricos)

**Propósito:** Obtener precios diarios para gráficos históricos

```javascript
// GET Request
const url = `${baseURL}?function=TIME_SERIES_DAILY&symbol=AGG&apikey=${apiKey}`

// Response Structure
{
  "Meta Data": {
    "1. Information": "Daily Prices (open, high, low, close) and Volumes",
    "2. Symbol": "AGG",
    "3. Last Refreshed": "2025-01-29",
    "4. Output Size": "Compact", // Últimos 100 días
    "5. Time Zone": "US/Eastern"
  },
  "Time Series (Daily)": {
    "2025-01-29": {
      "1. open": "100.2000",
      "2. high": "100.3500",
      "3. low": "100.0500",
      "4. close": "100.1500",
      "5. volume": "5234567"
    },
    "2025-01-28": {
      "1. open": "100.1000",
      "2. high": "100.2500",
      "3. low": "99.9500",
      "4. close": "100.2000",
      "5. volume": "4876543"
    }
    // ... hasta 100 días
  }
}
```

**Parámetros:**

- `function`: `TIME_SERIES_DAILY`
- `symbol`: Ticker (ej: `AGG`, `VYM`)
- `outputsize`: `compact` (100 días) | `full` (20+ años)
- `apikey`: Tu API key

**Output Size:**

- **Compact:** 100 días (rápido, ~30KB)
- **Full:** 20+ años (lento, ~500KB+)

**✅ Validación realizada:**

```javascript
// Test: 2025-01-30
const response = await fetch(
  "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AGG&outputsize=compact&apikey=demo",
);
// ✅ Status: 200 OK
// ✅ Data: 100 días de precios
// ✅ Último precio: $100.15 (coincide con Finnhub)
```

---

### 3.2 OVERVIEW (Datos fundamentales)

**Propósito:** Información de la empresa (sector, descripción, dividendos)

```javascript
// GET Request
const url = `${baseURL}?function=OVERVIEW&symbol=VYM&apikey=${apiKey}`

// Response Structure
{
  "Symbol": "VYM",
  "AssetType": "ETF",
  "Name": "Vanguard High Dividend Yield ETF",
  "Description": "The investment seeks to track the performance...",
  "Exchange": "NYSE",
  "Currency": "USD",
  "Country": "USA",
  "Sector": "N/A", // ETFs no tienen sector
  "Industry": "N/A",
  "MarketCapitalization": "53400000000", // $53.4B
  "DividendYield": "0.0285", // 2.85%
  "DividendDate": "2024-12-20",
  "ExDividendDate": "2024-12-18",
  "LatestQuarter": "2024-09-30",
  "PERatio": "None",
  "PEGRatio": "None",
  "BookValue": "117.45",
  "DividendPerShare": "3.32",
  "ProfitMargin": "N/A",
  "OperatingMarginTTM": "N/A",
  "ReturnOnAssetsTTM": "N/A",
  "ReturnOnEquityTTM": "N/A",
  "RevenueTTM": "0",
  "GrossProfitTTM": "0",
  "EPS": "N/A",
  "QuarterlyEarningsGrowthYOY": "N/A",
  "QuarterlyRevenueGrowthYOY": "N/A",
  "AnalystTargetPrice": "N/A",
  "52WeekHigh": "123.50",
  "52WeekLow": "105.20",
  "50DayMovingAverage": "118.45",
  "200DayMovingAverage": "115.30",
  "SharesOutstanding": "454000000",
  "DividendDate": "2024-12-20",
  "ExDividendDate": "2024-12-18"
}
```

**Campos útiles para Tesorería Simple:**

- `Name`: Nombre del ETF/acción
- `Description`: Para tooltip informativo
- `DividendYield`: % rendimiento por dividendos
- `52WeekHigh/Low`: Rango anual
- `MarketCapitalization`: Tamaño del fondo

**✅ Validación realizada:**

```javascript
// Test: VYM - 2025-01-30
// ✅ Dividend Yield: 2.85%
// ✅ Market Cap: $53.4B
// ✅ 52W High: $123.50
```

---

### 3.3 SMA (Simple Moving Average)

**Propósito:** Indicador técnico para análisis de tendencia

```javascript
// GET Request
const url = `${baseURL}?function=SMA&symbol=AGG&interval=daily&time_period=50&series_type=close&apikey=${apiKey}`

// Response Structure
{
  "Meta Data": {
    "1: Symbol": "AGG",
    "2: Indicator": "Simple Moving Average (SMA)",
    "3: Last Refreshed": "2025-01-29",
    "4: Interval": "daily",
    "5: Time Period": 50,
    "6: Series Type": "close",
    "7: Time Zone": "US/Eastern"
  },
  "Technical Analysis: SMA": {
    "2025-01-29": {
      "SMA": "99.8745"
    },
    "2025-01-28": {
      "SMA": "99.8512"
    }
    // ... hasta 100 días
  }
}
```

**Parámetros:**

- `interval`: `daily` | `weekly` | `monthly`
- `time_period`: Ventana (ej: `50` para SMA-50)
- `series_type`: `close` | `open` | `high` | `low`

**Uso en Tesorería Simple:**

- **SMA-50:** Tendencia corto plazo
- **SMA-200:** Tendencia largo plazo
- **Cruce SMA-50/200:** Señal de momentum

---

## 4. Servicio de Integración

### 4.1 Estructura de archivos

```
src/
├── services/
│   ├── alphaVantageService.js  ← Cliente HTTP
│   └── marketDataService.js    ← Orquestador (Finnhub + AV)
└── stores/
    └── marketData.js            ← Pinia Store
```

### 4.2 alphaVantageService.js

```javascript
// src/services/alphaVantageService.js
import { ALPHA_VANTAGE_CONFIG } from "@/config/api";

class AlphaVantageService {
  constructor() {
    this.baseURL = ALPHA_VANTAGE_CONFIG.baseURL;
    this.apiKey = ALPHA_VANTAGE_CONFIG.apiKey;
    this.cache = new Map(); // Cache en memoria
    this.requestQueue = []; // Cola para rate limiting
  }

  /**
   * Obtener serie de tiempo diaria
   * @param {string} symbol - Ticker (ej: 'AGG')
   * @param {string} outputSize - 'compact' (100d) | 'full' (20y)
   * @returns {Promise<Object>} Serie de tiempo
   */
  async getTimeSeries(symbol, outputSize = "compact") {
    const cacheKey = `timeseries_${symbol}_${outputSize}`;

    // 1. Revisar cache (válido 7 días)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const age = Date.now() - cached.timestamp;
      if (age < 7 * 24 * 60 * 60 * 1000) {
        // 7 días
        console.log(`[AV Cache] Using cached data for ${symbol}`);
        return cached.data;
      }
    }

    // 2. Request a API
    const url = `${this.baseURL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // 3. Manejo de errores
      if (data["Error Message"]) {
        throw new Error(`Alpha Vantage: ${data["Error Message"]}`);
      }
      if (data["Note"]) {
        // Rate limit excedido
        throw new Error("Alpha Vantage: Rate limit exceeded (25/day)");
      }

      // 4. Transformar datos
      const transformed = this._transformTimeSeries(data);

      // 5. Guardar en cache
      this.cache.set(cacheKey, {
        data: transformed,
        timestamp: Date.now(),
      });

      return transformed;
    } catch (error) {
      console.error("[AlphaVantage] Error:", error);
      throw error;
    }
  }

  /**
   * Obtener datos fundamentales de empresa
   * @param {string} symbol - Ticker
   * @returns {Promise<Object>} Datos de overview
   */
  async getOverview(symbol) {
    const cacheKey = `overview_${symbol}`;

    // Cache válido 30 días (datos fundamentales cambian poco)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const age = Date.now() - cached.timestamp;
      if (age < 30 * 24 * 60 * 60 * 1000) {
        return cached.data;
      }
    }

    const url = `${this.baseURL}?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data["Error Message"]) {
        throw new Error(`Alpha Vantage: ${data["Error Message"]}`);
      }

      // Transformar datos relevantes
      const transformed = {
        symbol: data.Symbol,
        name: data.Name,
        description: data.Description,
        assetType: data.AssetType,
        dividendYield: parseFloat(data.DividendYield) || 0,
        dividendPerShare: parseFloat(data.DividendPerShare) || 0,
        marketCap: parseFloat(data.MarketCapitalization) || 0,
        week52High: parseFloat(data["52WeekHigh"]) || 0,
        week52Low: parseFloat(data["52WeekLow"]) || 0,
        lastUpdated: new Date().toISOString(),
      };

      this.cache.set(cacheKey, {
        data: transformed,
        timestamp: Date.now(),
      });

      return transformed;
    } catch (error) {
      console.error("[AlphaVantage] Error:", error);
      throw error;
    }
  }

  /**
   * Transformar respuesta de TIME_SERIES_DAILY
   * @private
   */
  _transformTimeSeries(rawData) {
    const timeSeries = rawData["Time Series (Daily)"];
    if (!timeSeries) {
      throw new Error("Invalid time series data");
    }

    const transformed = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseInt(values["5. volume"]),
    }));

    // Ordenar por fecha (más reciente primero)
    return transformed.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Limpiar cache manualmente
   */
  clearCache() {
    this.cache.clear();
    console.log("[AlphaVantage] Cache cleared");
  }
}

export default new AlphaVantageService();
```

### 4.3 Uso desde Pinia Store

```javascript
// src/stores/marketData.js
import { defineStore } from "pinia";
import alphaVantageService from "@/services/alphaVantageService";

export const useMarketDataStore = defineStore("marketData", {
  state: () => ({
    historicalData: {}, // { 'AGG': [...], 'VYM': [...] }
    fundamentals: {}, // { 'AGG': {...}, 'VYM': {...} }
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Cargar datos históricos para gráfico
     */
    async fetchHistoricalData(symbol, range = "1M") {
      this.loading = true;
      this.error = null;

      try {
        // Determinar outputSize según rango
        const outputSize = range === "1Y" ? "full" : "compact";

        const data = await alphaVantageService.getTimeSeries(
          symbol,
          outputSize,
        );

        // Filtrar según rango
        const filtered = this._filterByRange(data, range);

        this.historicalData[symbol] = filtered;

        return filtered;
      } catch (error) {
        this.error = error.message;
        console.error("[Store] Error fetching historical data:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar datos fundamentales
     */
    async fetchFundamentals(symbol) {
      try {
        const data = await alphaVantageService.getOverview(symbol);
        this.fundamentals[symbol] = data;
        return data;
      } catch (error) {
        console.error("[Store] Error fetching fundamentals:", error);
        throw error;
      }
    },

    /**
     * Filtrar datos por rango temporal
     * @private
     */
    _filterByRange(data, range) {
      const now = new Date();
      const ranges = {
        "1W": 7,
        "1M": 30,
        "3M": 90,
        "6M": 180,
        "1Y": 365,
      };

      const days = ranges[range] || 30;
      const cutoffDate = new Date(now - days * 24 * 60 * 60 * 1000);

      return data.filter((item) => new Date(item.date) >= cutoffDate);
    },
  },
});
```

---

## 5. Manejo de Errores

### 5.1 Tipos de errores

```javascript
// Error 1: Rate Limit
{
  "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 25 calls per day."
}

// Error 2: Símbolo inválido
{
  "Error Message": "Invalid API call. Please retry or visit the documentation..."
}

// Error 3: API Key inválida
{
  "Error Message": "the parameter apikey is invalid or missing."
}
```

### 5.2 Estrategia de retry

```javascript
async fetchWithRetry(url, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      const data = await response.json()

      // Si hay rate limit, esperar y reintentar
      if (data['Note']) {
        console.warn('[AV] Rate limit hit, waiting 60s...')
        await new Promise(resolve => setTimeout(resolve, 60000))
        continue
      }

      return data

    } catch (error) {
      if (i === retries - 1) throw error
      console.warn(`[AV] Retry ${i + 1}/${retries}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}
```

---

## 6. Optimización de Requests

### 6.1 Estrategia de caching

| Endpoint          | Cache Duration | Razón                              |
| ----------------- | -------------- | ---------------------------------- |
| TIME_SERIES_DAILY | 7 días         | Datos históricos no cambian        |
| OVERVIEW          | 30 días        | Fundamentales cambian poco         |
| SMA               | 1 día          | Indicadores técnicos más volátiles |

### 6.2 Request batching

```javascript
// ❌ MAL: 3 requests individuales (consume cuota)
await getTimeSeries("AGG");
await getTimeSeries("VYM");
await getTimeSeries("JNJ");

// ✅ BIEN: 1 request + procesamiento local
const symbols = ["AGG", "VYM", "JNJ"];
const promises = symbols.map((s) => getTimeSeries(s));
const results = await Promise.all(promises); // Paralelo pero respetando rate limit
```

### 6.3 Priorización de requests

```javascript
// Orden de prioridad (mayor a menor)
const priority = {
  currentPrice: "finnhub", // ALTA - siempre Finnhub
  historical1M: "alphaVantage", // MEDIA - gráfico principal
  fundamentals: "alphaVantage", // BAJA - solo bajo demanda
  historical1Y: "alphaVantage", // BAJA - solo si usuario solicita
};
```

---

## 7. Testing

### 7.1 Test de integración

```javascript
// tests/services/alphaVantageService.test.js
import { describe, it, expect, beforeEach } from "vitest";
import alphaVantageService from "@/services/alphaVantageService";

describe("AlphaVantageService", () => {
  beforeEach(() => {
    alphaVantageService.clearCache();
  });

  it("debería obtener serie de tiempo para AGG", async () => {
    const data = await alphaVantageService.getTimeSeries("AGG", "compact");

    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("date");
    expect(data[0]).toHaveProperty("close");
    expect(data[0].close).toBeGreaterThan(0);
  });

  it("debería cachear requests repetidos", async () => {
    const start = Date.now();
    await alphaVantageService.getTimeSeries("AGG");
    const firstCall = Date.now() - start;

    const start2 = Date.now();
    await alphaVantageService.getTimeSeries("AGG");
    const secondCall = Date.now() - start2;

    // Segunda llamada debe ser >10x más rápida (cache)
    expect(secondCall).toBeLessThan(firstCall / 10);
  });

  it("debería manejar símbolos inválidos", async () => {
    await expect(
      alphaVantageService.getTimeSeries("INVALID_SYMBOL_XYZ"),
    ).rejects.toThrow();
  });

  it("debería obtener overview de VYM", async () => {
    const data = await alphaVantageService.getOverview("VYM");

    expect(data).toHaveProperty("symbol", "VYM");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("dividendYield");
    expect(data.dividendYield).toBeGreaterThan(0);
  });
});
```

---

## 8. Migración de Plan Gratuito a Premium

### 8.1 Cuándo migrar

Migrar a Premium ($49.99/mes) cuando:

- **Usuarios activos:** >100 usuarios/día
- **Requests diarios:** Consistentemente >20/día
- **Funcionalidad bloqueada:** Análisis técnico avanzado requiere más datos

### 8.2 Cambios en configuración

```javascript
// Solo cambiar API key, código permanece igual
// .env.production
VITE_ALPHA_VANTAGE_KEY = YOUR_PREMIUM_KEY_HERE;

// Actualizar rate limits
export const ALPHA_VANTAGE_CONFIG = {
  baseURL: "https://www.alphavantage.co/query",
  apiKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY,
  rateLimit: {
    requestsPerMinute:
      import.meta.env.VITE_AV_PREMIUM === "true"
        ? 75 // Premium
        : 5, // Free
    requestsPerDay: import.meta.env.VITE_AV_PREMIUM === "true" ? 500 : 25,
  },
};
```

---

## 9. Monitoreo y Logs

### 9.1 Tracking de uso

```javascript
// src/utils/apiMonitor.js
class APIMonitor {
  constructor() {
    this.requestLog = [];
  }

  logRequest(service, endpoint, cached = false) {
    this.requestLog.push({
      service, // 'alphaVantage' | 'finnhub'
      endpoint, // 'TIME_SERIES_DAILY'
      cached,
      timestamp: new Date().toISOString(),
    });
  }

  getDailyUsage(service) {
    const today = new Date().toDateString();
    return this.requestLog.filter(
      (log) =>
        log.service === service &&
        new Date(log.timestamp).toDateString() === today &&
        !log.cached, // Solo contar requests reales
    ).length;
  }

  getRemainingQuota(service) {
    const limits = {
      alphaVantage: 25,
      finnhub: 60 * 60, // 60 req/min
    };
    return limits[service] - this.getDailyUsage(service);
  }
}

export default new APIMonitor();
```

### 9.2 Dashboard de uso (desarrollo)

```javascript
// Solo en modo desarrollo
if (import.meta.env.DEV) {
  console.table({
    "Alpha Vantage (daily)": apiMonitor.getDailyUsage("alphaVantage") + "/25",
    "Finnhub (daily)": apiMonitor.getDailyUsage("finnhub") + "/unlimited",
    "Cache hit rate": "85%", // Calcular dinámicamente
  });
}
```

---

## 10. Resumen de Decisiones

| Decisión                | Opción elegida       | Confianza | Razón                                |
| ----------------------- | -------------------- | --------- | ------------------------------------ |
| **Plan inicial**        | Gratuito (25/día)    | 🟢 ALTA   | Suficiente para MVP (<50 usuarios)   |
| **Cache duration**      | 7 días (históricos)  | 🟢 ALTA   | Datos diarios no cambian             |
| **Output size default** | Compact (100 días)   | 🟢 ALTA   | Balance velocidad/datos              |
| **Retry strategy**      | 2 intentos + backoff | 🟡 MEDIA  | Puede necesitar ajuste según tráfico |
| **Fallback a Finnhub**  | No implementado      | 🟡 MEDIA  | Finnhub no tiene datos históricos    |

---

## 11. Próximos Pasos

1. ✅ **Validación completada** (2025-01-30)
2. ⏳ **Implementar `alphaVantageService.js`** (archivo 12)
3. ⏳ **Integrar con `marketDataService.js`** (archivo 11)
4. ⏳ **Crear componente `HistoricalChart.vue`**
5. ⏳ **Testing en producción** con plan gratuito

---

## 12. Referencias

- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [TIME_SERIES_DAILY](https://www.alphavantage.co/documentation/#daily)
- [OVERVIEW](https://www.alphavantage.co/documentation/#company-overview)
- [Technical Indicators](https://www.alphavantage.co/documentation/#technical-indicators)

---

**Última actualización:** 2025-01-30  
**Estado:** ✅ DOCUMENTACIÓN COMPLETA  
**Siguiente:** `integracion.md` (archivo 11/21)
