import type { UserProfile, PortfolioAllocation, DCAResult } from '@/types'

// ─── Tipos internos ───────────────────────────────────────────────

export interface DCAInput {
  capitalInicial: number    // excedente disponible hoy
  aporteMensual: number     // aporte mensual
  horizonte: number         // meses
  tasaAnual: number         // rendimiento anual estimado (ej: 0.08 = 8%)
}

export interface DCAMonthSnapshot {
  mes: number
  valorTotal: number
  totalAportado: number
  ganancia: number
}

export interface DCAResultDetailed extends DCAResult {
  snapshots: DCAMonthSnapshot[]   // valor mes a mes (para gráfica)
  tasaAnual: number
}

// ─── Cálculo DCA mes a mes ────────────────────────────────────────

/**
 * Simula Dollar Cost Averaging con interés compuesto mensual.
 * Fórmula: cada mes se aplica la tasa mensual al valor total y se suma el aporte.
 */
export function calcularDCA(input: DCAInput): DCAResultDetailed {
  const { capitalInicial, aporteMensual, horizonte, tasaAnual } = input
  const tasaMensual = tasaAnual / 12

  let valorTotal = capitalInicial
  let totalAportado = capitalInicial
  const snapshots: DCAMonthSnapshot[] = []

  // Snapshot inicial (mes 0)
  snapshots.push({
    mes: 0,
    valorTotal: capitalInicial,
    totalAportado: capitalInicial,
    ganancia: 0,
  })

  for (let mes = 1; mes <= horizonte; mes++) {
    // Aplicar interés compuesto mensual
    valorTotal = valorTotal * (1 + tasaMensual)
    // Sumar aporte mensual
    valorTotal += aporteMensual
    totalAportado += aporteMensual

    snapshots.push({
      mes,
      valorTotal: round(valorTotal),
      totalAportado: round(totalAportado),
      ganancia: round(valorTotal - totalAportado),
    })
  }

  const ganancia = valorTotal - totalAportado
  const rentabilidadTotal = totalAportado > 0 ? (ganancia / totalAportado) * 100 : 0

  return {
    valorFinal: round(valorTotal),
    totalAportado: round(totalAportado),
    ganancia: round(ganancia),
    rentabilidadTotal: round(rentabilidadTotal),
    snapshots,
    tasaAnual,
  }
}

// ─── Tasas estimadas por tipo de instrumento ──────────────────────

export const TASAS_ESTIMADAS: Record<string, number> = {
  bonds: 0.045,       // ~4.5% anual (bonos conservadores)
  dividends: 0.07,    // ~7% anual (ETFs de dividendos)
  stocks: 0.10,       // ~10% anual (acciones/growth)
}

/**
 * Calcula la tasa de rendimiento esperada del portafolio
 * ponderando la asignación de cada tipo de instrumento.
 */
export function calcularTasaPortafolio(allocation: PortfolioAllocation): number {
  return (
    allocation.bonds * TASAS_ESTIMADAS.bonds +
    allocation.dividends * TASAS_ESTIMADAS.dividends +
    allocation.stocks * TASAS_ESTIMADAS.stocks
  )
}

/**
 * Simula el DCA completo del portafolio del usuario.
 */
export function simularPortafolio(
  profile: UserProfile,
  allocation: PortfolioAllocation
): DCAResultDetailed {
  const tasaAnual = calcularTasaPortafolio(allocation)

  return calcularDCA({
    capitalInicial: profile.excedente,
    aporteMensual: profile.aporteMensual,
    horizonte: profile.horizonte,
    tasaAnual,
  })
}

// ─── Helpers ──────────────────────────────────────────────────────

function round(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals
}

/**
 * Sugerencia de asignación de portafolio según horizonte e perfil.
 * Regla simple: a mayor horizonte, más exposición a acciones.
 */
