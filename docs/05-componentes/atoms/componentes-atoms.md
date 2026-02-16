# Componentes Atoms - Tesorería Simple

**Versión:** 1.0  
**Fecha:** 2025-01-30  
**Estado:** 📐 ESPECIFICACIÓN  
**Autor:** Rockwell Harrison

---

## 1. Overview

Los **atoms** son los componentes más básicos del sistema de diseño. Son indivisibles y altamente reutilizables.

### 1.1 Principios de Diseño de Atoms

```
PRINCIPIO                    IMPLEMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Single Purpose          →    1 atom = 1 responsabilidad
Stateless               →    No manejo de estado interno complejo
Composable              →    Se combinan para formar molecules
Accessible              →    WCAG 2.1 AA por defecto
Themeable               →    CSS custom properties
Zero Dependencies       →    Solo Vue 3 + Tailwind
```

### 1.2 Atoms Disponibles

| Atom    | Propósito                | Variantes       | Estados              |
| ------- | ------------------------ | --------------- | -------------------- |
| Button  | Acciones e interacciones | 3 (Pri/Sec/Ter) | 5 (default→disabled) |
| Input   | Entrada de texto/números | 2 (text/number) | 4 (default→error)    |
| Label   | Etiquetas descriptivas   | 2 (default/req) | 2 (default/disabled) |
| Badge   | Indicadores de estado    | 4 (tipo)        | 2 (default/active)   |
| Icon    | Iconografía del sistema  | N/A             | 2 (default/disabled) |
| Spinner | Indicador de carga       | 2 (size)        | 1 (animating)        |

---

## 2. Button Component

### 2.1 Propósito

Componente de acción principal con 3 variantes visuales y soporte completo de accesibilidad.

### 2.2 API del Componente

```vue
<!-- src/components/atoms/Button.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  /**
   * Variante visual del botón
   * @values 'primary', 'secondary', 'tertiary'
   */
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "secondary", "tertiary"].includes(value),
  },

  /**
   * Tamaño del botón
   * @values 'sm', 'md', 'lg'
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },

  /**
   * Estado de carga (muestra spinner)
   */
  loading: {
    type: Boolean,
    default: false,
  },

  /**
   * Estado deshabilitado
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Botón de ancho completo
   */
  fullWidth: {
    type: Boolean,
    default: false,
  },

  /**
   * Tipo HTML del botón
   * @values 'button', 'submit', 'reset'
   */
  type: {
    type: String,
    default: "button",
    validator: (value) => ["button", "submit", "reset"].includes(value),
  },

  /**
   * Icono a mostrar (nombre del icono)
   */
  icon: {
    type: String,
    default: null,
  },

  /**
   * Posición del icono
   * @values 'left', 'right'
   */
  iconPosition: {
    type: String,
    default: "left",
    validator: (value) => ["left", "right"].includes(value),
  },
});

const emit = defineEmits(["click"]);

// Clases computadas
const buttonClasses = computed(() => {
  const classes = [
    "button",
    `button--${props.variant}`,
    `button--${props.size}`,
    {
      "button--loading": props.loading,
      "button--disabled": props.disabled,
      "button--full-width": props.fullWidth,
      "button--icon-only": props.icon && !hasSlotContent.value,
    },
  ];
  return classes;
});

const hasSlotContent = computed(() => {
  return !!slots.default;
});

// Handlers
function handleClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="button__spinner">
      <Spinner size="sm" />
    </span>

    <!-- Contenido -->
    <span v-else class="button__content">
      <!-- Icono izquierdo -->
      <Icon
        v-if="icon && iconPosition === 'left'"
        :name="icon"
        class="button__icon button__icon--left"
      />

      <!-- Texto del slot -->
      <span v-if="$slots.default" class="button__text">
        <slot />
      </span>

      <!-- Icono derecho -->
      <Icon
        v-if="icon && iconPosition === 'right'"
        :name="icon"
        class="button__icon button__icon--right"
      />
    </span>
  </button>
</template>

<style scoped>
/* Base */
.button {
  @apply inline-flex items-center justify-center;
  @apply font-outfit font-medium;
  @apply rounded-lg;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
  font-family: "Outfit", sans-serif;
}

/* Variantes */
.button--primary {
  @apply bg-primary text-bg-primary;
  @apply hover:bg-primary-hover;
  @apply focus:ring-primary;
  @apply active:bg-primary-active;
  background-color: var(--color-primary);
  color: var(--color-bg-primary);
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.button--secondary {
  @apply bg-transparent text-primary;
  @apply border-2 border-primary;
  @apply hover:bg-primary hover:text-bg-primary;
  @apply focus:ring-primary;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-bg-primary);
}

.button--tertiary {
  @apply bg-transparent text-text-secondary;
  @apply hover:text-primary hover:bg-bg-tertiary;
  @apply focus:ring-border;
  color: var(--color-text-secondary);
}

.button--tertiary:hover:not(:disabled) {
  color: var(--color-primary);
  background-color: var(--color-bg-tertiary);
}

/* Tamaños */
.button--sm {
  @apply px-3 py-1.5 text-sm;
  min-height: 32px;
}

.button--md {
  @apply px-4 py-2 text-base;
  min-height: 40px;
}

.button--lg {
  @apply px-6 py-3 text-lg;
  min-height: 48px;
}

/* Estados */
.button--loading {
  @apply pointer-events-none;
}

.button--disabled {
  @apply opacity-50 cursor-not-allowed;
}

.button--full-width {
  @apply w-full;
}

.button--icon-only {
  @apply aspect-square p-2;
}

/* Elementos internos */
.button__content {
  @apply flex items-center gap-2;
}

.button__spinner {
  @apply flex items-center justify-center;
}

.button__icon {
  @apply flex-shrink-0;
}

.button__icon--left {
  @apply -ml-1;
}

.button__icon--right {
  @apply -mr-1;
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .button {
    @apply transition-none;
  }
}
</style>
```

