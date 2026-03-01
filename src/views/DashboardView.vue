<script setup lang="ts">
// DashboardView: pantalla principal del portafolio sugerido
// Responsabilidad: orquestar PortfolioSuggestion con datos del store; redirigir si no hay perfil
import { computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInputsStore } from '@/stores/userInputs'
import { useAuthStore } from '@/stores/auth'
import { useSimulationsStore } from '@/stores/simulations'
import { useMarketWidgetStore } from '@/stores/marketWidget'
import { useOnboardingStore } from '@/stores/onboarding'
import { METAS } from '@/data/metas'
import ComparativaInstrumentos from '@/components/organisms/ComparativaInstrumentos.vue'
import DashboardSkeleton from '@/components/organisms/DashboardSkeleton.vue'
import SimulationCard from '@/components/organisms/SimulationCard.vue'
import MarketNews from '@/components/organisms/MarketNews.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseSkeleton from '@/components/atoms/BaseSkeleton.vue'
import KasaneLogo from '@/components/atoms/KasaneLogo.vue'

const router = useRouter()
const userInputsStore = useUserInputsStore()
const authStore = useAuthStore()
const simulationsStore = useSimulationsStore()
const onboardingStore = useOnboardingStore()

// Guardia: esperar a que Firestore cargue antes de decidir si redirigir.
// Al refrescar, fetchProfile es async — hasProfile llega tarde con onMounted.
watch(
  () => userInputsStore.loading,
  async loading => {
    if (!loading && !userInputsStore.hasProfile) {
      router.replace({ name: 'onboarding' })
    } else if (!loading && userInputsStore.hasProfile && authStore.user) {
      // Cargar el historial del usuario una vez que el estado inicial está listo
      await simulationsStore.fetch(authStore.user.uid)
    }
  },
  { immediate: true }
)

// Nombre a mostrar: si es email (sin displayName de Google) extraer la parte local
const displayFirstName = computed(() => {
  const name = authStore.displayName
  if (!name) return null
  if (name.includes('@')) {
    const local = name.split('@')[0]
    return local.charAt(0).toUpperCase() + local.slice(1)
  }
  return name.split(' ')[0]
})

async function handleLogout() {
  await authStore.signOut()
  router.replace({ name: 'login' })
}

const recientes = computed(() => {
  return simulationsStore.records
    .slice()
    .sort((a, b) => {
      const timeB = b.createdAt ? b.createdAt.toMillis() : 0
      const timeA = a.createdAt ? a.createdAt.toMillis() : 0
      return timeB - timeA
    })
    .slice(0, 3) // Solo mostrar las 3 principales
})

const activeTab = ref<'estrategia' | 'mercado'>('estrategia')

// Meta del onboarding para el nudge post-primera-simulación
const metaActual = computed(() =>
  METAS.find(m => m.id === onboardingStore.profile?.meta) ?? null
)

function goToSimulator() {
  router.push({ name: 'simulator' })
}
</script>

