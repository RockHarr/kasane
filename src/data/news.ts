export interface KasaneNewsItem {
  id: string
  title: string
  summary: string
  /** Solo presente en artículos curados (contenido propio). */
  content?: string
  /** URL externa. Si está presente, "Leer más" abre en nueva pestaña. */
  url?: string
  /** Nombre del medio de origen (ej: "Diario Financiero"). */
  source?: string
  date: string
  category: 'Educación' | 'Mercado' | 'Psicología' | 'Emprendimiento' | 'Economía'
  readTime: number // en minutos
}

export const mockNews: KasaneNewsItem[] = [
  {
    id: 'n1',
    title: 'El poder del interés compuesto y la paciencia',
    summary: 'Descubre por qué empezar temprano es más importante que empezar con mucho dinero.',
    content:
      'El secreto mejor guardado de las finanzas personales no es acertar qué acción subirá mañana, sino la consistencia. Cuando inviertes montos pequeños periódicamente, no solo ganas intereses sobre tu capital principal, sino también intereses sobre los intereses generados. En periodos de 10 a 20 años, este efecto de "bola de nieve" compone la mayor parte de tu patrimonio.',
    date: '2024-05-12',
    category: 'Educación',
    readTime: 3,
  },
  {
    id: 'n2',
    title: 'Por qué ignorar el "ruido" del mercado te hace mejor inversor',
    summary:
      'Las noticias catastrofistas venden, pero destruir tu plan DCA a causa de ellas arruinará tus retornos.',
    content:
      'Cada semana habrá un nuevo "Gurú" prediciendo el colapso inminente de la economía. El problema es que si reaccionas a estas noticias pausando tu estrategia Constante (DCA), estadísticamente te perderás los mejores días de recuperación del mercado. La historia demuestra que la bolsa americana (S&P500) se ha sobrepuesto a crisis hipotecarias, pandemias y guerras mundiales.',
    date: '2024-05-18',
    category: 'Psicología',
    readTime: 4,
  },
  {
    id: 'n3',
    title: 'Riesgo y Volatilidad: No son lo mismo',
    summary:
      'Aprende a diferenciar el riesgo de pérdida permanente de capital vs. las fluctuaciones normales.',
    content:
      'Es vital cambiar nuestra definición de Riesgo. La volatilidad (que el precio suba y baje abruptamente) es el "precio de entrada" que pagamos por retornos superiores a la inflación. Riesgo real no es que tu portafolio baje 10% un mes, riesgo real es que tu dinero en efectivo pierda poder adquisitivo cada año frente a la inflación o que vendas tus activos por pánico en el peor momento posible.',
    date: '2024-06-02',
    category: 'Educación',
    readTime: 5,
  },
  {
    id: 'n4',
    title: 'El mito del "Market Timing"',
    summary:
      'Estudios confirman que intentar predecir los techos y suelos del mercado es financieramente destructivo.',
    content:
      'Incluso si tuvieras una máquina del tiempo y lograras invertir exactamente en el punto más bajo de cada crisis durante los últimos 40 años, tus retornos serían sólo marginalmente superiores a los de alguien que invirtió una cantidad constante el mismo día de cada mes (Método DCA). El esfuerzo emocional del "Market Timing" no justifica el retorno.',
    date: '2024-06-15',
    category: 'Mercado',
    readTime: 3,
  },
]
