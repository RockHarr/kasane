import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PortfolioAllocation, InvestmentInstrument } from '@/types'
import { savePortfolio, loadPortfolio } from '@/services/firestore'

export const usePortfolioStore = defineStore('portfolio', () => {
  const allocation = ref<PortfolioAllocation>({
    bonds: 0.7,
    dividends: 0.2,
    stocks: 0.1,
  })

  const instruments = ref<InvestmentInstrument[]>([])
  const selectedSymbols = ref<string[]>([])
  const saving = ref(false)

  const hasInstruments = computed(() => instruments.value.length > 0)

  async function setAllocation(data: PortfolioAllocation, uid?: string) {
    allocation.value = data

    if (uid) {
      saving.value = true
      try {
        await savePortfolio(uid, data)
      } finally {
        saving.value = false
      }
    }
  }

  async function fetchAllocation(uid: string) {
    const remote = await loadPortfolio(uid)
    if (remote) {
      allocation.value = remote
    }
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
    saving,
    setAllocation,
    fetchAllocation,
    setInstruments,
    toggleInstrument,
    reset,
  }
})
