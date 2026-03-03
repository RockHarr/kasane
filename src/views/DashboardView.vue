<script setup lang="ts">
// DashboardView: pantalla principal del portafolio sugerido
// Responsabilidad: orquestar PortfolioSuggestion con datos del store; redirigir si no hay perfil
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInputsStore } from '@/stores/userInputs'
import { useAuthStore } from '@/stores/auth'
import { useSimulationsStore } from '@/stores/simulations'
import { useMarketWidgetStore } from '@/stores/marketWidget'
import { useOnboardingStore } from '@/stores/onboarding'
import { METAS } from '@/data/metas'
import ProyeccionBase from '@/components/organisms/ProyeccionBase.vue'
import DashboardSkeleton from '@/components/organisms/DashboardSkeleton.vue'
import SimulationCard from '@/components/organisms/SimulationCard.vue'
import MarketNews from '@/components/organisms/MarketNews.vue'
import BottomTabBar from '@/components/organisms/BottomTabBar.vue'
import MarketTicker from '@/components/organisms/MarketTicker.vue'
import SettingsPanel from '@/components/organisms/SettingsPanel.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseSkeleton from '@/components/atoms/BaseSkeleton.vue'
import KasaneLogo from '@/components/atoms/KasaneLogo.vue'

/** Número máximo de simulaciones recientes a mostrar en el dashboard */
const MAX_RECIENTES_DASHBOARD = 3

const router = useRouter()
const userInputsStore = useUserInputsStore()
const authStore = useAuthStore()
const simulationsStore = useSimulationsStore()
const onboardingStore = useOnboardingStore()

// Tiempo mínimo de skeleton: 3 segundos (para que el Kasane Tip sea legible)
const MIN_LOADING_MS = 3000
const loadingProgress = ref(0)   // 0→100 en 3 segundos
const timerDone = ref(false)      // true cuando pasan los 3s

const showSkeleton = computed(() =>
  !timerDone.value || !userInputsStore.hasProfile
)

let progressInterval: ReturnType<typeof setInterval>

onMounted(() => {
  const start = Date.now()
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - start
    loadingProgress.value = Math.min(100, Math.round((elapsed / MIN_LOADING_MS) * 100))
    if (elapsed >= MIN_LOADING_MS) {
      timerDone.value = true
      clearInterval(progressInterval)
    }
  }, 50)
})

onUnmounted(() => clearInterval(progressInterval))

// Guardia: esperar a que Firestore cargue antes de decidir si redirigir.
// Al refrescar, fetchProfile es async — hasProfile llega tarde con onMounted.
watch(
  () => [userInputsStore.loading, authStore.user] as const,
  async ([loading, user]) => {
    if (!loading && !userInputsStore.hasProfile) {
      router.replace({ name: 'onboarding' })
    } else if (!loading && userInputsStore.hasProfile && user) {
      // Cargar el historial del usuario una vez que el estado inicial está listo
      await simulationsStore.fetch(user.uid)
    }
  },
  { immediate: true }
)

/**
 * Nombre a mostrar en el saludo.
 * Si es email (sin displayName de Google), extrae la parte local y capitaliza.
 * Si es nombre completo, retorna solo el primer nombre.
 */
const displayFirstName = computed(() => {
  const name = authStore.displayName
  if (!name) return null
  if (name.includes('@')) {
    const local = name.split('@')[0]
    return local.charAt(0).toUpperCase() + local.slice(1)
  }
  return name.split(' ')[0]
})

/**
 * Cierra sesión del usuario y redirige al login.
 */
async function handleLogout() {
  await authStore.signOut()
  router.replace({ name: 'login' })
}

const activeTab = ref<'portafolio' | 'mercado'>('portafolio')

const selectedSimulationId = ref<string>('')

const selectedSimulation = computed(() => 
  simulationsStore.records.find(sim => sim.id === selectedSimulationId.value) ?? null
)

/**
 * Simulaciones recientes del usuario desde el store.
 */
const recientes = computed(() => simulationsStore.recientes(MAX_RECIENTES_DASHBOARD))

function formatCompactDate(createdAt: any) {
  // createdAt puede ser un Timestamp de Firestore (con .toDate()) o undefined
  const date = createdAt?.toDate ? createdAt.toDate() : (createdAt ? new Date(createdAt) : new Date())
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(date)
}

function formatCompactValue(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  return `$${(val / 1000).toFixed(0)}k`
}

function getSimulationLabel(sim: any) {
  const date = formatCompactDate(sim.createdAt)
  const metaObj = METAS.find(m => m.id === sim.profile.meta)
  const metaLabel = metaObj ? `- "${metaObj.label}"` : ''
  const val = formatCompactValue(sim.resultado.valorFinal)
  return `${date} ${metaLabel} (${val})`
}

async function handleDeleteSimulation(id: string) {
  if (!authStore.user) return
  await simulationsStore.remove(authStore.user.uid, id)
  if (selectedSimulationId.value === id) {
    selectedSimulationId.value = ''
  }
}

/**
 * Meta del onboarding para personalizar el nudge post-primera-simulación.
 */
