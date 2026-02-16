# Metodología LEGO - Componentes

**Tesorería Simple** • Sistema de Componentes Modulares

**Última actualización:** 2026-01-25  
**Versión:** 1.0 MVP

---

## 📋 Resumen Ejecutivo

### ¿Qué es Metodología LEGO?

Sistema de organización de componentes basado en **Atomic Design**, adaptado para este proyecto:

- **Atoms** (Átomos): Piezas más pequeñas, sin dependencias
- **Molecules** (Moléculas): Combinaciones simples de atoms
- **Organisms** (Organismos): Features completas que usan molecules + atoms
- **Templates** (Plantillas): Layouts (no aplicable en este proyecto)
- **Pages** (Páginas): Vistas completas (nuestras `*View.vue`)

### Principios

1. **Reutilización:** Cada pieza se usa en múltiples lugares
2. **Composición:** Piezas grandes se construyen con piezas pequeñas
3. **Independencia:** Cada pieza funciona sola
4. **YAGNI:** Solo crear lo que necesitamos ahora
5. **DRY:** No duplicar funcionalidad

---

## 🧱 Catálogo de Componentes

### Nivel 1: ATOMS (6 componentes)

Componentes base sin dependencias de otros componentes.

#### 1. BaseButton

**Responsabilidad:** Botón reutilizable con variantes visuales.

**Props:**

- `variant: 'primary' | 'secondary' | 'alert'` (default: 'primary')
- `disabled: boolean` (default: false)
- `type: 'button' | 'submit' | 'reset'` (default: 'button')

**Events:**

- `@click` - Emitido al hacer click

**Variantes:**

```vue
<BaseButton variant="primary">Calcular</BaseButton>
<BaseButton variant="secondary">Cancelar</BaseButton>
<BaseButton variant="alert">Eliminar</BaseButton>
```

**Tailwind Classes:**

```css
.btn-primary: bg-accent-growth-bg text-bg-primary
.btn-secondary: bg-transparent text-accent-growth border-accent-growth
.btn-alert: bg-accent-alert-bg text-bg-primary
```

**Usado en:**

- DiagnosticoForm
- DashboardView
- SimulatorView
- RoadmapSection

---

#### 2. BaseInput

**Responsabilidad:** Input de formulario con validación visual.

**Props:**

- `modelValue: number | string` (v-model)
- `type: 'text' | 'number' | 'email'` (default: 'text')
- `placeholder: string`
- `disabled: boolean` (default: false)
- `error: boolean` (default: false)
- `id: string` (required para a11y)

**Events:**

- `@update:modelValue` - v-model binding

**Ejemplo:**

```vue
<BaseInput
  id="excedente"
  v-model="excedente"
  type="number"
  placeholder="1000"
  :error="!!errorMessage"
/>
```

**Estados:**

- Normal: border gris sutil
- Focus: border verde, glow
- Error: border naranja
- Disabled: opacity 50%

**Usado en:**

- FormField (molecule)

---

#### 3. BaseCard

**Responsabilidad:** Contenedor con estilos base (fondo, borde, padding).

**Props:**

- `hoverable: boolean` (default: true) - Si tiene efecto hover

**Slots:**

- `default` - Contenido de la card

**Ejemplo:**

```vue
<BaseCard>
  <h3>Título</h3>
  <p>Contenido</p>
</BaseCard>
```

**Estilos:**

```css
background: linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(26, 35, 50, 0.9))
border: 1px solid rgba(0, 255, 170, 0.2)
padding: 1.5rem
border-radius: 12px

hover: border-color verde, glow, translateY(-2px)
```

**Usado en:**

- InstrumentCard
- MetricDisplay
- RoadmapSection

---

#### 4. BaseTooltip

**Responsabilidad:** Tooltip accesible (hover + focus).

**Props:**

- `content: string` (required) - Texto del tooltip
- `position: 'top' | 'bottom' | 'left' | 'right'` (default: 'top')

**Slots:**

- `default` - Elemento que dispara el tooltip (ej: ícono)

**Ejemplo:**

```vue
<BaseTooltip content="ETF: canasta de valores que cotiza en bolsa">
  <InfoIcon class="w-4 h-4" />
</BaseTooltip>
```