### 2.3 Ejemplos de Uso

```vue
<script setup>
import Button from "@/components/atoms/Button.vue";

function handleClick() {
  console.log("Button clicked!");
}
</script>

<template>
  <!-- Básico -->
  <Button @click="handleClick"> Calcular Portafolio </Button>

  <!-- Con variantes -->
  <Button variant="secondary"> Cancelar </Button>

  <Button variant="tertiary"> Ver detalles </Button>

  <!-- Con icono -->
  <Button icon="refresh" @click="handleRefresh"> Actualizar Datos </Button>

  <!-- Loading state -->
  <Button :loading="isCalculating" @click="calculate"> Calcular </Button>

  <!-- Disabled -->
  <Button :disabled="!canSubmit"> Guardar Cambios </Button>

  <!-- Full width -->
  <Button full-width> Continuar </Button>

  <!-- Solo icono -->
  <Button icon="close" aria-label="Cerrar modal" />

  <!-- Tamaños -->
  <Button size="sm">Pequeño</Button>
  <Button size="md">Mediano</Button>
  <Button size="lg">Grande</Button>
</template>
```

### 2.4 Consideraciones de Accesibilidad

- ✅ **Keyboard navigation:** Navegación completa con Tab/Enter/Space
- ✅ **ARIA attributes:** `aria-busy`, `aria-disabled`, `aria-label` (cuando solo icono)
- ✅ **Focus visible:** Ring de enfoque con colores accesibles
- ✅ **Screen readers:** Texto descriptivo para iconos
- ✅ **Reduced motion:** Respeta preferencia del usuario

---

## 3. Input Component

### 3.1 Propósito

Campo de entrada de texto/números con validación visual y mensajes de error.

### 3.2 API del Componente

