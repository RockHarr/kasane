/**
 * comparativaUtils.ts
 * Funciones puras de copy y presentación para ComparativaInstrumentos.
 * Extraídas del componente para ser testables independientemente.
 */

import type { MetaId } from '@/types'
import { METAS } from '@/data/metas'

/**
 * Constantes de horizontes temporales (en meses)
 */
const HORIZONTES = {
  CORTO: 6,
  MEDIO: 12,
  LARGO: 24,
  MUY_LARGO: 36,
} as const

/**
 * Labels de plazo por horizonte
 */
const LABELS_PLAZO: Record<number, string> = {
  [HORIZONTES.CORTO]: '6 meses',
  [HORIZONTES.MEDIO]: '1 año',
  [HORIZONTES.LARGO]: '2 años',
  [HORIZONTES.MUY_LARGO]: '3 años',
}

/**
 * Título de la sección comparativa.
 * Sin meta → genérico; con meta → personalizado con emoji.
 */
export function getTitulo(meta: MetaId | null): string {
  if (!meta) return '¿Qué puedes lograr?'
  const m = METAS.find(x => x.id === meta)
  return m ? `Para tu ${m.label.toLowerCase()} ${m.emoji}` : '¿Qué puedes lograr?'
}

/**
 * Subtítulo personalizado por género × horizonte (neuromarketing Klaric).
 * F + corto: seguridad/descanso.
 * F + medio: mérito personal.
 * F + largo: libertad/diseño de vida.
 * M + corto: resultado concreto.
 * M + medio: portafolio toma forma.
 * M + largo: motor que trabaja solo.
 * null: fallback genérico.
 */
export function getComparativaSub(
  genero: 'M' | 'F' | null,
  horizonte: number,
  aporteMensual: number
): string {
  const monto = formatCLP(aporteMensual)
  const plazo =
    horizonte <= HORIZONTES.CORTO ? LABELS_PLAZO[HORIZONTES.CORTO] :
    horizonte === HORIZONTES.MEDIO ? LABELS_PLAZO[HORIZONTES.MEDIO] :
    horizonte === HORIZONTES.LARGO ? LABELS_PLAZO[HORIZONTES.LARGO] :
    LABELS_PLAZO[HORIZONTES.MUY_LARGO]

  if (genero === 'F' && horizonte <= HORIZONTES.CORTO)
    return `Con ${monto}/mes durante ${plazo}, tu dinero trabaja aunque tú descanses:`
  if (genero === 'F' && horizonte === HORIZONTES.MEDIO)
    return `Con ${monto}/mes durante ${plazo}, cada mes es una capa más hacia lo que mereces:`
  if (genero === 'F' && horizonte >= HORIZONTES.LARGO)
    return `Con ${monto}/mes durante ${plazo}, cada capa te acerca a la vida que diseñas:`
  if (genero === 'M' && horizonte <= HORIZONTES.CORTO)
    return `Con ${monto}/mes durante ${plazo}, resultados concretos en poco tiempo:`
  if (genero === 'M' && horizonte === HORIZONTES.MEDIO)
    return `Con ${monto}/mes durante ${plazo}, en un año ya ves el portafolio tomar forma:`
  if (genero === 'M' && horizonte >= HORIZONTES.LARGO)
    return `Con ${monto}/mes durante ${plazo}, construyes un motor que trabaja solo:`
  return `Con ${monto}/mes durante ${plazo}, cada opción te daría:`
}

/**
 * Texto del tip adaptado a la categoría de instrumento de la meta.
 * Si no hay meta (null) → tip genérico para primera vez.
 */
export function getTipTexto(
  categoriaInstr: 'liquidez' | 'rentabilidad' | 'potencial' | null
): string {
  if (categoriaInstr === 'liquidez')
    return '💡 Para tu meta, Tenpo o MercadoPago son el punto de entrada ideal — sin riesgo, retiras cuando lo necesites.'
  if (categoriaInstr === 'rentabilidad')
    return '💡 Para tu meta a mediano plazo, Fintual es una entrada sólida — más retorno que una cuenta de ahorro, sin complejidad.'
  if (categoriaInstr === 'potencial')
    return '💡 Para tu horizonte largo, considera empezar con Fintual y después explorar VTI cuando te familiarices con la volatilidad.'
  return '💡 Si es tu primera vez, empieza por Tenpo o MercadoPago — sin riesgo, sin mínimo, retiras cuando quieras.'
}

/** Formatea un número a CLP con separador de miles chileno. */
export function formatCLP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CL')
}