**Características:**

- Aparece en hover y focus (accesible por teclado)
- Se cierra con ESC o blur
- ARIA: `role="tooltip"`, `aria-describedby`

**Usado en:**

- InstrumentCard
- FormField
- Todas las vistas (inline)

---

#### 5. BaseBadge

**Responsabilidad:** Badge pequeño para estados/categorías.

**Props:**

- `variant: 'growth' | 'alert' | 'neutral'` (default: 'neutral')
- `animated: boolean` (default: false) - Pulse glow animation

**Slots:**

- `default` - Texto del badge

**Ejemplo:**

```vue
<BaseBadge variant="growth">Disponible</BaseBadge>
<BaseBadge variant="alert" animated>Próximamente</BaseBadge>
```

**Estilos por variante:**

```css
growth: bg verde transparente, border verde, text verde
alert: bg naranja transparente, border naranja, text naranja (+ pulse si animated)
neutral: bg azul transparente, border azul, text azul
```

**Usado en:**

- InstrumentCard
- RoadmapSection
- Footer

---

#### 6. BaseLoader

**Responsabilidad:** Indicador de carga (skeleton o spinner).

**Props:**

- `type: 'skeleton' | 'spinner'` (default: 'skeleton')
- `lines: number` (default: 3) - Solo para skeleton

**Ejemplo:**

```vue
<!-- Skeleton para texto -->
<BaseLoader type="skeleton" :lines="3" />

<!-- Spinner para acciones -->
<BaseLoader type="spinner" />
```

**Skeleton:**

- Shimmer animation (gradiente moviéndose)
- 3 líneas por default, altura 20px

**Spinner:**

- Círculo girando
- Color verde neón

**Usado en:**

- PortfolioSuggestion (mientras carga APIs)
- DashboardView

---

### Nivel 2: MOLECULES (4 componentes)

Combinaciones simples de atoms.

#### 1. FormField

**Responsabilidad:** Campo de formulario completo (label + input + error).

**Props:**

- `label: string` (required)
- `modelValue: number | string` (v-model)
- `type: 'text' | 'number' | 'email'` (default: 'text')
- `id: string` (required)
- `placeholder: string`
- `error: string` - Mensaje de error (si hay)
- `help: string` - Texto de ayuda
- `required: boolean` (default: false)

**Events:**

- `@update:modelValue`

**Ejemplo:**

```vue
<FormField
  id="excedente"
  label="Excedente disponible (USD)"
  v-model="excedente"
  type="number"
  placeholder="1000"
  :error="excedente < 0 ? 'Debe ser mayor a 0' : ''"
  help="Monto total que tienes disponible"
  required
/>
```

**Estructura interna:**

```vue
<div class="form-field">
  <label :for="id">{{ label }} <span v-if="required">*</span></label>
  <BaseInput
    :id="id"
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :type="type"
    :placeholder="placeholder"
    :error="!!error"
  />
  <span v-if="help" class="help-text">{{ help }}</span>
  <span v-if="error" class="error-text" role="alert">⚠️ {{ error }}</span>
</div>
```

**Usado en:**

- DiagnosticoForm

**Dependencias:**

- BaseInput (atom)

---

#### 2. InstrumentCard

**Responsabilidad:** Card de ETF/acción con precio, cambio %, asignación sugerida.

**Props:**

- `symbol: string` (required) - ej: 'AGG'
- `name: string` (required) - ej: 'iShares Core Bond ETF'
- `price: number` (required)
- `change: number` (required)
- `changePercent: number` (required)
- `allocation: number` (required) - ej: 60 (60%)
- `amount: number` (required) - ej: 420 (USD 420)
- `description: string` - Para tooltip

**Ejemplo:**

```vue
<InstrumentCard
  symbol="AGG"
  name="iShares Core U.S. Aggregate Bond ETF"
  :price="102.5"
  :change="0.15"
  :changePercent="0.15"
  :allocation="60"
  :amount="420"
  description="Bonos de alta calidad con vencimientos cortos"
/>
```

**Estructura interna:**

