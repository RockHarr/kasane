// ============================================================
// indicators.ts — Kasane Trading Lab 🧪
// Funciones puras para calcular indicadores técnicos.
// Sin side effects → fáciles de testear unitariamente.
// ============================================================

/**
 * Calcula la Media Móvil Simple (SMA) de N períodos.
 * Los primeros (period - 1) valores son null porque no hay
 * suficientes datos para calcular el promedio.
 *
 * @param prices Array de precios de cierre (cronológico, más antiguo primero)
 * @param period Período de la media móvil (ej: 20)
 */
export function calcSMA(prices: number[], period: number): (number | null)[] {
    return prices.map((_, i) => {
        if (i < period - 1) return null
        const slice = prices.slice(i - period + 1, i + 1)
        return slice.reduce((a, b) => a + b, 0) / period
    })
}

/**
 * Calcula el RSI (Relative Strength Index) de N períodos.
 * Valores en escala 0–100.
 * - RSI < 30 → sobrevendido (posible oportunidad de compra)
 * - RSI > 70 → sobrecomprado (posible oportunidad de venta)
 *
 * @param prices Array de precios de cierre
 * @param period Período (estándar financiero: 14)
 */
export function calcRSI(prices: number[], period = 14): (number | null)[] {
    if (prices.length < period + 1) return prices.map(() => null)

    const result: (number | null)[] = prices.map(() => null)

    // Calcular cambios diarios
    const changes = prices.slice(1).map((p, i) => p - prices[i])

    // Primer RSI con promedio simple
    const firstGains = changes.slice(0, period).filter(c => c > 0)
    const firstLosses = changes.slice(0, period).filter(c => c < 0).map(Math.abs)

    let avgGain = firstGains.reduce((a, b) => a + b, 0) / period
    let avgLoss = firstLosses.reduce((a, b) => a + b, 0) / period

    const rsi = (ag: number, al: number) => al === 0 ? 100 : 100 - 100 / (1 + ag / al)
    result[period] = rsi(avgGain, avgLoss)

    // RSI suavizado (Wilder)
    for (let i = period + 1; i < prices.length; i++) {
        const change = changes[i - 1]
        const gain = change > 0 ? change : 0
        const loss = change < 0 ? Math.abs(change) : 0
        avgGain = (avgGain * (period - 1) + gain) / period
        avgLoss = (avgLoss * (period - 1) + loss) / period
        result[i] = rsi(avgGain, avgLoss)
    }

    return result
}

// ─── Panel de señal educativa ────────────────────────────────

export interface SignalResult {
    signal: 'buy' | 'sell' | 'neutral'
    color: 'green' | 'yellow' | 'red'
    title: string
    explanation: string
}

/**
 * Interpreta la combinación de RSI y SMA para generar una señal
 * en lenguaje simple, orientada a usuarios que están aprendiendo.
 *
 * Las reglas son intencionalmente simples y pedagógicas —
 * NO son asesoramiento financiero real.
 */
export function interpretSignal(
    currentPrice: number,
    sma: number | null,
    rsi: number | null,
): SignalResult {
    const belowSMA = sma !== null && currentPrice < sma
    const aboveSMA = sma !== null && currentPrice > sma
    const oversold = rsi !== null && rsi < 30
    const overbought = rsi !== null && rsi > 70
    const neutral = rsi !== null && rsi >= 40 && rsi <= 60

    if (oversold && belowSMA) {
        return {
            signal: 'buy',
            color: 'green',
            title: 'Posible punto de compra',
            explanation:
                'El RSI está en zona de sobrevendido (< 30) y el precio cayó bajo su media de 20 días. ' +
                'Históricamente, esto puede indicar que el precio tocó un mínimo temporal.',
        }
    }

    if (overbought && aboveSMA) {
        return {
            signal: 'sell',
            color: 'red',
            title: 'Posible punto de venta',
            explanation:
                'El RSI supera 70 (sobrecomprado) y el precio está sobre su media. ' +
                'El mercado podría estar "caliente" y prepararse para una corrección.',
        }
    }

    if (neutral && aboveSMA) {
        return {
            signal: 'neutral',
            color: 'yellow',
            title: 'Tendencia alcista moderada',
            explanation:
                'El precio está por encima de su media de 20 días con RSI equilibrado. ' +
                'No hay señal de sobrecompra, la tendencia es positiva pero sin urgencia.',
        }
    }

    if (neutral && belowSMA) {
        return {
            signal: 'neutral',
            color: 'yellow',
            title: 'Tendencia bajista moderada',
            explanation:
                'El precio está bajo su media de 20 días. Aún no se ven señales de reversión. ' +
                'Puede ser prudente esperar confirmación antes de entrar.',
        }
    }

    return {
        signal: 'neutral',
        color: 'yellow',
        title: 'Sin señal clara',
        explanation:
            'Los indicadores están en zona neutra. No hay una señal definida de compra ni venta. ' +
            'Un buen momento para observar y esperar movimiento.',
    }
}