```vue
<!-- src/components/atoms/Input.vue -->
<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  /**
   * Valor del input (v-model)
   */
  modelValue: {
    type: [String, Number],
    default: "",
  },

  /**
   * Tipo de input
   * @values 'text', 'number', 'email', 'password'
   */
  type: {
    type: String,
    default: "text",
    validator: (value) =>
      ["text", "number", "email", "password"].includes(value),
  },

  /**
   * Placeholder
   */
  placeholder: {
    type: String,
    default: "",
  },

  /**
   * Estado de error
   */
  error: {
    type: Boolean,
    default: false,
  },

  /**
   * Mensaje de error a mostrar
   */
  errorMessage: {
    type: String,
    default: "",
  },

  /**
   * Estado deshabilitado
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Input de solo lectura
   */
  readonly: {
    type: Boolean,
    default: false,
  },

  /**
   * Campo requerido
   */
  required: {
    type: Boolean,
    default: false,
  },

  /**
   * Valor mínimo (para type="number")
   */
  min: {
    type: Number,
    default: null,
  },

  /**
   * Valor máximo (para type="number")
   */
  max: {
    type: Number,
    default: null,
  },

  /**
   * Incremento (para type="number")
   */
  step: {
    type: Number,
    default: null,
  },

  /**
   * ID del input (para label asociado)
   */
  id: {
    type: String,
    default: null,
  },

  /**
   * Nombre del input (para forms)
   */
  name: {
    type: String,
    default: null,
  },

  /**
   * Autocompletar
   */
  autocomplete: {
    type: String,
    default: null,
  },

  /**
   * Icono a mostrar (prefijo)
   */
  icon: {
    type: String,
    default: null,
  },

  /**
   * Sufijo (ej: "$", "%")
   */
  suffix: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "blur", "focus"]);

const inputRef = ref(null);
const isFocused = ref(false);

// Clases computadas
const inputClasses = computed(() => {
  return [
    "input",
    {
      "input--error": props.error,
      "input--disabled": props.disabled,
      "input--focused": isFocused.value,
      "input--with-icon": props.icon,
      "input--with-suffix": props.suffix,
    },
  ];
});

// Handlers
function handleInput(event) {
  let value = event.target.value;

  // Convertir a número si type="number"
  if (props.type === "number" && value !== "") {
    value = parseFloat(value);
  }

  emit("update:modelValue", value);
}

function handleFocus(event) {
  isFocused.value = true;
  emit("focus", event);
}

function handleBlur(event) {
  isFocused.value = false;
  emit("blur", event);
}

// Exponer métodos públicos
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<template>
  <div class="input-wrapper">
    <!-- Input container -->
    <div class="input-container">
      <!-- Icono prefijo -->
      <Icon
        v-if="icon"
        :name="icon"
        class="input__icon"
        :class="{ 'input__icon--error': error }"
      />

      <!-- Input element -->
      <input
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :id="id"
        :name="name"
        :autocomplete="autocomplete"
        :class="inputClasses"
        :aria-invalid="error"
        :aria-describedby="error && errorMessage ? `${id}-error` : null"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Sufijo -->
      <span v-if="suffix" class="input__suffix">
        {{ suffix }}
      </span>
    </div>

    <!-- Error message -->
    <p
      v-if="error && errorMessage"
      :id="`${id}-error`"
      class="input__error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped>
.input-wrapper {
  @apply w-full;
}

.input-container {
  @apply relative flex items-center;
}

/* Base input */
.input {
  @apply w-full;
  @apply px-4 py-2;
  @apply bg-bg-secondary text-text-primary;
  @apply border-2 border-border rounded-lg;
  @apply font-jetbrains text-base;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20;
  font-family: "JetBrains Mono", monospace;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.input::placeholder {
  @apply text-text-tertiary;
  color: var(--color-text-tertiary);
}

/* Estados */
.input--error {
  @apply border-error;
  border-color: var(--color-error);
}

.input--error:focus {
  @apply border-error ring-error;
  border-color: var(--color-error);
  --tw-ring-color: var(--color-error);
}

.input--disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply bg-bg-tertiary;
  background-color: var(--color-bg-tertiary);
}

.input--with-icon {
  @apply pl-11;
}

.input--with-suffix {
  @apply pr-12;
}

/* Icono */
.input__icon {
  @apply absolute left-3;
  @apply text-text-tertiary;
  @apply pointer-events-none;
  color: var(--color-text-tertiary);
}

.input__icon--error {
  @apply text-error;
  color: var(--color-error);
}

/* Sufijo */
.input__suffix {
  @apply absolute right-3;
  @apply text-text-secondary font-medium;
  @apply pointer-events-none;
  color: var(--color-text-secondary);
}

/* Error message */
.input__error-message {
  @apply mt-1 text-sm text-error;
  @apply font-outfit;
  color: var(--color-error);
  font-family: "Outfit", sans-serif;
}

/* Number input - remover spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  @apply appearance-none m-0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .input {
    @apply transition-none;
  }
}
</style>
```

