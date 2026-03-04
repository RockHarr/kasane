// ============================================================
// indicators.test.ts — Kasane Trading Lab 🧪
// Tests unitarios para calcSMA, calcRSI e interpretSignal.
// Correr: npx vitest run src/services/indicators.test.ts
// ============================================================

import { describe, it, expect } from 'vitest'
import { calcSMA, calcRSI, interpretSignal } from './indicators'

// ─── Datos de prueba ──────────────────────────────────────────

/** 30 precios simulados con tendencia alcista suave */
const PRICES_TRENDING_UP = Array.from({ length: 30 }, (_, i) => 100 + i * 0.5)

/** 30 precios planos */
const PRICES_FLAT = Array.from({ length: 30 }, () => 150)

/** 30 precios con caída pronunciada al final */
const PRICES_DROP = [
    ...Array.from({ length: 20 }, (_, i) => 200 - i),
    ...Array.from({ length: 10 }, (_, i) => 120 - i * 3),
]

// ─── calcSMA ─────────────────────────────────────────────────

describe('calcSMA', () => {
    it('retorna null en los primeros (period - 1) valores', () => {
        const result = calcSMA(PRICES_TRENDING_UP, 20)
        for (let i = 0; i < 19; i++) {
            expect(result[i]).toBeNull()
        }
    })

    it('calcula el primer valor SMA correctamente desde el índice (period - 1)', () => {
        const prices = [1, 2, 3, 4, 5]
        const result = calcSMA(prices, 3)
        // índice 2: avg(1,2,3) = 2
        expect(result[2]).toBeCloseTo(2)
        // índice 3: avg(2,3,4) = 3
        expect(result[3]).toBeCloseTo(3)
        // índice 4: avg(3,4,5) = 4
        expect(result[4]).toBeCloseTo(4)
    })

    it('retorna un array del mismo largo que la entrada', () => {
        const result = calcSMA(PRICES_TRENDING_UP, 20)
        expect(result).toHaveLength(PRICES_TRENDING_UP.length)
    })

    it('SMA de precios planos es igual al precio', () => {
        const result = calcSMA(PRICES_FLAT, 20)
        const smaValues = result.filter(v => v !== null) as number[]
        smaValues.forEach(v => expect(v).toBeCloseTo(150))
    })
})

// ─── calcRSI ─────────────────────────────────────────────────

describe('calcRSI', () => {
    it('retorna null hasta que hay suficientes datos (period + 1)', () => {
        const result = calcRSI(PRICES_TRENDING_UP, 14)
        for (let i = 0; i < 14; i++) {
            expect(result[i]).toBeNull()
        }
    })

    it('retorna un array del mismo largo que la entrada', () => {
        const result = calcRSI(PRICES_TRENDING_UP, 14)
        expect(result).toHaveLength(PRICES_TRENDING_UP.length)
    })

    it('todos los valores no-null están en rango 0–100', () => {
        const result = calcRSI(PRICES_TRENDING_UP, 14)
        result.filter(v => v !== null).forEach(v => {
            expect(v!).toBeGreaterThanOrEqual(0)
            expect(v!).toBeLessThanOrEqual(100)
        })
    })

    it('tendencia alcista sostenida produce RSI alto (> 50)', () => {
        const result = calcRSI(PRICES_TRENDING_UP, 14)
        const last = result[result.length - 1]!
        expect(last).toBeGreaterThan(50)
    })

    it('caída pronunciada produce RSI bajo (< 50)', () => {
        const result = calcRSI(PRICES_DROP, 14)
        const last = result[result.length - 1]!
        expect(last).toBeLessThan(50)
    })

    it('retorna solo nulls si no hay suficientes precios', () => {
        const result = calcRSI([100, 101, 102], 14)
        result.forEach(v => expect(v).toBeNull())
    })
})

// ─── interpretSignal ─────────────────────────────────────────

describe('interpretSignal', () => {
    it('devuelve señal verde (buy) cuando RSI < 30 y precio < SMA', () => {
        const result = interpretSignal(90, 110, 25)
        expect(result.signal).toBe('buy')
        expect(result.color).toBe('green')
    })

    it('devuelve señal roja (sell) cuando RSI > 70 y precio > SMA', () => {
        const result = interpretSignal(120, 100, 75)
        expect(result.signal).toBe('sell')
        expect(result.color).toBe('red')
    })

    it('devuelve señal amarilla alcista cuando precio > SMA y RSI neutro', () => {
        const result = interpretSignal(110, 100, 50)
        expect(result.signal).toBe('neutral')
        expect(result.color).toBe('yellow')
        expect(result.title).toContain('alcista')
    })

    it('devuelve señal amarilla bajista cuando precio < SMA y RSI neutro', () => {
        const result = interpretSignal(90, 100, 50)
        expect(result.signal).toBe('neutral')
        expect(result.color).toBe('yellow')
        expect(result.title).toContain('bajista')
    })

    it('devuelve neutral genérico cuando SMA y RSI son null', () => {
        const result = interpretSignal(100, null, null)
        expect(result.signal).toBe('neutral')
        expect(result.color).toBe('yellow')
    })

    it('el campo explanation siempre es un string no vacío', () => {
        const cases = [
            interpretSignal(90, 110, 25),
            interpretSignal(120, 100, 75),
            interpretSignal(110, 100, 50),
            interpretSignal(100, null, null),
        ]
        cases.forEach(r => {
            expect(typeof r.explanation).toBe('string')
            expect(r.explanation.length).toBeGreaterThan(10)
        })
    })
})
