<script setup lang="ts">
// FormField: combina BaseInput con label externo, hint y estado de error
// Responsabilidad: orquestar la UI de un campo de formulario completo
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseTooltip from '@/components/atoms/BaseTooltip.vue'

interface Props {
  modelValue: string | number
  label: string
  hint?: string       // texto de ayuda bajo el campo
  tooltip?: string    // explicación educativa al hacer hover en el ícono ?
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password'
  autocomplete?: string
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
        <BaseTooltip v-if="tooltip" :content="tooltip" position="right">
          <span class="form-field-tooltip-icon" tabindex="0" aria-label="Más información">?</span>
        </BaseTooltip>
      </label>
    </div>

    <BaseInput
      :id="label"
      :model-value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :autocomplete="autocomplete"
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

.form-field-tooltip-icon {
  @apply inline-flex items-center justify-center ml-1.5;
  @apply w-4 h-4 rounded-full text-[10px] font-mono font-bold;
  @apply bg-white/10 text-text-muted cursor-help;
  @apply hover:bg-accent-neutral/20 hover:text-accent-neutral;
  @apply focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent-neutral;
  @apply transition-colors duration-150;
}

.form-field-hint {
  @apply font-body text-xs text-text-muted;
}
</style>