```vue
<BaseCard>
  <!-- Header -->
  <div class="flex justify-between items-start mb-4">
    <div>
      <h3 class="font-mono text-sm text-text-secondary">{{ symbol }}</h3>
      <p class="text-xs text-text-muted">{{ name }}</p>
    </div>
    <BaseTooltip v-if="description" :content="description">
      <InfoIcon />
    </BaseTooltip>
  </div>

  <!-- Precio y cambio -->
  <div class="mb-4">
    <div class="font-mono text-3xl text-accent-growth">
      ${{ price.toFixed(2) }}
    </div>
    <PercentageChange :value="changePercent" />
  </div>

  <!-- Asignación -->
  <div>
    <div class="text-xs text-text-muted mb-1">{{ allocation }}% sugerido</div>
    <div class="font-mono text-xl text-text-primary">
      ${{ amount.toFixed(2) }}
    </div>
    <!-- Progress bar -->
    <div class="h-1 bg-bg-secondary rounded-full mt-2">
      <div 
        class="h-full bg-accent-growth-bg rounded-full"
        :style="{ width: `${allocation}%` }"
      />
    </div>
  </div>
</BaseCard>
```

**Usado en:**

- PortfolioSuggestion (organism)

**Dependencias:**

- BaseCard (atom)
- BaseTooltip (atom)
- PercentageChange (molecule)

---

#### 3. MetricDisplay

**Responsabilidad:** Mostrar un número grande con label.

**Props:**

- `label: string` (required)
- `value: number` (required)
- `format: 'currency' | 'percent' | 'number'` (default: 'currency')
- `size: 'sm' | 'md' | 'lg'` (default: 'md')

**Ejemplo:**

```vue
<MetricDisplay
  label="Tu capital disponible"
  :value="700"
  format="currency"
  size="lg"
/>
```

**Estructura interna:**

```vue
<div class="metric-display">
  <div class="label">{{ label }}</div>
  <div :class="['value', `value-${size}`]">
    {{ formattedValue }}
  </div>
</div>

<script setup>
import { computed } from 'vue'
import { formatUSD, formatPercent } from '@/utils/format'

const formattedValue = computed(() => {
  switch (props.format) {
    case 'currency': return formatUSD(props.value)
    case 'percent': return formatPercent(props.value)
    default: return props.value.toLocaleString()
  }
})
</script>
```

**Estilos:**

```css
.label: font-mono, text-secondary, uppercase, text-xs
.value-sm: font-mono, text-2xl
.value-md: font-mono, text-4xl
.value-lg: font-mono, text-6xl, color accent-growth
```

**Usado en:**

- DashboardView
- SimulatorView

**Dependencias:**

- Ninguna (atom-level pero clasificado como molecule por complejidad)

---

#### 4. PercentageChange

**Responsabilidad:** Mostrar cambio porcentual con ícono (↑/↓) y color.

**Props:**

- `value: number` (required) - ej: 5.2 o -2.1

**Ejemplo:**

```vue
<PercentageChange :value="0.15" />
<!-- Renderiza: ↑ +0.15% (verde) -->

<PercentageChange :value="-0.21" />
<!-- Renderiza: ↓ -0.21% (naranja) -->
```

**Estructura interna:**

```vue
<div class="flex items-center gap-1">
  <TrendingUp 
    v-if="value >= 0" 
    class="w-4 h-4 text-accent-growth"
    aria-hidden="true"
  />
  <TrendingDown 
    v-else 
    class="w-4 h-4 text-accent-alert"
    aria-hidden="true"
  />
  
  <span :class="value >= 0 ? 'text-accent-growth' : 'text-accent-alert'">
    {{ value >= 0 ? '+' : '' }}{{ value.toFixed(2) }}%
    <span class="sr-only">
      {{ value >= 0 ? 'aumento' : 'disminución' }}
    </span>
  </span>
</div>
```

**Usado en:**

- InstrumentCard

**Dependencias:**

- Lucide icons (TrendingUp, TrendingDown)

---

### Nivel 3: ORGANISMS (5 componentes)

Features completas que orquestan molecules y atoms.

#### 1. DiagnosticoForm

