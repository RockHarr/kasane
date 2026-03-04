// ============================================================
// Catálogo de instrumentos del Kasane Trading Lab 🧪
// Metadata estática — los precios NO vienen de aquí.
// ============================================================

export interface AccionCatalogo {
    symbol: string
    name: string
    sector: string
    color: string
    riesgo: 'medio' | 'alto' | 'muy alto'
    emoji: string
    /** Precio base en USD para generar el mock animado */
    priceBase: number
    /** Logo via Google Favicon API — gratis, sin API key, siempre disponible */
    logoUrl: string
}

export const ACCIONES_TRADEABLE: AccionCatalogo[] = [
    {
        symbol: 'AAPL',
        name: 'Apple',
        sector: 'Tech',
        riesgo: 'medio',
        color: '#A8B5C9',
        emoji: '🍎',
        priceBase: 182,
        logoUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA',
        sector: 'Tech',
        riesgo: 'muy alto',
        color: '#76B900',
        emoji: '🎮',
        priceBase: 875,
        logoUrl: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',
    },
    {
        symbol: 'TSLA',
        name: 'Tesla',
        sector: 'Tech',
        riesgo: 'muy alto',
        color: '#CC0000',
        emoji: '⚡',
        priceBase: 177,
        logoUrl: 'https://www.google.com/s2/favicons?domain=tesla.com&sz=128',
    },
    {
        symbol: 'META',
        name: 'Meta',
        sector: 'Social',
        riesgo: 'alto',
        color: '#0866FF',
        emoji: '📘',
        priceBase: 504,
        logoUrl: 'https://www.google.com/s2/favicons?domain=meta.com&sz=128',
    },
    {
        symbol: 'AMZN',
        name: 'Amazon',
        sector: 'Tech',
        riesgo: 'alto',
        color: '#FF9900',
        emoji: '📦',
        priceBase: 214,
        logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128',
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft',
        sector: 'Tech',
        riesgo: 'medio',
        color: '#00A4EF',
        emoji: '🪟',
        priceBase: 415,
        logoUrl: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
    },
    {
        symbol: 'GOOGL',
        name: 'Alphabet',
        sector: 'Tech',
        riesgo: 'medio',
        color: '#4285F4',
        emoji: '🔍',
        priceBase: 175,
        logoUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
    },
    {
        symbol: 'VTI',
        name: 'ETF VTI',
        sector: 'ETF',
        riesgo: 'medio',
        color: '#EF4444',
        emoji: '📊',
        priceBase: 252,
        logoUrl: 'https://www.google.com/s2/favicons?domain=vanguard.com&sz=128',
    },
    {
        symbol: 'AGG',
        name: 'ETF AGG',
        sector: 'ETF',
        riesgo: 'medio',
        color: '#F59E0B',
        emoji: '🏦',
        priceBase: 97,
        logoUrl: 'https://www.google.com/s2/favicons?domain=ishares.com&sz=128',
    },
]

/** Busca una acción por símbolo. Retorna undefined si no existe. */
export function findAccion(symbol: string): AccionCatalogo | undefined {
    return ACCIONES_TRADEABLE.find(a => a.symbol === symbol)
}
