# Componentes Molecules - Tesorería Simple

**Versión:** 1.0  
**Fecha:** 2025-01-30  
**Estado:** 📐 ESPECIFICACIÓN  
**Autor:** Rockwell Harrison

---

## 1. Overview

Los **molecules** son combinaciones de atoms que forman unidades funcionales más complejas. Siguen siendo reutilizables pero tienen un propósito más específico.

### 1.1 Principios de Diseño de Molecules

```
PRINCIPIO                    IMPLEMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Composition             →    Combina 2+ atoms
Single Concern          →    1 molecule = 1 función específica
Contextual              →    Más específico que atoms, menos que organisms
Reusable                →    Usado en múltiples organisms
State Management        →    Puede tener estado interno simple
Data-Aware              →    Puede recibir y transformar datos
```

### 1.2 Molecules Disponibles

| Molecule     | Propósito                    | Atoms usados    | Complejidad |
| ------------ | ---------------------------- | --------------- | ----------- |
| FormGroup    | Campo de formulario completo | Label + Input   | Baja        |
| PriceDisplay | Mostrar precio con cambio %  | Badge + Icon    | Baja        |
| StatCard     | Métrica con título y valor   | Label + Badge   | Media       |
| MiniChart    | Gráfico sparkline simple     | (Canvas nativo) | Media       |

---

## 2. FormGroup Component

### 2.1 Propósito

Agrupa Label + Input + mensaje de error/ayuda en una unidad completa de formulario.

### 2.2 Composición Visual

```
┌─────────────────────────────────────┐
│ Label *                       [?]   │ ← Label atom + help icon
├─────────────────────────────────────┤
│ [$] [  Input text area...      ]   │ ← Input atom con icon/suffix
├─────────────────────────────────────┤
│ ⚠ Error message here                │ ← Conditional error message
│ ℹ Help text here                    │ ← Conditional help text
└─────────────────────────────────────┘
```

### 2.3 API del Componente