export function sugerirAsignacion(profile: UserProfile): PortfolioAllocation {
  const { horizonte } = profile

  if (horizonte <= 12) {
    // Corto plazo: conservador
    return { bonds: 0.80, dividends: 0.15, stocks: 0.05 }
  } else if (horizonte <= 36) {
    // Mediano plazo: moderado
    return { bonds: 0.60, dividends: 0.25, stocks: 0.15 }
  } else if (horizonte <= 60) {
    // Largo plazo: balanceado
    return { bonds: 0.40, dividends: 0.35, stocks: 0.25 }
  } else {
    // Muy largo plazo: crecimiento
    return { bonds: 0.20, dividends: 0.40, stocks: 0.40 }
  }
}

// ─── Mix comparativo ──────────────────────────────────────────

import type { InstrumentMix } from '@/data/instruments'
import { findInstrumento } from '@/data/instruments'

// Tipo local para ApexAxisChartSeries (evita importar el paquete apexcharts completo)
type ApexAxisChartSeries = { name: string; data: (number | null)[]; color?: string }[]

/**
 * Calcula la proyección comparativa de un mix de instrumentos.
 *
 * Para cada instrumento activo corre calcularDCA() con el capital y el
 * aporte proporcionales a su porcentaje, luego extrae únicamente los
 * snapshots en los hitos solicitados.
 *
 * @param capital - Capital inicial total del usuario (USD)
 * @param aporteMensual - Aporte mensual total del usuario (USD)
 * @param mix - Pares { instrumentId, porcentaje }; sum(porcentaje) debe ser 100
 * @param horizontes - Meses en los que se quieren puntos (ej: [12, 24, 36])
 *   Regla de negocio: valores < 3 se filtran automáticamente (90 días mínimo)
 * @returns Series en formato ApexAxisChartSeries listas para ApexCharts
 * @throws {Error} Si el mix está vacío, los horizontes son todos < 3, o un id no existe
 */
export function calcularMix(
  capital: number,
  aporteMensual: number,
  mix: InstrumentMix[],
  horizontes: number[],
): ApexAxisChartSeries {
  // Regla de negocio: los instrumentos disponibles no tienen rendimiento
  // perceptible antes de los 90 días, filtrar cualquier horizonte menor.
  const horizontesValidos = [...horizontes].filter(h => h >= 3).sort((a, b) => a - b)

  if (horizontesValidos.length === 0) {
    throw new Error('calcularMix: horizontes debe tener al menos un valor >= 3')
  }

  const mixActivo = mix.filter(m => m.porcentaje > 0)

  if (mixActivo.length === 0) {
    throw new Error('calcularMix: el mix no tiene instrumentos con porcentaje > 0')
  }

  const horizonteMaximo = Math.max(...horizontesValidos)
  const series: ApexAxisChartSeries = []

  for (const item of mixActivo) {
    const instrumento = findInstrumento(item.instrumentId)
    if (!instrumento) {
      throw new Error(`calcularMix: instrumento '${item.instrumentId}' no encontrado en el catálogo`)
    }

    // Asignar capital y aporte proporcionales al porcentaje del mix
    const capitalAsignado = capital * (item.porcentaje / 100)
    const aporteAsignado = aporteMensual * (item.porcentaje / 100)

    // DCA completo hasta el horizonte máximo solicitado
    const resultado = calcularDCA({
      capitalInicial: capitalAsignado,
      aporteMensual: aporteAsignado,
      horizonte: horizonteMaximo,
      tasaAnual: instrumento.tasaAnual,
    })

    // Extraer solo los puntos de los hitos, respetando el horizonte
    // mínimo declarado por el instrumento (ej: Fintual = 6 meses).
    const minimoEfectivo = Math.max(3, instrumento.horizonteMinimo)
    const data = horizontesValidos.map(h => {
      if (h < minimoEfectivo) return null
      const snap = resultado.snapshots.find(s => s.mes === h)
      return snap ? round(snap.valorTotal) : null
    })

    series.push({
      name: instrumento.name,
      data,
      color: instrumento.color,
    })
  }

  return series
}

