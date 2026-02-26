import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

/**
 * Store global para administrar el estado del widget lateral (Sidebar)
 * y las divisas / criptoactivos que el usuario quiere tener a la vista.
 * Utiliza @vueuse/core useLocalStorage para persistir las preferencias automáticamente.
 */
export const useMarketWidgetStore = defineStore('marketWidget', () => {
  // Estado de visibilidad de la barra
  const isOpen = useLocalStorage('kasane_market_sidebar_open', false)

  // Array de IDs de tickers habilitados
  const selectedTickers = useLocalStorage('kasane_market_tickers', [
    'USD/CLP',
    'EUR/CLP',
    'BTC/USD',
    'ETH/USD',
  ])

  function toggleSidebar() {
    isOpen.value = !isOpen.value
  }

  function toggleTicker(tickerId: string) {
    const index = selectedTickers.value.indexOf(tickerId)
    if (index > -1) {
      selectedTickers.value.splice(index, 1) // Quitar si existe
    } else {
      selectedTickers.value.push(tickerId) // Ingresar si no está
    }
  }

  return { isOpen, selectedTickers, toggleSidebar, toggleTicker }
})