```vue
<!-- src/components/molecules/FormGroup.vue -->
<script setup>
import { computed, ref } from "vue";
import Label from "@/components/atoms/Label.vue";
import Input from "@/components/atoms/Input.vue";
import Icon from "@/components/atoms/Icon.vue";

const props = defineProps({
  /**
   * Valor del input (v-model)
   */
  modelValue: {
    type: [String, Number],
    default: "",
  },

  /**
   * Etiqueta del campo
   */
  label: {
    type: String,
    required: true,
  },

  /**
   * Tipo de input
   */
  type: {
    type: String,
    default: "text",
  },

  /**
   * Placeholder
   */
  placeholder: {
    type: String,
    default: "",
  },

  /**
   * Campo requerido
   */
  required: {
    type: Boolean,
    default: false,
  },

  /**
   * Estado de error
   */
  error: {
    type: Boolean,
    default: false,
  },

  /**
   * Mensaje de error
   */
  errorMessage: {
    type: String,
    default: "",
  },

  /**
   * Texto de ayuda (debajo del input)
   */
  helpText: {
    type: String,
    default: "",
  },

  /**
   * Tooltip de ayuda (en label)
   */
  labelHelpText: {
    type: String,
    default: "",
  },

  /**
   * Deshabilitado
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * ID del input (auto-generado si no se provee)
   */
  id: {
    type: String,
    default: null,
  },

  /**
   * Icono del input
   */
  icon: {
    type: String,
    default: null,
  },

  /**
   * Sufijo del input (ej: "$", "%")
   */
  suffix: {
    type: String,
    default: null,
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
   * Función de validación personalizada
   * @param {*} value - Valor actual
   * @returns {string|null} Mensaje de error o null si es válido
   */
  validator: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "blur", "focus", "validate"]);

// Auto-generar ID si no se provee
const inputId = computed(
  () => props.id || `input-${Math.random().toString(36).substr(2, 9)}`,
);

// Estado de validación interno
const validationError = ref("");

// Computed para error final (externo o interno)
const finalError = computed(() => {
  return props.error || !!validationError.value;
});

const finalErrorMessage = computed(() => {
  return props.errorMessage || validationError.value;
});

// Handlers
function handleInput(value) {
  emit("update:modelValue", value);

  // Validar si hay función de validación
  if (props.validator) {
    validateValue(value);
  }
}

function handleBlur(event) {
  // Validar al perder foco
  if (props.validator) {
    validateValue(props.modelValue);
  }
  emit("blur", event);
}

function handleFocus(event) {
  // Limpiar error al hacer focus (opcional)
  // validationError.value = ''
  emit("focus", event);
}

function validateValue(value) {
  if (!props.validator) return true;

  const error = props.validator(value);
  validationError.value = error || "";

  const isValid = !error;
  emit("validate", { isValid, error });

  return isValid;
}

// Exponer métodos públicos
defineExpose({
  validate: () => validateValue(props.modelValue),
  clearError: () => {
    validationError.value = "";
  },
});
</script>

<template>
  <div class="form-group">
    <!-- Label -->
    <Label
      :for="inputId"
      :required="required"
      :disabled="disabled"
      :help-text="labelHelpText"
      class="form-group__label"
    >
      {{ label }}
    </Label>

    <!-- Input -->
    <Input
      :id="inputId"
      :model-value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :error="finalError"
      :error-message="finalErrorMessage"
      :icon="icon"
      :suffix="suffix"
      :min="min"
      :max="max"
      :step="step"
      class="form-group__input"
      @update:model-value="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- Help text (cuando no hay error) -->
    <p v-if="helpText && !finalError" class="form-group__help-text">
      <Icon name="info" :size="14" class="form-group__help-icon" />
      {{ helpText }}
    </p>
  </div>
</template>

<style scoped>
.form-group {
  @apply flex flex-col gap-2;
}

.form-group__label {
  /* Ya tiene estilos del atom */
}

.form-group__input {
  /* Ya tiene estilos del atom */
}

.form-group__help-text {
  @apply flex items-center gap-1;
  @apply text-sm text-text-tertiary;
  @apply font-outfit;
  color: var(--color-text-tertiary);
  font-family: "Outfit", sans-serif;
}

.form-group__help-icon {
  @apply flex-shrink-0;
}
</style>
```

### 2.4 Ejemplos de Uso

```vue
<script setup>
import { ref } from "vue";
import FormGroup from "@/components/molecules/FormGroup.vue";

const amount = ref("");
const email = ref("");

// Validador personalizado
function validateAmount(value) {
  if (!value) return "El monto es requerido";
  if (value < 10000) return "El monto mínimo es $10,000";
  if (value > 1000000) return "El monto máximo es $1,000,000";
  return null;
}

function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) return "El correo es requerido";
  if (!emailRegex.test(value)) return "Correo inválido";
  return null;
}
</script>

<template>
  <!-- Básico -->
  <FormGroup
    v-model="amount"
    label="Monto a invertir"
    type="number"
    suffix="$"
    required
  />

  <!-- Con validación -->
  <FormGroup
    v-model="amount"
    label="Monto a invertir"
    type="number"
    suffix="$"
    :validator="validateAmount"
    help-text="Ingrese un monto entre $10,000 y $1,000,000"
    required
  />

  <!-- Con icono y ayuda -->
  <FormGroup
    v-model="email"
    label="Correo electrónico"
    type="email"
    icon="mail"
    :validator="validateEmail"
    label-help-text="Usaremos este correo para enviarte notificaciones"
    required
  />

  <!-- Con error externo -->
  <FormGroup
    v-model="amount"
    label="Monto"
    :error="hasServerError"
    error-message="Error del servidor: monto no disponible"
  />
</template>
```

### 2.5 Testing

