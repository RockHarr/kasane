# Pinia Stores - State Management

**Tesorería Simple** • Gestión de Estado Global

**Última actualización:** 2026-01-25  
**Versión:** 1.0 MVP

---

## 📋 Resumen Ejecutivo

### ¿Por qué Pinia?

**Pinia** es el state management oficial de Vue 3, reemplazando a Vuex.

**Ventajas:**

- ✅ Composition API native
- ✅ TypeScript-friendly (aunque no usamos TS)
- ✅ DevTools integration
- ✅ Menos boilerplate que Vuex
- ✅ Modular (un store por dominio)

### Arquitectura de Stores

Este proyecto tiene **4 stores**, uno por dominio de datos:

1. **auth** - Estado de autenticación Firebase (user, loading, logout)
2. **userInputs** - Datos del formulario de diagnóstico + persistencia en Firestore
3. **portfolio** - Asignación y cálculos de portafolio + persistencia en Firestore
4. **marketData** - Precios y data de APIs externas (pendiente de implementar)

> **Nota:** `auth` se inicializa en `main.js` con `authStore.init()` que registra
> el observer de Firebase. Al hacer login carga el perfil y portafolio del usuario
> desde Firestore. Al hacer logout limpia todos los stores.

**Principio:** Cada store tiene una responsabilidad clara y no se solapan.

---

## 🗄️ Store 1: userInputs

**Archivo:** `src/stores/userInputs.js`

### Responsabilidad

Almacenar y gestionar los datos ingresados por el usuario en el formulario de diagnóstico.

### Estado (State)

```javascript
{
  excedente: 0,        // USD - Monto total disponible
  reserva: 0,          // USD - Reserva de emergencia
  aporteMensual: 0,    // USD - Aporte mensual
  horizonte: 12        // Meses - Horizonte temporal
}
```

### Getters (Computed)

**`montoInvertible`**

- **Tipo:** `number`
- **Descripción:** Calcula cuánto puede invertir (excedente - reserva)
- **Fórmula:** `Math.max(0, state.excedente - state.reserva)`

**`horizonteAnios`**

- **Tipo:** `number`
- **Descripción:** Convierte horizonte de meses a años
- **Fórmula:** `state.horizonte / 12`

**`perfilRiesgo`**

- **Tipo:** `'conservador' | 'moderado' | 'agresivo'`
- **Descripción:** Determina perfil de riesgo según horizonte
- **Lógica:**
  - `< 12 meses` → conservador
  - `12-36 meses` → conservador
  - `> 36 meses` → moderado

### Actions (Methods)

**`setInputs(data)`**

- **Params:** `{ excedente, reserva, aporteMensual, horizonte }`
- **Descripción:** Actualiza todos los inputs a la vez
- **Validación:** Convierte a número, default 0 si inválido

**`reset()`**

- **Descripción:** Resetea el store a valores iniciales
- **Uso:** Cuando usuario quiere empezar de nuevo

### Código Completo

```javascript
// src/stores/userInputs.js
import { defineStore } from "pinia";

export const useUserInputsStore = defineStore("userInputs", {
  state: () => ({
    excedente: 0,
    reserva: 0,
    aporteMensual: 0,
    horizonte: 12, // meses
  }),

  getters: {
    /**
     * Calcula el monto invertible (excedente - reserva)
     * @returns {number} Monto en USD
     */
    montoInvertible: (state) => {
      return Math.max(0, state.excedente - state.reserva);
    },

    /**
     * Convierte horizonte de meses a años
     * @returns {number} Años
     */
    horizonteAnios: (state) => {
      return state.horizonte / 12;
    },

    /**
     * Determina perfil de riesgo según horizonte
     * @returns {'conservador' | 'moderado' | 'agresivo'}
     */
    perfilRiesgo: (state) => {
      if (state.horizonte <= 12) return "conservador";
      if (state.horizonte <= 36) return "conservador";
      return "moderado";
    },
  },

  actions: {
    /**
     * Actualiza todos los inputs del diagnóstico
     * @param {object} data - { excedente, reserva, aporteMensual, horizonte }
     */
    setInputs(data) {
      this.excedente = Number(data.excedente) || 0;
      this.reserva = Number(data.reserva) || 0;
      this.aporteMensual = Number(data.aporteMensual) || 0;
      this.horizonte = Number(data.horizonte) || 12;
    },

    /**
     * Resetea el store a valores iniciales
     */
    reset() {
      this.$reset();
    },
  },
});
```