const metaActual = computed(() =>
  METAS.find(m => m.id === onboardingStore.profile?.meta) ?? null
)

/**
 * Resumen de perfil del onboarding para mostrar junto al saludo.
 */
const perfilResumen = computed(() => {
  const p = onboardingStore.profile
  if (!p) return null
  const perfilLabel = p.perfil === 'freelancer' ? 'Freelancer' : p.perfil === 'emprendedor' ? 'Emprendedor' : null
  const generoLabel = p.genero === 'M' ? 'Él' : p.genero === 'F' ? 'Ella' : null
  const paisLabel = p.pais === 'CL' ? '🇨🇱' : p.pais === 'global' ? '🌐' : null
  return [perfilLabel, generoLabel, paisLabel].filter(Boolean).join(' · ')
})

/**
 * Navega a la vista del simulador.
 */
function goToSimulator() {
  router.push({ name: 'simulator' })
}
</script>

<template>
  <main class="dashboard-view">
    <!-- Skeleton UI: mínimo 3 segundos con tip tipo videojuego -->
    <DashboardSkeleton v-if="showSkeleton" :progress="loadingProgress" />

    <!-- Contenido real -->
    <template v-if="userInputsStore.hasProfile">
      <!-- App shell: nav (fixed top) -->
      <div class="dashboard-shell">
      <!-- Nav: 2 filas -->
      <nav class="dashboard-nav">
        <!-- Fila 1: Logo + nombre · controles -->
        <div class="nav-row nav-row--top">
          <KasaneLogo size="sm" />

          <!-- Desktop tabs (hidden on mobile, shown on md+) -->
          <div class="nav-desktop-tabs" role="tablist" aria-label="Navegación">
            <button
              class="nav-tab-btn"
              :class="{ 'is-active': activeTab === 'portafolio' }"
              role="tab"
              :aria-selected="activeTab === 'portafolio'"
              @click="activeTab = 'portafolio'"
            >
              Portafolio
            </button>
            <button
              class="nav-tab-btn"
              :class="{ 'is-active': activeTab === 'mercado' }"
              role="tab"
              :aria-selected="activeTab === 'mercado'"
              @click="activeTab = 'mercado'"
            >
              Mercado
            </button>
            <button
              class="nav-tab-btn nav-tab-btn--cta"
              @click="goToSimulator"
            >
              Simulador
            </button>
          </div>

          <div class="nav-controls">
            <SettingsPanel />
            <button class="nav-logout" aria-label="Cerrar sesión" @click="handleLogout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
        <!-- Fila 2: Saludo + perfil -->
        <div v-if="displayFirstName" class="nav-row nav-row--greeting">
          <h2 class="greeting-name">Hola, {{ displayFirstName }} 👋</h2>
          <p v-if="perfilResumen" class="greeting-perfil">{{ perfilResumen }}</p>
        </div>
        <!-- Desktop-only ticker strip below nav -->
        <div class="nav-desktop-ticker">
          <MarketTicker />
        </div>
      </nav>

      <!-- Scrollable content area -->
      <div class="dashboard-scroll">
        <div class="dashboard-container">

      <!-- TAB 1: TU PORTAFOLIO -->
      <div
        v-show="activeTab === 'portafolio'"
        id="panel-portafolio"
        class="tab-content"
        role="tabpanel"
        aria-labelledby="tab-portafolio"
      >

        <!-- Proyección Base de Ahorro vs Inversión -->
        <ProyeccionBase
          :capital="userInputsStore.profile!.excedente"
          :aporte-mensual="userInputsStore.profile!.aporteMensual"
          :horizonte="userInputsStore.profile!.horizonte"
          :meta="onboardingStore.profile?.meta ?? null"
        />

        <!-- Historial de Simulaciones Integrado -->
        <section
          v-if="!simulationsStore.loading"
          class="dashboard-history mt-4"
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

          <div v-if="recientes.length > 0" class="history-dropdown-section">
            <div class="strategy-select-wrapper relative">
              <select 
                v-model="selectedSimulationId" 
                class="strategy-select w-full appearance-none bg-bg-elevated border border-white/10 text-text-primary text-sm rounded-xl px-4 py-3 cursor-pointer outline-none focus:border-accent-neutral focus:ring-1 focus:ring-accent-neutral transition-all"
                aria-label="Seleccionar estrategia guardada"
              >
                <option value="" disabled>Selecciona una estrategia guardada para ver el detalle</option>
                <option v-for="sim in recientes" :key="sim.id" :value="sim.id">
                  {{ getSimulationLabel(sim) }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted text-xs">
                ▼
              </div>
            </div>

            <!-- Tarjeta expandida -->
            <Transition name="fade-slide">
              <div v-if="selectedSimulation" class="mt-4">
                <SimulationCard
                  :record="selectedSimulation"
                  @delete="handleDeleteSimulation"
                />
              </div>
            </Transition>
          </div>

          <!-- Nudge post-primera-simulación: aparece solo con exactamente 1 sim guardada -->
          <div v-if="recientes.length === 1 && !selectedSimulation" class="post-primera-cta" role="complementary">
            <div class="post-primera-content">
              <span class="post-primera-icon" aria-hidden="true">🎯</span>
              <div class="post-primera-text">
                <p class="post-primera-title">
                  Primera estrategia guardada
                  <template v-if="metaActual">— para tu {{ metaActual.label.toLowerCase() }} {{ metaActual.emoji }}</template>
                </p>
                <p class="post-primera-sub">Selecciona tu estrategia en el menú superior o crea una nueva.</p>
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

      </div>

      <!-- TAB 2: MERCADO Y EDUCACIÓN -->
      <div
        v-show="activeTab === 'mercado'"
        id="panel-mercado"
        class="tab-content w-full"
        role="tabpanel"
        aria-labelledby="tab-mercado"
      >
        
        <header class="mercado-header">
          <div>
            <h2 class="font-heading text-2xl font-bold text-text-primary">Mercado Global</h2>
            <p class="font-body text-sm text-text-secondary mt-1">Sigue de cerca los indicadores económicos y las noticias más relevantes de la industria.</p>
          </div>
        </header>

        <div class="mercado-grid">
           <!-- Indicadores Inline -->
           <div class="mercado-indicators">
             <header class="mercado-indicators-header">
               <h3 class="font-heading text-sm font-bold text-text-primary uppercase tracking-wider">Indicadores en vivo</h3>
               <span class="font-body text-[10px] text-text-muted">Mock · actualiza cada 10s</span>
             </header>
             <MarketTicker class="mercado-ticker-inline" />
           </div>
           
           <!-- Módulo de Educación Financiera -->
           <div class="mercado-news-container">
             <MarketNews />
           </div>
        </div>
      </div>

          </div><!-- /dashboard-container -->
        </div><!-- /dashboard-scroll -->

        <!-- Bottom chrome: ticker + tab bar (mobile only) -->
        <div class="dashboard-bottom-chrome md:hidden">
          <MarketTicker />
          <BottomTabBar
            :active-tab="activeTab"
            @update:active-tab="activeTab = $event"
          />
        </div>
      </div><!-- /dashboard-shell -->
    </template>
  </main>
</template>

<style scoped lang="postcss">
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
  /* App shell root — fills viewport exactly */
  @apply bg-bg-primary;
  height: 100dvh;
  overflow: hidden;
}

