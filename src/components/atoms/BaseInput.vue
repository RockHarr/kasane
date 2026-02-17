<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password'
  error?: string
  disabled?: boolean
  prefix?: string  // ej: "$" para montos
  suffix?: string  // ej: "meses"
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="label" class="field-label">
      {{ label }}
    </label>

    <div class="field-input-wrapper" :class="{ 'has-error': error }">
      <span v-if="prefix" class="field-affix">{{ prefix }}</span>

      <input
        :id="label"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="field-input"
        :class="{ 'has-prefix': prefix, 'has-suffix': suffix }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <span v-if="suffix" class="field-affix field-affix--right">{{ suffix }}</span>
    </div>

    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
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

.field-input.has-prefix { @apply pl-2; }
.field-input.has-suffix { @apply pr-2; }

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