### 3.3 Ejemplos de Uso

```vue
<script setup>
import { ref } from "vue";
import Input from "@/components/atoms/Input.vue";

const amount = ref("");
const email = ref("");
const hasError = ref(false);
</script>

<template>
  <!-- Básico -->
  <Input v-model="amount" placeholder="Ingrese monto" />

  <!-- Con tipo number -->
  <Input
    v-model="amount"
    type="number"
    :min="0"
    :max="1000000"
    :step="100"
    suffix="$"
  />

  <!-- Con icono -->
  <Input
    v-model="email"
    type="email"
    icon="mail"
    placeholder="correo@ejemplo.com"
  />

  <!-- Con error -->
  <Input
    v-model="amount"
    :error="hasError"
    error-message="El monto debe ser mayor a $10,000"
  />

  <!-- Disabled -->
  <Input v-model="amount" disabled placeholder="No editable" />

  <!-- Read only -->
  <Input v-model="amount" readonly />
</template>
```

---

## 4. Label Component

### 4.1 Propósito

Etiquetas descriptivas para inputs y otros controles de formulario.

### 4.2 API del Componente

```vue
<!-- src/components/atoms/Label.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  /**
   * ID del input asociado
   */
  for: {
    type: String,
    default: null,
  },

  /**
   * Campo requerido (muestra asterisco)
   */
  required: {
    type: Boolean,
    default: false,
  },

  /**
   * Estado deshabilitado
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Texto de ayuda (tooltip)
   */
  helpText: {
    type: String,
    default: null,
  },
});

const labelClasses = computed(() => {
  return [
    "label",
    {
      "label--disabled": props.disabled,
    },
  ];
});
</script>

<template>
  <label :for="for" :class="labelClasses">
    <span class="label__text">
      <slot />
      <span
        v-if="required"
        class="label__required"
        aria-label="campo requerido"
      >
        *
      </span>
    </span>

    <!-- Help icon con tooltip -->
    <Icon
      v-if="helpText"
      name="help-circle"
      class="label__help-icon"
      :title="helpText"
      aria-label="Información adicional"
    />
  </label>
</template>

<style scoped>
.label {
  @apply inline-flex items-center gap-2;
  @apply font-outfit font-medium text-sm;
  @apply text-text-primary;
  @apply cursor-pointer;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-primary);
}

.label--disabled {
  @apply opacity-50 cursor-not-allowed;
}

.label__text {
  @apply flex items-center gap-1;
}

.label__required {
  @apply text-error;
  color: var(--color-error);
}

.label__help-icon {
  @apply text-text-tertiary;
  @apply cursor-help;
  color: var(--color-text-tertiary);
}
</style>
```

### 4.3 Ejemplos de Uso

