import type { KasaneNewsItem } from '@/data/news'

const BASE_URL = 'https://gnews.io/api/v4'
const API_KEY = import.meta.env.VITE_GNEWS_API_KEY as string

// ─── Cache en localStorage ─────────────────────────────────────
// Noticias persisten entre sesiones. TTL 1h — frescura razonable
// sin gastar la cuota gratuita (100 req/día).
const CACHE_KEY = 'kasane_news_cache'
const CACHE_TTL = 60 * 60 * 1000 // 1 hora

interface NewsCache {
  data: KasaneNewsItem[]
  timestamp: number
}

function getCache(): KasaneNewsItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache: NewsCache = JSON.parse(raw)
    if (Date.now() - cache.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return cache.data
  } catch {
    return null
  }
}

function setCache(data: KasaneNewsItem[]) {
  try {
    const cache: NewsCache = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage puede estar lleno o bloqueado — no es crítico
  }
}

// ─── Fuentes confiables ────────────────────────────────────────
// Whitelist de dominios editorialmente relevantes para el usuario
// objetivo: freelancer/emprendedor chileno con foco financiero.
// Filtro aplicado en cliente sobre los resultados recibidos de GNews.
const FUENTES_CONFIABLES = [
  'df.cl',              // Diario Financiero — finanzas Chile
  'latercera.com',      // La Tercera — economía general
  'pulso.cl',           // Pulso — negocios y mercados Chile
  'emol.com',           // Emol — economía general
  'forbes.cl',          // Forbes Chile — emprendimiento y negocios
  'entrepreneur.com',   // Entrepreneur — freelance y emprendimiento LATAM
  'america-retail.com', // América Retail — retail/emprendimiento LATAM
  't13.cl',             // T13 — economía Chile
]

// ─── Tipos de la API GNews ─────────────────────────────────────

interface GNewsArticle {
  title: string
  description: string
  content: string
  url: string
  publishedAt: string // ISO 8601
  source: {
    name: string
    url: string
  }
}

interface GNewsResponse {
  totalArticles: number
  articles: GNewsArticle[]
}

// ─── Helpers ───────────────────────────────────────────────────

function esFuenteConfiable(articleUrl: string): boolean {
  return FUENTES_CONFIABLES.some(dominio => articleUrl.includes(dominio))
}

/** Estima tiempo de lectura desde el snippet disponible (~200 palabras/min). */
function estimarReadTime(text: string): number {
  const palabras = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(palabras / 200))
}

/** Mapea la fecha ISO de GNews a formato legible 'DD MMM YYYY'. */
function formatearFecha(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function mapearArticulo(article: GNewsArticle, index: number): KasaneNewsItem {
  return {
    id: `gnews_${index}_${Date.now()}`,
    title: article.title,
    summary: article.description ?? '',
    url: article.url,
    source: article.source.name,
    date: formatearFecha(article.publishedAt),
    // GNews retorna artículos de categoría business/finance → Economía por defecto.
    // Sin un clasificador propio no podemos distinguir Emprendimiento vs Economía
    // con certeza, así que dejamos Economía como categoría para el feed externo.
    category: 'Economía',
    readTime: estimarReadTime(article.description ?? article.title),
  }
}

// ─── Fetch principal ───────────────────────────────────────────

/**
 * Obtiene noticias de GNews API filtradas por fuentes confiables.
 * Usa dos queries complementarias para maximizar diversidad:
 *   1. Top headlines de negocios en español / Chile
 *   2. Búsqueda por keywords de emprendimiento
 *
 * Cache localStorage 1h — no gasta cuota en cada navegación.
 * Fallback silencioso: si la API falla, retorna array vacío
 * (el componente muestra el contenido curado igualmente).
 */
export async function fetchNoticias(): Promise<KasaneNewsItem[]> {
  // 1. Intentar cache primero
  const cached = getCache()
  if (cached) return cached

  if (!API_KEY) {
    console.warn('[newsService] VITE_GNEWS_API_KEY no configurada — usando solo contenido curado')
    return []
  }

  try {
    // Dos queries para cubrir business + emprendimiento
    const [headlinesRes, emprendimientoRes] = await Promise.allSettled([
      fetch(
        `${BASE_URL}/top-headlines?topic=business&lang=es&country=cl&max=10&apikey=${API_KEY}`
      ),
      fetch(
        `${BASE_URL}/search?q=emprendimiento+freelance+finanzas&lang=es&max=10&apikey=${API_KEY}`
      ),
    ])

    const articulos: GNewsArticle[] = []

    for (const result of [headlinesRes, emprendimientoRes]) {
      if (result.status === 'fulfilled' && result.value.ok) {
        const data: GNewsResponse = await result.value.json()
        articulos.push(...(data.articles ?? []))
      }
    }

    // Deduplicar por URL y filtrar fuentes confiables
    const urlsVistas = new Set<string>()
    const filtrados = articulos.filter(a => {
      if (urlsVistas.has(a.url)) return false
      urlsVistas.add(a.url)
      return esFuenteConfiable(a.url)
    })

    // Si el filtro de fuentes confiables dejó < 3 noticias, usamos todos los artículos
    // deduplicados para evitar feed vacío. Preferimos cantidad sobre control en ese caso límite.
    const resultado = (filtrados.length >= 3 ? filtrados : articulos.slice(0, 8)).map(mapearArticulo)

    setCache(resultado)
    return resultado
  } catch (e) {
    console.error('[newsService] Error al obtener noticias:', e)
    return []
  }
}

/** Limpia el cache manualmente (útil para testing o botón "refrescar"). */
export function clearNewsCache() {
  localStorage.removeItem(CACHE_KEY)
}