<template>
  <main class="dashboard-view">
    <!-- Skeleton UI: Estado de carga progresiva -->
    <DashboardSkeleton v-if="!userInputsStore.hasProfile" />

    <!-- Contenido real -->
    <div v-else class="dashboard-container">
      <!-- Nav mínima con Saludo Integrado -->
      <nav class="dashboard-nav">
        <div class="nav-left">
          <KasaneLogo size="sm" />
          <div v-if="displayFirstName" class="dashboard-greeting">
            <h2 class="greeting-name">Hola, {{ displayFirstName }} 👋</h2>
          </div>
        </div>
        
        <div class="nav-right">
           <!-- Tabs (Píldoras) -->
          <div class="dashboard-tabs" role="tablist">
            <button
              class="tab-btn"
              :class="{ 'is-active': activeTab === 'estrategia' }"
              role="tab"
              :aria-selected="activeTab === 'estrategia'"
              @click="activeTab = 'estrategia'"
            >
              Tu Portafolio
            </button>
            <button
              class="tab-btn"
              :class="{ 'is-active': activeTab === 'mercado' }"
              role="tab"
              :aria-selected="activeTab === 'mercado'"
              @click="activeTab = 'mercado'"
            >
              Mercado y Educación
            </button>
          </div>
          <button class="nav-logout" aria-label="Cerrar sesión" @click="handleLogout">Salir</button>
        </div>
      </nav>

      <!-- TAB 1: TU PORTAFOLIO (ESTRATEGIA) -->
      <div v-show="activeTab === 'estrategia'" class="tab-content" role="tabpanel">

        <!-- Params strip: contexto de la simulación -->
        <div class="params-strip" aria-label="Parámetros activos">
          <span class="params-chip">
            💰 ${{ userInputsStore.profile!.aporteMensual.toLocaleString('es-CL') }}/mes
          </span>
          <span class="params-sep" aria-hidden="true">·</span>
          <span class="params-chip">
            📅 {{ userInputsStore.profile!.horizonte }} meses
          </span>
        </div>

        <!-- Comparativa autogenerada -->
        <ComparativaInstrumentos
          :capital="userInputsStore.profile!.excedente"
          :aporte-mensual="userInputsStore.profile!.aporteMensual"
          :horizonte="userInputsStore.profile!.horizonte"
          :primera-vez="simulationsStore.records.length === 0"
          :genero="onboardingStore.profile?.genero ?? null"
          :meta="onboardingStore.profile?.meta ?? null"
          @explorar="goToSimulator"
        />

        <!-- Historial de Simulaciones Integrado -->
        <section
          v-if="!simulationsStore.loading"
          class="dashboard-history"
          aria-label="Tus estrategias guardadas"
        >
          <header class="history-header">
            <h3 class="history-title">Tus estrategias guardadas</h3>
            <button
              v-if="simulationsStore.records.length > 0"
              class="history-link"
              @click="router.push({ name: 'simulations' })"
            >
              Ver todas →
            </button>
          </header>

          <div v-if="recientes.length > 0" class="history-grid">
            <SimulationCard
              v-for="sim in recientes"
              :key="sim.id"
              :simulation="sim"
              @delete="simulationsStore.remove(authStore.user!.uid, sim.id)"
            />
          </div>

          <!-- Nudge post-primera-simulación: aparece solo con exactamente 1 sim guardada -->
          <div v-if="recientes.length === 1" class="post-primera-cta" role="complementary">
            <div class="post-primera-content">
              <span class="post-primera-icon" aria-hidden="true">🎯</span>
              <div class="post-primera-text">
                <p class="post-primera-title">
                  Primera estrategia guardada
                  <template v-if="metaActual">— para tu {{ metaActual.label.toLowerCase() }} {{ metaActual.emoji }}</template>
                </p>
                <p class="post-primera-sub">¿Tienes otro objetivo en mente? Simula un mix diferente y compáralos.</p>
              </div>
            </div>
            <button class="post-primera-btn" @click="goToSimulator">
              Simular otro escenario →
            </button>
          </div>

          <div v-if="recientes.length === 0" class="history-empty">
            <p class="empty-text">Aún no has diseñado ninguna estrategia de inversión constante.</p>
            <BaseButton variant="primary" class="mt-2" @click="goToSimulator">
              Crear primera proyección
            </BaseButton>
          </div>
        </section>

        <div v-if="simulationsStore.loading" class="history-loading">
          <BaseSkeleton width="100%" height="150px" />
        </div>

        <!-- CTA Cierre -->
        <div class="dashboard-cta">
          <p class="cta-text text-sm">La constancia es la llave del interés compuesto</p>
        </div>
      </div>

      <!-- TAB 2: MERCADO Y EDUCACIÓN -->
      <div v-show="activeTab === 'mercado'" class="tab-content w-full" role="tabpanel">
        
        <header class="mercado-header">
          <div>
            <h2 class="font-heading text-2xl font-bold text-text-primary">Mercado Global</h2>
            <p class="font-body text-sm text-text-secondary mt-1">Sigue de cerca los indicadores económicos y las noticias más relevantes de la industria.</p>
          </div>
        </header>

        <div class="mercado-grid">
           <!-- Indicadores (Integrando MarketSidebar lógica visual) -->
           <div class="mercado-sidebar-container">
             <div class="bg-accent-growth/10 border border-accent-growth/20 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                <span class="text-4xl" aria-hidden="true">📈</span>
                <h3 class="font-heading text-lg font-bold text-accent-growth">Indicadores en vivo</h3>
                <p class="text-sm text-text-secondary w-4/5">Abre el panel lateral para vigilar tus divisas y cripto en tiempo real.</p>
                <BaseButton variant="secondary" @click="useMarketWidgetStore().toggleSidebar()">Abrir Panel</BaseButton>
             </div>
           </div>
           
           <!-- Módulo de Educación Financiera (Noticias Mockeadas + Storage) -->
           <div class="mercado-news-container">
             <MarketNews />
           </div>
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

