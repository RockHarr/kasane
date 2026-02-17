<script setup lang="ts">
// SimulatorView: pantalla del simulador DCA
// Responsabilidad: orquestar OCASimulator + ComparisonChart con datos de los stores
import { computed, onMounted, ref } from 'vue'
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

// Estado del guardado
const saving = ref(false)
const saveStatus = ref<'idle' | 'success' | 'error'>('idle')

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

async function handleLogout() {
  await authStore.logout()
  router.replace({ name: 'login' })
}

async function guardarSimulacion() {
  if (!resultado.value || !userInputsStore.profile || !authStore.user) return
  saving.value = true
  saveStatus.value = 'idle'
  try {
    const { saveSimulation } = await import('@/services/firestore')
    await saveSimulation(authStore.user.uid, {
      profile: userInputsStore.profile,
      allocation: portfolioStore.allocation,
    })
    saveStatus.value = 'success'
    setTimeout(() => { saveStatus.value = 'idle' }, 3000)
  } catch {
    saveStatus.value = 'error'
    setTimeout(() => { saveStatus.value = 'idle' }, 3000)
  } finally {
    saving.value = false
  }
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
        <div class="nav-right">
          <span class="nav-brand">Tesorería Simple</span>
          <button class="nav-logout" @click="handleLogout" aria-label="Cerrar sesión">
            Salir
          </button>
        </div>
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
          <!-- Feedback de guardado -->
          <transition name="fade">
            <p v-if="saveStatus === 'success'" class="save-msg save-msg--ok" role="status">
              ✓ Simulación guardada
            </p>
            <p v-else-if="saveStatus === 'error'" class="save-msg save-msg--error" role="alert">
              ✗ Error al guardar, intenta de nuevo
            </p>
          </transition>

          <BaseButton variant="secondary" :disabled="saving" @click="guardarSimulacion">
            {{ saving ? 'Guardando...' : 'Guardar simulación' }}
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

.simulator-actions {
  @apply flex gap-3 justify-end items-center flex-wrap;
}

.save-msg {
  @apply text-sm font-body mr-auto;
}

.save-msg--ok {
  @apply text-accent-growth;
}

.save-msg--error {
  @apply text-accent-alert;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