```vue
<template>
  <!-- Básico -->
  <Label for="amount-input"> Monto a invertir </Label>
  <Input id="amount-input" v-model="amount" />

  <!-- Requerido -->
  <Label for="email-input" required> Correo electrónico </Label>
  <Input id="email-input" v-model="email" />

  <!-- Con ayuda -->
  <Label
    for="risk-input"
    help-text="Seleccione su tolerancia al riesgo (1=conservador, 5=agresivo)"
  >
    Perfil de riesgo
  </Label>
</template>
```

---

## 5. Badge Component

### 5.1 Propósito

Indicadores visuales de estado, categoría o notificación.

### 5.2 API del Componente

```vue
<!-- src/components/atoms/Badge.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  /**
   * Variante de color
   * @values 'success', 'warning', 'error', 'info', 'neutral'
   */
  variant: {
    type: String,
    default: "neutral",
    validator: (value) =>
      ["success", "warning", "error", "info", "neutral"].includes(value),
  },

  /**
   * Tamaño del badge
   * @values 'sm', 'md', 'lg'
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },

  /**
   * Mostrar punto indicador
   */
  dot: {
    type: Boolean,
    default: false,
  },

  /**
   * Badge con bordes redondeados (pill)
   */
  pill: {
    type: Boolean,
    default: true,
  },
});

const badgeClasses = computed(() => {
  return [
    "badge",
    `badge--${props.variant}`,
    `badge--${props.size}`,
    {
      "badge--pill": props.pill,
    },
  ];
});
</script>

<template>
  <span :class="badgeClasses">
    <span v-if="dot" class="badge__dot"></span>
    <span class="badge__text">
      <slot />
    </span>
  </span>
</template>

<style scoped>
/* Base */
.badge {
  @apply inline-flex items-center gap-1.5;
  @apply font-outfit font-medium;
  @apply px-2 py-1;
  @apply rounded;
  font-family: "Outfit", sans-serif;
}

.badge--pill {
  @apply rounded-full;
}

/* Tamaños */
.badge--sm {
  @apply text-xs px-2 py-0.5;
}

.badge--md {
  @apply text-sm px-2.5 py-1;
}

.badge--lg {
  @apply text-base px-3 py-1.5;
}

/* Variantes */
.badge--success {
  @apply bg-success bg-opacity-10 text-success;
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.badge--warning {
  @apply bg-warning bg-opacity-10 text-warning;
  background-color: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.badge--error {
  @apply bg-error bg-opacity-10 text-error;
  background-color: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error);
}

.badge--info {
  @apply bg-info bg-opacity-10 text-info;
  background-color: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
}

.badge--neutral {
  @apply bg-bg-tertiary text-text-secondary;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

/* Dot indicator */
.badge__dot {
  @apply w-2 h-2 rounded-full;
  background-color: currentColor;
}
</style>
```

### 5.3 Ejemplos de Uso

```vue
<template>
  <!-- Estados -->
  <Badge variant="success">Activo</Badge>
  <Badge variant="warning">Pendiente</Badge>
  <Badge variant="error">Error</Badge>
  <Badge variant="info">Nuevo</Badge>

  <!-- Con dot -->
  <Badge variant="success" dot> Conectado </Badge>

  <!-- Tamaños -->
  <Badge size="sm">Pequeño</Badge>
  <Badge size="md">Mediano</Badge>
  <Badge size="lg">Grande</Badge>

  <!-- Sin pill (cuadrado) -->
  <Badge :pill="false"> v2.0 </Badge>
</template>
```

---

## 6. Icon Component

### 6.1 Propósito

Sistema unificado de iconografía usando Lucide Icons (incluido en CDN).

### 6.2 API del Componente

