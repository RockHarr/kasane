// ============================================================
// Tipos base de Tesorería Simple
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
  bonds: number     // ej: 0.7 = 70%
  dividends: number
  stocks: number
}

// --- APIs ---
export interface FinnhubQuote {
  c: number   // current price
  d: number   // change
  dp: number  // change percent
  h: number   // high
  l: number   // low
  o: number   // open
  pc: number  // previous close
}

export interface QuoteResponse {
  symbol: string
  price: number
  change: number
  changePercent: number
}

// --- Cálculos ---
export interface DCAResult {
  valorFinal: number
  totalAportado: number
  ganancia: number
  rentabilidadTotal: number
}