**Responsabilidad:** Form completo de diagnóstico (4 inputs + validación + submit).

**Props:**

- Ninguno (maneja su propio estado local)

**Events:**

- `@submit` - Emite objeto con datos validados

**Estructura interna:**

```vue
<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserInputsStore } from "@/stores/userInputs";
import FormField from "@/components/molecules/FormField.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";

const router = useRouter();
const store = useUserInputsStore();

const excedente = ref(1000);
const reserva = ref(300);
const aporteMensual = ref(200);
const horizonte = ref(24); // meses

const errors = ref({});

const validate = () => {
  errors.value = {};

  if (excedente.value <= 0) {
    errors.value.excedente = "Debe ser mayor a 0";
  }

  if (reserva.value < 0) {
    errors.value.reserva = "No puede ser negativa";
  }

  if (reserva.value > excedente.value) {
    errors.value.reserva = "No puede ser mayor al excedente";
  }

  if (aporteMensual.value < 0) {
    errors.value.aporteMensual = "No puede ser negativo";
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;

  store.setInputs({
    excedente: excedente.value,
    reserva: reserva.value,
    aporteMensual: aporteMensual.value,
    horizonte: horizonte.value,
  });

  router.push({ name: "Dashboard" });
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="max-w-md mx-auto space-y-6">
    <FormField
      id="excedente"
      label="Excedente disponible (USD)"
      v-model="excedente"
      type="number"
      placeholder="1000"
      :error="errors.excedente"
      help="Monto total que tienes disponible"
      required
    />

    <FormField
      id="reserva"
      label="Reserva de emergencia (USD)"
      v-model="reserva"
      type="number"
      placeholder="300"
      :error="errors.reserva"
      help="Monto que necesitas mantener líquido"
      required
    />

    <FormField
      id="aporteMensual"
      label="Aporte mensual (USD)"
      v-model="aporteMensual"
      type="number"
      placeholder="200"
      :error="errors.aporteMensual"
      help="Cuánto puedes aportar cada mes"
    />

    <div class="form-field">
      <label for="horizonte">Horizonte temporal</label>
      <select
        id="horizonte"
        v-model="horizonte"
        class="w-full p-3 rounded-lg bg-bg-secondary border border-border-subtle"
      >
        <option :value="6">6 meses</option>
        <option :value="12">1 año</option>
        <option :value="24">2 años</option>
        <option :value="36">3 años</option>
        <option :value="60">5 años</option>
      </select>
    </div>

    <BaseButton type="submit" variant="primary" class="w-full">
      Calcular Portafolio
    </BaseButton>
  </form>
</template>
```

**Usado en:**

- HomeView

**Dependencias:**

- FormField (molecule) ×3
- BaseButton (atom)
- userInputs store

---

#### 2. PortfolioSuggestion

**Responsabilidad:** Grid de instrumentos + fetch de APIs + loading states.

**Props:**

- Ninguno (lee de stores)

**Estructura:**

```vue
<script setup>
import { ref, onMounted, computed } from "vue";
import { useUserInputsStore } from "@/stores/userInputs";
import { usePortfolioStore } from "@/stores/portfolio";
import { useMarketDataStore } from "@/stores/marketData";
import InstrumentCard from "@/components/molecules/InstrumentCard.vue";
import BaseLoader from "@/components/atoms/BaseLoader.vue";

const userInputsStore = useUserInputsStore();
const portfolioStore = usePortfolioStore();
const marketDataStore = useMarketDataStore();

const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    // 1. Calcular asignación
    portfolioStore.calculateAllocation(userInputsStore.horizonte);

    // 2. Fetch precios de APIs
    await marketDataStore.fetchQuotes(["AGG", "VYM", "JNJ"]);

    loading.value = false;
  } catch (err) {
    error.value = "Error al cargar datos del mercado";
    loading.value = false;
  }
});

const instruments = computed(() => portfolioStore.instruments);
</script>

<template>
  <div>
    <h2 class="font-display text-3xl font-bold mb-8">Instrumentos Sugeridos</h2>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <BaseLoader v-for="i in 3" :key="i" type="skeleton" :lines="6" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" role="alert" class="text-accent-alert">
      {{ error }}
      <BaseButton @click="retry">Reintentar</BaseButton>
    </div>

    <!-- Success state -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InstrumentCard
        v-for="inst in instruments"
        :key="inst.symbol"
        v-bind="inst"
      />
    </div>
  </div>
</template>
```

