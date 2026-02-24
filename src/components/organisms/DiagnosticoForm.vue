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

  if (!form.horizonte) {
    errors.horizonte = 'Selecciona un horizonte de inversión'
    valid = false
  } else {
    errors.horizonte = ''
  }

  return valid
}

// Opciones de horizonte: cada 3 meses hasta 36, luego hitos en años
const horizonteOptions = (() => {
  const opts: { value: string; label: string }[] = []
  for (let m = 3; m <= 36; m += 3) {
    const years = m / 12
    const suffix = Number.isInteger(years) ? ` (${years} ${years === 1 ? 'año' : 'años'})` : ''
    opts.push({ value: String(m), label: `${m} meses${suffix}` })
  }
  for (const m of [48, 60, 84, 120]) {
    opts.push({ value: String(m), label: `${m} meses (${m / 12} años)` })
  }
  return opts
})()

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
          tooltip="El dinero que tienes disponible ahora para empezar a invertir. No incluyas tu fondo de emergencia ni lo que necesitas para vivir."
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
          tooltip="Tu colchón de seguridad. Se recomienda tener entre 3 y 6 meses de tus gastos fijos guardados antes de invertir."
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
          tooltip="Lo que destinas a inversión cada mes de forma constante. La constancia importa más que el monto: $100/mes durante años supera $1.000 una sola vez."
          placeholder="0"
          type="number"
          prefix="$"
          :error="errors.aporteMensual"
          required
        />

        <FormField
          v-model="form.horizonte"
          label="Horizonte de inversión"
          hint="¿En cuánto tiempo planeas necesitar este dinero?"
          tooltip="En cuánto tiempo planeas usar este dinero. Más tiempo = más opciones y mejor rendimiento potencial. Menos de 12 meses: instrumentos conservadores."
          placeholder="Selecciona un plazo"
          :options="horizonteOptions"
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
@reference "tailwindcss";
@config "../../../tailwind.config.js";
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