### Uso en Componentes

```vue
<script setup>
import { useUserInputsStore } from "@/stores/userInputs";

const store = useUserInputsStore();

// Leer state
console.log(store.excedente);

// Usar getters
console.log(store.montoInvertible);

// Llamar actions
store.setInputs({
  excedente: 1000,
  reserva: 300,
  aporteMensual: 200,
  horizonte: 24,
});
</script>
```

### Testing

```javascript
import { setActivePinia, createPinia } from "pinia";
import { useUserInputsStore } from "@/stores/userInputs";

describe("userInputs store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("calcula montoInvertible correctamente", () => {
    const store = useUserInputsStore();
    store.excedente = 1000;
    store.reserva = 300;

    expect(store.montoInvertible).toBe(700);
  });

  it("no permite monto invertible negativo", () => {
    const store = useUserInputsStore();
    store.excedente = 100;
    store.reserva = 300;

    expect(store.montoInvertible).toBe(0);
  });
});
```

---

## 💼 Store 2: portfolio

**Archivo:** `src/stores/portfolio.js`

### Responsabilidad

Calcular y almacenar la asignación de portafolio sugerida según el perfil del usuario.

### Estado (State)

```javascript
{
  allocation: {
    bonds: 0.60,      // 60% - Bonos
    dividends: 0.30,  // 30% - Dividendos
    stocks: 0.10      // 10% - Acciones
  },

  instruments: [
    {
      symbol: 'AGG',
      name: 'iShares Core U.S. Aggregate Bond ETF',
      type: 'bonds',
      description: 'Bonos de alta calidad...',
      percentage: 60,
      amount: 420  // USD
    },
    // ... más instrumentos
  ]
}
```

### Getters

**`totalPercentage`**

- **Tipo:** `number`
- **Descripción:** Suma de todos los porcentajes (debe ser 100)
- **Uso:** Validación

**`totalAmount`**

- **Tipo:** `number`
- **Descripción:** Suma de todos los montos asignados
- **Uso:** Verificar que = montoInvertible

### Actions

**`calculateAllocation(horizonte)`**

- **Params:** `horizonte` (meses)
- **Descripción:** Calcula asignación según horizonte temporal
- **Lógica:**
  - `< 12 meses`: 70% bonds, 20% dividends, 10% stocks
  - `12-36 meses`: 60% bonds, 30% dividends, 10% stocks
  - `> 36 meses`: 50% bonds, 35% dividends, 15% stocks

**`calculateInstruments(montoInvertible)`**

- **Params:** `montoInvertible` (USD)
- **Descripción:** Calcula monto específico por instrumento
- **Ejemplo:** Si montoInvertible = 700 y AGG = 60%, entonces amount = 420

### Código Completo