**Usado en:**

- DashboardView

**Dependencias:**

- InstrumentCard (molecule) ×3
- BaseLoader (atom)
- userInputs, portfolio, marketData stores

---

#### 3. ComparisonChart

**Responsabilidad:** Gráfico ApexCharts comparando cuenta corriente vs inversión.

**Props:**

- Ninguno (lee de stores)

**Estructura:**

```vue
<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserInputsStore } from "@/stores/userInputs";
import VueApexCharts from "vue3-apexcharts";

const userInputsStore = useUserInputsStore();

const chartOptions = ref({
  chart: {
    type: "line",
    background: "transparent",
    toolbar: { show: false },
  },
  theme: {
    mode: "dark",
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  colors: ["#00ffaa", "#6b7280"],
  xaxis: {
    categories: [],
  },
  yaxis: {
    labels: {
      formatter: (val) => `$${val.toLocaleString()}`,
    },
  },
  tooltip: {
    theme: "dark",
  },
});

const series = ref([
  { name: "Inversión", data: [] },
  { name: "Cuenta Corriente", data: [] },
]);

onMounted(() => {
  // Calcular proyecciones
  const meses = userInputsStore.horizonte;
  const categories = [];
  const dataInversion = [];
  const dataCuentaCorriente = [];

  const inicial = userInputsStore.montoInvertible;
  const mensual = userInputsStore.aporteMensual;

  for (let i = 0; i <= meses; i += Math.floor(meses / 4)) {
    categories.push(`Mes ${i}`);

    // Cuenta corriente (0% rentabilidad)
    dataCuentaCorriente.push(inicial + mensual * i);

    // Inversión (5% anual)
    const tasaMensual = 0.05 / 12;
    let valor = inicial * Math.pow(1 + tasaMensual, i);
    for (let j = 0; j < i; j++) {
      valor += mensual * Math.pow(1 + tasaMensual, i - j - 1);
    }
    dataInversion.push(Math.round(valor));
  }

  chartOptions.value.xaxis.categories = categories;
  series.value[0].data = dataInversion;
  series.value[1].data = dataCuentaCorriente;
});
</script>

<template>
  <div>
    <h2 class="font-display text-3xl font-bold mb-4">
      Comparación de Crecimiento
    </h2>
    <p class="text-text-secondary mb-8">
      Tu inversión vs dejar la plata en cuenta corriente
    </p>

    <VueApexCharts
      type="line"
      :options="chartOptions"
      :series="series"
      height="350"
    />
  </div>
</template>
```

**Usado en:**

- DashboardView

**Dependencias:**

- VueApexCharts (external library)
- userInputs store

---

#### 4. DCASimulator

**Responsabilidad:** Simulador interactivo con sliders + gráfico + métricas.

**Props:**

- Ninguno (estado local)

**Estructura:** Similar a ComparisonChart pero con sliders para ajustar valores en tiempo real.

**Dependencias:**

- MetricDisplay (molecule) ×4
- VueApexCharts
- BaseButton (atom)

---

#### 5. RoadmapSection

**Responsabilidad:** Sección "Próximamente" con features futuras.

**Props:**

- Ninguno (data hardcodeada)

**Estructura:**

