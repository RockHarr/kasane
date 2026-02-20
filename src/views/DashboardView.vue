<script setup lang="ts">
// DashboardView: pantalla principal del portafolio sugerido
// Responsabilidad: orquestar PortfolioSuggestion con datos del store; redirigir si no hay perfil
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInputsStore } from '@/stores/userInputs'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore } from '@/stores/auth'
import PortfolioSuggestion from '@/components/organisms/PortfolioSuggestion.vue'
import BaseLoader from '@/components/atoms/BaseLoader.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const userInputsStore = useUserInputsStore()
const portfolioStore = usePortfolioStore()
const authStore = useAuthStore()

// Guardia: si no hay perfil, volver al home
onMounted(() => {
  if (!userInputsStore.hasProfile) {
    router.replace({ name: 'home' })
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
        <button class="nav-back" @click="goBack" aria-label="Volver al diagnóstico">
          ← Diagnóstico
        </button>
        <div class="nav-right">
          <span class="nav-brand">Kasane</span>
          <button class="nav-logout" @click="handleLogout" aria-label="Cerrar sesión">
            Salir
          </button>
        </div>
      </nav>

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
              <dd class="profile-value">
                {{ userInputsStore.profile!.horizonte }} meses
              </dd>
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
          <p class="cta-text">
            ¿Listo para ver cómo crece tu dinero?
          </p>
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
  .profile-grid { @apply grid-cols-4; }
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