```javascript
// tests/components/molecules/FormGroup.test.js
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FormGroup from "@/components/molecules/FormGroup.vue";

describe("FormGroup", () => {
  it("debería renderizar label e input", () => {
    const wrapper = mount(FormGroup, {
      props: {
        label: "Test Label",
        modelValue: "test value",
      },
    });

    expect(wrapper.find("label").text()).toContain("Test Label");
    expect(wrapper.find("input").element.value).toBe("test value");
  });

  it("debería validar con función personalizada", async () => {
    const validator = (value) => (value < 10 ? "Muy bajo" : null);

    const wrapper = mount(FormGroup, {
      props: {
        label: "Amount",
        modelValue: 5,
        validator,
      },
    });

    // Trigger validation
    await wrapper.vm.validate();

    expect(wrapper.text()).toContain("Muy bajo");
  });

  it("debería emitir update:modelValue", async () => {
    const wrapper = mount(FormGroup, {
      props: {
        label: "Test",
        modelValue: "",
      },
    });

    const input = wrapper.find("input");
    await input.setValue("new value");

    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["new value"]);
  });
});
```

---

## 3. PriceDisplay Component

### 3.1 Propósito

Mostrar precio actual con indicador visual de cambio (positivo/negativo) y porcentaje.

### 3.2 Composición Visual

```
┌─────────────────────────────────┐
│  $100.15                        │ ← Precio grande
│  ▲ +$0.25 (+0.25%)              │ ← Change con icono y badge
└─────────────────────────────────┘
```

### 3.3 API del Componente

```vue
<!-- src/components/molecules/PriceDisplay.vue -->
<script setup>
import { computed } from "vue";
import Badge from "@/components/atoms/Badge.vue";
import Icon from "@/components/atoms/Icon.vue";

const props = defineProps({
  /**
   * Precio actual
   */
  price: {
    type: Number,
    required: true,
  },

  /**
   * Cambio absoluto (ej: 0.25)
   */
  change: {
    type: Number,
    default: 0,
  },

  /**
   * Cambio porcentual (ej: 0.25 = 0.25%)
   */
  changePercent: {
    type: Number,
    default: 0,
  },

  /**
   * Símbolo de moneda
   */
  currency: {
    type: String,
    default: "$",
  },

  /**
   * Decimales a mostrar
   */
  decimals: {
    type: Number,
    default: 2,
  },

  /**
   * Tamaño del precio
   * @values 'sm', 'md', 'lg', 'xl'
   */
  size: {
    type: String,
    default: "lg",
    validator: (value) => ["sm", "md", "lg", "xl"].includes(value),
  },

  /**
   * Mostrar cambio
   */
  showChange: {
    type: Boolean,
    default: true,
  },

  /**
   * Alineación
   * @values 'left', 'center', 'right'
   */
  align: {
    type: String,
    default: "left",
    validator: (value) => ["left", "center", "right"].includes(value),
  },
});

// Computed properties
const formattedPrice = computed(() => {
  return props.price.toLocaleString("es-CL", {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  });
});

const formattedChange = computed(() => {
  const sign = props.change >= 0 ? "+" : "";
  return `${sign}${props.currency}${Math.abs(props.change).toFixed(props.decimals)}`;
});

const formattedChangePercent = computed(() => {
  const sign = props.changePercent >= 0 ? "+" : "";
  return `${sign}${props.changePercent.toFixed(2)}%`;
});

const changeVariant = computed(() => {
  if (props.change > 0) return "success";
  if (props.change < 0) return "error";
  return "neutral";
});

const changeIcon = computed(() => {
  if (props.change > 0) return "arrow-up";
  if (props.change < 0) return "arrow-down";
  return "minus";
});

const priceClasses = computed(() => {
  return [
    "price-display",
    `price-display--${props.size}`,
    `price-display--${props.align}`,
  ];
});
</script>

<template>
  <div :class="priceClasses">
    <!-- Precio principal -->
    <div class="price-display__price">
      <span class="price-display__currency">{{ currency }}</span>
      <span class="price-display__value">{{ formattedPrice }}</span>
    </div>

    <!-- Cambio (opcional) -->
    <div v-if="showChange" class="price-display__change">
      <Badge :variant="changeVariant" size="sm">
        <Icon :name="changeIcon" :size="12" />
        <span>{{ formattedChange }}</span>
        <span class="price-display__change-percent"
          >({{ formattedChangePercent }})</span
        >
      </Badge>
    </div>
  </div>
</template>

<style scoped>
.price-display {
  @apply flex flex-col gap-1;
}

.price-display--left {
  @apply items-start;
}

.price-display--center {
  @apply items-center;
}

.price-display--right {
  @apply items-end;
}

/* Precio */
.price-display__price {
  @apply flex items-baseline gap-1;
  @apply font-jetbrains font-bold;
  @apply text-text-primary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-primary);
}

.price-display__currency {
  @apply opacity-70;
}

/* Tamaños */
.price-display--sm .price-display__value {
  @apply text-lg;
}

.price-display--md .price-display__value {
  @apply text-2xl;
}

.price-display--lg .price-display__value {
  @apply text-4xl;
}

.price-display--xl .price-display__value {
  @apply text-6xl;
}

/* Change */
.price-display__change {
  @apply flex items-center gap-1;
}

.price-display__change-percent {
  @apply ml-1;
}
</style>
```

