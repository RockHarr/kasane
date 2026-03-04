<script setup lang="ts">
/**
 * SimulatorView v2.0 — Kasane
 *
 * Pantalla "Tu Estrategia de Aportes Constantes" rediseñada.
 * Flujo simplificado:
 *   1. Comparativa "Bajo el colchón" vs "Magia Compuesta" (reactiva)
 *   2. Dropdown de instrumento único (mobile-friendly)
 *   3. Gráfico 2 líneas: ahorro lineal vs proyección del instrumento
 *   4. Acciones: Guardar simulación | Nuevo diagnóstico
 *
 * Moneda: CLP primario, USD secundario (tasa estática en divisas.ts)
 */
import { computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onBeforeRouteLeave } from 'vue-router'
import { useUserInputsStore } from '@/stores/userInputs'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore } from '@/stores/auth'
import { calcularDCA } from '@/services/calculations'
import { INSTRUMENTOS, findInstrumento } from '@/data/instruments'
import SimuladorResultados from '@/components/organisms/SimuladorResultados.vue'
import InstrumentoSelector from '@/components/organisms/InstrumentoSelector.vue'
import ComparisonChart from '@/components/organisms/ComparisonChart.vue'
import SimulatorSkeleton from '@/components/organisms/SimulatorSkeleton.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import KasaneLogo from '@/components/atoms/KasaneLogo.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const userInputsStore = useUserInputsStore()
const portfolioStore = usePortfolioStore()
const authStore = useAuthStore()
const toast = useToast()

// ─── Estado ──────────────────────────────────────────────────

/**
 * Instrumento seleccionado. Default: leer query param `?instrumento=`
 * (pasado por ProyeccionBase) o caer en 'tenpo'.
 */
const instrumentoId = ref<string>(
  (router.currentRoute.value.query.instrumento as string) ?? 'tenpo'
)

/** El instrumento que se destacó en el dashboard (viene en la URL) */
const destacadoId = ref<string>(
  (router.currentRoute.value.query.instrumento as string) ?? 'tenpo'
)

const instrumento = computed(() => findInstrumento(instrumentoId.value) ?? INSTRUMENTOS[0])

/** Si el usuario cambió instrumento pero aún no guardó */
const unsavedChanges = ref(false)
const saving = ref(false)

// Marcar cambios sin guardar al cambiar instrumento
watch(instrumentoId, () => { unsavedChanges.value = true })

// ─── Redirect guard ───────────────────────────────────────────

watch(
  () => userInputsStore.loading,
  loading => {
    if (!loading && !userInputsStore.hasProfile) {
      router.replace({ name: 'onboarding' })
    }
  },
  { immediate: true }
)

// ─── Navigation guard (avisa si sale sin guardar) ─────────────

onBeforeRouteLeave((_to, _from, next) => {
  if (unsavedChanges.value) {
    const ok = window.confirm('¿Salir sin guardar esta simulación?')
    next(ok)
  } else {
    next()
  }
})

// ─── Datos del gráfico 2 líneas ───────────────────────────────

/**
 * Genera los puntos de la proyección mes a mes para el gráfico.
 * Solo cada 6 meses para no saturar el eje X.
 */
const dcaPoints = computed(() => {
  const profile = userInputsStore.profile
  if (!profile) return { ahorro: [] as number[], proyeccion: [] as number[], categorias: [] as string[] }

  const paso = profile.horizonte <= 24 ? 3 : profile.horizonte <= 60 ? 6 : 12
  const meses: number[] = []
  for (let m = paso; m <= profile.horizonte; m += paso) meses.push(m)

  const ahorro = meses.map(m => profile.excedente + profile.aporteMensual * m)

  const resultado = calcularDCA({
    capitalInicial: profile.excedente,
    aporteMensual: profile.aporteMensual,
    horizonte: profile.horizonte,
    tasaAnual: instrumento.value.tasaAnual,
  })

  const proyeccion = meses.map(m => {
    const snap = resultado.snapshots.find(s => s.mes === m)
    return snap?.valorTotal ?? 0
  })

  const categorias = meses.map(m => {
    const años = Math.floor(m / 12)
    const resto = m % 12
    if (años === 0) return `${m}m`
    if (resto === 0) return `${años}a`
    return `${años}a${resto}m`
  })

  return { ahorro, proyeccion, categorias }
})

// ─── Acciones ─────────────────────────────────────────────────

function goBack() {
  router.push({ name: 'dashboard' })
}

async function handleLogout() {
  await authStore.signOut()
  router.replace({ name: 'login' })
}