```vue
<!-- src/components/atoms/Icon.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  /**
   * Nombre del icono de Lucide
   * @see https://lucide.dev/icons
   */
  name: {
    type: String,
    required: true,
  },

  /**
   * Tamaño del icono en pixels
   */
  size: {
    type: [Number, String],
    default: 24,
  },

  /**
   * Color del icono (CSS color)
   */
  color: {
    type: String,
    default: "currentColor",
  },

  /**
   * Grosor del trazo
   */
  strokeWidth: {
    type: [Number, String],
    default: 2,
  },
});

// Mapeo de nombres comunes a nombres de Lucide
const iconMap = {
  close: "x",
  check: "check",
  warning: "alert-triangle",
  error: "alert-circle",
  info: "info",
  help: "help-circle",
  "help-circle": "help-circle",
  refresh: "refresh-cw",
  search: "search",
  mail: "mail",
  user: "user",
  settings: "settings",
  menu: "menu",
  "arrow-left": "arrow-left",
  "arrow-right": "arrow-right",
  "arrow-up": "arrow-up",
  "arrow-down": "arrow-down",
  "chevron-left": "chevron-left",
  "chevron-right": "chevron-right",
  "chevron-up": "chevron-up",
  "chevron-down": "chevron-down",
  plus: "plus",
  minus: "minus",
  edit: "edit-2",
  trash: "trash-2",
  download: "download",
  upload: "upload",
  calendar: "calendar",
  clock: "clock",
  chart: "trending-up",
  dollar: "dollar-sign",
  percent: "percent",
};

const lucideName = computed(() => {
  return iconMap[props.name] || props.name;
});
</script>

<template>
  <i
    class="icon"
    :data-lucide="lucideName"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      color: color,
      '--stroke-width': strokeWidth,
    }"
  />
</template>

<style scoped>
.icon {
  @apply inline-block flex-shrink-0;
  stroke-width: var(--stroke-width, 2);
}
</style>
```

### 6.3 Configuración de Lucide

```javascript
// src/main.js
import { createApp } from "vue";
import App from "./App.vue";

// Importar Lucide (ya está en CDN según stack)
import { createIcons, icons } from "lucide";

const app = createApp(App);

// Inicializar iconos después de montar
app.mount("#app");

// Crear iconos Lucide en el DOM
createIcons({ icons });

// Observar cambios en el DOM para nuevos iconos
const observer = new MutationObserver(() => {
  createIcons({ icons });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

### 6.4 Ejemplos de Uso

```vue
<template>
  <!-- Básico -->
  <Icon name="check" />

  <!-- Con tamaño personalizado -->
  <Icon name="user" :size="32" />

  <!-- Con color -->
  <Icon name="warning" color="#ff6b6b" />

  <!-- En botón -->
  <Button icon="refresh"> Actualizar </Button>

  <!-- En input -->
  <Input icon="search" placeholder="Buscar..." />
</template>
```

---

## 7. Spinner Component

### 7.1 Propósito

Indicador de carga animado para estados de loading.

### 7.2 API del Componente

```vue
<!-- src/components/atoms/Spinner.vue -->
<script setup>
const props = defineProps({
  /**
   * Tamaño del spinner
   * @values 'sm', 'md', 'lg'
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },

  /**
   * Color del spinner
   */
  color: {
    type: String,
    default: "currentColor",
  },
});

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};
</script>

<template>
  <svg
    class="spinner"
    :class="`spinner--${size}`"
    :width="sizeMap[size]"
    :height="sizeMap[size]"
    viewBox="0 0 24 24"
    :style="{ color: color }"
    role="status"
    aria-label="Cargando"
  >
    <circle
      class="spinner__track"
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke-width="3"
    />
    <circle
      class="spinner__head"
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.spinner {
  @apply inline-block;
  animation: spin 0.8s linear infinite;
}

.spinner__track {
  @apply opacity-20;
  stroke: currentColor;
}