### 3.4 Ejemplos de Uso

```vue
<script setup>
import PriceDisplay from "@/components/molecules/PriceDisplay.vue";

const stockData = {
  price: 100.15,
  change: 0.25,
  changePercent: 0.25,
};
</script>

<template>
  <!-- Básico -->
  <PriceDisplay
    :price="stockData.price"
    :change="stockData.change"
    :change-percent="stockData.changePercent"
  />

  <!-- Sin cambio -->
  <PriceDisplay :price="100.15" :show-change="false" />

  <!-- Tamaños -->
  <PriceDisplay size="sm" :price="100.15" />
  <PriceDisplay size="md" :price="100.15" />
  <PriceDisplay size="lg" :price="100.15" />
  <PriceDisplay size="xl" :price="100.15" />

  <!-- Alineaciones -->
  <PriceDisplay align="left" :price="100.15" />
  <PriceDisplay align="center" :price="100.15" />
  <PriceDisplay align="right" :price="100.15" />

  <!-- Cambio negativo -->
  <PriceDisplay :price="99.9" :change="-0.25" :change-percent="-0.25" />
</template>
```

---

## 4. StatCard Component

### 4.1 Propósito

Tarjeta compacta para mostrar una métrica con título, valor y cambio opcional.

### 4.2 Composición Visual

```
┌─────────────────────────────────┐
│ Total Invertido           [i]   │ ← Título + help icon
│ $125,450.00                     │ ← Valor principal
│ ▲ +2.5% vs mes anterior         │ ← Cambio (opcional)
└─────────────────────────────────┘
```

### 4.3 API del Componente

```vue
<!-- src/components/molecules/StatCard.vue -->
<script setup>
import { computed } from "vue";
import Label from "@/components/atoms/Label.vue";
import Badge from "@/components/atoms/Badge.vue";
import Icon from "@/components/atoms/Icon.vue";

const props = defineProps({
  /**
   * Título de la métrica
   */
  title: {
    type: String,
    required: true,
  },

  /**
   * Valor de la métrica
   */
  value: {
    type: [String, Number],
    required: true,
  },

  /**
   * Formato del valor
   * @values 'number', 'currency', 'percent', 'text'
   */
  format: {
    type: String,
    default: "text",
    validator: (value) =>
      ["number", "currency", "percent", "text"].includes(value),
  },

  /**
   * Cambio respecto a período anterior
   */
  change: {
    type: Number,
    default: null,
  },

  /**
   * Texto descriptivo del cambio (ej: "vs mes anterior")
   */
  changeLabel: {
    type: String,
    default: "",
  },

  /**
   * Icono del stat
   */
  icon: {
    type: String,
    default: null,
  },

  /**
   * Color del icono
   */
  iconColor: {
    type: String,
    default: "currentColor",
  },

  /**
   * Tooltip de ayuda
   */
  helpText: {
    type: String,
    default: "",
  },

  /**
   * Estado de carga
   */
  loading: {
    type: Boolean,
    default: false,
  },
});

const formattedValue = computed(() => {
  if (props.loading) return "---";

  const value = props.value;

  switch (props.format) {
    case "currency":
      return `$${Number(value).toLocaleString("es-CL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    case "number":
      return Number(value).toLocaleString("es-CL");

    case "percent":
      return `${Number(value).toFixed(2)}%`;

    default:
      return value;
  }
});

