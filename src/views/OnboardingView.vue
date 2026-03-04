<script setup lang="ts">
// OnboardingView: wizard de 4 pasos
// Paso 1 — ¿Quién eres?  Paso 2 — ¿Desde dónde?  Paso 3 — Tus montos  Paso 4 — Tu meta
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'
import { useUserInputsStore } from '@/stores/userInputs'
import type { OnboardingProfile, MetaId } from '@/types'
import { METAS } from '@/data/metas'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const userInputsStore = useUserInputsStore()

// --- Estado del wizard -------------------------------------------
const step = ref(1)
const saving = ref(false)
const direction = ref<'forward' | 'back'>('forward')
const TOTAL_STEPS = 4

// Paso 1
const perfil = ref<'freelancer' | 'emprendedor' | ''>('')
const genero = ref<'M' | 'F' | null>(null) // opcional, no bloquea avance
// Paso 2
const pais = ref<'CL' | 'global' | ''>('')
// Paso 3
const aporteMensual = ref('')
const horizonte = ref<6 | 12 | 24 | 36 | null>(null)
// Paso 4
const meta = ref<MetaId | null>(null) // opcional, no bloquea avance

onMounted(() => {
  // Si viene con intención de editar, pre-cargamos sus datos actuales
  if (onboardingStore.profile) {
    perfil.value = onboardingStore.profile.perfil
    if (onboardingStore.profile.genero) genero.value = onboardingStore.profile.genero
    pais.value = onboardingStore.profile.pais
    if (onboardingStore.profile.meta) meta.value = onboardingStore.profile.meta
  }
  if (userInputsStore.profile) {
    aporteMensual.value = String(userInputsStore.profile.aporteMensual)
    horizonte.value = userInputsStore.profile.horizonte as 6 | 12 | 24 | 36
  }
})

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
  if (step.value === 4) return true // meta siempre opcional
  return false
})

const stepTitles = ['¿Quién eres?', '¿Desde dónde inviertes?', 'Tus montos', '¿Para qué es este dinero?']

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
      genero: genero.value,
      meta: meta.value,
    }
    await onboardingStore.setOnboarding(onboardingData, authStore.user.uid)

    // UserProfile con defaults: excedente = aporte (todo lo disponible),
    // reserva = 0 (configurable desde el Dashboard).
    await userInputsStore.setProfile(
      { excedente: aporte, reserva: 0, aporteMensual: aporte, horizonte: meses },
      authStore.user.uid
    )

    // Pequeño delay para asegurar que Firestore termine de guardar
    await new Promise(resolve => setTimeout(resolve, 300))

    router.replace({ name: 'dashboard' })
  } catch (error) {
    console.error('[onboarding] Error al guardar:', error)
    saving.value = false
  }
}
</script>

<template>
  <main class="onboarding-view" @keydown="handleKeydown">
    <div class="onboarding-container" :class="{ 'max-w-2xl': step >= 3, 'max-w-lg': step < 3 }">

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
          <div v-if="step === 1" class="step1-wrapper">
            <div class="choice-grid">
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

            <!-- Género: opcional, no bloquea avance -->
            <div class="genero-picker" aria-label="Identificación opcional">
              <p class="genero-label">
                ¿Cómo te identificas?
                <span class="genero-optional">opcional</span>
              </p>
              <div class="genero-btns" role="group" aria-label="Selección de género">
                <button
                  class="genero-btn"
                  :class="{ 'is-active': genero === 'F' }"
                  type="button"
                  :aria-pressed="genero === 'F'"
                  @click="genero = genero === 'F' ? null : 'F'"
                >
                  Ella
                </button>
                <button
                  class="genero-btn"
                  :class="{ 'is-active': genero === 'M' }"
                  type="button"
                  :aria-pressed="genero === 'M'"
                  @click="genero = genero === 'M' ? null : 'M'"
                >
                  Él
                </button>
              </div>
            </div>
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

          <!-- Paso 4: ¿Para qué es este dinero? -->
          <div v-else-if="step === 4" class="meta-form">
            <p class="meta-hint">Elige una o salta — no es obligatorio.</p>
            <div class="meta-grid" role="group" aria-label="Selección de meta">
              <button
                v-for="m in METAS"
                :key="m.id"
                class="meta-card"
                :class="{ 'is-selected': meta === m.id }"
                type="button"
                :aria-pressed="meta === m.id"
                @click="meta = meta === m.id ? null : m.id"
              >
                <span class="meta-emoji" aria-hidden="true">{{ m.emoji }}</span>
                <span class="meta-label">{{ m.label }}</span>
                <span class="meta-sublabel">{{ m.sublabel }}</span>
              </button>
            </div>
            <button class="meta-skip" type="button" @click="advance">
              Saltar por ahora →
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

<style scoped lang="postcss">
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

/* Paso 1 wrapper */
.step1-wrapper {
  @apply flex flex-col gap-5;
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

/* Meta gallery (paso 4) */
.meta-form {
  @apply flex flex-col gap-4;
}

.meta-hint {
  @apply font-body text-sm text-text-muted text-center;
}

.meta-grid {
  @apply grid grid-cols-2 gap-3 sm:grid-cols-3;
}

.meta-card {
  @apply flex flex-col items-center gap-1.5 p-4 rounded-xl cursor-pointer;
  @apply border border-white/10 bg-bg-elevated transition-all duration-200;
  @apply hover:border-accent-growth/30 hover:bg-accent-growth/5;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth;
  @apply text-center;
}

.meta-card.is-selected {
  @apply border-accent-growth bg-accent-growth/10;
  box-shadow: 0 0 16px color-mix(in srgb, var(--color-accent-growth, #00ffaa) 10%, transparent);
}

.meta-emoji {
  @apply text-2xl leading-none;
}

.meta-label {
  @apply font-heading text-xs font-semibold text-text-primary;
}

.meta-sublabel {
  @apply font-body text-[10px] text-text-muted leading-snug;
}

.meta-skip {
  @apply font-body text-xs text-text-muted text-center;
  @apply hover:text-text-secondary transition-colors mt-1;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral rounded px-2 py-1;
}

/* Género picker */
.genero-picker {
  @apply flex flex-col gap-2 items-center;
}

.genero-label {
  @apply font-body text-xs text-text-muted flex items-center gap-2;
}

.genero-optional {
  @apply bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] text-text-muted;
}

.genero-btns {
  @apply flex items-center gap-2;
}

.genero-btn {
  @apply font-body text-xs font-medium text-text-muted px-5 py-1.5 rounded-full;
  @apply border border-white/10 bg-bg-elevated transition-all duration-200;
  @apply hover:border-white/25 hover:text-text-secondary cursor-pointer;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-neutral;
}

.genero-btn.is-active {
  @apply border-accent-neutral/50 bg-accent-neutral/10 text-accent-neutral;
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
