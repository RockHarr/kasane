<script setup lang="ts">
// OnboardingView: wizard de identidad de 3 pasos
// Paso 1 — ¿Quién eres?  Paso 2 — ¿Qué quieres lograr?  Paso 3 — ¿De dónde eres?
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'
import type { OnboardingProfile } from '@/types'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

// ─── Estado del wizard ──────────────────────────────────────
const step = ref(1)
const saving = ref(false)
const direction = ref<'forward' | 'back'>('forward')

// Paso 1
const perfil = ref<'freelancer' | 'emprendedor' | ''>('')
// Paso 2
const meta = ref('')
const monteMeta = ref('')
const monedaMeta = ref<'CLP' | 'USD' | 'UF'>('USD')
// Paso 3
const pais = ref<'CL' | 'global' | ''>('')

const canAdvance = computed(() => {
  if (step.value === 1) return perfil.value !== ''
  if (step.value === 2) return meta.value.trim().length >= 2 && Number(monteMeta.value) > 0
  if (step.value === 3) return pais.value !== ''
  return false
})

const monedaOpciones = [
  { value: 'USD', label: 'USD' },
  { value: 'CLP', label: 'CLP' },
  { value: 'UF', label: 'UF' },
]

function advance() {
  if (!canAdvance.value || saving.value) {
    // Focus en primer campo inválido del paso 2
    if (step.value === 2) {
      if (!meta.value.trim()) {
        nextTick(() => document.getElementById('meta-descripcion')?.focus())
      } else if (!monteMeta.value || Number(monteMeta.value) <= 0) {
        nextTick(() => document.getElementById('meta-monto')?.focus())
      }
    }
    return
  }
  if (step.value < 3) {
    direction.value = 'forward'
    step.value++
  } else {
    handleComplete()
  }
}

function back() {
  if (step.value > 1) {
    direction.value = 'back'
    step.value--
  }
}

// Teclado: Enter avanza
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && canAdvance.value) advance()
}

async function handleComplete() {
  if (!authStore.user) return
  saving.value = true
  try {
    const data: OnboardingProfile = {
      perfil: perfil.value as 'freelancer' | 'emprendedor',
      meta: meta.value.trim(),
      monteMeta: Number(monteMeta.value),
      monedaMeta: monedaMeta.value,
      pais: pais.value as 'CL' | 'global',
    }
    await onboardingStore.setOnboarding(data, authStore.user.uid)
    router.replace({ name: 'home' })
  } finally {
    saving.value = false
  }
}

const stepTitles = ['Cuéntanos sobre ti', '¿Cuál es tu meta?', '¿Desde dónde inviertes?']
</script>