const changeVariant = computed(() => {
  if (!props.change) return "neutral";
  return props.change >= 0 ? "success" : "error";
});

const changeIcon = computed(() => {
  if (!props.change) return "minus";
  return props.change >= 0 ? "arrow-up" : "arrow-down";
});

const changeText = computed(() => {
  if (!props.change) return null;

  const sign = props.change >= 0 ? "+" : "";
  const label = props.changeLabel ? ` ${props.changeLabel}` : "";
  return `${sign}${props.change.toFixed(2)}%${label}`;
});
</script>

<template>
  <div class="stat-card">
    <!-- Header -->
    <div class="stat-card__header">
      <!-- Icon (opcional) -->
      <div v-if="icon" class="stat-card__icon">
        <Icon :name="icon" :size="20" :color="iconColor" />
      </div>

      <!-- Título -->
      <h3 class="stat-card__title">
        {{ title }}
      </h3>

      <!-- Help icon (opcional) -->
      <Icon
        v-if="helpText"
        name="help-circle"
        :size="16"
        class="stat-card__help"
        :title="helpText"
      />
    </div>

    <!-- Valor -->
    <div class="stat-card__value">
      <Spinner v-if="loading" size="sm" />
      <span v-else>{{ formattedValue }}</span>
    </div>

    <!-- Change badge (opcional) -->
    <div v-if="changeText" class="stat-card__change">
      <Badge :variant="changeVariant" size="sm">
        <Icon :name="changeIcon" :size="12" />
        <span>{{ changeText }}</span>
      </Badge>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply flex flex-col gap-2;
  @apply p-4;
  @apply bg-bg-secondary;
  @apply border border-border rounded-lg;
  @apply transition-all duration-200;
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

.stat-card:hover {
  @apply border-primary;
  border-color: var(--color-primary);
}

/* Header */
.stat-card__header {
  @apply flex items-center gap-2;
}

.stat-card__icon {
  @apply flex-shrink-0;
}

.stat-card__title {
  @apply flex-1;
  @apply font-outfit font-medium text-sm;
  @apply text-text-secondary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-secondary);
}

.stat-card__help {
  @apply flex-shrink-0;
  @apply text-text-tertiary;
  @apply cursor-help;
  color: var(--color-text-tertiary);
}

/* Valor */
.stat-card__value {
  @apply font-jetbrains font-bold text-2xl;
  @apply text-text-primary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-primary);
}

/* Change */
.stat-card__change {
  @apply flex;
}
</style>
```

### 4.4 Ejemplos de Uso

```vue
<script setup>
import StatCard from "@/components/molecules/StatCard.vue";

const stats = {
  totalInvested: 125450.0,
  totalReturn: 8.5,
  portfolioCount: 3,
};
</script>

<template>
  <!-- Grid de stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Métrica de moneda -->
    <StatCard
      title="Total Invertido"
      :value="stats.totalInvested"
      format="currency"
      icon="dollar"
      icon-color="#00ffaa"
      :change="2.5"
      change-label="vs mes anterior"
      help-text="Suma de todas tus inversiones activas"
    />

    <!-- Métrica de porcentaje -->
    <StatCard
      title="Rendimiento Total"
      :value="stats.totalReturn"
      format="percent"
      icon="chart"
      :change="1.2"
      change-label="este mes"
    />

    <!-- Métrica numérica -->
    <StatCard
      title="Portafolios Activos"
      :value="stats.portfolioCount"
      format="number"
      icon="briefcase"
    />

    <!-- Loading state -->
    <StatCard title="Cargando..." :value="0" :loading="true" />
  </div>
