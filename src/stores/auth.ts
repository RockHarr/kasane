import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import {
  onAuthChange,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logout,
} from '@/services/auth'
import { useUserInputsStore } from './userInputs'
import { usePortfolioStore } from './portfolio'
import { useOnboardingStore } from './onboarding'
import { useSimulationsStore } from './simulations'
import { useTradingStore } from './trading'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true) // true hasta que Firebase confirme el estado inicial

  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() => user.value?.displayName ?? user.value?.email ?? null)
  const photoURL = computed(() => user.value?.photoURL ?? null)

  // Inicializa el observer — llamar una vez en main.js
  function init() {
    onAuthChange(async firebaseUser => {
      user.value = firebaseUser

      if (firebaseUser) {
        // Cargar datos del usuario desde Firestore antes de liberar el loading.
        // El router guard espera loading=false, así que al liberarlo todos los
        // datos ya están disponibles → evita race condition en Dashboard/Simulator.
        const userInputsStore = useUserInputsStore()
        const portfolioStore = usePortfolioStore()
        const onboardingStore = useOnboardingStore()
        await Promise.all([
          userInputsStore.fetchProfile(firebaseUser.uid),
          portfolioStore.fetchAllocation(firebaseUser.uid),
          onboardingStore.fetchOnboarding(firebaseUser.uid),
        ])
      }

      loading.value = false
    })
  }

  async function signInWithGoogle() {
    // loading=true para que waitForDataLoad() espere.
    // onAuthChange lo pondrá en false DESPUÉS de cargar todos los datos.
    // Si el login falla (popup cerrado, etc.), lo reseteamos en el catch.
    loading.value = true
    try {
      await loginWithGoogle()
    } catch (e) {
      loading.value = false
      throw e
    }
  }

  async function signInWithEmail(email: string, password: string) {
    loading.value = true
    try {
      await loginWithEmail(email, password)
    } catch (e) {
      loading.value = false
      throw e
    }
  }

  async function register(email: string, password: string) {
    loading.value = true
    try {
      await registerWithEmail(email, password)
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await logout()
    user.value = null
    // Limpiar datos locales al cerrar sesión
    const userInputsStore = useUserInputsStore()
    const portfolioStore = usePortfolioStore()
    const onboardingStore = useOnboardingStore()
    const simulationsStore = useSimulationsStore()
    const tradingStore = useTradingStore()
    userInputsStore.reset()
    portfolioStore.reset()
    onboardingStore.reset()
    simulationsStore.reset()
    tradingStore.reset()
  }

  return {
    user,
    loading,
    isAuthenticated,
    displayName,
    photoURL,
    init,
    signInWithGoogle,
    signInWithEmail,
    register,
    signOut,
  }
})