```javascript
// src/stores/portfolio.js
import { defineStore } from "pinia";
import { useUserInputsStore } from "./userInputs";
import { useMarketDataStore } from "./marketData";
import { INSTRUMENTS } from "@/utils/constants";
import { calculateAllocation } from "@/services/calculations";

export const usePortfolioStore = defineStore("portfolio", {
  state: () => ({
    allocation: {
      bonds: 0.6,
      dividends: 0.3,
      stocks: 0.1,
    },
    instruments: [],
  }),

  getters: {
    /**
     * Suma total de porcentajes (debe ser 100)
     * @returns {number}
     */
    totalPercentage: (state) => {
      return (
        Object.values(state.allocation).reduce((sum, val) => sum + val, 0) * 100
      );
    },

    /**
     * Suma total de montos asignados
     * @returns {number}
     */
    totalAmount: (state) => {
      return state.instruments.reduce((sum, inst) => sum + inst.amount, 0);
    },
  },

  actions: {
    /**
     * Calcula asignación de portafolio según horizonte
     * @param {number} horizonte - Meses
     */
    calculateAllocation(horizonte) {
      // Usa función pura de calculations.js
      this.allocation = calculateAllocation(horizonte);
    },

    /**
     * Calcula montos específicos por instrumento
     * @param {number} montoInvertible - USD disponible para invertir
     */
    calculateInstruments(montoInvertible) {
      const userInputsStore = useUserInputsStore();
      const marketDataStore = useMarketDataStore();

      // Calcula allocation primero
      this.calculateAllocation(userInputsStore.horizonte);

      // Asigna instrumentos según tipo
      this.instruments = INSTRUMENTS.map((inst) => {
        let percentage;

        switch (inst.type) {
          case "bonds":
            percentage = this.allocation.bonds * 100;
            break;
          case "dividends":
            percentage = this.allocation.dividends * 100;
            break;
          case "stocks":
            percentage = this.allocation.stocks * 100;
            break;
          default:
            percentage = 0;
        }

        const amount = (montoInvertible * percentage) / 100;

        // Obtiene precio actual de marketData store
        const marketData = marketDataStore.quotes[inst.symbol] || {};

        return {
          ...inst,
          percentage,
          amount,
          price: marketData.price || 0,
          change: marketData.change || 0,
          changePercent: marketData.changePercent || 0,
        };
      });
    },

    /**
     * Resetea el store
     */
    reset() {
      this.$reset();
    },
  },
});
```

### Uso en Componentes

```vue
<script setup>
import { onMounted } from "vue";
import { useUserInputsStore } from "@/stores/userInputs";
import { usePortfolioStore } from "@/stores/portfolio";

const userInputsStore = useUserInputsStore();
const portfolioStore = usePortfolioStore();

onMounted(() => {
  // Calcula instrumentos con monto invertible
  portfolioStore.calculateInstruments(userInputsStore.montoInvertible);
});
</script>

<template>
  <div>
    <p>Total asignado: {{ portfolioStore.totalAmount }}</p>

    <div v-for="inst in portfolioStore.instruments" :key="inst.symbol">
      <InstrumentCard v-bind="inst" />
    </div>
  </div>
</template>
```

---

## 📊 Store 3: marketData

**Archivo:** `src/stores/marketData.js`

### Responsabilidad

Gestionar datos de mercado obtenidos de APIs externas (Finnhub/Alpha Vantage).

### Estado (State)

```javascript
{
  quotes: {
    'AGG': {
      symbol: 'AGG',
      price: 102.50,
      change: 0.15,
      changePercent: 0.15,
      high: 102.60,
      low: 102.40
    },
    'VYM': { ... },
    'JNJ': { ... }
  },

  loading: false,
  error: null,
  lastUpdate: null  // timestamp
}
```

### Getters

**`getQuote(symbol)`**

- **Tipo:** `function(symbol: string) => object | null`
- **Descripción:** Obtiene quote de un símbolo específico
- **Retorna:** Objeto con data o null si no existe

**`isStale`**

- **Tipo:** `boolean`
- **Descripción:** Verifica si data tiene más de 5 minutos
- **Uso:** Para saber si re-fetch

### Actions

**`async fetchQuotes(symbols)`**

- **Params:** `symbols` - Array de símbolos (ej: ['AGG', 'VYM'])
- **Descripción:** Fetch data de APIs (Finnhub)
- **Side effects:** Actualiza `quotes`, `loading`, `error`, `lastUpdate`
- **Error handling:** Retry 3x, luego mock data

