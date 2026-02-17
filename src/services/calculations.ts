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
