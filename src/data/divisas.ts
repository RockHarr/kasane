// ============================================================
// divisas.ts — Kasane v1.1.0
//
// Tasas de cambio de referencia para conversión educativa CLP↔USD.
// NO usar APIs externas: la exactitud no es crítica para proyecciones
// pedagógicas. Revisar y actualizar trimestralmente.
//
// Para escalar a otros países LATAM: agregar la divisa correspondiente
// y asignarla según el campo `pais` del perfil de usuario.
// ============================================================

/** Tasas de cambio de referencia — actualizar trimestralmente */
export const DIVISAS = {
    /** Pesos chilenos por dólar (ref: mar 2025 ≈ 950 CLP/USD) */
    CLP_POR_USD: 950,
    // Futuras expansiones LATAM:
    // MXN_POR_USD: 17,
    // COP_POR_USD: 4100,
    // PEN_POR_USD: 3.8,
} as const

// ─── Conversores ──────────────────────────────────────────────

/**
 * Convierte un monto en CLP a USD usando la tasa de referencia.
 * Retorna entero redondeado — la exactitud no es el objetivo.
 */
export function clpToUsd(montoCLP: number): number {
    return Math.round(montoCLP / DIVISAS.CLP_POR_USD)
}

/**
 * Convierte un monto en USD a CLP usando la tasa de referencia.
 */
export function usdToClp(montoUSD: number): number {
    return Math.round(montoUSD * DIVISAS.CLP_POR_USD)
}

// ─── Formateadores ────────────────────────────────────────────

/**
 * Formatea un número como moneda CLP.
 * Uso: formatCLP(1500000) → "$1.500.000"
 */
export function formatCLP(n: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(n)
}

/**
 * Formatea un número como moneda USD.
 * Uso: formatUSD(1578) → "$1,578"
 */
export function formatUSD(n: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(n)
}

/**
 * Retorna el texto de equivalencia en USD para un monto CLP.
 * Uso: equivalenciaUSD(500000) → "≈ USD 526"
 */
export function equivalenciaUSD(montoCLP: number): string {
    return `≈ USD ${formatUSD(clpToUsd(montoCLP))}`
}
