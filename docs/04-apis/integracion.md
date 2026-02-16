# Integración de APIs - Tesorería Simple

**Versión:** 1.0  
**Fecha:** 2025-01-30  
**Estado:** 📐 DISEÑO  
**Autor:** Rockwell Harrison

---

## 1. Overview

Este documento define la **orquestación** entre Finnhub y Alpha Vantage para crear una capa unificada de datos de mercado.

### 1.1 Arquitectura de Integración

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTES VUE                          │
│  (DashboardView, SimulatorView, StockCard, etc.)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   marketData Store    │ ← Pinia Store (estado global)
         │     (Pinia)           │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ marketDataService.js  │ ← ORQUESTADOR (esta capa)
         └───────────┬───────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ finnhubService   │  │ alphaVantage     │
│                  │  │   Service        │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
   ┌─────────┐           ┌─────────┐
   │ Finnhub │           │  Alpha  │
   │   API   │           │ Vantage │
   └─────────┘           └─────────┘
```

**Responsabilidades por capa:**

| Capa                    | Responsabilidad                               |
| ----------------------- | --------------------------------------------- |
| **Componentes**         | UI, interacción usuario, formato visual       |
| **Pinia Store**         | Estado reactivo, cache en memoria, getters    |
| **marketDataService**   | Orquestación, decisiones de fuente, fallbacks |
| **finnhubService**      | Cliente HTTP Finnhub, rate limiting           |
| **alphaVantageService** | Cliente HTTP Alpha Vantage, cache persistente |

---

## 2. Estrategia de Fuentes de Datos

### 2.1 Matriz de Responsabilidades

| Tipo de dato             | Fuente primaria | Fuente secundaria | Razón                          |
| ------------------------ | --------------- | ----------------- | ------------------------------ |
| **Precio actual**        | Finnhub         | -                 | Tiempo real, sin límite diario |
| **Quote (OHLC hoy)**     | Finnhub         | -                 | Actualización minuto a minuto  |
| **Histórico 1W-1M**      | Alpha Vantage   | -                 | Cache 7 días, suficiente       |
| **Histórico 3M-1Y**      | Alpha Vantage   | -                 | Datos compactos (100 días)     |
| **Fundamentales**        | Alpha Vantage   | -                 | Dividend yield, market cap     |
| **Indicadores técnicos** | Alpha Vantage   | -                 | SMA, RSI (futuro)              |

### 2.2 Flujo de Decisión

```javascript
// Pseudocódigo de orquestación
function getMarketData(symbol, dataType) {
  switch (dataType) {
    case "currentPrice":
      return finnhubService.getQuote(symbol);

    case "historical":
      return alphaVantageService.getTimeSeries(symbol);

    case "fundamentals":
      return alphaVantageService.getOverview(symbol);

    case "complete": // Datos completos para dashboard
      return Promise.all([
        finnhubService.getQuote(symbol), // Precio actual
        alphaVantageService.getTimeSeries(symbol), // Histórico
        alphaVantageService.getOverview(symbol), // Fundamentales
      ]);
  }
}
```

---

## 3. marketDataService.js (Orquestador)

### 3.1 Estructura del servicio

```javascript
// src/services/marketDataService.js
import finnhubService from "./finnhubService";
import alphaVantageService from "./alphaVantageService";

/**
 * Servicio orquestador que combina Finnhub y Alpha Vantage
 * para proveer una interfaz unificada de datos de mercado
 */