.spinner__head {
  stroke: currentColor;
  stroke-dasharray: 60;
  stroke-dashoffset: 45;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
```

### 7.3 Ejemplos de Uso

```vue
<template>
  <!-- Básico -->
  <Spinner />

  <!-- Tamaños -->
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />

  <!-- Con color personalizado -->
  <Spinner color="#00ffaa" />

  <!-- En botón -->
  <Button :loading="isLoading"> Guardar </Button>

  <!-- Centrado en página -->
  <div class="flex items-center justify-center h-screen">
    <Spinner size="lg" />
  </div>
</template>
```

---

## 8. Testing de Atoms

### 8.1 Ejemplo: Button.test.js

```javascript
// tests/components/atoms/Button.test.js
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Button from "@/components/atoms/Button.vue";

describe("Button", () => {
  it("debería renderizar correctamente", () => {
    const wrapper = mount(Button, {
      slots: {
        default: "Click me",
      },
    });

    expect(wrapper.text()).toBe("Click me");
    expect(wrapper.classes()).toContain("button--primary");
  });

  it("debería emitir evento click", async () => {
    const wrapper = mount(Button);
    await wrapper.trigger("click");

    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("no debería emitir click cuando está disabled", async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
    });

    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeFalsy();
  });

  it("debería mostrar spinner cuando loading=true", () => {
    const wrapper = mount(Button, {
      props: { loading: true },
    });

    expect(wrapper.find(".button__spinner").exists()).toBe(true);
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });

  it("debería aplicar variantes correctamente", () => {
    const wrapper = mount(Button, {
      props: { variant: "secondary" },
    });

    expect(wrapper.classes()).toContain("button--secondary");
  });
});
```

---

## 9. Integración en la App

### 9.1 Registro Global (opcional)

```javascript
// src/main.js
import { createApp } from "vue";
import App from "./App.vue";

// Importar atoms
import Button from "@/components/atoms/Button.vue";
import Input from "@/components/atoms/Input.vue";
import Label from "@/components/atoms/Label.vue";
import Badge from "@/components/atoms/Badge.vue";
import Icon from "@/components/atoms/Icon.vue";
import Spinner from "@/components/atoms/Spinner.vue";

const app = createApp(App);

// Registrar globalmente (opcional)
app.component("Button", Button);
app.component("Input", Input);
app.component("Label", Label);
app.component("Badge", Badge);
app.component("Icon", Icon);
app.component("Spinner", Spinner);

app.mount("#app");
```

### 9.2 Uso Directo (recomendado)

```vue
<script setup>
import Button from "@/components/atoms/Button.vue";
import Input from "@/components/atoms/Input.vue";
</script>

<template>
  <div>
    <Input v-model="amount" />
    <Button @click="submit">Enviar</Button>
  </div>
</template>
```

---

## 10. Resumen de Decisiones

| Decisión                    | Opción elegida            | Confianza | Razón                             |
| --------------------------- | ------------------------- | --------- | --------------------------------- |
| **Librería de iconos**      | Lucide Icons              | 🟢 ALTA   | Moderna, ligera, bien documentada |
| **Variantes de Button**     | 3 (Pri/Sec/Ter)           | 🟢 ALTA   | Suficiente para casos de uso      |
| **Gestión de estado**       | Props + emits (stateless) | 🟢 ALTA   | Atoms deben ser stateless         |
| **Validación de Input**     | Externa (no interna)      | 🟢 ALTA   | Separación de concerns            |
| **Registro de componentes** | Local (no global)         | 🟡 MEDIA  | Mejor tree-shaking, más explícito |
| **Animaciones**             | CSS puro (no JS)          | 🟢 ALTA   | Mejor performance, accesibilidad  |

---

## 11. Próximos Pasos

1. ✅ **Especificación completada** (2025-01-30)
2. ⏳ **Implementar componentes** en `/src/components/atoms`
3. ⏳ **Testing unitario** de cada atom
4. ⏳ **Storybook** (opcional) para documentación visual
5. ⏳ **Molecules specs** (archivo 14/21)

---

**Última actualización:** 2025-01-30  
**Estado:** ✅ ESPECIFICACIÓN COMPLETA  
**Siguiente:** `componentes-molecules.md` (archivo 14/21)