```vue
<template>
  <section class="py-16">
    <h2 class="font-display text-4xl font-bold text-center mb-12">
      🚀 Próximamente
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <BaseCard v-for="feature in features" :key="feature.id">
        <div class="flex items-start justify-between mb-4">
          <h3 class="font-display text-xl font-bold">
            {{ feature.icon }} {{ feature.title }}
          </h3>
          <BaseBadge variant="alert" animated>
            {{ feature.eta }}
          </BaseBadge>
        </div>
        <p class="text-text-secondary text-sm mb-4">
          {{ feature.description }}
        </p>
        <BaseButton
          variant="secondary"
          class="w-full"
          @click="notifyMe(feature.id)"
        >
          Notificarme
        </BaseButton>
      </BaseCard>
    </div>
  </section>
</template>

<script setup>
const features = [
  {
    id: "ai-assistant",
    icon: "🤖",
    title: "Asistente IA Financiero",
    description: "Pregúntale a Claude sobre tus inversiones",
    eta: "Q2 2026",
  },
  {
    id: "smart-alerts",
    icon: "🔔",
    title: "Alertas Inteligentes",
    description: "Notificaciones contextuales sobre tu portafolio",
    eta: "Q3 2026",
  },
  {
    id: "broker-integration",
    icon: "🔗",
    title: "Integración Brokers",
    description: "Ejecuta órdenes directamente desde la app",
    eta: "Explorando",
  },
];

const notifyMe = (id) => {
  console.log(`User interested in: ${id}`);
  // TODO: Track interest
};
</script>
```

**Usado en:**

- HomeView

**Dependencias:**

- BaseCard (atom) ×3
- BaseBadge (atom) ×3
- BaseButton (atom) ×3

---

## 📊 Matriz de Dependencias

```
ORGANISMS (5)
├── DiagnosticoForm
│   ├── FormField (molecule)
│   └── BaseButton (atom)
│
├── PortfolioSuggestion
│   ├── InstrumentCard (molecule)
│   │   ├── BaseCard (atom)
│   │   ├── BaseTooltip (atom)
│   │   └── PercentageChange (molecule)
│   └── BaseLoader (atom)
│
├── ComparisonChart
│   └── VueApexCharts (external)
│
├── DCASimulator
│   ├── MetricDisplay (molecule)
│   ├── VueApexCharts (external)
│   └── BaseButton (atom)
│
└── RoadmapSection
    ├── BaseCard (atom)
    ├── BaseBadge (atom)
    └── BaseButton (atom)

MOLECULES (4)
├── FormField
│   └── BaseInput (atom)
│
├── InstrumentCard
│   ├── BaseCard (atom)
│   ├── BaseTooltip (atom)
│   └── PercentageChange (molecule)
│
├── MetricDisplay
│   └── (ninguno - standalone)
│
└── PercentageChange
    └── Lucide icons (external)

ATOMS (6)
├── BaseButton (standalone)
├── BaseInput (standalone)
├── BaseCard (standalone)
├── BaseTooltip (standalone)
├── BaseBadge (standalone)
└── BaseLoader (standalone)
```

---

## ✅ Checklist de Creación

Antes de crear un componente nuevo, pregúntate:

### 1. ¿Es necesario?

- [ ] ¿Se usa en más de un lugar? (Si no, inline en la vista)
- [ ] ¿Simplifica el código? (Si no, YAGNI)

### 2. ¿Qué nivel es?

- [ ] Atom: Sin dependencias de otros componentes custom
- [ ] Molecule: Combina 2-3 atoms
- [ ] Organism: Feature completa (usa molecules + atoms)

### 3. ¿Está bien diseñado?

- [ ] Props bien tipados
- [ ] Events bien nombrados
- [ ] Un propósito claro (no hace 5 cosas)
- [ ] Reutilizable (no atado a un caso de uso específico)

### 4. ¿Es accesible?

- [ ] Keyboard navigable
- [ ] Screen reader friendly (ARIA labels)
- [ ] Focus visible
- [ ] Touch targets 44px+ (botones)

### 5. ¿Está documentado?

- [ ] Props explicados
- [ ] Ejemplos de uso
- [ ] Dependencias listadas

---

## 🚀 Workflow de Desarrollo

### Orden de Implementación Sugerido:

**Semana 1:**

1. ✅ BaseButton
2. ✅ BaseInput
3. ✅ BaseCard
4. ✅ FormField (usa BaseInput)

**Semana 2:** 5. ✅ DiagnosticoForm (usa FormField + BaseButton) 6. ✅ BaseTooltip 7. ✅ BaseBadge 8. ✅ PercentageChange

**Semana 3:** 9. ✅ MetricDisplay 10. ✅ InstrumentCard (usa BaseCard, BaseTooltip, PercentageChange) 11. ✅ BaseLoader 12.
