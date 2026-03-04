// ============================================================
// Tipos base de Kasane
// ============================================================

// --- Auth ---
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

// --- UI ---
export type ButtonVariant = 'primary' | 'secondary' | 'alert'
export type BadgeVariant = 'growth' | 'alert' | 'neutral'
export type InstrumentType = 'bonds' | 'dividends' | 'stocks'

// --- Onboarding ---
export type MetaId =
  | 'viaje' | 'formacion' | 'equipo'
  | 'fondo_emergencia' | 'startup' | 'libertad'
  | 'vivienda' | 'familia' | 'crecer'

export interface OnboardingProfile {
  perfil: 'freelancer' | 'emprendedor'
  pais: 'CL' | 'global'
  aporteMensual: number // cuánto puede invertir por mes
  horizonte: number    // meses (6 | 12 | 24 | 36)
  genero?: 'M' | 'F' | null // opcional — personaliza copy (neuromarketing)
  meta?: MetaId | null      // opcional — personaliza orden e instrumentos recomendados
}

// --- Usuario ---
export interface UserProfile {
  excedente: number
  reserva: number
  aporteMensual: number
  horizonte: number // meses
}

// --- Inversiones ---
export interface InvestmentInstrument {
  symbol: string
  name: string
  type: InstrumentType
  description: string
  price: number
  change: number
  changePercent: number
}

export interface PortfolioAllocation {
  bonds: number // ej: 0.7 = 70%
  dividends: number
  stocks: number
}

// --- APIs ---
export interface FinnhubQuote {
  c: number // current price
  d: number // change
  dp: number // change percent
  h: number // high
  l: number // low
  o: number // open
  pc: number // previous close
}

export interface QuoteResponse {
  symbol: string
  price: number
  change: number
  changePercent: number
}

// --- Alpha Vantage ---
export interface AVDailyPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface AVFundamentals {
  symbol: string
  name: string
  description: string
  assetType: string
  dividendYield: number
  dividendPerShare: number
  marketCap: number
  week52High: number
  week52Low: number
  lastUpdated: string
}

// --- Cálculos ---
export interface DCAResult {
  valorFinal: number
  totalAportado: number
  ganancia: number
  rentabilidadTotal: number
}

// --- Trading Simulado (Kasane Lab 🧪) ---
// Tipos para el módulo pedagógico de compra/venta de acciones simuladas.
// No representan dinero real — todo es un entorno de práctica.

/** Tipo de operación: compra o venta */
export type TradeAction = 'buy' | 'sell'

/**
 * Registro de una orden ejecutada (compra o venta).
 * Se persiste en Firestore como documento inmutable en la
 * sub-colección `users/{uid}/trades`.
 */
export interface TradeOrder {
  /** ID generado por Firestore al persistir */
  id?: string
  /** Ticker del instrumento (ej: 'AAPL') */
  symbol: string
  /** Nombre legible del instrumento (ej: 'Apple') */
  name: string
  /** Tipo de operación */
  action: TradeAction
  /** Cantidad de acciones operadas */
  quantity: number
  /** Precio USD en el momento de la operación */
  priceAtOrder: number
  /** Costo o ingreso total: quantity × priceAtOrder */
  totalUSD: number
  /** Timestamp de Firestore (serverTimestamp al crear) */
  createdAt?: any
}

/**
 * Posición abierta del usuario en un instrumento.
 * Almacenada dentro de `TradingAccount.holdings`.
 * El precio promedio se recalcula con cada compra adicional
 * usando promedio ponderado.
 */
export interface TradingHolding {
  /** Ticker del instrumento */
  symbol: string
  /** Nombre legible */
  name: string
  /** Cantidad total de acciones en posesión */
  quantity: number
  /**
   * Precio promedio ponderado de compra.
   * Se usa para calcular el P&L (ganancia/pérdida) de la posición.
   * Fórmula: (avgAnterior × qtyAnterior + precioNuevo × qtyNueva) / totalQty
   */
  avgBuyPrice: number
}

/**
 * Estado de la cuenta de trading simulado del usuario.
 * Se persiste como documento único en `users/{uid}/data/tradingAccount`.
 * Se inicializa con `cashUSD = INITIAL_CAPITAL ($10,000)` si no existe.
 */
export interface TradingAccount {
  /** Saldo disponible en USD para nuevas compras */
  cashUSD: number
  /** Lista de posiciones abiertas actualmente */
  holdings: TradingHolding[]
  /** Timestamp de la última actualización */
  updatedAt?: any
}
