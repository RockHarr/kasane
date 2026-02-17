<script setup lang="ts">
// FormField: combina BaseInput con label externo, hint y estado de error
// Responsabilidad: orquestar la UI de un campo de formulario completo
import BaseInput from '@/components/atoms/BaseInput.vue'

interface Props {
  modelValue: string | number
  label: string
  hint?: string       // texto de ayuda bajo el campo
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password'
  error?: string
  disabled?: boolean
  prefix?: string
  suffix?: string
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="form-field">
    <div class="form-field-header">
      <label :for="label" class="form-field-label">
        {{ label }}
        <span v-if="required" class="form-field-required" aria-hidden="true">*</span>
      </label>
    </div>

    <BaseInput
      :id="label"
      :model-value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :error="error"
      :disabled="disabled"
      :prefix="prefix"
      :suffix="suffix"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <p v-if="hint && !error" class="form-field-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
@config "../../../tailwind.config.js";
.form-field {
  @apply flex flex-col gap-2;
}

.form-field-header {
  @apply flex items-center justify-between;
}

.form-field-label {
  @apply font-body text-sm font-medium text-text-secondary;
}

.form-field-required {
  @apply text-accent-alert ml-0.5;
}

.form-field-hint {
  @apply font-body text-xs text-text-muted;
}
</style>
