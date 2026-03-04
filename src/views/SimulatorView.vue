<script setup lang="ts">
/**
 * SimulatorView v2.2 — Kasane
 *
 * Flujo de revelación progresiva:
 *   0. Modal educativo (KasaneEducaModal) — primera visita
 *   1. "Bajo el colchón" — siempre visible
 *   2. Gráfico — empieza con solo línea gris (ahorro puro)
 *   3. Selector de instrumento — chips horizontales
 *   4. "Magia Compuesta" — aparece tras seleccionar instrumento
 *   5. Acciones: Guardar | Nuevo diagnóstico
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
import KasaneEducaModal from '@/components/organisms/KasaneEducaModal.vue'
import BottomTabBar from '@/components/organisms/BottomTabBar.vue'
import MarketTicker from '@/components/organisms/MarketTicker.vue'
import SettingsPanel from '@/components/organisms/SettingsPanel.vue'
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
 * ID del instrumento seleccionado.
 * Empieza en null — el usuario debe elegir activamente.
 * El query param ?instrumento= solo sirve para destacar con ⭐, no pre-selecciona.
 */
const instrumentoId = ref<string | null>(null)

/** Instrumento que se destacó en el dashboard (viene en la URL) */
const destacadoId = ref<string>(
  (router.currentRoute.value.query.instrumento as string) ?? 'tenpo'
)

/** Instrumento resuelto o null si no hay selección */
const instrumento = computed(() =>
  instrumentoId.value ? (findInstrumento(instrumentoId.value) ?? null) : null
)

/** Si el usuario seleccionó instrumento pero aún no guardó */
const unsavedChanges = ref(false)
const saving = ref(false)

// Marcar cambios sin guardar al seleccionar instrumento
watch(instrumentoId, () => { if (instrumentoId.value) unsavedChanges.value = true })

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
 * Genera los puntos del gráfico.
 * - Siempre incluye la línea de ahorro puro (gris).
 * - Incluye la línea de proyección solo cuando hay instrumento seleccionado.
 */
const dcaPoints = computed(() => {
  const profile = userInputsStore.profile
  if (!profile) return { ahorro: [] as number[], proyeccion: undefined as number[] | undefined, categorias: [] as string[] }

  const paso = profile.horizonte <= 24 ? 3 : profile.horizonte <= 60 ? 6 : 12
  const meses: number[] = []
  for (let m = paso; m <= profile.horizonte; m += paso) meses.push(m)

  const ahorro = meses.map(m => profile.excedente + profile.aporteMensual * m)

  // Proyección solo si hay instrumento seleccionado
  const proyeccion = instrumento.value
    ? meses.map(m => {
        const resultado = calcularDCA({
          capitalInicial: profile.excedente,
          aporteMensual: profile.aporteMensual,
          horizonte: profile.horizonte,
          tasaAnual: instrumento.value!.tasaAnual,
        })
        const snap = resultado.snapshots.find(s => s.mes === m)
        return snap?.valorTotal ?? 0
      })
    : undefined

  const categorias = meses.map(m => {
    const años = Math.floor(m / 12)
    const resto = m % 12
    if (años === 0) return `${m}m`
    if (resto === 0) return `${años}a`
    return `${años}a${resto}m`
  })

  return { ahorro, proyeccion, categorias }
})

/** Label del gráfico según estado */
const chartLabel = computed(() =>
  instrumento.value
    ? `Proyección de tu estrategia · ${instrumento.value.name}`
    : 'Tu ahorro acumulado sin invertir'
)

// ─── Acciones ─────────────────────────────────────────────────

function goBack() {
  router.push({ name: 'dashboard' })
}

async function handleLogout() {
  await authStore.signOut()
  router.replace({ name: 'login' })
}