/* History Section */
.dashboard-history {
  @apply flex flex-col gap-4;
}

.history-header {
  @apply flex items-end justify-between px-1;
}

.history-title {
  @apply font-heading text-lg font-bold text-text-primary;
}

.history-link {
  @apply font-body text-sm text-text-secondary hover:text-accent-growth transition-colors cursor-pointer;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded;
}

.history-grid {
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 640px) {
  .history-grid {
    @apply grid-cols-2;
  }
}

.history-empty {
  @apply flex flex-col items-center justify-center p-8 gap-4 border border-dashed border-white/10 rounded-xl bg-bg-secondary w-full mx-auto;
}

.empty-text {
  @apply font-body text-sm text-text-muted text-center;
}

.history-loading {
  @apply w-full mt-4;
}

.dashboard-view {
  @apply min-h-screen bg-bg-primary px-4 py-8;
}

.dashboard-container {
  @apply max-w-5xl mx-auto flex flex-col gap-8;
}

/* Nav */
.dashboard-nav {
  @apply flex items-center justify-between;
}

.nav-back {
  @apply font-body text-sm text-text-secondary hover:text-accent-growth transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded;
}

.nav-right {
  @apply flex items-center gap-4;
}

.nav-brand {
  @apply font-heading text-sm font-semibold text-text-muted;
}

.nav-logout {
  @apply font-body text-xs text-text-muted hover:text-accent-alert transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert rounded;
}

/* Greeting */
.dashboard-greeting {
  @apply flex flex-col gap-1;
}

.greeting-name {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.greeting-sub {
  @apply font-body text-sm text-text-secondary;
}

/* Params strip */
.params-strip {
  @apply flex items-center gap-2;
}

.params-chip {
  @apply font-mono text-sm font-medium text-text-secondary;
}

.params-sep {
  @apply text-text-muted;
}

/* CTA */
.dashboard-cta {
  @apply flex items-center justify-between bg-accent-growth/10 border border-accent-growth/30;
  @apply rounded-xl px-6 py-4;
}

.cta-text {
  @apply font-body text-sm text-accent-growth;
}

/* Tabs & Mercado */
.dashboard-tabs {
  @apply flex items-center bg-bg-elevated p-1 rounded-xl border border-white/5;
}

.tab-btn {
  @apply font-heading font-medium text-sm text-text-muted px-4 py-1.5 rounded-lg transition-all duration-300;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth cursor-pointer;
}

.tab-btn:hover {
  @apply text-text-primary;
}

.tab-btn.is-active {
  @apply text-text-primary bg-accent-growth/20 shadow-sm border border-accent-growth/30;
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-accent-growth, #00ffaa) 20%, transparent);
}

.mercado-header {
  @apply mb-6;
}

.mercado-grid {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6 items-start;
}

.mercado-sidebar-container {
  @apply flex-1 lg:col-span-1 sticky top-6;
}

.mercado-news-container {
  @apply flex-1 lg:col-span-2;
}

.nav-left {
  @apply flex items-center gap-6;
}

/* Nudge post-primera-simulación */
.post-primera-cta {
  @apply flex items-center justify-between gap-4 flex-wrap;
  @apply bg-accent-neutral/10 border border-accent-neutral/20 rounded-xl px-5 py-4 mt-2;
}

.post-primera-content {
  @apply flex items-start gap-3 flex-1;
}

.post-primera-icon {
  @apply text-xl leading-none mt-0.5;
}

.post-primera-text {
  @apply flex flex-col gap-0.5;
}

.post-primera-title {
  @apply font-body text-sm font-semibold text-text-primary;
}

.post-primera-sub {
  @apply font-body text-xs text-text-secondary;
}

.post-primera-btn {
  @apply font-body text-sm font-medium text-accent-neutral whitespace-nowrap;
  @apply hover:text-text-primary transition-colors cursor-pointer;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral rounded;
}
</style>
