import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PortfolioAllocation, InvestmentInstrument } from '@/types'

export const usePortfolioStore = defineStore('portfolio', () => {
  const allocation = ref<PortfolioAllocation>({
    bonds: 0.7,
    dividends: 0.2,
    stocks: 0.1,
  })

  const instruments = ref<InvestmentInstrument[]>([])
  const selectedSymbols = ref<string[]>([])

  const hasInstruments = computed(() => instruments.value.length > 0)

  function setAllocation(data: PortfolioAllocation) {
    allocation.value = data
  }

  function setInstruments(data: InvestmentInstrument[]) {
    instruments.value = data
  }

  function toggleInstrument(symbol: string) {
    const idx = selectedSymbols.value.indexOf(symbol)
    if (idx === -1) {
      selectedSymbols.value.push(symbol)
    } else {
      selectedSymbols.value.splice(idx, 1)
    }
  }

  function reset() {
    selectedSymbols.value = []
  }

  return {
    allocation,
    instruments,
    selectedSymbols,
    hasInstruments,
    setAllocation,
    setInstruments,
    toggleInstrument,
    reset,
  }
})
