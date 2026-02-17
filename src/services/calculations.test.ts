import { describe, it, expect } from 'vitest'
import {
  calcularDCA,
  calcularTasaPortafolio,
  simularPortafolio,
  sugerirAsignacion,
  TASAS_ESTIMADAS,
} from './calculations'
import type { PortfolioAllocation, UserProfile } from '@/types'

// ─── calcularDCA ──────────────────────────────────────────────────

describe('calcularDCA', () => {
  it('retorna el capital inicial si horizonte es 0', () => {
    const result = calcularDCA({
      capitalInicial: 10000,
      aporteMensual: 0,
      horizonte: 0,
      tasaAnual: 0.08,
    })
    expect(result.valorFinal).toBe(10000)
    expect(result.totalAportado).toBe(10000)
    expect(result.ganancia).toBe(0)
  })

  it('sin aportes mensuales crece solo por interés compuesto', () => {
    const result = calcularDCA({
      capitalInicial: 10000,
      aporteMensual: 0,
      horizonte: 12,
      tasaAnual: 0.08,
    })
    // ~8.3% en 12 meses (compuesto mensual)
    expect(result.valorFinal).toBeGreaterThan(10800)
    expect(result.valorFinal).toBeLessThan(10900)
    expect(result.totalAportado).toBe(10000)
    expect(result.ganancia).toBeGreaterThan(0)
  })

  it('con aportes mensuales el valor final es mayor que solo el capital inicial', () => {
    const result = calcularDCA({
      capitalInicial: 10000,
      aporteMensual: 500,
      horizonte: 12,
      tasaAnual: 0.08,
    })
    expect(result.valorFinal).toBeGreaterThan(16000)
    expect(result.totalAportado).toBe(10000 + 500 * 12) // 16000
  })

  it('la ganancia es siempre valorFinal - totalAportado', () => {
    const result = calcularDCA({
      capitalInicial: 5000,
      aporteMensual: 200,
      horizonte: 24,
      tasaAnual: 0.07,
    })
    expect(result.ganancia).toBeCloseTo(result.valorFinal - result.totalAportado, 1)
  })

  it('snapshots tiene horizonte + 1 elementos (incluye mes 0)', () => {
    const horizonte = 36
    const result = calcularDCA({
      capitalInicial: 1000,
      aporteMensual: 100,
      horizonte,
      tasaAnual: 0.06,
    })
    expect(result.snapshots).toHaveLength(horizonte + 1)
  })

  it('el primer snapshot (mes 0) es el capital inicial', () => {
    const result = calcularDCA({
      capitalInicial: 8000,
      aporteMensual: 300,
      horizonte: 6,
      tasaAnual: 0.05,
    })
    expect(result.snapshots[0].mes).toBe(0)
    expect(result.snapshots[0].valorTotal).toBe(8000)
    expect(result.snapshots[0].ganancia).toBe(0)
  })

  it('snapshots están ordenados por mes ascendente', () => {
    const result = calcularDCA({
      capitalInicial: 1000,
      aporteMensual: 100,
      horizonte: 12,
      tasaAnual: 0.08,
    })
    for (let i = 1; i < result.snapshots.length; i++) {
      expect(result.snapshots[i].mes).toBe(i)
      expect(result.snapshots[i].valorTotal).toBeGreaterThan(result.snapshots[i - 1].valorTotal)
    }
  })

  it('rentabilidadTotal es porcentaje sobre lo aportado', () => {
    const result = calcularDCA({
      capitalInicial: 10000,
      aporteMensual: 0,
      horizonte: 12,
      tasaAnual: 0.12,
    })
    const esperado = (result.ganancia / result.totalAportado) * 100
    expect(result.rentabilidadTotal).toBeCloseTo(esperado, 1)
  })
})

// ─── calcularTasaPortafolio ───────────────────────────────────────

describe('calcularTasaPortafolio', () => {
  it('portafolio 100% bonds devuelve tasa de bonds', () => {
    const allocation: PortfolioAllocation = { bonds: 1, dividends: 0, stocks: 0 }
    expect(calcularTasaPortafolio(allocation)).toBeCloseTo(TASAS_ESTIMADAS.bonds)
  })

  it('portafolio 100% stocks devuelve tasa de stocks', () => {
    const allocation: PortfolioAllocation = { bonds: 0, dividends: 0, stocks: 1 }
    expect(calcularTasaPortafolio(allocation)).toBeCloseTo(TASAS_ESTIMADAS.stocks)
  })

  it('portafolio mixto devuelve promedio ponderado', () => {
    const allocation: PortfolioAllocation = { bonds: 0.5, dividends: 0.3, stocks: 0.2 }
    const esperado =
      0.5 * TASAS_ESTIMADAS.bonds +
      0.3 * TASAS_ESTIMADAS.dividends +
      0.2 * TASAS_ESTIMADAS.stocks
    expect(calcularTasaPortafolio(allocation)).toBeCloseTo(esperado)
  })
})

// ─── sugerirAsignacion ────────────────────────────────────────────

describe('sugerirAsignacion', () => {
  const perfil = (horizonte: number): UserProfile => ({
    excedente: 10000,
    reserva: 3000,
    aporteMensual: 500,
    horizonte,
  })

  it('horizonte corto (6 meses) → conservador (bonds >= 0.8)', () => {
    const { bonds } = sugerirAsignacion(perfil(6))
    expect(bonds).toBeGreaterThanOrEqual(0.8)
  })

  it('horizonte mediano (24 meses) → moderado', () => {
    const { bonds, dividends, stocks } = sugerirAsignacion(perfil(24))
    expect(bonds).toBeGreaterThanOrEqual(0.5)
    expect(dividends).toBeGreaterThan(0)
    expect(stocks).toBeGreaterThan(0)
  })

  it('horizonte largo (48 meses) → balanceado', () => {
    const { stocks } = sugerirAsignacion(perfil(48))
    expect(stocks).toBeGreaterThanOrEqual(0.2)
  })

  it('horizonte muy largo (120 meses) → stocks >= 0.4', () => {
    const { stocks } = sugerirAsignacion(perfil(120))
    expect(stocks).toBeGreaterThanOrEqual(0.4)
  })

  it('la suma de asignaciones siempre es 1', () => {
    const horizontes = [6, 12, 24, 36, 60, 120]
    for (const h of horizontes) {
      const { bonds, dividends, stocks } = sugerirAsignacion(perfil(h))
      expect(bonds + dividends + stocks).toBeCloseTo(1)
    }
  })
})

// ─── simularPortafolio ────────────────────────────────────────────

describe('simularPortafolio', () => {
  it('retorna resultado con tasa ponderada del portafolio', () => {
    const profile: UserProfile = {
      excedente: 10000,
      reserva: 2000,
      aporteMensual: 300,
      horizonte: 12,
    }
    const allocation: PortfolioAllocation = { bonds: 0.7, dividends: 0.2, stocks: 0.1 }
    const result = simularPortafolio(profile, allocation)

    expect(result.valorFinal).toBeGreaterThan(profile.excedente)
    expect(result.tasaAnual).toBeCloseTo(calcularTasaPortafolio(allocation))
    expect(result.snapshots).toHaveLength(profile.horizonte + 1)
  })
})
