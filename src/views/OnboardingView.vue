<script setup lang="ts">
// OnboardingView: wizard de 3 pasos
// Paso 1 — ¿Quién eres?  Paso 2 — ¿Desde dónde?  Paso 3 — Tus montos
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'
import { useUserInputsStore } from '@/stores/userInputs'
import type { OnboardingProfile } from '@/types'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const userInputsStore = useUserInputsStore()

// --- Estado del wizard -------------------------------------------
const step = ref(1)
const saving = ref(false)
const direction = ref<'forward' | 'back'>('forward')
const TOTAL_STEPS = 3

// Paso 1
const perfil = ref<'freelancer' | 'emprendedor' | ''>('')
// Paso 2
const pais = ref<'CL' | 'global' | ''>('')
// Paso 3
const aporteMensual = ref('')
const horizonte = ref<6 | 12 | 24 | 36 | null>(null)

const monedaLabel = computed(() => pais.value === 'CL' ? 'CLP' : 'USD')
const aportePlaceholder = computed(() => pais.value === 'CL' ? 'ej: 50.000' : 'ej: 50')

const HORIZONTES: { value: 6 | 12 | 24 | 36; label: string; sublabel: string }[] = [
  { value: 6,  label: '6 meses',  sublabel: 'Corto plazo' },
  { value: 12, label: '1 año',    sublabel: 'Mi meta anual' },
  { value: 24, label: '2 años',   sublabel: 'Plazo medio' },
  { value: 36, label: '3 años',   sublabel: 'Largo plazo' },
]

const canAdvance = computed(() => {
  if (step.value === 1) return perfil.value !== ''
  if (step.value === 2) return pais.value !== ''
  if (step.value === 3) return Number(aporteMensual.value) > 0 && horizonte.value !== null
  return false
})

const stepTitles = ['¿Quién eres?', '¿Desde dónde inviertes?', 'Tus montos']

// --- Navegación --------------------------------------------------
function advance() {
  if (!canAdvance.value || saving.value) return
  if (step.value < TOTAL_STEPS) {
    direction.value = 'forward'
    step.value++
  } else {
    handleComplete()
  }
}

function back() {
  if (step.value > 1 && !saving.value) {
    direction.value = 'back'
    step.value--
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && canAdvance.value && step.value < TOTAL_STEPS) {
    e.preventDefault()
    advance()
  }
}

// --- Guardar y redirigir -----------------------------------------
async function handleComplete() {
  if (!authStore.user) return
  saving.value = true
  try {
    const aporte = Number(aporteMensual.value)
    const meses = horizonte.value!

    const onboardingData: OnboardingProfile = {
      perfil: perfil.value as 'freelancer' | 'emprendedor',
      pais: pais.value as 'CL' | 'global',
      aporteMensual: aporte,
      horizonte: meses,
    }
    await onboardingStore.setOnboarding(onboardingData, authStore.user.uid)

    // UserProfile con defaults: excedente = aporte (todo lo disponible),
    // reserva = 0 (configurable desde el Dashboard).
    await userInputsStore.setProfile(
      { excedente: aporte, reserva: 0, aporteMensual: aporte, horizonte: meses },
      authStore.user.uid
    )

    router.replace({ name: 'dashboard' })
  } catch (error) {
    console.error('[onboarding] Error al guardar:', error)
    saving.value = false
  }
}
</script>

