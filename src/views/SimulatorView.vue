<script setup lang="ts">
// SimulatorView: pantalla del simulador DCA
// Responsabilidad: orquestar OCASimulator + ComparisonChart con datos de los stores
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInputsStore } from '@/stores/userInputs'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore } from '@/stores/auth'
import { simularPortafolio } from '@/services/calculations'
import OCASimulator from '@/components/organisms/OCASimulator.vue'
import ComparisonChart from '@/components/organisms/ComparisonChart.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'

const router = useRouter()
const userInputsStore = useUserInputsStore()
const portfolioStore = usePortfolioStore()
const authStore = useAuthStore()

onMounted(() => {
  if (!userInputsStore.hasProfile) {
    router.replace({ name: 'home' })
  }
})

const resultado = computed(() => {
  if (!userInputsStore.profile) return null
  return simularPortafolio(userInputsStore.profile, portfolioStore.allocation)
})

function goBack() {
  router.push({ name: 'dashboard' })
}

async function guardarSimulacion() {
  if (!resultado.value || !userInputsStore.profile || !authStore.user) return
  const { saveSimulation } = await import('@/services/firestore')
  await saveSimulation(authStore.user.uid, {
    profile: userInputsStore.profile,
    allocation: portfolioStore.allocation,
  })
}
</script>

<template>
  <main class="simulator-view">
    <div class="simulator-container">

      <!-- Nav -->
      <nav class="simulator-nav">
        <button class="nav-back" @click="goBack" aria-label="Volver al portafolio">
          ← Portafolio
        </button>
        <span class="nav-brand">Tesorería Simple</span>
      </nav>

      <template v-if="userInputsStore.profile && resultado">
        <!-- Simulador con métricas -->
        <OCASimulator
          :profile="userInputsStore.profile"
          :allocation="portfolioStore.allocation"
        />

        <!-- Gráfica de crecimiento -->
        <BaseCard variant="elevated" padding="lg">
          <ComparisonChart
            :snapshots="resultado.snapshots"
            label="Crecimiento mes a mes"
          />
        </BaseCard>

        <!-- Acción guardar -->
        <div class="simulator-actions">
          <BaseButton variant="secondary" @click="guardarSimulacion">
            Guardar simulación
          </BaseButton>
          <BaseButton variant="primary" @click="router.push({ name: 'home' })">
            Nuevo diagnóstico
          </BaseButton>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

.simulator-view {
  @apply min-h-screen bg-bg-primary px-4 py-8;
}

.simulator-container {
  @apply max-w-4xl mx-auto flex flex-col gap-8;
}

.simulator-nav {
  @apply flex items-center justify-between;
}

.nav-back {
  @apply font-body text-sm text-text-secondary hover:text-accent-growth transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded;
}

.nav-brand {
  @apply font-heading text-sm font-semibold text-text-muted;
}

.simulator-actions {
  @apply flex gap-3 justify-end;
}
</style>
