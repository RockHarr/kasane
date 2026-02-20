// ============================================================
// Catálogo de instrumentos financieros — Tesorería Simple v0.2.0
//
// Decisión de diseño: los tipos de este módulo son distintos a
// InvestmentInstrument (src/types/index.ts), que representa datos
// de mercado en tiempo real (precio, cambio %). Aquí los datos
// son curados/estáticos y sirven para proyecciones DCA.
// ============================================================

// ─── Tipos ────────────────────────────────────────────────────

/** Descriptor de un instrumento financiero del catálogo. */
export interface Instrument {
  /** Identificador único: 'tenpo' | 'mercadopago' | 'fintual' | 'agg' | 'vti' */
  id: string
  /** Nombre para mostrar en la UI */
  name: string
  /** Descripción breve sin jerga financiera */
  descripcion: string
  /** Tasa de rendimiento anual estimada (ej: 0.07 = 7%) */
  tasaAnual: number
  /**
   * Fuente del dato: 'curado' = tasa fija manual basada en históricos;
   * 'api' = tasa obtenida desde Finnhub u otra fuente externa.
   */
  tipo: 'curado' | 'api'
  /** Ticker para instrumentos vía API (ej: 'AGG', 'VTI') */
  ticker?: string
  /**
   * Límite máximo invertible en USD. Algunos cuentas de liquidez
   * tienen un tope de rentabilidad premium (ej: Tenpo ~$5M CLP ≈ $5,500 USD).
   */
  limiteUSD?: number
  /** Color de la línea en el gráfico comparativo (hex) */
  color: string
  /** Nivel de riesgo para mostrar badge informativo */
  riesgo: 'bajo' | 'medio' | 'alto'
  /**
   * Horizonte mínimo razonable en meses.
   * Regla global: ningún instrumento se muestra antes de los 3 meses (90 días)
   * porque la rentabilidad anualizada no es perceptible ni comparable antes.
   * Algunos instrumentos (ej: fondos mutuos) recomiendan mínimo 6 meses
   * porque la volatilidad a corto plazo es ruido, no señal.
   */
  horizonteMinimo: number
  /**
   * URL de referido del operador de la app (campo futuro).
   * Solo se muestra en UI si está definido. No invasivo.
   */
  referidoUrl?: string
}

/**
 * Participación de un instrumento en el mix del usuario.
 * La suma de todos los InstrumentMix activos debe ser exactamente 100.
 */
export interface InstrumentMix {
  instrumentId: string
  /** 0–100. Los porcentajes del mix completo deben sumar 100 exactamente. */
  porcentaje: number
}

// ─── Catálogo ─────────────────────────────────────────────────

/**
 * Catálogo curado de instrumentos disponibles para el simulador de mix.
 *
 * Tasas anuales: todas son estimaciones basadas en datos históricos
 * y no constituyen garantía de rendimiento futuro. Deben revisarse
 * periódicamente (sugerido: trimestral).
 *
 * Fuentes:
 * - Tenpo Control: rendimiento publicado en app (~7% TNA, feb 2025)
 * - MercadoPago: tasa Cuenta Mercado Pago (~8% TNA, feb 2025)
 * - Fintual Moderado: retorno histórico anualizado "Risky Norris" (~8%)
 * - ETF AGG: retorno histórico 10 años iShares Core US Aggregate Bond (~4.5%)
 * - ETF VTI: retorno histórico 10 años Vanguard Total Stock Market (~10%)
 */
export const INSTRUMENTOS: Instrument[] = [
  {
    id: 'tenpo',
    name: 'Tenpo Control',
    descripcion:
      'Cuenta de ahorro digital. Tu plata queda disponible y genera interés todos los días.',
    tasaAnual: 0.07,
    tipo: 'curado',
    color: '#00FF88',
    riesgo: 'bajo',
    horizonteMinimo: 3,
    // ~$5.000.000 CLP ≈ USD 5.500 (tipo de cambio referencial feb 2025)
    limiteUSD: 5500,
  },
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    descripcion:
      'Cuenta remunerada con liquidez inmediata. El dinero trabaja mientras no lo usas.',
    tasaAnual: 0.08,
    tipo: 'curado',
    color: '#3B82F6',
    riesgo: 'bajo',
    horizonteMinimo: 3,
  },
  {
    id: 'fintual',
    name: 'Fintual Moderado',
    descripcion:
      'Fondo mutuo diversificado. Más rendimiento que una cuenta de ahorro, con algo más de variación.',
    tasaAnual: 0.08,
    tipo: 'curado',
    color: '#A855F7',
    riesgo: 'medio',
    // Los fondos mutuos tienen costos de entrada/salida y volatilidad mensual
    // que hacen del corto plazo una señal de ruido, no de rendimiento.
    horizonteMinimo: 6,
  },
  {
    id: 'agg',
    name: 'ETF AGG',
    descripcion:
      'Fondo de bonos americanos de alta calidad. Estable, ideal para proteger capital.',
    tasaAnual: 0.045,
    tipo: 'api',
    ticker: 'AGG',
    color: '#F59E0B',
    riesgo: 'bajo',
    horizonteMinimo: 3,
  },
  {
    id: 'vti',
    name: 'ETF VTI',
    descripcion:
      'Fondo que replica el mercado bursátil de EE.UU. completo. Alto potencial a largo plazo.',
    tasaAnual: 0.10,
    tipo: 'api',
    ticker: 'VTI',
    color: '#EF4444',
    riesgo: 'alto',
    horizonteMinimo: 3,
  },
]

// ─── Helpers ──────────────────────────────────────────────────

/** Busca un instrumento por su id. Retorna undefined si no existe. */
export function findInstrumento(id: string): Instrument | undefined {
  return INSTRUMENTOS.find(i => i.id === id)
}

/**
 * Genera el array de horizontes a partir del paso seleccionado por el usuario.
 * El rango siempre es de 3 a 36 meses.
 *
 * @param paso - Granularidad: 3, 6 o 12 meses
 * @returns Array de meses [paso, paso*2, ..., 36]
 *
 * @example
 * generarHorizontes(12) // → [12, 24, 36]
 * generarHorizontes(6)  // → [6, 12, 18, 24, 30, 36]
 * generarHorizontes(3)  // → [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
 */
export function generarHorizontes(paso: 3 | 6 | 12): number[] {
  const horizontes: number[] = []
  for (let m = paso; m <= 36; m += paso) {
    horizontes.push(m)
  }
  return horizontes
}
