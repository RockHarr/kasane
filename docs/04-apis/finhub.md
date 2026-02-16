# Finnhub API

**Tesorería Simple** • API Principal de Datos de Mercado

**Última actualización:** 2026-01-26  
**Status:** ✅ Validado y operacional

---

## 📋 Resumen

**Finnhub** es nuestra API principal para obtener datos de mercado en tiempo real.

### Información General

- **URL Base:** `https://finnhub.io/api/v1`
- **Autenticación:** API Key en query params
- **Plan:** Free Tier
- **Rate Limit:** 60 requests/minuto
- **Documentación oficial:** https://finnhub.io/docs/api

### ¿Por qué Finnhub?

✅ Free tier generoso (60 req/min)  
✅ Datos en tiempo real  
✅ ETFs bien cubiertos (AGG, VYM, JNJ disponibles)  
✅ API simple y directa  
✅ Documentación clara

---

## 🔑 Setup

### Obtener API Key

1. Registrarse en https://finnhub.io/register
2. Ir a Dashboard → API Keys
3. Copiar la key

### Configurar en Proyecto

**Archivo:** `.env.local`

```env
VITE_FINNHUB_API_KEY=tu_key_aqui
```

**Importante:**

- ⚠️ NO commitear `.env.local` a Git (ya está en `.gitignore`)
- ✅ Usar `.env.example` como template para otros devs

---

## 📊 Endpoints Usados

### 1. Quote (Precio Actual)

**Endpoint:** `/quote`

**Descripción:** Obtiene precio actual y estadísticas del día de un símbolo.

**URL:**

```
GET https://finnhub.io/api/v1/quote?symbol={symbol}&token={api_key}
```

**Parámetros:**

- `symbol` (required): Símbolo del instrumento (ej: `AGG`, `VYM`, `JNJ`)
- `token` (required): Tu API key

**Ejemplo Request:**

```javascript
const symbol = "AGG";
const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;

const response = await fetch(
  `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
);
const data = await response.json();
```

**Ejemplo Response:**

```json
{
  "c": 100.15, // Current price (precio actual)
  "d": 0, // Change (cambio en USD desde cierre anterior)
  "dp": 0, // Change percent (cambio en %)
  "h": 100.24, // High (máximo del día)
  "l": 100.01, // Low (mínimo del día)
  "o": 100.1, // Open (precio de apertura)
  "pc": 100.15, // Previous close (cierre anterior)
  "t": 1769720400 // Timestamp (Unix timestamp)
}
```

**Campos que Usamos:**

- `c` → Precio actual (mostrar en InstrumentCard)
- `d` → Cambio en USD (calcular si es positivo/negativo)
- `dp` → Cambio en % (mostrar con ↑/↓)

**Validación Real (2026-01-26):**

| Símbolo | Precio  | Cambio | Status |
| ------- | ------- | ------ | ------ |
| AGG     | $100.15 | 0%     | ✅     |
| VYM     | -       | -      | ✅     |
| JNJ     | $227.29 | -0.19% | ✅     |

---

## 🔧 Implementación en la App

### Service Layer

**Archivo:** `src/services/api.js`

```javascript
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

/**
 * Fetch quote de un símbolo
 * @param {string} symbol - Ej: 'AGG', 'VYM', 'JNJ'
 * @returns {Promise<object>} Quote data
 */
export async function fetchQuote(symbol) {
  try {
    const res = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
    );

    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.status}`);
    }

    const data = await res.json();

    // Transformar a formato de la app
    return {
      symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      timestamp: data.t,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch quotes de múltiples símbolos
 * @param {string[]} symbols - Ej: ['AGG', 'VYM', 'JNJ']
 * @returns {Promise<object[]>} Array de quotes
 */
export async function fetchMultipleQuotes(symbols) {
  return Promise.all(symbols.map((symbol) => fetchQuote(symbol)));
}
```

### Uso en Componentes

