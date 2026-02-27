import { ref } from 'vue'

export function useStorageHistory() {
  // Estado reactivo que envuelve el SessionStorage
  const sessionHistory = ref<string[]>([])

  // Función para inicializar/leer el SessionStorage
  const loadSessionHistory = () => {
    try {
      const stored = sessionStorage.getItem('kasane_read_history')
      if (stored) {
        sessionHistory.value = JSON.parse(stored)
      } else {
        sessionHistory.value = []
      }
    } catch (e) {
      console.error('Error parseando sessionStorage de historial de lectura', e)
      sessionHistory.value = []
    }
  }

  // Marcar una noticia como leída (insertando en SessionStorage de forma explícita)
  const addToSessionHistory = (newsId: string) => {
    if (!sessionHistory.value.includes(newsId)) {
      sessionHistory.value.push(newsId)
      try {
        sessionStorage.setItem('kasane_read_history', JSON.stringify(sessionHistory.value))
      } catch (e) {
        console.error('Error escribiendo en sessionStorage', e)
      }
    }
  }

  // Limpiar el historial volátil a demanda
  const clearSessionHistory = () => {
    sessionHistory.value = []
    sessionStorage.removeItem('kasane_read_history')
  }

  // -------------------------------------------------------------------------------- //
  //  LocalStorage (Persistente) - Para preferencias de la sección noticias     //
  // -------------------------------------------------------------------------------- //
  const hideReadNews = ref(false)

  const loadLocalPreferences = () => {
    const pref = localStorage.getItem('kasane_news_hide_read')
    hideReadNews.value = pref === 'true'
  }

  const toggleHideReadPreference = () => {
    hideReadNews.value = !hideReadNews.value
    localStorage.setItem('kasane_news_hide_read', String(hideReadNews.value))
  }

  // Auto-cargar al invocar el composable
  loadSessionHistory()
  loadLocalPreferences()

  return {
    sessionHistory,
    addToSessionHistory,
    clearSessionHistory,

    hideReadNews,
    toggleHideReadPreference,
  }
}