<template>
  <main class="onboarding-view" @keydown="handleKeydown">
    <div class="onboarding-container" :class="{ 'max-w-2xl': step === 3, 'max-w-lg': step < 3 }">

      <!-- Brand -->
      <p class="ob-brand">Kas<span class="ob-brand-accent">ane</span></p>

      <!-- Dots de progreso -->
      <div
        class="step-dots"
        role="progressbar"
        :aria-valuenow="step"
        aria-valuemin="1"
        :aria-valuemax="TOTAL_STEPS"
      >
        <span
          v-for="n in TOTAL_STEPS"
          :key="n"
          class="dot"
          :class="{ 'is-done': n < step, 'is-active': n === step }"
          :aria-label="`Paso ${n}`"
        />
      </div>

      <!-- Contenido del paso -->
      <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'" mode="out-in">
        <div :key="step" class="step-content">
          <h1 class="step-title">{{ stepTitles[step - 1] }}</h1>

          <!-- Paso 1: ¿Quién eres? -->
          <div v-if="step === 1" class="choice-grid">
            <button
              class="choice-card"
              :class="{ 'is-selected': perfil === 'freelancer' }"
              type="button"
              :aria-pressed="perfil === 'freelancer'"
              @click="perfil = 'freelancer'"
            >
              <span class="choice-icon" aria-hidden="true">💼</span>
              <h3 class="choice-title">Freelancer</h3>
              <p class="choice-desc">Trabajo independiente,<br />facturo por proyecto</p>
            </button>
            <button
              class="choice-card"
              :class="{ 'is-selected': perfil === 'emprendedor' }"
              type="button"
              :aria-pressed="perfil === 'emprendedor'"
              @click="perfil = 'emprendedor'"
            >
              <span class="choice-icon" aria-hidden="true">🚀</span>
              <h3 class="choice-title">Emprendedor</h3>
              <p class="choice-desc">Tengo o estoy construyendo<br />un negocio</p>
            </button>
          </div>

          <!-- Paso 2: ¿Desde dónde? -->
          <div v-else-if="step === 2" class="choice-grid">
            <button
              class="choice-card"
              :class="{ 'is-selected': pais === 'CL' }"
              type="button"
              :aria-pressed="pais === 'CL'"
              @click="pais = 'CL'"
            >
              <span class="choice-icon" aria-hidden="true">🇨🇱</span>
              <h3 class="choice-title">Chile</h3>
              <p class="choice-desc">Veo UF, UTM y tasas<br />del Banco Central</p>
            </button>
            <button
              class="choice-card"
              :class="{ 'is-selected': pais === 'global' }"
              type="button"
              :aria-pressed="pais === 'global'"
              @click="pais = 'global'"
            >
              <span class="choice-icon" aria-hidden="true">🌎</span>
              <h3 class="choice-title">Global</h3>
              <p class="choice-desc">Veo USD, EUR,<br />BTC y ETH</p>
            </button>
          </div>

          <!-- Paso 3: Tus montos -->
          <div v-else-if="step === 3" class="montos-form">
            <!-- Aporte mensual -->
            <div class="montos-field">
              <label for="aporte-mensual" class="montos-label">
                En un mes tranquilo, ¿cuánto podrías separar?
              </label>
              <p class="montos-hint">Ponlo conservador. Mejor cumplir menos que frustrarse con más.</p>
              <div class="aporte-input-row">
                <input
                  id="aporte-mensual"
                  v-model="aporteMensual"
                  class="aporte-input"
                  type="number"
                  :placeholder="aportePlaceholder"
                  min="1"
                  autofocus
                  @keydown.e.prevent
                  @keydown.-.prevent
                  @keydown.+.prevent
                />
                <span class="aporte-moneda">{{ monedaLabel }}</span>
              </div>
            </div>

            <!-- Horizonte: tarjetas visuales -->
            <div class="montos-field">
              <p class="montos-label">¿En cuánto tiempo quieres ver resultados?</p>
              <div class="horizonte-grid">
                <button
                  v-for="h in HORIZONTES"
                  :key="h.value"
                  class="horizonte-card"
                  :class="{ 'is-selected': horizonte === h.value }"
                  type="button"
                  :aria-pressed="horizonte === h.value"
                  @click="horizonte = h.value"
                >
                  <span class="horizonte-label">{{ h.label }}</span>
                  <span class="horizonte-sub">{{ h.sublabel }}</span>
                </button>
              </div>
            </div>

            <!-- Preview -->
            <Transition name="fade">
              <p v-if="Number(aporteMensual) > 0 && horizonte" class="montos-preview">
                📈 <strong>{{ Number(aporteMensual).toLocaleString('es-CL') }} {{ monedaLabel }}/mes</strong>
                durante <strong>{{ horizonte }} meses</strong> — veamos qué puedes lograr
              </p>
            </Transition>
          </div>

        </div>
      </Transition>

      <!-- Acciones -->
      <div class="ob-actions">
        <button
          v-if="step > 1"
          class="ob-back"
          type="button"
          :disabled="saving"
          @click="back"
        >← Atrás</button>

        <BaseButton
          variant="primary"
          :disabled="!canAdvance || saving"
          class="ob-next"
          @click="advance"
        >
          <span v-if="saving">Guardando...</span>
          <span v-else-if="step < TOTAL_STEPS">Continuar →</span>
          <span v-else>Ver mis opciones →</span>
        </BaseButton>
      </div>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

