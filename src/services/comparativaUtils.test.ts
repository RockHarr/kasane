import { describe, it, expect } from 'vitest'
import { getTitulo, getComparativaSub, getTipTexto, formatCLP } from './comparativaUtils'

// ─── getTitulo ────────────────────────────────────────────────────

describe('getTitulo', () => {
  it('sin meta devuelve título genérico', () => {
    expect(getTitulo(null)).toBe('¿Qué puedes lograr?')
  })

  it('meta "viaje" incluye label e emoji', () => {
    const result = getTitulo('viaje')
    expect(result).toContain('viaje')
    expect(result).toContain('✈️')
  })

  it('meta "libertad" incluye label e emoji', () => {
    const result = getTitulo('libertad')
    expect(result).toContain('libertad')
    expect(result).toContain('🌎')
  })

  it('todas las metas válidas devuelven string personalizado', () => {
    const metas = ['viaje', 'formacion', 'equipo', 'fondo_emergencia', 'startup', 'libertad', 'vivienda', 'familia', 'crecer'] as const
    for (const meta of metas) {
      expect(getTitulo(meta)).not.toBe('¿Qué puedes lograr?')
    }
  })
})

// ─── getComparativaSub ────────────────────────────────────────────

describe('getComparativaSub', () => {
  const aporte = 300000

  // Femenino
  it('F + h≤6: copy seguridad/descanso', () => {
    expect(getComparativaSub('F', 6, aporte)).toContain('aunque tú descanses')
  })

  it('F + h=12: copy mérito personal', () => {
    expect(getComparativaSub('F', 12, aporte)).toContain('lo que mereces')
  })

  it('F + h=24: copy diseño de vida', () => {
    expect(getComparativaSub('F', 24, aporte)).toContain('vida que diseñas')
  })

  it('F + h=36: cae en rama h≥24 (diseño de vida)', () => {
    expect(getComparativaSub('F', 36, aporte)).toContain('vida que diseñas')
  })

  // Masculino
  it('M + h≤6: copy resultado concreto', () => {
    expect(getComparativaSub('M', 6, aporte)).toContain('resultados concretos')
  })

  it('M + h=12: copy portafolio toma forma', () => {
    expect(getComparativaSub('M', 12, aporte)).toContain('portafolio tomar forma')
  })

  it('M + h=24: copy motor que trabaja solo', () => {
    expect(getComparativaSub('M', 24, aporte)).toContain('motor que trabaja solo')
  })

  it('M + h=36: cae en rama h≥24 (motor)', () => {
    expect(getComparativaSub('M', 36, aporte)).toContain('motor que trabaja solo')
  })

  // Sin género
  it('null + cualquier horizonte: fallback genérico', () => {
    expect(getComparativaSub(null, 12, aporte)).toContain('cada opción te daría')
    expect(getComparativaSub(null, 6, aporte)).toContain('cada opción te daría')
    expect(getComparativaSub(null, 24, aporte)).toContain('cada opción te daría')
  })

  // El monto formateado aparece en el texto
  it('incluye el monto formateado en la frase', () => {
    const result = getComparativaSub('M', 12, 500000)
    expect(result).toContain('$')
  })

  // El plazo aparece en el texto
  it('horizonte 12 → "1 año" en la frase', () => {
    expect(getComparativaSub(null, 12, aporte)).toContain('1 año')
  })

  it('horizonte 24 → "2 años" en la frase', () => {
    expect(getComparativaSub(null, 24, aporte)).toContain('2 años')
  })
})

// ─── getTipTexto ──────────────────────────────────────────────────

describe('getTipTexto', () => {
  it('liquidez: menciona Tenpo y MercadoPago', () => {
    const tip = getTipTexto('liquidez')
    expect(tip).toContain('Tenpo')
    expect(tip).toContain('MercadoPago')
  })

  it('rentabilidad: menciona Fintual', () => {
    expect(getTipTexto('rentabilidad')).toContain('Fintual')
  })

  it('potencial: menciona VTI', () => {
    expect(getTipTexto('potencial')).toContain('VTI')
  })

  it('null (sin meta): tip genérico primera vez', () => {
    const tip = getTipTexto(null)
    expect(tip).toContain('primera vez')
    expect(tip).toContain('Tenpo')
  })

  it('todos los tips empiezan con 💡', () => {
    const categorias = ['liquidez', 'rentabilidad', 'potencial', null] as const
    for (const cat of categorias) {
      expect(getTipTexto(cat)).toMatch(/^💡/)
    }
  })
})

// ─── formatCLP ────────────────────────────────────────────────────

describe('formatCLP', () => {
  it('prefija con $', () => {
    expect(formatCLP(1000)).toMatch(/^\$/)
  })

  it('redondea decimales', () => {
    expect(formatCLP(999.9)).toBe(formatCLP(1000))
  })

  it('formatea con separador de miles (punto chileno)', () => {
    // es-CL usa punto como separador de miles
    expect(formatCLP(1000000)).toContain('.')
  })
})
