<script setup lang="ts">
// DiagnosticoForm: formulario principal del diagnóstico financiero
// Responsabilidad: recolectar los 4 inputs del usuario y emitir el perfil validado
import { reactive, computed } from 'vue'
import type { UserProfile } from '@/types'
import FormField from '@/components/molecules/FormField.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'

const emit = defineEmits<{
  submit: [profile: UserProfile]
}>()

const form = reactive({
  excedente: '',
  reserva: '',
  aporteMensual: '',
  horizonte: '',
})

const errors = reactive({
  excedente: '',
  reserva: '',
  aporteMensual: '',
  horizonte: '',
})

// Validación simple en el límite del sistema
function validate(): boolean {
  let valid = true

  if (!form.excedente || Number(form.excedente) <= 0) {
    errors.excedente = 'Ingresa un monto mayor a 0'
    valid = false
  } else {
    errors.excedente = ''
  }

  if (!form.reserva || Number(form.reserva) < 0) {
    errors.reserva = 'Ingresa un monto válido'
    valid = false
  } else {
    errors.reserva = ''
  }

  if (!form.aporteMensual || Number(form.aporteMensual) < 0) {
    errors.aporteMensual = 'Ingresa un aporte válido'
    valid = false
  } else {
    errors.aporteMensual = ''
  }

  if (!form.horizonte || Number(form.horizonte) < 1 || Number(form.horizonte) > 600) {
    errors.horizonte = 'Ingresa entre 1 y 600 meses'
    valid = false
  } else {
    errors.horizonte = ''
  }

  return valid
}

const isComplete = computed(() =>
  form.excedente && form.reserva !== '' && form.aporteMensual !== '' && form.horizonte
)

function handleSubmit() {
  if (!validate()) return

  const profile: UserProfile = {
    excedente: Number(form.excedente),
    reserva: Number(form.reserva),
    aporteMensual: Number(form.aporteMensual),
    horizonte: Number(form.horizonte),
  }

  // Limpiar errores al enviar exitosamente
  Object.keys(errors).forEach(k => (errors[k as keyof typeof errors] = ''))

  emit('submit', profile)
}
</script>

<template>
  <BaseCard variant="elevated" padding="lg" as="section">
    <header class="form-header">
      <h2 class="form-title">Tu diagnóstico financiero</h2>
      <p class="form-subtitle">
        Cuéntanos sobre tu situación actual para calcular la mejor estrategia de inversión.
      </p>
    </header>

    <form class="form-body" novalidate @submit.prevent="handleSubmit">
      <div class="form-grid">
        <FormField
          v-model="form.excedente"
          label="Excedente disponible"
          hint="Capital inicial que puedes invertir hoy"
          placeholder="0"
          type="number"
          prefix="$"
          :error="errors.excedente"
          required
        />

        <FormField
          v-model="form.reserva"
          label="Fondo de reserva"
          hint="Meses de gastos que debes mantener en efectivo"
          placeholder="0"
          type="number"
          prefix="$"
          :error="errors.reserva"
          required
        />

        <FormField
          v-model="form.aporteMensual"
          label="Aporte mensual"
          hint="Cuánto puedes invertir cada mes (puede ser 0)"
          placeholder="0"
          type="number"
          prefix="$"
          :error="errors.aporteMensual"
          required
        />

        <FormField
          v-model="form.horizonte"
          label="Horizonte de inversión"
          hint="En cuántos meses necesitas el dinero (ej: 60 = 5 años)"
          placeholder="36"
          type="number"
          suffix="meses"
          :error="errors.horizonte"
          required
        />
      </div>

      <div class="form-actions">
        <BaseButton
          type="submit"
          variant="primary"
          :disabled="!isComplete"
        >
          Calcular mi estrategia
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>

<style scoped>
.form-header {
  @apply mb-8;
}

.form-title {
  @apply font-heading text-2xl font-bold text-text-primary mb-2;
}

.form-subtitle {
  @apply font-body text-sm text-text-secondary;
}

.form-body {
  @apply flex flex-col gap-6;
}

.form-grid {
  @apply grid grid-cols-1 gap-5;
}

@media (min-width: 640px) {
  .form-grid {
    @apply grid-cols-2;
  }
}

.form-actions {
  @apply flex justify-end pt-2;
}
</style>
