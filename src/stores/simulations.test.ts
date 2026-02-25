import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSimulationsStore } from './simulations'

// Mock del servicio de firestore
vi.mock('@/services/firestore', () => ({
  loadSimulations: vi.fn(),
  deleteSimulation: vi.fn(),
}))

import { loadSimulations, deleteSimulation } from '@/services/firestore'

const mockRecords = [
  {
    id: 'sim-1',
    profile: { excedente: 10000, reserva: 3000, aporteMensual: 500, horizonte: 12 },
    allocation: { bonds: 0.7, dividends: 0.2, stocks: 0.1 },
    resultado: {
      valorFinal: 16800,
      totalAportado: 16000,
      ganancia: 800,
      rentabilidadTotal: 5.0,
      tasaAnual: 0.055,
    },
  },
  {
    id: 'sim-2',
    profile: { excedente: 5000, reserva: 1000, aporteMensual: 200, horizonte: 24 },
    allocation: { bonds: 0.5, dividends: 0.3, stocks: 0.2 },
    resultado: {
      valorFinal: 10500,
      totalAportado: 9800,
      ganancia: 700,
      rentabilidadTotal: 7.1,
      tasaAnual: 0.065,
    },
  },
]

describe('useSimulationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('estado inicial está vacío y no loading', () => {
    const store = useSimulationsStore()
    expect(store.records).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetch carga simulaciones desde Firestore', async () => {
    vi.mocked(loadSimulations).mockResolvedValue(mockRecords)
    const store = useSimulationsStore()

    await store.fetch('uid-123')

    expect(loadSimulations).toHaveBeenCalledWith('uid-123')
    expect(store.records).toHaveLength(2)
    expect(store.records[0].id).toBe('sim-1')
    expect(store.loading).toBe(false)
  })

  it('fetch maneja errores y setea error message', async () => {
    vi.mocked(loadSimulations).mockRejectedValue(new Error('Firestore error'))
    const store = useSimulationsStore()

    await store.fetch('uid-123')

    expect(store.records).toEqual([])
    expect(store.error).toBe('No se pudieron cargar las simulaciones')
    expect(store.loading).toBe(false)
  })

  it('remove elimina la simulación del array local', async () => {
    vi.mocked(loadSimulations).mockResolvedValue([...mockRecords])
    vi.mocked(deleteSimulation).mockResolvedValue(undefined)
    const store = useSimulationsStore()

    await store.fetch('uid-123')
    expect(store.records).toHaveLength(2)

    await store.remove('uid-123', 'sim-1')

    expect(deleteSimulation).toHaveBeenCalledWith('uid-123', 'sim-1')
    expect(store.records).toHaveLength(1)
    expect(store.records[0].id).toBe('sim-2')
  })

  it('remove propaga errores de Firestore', async () => {
    vi.mocked(deleteSimulation).mockRejectedValue(new Error('Permission denied'))
    const store = useSimulationsStore()
    store.records = [...mockRecords]

    await expect(store.remove('uid-123', 'sim-1')).rejects.toThrow('Permission denied')
    // El registro no se elimina si hubo error
    expect(store.records).toHaveLength(2)
  })

  it('reset limpia todo el estado', async () => {
    vi.mocked(loadSimulations).mockResolvedValue([...mockRecords])
    const store = useSimulationsStore()

    await store.fetch('uid-123')
    expect(store.records).toHaveLength(2)

    store.reset()

    expect(store.records).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })
})