async function guardarSimulacion() {
  if (!userInputsStore.profile || !authStore.user) return
  saving.value = true
  try {
    const { saveSimulation } = await import('@/services/firestore')
    const resultado = calcularDCA({
      capitalInicial: userInputsStore.profile.excedente,
      aporteMensual: userInputsStore.profile.aporteMensual,
      horizonte: userInputsStore.profile.horizonte,
      tasaAnual: instrumento.value.tasaAnual,
    })
    await saveSimulation(authStore.user.uid, {
      profile: userInputsStore.profile,
      allocation: portfolioStore.allocation,
      resultado: {
        valorFinal: resultado.valorFinal,
        totalAportado: resultado.totalAportado,
        ganancia: resultado.ganancia,
        rentabilidadTotal: resultado.rentabilidadTotal,
        tasaAnual: instrumento.value.tasaAnual,
      },
    })
    unsavedChanges.value = false
    toast.success(`¡Simulación con ${instrumento.value.name} guardada!`)
  } catch {
    toast.error('Ocurrió un error al guardar. Intenta de nuevo.')
  } finally {
    saving.value = false
  }
}

function nuevodiagnostico() {
  // Llevamos al onboarding para que el usuario actualice su perfil financiero
  unsavedChanges.value = false
  router.push({ name: 'onboarding' })
}
</script>

<template>
  <main class="sim-view">
    <!-- Carga Progresiva -->
    <SimulatorSkeleton v-if="!userInputsStore.profile" />

    <div v-else class="sim-container">
      <!-- Nav -->
      <nav class="sim-nav">
        <button class="sim-nav-back" aria-label="Volver al portafolio" @click="goBack">
          ← Portafolio
        </button>
        <div class="sim-nav-right">
          <KasaneLogo size="sm" />
          <button class="sim-nav-logout" aria-label="Cerrar sesión" @click="handleLogout">Salir</button>
        </div>
      </nav>

      <!-- Título -->
      <header class="sim-header">
        <h1 class="sim-title">Tu Estrategia de Aportes Constantes</h1>
        <p class="sim-subtitle">
          Descubre cuánto puede crecer tu dinero según el instrumento que elijas.
        </p>
      </header>

      <!-- 1. Comparativa reactiva al instrumento seleccionado -->
      <SimuladorResultados
        :profile="userInputsStore.profile"
        :instrumento="instrumento"
      />

      <!-- 2. Selector de instrumento -->
      <BaseCard variant="elevated" padding="md">
        <InstrumentoSelector
          v-model="instrumentoId"
          :instrumentos="INSTRUMENTOS"
          :destacado-id="destacadoId"
        />
      </BaseCard>

      <!-- 3. Gráfico 2 líneas -->
      <BaseCard variant="elevated" padding="md">
        <ComparisonChart
          :ahorro-data="dcaPoints.ahorro"
          :proyeccion-data="dcaPoints.proyeccion"
          :proyeccion-color="instrumento.color"
          :proyeccion-label="instrumento.name"
          :dca-categories="dcaPoints.categorias"
          :label="`Proyección de tu estrategia · ${instrumento.name}`"
          chart-type="area"
        />
      </BaseCard>

      <!-- 4. Acciones -->
      <div class="sim-actions">
        <button class="sim-historial-link" @click="router.push({ name: 'simulations' })">
          Ver historial →
        </button>
        <BaseButton variant="secondary" :disabled="saving" @click="guardarSimulacion">
          {{ saving ? 'Guardando...' : 'Guardar simulación' }}
        </BaseButton>
        <BaseButton variant="primary" @click="nuevodiagnostico">
          Nuevo diagnóstico
        </BaseButton>
      </div>
    </div>
  </main>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../tailwind.config.js";

.sim-view {
  @apply min-h-screen bg-bg-primary px-4 py-8;
}

.sim-container {
  @apply max-w-2xl mx-auto flex flex-col gap-6;
}

/* Nav */
.sim-nav {
  @apply flex items-center justify-between;
}

.sim-nav-back {
  @apply font-body text-sm text-text-secondary hover:text-accent-growth transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded;
}

.sim-nav-right {
  @apply flex items-center gap-4;
}

.sim-nav-logout {
  @apply font-body text-xs text-text-muted hover:text-accent-alert transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert rounded;
}

/* Header */
.sim-header {
  @apply flex flex-col gap-1;
}

.sim-title {
  @apply font-heading text-2xl font-bold text-text-primary;
}

.sim-subtitle {
  @apply font-body text-sm text-text-secondary;
}

/* Acciones */
.sim-actions {
  @apply flex gap-3 justify-end items-center flex-wrap pb-6;
}

.sim-historial-link {
  @apply font-body text-sm text-text-secondary hover:text-accent-neutral transition-colors mr-auto;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral rounded;
}

/* Transición fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
