import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loadSimulations, deleteSimulation, type SimulationRecord } from '@/services/firestore'

export const useSimulationsStore = defineStore('simulations', () => {
  const records = ref<SimulationRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Retorna una función que obtiene las N simulaciones más recientes ordenadas por fecha.
   * @param limit - Número máximo de simulaciones a retornar (por defecto 3)
   */
  const recientes = computed(() => (limit = 3): SimulationRecord[] => {
    return [...records.value]
      .sort((a, b) => {
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0
        return timeB - timeA
      })
      .slice(0, limit)
  })

  async function fetch(uid: string) {
    loading.value = true
    error.value = null
    try {
      records.value = await loadSimulations(uid)
    } catch (e) {
      error.value = 'No se pudieron cargar las simulaciones'
      console.error('[simulations] fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  async function remove(uid: string, simulationId: string) {
    try {
      await deleteSimulation(uid, simulationId)
      records.value = records.value.filter(r => r.id !== simulationId)
    } catch (e) {
      console.error('[simulations] delete error:', e)
      throw e
    }
  }

  function reset() {
    records.value = []
    loading.value = false
    error.value = null
  }

  return { records, loading, error, recientes, fetch, remove, reset }
})
