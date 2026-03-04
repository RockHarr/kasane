<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password'
  autocomplete?: string
  error?: string
  disabled?: boolean
  prefix?: string // ej: "$" para montos
  suffix?: string // ej: "meses"
  ariaDescribedby?: string // IDs de elementos que describen este input
}

import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * Genera un id HTML válido a partir del label.
 * Ej: "Aporte Mensual" → "field-aporte-mensual"
 */
const inputId = computed(() => {
  if (!props.label) return undefined
  return 'field-' + props.label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')     // espacios/puntos -> guiones
    .replace(/^-|-$/g, '')            // limpia bordes
})
// (e, E, -, + pueden aparecer en type="number" por defecto del browser)
function handleKeydown(event: KeyboardEvent) {
  if (props.type === 'number' && ['e', 'E', '-', '+'].includes(event.key)) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="field">
    <label v-if="label" :for="inputId" class="field-label">
      {{ label }}
    </label>

    <div class="field-input-wrapper" :class="{ 'has-error': error }">
      <span v-if="prefix" class="field-affix">{{ prefix }}</span>

      <input
        :id="inputId"
        :name="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-describedby="ariaDescribedby || (error ? `${inputId}-error` : undefined)"
        :aria-invalid="!!error"
        class="field-input"
        :class="{ 'has-prefix': prefix, 'has-suffix': suffix }"
        @keydown="handleKeydown"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <span v-if="suffix" class="field-affix field-affix--right">{{ suffix }}</span>
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="field-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped lang="postcss">
@reference "tailwindcss";
@config "../../../tailwind.config.js";
.field {
  @apply flex flex-col gap-2;
}

.field-label {
  @apply font-body text-sm font-medium text-text-secondary;
}

.field-input-wrapper {
  @apply flex items-center relative;
  @apply border border-transparent rounded-lg;
  @apply bg-bg-elevated transition-all duration-200;
}

.field-input-wrapper:focus-within {
  @apply border-accent-neutral;
}

.field-input-wrapper.has-error {
  @apply border-accent-alert;
}

.field-input {
  @apply w-full bg-transparent px-4 py-3 min-h-[44px];
  @apply font-mono text-text-primary placeholder:text-text-muted;
  @apply outline-none;
}

.field-input.has-prefix {
  @apply pl-2;
}
.field-input.has-suffix {
  @apply pr-2;
}

.field-affix {
  @apply px-3 font-mono text-sm text-text-muted select-none;
}

.field-affix--right {
  @apply pl-0;
}

.field-error {
  @apply font-body text-xs text-accent-alert;
}

.field-input:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