```javascript
// En PortfolioSuggestion.vue
import { fetchMultipleQuotes } from "@/services/api";

const instruments = ["AGG", "VYM", "JNJ"];

try {
  const quotes = await fetchMultipleQuotes(instruments);
  // quotes = [
  //   { symbol: 'AGG', price: 100.15, change: 0, changePercent: 0, ... },
  //   { symbol: 'VYM', price: ..., ... },
  //   { symbol: 'JNJ', price: 227.29, change: -0.43, changePercent: -0.19, ... }
  // ]
} catch (error) {
  // Manejar error (mostrar mensaje, usar mock data, etc.)
}
```

---

## ⚠️ Rate Limits

### Free Tier Limits

- **60 requests/minuto**
- **API calls/día:** Ilimitados (pero sujeto a rate per minute)

### Estrategia de Uso

**Para MVP:**

- 3 símbolos (AGG, VYM, JNJ)
- 1 fetch al cargar Dashboard
- 1 refresh cada 5 minutos (opcional)

**Cálculo:**

- 3 símbolos × 1 request c/u = 3 requests
- 60 requests/min ÷ 3 = **20 cargas completas por minuto** → Más que suficiente

**Si excedemos rate limit:**

- Status code: `429 Too Many Requests`
- Fallback: Usar Alpha Vantage o mock data

---

## 🐛 Error Handling

### Errores Posibles

**1. Invalid API Key (401)**

```json
{ "error": "Invalid API key" }
```

**Solución:** Verificar que `.env.local` tiene la key correcta

**2. Rate Limit Exceeded (429)**

```json
{ "error": "API rate limit exceeded" }
```

**Solución:**

- Esperar 1 minuto
- Usar Alpha Vantage como backup
- Implementar cache local

**3. Symbol Not Found (404)**

```json
{ "error": "Symbol not found" }
```

**Solución:** Verificar que el símbolo existe (AGG, VYM, JNJ están validados)

**4. Network Error**
**Solución:** Retry con exponential backoff

### Implementación de Retry Logic

```javascript
async function fetchQuoteWithRetry(symbol, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchQuote(symbol);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i)),
      );
    }
  }
}
```

---

## 🧪 Testing

### Manual Testing

**URL de prueba en navegador:**

```
https://finnhub.io/api/v1/quote?symbol=AGG&token=YOUR_KEY
```

**Validar:**

- ✅ Status 200
- ✅ JSON válido
- ✅ Campos `c`, `d`, `dp` presentes
- ✅ Valores numéricos

### Unit Testing (Vitest)

```javascript
// tests/unit/api.test.js
import { describe, it, expect, vi } from "vitest";
import { fetchQuote } from "@/services/api";

describe("Finnhub API", () => {
  it("fetches quote successfully", async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            c: 100.15,
            d: 0,
            dp: 0,
            h: 100.24,
            l: 100.01,
          }),
      }),
    );

    const quote = await fetchQuote("AGG");

    expect(quote.symbol).toBe("AGG");
    expect(quote.price).toBe(100.15);
    expect(quote.change).toBe(0);
  });

  it("handles API errors", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
      }),
    );

    await expect(fetchQuote("AGG")).rejects.toThrow();
  });
});
```

---

## 📝 Notas Adicionales

### Endpoints NO Usados (pero disponibles)

Finnhub tiene muchos más endpoints que NO usamos en MVP:

- `/stock/profile2` - Información de la empresa
- `/stock/metric` - Métricas fundamentales (P/E ratio, etc.)
- `/news` - Noticias de mercado
- `/calendar/earnings` - Calendario de earnings

**Posible uso en v2.0** con MCP + Claude para análisis inteligente.

### Alternativas Consideradas

- **Yahoo Finance API:** No oficial, puede cambiar sin aviso
- **IEX Cloud:** Bueno pero free tier muy limitado
- **Polygon.io:** Excelente pero requiere pago para real-time

**Finnhub ganó** por balance entre features, límites generosos, y confiabilidad.

---

## 🔗 Referencias

- **Documentación oficial:** https://finnhub.io/docs/api
- **Dashboard:** https://finnhub.io/dashboard
- **Status page:** https://status.finnhub.io/
- **Support:** support@finnhub.io

---

**Validado:** 2026-01-26  
**Próxima revisión:** Post-implementación  
**Relacionado:** alpha-vantage.md, integracion.md, api.js