**`setQuote(symbol, data)`**

- **Params:** `symbol`, `data` object
- **Descripción:** Actualiza quote manualmente (útil para testing)

**`clearError()`**

- **Descripción:** Limpia mensaje de error

### Código Completo

```javascript
// src/stores/marketData.js
import { defineStore } from "pinia";
import { fetchMultipleQuotes } from "@/services/api";

export const useMarketDataStore = defineStore("marketData", {
  state: () => ({
    quotes: {},
    loading: false,
    error: null,
    lastUpdate: null,
  }),

  getters: {
    /**
     * Obtiene quote de un símbolo específico
     * @param {string} symbol - Ej: 'AGG'
     * @returns {object | null}
     */
    getQuote: (state) => (symbol) => {
      return state.quotes[symbol] || null;
    },

    /**
     * Verifica si data es antigua (> 5 min)
     * @returns {boolean}
     */
    isStale: (state) => {
      if (!state.lastUpdate) return true;
      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() - state.lastUpdate > fiveMinutes;
    },
  },

  actions: {
    /**
     * Fetch quotes de múltiples símbolos
     * @param {string[]} symbols - Ej: ['AGG', 'VYM', 'JNJ']
     */
    async fetchQuotes(symbols) {
      this.loading = true;
      this.error = null;

      try {
        // Llama a API service (con retry logic)
        const results = await fetchMultipleQuotes(symbols);

        // Actualiza quotes
        results.forEach((quote) => {
          this.quotes[quote.symbol] = quote;
        });

        this.lastUpdate = Date.now();
      } catch (err) {
        console.error("Error fetching market data:", err);
        this.error = "No se pudieron cargar los datos del mercado";

        // Fallback a mock data
        this.useMockData(symbols);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Usa data mock cuando API falla
     * @param {string[]} symbols
     */
    useMockData(symbols) {
      const mockQuotes = {
        AGG: { price: 102.5, change: 0.15, changePercent: 0.15 },
        VYM: { price: 95.3, change: -0.2, changePercent: -0.21 },
        JNJ: { price: 165.4, change: 1.1, changePercent: 0.67 },
      };

      symbols.forEach((symbol) => {
        if (mockQuotes[symbol]) {
          this.quotes[symbol] = {
            symbol,
            ...mockQuotes[symbol],
            high: mockQuotes[symbol].price + 0.5,
            low: mockQuotes[symbol].price - 0.5,
          };
        }
      });

      this.lastUpdate = Date.now();
    },

    /**
     * Actualiza un quote manualmente
     * @param {string} symbol
     * @param {object} data
     */
    setQuote(symbol, data) {
      this.quotes[symbol] = {
        symbol,
        ...data,
      };
    },

    /**
     * Limpia error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Resetea el store
     */
    reset() {
      this.$reset();
    },
  },
});
```

### Uso en Componentes

```vue
<script setup>
import { ref, onMounted } from "vue";
import { useMarketDataStore } from "@/stores/marketData";

const marketDataStore = useMarketDataStore();

onMounted(async () => {
  await marketDataStore.fetchQuotes(["AGG", "VYM", "JNJ"]);
});

// Refresh cada 5 min
setInterval(
  () => {
    if (marketDataStore.isStale) {
      marketDataStore.fetchQuotes(["AGG", "VYM", "JNJ"]);
    }
  },
  5 * 60 * 1000,
);
</script>

<template>
  <div>
    <div v-if="marketDataStore.loading">Cargando...</div>
    <div v-else-if="marketDataStore.error" role="alert">
      {{ marketDataStore.error }}
      <button @click="marketDataStore.clearError">OK</button>
    </div>
    <div v-else>
      <!-- Mostrar quotes -->
    </div>
  </div>
</template>
```

---

## 🔄 Interacción Entre Stores

### Flujo Típico