class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map(); // Evitar requests duplicados
  }

  /**
   * Obtener datos completos de un símbolo
   * Combina precio actual (Finnhub) + histórico (Alpha Vantage)
   *
   * @param {string} symbol - Ticker (ej: 'AGG')
   * @param {Object} options - Opciones de consulta
   * @param {boolean} options.includeHistorical - Incluir datos históricos
   * @param {boolean} options.includeFundamentals - Incluir fundamentales
   * @param {string} options.historicalRange - Rango temporal ('1W', '1M', '3M', '6M', '1Y')
   * @returns {Promise<Object>} Datos combinados
   */
  async getCompleteData(symbol, options = {}) {
    const {
      includeHistorical = true,
      includeFundamentals = false,
      historicalRange = "1M",
    } = options;

    const cacheKey = `complete_${symbol}_${historicalRange}_${includeHistorical}_${includeFundamentals}`;

    // 1. Revisar cache (válido 5 minutos para datos "completos")
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const age = Date.now() - cached.timestamp;
      if (age < 5 * 60 * 1000) {
        // 5 minutos
        console.log(`[MarketData] Using cached complete data for ${symbol}`);
        return cached.data;
      }
    }

    // 2. Evitar requests duplicados simultáneos
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`[MarketData] Waiting for pending request: ${symbol}`);
      return this.pendingRequests.get(cacheKey);
    }

    // 3. Crear request
    const requestPromise = this._fetchCompleteData(symbol, options);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;

      // 4. Guardar en cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Fetch interno de datos completos
   * @private
   */
  async _fetchCompleteData(symbol, options) {
    const { includeHistorical, includeFundamentals, historicalRange } = options;

    try {
      // Construir array de promises según opciones
      const promises = {
        currentPrice: finnhubService.getQuote(symbol),
      };

      if (includeHistorical) {
        promises.historical = alphaVantageService.getTimeSeries(
          symbol,
          historicalRange === "1Y" ? "full" : "compact",
        );
      }

      if (includeFundamentals) {
        promises.fundamentals = alphaVantageService.getOverview(symbol);
      }

      // Ejecutar todas las promises en paralelo
      const results = await Promise.all(
        Object.entries(promises).map(async ([key, promise]) => {
          try {
            const data = await promise;
            return [key, { data, error: null }];
          } catch (error) {
            console.error(
              `[MarketData] Error fetching ${key} for ${symbol}:`,
              error,
            );
            return [key, { data: null, error: error.message }];
          }
        }),
      );

      // Convertir array a objeto
      const combined = Object.fromEntries(results);

      // 5. Transformar a estructura unificada
      return this._transformToUnifiedFormat(symbol, combined, historicalRange);
    } catch (error) {
      console.error(`[MarketData] Error in _fetchCompleteData:`, error);
      throw error;
    }
  }

  /**
   * Transformar respuestas de múltiples APIs a formato unificado
   * @private
   */
  _transformToUnifiedFormat(symbol, rawData, historicalRange) {
    const { currentPrice, historical, fundamentals } = rawData;

    // Estructura base
    const unified = {
      symbol,
      timestamp: new Date().toISOString(),
      status: "success",
      sources: {
        currentPrice: currentPrice.error ? "failed" : "finnhub",
        historical: historical?.error ? "failed" : "alphaVantage",
        fundamentals: fundamentals?.error ? "failed" : "alphaVantage",
      },
    };

    // 1. Precio actual (Finnhub)
    if (currentPrice.data && !currentPrice.error) {
      unified.current = {
        price: currentPrice.data.c,
        change: currentPrice.data.d,
        changePercent: currentPrice.data.dp,
        high: currentPrice.data.h,
        low: currentPrice.data.l,
        open: currentPrice.data.o,
        previousClose: currentPrice.data.pc,
        lastUpdated: new Date(currentPrice.data.t * 1000).toISOString(),
      };
    } else {
      unified.current = null;
      unified.errors = unified.errors || [];
      unified.errors.push({
        field: "currentPrice",
        message: currentPrice.error,
      });
    }

    // 2. Datos históricos (Alpha Vantage)
    if (historical?.data && !historical.error) {
      // Filtrar por rango
      const filtered = this._filterHistoricalByRange(
        historical.data,
        historicalRange,
      );

      unified.historical = {
        range: historicalRange,
        dataPoints: filtered.length,
        data: filtered,
        statistics: this._calculateStatistics(filtered),
      };
    } else if (historical) {
      unified.historical = null;
      unified.errors = unified.errors || [];
      unified.errors.push({ field: "historical", message: historical.error });
    }

    // 3. Fundamentales (Alpha Vantage)
    if (fundamentals?.data && !fundamentals.error) {
      unified.fundamentals = {
        name: fundamentals.data.name,
        description: fundamentals.data.description,
        assetType: fundamentals.data.assetType,
        dividendYield: fundamentals.data.dividendYield,
        dividendPerShare: fundamentals.data.dividendPerShare,
        marketCap: fundamentals.data.marketCap,
        week52High: fundamentals.data.week52High,
        week52Low: fundamentals.data.week52Low,
      };
    } else if (fundamentals) {
      unified.fundamentals = null;
      unified.errors = unified.errors || [];
      unified.errors.push({
        field: "fundamentals",
        message: fundamentals.error,
      });
    }

    return unified;
  }

  /**
   * Filtrar datos históricos por rango temporal
   * @private
   */
  _filterHistoricalByRange(data, range) {
    const now = new Date();
    const ranges = {
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
    };

    const days = ranges[range] || 30;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return data.filter((item) => new Date(item.date) >= cutoffDate);
  }

  /**
   * Calcular estadísticas sobre datos históricos
   * @private
   */
  _calculateStatistics(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const closes = data.map((d) => d.close);
    const volumes = data.map((d) => d.volume);

    const max = Math.max(...closes);
    const min = Math.min(...closes);
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    // Calcular volatilidad (desviación estándar)
    const variance =
      closes.reduce((sum, price) => {
        return sum + Math.pow(price - avg, 2);
      }, 0) / closes.length;
    const volatility = Math.sqrt(variance);

    // Calcular rendimiento total del período
    const firstPrice = data[data.length - 1].close; // Más antiguo
    const lastPrice = data[0].close; // Más reciente
    const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      high: max,
      low: min,
      average: avg,
      volatility: volatility,
      volatilityPercent: (volatility / avg) * 100,
      totalReturn: totalReturn,
      averageVolume: Math.round(avgVolume),
    };
  }

  /**
   * Obtener solo precio actual (rápido)
   * @param {string} symbol - Ticker
   * @returns {Promise<number>} Precio actual
   */
  async getCurrentPrice(symbol) {
    try {
      const quote = await finnhubService.getQuote(symbol);
      return quote.c; // current price
    } catch (error) {
      console.error(
        `[MarketData] Error getting current price for ${symbol}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtener precios actuales para múltiples símbolos (batch)
   * @param {string[]} symbols - Array de tickers
   * @returns {Promise<Object>} { 'AGG': 100.15, 'VYM': 117.25, ... }
   */
  async getBatchCurrentPrices(symbols) {
    try {
      // Finnhub permite requests paralelos (60/min)
      const promises = symbols.map(async (symbol) => {
        try {
          const price = await this.getCurrentPrice(symbol);
          return [symbol, price];
        } catch (error) {
          console.error(`[MarketData] Failed to get price for ${symbol}`);
          return [symbol, null];
        }
      });

      const results = await Promise.all(promises);
      return Object.fromEntries(results);
    } catch (error) {
      console.error("[MarketData] Error in batch price fetch:", error);
      throw error;
    }
  }

  /**
   * Obtener datos históricos optimizados para gráficos
   * @param {string} symbol - Ticker
   * @param {string} range - Rango temporal
   * @returns {Promise<Array>} Datos para ApexCharts
   */
  async getChartData(symbol, range = "1M") {
    try {
      const complete = await this.getCompleteData(symbol, {
        includeHistorical: true,
        includeFundamentals: false,
        historicalRange: range,
      });

      if (!complete.historical) {
        throw new Error("No historical data available");
      }

      // Transformar a formato ApexCharts
      return complete.historical.data
        .map((point) => ({
          x: new Date(point.date).getTime(), // Timestamp en ms
          y: [point.open, point.high, point.low, point.close],
        }))
        .reverse(); // ApexCharts espera orden cronológico
    } catch (error) {
      console.error(
        `[MarketData] Error getting chart data for ${symbol}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Validar que un símbolo existe y tiene datos
   * @param {string} symbol - Ticker
   * @returns {Promise<boolean>} true si es válido
   */
  async validateSymbol(symbol) {
    try {
      const quote = await finnhubService.getQuote(symbol);
      // Si el precio es 0, probablemente el símbolo no existe
      return quote.c > 0;
    } catch (error) {
      console.error(
        `[MarketData] Symbol validation failed for ${symbol}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Limpiar cache manualmente
   */
  clearCache() {
    this.cache.clear();
    finnhubService.clearCache?.();
    alphaVantageService.clearCache?.();
    console.log("[MarketData] All caches cleared");
  }

  /**
   * Obtener estadísticas de uso de cache
   */
  getCacheStats() {
    return {
      marketData: this.cache.size,
      finnhub: finnhubService.cache?.size || 0,
      alphaVantage: alphaVantageService.cache?.size || 0,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

export default new MarketDataService();
```

---

## 4. Integración con Pinia Store

### 4.1 marketData.js Store

```javascript
// src/stores/marketData.js
import { defineStore } from "pinia";
import marketDataService from "@/services/marketDataService";

export const useMarketDataStore = defineStore("marketData", {
  state: () => ({
    // Datos por símbolo
    symbols: {}, // { 'AGG': { current: {...}, historical: {...}, fundamentals: {...} } }

    // Estado de carga
    loading: {
      global: false,
      bySymbol: {}, // { 'AGG': true, 'VYM': false }
    },

    // Errores
    errors: {
      global: null,
      bySymbol: {}, // { 'AGG': 'Error message' }
    },

    // Configuración
    settings: {
      defaultHistoricalRange: "1M",
      autoRefreshInterval: 60000, // 1 minuto
      autoRefreshEnabled: false,
    },

    // Última actualización
    lastUpdate: null,
  }),

  getters: {
    /**
     * Obtener datos de un símbolo específico
     */
    getSymbolData: (state) => (symbol) => {
      return state.symbols[symbol] || null;
    },

    /**
     * Obtener precio actual de un símbolo
     */
    getCurrentPrice: (state) => (symbol) => {
      return state.symbols[symbol]?.current?.price || null;
    },

    /**
     * Verificar si un símbolo está cargando
     */
    isLoading: (state) => (symbol) => {
      return state.loading.bySymbol[symbol] || false;
    },

    /**
     * Obtener error de un símbolo
     */
    getError: (state) => (symbol) => {
      return state.errors.bySymbol[symbol] || null;
    },

    /**
     * Obtener todos los símbolos cargados
     */
    loadedSymbols: (state) => {
      return Object.keys(state.symbols);
    },

    /**
     * Verificar si hay datos para mostrar
     */
    hasData: (state) => {
      return Object.keys(state.symbols).length > 0;
    },
  },

  actions: {
    /**
     * Cargar datos completos de un símbolo
     */
    async fetchSymbol(symbol, options = {}) {
      // Marcar como cargando
      this.loading.bySymbol[symbol] = true;
      this.errors.bySymbol[symbol] = null;

      try {
        const data = await marketDataService.getCompleteData(symbol, {
          includeHistorical: options.includeHistorical ?? true,
          includeFundamentals: options.includeFundamentals ?? false,
          historicalRange:
            options.historicalRange ?? this.settings.defaultHistoricalRange,
        });

        // Guardar en estado
        this.symbols[symbol] = {
          current: data.current,
          historical: data.historical,
          fundamentals: data.fundamentals,
          timestamp: data.timestamp,
          sources: data.sources,
        };

        this.lastUpdate = new Date().toISOString();

        return data;
      } catch (error) {
        this.errors.bySymbol[symbol] = error.message;
        console.error(`[Store] Error fetching ${symbol}:`, error);
        throw error;
      } finally {
        this.loading.bySymbol[symbol] = false;
      }
    },

    /**
     * Cargar múltiples símbolos en paralelo
     */
    async fetchMultipleSymbols(symbols, options = {}) {
      this.loading.global = true;
      this.errors.global = null;

      try {
        const promises = symbols.map((symbol) =>
          this.fetchSymbol(symbol, options),
        );
        const results = await Promise.allSettled(promises);

        // Contar éxitos y fallos
        const succeeded = results.filter(
          (r) => r.status === "fulfilled",
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        console.log(
          `[Store] Loaded ${succeeded}/${symbols.length} symbols (${failed} failed)`,
        );

        return results;
      } catch (error) {
        this.errors.global = error.message;
        console.error("[Store] Error in batch fetch:", error);
        throw error;
      } finally {
        this.loading.global = false;
      }
    },

    /**
     * Refrescar precio actual de un símbolo (ligero)
     */
    async refreshCurrentPrice(symbol) {
      try {
        const price = await marketDataService.getCurrentPrice(symbol);

        // Actualizar solo precio actual sin recargar todo
        if (this.symbols[symbol]) {
          this.symbols[symbol].current.price = price;
          this.symbols[symbol].current.lastUpdated = new Date().toISOString();
        }

        return price;
      } catch (error) {
        console.error(`[Store] Error refreshing price for ${symbol}:`, error);
        throw error;
      }
    },

    /**
     * Refrescar todos los símbolos cargados
     */
    async refreshAll() {
      const symbols = this.loadedSymbols;
      if (symbols.length === 0) return;

      console.log(`[Store] Refreshing ${symbols.length} symbols...`);
      await this.fetchMultipleSymbols(symbols);
    },

    /**
     * Habilitar auto-refresh
     */
    enableAutoRefresh() {
      if (this.settings.autoRefreshEnabled) return;

      this.settings.autoRefreshEnabled = true;

      this._refreshInterval = setInterval(() => {
        console.log("[Store] Auto-refresh triggered");
        this.refreshAll();
      }, this.settings.autoRefreshInterval);
    },

    /**
     * Deshabilitar auto-refresh
     */
    disableAutoRefresh() {
      if (!this.settings.autoRefreshEnabled) return;

      this.settings.autoRefreshEnabled = false;

      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
      }
    },

    /**
     * Limpiar datos de un símbolo
     */
    clearSymbol(symbol) {
      delete this.symbols[symbol];
      delete this.loading.bySymbol[symbol];
      delete this.errors.bySymbol[symbol];
    },

    /**
     * Limpiar todos los datos
     */
    clearAll() {
      this.symbols = {};
      this.loading.bySymbol = {};
      this.errors.bySymbol = {};
      this.errors.global = null;
      this.lastUpdate = null;
      marketDataService.clearCache();
    },
  },
});
```

---

## 5. Uso en Componentes Vue

### 5.1 Ejemplo: DashboardView

```vue
<!-- src/views/DashboardView.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useMarketDataStore } from "@/stores/marketData";
import { usePortfolioStore } from "@/stores/portfolio";
import StockCard from "@/components/organisms/StockCard.vue";

const marketData = useMarketDataStore();
const portfolio = usePortfolioStore();

const selectedRange = ref("1M");

// Cargar datos iniciales
onMounted(async () => {
  const symbols = portfolio.getSelectedSymbols;

  if (symbols.length > 0) {
    await marketData.fetchMultipleSymbols(symbols, {
      includeHistorical: true,
      includeFundamentals: true,
      historicalRange: selectedRange.value,
    });

    // Habilitar auto-refresh
    marketData.enableAutoRefresh();
  }
});

// Limpiar al desmontar
onUnmounted(() => {
  marketData.disableAutoRefresh();
});

// Cambiar rango temporal
async function handleRangeChange(newRange) {
  selectedRange.value = newRange;

  const symbols = portfolio.getSelectedSymbols;
  await marketData.fetchMultipleSymbols(symbols, {
    includeHistorical: true,
    historicalRange: newRange,
  });
}
</script>

<template>
  <div class="dashboard">
    <!-- Header con controles -->
    <div class="controls">
      <button
        v-for="range in ['1W', '1M', '3M', '6M', '1Y']"
        :key="range"
        :class="{ active: selectedRange === range }"
        @click="handleRangeChange(range)"
      >
        {{ range }}
      </button>

      <button @click="marketData.refreshAll()">🔄 Refresh</button>
    </div>

    <!-- Grid de acciones -->
    <div class="stocks-grid">
      <StockCard
        v-for="symbol in portfolio.getSelectedSymbols"
        :key="symbol"
        :symbol="symbol"
        :data="marketData.getSymbolData(symbol)"
        :loading="marketData.isLoading(symbol)"
        :error="marketData.getError(symbol)"
      />
    </div>

    <!-- Estado global de carga -->
    <div v-if="marketData.loading.global" class="loading">
      Cargando datos...
    </div>
  </div>
</template>
```

### 5.2 Ejemplo: StockCard (organism)

```vue
<!-- src/components/organisms/StockCard.vue -->
<script setup>
import { computed } from "vue";
import PriceDisplay from "@/components/molecules/PriceDisplay.vue";
import MiniChart from "@/components/molecules/MiniChart.vue";

const props = defineProps({
  symbol: String,
  data: Object,
  loading: Boolean,
  error: String,
});

const priceChange = computed(() => {
  if (!props.data?.current) return null;
  return {
    value: props.data.current.change,
    percent: props.data.current.changePercent,
  };
});

const chartData = computed(() => {
  if (!props.data?.historical) return [];
  return props.data.historical.data.map((point) => ({
    date: point.date,
    value: point.close,
  }));
});
</script>

<template>
  <div class="stock-card">
    <!-- Loading state -->
    <div v-if="loading" class="loading-skeleton">Cargando {{ symbol }}...</div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">⚠️ {{ error }}</div>

    <!-- Data loaded -->
    <div v-else-if="data" class="card-content">
      <!-- Header -->
      <div class="card-header">
        <h3>{{ symbol }}</h3>
        <span class="asset-type">{{
          data.fundamentals?.assetType || "Stock"
        }}</span>
      </div>

      <!-- Precio actual -->
      <PriceDisplay
        :price="data.current.price"
        :change="priceChange.value"
        :changePercent="priceChange.percent"
      />

      <!-- Mini gráfico -->
      <MiniChart :data="chartData" />

      <!-- Estadísticas -->
      <div class="stats">
        <div class="stat">
          <span class="label">Volatilidad</span>
          <span class="value">
            {{ data.historical?.statistics?.volatilityPercent?.toFixed(2) }}%
          </span>
        </div>
        <div class="stat">
          <span class="label">Rendimiento</span>
          <span
            class="value"
            :class="{
              positive: data.historical?.statistics?.totalReturn > 0,
              negative: data.historical?.statistics?.totalReturn < 0,
            }"
          >
            {{ data.historical?.statistics?.totalReturn?.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">No hay datos disponibles</div>
  </div>
</template>

<style scoped>
.stock-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.positive {
  color: var(--color-success);
}
.negative {
  color: var(--color-error);
}
</style>
```

---

## 6. Manejo de Errores y Fallbacks

### 6.1 Jerarquía de fallbacks

```javascript
// En marketDataService.js

async _fetchWithFallback(primaryFn, fallbackFn, context) {
  try {
    // Intentar fuente primaria
    return await primaryFn()
  } catch (primaryError) {
    console.warn(`[MarketData] Primary source failed for ${context}:`, primaryError)

    if (fallbackFn) {
      try {
        console.log(`[MarketData] Trying fallback for ${context}`)
        return await fallbackFn()
      } catch (fallbackError) {
        console.error(`[MarketData] Fallback also failed for ${context}:`, fallbackError)
        throw new Error(`Both primary and fallback failed: ${primaryError.message}`)
      }
    }

    throw primaryError
  }
}

// Uso:
async getCurrentPriceWithFallback(symbol) {
  return this._fetchWithFallback(
    () => finnhubService.getQuote(symbol),
    // Fallback: usar último precio de Alpha Vantage
    async () => {
      const historical = await alphaVantageService.getTimeSeries(symbol, 'compact')
      return { c: historical[0].close }
    },
    `current price for ${symbol}`
  )
}
```

### 6.2 Degradación gradual

```javascript
// Si Alpha Vantage falla, mostrar solo precio actual
async getCompleteDataGraceful(symbol, options) {
  const results = {}

  // Precio actual (crítico)
  try {
    results.current = await finnhubService.getQuote(symbol)
  } catch (error) {
    console.error('[MarketData] Critical: Cannot get current price')
    throw new Error('Unable to fetch current price')
  }

  // Histórico (nice-to-have)
  try {
    if (options.includeHistorical) {
      results.historical = await alphaVantageService.getTimeSeries(symbol)
    }
  } catch (error) {
    console.warn('[MarketData] Historical data unavailable, continuing without it')
    results.historical = null
  }

  // Fundamentales (nice-to-have)
  try {
    if (options.includeFundamentals) {
      results.fundamentals = await alphaVantageService.getOverview(symbol)
    }
  } catch (error) {
    console.warn('[MarketData] Fundamentals unavailable, continuing without them')
    results.fundamentals = null
  }

  return results
}
```

---

## 7. Optimización de Rendimiento

### 7.1 Request deduplication

```javascript
// Evitar requests duplicados simultáneos
class RequestDeduplicator {
  constructor() {
    this.pending = new Map()
  }

  async deduplicate(key, requestFn) {
    // Si ya hay un request en curso, esperar su resultado
    if (this.pending.has(key)) {
      console.log(`[Dedup] Reusing pending request: ${key}`)
      return this.pending.get(key)
    }

    // Crear nuevo request
    const promise = requestFn()
    this.pending.set(key, promise)

    try {
      const result = await promise
      return result
    } finally {
      // Limpiar después de completar
      this.pending.delete(key)
    }
  }
}

const deduplicator = new RequestDeduplicator()

// Uso en marketDataService:
async getCompleteData(symbol, options) {
  const key = `complete_${symbol}_${JSON.stringify(options)}`
  return deduplicator.deduplicate(key, () => this._fetchCompleteData(symbol, options))
}
```

### 7.2 Lazy loading de fundamentales

```javascript
// No cargar fundamentales hasta que usuario los necesite
// Ejemplo: al hacer hover o clic en "Ver más"

// En componente:
const showDetails = ref(false);

async function loadDetails() {
  if (!marketData.getSymbolData(symbol).fundamentals) {
    await marketData.fetchSymbol(symbol, {
      includeHistorical: false,
      includeFundamentals: true,
    });
  }
  showDetails.value = true;
}
```

### 7.3 Prefetching inteligente

```javascript
// Precargar datos de símbolos visibles en viewport
import { useIntersectionObserver } from "@vueuse/core";

const stockCardRef = ref(null);
const { stop } = useIntersectionObserver(
  stockCardRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      // Card está visible, cargar datos
      marketData.fetchSymbol(symbol);
      stop(); // Dejar de observar después de cargar
    }
  },
);
```

---

## 8. Monitoreo y Debugging

### 8.1 Logger centralizado

```javascript
// src/utils/apiLogger.js
class APILogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(service, action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      service, // 'finnhub' | 'alphaVantage' | 'marketData'
      action, // 'fetch' | 'cache_hit' | 'error'
      details,
    };

    this.logs.push(entry);

    // Mantener solo últimos 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // En desarrollo, también log a console
    if (import.meta.env.DEV) {
      console.log(`[${service}] ${action}:`, details);
    }
  }

  getRecentLogs(count = 10) {
    return this.logs.slice(-count);
  }

  getLogsByService(service) {
    return this.logs.filter((log) => log.service === service);
  }

  clear() {
    this.logs = [];
  }
}

export default new APILogger();
```

### 8.2 DevTools panel (desarrollo)

```vue
<!-- src/components/dev/APIMonitor.vue -->
<script setup>
import { ref, computed } from "vue";
import apiLogger from "@/utils/apiLogger";
import marketDataService from "@/services/marketDataService";

const logs = ref(apiLogger.logs);
const cacheStats = computed(() => marketDataService.getCacheStats());

// Auto-refresh cada 2 segundos
setInterval(() => {
  logs.value = [...apiLogger.logs];
}, 2000);
</script>

<template>
  <div class="api-monitor" v-if="import.meta.env.DEV">
    <h3>API Monitor</h3>

    <!-- Cache stats -->
    <div class="cache-stats">
      <h4>Cache Status</h4>
      <ul>
        <li>Market Data: {{ cacheStats.marketData }} entries</li>
        <li>Finnhub: {{ cacheStats.finnhub }} entries</li>
        <li>Alpha Vantage: {{ cacheStats.alphaVantage }} entries</li>
        <li>Pending: {{ cacheStats.pendingRequests }} requests</li>
      </ul>
    </div>

    <!-- Recent logs -->
    <div class="recent-logs">
      <h4>Recent Activity (last 10)</h4>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Service</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, i) in apiLogger.getRecentLogs()" :key="i">
            <td>{{ new Date(log.timestamp).toLocaleTimeString() }}</td>
            <td>{{ log.service }}</td>
            <td>{{ log.action }}</td>
            <td>{{ JSON.stringify(log.details).slice(0, 50) }}...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

---

## 9. Testing de Integración

### 9.1 Test del orquestador

```javascript
// tests/services/marketDataService.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import marketDataService from "@/services/marketDataService";
import finnhubService from "@/services/finnhubService";
import alphaVantageService from "@/services/alphaVantageService";

// Mock de servicios
vi.mock("@/services/finnhubService");
vi.mock("@/services/alphaVantageService");

describe("MarketDataService Integration", () => {
  beforeEach(() => {
    marketDataService.clearCache();
    vi.clearAllMocks();
  });

  it("debería combinar datos de Finnhub y Alpha Vantage", async () => {
    // Mock responses
    finnhubService.getQuote.mockResolvedValue({
      c: 100.15,
      d: 0.25,
      dp: 0.25,
      h: 100.5,
      l: 99.8,
      o: 100.0,
      pc: 99.9,
    });

    alphaVantageService.getTimeSeries.mockResolvedValue([
      {
        date: "2025-01-29",
        close: 100.15,
        open: 100.0,
        high: 100.5,
        low: 99.8,
        volume: 1000000,
      },
      {
        date: "2025-01-28",
        close: 99.9,
        open: 99.5,
        high: 100.0,
        low: 99.4,
        volume: 950000,
      },
    ]);

    const result = await marketDataService.getCompleteData("AGG", {
      includeHistorical: true,
      includeFundamentals: false,
      historicalRange: "1M",
    });

    // Verificar estructura
    expect(result).toHaveProperty("symbol", "AGG");
    expect(result).toHaveProperty("current");
    expect(result).toHaveProperty("historical");
    expect(result.current.price).toBe(100.15);
    expect(result.historical.data).toHaveLength(2);
    expect(result.sources.currentPrice).toBe("finnhub");
    expect(result.sources.historical).toBe("alphaVantage");
  });

  it("debería manejar fallo de Alpha Vantage gracefully", async () => {
    finnhubService.getQuote.mockResolvedValue({
      c: 100.15,
      d: 0.25,
      dp: 0.25,
    });

    alphaVantageService.getTimeSeries.mockRejectedValue(
      new Error("Rate limit exceeded"),
    );

    const result = await marketDataService.getCompleteData("AGG", {
      includeHistorical: true,
    });

    // Debe tener precio actual pero no histórico
    expect(result.current).toBeTruthy();
    expect(result.historical).toBeNull();
    expect(result.errors).toBeDefined();
    expect(result.errors[0].field).toBe("historical");
  });

  it("debería cachear requests repetidos", async () => {
    finnhubService.getQuote.mockResolvedValue({ c: 100.15 });
    alphaVantageService.getTimeSeries.mockResolvedValue([]);

    // Primera llamada
    await marketDataService.getCompleteData("AGG");
    expect(finnhubService.getQuote).toHaveBeenCalledTimes(1);

    // Segunda llamada (debe usar cache)
    await marketDataService.getCompleteData("AGG");
    expect(finnhubService.getQuote).toHaveBeenCalledTimes(1); // No incrementa
  });

  it("debería obtener múltiples precios en batch", async () => {
    finnhubService.getQuote
      .mockResolvedValueOnce({ c: 100.15 })
      .mockResolvedValueOnce({ c: 117.25 })
      .mockResolvedValueOnce({ c: 227.5 });

    const prices = await marketDataService.getBatchCurrentPrices([
      "AGG",
      "VYM",
      "JNJ",
    ]);

    expect(prices).toEqual({
      AGG: 100.15,
      VYM: 117.25,
      JNJ: 227.5,
    });
  });
});
```

### 9.2 Test del Pinia Store

```javascript
// tests/stores/marketData.test.js
import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMarketDataStore } from "@/stores/marketData";
import marketDataService from "@/services/marketDataService";

vi.mock("@/services/marketDataService");

describe("MarketData Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("debería cargar datos de símbolo correctamente", async () => {
    const store = useMarketDataStore();

    marketDataService.getCompleteData.mockResolvedValue({
      symbol: "AGG",
      current: { price: 100.15, change: 0.25, changePercent: 0.25 },
      historical: { data: [], statistics: {} },
      timestamp: new Date().toISOString(),
    });

    await store.fetchSymbol("AGG");

    expect(store.symbols["AGG"]).toBeDefined();
    expect(store.getCurrentPrice("AGG")).toBe(100.15);
    expect(store.isLoading("AGG")).toBe(false);
  });

  it("debería manejar errores y actualizar estado", async () => {
    const store = useMarketDataStore();

    marketDataService.getCompleteData.mockRejectedValue(new Error("API Error"));

    await expect(store.fetchSymbol("INVALID")).rejects.toThrow("API Error");

    expect(store.getError("INVALID")).toBe("API Error");
    expect(store.isLoading("INVALID")).toBe(false);
  });

  it("debería cargar múltiples símbolos en paralelo", async () => {
    const store = useMarketDataStore();

    marketDataService.getCompleteData.mockResolvedValue({
      symbol: "TEST",
      current: { price: 100 },
    });

    await store.fetchMultipleSymbols(["AGG", "VYM", "JNJ"]);

    expect(store.loadedSymbols).toHaveLength(3);
    expect(marketDataService.getCompleteData).toHaveBeenCalledTimes(3);
  });
});
```

---

## 10. Roadmap de Optimización

### 10.1 Fase 1: MVP (actual)

- ✅ Integración básica Finnhub + Alpha Vantage
- ✅ Cache en memoria
- ✅ Manejo de errores básico
- ✅ Pinia Store reactivo

### 10.2 Fase 2: Optimización (próximo sprint)

- ⏳ IndexedDB para cache persistente
- ⏳ Service Worker para offline support
- ⏳ WebSockets Finnhub para precios real-time
- ⏳ Request batching inteligente

### 10.3 Fase 3: Escalabilidad (futuro)

- 📋 Backend proxy para agregación
- 📋 Rate limiting distribuido
- 📋 Monitoring con Sentry/DataDog
- 📋 A/B testing de estrategias de cache

---

## 11. Decisiones Clave

| Decisión                  | Opción elegida              | Confianza | Razón                              |
| ------------------------- | --------------------------- | --------- | ---------------------------------- |
| **Arquitectura**          | Capa orquestadora separada  | 🟢 ALTA   | Desacopla componentes de APIs      |
| **Cache strategy**        | Multi-nivel (service+store) | 🟢 ALTA   | Balance rendimiento/frescura       |
| **Error handling**        | Graceful degradation        | 🟢 ALTA   | Mejor UX que todo-o-nada           |
| **Refresh strategy**      | Manual + auto opcional      | 🟡 MEDIA  | Conserva cuota API, usuario decide |
| **Request deduplication** | Sí, en marketDataService    | 🟢 ALTA   | Evita waste de cuota               |
| **Fallback Finnhub→AV**   | No implementado             | 🟡 MEDIA  | AV no tiene real-time, poco útil   |

---

## 12. Próximos Pasos

1. ✅ **Documentación completada** (2025-01-30)
2. ⏳ **Implementar `marketDataService.js`** (siguiente archivo)
3. ⏳ **Actualizar `marketData.js` store** con nuevas acciones
4. ⏳ **Testing de integración** con ambas APIs en paralelo
5. ⏳ **Crear componente `DashboardView.vue`** que use el orquestador

---

## 13. Referencias

- [Finnhub docs](https://finnhub.io/docs/api)
- [Alpha Vantage docs](https://www.alphavantage.co/documentation/)
- [Pinia docs](https://pinia.vuejs.org/)
- [VueUse composables](https://vueuse.org/)

---

**Última actualización:** 2025-01-30  
**Estado:** ✅ DOCUMENTACIÓN COMPLETA  
**Siguiente:** Archivos 12-21 (specs de componentes)
