import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
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

  // Rutas solo para guests → redirigir a home si ya autenticado
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  // Si autenticado y ya completó onboarding → no puede volver a /onboarding
  // (OnboardingView lo maneja internamente con un watch)
})

export default router