.onboarding-view {
  @apply min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12;
}
.onboarding-container {
  @apply w-full max-w-lg flex flex-col gap-8;
}

/* Brand */
.ob-brand {
  @apply font-heading text-xl font-bold text-text-primary text-center;
}
.ob-brand-accent {
  @apply text-accent-growth;
}

/* Dots */
.step-dots {
  @apply flex items-center justify-center gap-2;
}
.dot {
  @apply w-2 h-2 rounded-full bg-white/20 transition-all duration-300;
}
.dot.is-done {
  @apply bg-accent-growth/60;
}
.dot.is-active {
  @apply bg-accent-growth w-6;
}

/* Step */
.step-content {
  @apply flex flex-col gap-6;
}
.step-title {
  @apply font-heading text-3xl font-bold text-text-primary text-center;
}

/* Choice cards (pasos 1 y 2) */
.choice-grid {
  @apply grid grid-cols-2 gap-4;
}
.choice-card {
  @apply flex flex-col items-center gap-3 p-6 rounded-2xl cursor-pointer;
  @apply border-2 border-white/10 bg-bg-elevated transition-all duration-200;
  @apply hover:border-accent-growth/40 hover:bg-accent-growth/5;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth;
}
.choice-card.is-selected {
  @apply border-accent-growth bg-accent-growth/10;
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent-growth, #00ffaa) 15%, transparent);
}
.choice-icon {
  @apply text-4xl leading-none;
}
.choice-title {
  @apply font-heading text-base font-semibold text-text-primary;
}
.choice-desc {
  @apply font-body text-xs text-text-muted text-center leading-relaxed;
}

/* Montos (paso 3) */
.montos-form {
  @apply flex flex-col gap-6;
}
.montos-hint {
  @apply font-body text-sm text-text-muted text-center;
}
.montos-field {
  @apply flex flex-col gap-3;
}
.montos-label {
  @apply font-body text-sm font-medium text-text-secondary;
}
.aporte-input-row {
  @apply flex items-center gap-3;
}
.aporte-input {
  @apply flex-1 bg-bg-elevated border border-white/10 rounded-xl px-5 py-4;
  @apply font-mono text-lg text-text-primary placeholder:text-text-muted;
  @apply outline-none transition-all duration-200 focus:border-accent-neutral;
  min-width: 0;
}
.aporte-moneda {
  @apply font-mono text-sm font-bold text-accent-neutral bg-accent-neutral/10 px-3 py-2 rounded-lg;
}
.horizonte-grid {
  @apply grid grid-cols-2 gap-3 sm:grid-cols-4;
}
.horizonte-card {
  @apply flex flex-col items-center gap-1 py-4 px-2 rounded-xl cursor-pointer;
  @apply border border-white/10 bg-bg-elevated transition-all duration-200;
  @apply hover:border-accent-growth/40;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth;
}
.horizonte-card.is-selected {
  @apply border-accent-growth bg-accent-growth/10;
}
.horizonte-label {
  @apply font-heading text-sm font-bold text-text-primary;
}
.horizonte-sub {
  @apply font-body text-[10px] text-text-muted text-center;
}
.montos-preview {
  @apply font-body text-sm text-accent-growth text-center;
  @apply bg-accent-growth/10 border border-accent-growth/20 rounded-xl px-4 py-3;
}

/* Acciones */
.ob-actions {
  @apply flex items-center gap-3 justify-end;
}
.ob-back {
  @apply font-body text-sm text-text-secondary hover:text-text-primary transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded px-2 py-1;
}
.ob-next {
  @apply flex-1;
}
@media (min-width: 480px) {
  .ob-next { @apply flex-none; }
}

/* Transiciones */
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.25s ease;
}
.slide-left-enter-from  { opacity: 0; transform: translateX(24px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-24px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-24px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(24px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