```
1. Usuario completa DiagnosticoForm
   → userInputs.setInputs(data)

2. Navega a Dashboard
   → portfolio.calculateInstruments(userInputs.montoInvertible)
   → marketData.fetchQuotes(['AGG', 'VYM', 'JNJ'])

3. Portfolio usa datos de marketData
   → portfolio.instruments incluye prices de marketData.quotes

4. Usuario va a Simulator
   → Lee userInputs.montoInvertible
   → Lee userInputs.aporteMensual
   → Calcula proyección
```

### Diagrama de Dependencias

```
┌─────────────────┐
│  userInputs     │
│  (base)         │
└────────┬────────┘
         │
         ├─────────> portfolio (lee montoInvertible)
         │
         └─────────> Vistas (leen todos los inputs)

┌─────────────────┐
│  marketData     │
│  (independiente)│
└────────┬────────┘
         │
         └─────────> portfolio (lee quotes)

┌─────────────────┐
│  portfolio      │
│  (compuesto)    │
└─────────────────┘
```

---

## ✅ Best Practices

### 1. No Mutar State Directamente

```javascript
// ❌ MAL
store.excedente = 1000

// ✅ BIEN
store.setInputs({ excedente: 1000, ... })
```

### 2. Usar Getters para Computed Values

```javascript
// ❌ MAL - Calcular en componente
const montoInvertible = computed(
  () => userInputsStore.excedente - userInputsStore.reserva,
);

// ✅ BIEN - Usar getter del store
const montoInvertible = computed(() => userInputsStore.montoInvertible);
```

### 3. Actions Asíncronas con Try/Catch

```javascript
// ✅ BIEN
async fetchQuotes(symbols) {
  this.loading = true
  this.error = null

  try {
    const data = await fetchMultipleQuotes(symbols)
    this.quotes = data
  } catch (err) {
    this.error = err.message
  } finally {
    this.loading = false
  }
}
```

### 4. Resetear Stores al Salir

```javascript
// En App.vue o router
onBeforeUnmount(() => {
  userInputsStore.reset();
  portfolioStore.reset();
  marketDataStore.reset();
});
```

---

## 🧪 Testing de Stores

### Setup

```javascript
import { setActivePinia, createPinia } from "pinia";

describe("Store Tests", () => {
  beforeEach(() => {
    // Crea Pinia fresh para cada test
    setActivePinia(createPinia());
  });

  // ... tests
});
```

### Ejemplo: userInputs

```javascript
it("calcula montoInvertible correctamente", () => {
  const store = useUserInputsStore();

  store.setInputs({
    excedente: 1000,
    reserva: 300,
    aporteMensual: 200,
    horizonte: 24,
  });

  expect(store.montoInvertible).toBe(700);
  expect(store.horizonteAnios).toBe(2);
  expect(store.perfilRiesgo).toBe("conservador");
});
```

### Ejemplo: marketData (con mock)

```javascript
import { vi } from "vitest";

it("maneja error de API correctamente", async () => {
  const store = useMarketDataStore();

  // Mock API que falla
  vi.spyOn(api, "fetchMultipleQuotes").mockRejectedValue(new Error("API down"));

  await store.fetchQuotes(["AGG"]);

  expect(store.error).toBeTruthy();
  expect(store.quotes.AGG).toBeDefined(); // Mock data
});
```

---

## 📚 Resumen

| Store          | Responsabilidad       | Dependencias           |
| -------------- | --------------------- | ---------------------- |
| **userInputs** | Datos de diagnóstico  | Ninguna                |
| **portfolio**  | Asignación + cálculos | userInputs, marketData |
| **marketData** | Quotes de APIs        | Ninguna                |

**Total de código:** ~300 líneas (3 stores)

**Complejidad:** Baja-Media (stores simples, lógica clara)

**Testeable:** 100% (funciones puras + mocks fáciles)

---

_Stores diseñados para ser simples, testeables y escalables._
