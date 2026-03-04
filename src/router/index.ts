import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'
import { useUserInputsStore } from '@/stores/userInputs'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true, public: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulator',
      name: 'simulator',
      component: () => import('@/views/SimulatorView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulations',
      name: 'simulations',
      component: () => import('@/views/SimulationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/trading',
      name: 'trading',
      component: () => import('@/views/TradingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/privacidad',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
      meta: { public: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// Guardia de navegación
router.beforeEach(async to => {
  const authStore = useAuthStore()

  // Esperar a que Firebase confirme el estado inicial de auth
  // Timeout de 5s para evitar cuelgue si Firebase no responde
  if (authStore.loading) {
    await Promise.race([
      new Promise<void>(resolve => {
        const unwatch = watch(
          () => authStore.loading,
          loading => {
            if (!loading) {
              unwatch()
              resolve()
            }
          },
          { immediate: true }
        )
      }),
      new Promise<void>(resolve => setTimeout(resolve, 5000)),
    ])
  }

  // Rutas que requieren auth → redirigir a login si no autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Redirecciones Inteligentes basado en el progreso del usuario
  if (authStore.isAuthenticated) {
    const onboardingStore = useOnboardingStore()
    const userInputsStore = useUserInputsStore()

    // Rutas solo para guests (ej. Login) → redirigir según su avance real
    if (to.meta.requiresGuest) {
      if (!onboardingStore.hasOnboarding || !userInputsStore.hasProfile) return { name: 'onboarding' }
      return { name: 'dashboard' }
    }

    // Impedir que repitan el Onboarding si ya lo completaron, a menos que vengan a editar
    if (to.name === 'onboarding' && to.query.edit !== 'true') {
      if (onboardingStore.hasOnboarding && userInputsStore.hasProfile) {
        return { name: 'dashboard' }
      }
    }

    // Si van al dashboard u otro pero no tienen el onboarding completo
    if (to.name !== 'onboarding' && to.name !== 'login' && to.name !== 'landing') {
      if (!onboardingStore.hasOnboarding || !userInputsStore.hasProfile) {
        return { name: 'onboarding' }
      }
    }
  }
})

export default router