</template>
```

---

## 5. MiniChart Component

### 5.1 Propósito

Gráfico sparkline simple para mostrar tendencia histórica en espacio reducido.

### 5.2 Composición Visual

```
┌─────────────────────────────────┐
│      /\    /\                   │
│     /  \  /  \  /\              │ ← Línea de tendencia
│    /    \/    \/  \___          │
│                                 │
└─────────────────────────────────┘
```

### 5.3 API del Componente

```vue
<!-- src/components/molecules/MiniChart.vue -->
<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  /**
   * Datos para el gráfico
   * Array de objetos: [{ date: '2025-01-01', value: 100 }, ...]
   * o Array de números: [100, 101, 102, ...]
   */
  data: {
    type: Array,
    required: true,
    validator: (value) => value.length > 0,
  },

  /**
   * Ancho del gráfico
   */
  width: {
    type: Number,
    default: 200,
  },

  /**
   * Alto del gráfico
   */
  height: {
    type: Number,
    default: 60,
  },

  /**
   * Color de la línea
   */
  color: {
    type: String,
    default: "#00ffaa",
  },

  /**
   * Grosor de la línea
   */
  strokeWidth: {
    type: Number,
    default: 2,
  },

  /**
   * Mostrar área bajo la línea
   */
  showArea: {
    type: Boolean,
    default: true,
  },

  /**
   * Opacidad del área
   */
  areaOpacity: {
    type: Number,
    default: 0.2,
  },

  /**
   * Suavizar curva
   */
  smooth: {
    type: Boolean,
    default: true,
  },
});

const canvasRef = ref(null);

// Normalizar datos a array de números
const normalizedData = computed(() => {
  return props.data.map((item) => {
    if (typeof item === "number") return item;
    return item.value || 0;
  });
});

// Calcular puntos del path SVG
const svgPath = computed(() => {
  const data = normalizedData.value;
  if (data.length === 0) return "";

  const width = props.width;
  const height = props.height;
  const padding = 5;

  // Encontrar min/max para escalar
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Evitar división por 0

  // Escalar puntos
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  if (props.smooth) {
    // Curva suave (Catmull-Rom spline simplificada)
    return createSmoothPath(points);
  } else {
    // Línea recta
    return createLinearPath(points);
  }
});

// Path para área (si showArea=true)
const svgAreaPath = computed(() => {
  if (!props.showArea) return "";

  const linePath = svgPath.value;
  const height = props.height;

  // Cerrar el path para crear área
  return `${linePath} L ${props.width - 5},${height - 5} L 5,${height - 5} Z`;
});

function createLinearPath(points) {
  if (points.length === 0) return "";

  const start = `M ${points[0].x},${points[0].y}`;
  const lines = points
    .slice(1)
    .map((p) => `L ${p.x},${p.y}`)
    .join(" ");

  return `${start} ${lines}`;
}

function createSmoothPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // Control points para curva suave
    const controlX1 = current.x + (next.x - current.x) / 3;
    const controlY1 = current.y;
    const controlX2 = current.x + (2 * (next.x - current.x)) / 3;
    const controlY2 = next.y;

    path += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${next.x},${next.y}`;
  }

  return path;
}

// Re-renderizar cuando cambien los datos
watch(
  () => props.data,
  () => {
    // Trigger re-render if needed
  },
  { deep: true },
);
</script>

<template>
  <svg
    ref="canvasRef"
    :width="width"
    :height="height"
    class="mini-chart"
    role="img"
    :aria-label="`Gráfico de tendencia con ${data.length} puntos de datos`"
  >
    <!-- Área bajo la curva (opcional) -->
    <path
      v-if="showArea"
      :d="svgAreaPath"
      :fill="color"
      :fill-opacity="areaOpacity"
      class="mini-chart__area"
    />

    <!-- Línea principal -->
    <path
      :d="svgPath"
      :stroke="color"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="mini-chart__line"
    />
  </svg>
</template>

<style scoped>
.mini-chart {
  @apply block;
}

.mini-chart__line {
  vector-effect: non-scaling-stroke;
}

.mini-chart__area {
  /* Estilos aplicados via props */
}
</style>
```

