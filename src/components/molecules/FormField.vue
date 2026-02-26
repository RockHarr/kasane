<script setup lang="ts">
// FormField: combina BaseInput con label externo, hint y estado de error
// Responsabilidad: orquestar la UI de un campo de formulario completo
import { computed } from 'vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseTooltip from '@/components/atoms/BaseTooltip.vue'

interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number
  label: string
  hint?: string // texto de ayuda bajo el campo
  tooltip?: string // explicación educativa al hacer hover en el ícono ?
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password'
  autocomplete?: string
  error?: string
  disabled?: boolean
  prefix?: string
  suffix?: string
  required?: boolean
  options?: SelectOption[] // cuando se provee, renderiza <select> en lugar de <input>
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const describedBy = computed(() => {
  const ids = []
  if (props.hint && !props.error) ids.push(`${props.label}-hint`)
  if (props.error) ids.push(`${props.label}-error`)
  return ids.length > 0 ? ids.join(' ') : undefined
})
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

    <!-- Select mode: cuando se proveen options -->
    <template v-if="options">
      <div class="select-wrapper" :class="{ 'has-error': error }">
        <select
          :id="label"
          :value="String(modelValue)"
          :disabled="disabled"
          :aria-describedby="describedBy"
          :aria-invalid="!!error"
          class="field-select"
          @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>{{ placeholder || 'Selecciona...' }}</option>
          <option v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <p v-if="error" :id="`${label}-error`" class="field-error" role="alert">{{ error }}</p>
    </template>

    <!-- Input mode (default) -->
    <BaseInput
      v-else
      :id="label"
      :model-value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :autocomplete="autocomplete"
      :error="error"
      :disabled="disabled"
      :prefix="prefix"
      :suffix="suffix"
      :aria-describedby="describedBy"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <p v-if="hint && !error" :id="`${label}-hint`" class="form-field-hint">{{ hint }}</p>
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

/* ── Select mode ── */
.select-wrapper {
  @apply relative flex items-center;
  @apply border border-transparent rounded-lg;
  @apply bg-bg-elevated transition-all duration-200;
}

.select-wrapper::after {
  content: '▾';
  @apply absolute right-3 text-text-muted pointer-events-none text-sm;
}

.select-wrapper:focus-within {
  @apply border-accent-neutral;
}

.select-wrapper.has-error {
  @apply border-accent-alert;
}

.field-select {
  @apply w-full bg-transparent px-4 py-3 min-h-[44px] pr-8;
  @apply font-mono text-text-primary;
  @apply outline-none cursor-pointer;
  appearance: none;
  -webkit-appearance: none;
}

.field-select option {
  @apply bg-bg-elevated text-text-primary;
}

.field-error {
  @apply font-body text-xs text-accent-alert;
}
</style>
