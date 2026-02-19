<script setup lang="ts">
// LoginView: pantalla de autenticación
// Responsabilidad: login con Google o email/password, redirigir al home si ya autenticado
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import FormField from '@/components/molecules/FormField.vue'
import BaseLoader from '@/components/atoms/BaseLoader.vue'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const title = computed(() => mode.value === 'login' ? 'Iniciar sesión' : 'Crear cuenta')
const switchLabel = computed(() =>
  mode.value === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'
)

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
}

async function handleEmailAuth() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await authStore.signInWithEmail(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value)
    }
    router.push({ name: 'home' })
  } catch (e: unknown) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  error.value = ''
  loading.value = true
  try {
    await authStore.signInWithGoogle()
    router.push({ name: 'home' })
  } catch (e: unknown) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const msg = e.message
    // Firebase v9 usa 'invalid-credential' para email/password incorrectos
    if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')) {
      return 'Email o contraseña incorrectos'
    }
    if (msg.includes('email-already-in-use')) {
      return 'Este email ya está registrado. Intenta iniciar sesión.'
    }
    if (msg.includes('weak-password')) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    if (msg.includes('invalid-email')) {
      return 'El formato del email no es válido'
    }
    if (msg.includes('too-many-requests')) {
      return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
    }
    if (msg.includes('network-request-failed')) {
      return 'Error de conexión. Revisa tu internet e intenta de nuevo.'
    }
    if (msg.includes('popup-closed-by-user')) {
      return ''
    }
  }
  return 'Ocurrió un error. Intenta de nuevo.'
}
</script>

<template>
  <main class="login-view">
    <div class="login-container">
      <!-- Brand -->
      <header class="login-header">
        <h1 class="login-brand">
          Tesorería <span class="login-brand-accent">Simple</span>
        </h1>
        <p class="login-tagline">Gestión inteligente de inversiones</p>
      </header>

      <BaseCard variant="elevated" padding="lg">
        <h2 class="login-title">{{ title }}</h2>

        <!-- Error -->
        <p v-if="error" class="login-error" role="alert">{{ error }}</p>

        <!-- Formulario email/password -->
        <form class="login-form" novalidate @submit.prevent="handleEmailAuth">
          <FormField
            v-model="email"
            label="Correo electrónico"
            type="email"
            autocomplete="email"
            placeholder="tu@email.com"
            :disabled="loading"
            required
          />
          <FormField
            v-model="password"
            label="Contraseña"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            hint="Mínimo 6 caracteres"
            :disabled="loading"
            required
          />

          <BaseButton
            type="submit"
            variant="primary"
            :disabled="loading || !email || !password"
          >
            <BaseLoader v-if="loading" size="sm" />
            <span v-else>{{ title }}</span>
          </BaseButton>
        </form>

        <!-- Separador -->
        <div class="login-divider" aria-hidden="true">
          <span>o</span>
        </div>

        <!-- Google -->
        <BaseButton
          variant="secondary"
          :disabled="loading"
          @click="handleGoogle"
        >
          <span class="google-btn-content">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continuar con Google
          </span>
        </BaseButton>

        <!-- Switch mode -->
        <button class="login-switch" @click="switchMode">
          {{ switchLabel }}
        </button>
      </BaseCard>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../tailwind.config.js";

.login-view {
  @apply min-h-screen bg-bg-primary flex items-center justify-center px-4;
}

.login-container {
  @apply w-full max-w-md flex flex-col gap-8;
}

.login-header {
  @apply text-center;
}

.login-brand {
  @apply font-heading text-4xl font-extrabold text-text-primary;
}

.login-brand-accent {
  @apply text-accent-growth;
}

.login-tagline {
  @apply font-body text-sm text-text-secondary mt-1;
}

.login-title {
  @apply font-heading text-xl font-bold text-text-primary mb-6;
}

.login-error {
  @apply font-body text-sm text-accent-alert bg-accent-alert/10 rounded-lg px-4 py-3 mb-4;
}

.login-form {
  @apply flex flex-col gap-4 mb-4;
}

.login-divider {
  @apply flex items-center gap-3 my-4;
}

.login-divider::before,
.login-divider::after {
  content: '';
  @apply flex-1 h-px bg-white/10;
}

.login-divider span {
  @apply font-body text-xs text-text-muted;
}

.google-btn-content {
  @apply flex items-center gap-2 justify-center;
}

.login-switch {
  @apply w-full mt-4 font-body text-sm text-text-secondary hover:text-accent-growth transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-growth rounded;
}
</style>