<template>
  <main class="onboarding-view" @keydown="handleKeydown">
    <div class="onboarding-container">
      <!-- Brand -->
      <p class="ob-brand">Kas<span class="ob-brand-accent">ane</span></p>

      <!-- Dots de progreso -->
      <div
        class="step-dots"
        role="progressbar"
        :aria-valuenow="step"
        aria-valuemin="1"
        aria-valuemax="3"
      >
        <span
          v-for="n in 3"
          :key="n"
          class="dot"
          :class="{ 'is-done': n < step, 'is-active': n === step }"
          :aria-label="`Paso ${n}`"
        />
      </div>

      <!-- Título del paso -->
      <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'" mode="out-in">
        <div :key="step" class="step-content">
          <h1 class="step-title">{{ stepTitles[step - 1] }}</h1>

          <!-- ─── Paso 1: ¿Quién eres? ─────────────────────────── -->
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

          <!-- ─── Paso 2: Meta personal ─────────────────────────── -->
          <div v-else-if="step === 2" class="meta-form">
            <p class="meta-hint">
              Algo concreto que quieres lograr.<br />
              <span class="meta-hint-example"
                >ej: "Monitor Apple Studio Display", "Arrendar una oficina"</span
              >
            </p>

            <div class="meta-input-group">
              <label for="meta-descripcion" class="meta-label">¿Cuál es tu meta?</label>
              <input
                id="meta-descripcion"
                v-model="meta"
                class="meta-input"
                type="text"
                placeholder="Describe tu meta..."
                maxlength="80"
                autofocus
              />
              <div class="meta-amount-row">
                <label for="meta-monto" class="meta-amount-label">¿Cuánto cuesta?</label>
                <div class="meta-amount-fields">
                  <input
                    id="meta-monto"
                    v-model="monteMeta"
                    class="meta-amount-input"
                    type="number"
                    placeholder="0"
                    min="1"
                    @keydown.e.prevent
                    @keydown.-.prevent
                    @keydown.+.prevent
                  />
                  <label for="meta-moneda" class="sr-only">Moneda</label>
                  <select id="meta-moneda" v-model="monedaMeta" class="meta-currency-select">
                    <option v-for="opt in monedaOpciones" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Preview cuando tiene datos -->
            <Transition name="fade">
              <p v-if="meta && Number(monteMeta) > 0" class="meta-preview">
                🎯 "{{ meta }}" por
                <strong>{{ Number(monteMeta).toLocaleString() }} {{ monedaMeta }}</strong>
              </p>
            </Transition>
          </div>

          <!-- ─── Paso 3: País ──────────────────────────────────── -->
          <div v-else-if="step === 3" class="choice-grid">
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
        </div>
      </Transition>

      <!-- Acciones -->
      <div class="ob-actions">
        <button v-if="step > 1" class="ob-back" type="button" @click="back">← Atrás</button>

        <BaseButton
          variant="primary"
          :disabled="!canAdvance || saving"
          class="ob-next"
          @click="advance"
        >
          <span v-if="saving">Guardando...</span>
          <span v-else-if="step < 3">Continuar →</span>
          <span v-else>Empezar →</span>
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

/* Dots de progreso */
.step-dots {
  @apply flex items-center justify-center gap-2;
}

.dot {
  @apply w-2 h-2 rounded-full bg-white/20 transition-all duration-300;
}
.dot.is-done {
  @apply bg-accent-growth/60 w-2;
}
.dot.is-active {
  @apply bg-accent-growth w-6;
}

/* Step content */
.step-content {
  @apply flex flex-col gap-6;
}

.step-title {
  @apply font-heading text-3xl font-bold text-text-primary text-center;
}

/* Choice cards (paso 1 y 3) */
.choice-grid {
  @apply grid grid-cols-2 gap-4;
}

.choice-card {
  @apply flex flex-col items-center gap-3 p-6 rounded-2xl cursor-pointer;
  @apply border-2 border-white/10 bg-bg-elevated;
  @apply transition-all duration-200;
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

/* Meta form (paso 2) */
.meta-form {
  @apply flex flex-col gap-5;
}

.meta-hint {
  @apply font-body text-sm text-text-secondary text-center leading-relaxed;
}

.meta-hint-example {
  @apply text-text-muted text-xs;
}

.meta-input-group {
  @apply flex flex-col gap-4;
}

.meta-label {
  @apply font-body text-sm text-text-secondary font-medium mb-1.5 block;
}

.meta-input {
  @apply w-full bg-bg-elevated border border-white/10 rounded-xl px-5 py-4;
  @apply font-body text-base text-text-primary placeholder:text-text-muted;
  @apply outline-none transition-all duration-200;
  @apply focus:border-accent-neutral;
}

.meta-amount-row {
  @apply flex items-center gap-3;
}

.meta-amount-label {
  @apply font-body text-sm text-text-secondary whitespace-nowrap;
}

.meta-amount-fields {
  @apply flex gap-2 flex-1;
}

.meta-amount-input {
  @apply flex-1 bg-bg-elevated border border-white/10 rounded-xl px-4 py-3;
  @apply font-mono text-text-primary placeholder:text-text-muted;
  @apply outline-none transition-all duration-200;
  @apply focus:border-accent-neutral;
  min-width: 0;
}

.meta-currency-select {
  @apply bg-bg-elevated border border-white/10 rounded-xl px-3 py-3;
  @apply font-mono text-sm text-text-primary;
  @apply outline-none cursor-pointer transition-all duration-200;
  @apply focus:border-accent-neutral;
  appearance: none;
  -webkit-appearance: none;
  width: 72px;
}

.meta-preview {
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
  .ob-next {
    @apply flex-none;
  }
}

/* Transiciones de pasos */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
