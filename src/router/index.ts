import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }, // solo si NO está autenticado
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
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// Guardia de navegación
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Esperar a que Firebase confirme el estado inicial de auth
  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const stop = setInterval(() => {
        if (!authStore.loading) {
          clearInterval(stop)
          resolve()
        }
      }, 50)
    })
  }

  // Rutas que requieren auth → redirigir a login si no autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Rutas solo para guests → redirigir a home si ya autenticado
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
