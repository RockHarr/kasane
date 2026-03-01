// Catálogo de metas disponibles en el onboarding S4.
// categoriaInstr define qué tipo de instrumento priorizar en ComparativaInstrumentos.
import type { MetaId } from '@/types'

export interface MetaOption {
  id: MetaId
  emoji: string
  label: string
  sublabel: string
  categoriaInstr: 'liquidez' | 'rentabilidad' | 'potencial'
}

export const METAS: MetaOption[] = [
  {
    id: 'viaje',
    emoji: '✈️',
    label: 'Viaje',
    sublabel: 'Una aventura pendiente',
    categoriaInstr: 'liquidez',
  },
  {
    id: 'formacion',
    emoji: '🎓',
    label: 'Formación',
    sublabel: 'Curso, MBA, certificación',
    categoriaInstr: 'rentabilidad',
  },
  {
    id: 'equipo',
    emoji: '💻',
    label: 'Equipo',
    sublabel: 'Tu estudio profesional',
    categoriaInstr: 'liquidez',
  },
  {
    id: 'fondo_emergencia',
    emoji: '🛡️',
    label: 'Fondo de emergencia',
    sublabel: '3–6 meses de respaldo',
    categoriaInstr: 'liquidez',
  },
  {
    id: 'startup',
    emoji: '💼',
    label: 'Mi proyecto',
    sublabel: 'Capital para el siguiente paso',
    categoriaInstr: 'rentabilidad',
  },
  {
    id: 'libertad',
    emoji: '🌎',
    label: 'Libertad',
    sublabel: 'Dejar de depender de clientes malos',
    categoriaInstr: 'potencial',
  },
  {
    id: 'vivienda',
    emoji: '🏠',
    label: 'Vivienda',
    sublabel: 'Primer depa o mudanza',
    categoriaInstr: 'rentabilidad',
  },
  {
    id: 'familia',
    emoji: '👶',
    label: 'Familia',
    sublabel: 'Proyectos de vida juntos',
    categoriaInstr: 'rentabilidad',
  },
  {
    id: 'crecer',
    emoji: '💰',
    label: 'Crecer',
    sublabel: 'Solo quiero que mi dinero crezca',
    categoriaInstr: 'potencial',
  },
]
