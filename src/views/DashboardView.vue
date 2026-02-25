<script setup lang="ts">
// DashboardView: pantalla principal del portafolio sugerido
// Responsabilidad: orquestar PortfolioSuggestion con datos del store; redirigir si no hay perfil
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInputsStore } from '@/stores/userInputs'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'
import PortfolioSuggestion from '@/components/organisms/PortfolioSuggestion.vue'
import BaseLoader from '@/components/atoms/BaseLoader.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const userInputsStore = useUserInputsStore()
const portfolioStore = usePortfolioStore()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

// Guardia: esperar a que Firestore cargue antes de decidir si redirigir.
// Al refrescar, fetchProfile es async — hasProfile llega tarde con onMounted.
watch(
  () => userInputsStore.loading,
  loading => {
    if (!loading && !userInputsStore.hasProfile) {
      router.replace({ name: 'home' })
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

// ─── Progreso hacia la meta ────────────────────────────────────
const RATES: Record<string, number> = { CLP: 1, USD: 950, UF: 38500 }

const metaProgress = computed(() => {
  const ob = onboardingStore.profile
  const profile = userInputsStore.profile
  if (!ob || !profile || ob.monteMeta <= 0) return null

  const montaCLP = ob.monteMeta * (RATES[ob.monedaMeta] ?? 1)
  const faltante = Math.max(0, montaCLP - profile.excedente)
  const alcanzada = profile.excedente >= montaCLP
  const progress = Math.min((profile.excedente / montaCLP) * 100, 100)

  const mesesRestantes =
    faltante > 0 && profile.aporteMensual > 0 ? Math.ceil(faltante / profile.aporteMensual) : 0

  // ¿El usuario puede lograr la meta dentro de su horizonte definido?
  const enRitmo = alcanzada || (profile.aporteMensual > 0 && mesesRestantes <= profile.horizonte)

  // Si no está en ritmo, cuánto necesita ahorrar por mes para llegar a tiempo
  const aporteNecesario =
    !alcanzada && profile.horizonte > 0 ? Math.ceil(faltante / profile.horizonte) : 0

  return {
    meta: ob.meta,
    monteMeta: ob.monteMeta,
    monedaMeta: ob.monedaMeta,
    progress: Math.round(progress),
    mesesRestantes,
    alcanzada,
    enRitmo,
    aporteNecesario,
    horizonte: profile.horizonte,
  }
})

function handleSelectInstrument(symbol: string) {
  portfolioStore.toggleInstrument(symbol)
}

function goBack() {
  router.push({ name: 'home' })
}

async function handleLogout() {
  await authStore.signOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <main class="dashboard-view">
    <div class="dashboard-container">
      <!-- Nav mínima -->
      <nav class="dashboard-nav">
        <button class="nav-back" aria-label="Volver al diagnóstico" @click="goBack">
          ← Diagnóstico
        </button>
        <div class="nav-right">
          <span class="nav-brand">Kasane</span>
          <button class="nav-logout" aria-label="Cerrar sesión" @click="handleLogout">Salir</button>
        </div>
      </nav>

      <!-- Saludo personalizado -->
      <div v-if="displayFirstName" class="dashboard-greeting">
        <h2 class="greeting-name">Hola, {{ displayFirstName }} 👋</h2>
        <p class="greeting-sub">
          <template v-if="onboardingStore.profile?.meta">
            Estás construyendo el camino hacia "{{ onboardingStore.profile.meta }}".
          </template>
          <template v-else> Aquí está tu estrategia de inversión personalizada. </template>
        </p>
      </div>

      <!-- Barra de progreso hacia la meta -->
      <div v-if="metaProgress" class="meta-card">
        <div class="meta-card-header">
          <span class="meta-card-icon" aria-hidden="true">🎯</span>
          <div class="meta-card-info">
            <p class="meta-card-title">{{ metaProgress.meta }}</p>
            <p
              class="meta-card-sub"
              :class="{ 'meta-card-sub--alert': !metaProgress.alcanzada && !metaProgress.enRitmo }"
            >
              <template v-if="metaProgress.alcanzada">
                ¡Tu excedente actual ya alcanza para lograrlo! 🎉
              </template>
              <template v-else-if="metaProgress.enRitmo">
                {{ metaProgress.mesesRestantes }} mes{{
                  metaProgress.mesesRestantes !== 1 ? 'es' : ''
                }}
                más al ritmo actual ✓
              </template>
              <template v-else-if="metaProgress.aporteNecesario > 0">
                Para lograrlo en {{ metaProgress.horizonte }} meses → necesitas ${{
                  metaProgress.aporteNecesario.toLocaleString('es-CL')
                }}
                CLP/mes
              </template>
              <template v-else> Agrega un aporte mensual para calcular el plazo </template>
            </p>
          </div>
          <span class="meta-card-amount">
            {{ metaProgress.monteMeta.toLocaleString() }} {{ metaProgress.monedaMeta }}
          </span>
        </div>
        <div
          class="meta-bar-track"
          role="progressbar"
          :aria-valuenow="metaProgress.progress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="meta-bar-fill" :style="{ width: metaProgress.progress + '%' }" />
        </div>
        <p class="meta-bar-label">{{ metaProgress.progress }}% del camino</p>
      </div>

      <!-- Sin perfil: loader mientras redirige -->
      <div v-if="!userInputsStore.hasProfile" class="dashboard-loading">
        <BaseLoader size="lg" label="Cargando tu portafolio..." />
      </div>

      <!-- Con perfil: mostrar portafolio -->
      <template v-else>
        <!-- Resumen del perfil -->
        <section class="profile-summary" aria-label="Resumen de tu perfil">
          <dl class="profile-grid">
            <div class="profile-item">
              <dt class="profile-label">Excedente</dt>
              <dd class="profile-value">
                ${{ userInputsStore.profile!.excedente.toLocaleString() }}
              </dd>
            </div>
            <div class="profile-item">
              <dt class="profile-label">Reserva</dt>
              <dd class="profile-value">
                ${{ userInputsStore.profile!.reserva.toLocaleString() }}
              </dd>
            </div>
            <div class="profile-item">
              <dt class="profile-label">Aporte mensual</dt>
              <dd class="profile-value">
                ${{ userInputsStore.profile!.aporteMensual.toLocaleString() }}
              </dd>
            </div>
            <div class="profile-item">
              <dt class="profile-label">Horizonte</dt>
              <dd class="profile-value">{{ userInputsStore.profile!.horizonte }} meses</dd>
            </div>
          </dl>
        </section>

        <!-- Sugerencia de portafolio -->
        <PortfolioSuggestion
          :allocation="portfolioStore.allocation"
          :instruments="portfolioStore.instruments"
          :capital-inicial="userInputsStore.profile!.excedente"
          :selected-symbols="portfolioStore.selectedSymbols"
          @select-instrument="handleSelectInstrument"
        />

        <!-- CTA al simulador -->
        <div class="dashboard-cta">
          <p class="cta-text">¿Listo para ver cómo crece tu dinero?</p>
          <BaseButton variant="primary" @click="router.push({ name: 'simulator' })">
            Ver simulación DCA →
          </BaseButton>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

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

/* Meta progress card */
.meta-card {
  @apply flex flex-col gap-3 bg-bg-elevated rounded-xl p-5 border border-accent-growth/20;
}

.meta-card-header {
  @apply flex items-start gap-3;
}

.meta-card-icon {
  @apply text-2xl leading-none mt-0.5;
}

.meta-card-info {
  @apply flex flex-col gap-0.5 flex-1 min-w-0;
}

.meta-card-title {
  @apply font-heading text-base font-semibold text-text-primary truncate;
}

.meta-card-sub {
  @apply font-body text-xs text-text-muted;
}

.meta-card-sub--alert {
  @apply text-accent-alert;
}

.meta-card-amount {
  @apply font-mono text-sm font-bold text-accent-growth whitespace-nowrap;
}

.meta-bar-track {
  @apply w-full h-1.5 rounded-full bg-white/5 overflow-hidden;
}

.meta-bar-fill {
  @apply h-full rounded-full bg-accent-growth-bg transition-all duration-700 ease-out;
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-accent-growth, #00ffaa) 50%, transparent);
}

.meta-bar-label {
  @apply font-mono text-xs text-text-muted;
}

/* Loading */
.dashboard-loading {
  @apply flex items-center justify-center py-24;
}

/* Perfil summary */
.profile-summary {
  @apply bg-bg-elevated rounded-xl p-5 border border-white/5;
}

.profile-grid {
  @apply grid grid-cols-2 gap-4;
}

@media (min-width: 640px) {
  .profile-grid {
    @apply grid-cols-4;
  }
}

.profile-item {
  @apply flex flex-col gap-1;
}

.profile-label {
  @apply font-body text-xs text-text-muted uppercase tracking-wider;
}

.profile-value {
  @apply font-mono text-lg font-bold text-text-primary;
}

/* CTA */
.dashboard-cta {
  @apply flex items-center justify-between bg-accent-growth/10 border border-accent-growth/30;
  @apply rounded-xl px-6 py-4;
}

.cta-text {
  @apply font-body text-sm text-accent-growth;
}
</style>
