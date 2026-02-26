/**
 * Utilidades de formateo para la aplicación
 */

/**
 * Formatea un número como moneda (CLP por defecto).
 * Se remueven los decimales ya que en CLP no se usan comúnmente en montos grandes.
 *
 * @param value Monto a formatear
 * @param currency Código de moneda ISO 4217 (default: 'CLP')
 * @returns String formateado (ej. "$ 5.000.000")
 */
export function formatCurrency(value: number, currency = 'CLP'): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0, // CLP no suele usar decimales
    }).format(value)
}

/**
 * Formatea un número como porcentaje
 *
 * @param value Porcentaje decimal (ej. 0.08)
 * @param fractionDigits Cantidad de decimales (default: 1)
 * @returns String formateado (ej. "8.0%")
 */
export function formatPercent(value: number, fractionDigits = 1): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value)
}