/* Full-height flex column shell */
.dashboard-shell {
  @apply flex flex-col;
  height: 100%;
}

/* Scrollable content — takes up all remaining space */
.dashboard-scroll {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* Bottom chrome: ticker + tab bar, never overlaps content */
.dashboard-bottom-chrome {
  @apply flex flex-col flex-shrink-0;
}

.dashboard-container {
  @apply max-w-5xl mx-auto flex flex-col gap-12 px-4 pt-8 pb-6;
}

/* ── Desktop overrides (md+) ── */
@media (min-width: 768px) {
  /* Revert from app-shell to normal page scroll on desktop */
  .dashboard-view {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .dashboard-shell {
    height: auto;
    min-height: 100vh;
  }

  .dashboard-scroll {
    overflow-y: visible;
    flex: none;
  }

  .dashboard-nav {
    @apply border-b border-white/5 pb-0;
    padding-bottom: 0 !important;
  }

  .nav-row--top {
    @apply py-3;
  }
}

/* ── Desktop nav tabs (hidden on mobile) ── */
.nav-desktop-tabs {
  @apply hidden md:flex items-center gap-1;
}

.nav-tab-btn {
  @apply font-body text-sm font-medium px-4 py-2 rounded-full transition-all;
  @apply text-text-muted hover:text-text-primary hover:bg-white/5;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth;
}

.nav-tab-btn.is-active {
  @apply text-text-primary bg-bg-elevated;
}

.nav-tab-btn--cta {
  @apply text-accent-growth border border-accent-growth/30 hover:bg-accent-growth/10;
}

/* ── Desktop ticker strip (hidden on mobile) ── */
.nav-desktop-ticker {
  @apply hidden md:block border-t border-white/5;
}

/* Override MarketTicker inside desktop ticker to remove mobile bottom border styles */
.nav-desktop-ticker :deep(.market-ticker) {
  @apply border-t-0;
}


/* Nav */
.dashboard-nav {
  @apply flex flex-col gap-2 px-4 pt-6 pb-2 flex-shrink-0;
}

.nav-row--top {
  @apply flex items-center justify-between;
}

.nav-row--greeting {
  @apply flex flex-col gap-0.5 px-0.5;
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

.nav-controls {
  @apply flex items-center gap-1;
}

.nav-logout {
  @apply flex items-center justify-center w-8 h-8 rounded-full;
  @apply text-text-muted hover:text-accent-alert hover:bg-accent-alert/10 transition-all;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert;
  @apply cursor-pointer;
}

/* Greeting */
.dashboard-greeting {
  @apply flex flex-col gap-1;
}

.greeting-name {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.greeting-perfil {
  @apply font-body text-xs text-text-muted tracking-wide;
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

.params-chip--meta {
  @apply font-body text-accent-growth/80;
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