### 5.4 Ejemplos de Uso

```vue
<script setup>
import { ref } from "vue";
import MiniChart from "@/components/molecules/MiniChart.vue";

// Datos simple (array de números)
const simpleData = ref([100, 102, 98, 105, 103, 108, 110]);

// Datos con fechas (array de objetos)
const complexData = ref([
  { date: "2025-01-24", value: 100.0 },
  { date: "2025-01-25", value: 100.5 },
  { date: "2025-01-26", value: 99.8 },
  { date: "2025-01-27", value: 101.2 },
  { date: "2025-01-28", value: 100.9 },
  { date: "2025-01-29", value: 102.15 },
]);
</script>

<template>
  <!-- Básico -->
  <MiniChart :data="simpleData" />

  <!-- Personalizado -->
  <MiniChart
    :data="complexData"
    :width="300"
    :height="80"
    color="#00ffaa"
    :stroke-width="3"
    :show-area="true"
    :smooth="true"
  />

  <!-- Sin área -->
  <MiniChart :data="simpleData" :show-area="false" color="#ff6b6b" />

  <!-- Sin suavizado -->
  <MiniChart :data="simpleData" :smooth="false" />

  <!-- Dentro de StatCard -->
  <StatCard title="Precio AGG (7 días)" value="$100.15" format="text">
    <template #footer>
      <MiniChart :data="simpleData" :width="250" :height="50" />
    </template>
  </StatCard>
</template>
```

---

## 6. Integración entre Molecules

### 6.1 Composición en Formularios

```vue
<script setup>
import { ref } from "vue";
import FormGroup from "@/components/molecules/FormGroup.vue";
import Button from "@/components/atoms/Button.vue";

const formData = ref({
  amount: "",
  email: "",
  riskLevel: 3,
});

function handleSubmit() {
  console.log("Form submitted:", formData.value);
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormGroup
      v-model="formData.amount"
      label="Monto a invertir"
      type="number"
      suffix="$"
      icon="dollar"
      :min="10000"
      :max="1000000"
      required
      help-text="Monto entre $10,000 y $1,000,000"
    />

    <FormGroup
      v-model="formData.email"
      label="Correo electrónico"
      type="email"
      icon="mail"
      required
    />

    <FormGroup
      v-model="formData.riskLevel"
      label="Nivel de riesgo"
      type="number"
      :min="1"
      :max="5"
      label-help-text="1 = Conservador, 5 = Agresivo"
      required
    />

    <Button type="submit" full-width> Calcular Portafolio </Button>
  </form>
</template>
```

### 6.2 Dashboard de Métricas

```vue
<script setup>
import StatCard from "@/components/molecules/StatCard.vue";
import PriceDisplay from "@/components/molecules/PriceDisplay.vue";
import MiniChart from "@/components/molecules/MiniChart.vue";

const portfolioStats = {
  totalValue: 125450.0,
  totalReturn: 8.5,
  monthlyChange: 2.5,
  historicalData: [120000, 121500, 123000, 124200, 125450],
};
</script>

<template>
  <div class="dashboard-metrics">
    <!-- Stats grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Valor Total"
        :value="portfolioStats.totalValue"
        format="currency"
        icon="dollar"
        :change="portfolioStats.monthlyChange"
        change-label="este mes"
      />

      <StatCard
        title="Rendimiento"
        :value="portfolioStats.totalReturn"
        format="percent"
        icon="chart"
        :change="1.2"
      />

      <StatCard
        title="Volatilidad"
        :value="3.2"
        format="percent"
        icon="activity"
      />
    </div>

    <!-- Precio destacado con gráfico -->
    <div class="price-section">
      <PriceDisplay
        :price="125450.0"
        :change="3125.0"
        :change-percent="2.5"
        size="xl"
      />

      <MiniChart
        :data="portfolioStats.historicalData"
        :width="400"
        :height="100"
      />
    </div>
  </div>
</template>
```