async function guardarSimulacion() {
  if (!userInputsStore.profile || !authStore.user || !instrumento.value) return
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
        tasaAnual: instrumento.value!.tasaAnual,
      },
    })
    unsavedChanges.value = false
    toast.success(`¡Simulación con ${instrumento.value!.name} guardada!`)
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
    <!-- Modal educativo — primera visita -->
    <KasaneEducaModal />

    <!-- Carga Progresiva -->
    <SimulatorSkeleton v-if="!userInputsStore.profile" />

    <div v-else class="sim-shell">
      <!-- Nav superior -->
      <nav class="sim-nav">
        <KasaneLogo size="sm" />
        <div class="sim-nav-controls">
          <SettingsPanel />
          <button class="sim-nav-logout" aria-label="Cerrar sesión" @click="handleLogout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      <!-- Scrollable content -->
      <div class="sim-scroll">
        <div class="sim-container">

          <!-- Título -->
          <header class="sim-header">
            <h1 class="sim-title">Tu Estrategia de Aportes Constantes</h1>
            <p class="sim-subtitle">Descubre cuánto puede crecer tu dinero eligiendo un instrumento.</p>
          </header>

          <!-- 1. Bajo el colchón (siempre visible) + Magia Compuesta (tras selección) -->
          <SimuladorResultados
            :profile="userInputsStore.profile"
            :instrumento="instrumento"
          />

          <!-- 2. Gráfico — empieza solo con línea gris, se actualiza al seleccionar -->
          <BaseCard variant="elevated" padding="md">
            <ComparisonChart
              :ahorro-data="dcaPoints.ahorro"
              :proyeccion-data="dcaPoints.proyeccion"
              :proyeccion-color="instrumento?.color"
              :proyeccion-label="instrumento?.name"
              :dca-categories="dcaPoints.categorias"
              :label="chartLabel"
              chart-type="area"
            />
          </BaseCard>

          <!-- 3. Selector de instrumento -->
          <BaseCard variant="elevated" padding="md">
            <InstrumentoSelector
              :model-value="instrumentoId ?? ''"
              :instrumentos="INSTRUMENTOS"
              :destacado-id="destacadoId"
              @update:model-value="instrumentoId = $event"
            />
          </BaseCard>

          <!-- 4. Acciones -->
          <div class="sim-actions">
            <button class="sim-historial-link" @click="router.push({ name: 'simulations' })">
              Ver historial →
            </button>
            <BaseButton
              variant="secondary"
              :disabled="saving || !instrumento"
              @click="guardarSimulacion"
            >
              {{ saving ? 'Guardando...' : 'Guardar simulación' }}
            </BaseButton>
            <BaseButton variant="primary" @click="nuevodiagnostico">
              Nuevo diagnóstico
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Bottom chrome: ticker + tab bar (mobile only) -->
      <div class="sim-bottom-chrome md:hidden">
        <MarketTicker />
        <BottomTabBar
          active-tab="portafolio"
          @update:active-tab="router.push({ name: 'dashboard' })"
        />
      </div>
    </div>
  </main>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../tailwind.config.js";

.sim-view {
  @apply bg-bg-primary;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sim-shell {
  @apply flex flex-col;
  height: 100%;
  overflow: hidden;
}

/* Nav superior — igual al Dashboard */
.sim-nav {
  @apply flex items-center justify-between;
  @apply px-4 py-3 bg-bg-elevated/90 border-b border-white/8;
  backdrop-filter: blur(20px);
  flex-shrink: 0;
}

.sim-nav-controls {
  @apply flex items-center gap-3;
}

.sim-nav-logout {
  @apply text-text-muted hover:text-accent-alert transition-colors p-1.5 rounded-lg;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-alert;
}

/* Scroll area */
.sim-scroll {
  @apply flex-1 overflow-y-auto;
}

.sim-container {
  @apply max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6;
  padding-bottom: 1.5rem;
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
  @apply flex gap-3 justify-end items-center flex-wrap pb-4;
}

.sim-historial-link {
  @apply font-body text-sm text-text-secondary hover:text-accent-neutral transition-colors mr-auto;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral rounded;
}

/* Bottom chrome */
.sim-bottom-chrome {
  @apply flex flex-col;
  flex-shrink: 0;
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
