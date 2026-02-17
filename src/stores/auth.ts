import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import { onAuthChange, loginWithGoogle, loginWithEmail, registerWithEmail, logout } from '@/services/auth'
import { useUserInputsStore } from './userInputs'
import { usePortfolioStore } from './portfolio'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true) // true hasta que Firebase confirme el estado inicial

  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() => user.value?.displayName ?? user.value?.email ?? null)
  const photoURL = computed(() => user.value?.photoURL ?? null)

  // Inicializa el observer — llamar una vez en main.js
  function init() {
    onAuthChange(async (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false

      if (firebaseUser) {
        // Cargar datos del usuario desde Firestore al iniciar sesión
        const userInputsStore = useUserInputsStore()
        const portfolioStore = usePortfolioStore()
        await Promise.all([
          userInputsStore.fetchProfile(firebaseUser.uid),
          portfolioStore.fetchAllocation(firebaseUser.uid),
        ])
      }
    })
  }

  async function signInWithGoogle() {
    loading.value = true
    try {
      await loginWithGoogle()
    } finally {
      loading.value = false
    }
  }

  async function signInWithEmail(email: string, password: string) {
    loading.value = true
    try {
      await loginWithEmail(email, password)
    } finally {
      loading.value = false
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
    userInputsStore.reset()
    portfolioStore.reset()
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