---

## 7. Testing de Molecules

### 7.1 PriceDisplay.test.js

```javascript
// tests/components/molecules/PriceDisplay.test.js
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PriceDisplay from "@/components/molecules/PriceDisplay.vue";

describe("PriceDisplay", () => {
  it("debería formatear precio correctamente", () => {
    const wrapper = mount(PriceDisplay, {
      props: {
        price: 100.15,
        change: 0.25,
        changePercent: 0.25,
      },
    });

    expect(wrapper.text()).toContain("100,15");
    expect(wrapper.text()).toContain("+$0.25");
    expect(wrapper.text()).toContain("+0.25%");
  });

  it("debería mostrar badge de error para cambio negativo", () => {
    const wrapper = mount(PriceDisplay, {
      props: {
        price: 99.9,
        change: -0.25,
        changePercent: -0.25,
      },
    });

    const badge = wrapper.find(".badge--error");
    expect(badge.exists()).toBe(true);
  });

  it("debería ocultar cambio si showChange=false", () => {
    const wrapper = mount(PriceDisplay, {
      props: {
        price: 100.0,
        showChange: false,
      },
    });

    expect(wrapper.find(".price-display__change").exists()).toBe(false);
  });
});
```

---

## 8. Accesibilidad en Molecules

### 8.1 Checklist

- ✅ **FormGroup**: Labels asociados con `for`, ARIA para errores (`aria-describedby`)
- ✅ **PriceDisplay**: Estructura semántica, colores con contraste WCAG AA
- ✅ **StatCard**: Títulos con heading semántico, tooltips accesibles
- ✅ **MiniChart**: `role="img"`, `aria-label` descriptivo

### 8.2 Navegación por Teclado

```vue
<!-- Ejemplo: FormGroup navegable -->
<FormGroup v-model="amount" label="Monto" @keydown.enter="handleSubmit" />

<!-- Tab order correcto -->
<div class="form-stack">
  <FormGroup tabindex="0" /> <!-- 1 -->
  <FormGroup tabindex="0" /> <!-- 2 -->
  <Button tabindex="0" />    <!-- 3 -->
</div>
```

---

## 9. Resumen de Decisiones

| Decisión                 | Opción elegida          | Confianza | Razón                                |
| ------------------------ | ----------------------- | --------- | ------------------------------------ |
| **Chart library**        | SVG nativo (no lib)     | 🟡 MEDIA  | MiniChart simple, evita dependencias |
| **Validación FormGroup** | Props + función externa | 🟢 ALTA   | Flexible, reutilizable               |
| **Formato PriceDisplay** | Intl.NumberFormat       | 🟢 ALTA   | Estándar, soporte i18n               |
| **StatCard loading**     | Spinner atom            | 🟢 ALTA   | Consistente con sistema              |
| **MiniChart smoothing**  | Catmull-Rom spline      | 🟡 MEDIA  | Balance simplicidad/calidad          |

---

## 10. Próximos Pasos

1. ✅ **Especificación completada** (2025-01-30)
2. ⏳ **Implementar molecules** en `/src/components/molecules`
3. ⏳ **Testing unitario** con Vitest
4. ⏳ **Integración con organisms**
5. ⏳ **Organisms specs** (archivo 15/21)

---

**Última actualización:** 2025-01-30  
**Estado:** ✅ ESPECIFICACIÓN COMPLETA  
**Siguiente:** `componentes-organisms.md` (archivo 15/21)
