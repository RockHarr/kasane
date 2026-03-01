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
export interface OnboardingProfile {
  perfil: 'freelancer' | 'emprendedor'
  pais: 'CL' | 'global'
  aporteMensual: number // cuánto puede invertir por mes
  horizonte: number    // meses (6 | 12 | 24 | 36)
  genero?: 'M' | 'F' | null // opcional — usado para personalizar copy (neuromarketing)
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
