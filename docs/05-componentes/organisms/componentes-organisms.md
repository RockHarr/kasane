# Componentes Organisms - Tesorería Simple

**Versión:** 1.0  
**Fecha:** 2025-01-30  
**Estado:** 📐 ESPECIFICACIÓN  
**Autor:** Rockwell Harrison

---

## 1. Overview

Los **organisms** son componentes complejos que combinan múltiples molecules y atoms para formar secciones completas de la interfaz. Son específicos del contexto de la aplicación.

### 1.1 Principios de Diseño de Organisms

```
PRINCIPIO                    IMPLEMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Complex Composition     →    Combina múltiples molecules/atoms
Context-Aware           →    Conectado a stores (Pinia)
Business Logic          →    Contiene lógica de negocio
State Management        →    Maneja estado complejo interno
Data Fetching           →    Puede llamar servicios/APIs
Responsive              →    Adaptable a diferentes viewports
Self-Contained          →    Funcional de forma independiente
```

### 1.2 Organisms Disponibles

| Organism         | Propósito                       | Molecules usados         | Complejidad |
| ---------------- | ------------------------------- | ------------------------ | ----------- |
| StockCard        | Tarjeta de acción individual    | PriceDisplay + MiniChart | Media       |
| PortfolioSummary | Resumen completo del portafolio | StatCard × N             | Alta        |
| SimulatorForm    | Formulario de simulación        | FormGroup × N            | Alta        |
| ChartPanel       | Panel de gráficos históricos    | MiniChart (expandido)    | Alta        |
| Header           | Navegación y título de la app   | Button + Badge           | Baja        |

---

## 2. StockCard Component

### 2.1 Propósito

Tarjeta completa que muestra información de una acción/ETF con precio actual, cambio, gráfico histórico y acciones.

### 2.2 Composición Visual

```
┌─────────────────────────────────────────────┐
│ AGG                              [ETF]      │ ← Símbolo + Badge
│ iShares Core U.S. Aggregate Bond ETF       │ ← Nombre completo
├─────────────────────────────────────────────┤
│ $100.15           ▲ +$0.25 (+0.25%)        │ ← PriceDisplay
├─────────────────────────────────────────────┤
│          [Mini gráfico 7 días]              │ ← MiniChart
├─────────────────────────────────────────────┤
│ Rendimiento: 2.85% | Volatilidad: 1.2%    │ ← Stats
├─────────────────────────────────────────────┤
│ [Ver detalles]              [Agregar]      │ ← Acciones
└─────────────────────────────────────────────┘
```

### 2.3 API del Componente

```vue
<!-- src/components/organisms/StockCard.vue -->
<script setup>
import { ref, computed } from "vue";
import { useMarketDataStore } from "@/stores/marketData";
import PriceDisplay from "@/components/molecules/PriceDisplay.vue";
import MiniChart from "@/components/molecules/MiniChart.vue";
import Badge from "@/components/atoms/Badge.vue";
import Button from "@/components/atoms/Button.vue";
import Icon from "@/components/atoms/Icon.vue";
import Spinner from "@/components/atoms/Spinner.vue";

const props = defineProps({
  /**
   * Símbolo de la acción/ETF
   */
  symbol: {
    type: String,
    required: true,
  },

  /**
   * Datos precargados (opcional, evita fetch)
   */
  data: {
    type: Object,
    default: null,
  },

  /**
   * Mostrar gráfico histórico
   */
  showChart: {
    type: Boolean,
    default: true,
  },

  /**
   * Mostrar acciones (botones)
   */
  showActions: {
    type: Boolean,
    default: true,
  },

  /**
   * Variante de la tarjeta
   * @values 'default', 'compact', 'expanded'
   */
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "compact", "expanded"].includes(value),
  },

  /**
   * Estado seleccionado (para portfolio)
   */
  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select", "deselect", "view-details"]);

const marketData = useMarketDataStore();
const loading = ref(false);
const error = ref(null);

// Computed para datos (props.data o del store)
const stockData = computed(() => {
  if (props.data) return props.data;
  return marketData.getSymbolData(props.symbol);
});

const isLoading = computed(() => {
  return loading.value || marketData.isLoading(props.symbol);
});

const hasError = computed(() => {
  return error.value || marketData.getError(props.symbol);
});

// Computed para información derivada
const currentPrice = computed(() => {
  return stockData.value?.current?.price || 0;
});

const priceChange = computed(() => {
  return stockData.value?.current?.change || 0;
});

const priceChangePercent = computed(() => {
  return stockData.value?.current?.changePercent || 0;
});

const assetType = computed(() => {
  return stockData.value?.fundamentals?.assetType || "Stock";
});

const assetName = computed(() => {
  return stockData.value?.fundamentals?.name || props.symbol;
});

const dividendYield = computed(() => {
  return stockData.value?.fundamentals?.dividendYield || 0;
});

const volatility = computed(() => {
  return stockData.value?.historical?.statistics?.volatilityPercent || 0;
});

const historicalData = computed(() => {
  if (!stockData.value?.historical?.data) return [];
  return stockData.value.historical.data.map((d) => d.close);
});

// Badge variant según tipo de activo
const assetBadgeVariant = computed(() => {
  const type = assetType.value.toLowerCase();
  if (type === "etf") return "info";
  if (type === "stock") return "success";
  return "neutral";
});

// Card classes
const cardClasses = computed(() => {
  return [
    "stock-card",
    `stock-card--${props.variant}`,
    {
      "stock-card--selected": props.selected,
      "stock-card--loading": isLoading.value,
      "stock-card--error": hasError.value,
    },
  ];
});

// Handlers
function handleSelect() {
  if (props.selected) {
    emit("deselect", props.symbol);
  } else {
    emit("select", props.symbol);
  }
}

function handleViewDetails() {
  emit("view-details", props.symbol);
}

// Fetch data si no está precargada
async function fetchData() {
  if (props.data || stockData.value) return;

  loading.value = true;
  error.value = null;

  try {
    await marketData.fetchSymbol(props.symbol, {
      includeHistorical: props.showChart,
      includeFundamentals: true,
      historicalRange: "1M",
    });
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Auto-fetch al montar si es necesario
onMounted(() => {
  if (!props.data && !stockData.value) {
    fetchData();
  }
});
</script>

<template>
  <div :class="cardClasses">
    <!-- Loading state -->
    <div v-if="isLoading" class="stock-card__loading">
      <Spinner size="lg" />
      <p>Cargando {{ symbol }}...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="stock-card__error">
      <Icon name="alert-circle" :size="32" color="var(--color-error)" />
      <p class="stock-card__error-message">{{ hasError }}</p>
      <Button variant="tertiary" size="sm" @click="fetchData">
        Reintentar
      </Button>
    </div>

    <!-- Content -->
    <div v-else-if="stockData" class="stock-card__content">
      <!-- Header -->
      <div class="stock-card__header">
        <div class="stock-card__header-left">
          <h3 class="stock-card__symbol">{{ symbol }}</h3>
          <Badge :variant="assetBadgeVariant" size="sm">
            {{ assetType }}
          </Badge>
        </div>

        <!-- Checkbox de selección (opcional) -->
        <input
          v-if="showActions"
          type="checkbox"
          :checked="selected"
          class="stock-card__checkbox"
          @change="handleSelect"
        />
      </div>

      <!-- Nombre completo -->
      <p v-if="variant !== 'compact'" class="stock-card__name">
        {{ assetName }}
      </p>

      <!-- Precio -->
      <div class="stock-card__price">
        <PriceDisplay
          :price="currentPrice"
          :change="priceChange"
          :change-percent="priceChangePercent"
          :size="variant === 'compact' ? 'md' : 'lg'"
        />
      </div>

      <!-- Gráfico (no en compact) -->
      <div v-if="showChart && variant !== 'compact'" class="stock-card__chart">
        <MiniChart
          :data="historicalData"
          :width="300"
          :height="60"
          color="var(--color-primary)"
        />
      </div>

      <!-- Stats (solo en expanded) -->
      <div v-if="variant === 'expanded'" class="stock-card__stats">
        <div class="stock-card__stat">
          <span class="stock-card__stat-label">Rendimiento</span>
          <span class="stock-card__stat-value">
            {{ (dividendYield * 100).toFixed(2) }}%
          </span>
        </div>
        <div class="stock-card__stat-divider"></div>
        <div class="stock-card__stat">
          <span class="stock-card__stat-label">Volatilidad</span>
          <span class="stock-card__stat-value">
            {{ volatility.toFixed(2) }}%
          </span>
        </div>
      </div>

      <!-- Acciones -->
      <div v-if="showActions" class="stock-card__actions">
        <Button
          variant="tertiary"
          size="sm"
          icon="info"
          @click="handleViewDetails"
        >
          Ver detalles
        </Button>

        <Button
          :variant="selected ? 'secondary' : 'primary'"
          size="sm"
          @click="handleSelect"
        >
          {{ selected ? "Remover" : "Agregar" }}
        </Button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="stock-card__empty">
      <Icon name="alert-circle" :size="32" />
      <p>No hay datos disponibles</p>
    </div>
  </div>
</template>

<style scoped>
/* Base */
.stock-card {
  @apply relative;
  @apply bg-bg-secondary;
  @apply border-2 border-border rounded-xl;
  @apply p-6;
  @apply transition-all duration-300;
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

.stock-card:hover {
  @apply border-primary shadow-lg;
  border-color: var(--color-primary);
  box-shadow: 0 10px 40px rgba(0, 255, 170, 0.1);
}

.stock-card--selected {
  @apply border-primary bg-opacity-80;
  border-color: var(--color-primary);
  background-color: rgba(var(--color-bg-secondary-rgb), 0.8);
}

/* Variantes */
.stock-card--compact {
  @apply p-4;
}

.stock-card--expanded {
  @apply p-8;
}

/* Loading/Error states */
.stock-card__loading,
.stock-card__error,
.stock-card__empty {
  @apply flex flex-col items-center justify-center gap-3;
  @apply py-12;
  @apply text-text-tertiary;
  color: var(--color-text-tertiary);
}

.stock-card__error-message {
  @apply text-error text-sm;
  color: var(--color-error);
}

/* Header */
.stock-card__header {
  @apply flex items-center justify-between mb-3;
}

.stock-card__header-left {
  @apply flex items-center gap-2;
}

.stock-card__symbol {
  @apply font-jetbrains font-bold text-2xl;
  @apply text-text-primary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-primary);
}

.stock-card__checkbox {
  @apply w-5 h-5;
  @apply accent-primary;
  @apply cursor-pointer;
  accent-color: var(--color-primary);
}

/* Nombre */
.stock-card__name {
  @apply mb-4;
  @apply font-outfit text-sm;
  @apply text-text-secondary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-secondary);
}

/* Precio */
.stock-card__price {
  @apply mb-4;
}

/* Gráfico */
.stock-card__chart {
  @apply mb-4;
  @apply flex justify-center;
}

/* Stats */
.stock-card__stats {
  @apply flex items-center gap-4 mb-4;
  @apply py-3 px-4;
  @apply bg-bg-tertiary rounded-lg;
  background-color: var(--color-bg-tertiary);
}

.stock-card__stat {
  @apply flex flex-col gap-1;
  @apply flex-1;
}

.stock-card__stat-label {
  @apply font-outfit text-xs;
  @apply text-text-tertiary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-tertiary);
}

.stock-card__stat-value {
  @apply font-jetbrains font-bold text-lg;
  @apply text-text-primary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-primary);
}

.stock-card__stat-divider {
  @apply w-px h-full;
  @apply bg-border;
  background-color: var(--color-border);
}

/* Acciones */
.stock-card__actions {
  @apply flex gap-2;
}

.stock-card__actions > * {
  @apply flex-1;
}

/* Responsive */
@media (max-width: 640px) {
  .stock-card {
    @apply p-4;
  }

  .stock-card__chart {
    @apply overflow-x-auto;
  }
}
</style>
```

### 2.4 Ejemplos de Uso

```vue
<script setup>
import { ref } from "vue";
import StockCard from "@/components/organisms/StockCard.vue";

const selectedSymbols = ref(["AGG", "VYM"]);

function handleSelect(symbol) {
  selectedSymbols.value.push(symbol);
}

function handleDeselect(symbol) {
  selectedSymbols.value = selectedSymbols.value.filter((s) => s !== symbol);
}
</script>

<template>
  <!-- Grid de stocks -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StockCard
      symbol="AGG"
      :selected="selectedSymbols.includes('AGG')"
      @select="handleSelect"
      @deselect="handleDeselect"
    />

    <StockCard
      symbol="VYM"
      variant="expanded"
      :selected="selectedSymbols.includes('VYM')"
    />

    <StockCard symbol="JNJ" variant="compact" :show-chart="false" />
  </div>
</template>
```

---

## 3. PortfolioSummary Component

### 3.1 Propósito

Resumen completo del portafolio calculado con métricas clave, distribución y rendimiento esperado.

### 3.2 Composición Visual

```
┌─────────────────────────────────────────────────────┐
│ RESUMEN DEL PORTAFOLIO                              │
├─────────────────────────────────────────────────────┤
│ [StatCard]  [StatCard]  [StatCard]  [StatCard]     │ ← Métricas principales
├─────────────────────────────────────────────────────┤
│ Distribución:                                       │
│ AGG ████████████████░░░░░░ 60% ($60,000)           │ ← Barras de distribución
│ VYM ██████████░░░░░░░░░░░░ 30% ($30,000)           │
│ JNJ ████░░░░░░░░░░░░░░░░░░ 10% ($10,000)           │
├─────────────────────────────────────────────────────┤
│ [Descargar PDF]                    [Invertir ahora] │ ← Acciones
└─────────────────────────────────────────────────────┘
```

### 3.3 API del Componente

```vue
<!-- src/components/organisms/PortfolioSummary.vue -->
<script setup>
import { computed } from "vue";
import { usePortfolioStore } from "@/stores/portfolio";
import StatCard from "@/components/molecules/StatCard.vue";
import Button from "@/components/atoms/Button.vue";
import Badge from "@/components/atoms/Badge.vue";

const props = defineProps({
  /**
   * Portafolio calculado
   */
  portfolio: {
    type: Object,
    required: true,
  },

  /**
   * Mostrar acciones (botones)
   */
  showActions: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["download", "invest"]);

// Computed para métricas
const totalAmount = computed(() => {
  return props.portfolio.totalAmount || 0;
});

const expectedReturn = computed(() => {
  return props.portfolio.expectedReturn || 0;
});

const volatility = computed(() => {
  return props.portfolio.volatility || 0;
});

const assetCount = computed(() => {
  return props.portfolio.assets?.length || 0;
});

const distribution = computed(() => {
  return (
    props.portfolio.assets?.map((asset) => ({
      symbol: asset.symbol,
      percentage: asset.percentage,
      amount: (totalAmount.value * asset.percentage) / 100,
      color: getAssetColor(asset.symbol),
    })) || []
  );
});

// Funciones helper
function getAssetColor(symbol) {
  const colors = {
    AGG: "#00ffaa",
    VYM: "#00d4ff",
    JNJ: "#ff6b6b",
    SCHD: "#ffd93d",
    VNQ: "#a78bfa",
  };
  return colors[symbol] || "#6b7280";
}

function formatCurrency(amount) {
  return `$${amount.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Handlers
function handleDownload() {
  emit("download", props.portfolio);
}

function handleInvest() {
  emit("invest", props.portfolio);
}
</script>

<template>
  <div class="portfolio-summary">
    <!-- Header -->
    <div class="portfolio-summary__header">
      <h2 class="portfolio-summary__title">Resumen del Portafolio</h2>
      <Badge variant="success">Optimizado</Badge>
    </div>

    <!-- Métricas principales -->
    <div class="portfolio-summary__metrics">
      <StatCard
        title="Inversión Total"
        :value="totalAmount"
        format="currency"
        icon="dollar"
        icon-color="var(--color-primary)"
      />

      <StatCard
        title="Rendimiento Esperado"
        :value="expectedReturn"
        format="percent"
        icon="chart"
        icon-color="var(--color-success)"
        help-text="Rendimiento anual proyectado"
      />

      <StatCard
        title="Volatilidad"
        :value="volatility"
        format="percent"
        icon="activity"
        icon-color="var(--color-warning)"
        help-text="Riesgo del portafolio (desviación estándar)"
      />

      <StatCard
        title="Activos"
        :value="assetCount"
        format="number"
        icon="briefcase"
      />
    </div>

    <!-- Distribución -->
    <div class="portfolio-summary__distribution">
      <h3 class="portfolio-summary__section-title">Distribución de Activos</h3>

      <div class="portfolio-summary__distribution-list">
        <div
          v-for="asset in distribution"
          :key="asset.symbol"
          class="portfolio-summary__asset"
        >
          <!-- Asset info -->
          <div class="portfolio-summary__asset-info">
            <span class="portfolio-summary__asset-symbol">{{
              asset.symbol
            }}</span>
            <span class="portfolio-summary__asset-amount">
              {{ formatCurrency(asset.amount) }}
            </span>
          </div>

          <!-- Progress bar -->
          <div class="portfolio-summary__asset-bar-container">
            <div
              class="portfolio-summary__asset-bar"
              :style="{
                width: `${asset.percentage}%`,
                backgroundColor: asset.color,
              }"
            />
          </div>

          <!-- Percentage -->
          <div class="portfolio-summary__asset-percentage">
            {{ asset.percentage.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div v-if="showActions" class="portfolio-summary__actions">
      <Button variant="secondary" icon="download" @click="handleDownload">
        Descargar PDF
      </Button>

      <Button
        variant="primary"
        icon="arrow-right"
        icon-position="right"
        @click="handleInvest"
      >
        Invertir ahora
      </Button>
    </div>
  </div>
</template>

<style scoped>
.portfolio-summary {
  @apply bg-bg-secondary;
  @apply border-2 border-border rounded-xl;
  @apply p-8;
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

/* Header */
.portfolio-summary__header {
  @apply flex items-center justify-between mb-6;
}

.portfolio-summary__title {
  @apply font-outfit font-bold text-2xl;
  @apply text-text-primary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-primary);
}

/* Métricas */
.portfolio-summary__metrics {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8;
}

/* Distribución */
.portfolio-summary__distribution {
  @apply mb-8;
}

.portfolio-summary__section-title {
  @apply font-outfit font-semibold text-lg mb-4;
  @apply text-text-primary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-primary);
}

.portfolio-summary__distribution-list {
  @apply flex flex-col gap-4;
}

/* Asset row */
.portfolio-summary__asset {
  @apply flex items-center gap-4;
}

.portfolio-summary__asset-info {
  @apply flex items-center justify-between;
  @apply w-32 flex-shrink-0;
}

.portfolio-summary__asset-symbol {
  @apply font-jetbrains font-bold;
  @apply text-text-primary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-primary);
}

.portfolio-summary__asset-amount {
  @apply font-jetbrains text-sm;
  @apply text-text-secondary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-secondary);
}

.portfolio-summary__asset-bar-container {
  @apply flex-1;
  @apply h-8 bg-bg-tertiary rounded-full overflow-hidden;
  background-color: var(--color-bg-tertiary);
}

.portfolio-summary__asset-bar {
  @apply h-full;
  @apply transition-all duration-500 ease-out;
}

.portfolio-summary__asset-percentage {
  @apply w-16 text-right;
  @apply font-jetbrains font-bold;
  @apply text-text-primary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-primary);
}

/* Acciones */
.portfolio-summary__actions {
  @apply flex gap-4;
  @apply pt-6 border-t border-border;
  border-color: var(--color-border);
}

.portfolio-summary__actions > * {
  @apply flex-1;
}

/* Responsive */
@media (max-width: 768px) {
  .portfolio-summary {
    @apply p-4;
  }

  .portfolio-summary__metrics {
    @apply grid-cols-2;
  }

  .portfolio-summary__asset {
    @apply flex-wrap;
  }

  .portfolio-summary__asset-info {
    @apply w-full mb-2;
  }
}
</style>
```

---

## 4. SimulatorForm Component

### 4.1 Propósito

Formulario completo para ingresar datos de simulación (monto, horizonte, riesgo) y calcular portafolio.

### 4.2 Composición Visual

```
┌─────────────────────────────────────────────────────┐
│ SIMULAR PORTAFOLIO                                  │
├─────────────────────────────────────────────────────┤
│ Monto a invertir *                                  │
│ [$] [_________________] (USD)                       │
│ ℹ Monto entre $10,000 y $1,000,000                 │
├─────────────────────────────────────────────────────┤
│ Horizonte de inversión *                            │
│ [___] meses                                         │
├─────────────────────────────────────────────────────┤
│ Perfil de riesgo *                         [?]      │
│ ○ Conservador   ○ Moderado   ● Agresivo            │
├─────────────────────────────────────────────────────┤
│ [Limpiar]                      [Calcular Portafolio]│
└─────────────────────────────────────────────────────┘
```

### 4.3 API del Componente

```vue
<!-- src/components/organisms/SimulatorForm.vue -->
<script setup>
import { ref, computed, watch } from "vue";
import { usePortfolioStore } from "@/stores/portfolio";
import FormGroup from "@/components/molecules/FormGroup.vue";
import Button from "@/components/atoms/Button.vue";
import Badge from "@/components/atoms/Badge.vue";

const props = defineProps({
  /**
   * Valores iniciales del formulario
   */
  initialValues: {
    type: Object,
    default: () => ({
      amount: "",
      horizon: 12,
      riskLevel: "moderate",
    }),
  },

  /**
   * Estado de carga (calculando)
   */
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "reset"]);

const portfolioStore = usePortfolioStore();

// Form state
const formData = ref({
  amount: props.initialValues.amount,
  horizon: props.initialValues.horizon,
  riskLevel: props.initialValues.riskLevel,
});

const formErrors = ref({
  amount: "",
  horizon: "",
  riskLevel: "",
});

// Validadores
function validateAmount(value) {
  if (!value) return "El monto es requerido";

  const num = Number(value);
  if (isNaN(num)) return "Ingrese un monto válido";
  if (num < 10000) return "El monto mínimo es $10,000";
  if (num > 1000000) return "El monto máximo es $1,000,000";

  return null;
}

function validateHorizon(value) {
  if (!value) return "El horizonte es requerido";

  const num = Number(value);
  if (isNaN(num)) return "Ingrese un número válido";
  if (num < 1) return "El horizonte mínimo es 1 mes";
  if (num > 360) return "El horizonte máximo es 360 meses (30 años)";

  return null;
}

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.amount &&
    formData.value.horizon &&
    formData.value.riskLevel &&
    !formErrors.value.amount &&
    !formErrors.value.horizon
  );
});

const riskLevelOptions = [
  {
    value: "conservative",
    label: "Conservador",
    description: "Bajo riesgo, retorno moderado",
  },
  {
    value: "moderate",
    label: "Moderado",
    description: "Riesgo medio, retorno balanceado",
  },
  {
    value: "aggressive",
    label: "Agresivo",
    description: "Alto riesgo, alto retorno potencial",
  },
];

const selectedRiskOption = computed(() => {
  return riskLevelOptions.find((opt) => opt.value === formData.value.riskLevel);
});

// Handlers
async function handleSubmit() {
  // Validar todo el formulario
  const amountError = validateAmount(formData.value.amount);
  const horizonError = validateHorizon(formData.value.horizon);

  formErrors.value = {
    amount: amountError,
    horizon: horizonError,
    riskLevel: "",
  };

  if (!isFormValid.value) {
    return;
  }

  emit("submit", { ...formData.value });
}

function handleReset() {
  formData.value = {
    amount: "",
    horizon: 12,
    riskLevel: "moderate",
  };

  formErrors.value = {
    amount: "",
    horizon: "",
    riskLevel: "",
  };

  emit("reset");
}

function handleRiskLevelChange(level) {
  formData.value.riskLevel = level;
}

// Watch para guardar en store
watch(
  () => formData.value,
  (newData) => {
    portfolioStore.updateUserInputs(newData);
  },
  { deep: true },
);
</script>

<template>
  <div class="simulator-form">
    <!-- Header -->
    <div class="simulator-form__header">
      <h2 class="simulator-form__title">Simular Portafolio</h2>
      <Badge variant="info">Gratuito</Badge>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="simulator-form__form">
      <!-- Monto -->
      <FormGroup
        v-model="formData.amount"
        label="Monto a invertir"
        type="number"
        suffix="USD"
        icon="dollar"
        :validator="validateAmount"
        :min="10000"
        :max="1000000"
        :step="1000"
        placeholder="Ej: 100000"
        help-text="Ingrese un monto entre $10,000 y $1,000,000"
        required
      />

      <!-- Horizonte -->
      <FormGroup
        v-model="formData.horizon"
        label="Horizonte de inversión"
        type="number"
        suffix="meses"
        icon="calendar"
        :validator="validateHorizon"
        :min="1"
        :max="360"
        placeholder="Ej: 12"
        help-text="¿Por cuánto tiempo planea invertir?"
        label-help-text="El horizonte temporal afecta la estrategia de inversión"
        required
      />

      <!-- Perfil de riesgo -->
      <div class="simulator-form__field">
        <label class="simulator-form__label">
          Perfil de riesgo *
          <Icon
            name="help-circle"
            :size="16"
            class="simulator-form__help-icon"
            title="Seleccione su tolerancia al riesgo"
          />
        </label>

        <div class="simulator-form__risk-options">
          <button
            v-for="option in riskLevelOptions"
            :key="option.value"
            type="button"
            class="simulator-form__risk-option"
            :class="{
              'simulator-form__risk-option--active':
                formData.riskLevel === option.value,
            }"
            @click="handleRiskLevelChange(option.value)"
          >
            <input
              type="radio"
              :value="option.value"
              :checked="formData.riskLevel === option.value"
              class="simulator-form__risk-radio"
            />
            <div class="simulator-form__risk-content">
              <span class="simulator-form__risk-label">{{ option.label }}</span>
              <span class="simulator-form__risk-description">{{
                option.description
              }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Acciones -->
      <div class="simulator-form__actions">
        <Button
          type="button"
          variant="tertiary"
          @click="handleReset"
          :disabled="loading"
        >
          Limpiar
        </Button>

        <Button
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="!isFormValid"
          icon="calculator"
          icon-position="right"
        >
          Calcular Portafolio
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.simulator-form {
  @apply bg-bg-secondary;
  @apply border-2 border-border rounded-xl;
  @apply p-8;
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

/* Header */
.simulator-form__header {
  @apply flex items-center justify-between mb-6;
}

.simulator-form__title {
  @apply font-outfit font-bold text-2xl;
  @apply text-text-primary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-primary);
}

/* Form */
.simulator-form__form {
  @apply flex flex-col gap-6;
}

/* Field */
.simulator-form__field {
  @apply flex flex-col gap-2;
}

.simulator-form__label {
  @apply flex items-center gap-2;
  @apply font-outfit font-medium text-sm;
  @apply text-text-primary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-primary);
}

.simulator-form__help-icon {
  @apply text-text-tertiary cursor-help;
  color: var(--color-text-tertiary);
}

/* Risk options */
.simulator-form__risk-options {
  @apply flex flex-col gap-3;
}

.simulator-form__risk-option {
  @apply flex items-start gap-3;
  @apply p-4;
  @apply bg-bg-tertiary;
  @apply border-2 border-border rounded-lg;
  @apply transition-all duration-200;
  @apply cursor-pointer;
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border);
}

.simulator-form__risk-option:hover {
  @apply border-primary;
  border-color: var(--color-primary);
}

.simulator-form__risk-option--active {
  @apply border-primary bg-opacity-80;
  border-color: var(--color-primary);
  background-color: rgba(var(--color-bg-secondary-rgb), 0.8);
}

.simulator-form__risk-radio {
  @apply mt-1;
  @apply accent-primary;
  accent-color: var(--color-primary);
}

.simulator-form__risk-content {
  @apply flex flex-col gap-1;
}

.simulator-form__risk-label {
  @apply font-outfit font-semibold;
  @apply text-text-primary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-primary);
}

.simulator-form__risk-description {
  @apply font-outfit text-sm;
  @apply text-text-tertiary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-tertiary);
}

/* Acciones */
.simulator-form__actions {
  @apply flex gap-4;
  @apply pt-6 border-t border-border;
  border-color: var(--color-border);
}

.simulator-form__actions > * {
  @apply flex-1;
}

/* Responsive */
@media (max-width: 640px) {
  .simulator-form {
    @apply p-4;
  }

  .simulator-form__actions {
    @apply flex-col;
  }
}
</style>
```

---

## 5. ChartPanel Component

### 5.1 Propósito

Panel expandido de gráficos históricos con controles de rango temporal y visualización avanzada usando ApexCharts.

### 5.2 API del Componente

```vue
<!-- src/components/organisms/ChartPanel.vue -->
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import ApexCharts from "apexcharts";
import Button from "@/components/atoms/Button.vue";
import Badge from "@/components/atoms/Badge.vue";
import Spinner from "@/components/atoms/Spinner.vue";

const props = defineProps({
  /**
   * Símbolo del activo
   */
  symbol: {
    type: String,
    required: true,
  },

  /**
   * Datos históricos
   * Array de { date: string, open: number, high: number, low: number, close: number }
   */
  data: {
    type: Array,
    required: true,
  },

  /**
   * Rango inicial
   */
  initialRange: {
    type: String,
    default: "1M",
    validator: (value) => ["1W", "1M", "3M", "6M", "1Y", "ALL"].includes(value),
  },

  /**
   * Alto del gráfico
   */
  height: {
    type: Number,
    default: 400,
  },

  /**
   * Tipo de gráfico
   * @values 'line', 'candlestick', 'area'
   */
  chartType: {
    type: String,
    default: "line",
    validator: (value) => ["line", "candlestick", "area"].includes(value),
  },
});

const emit = defineEmits(["range-change"]);

const chartRef = ref(null);
const chartInstance = ref(null);
const selectedRange = ref(props.initialRange);
const loading = ref(false);

const ranges = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

// Computed para datos filtrados
const filteredData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  const now = new Date();
  const rangeDays = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
    ALL: Infinity,
  };

  const days = rangeDays[selectedRange.value];
  if (days === Infinity) return props.data;

  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return props.data.filter((d) => new Date(d.date) >= cutoff);
});

// Configuración de ApexCharts
const chartOptions = computed(() => {
  return {
    chart: {
      type: props.chartType === "candlestick" ? "candlestick" : "area",
      height: props.height,
      background: "transparent",
      foreColor: "var(--color-text-primary)",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    theme: {
      mode: "dark",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: ["var(--color-primary)"],
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "var(--color-text-tertiary)",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`,
        style: {
          colors: "var(--color-text-tertiary)",
        },
      },
    },
    grid: {
      borderColor: "var(--color-border)",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      x: {
        format: "dd MMM yyyy",
      },
    },
  };
});

// Series data
const chartSeries = computed(() => {
  if (props.chartType === "candlestick") {
    return [
      {
        name: props.symbol,
        data: filteredData.value.map((d) => ({
          x: new Date(d.date).getTime(),
          y: [d.open, d.high, d.low, d.close],
        })),
      },
    ];
  }

  // Line/Area chart
  return [
    {
      name: props.symbol,
      data: filteredData.value.map((d) => ({
        x: new Date(d.date).getTime(),
        y: d.close,
      })),
    },
  ];
});

// Handlers
function handleRangeChange(range) {
  selectedRange.value = range;
  emit("range-change", range);
}

// Lifecycle
onMounted(() => {
  if (chartRef.value) {
    chartInstance.value = new ApexCharts(chartRef.value, {
      ...chartOptions.value,
      series: chartSeries.value,
    });
    chartInstance.value.render();
  }
});

// Watch para actualizar gráfico
watch(
  [chartSeries, chartOptions],
  () => {
    if (chartInstance.value) {
      chartInstance.value.updateOptions(chartOptions.value);
      chartInstance.value.updateSeries(chartSeries.value);
    }
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
</script>

<template>
  <div class="chart-panel">
    <!-- Header -->
    <div class="chart-panel__header">
      <div class="chart-panel__title-section">
        <h3 class="chart-panel__title">{{ symbol }}</h3>
        <Badge variant="info" size="sm">Histórico</Badge>
      </div>

      <!-- Range selector -->
      <div class="chart-panel__range-selector">
        <Button
          v-for="range in ranges"
          :key="range"
          :variant="selectedRange === range ? 'primary' : 'tertiary'"
          size="sm"
          @click="handleRangeChange(range)"
        >
          {{ range }}
        </Button>
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-panel__chart">
      <div v-if="loading" class="chart-panel__loading">
        <Spinner size="lg" />
      </div>
      <div v-else ref="chartRef" class="chart-panel__canvas"></div>
    </div>
  </div>
</template>

<style scoped>
.chart-panel {
  @apply bg-bg-secondary;
  @apply border-2 border-border rounded-xl;
  @apply p-6;
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

/* Header */
.chart-panel__header {
  @apply flex items-center justify-between mb-6;
  @apply flex-wrap gap-4;
}

.chart-panel__title-section {
  @apply flex items-center gap-3;
}

.chart-panel__title {
  @apply font-jetbrains font-bold text-xl;
  @apply text-text-primary;
  font-family: "JetBrains Mono", monospace;
  color: var(--color-text-primary);
}

.chart-panel__range-selector {
  @apply flex gap-2;
}

/* Chart */
.chart-panel__chart {
  @apply relative;
}

.chart-panel__loading {
  @apply flex items-center justify-center;
  @apply h-96;
}

.chart-panel__canvas {
  @apply w-full;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-panel__header {
    @apply flex-col items-start;
  }

  .chart-panel__range-selector {
    @apply w-full overflow-x-auto;
  }
}
</style>
```

---

## 6. Header Component

### 6.1 Propósito

Barra de navegación principal con logo, título y acciones globales.

### 6.2 API del Componente

```vue
<!-- src/components/organisms/Header.vue -->
<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Button from "@/components/atoms/Button.vue";
import Icon from "@/components/atoms/Icon.vue";

const router = useRouter();
const route = useRoute();

const mobileMenuOpen = ref(false);

const navItems = [
  { label: "Inicio", path: "/", icon: "home" },
  { label: "Dashboard", path: "/dashboard", icon: "chart" },
  { label: "Simulador", path: "/simulator", icon: "calculator" },
];

const isActive = (path) => {
  return route.path === path;
};

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function navigate(path) {
  router.push(path);
  mobileMenuOpen.value = false;
}
</script>

<template>
  <header class="header">
    <div class="header__container">
      <!-- Logo & Title -->
      <div class="header__brand">
        <Icon name="dollar" :size="32" color="var(--color-primary)" />
        <h1 class="header__title">Tesorería Simple</h1>
      </div>

      <!-- Desktop Nav -->
      <nav class="header__nav header__nav--desktop">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="header__nav-item"
          :class="{ 'header__nav-item--active': isActive(item.path) }"
          @click="navigate(item.path)"
        >
          <Icon :name="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Mobile Menu Button -->
      <button
        class="header__mobile-toggle"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <Icon :name="mobileMenuOpen ? 'x' : 'menu'" :size="24" />
      </button>
    </div>

    <!-- Mobile Nav -->
    <nav v-if="mobileMenuOpen" class="header__nav header__nav--mobile">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="header__nav-item"
        :class="{ 'header__nav-item--active': isActive(item.path) }"
        @click="navigate(item.path)"
      >
        <Icon :name="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.header {
  @apply bg-bg-primary;
  @apply border-b-2 border-border;
  @apply sticky top-0 z-50;
  background-color: var(--color-bg-primary);
  border-color: var(--color-border);
}

.header__container {
  @apply max-w-7xl mx-auto;
  @apply flex items-center justify-between;
  @apply px-6 py-4;
}

/* Brand */
.header__brand {
  @apply flex items-center gap-3;
}

.header__title {
  @apply font-outfit font-bold text-xl;
  @apply text-text-primary;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-primary);
}

/* Nav */
.header__nav--desktop {
  @apply hidden md:flex items-center gap-2;
}

.header__nav--mobile {
  @apply flex md:hidden flex-col gap-2;
  @apply px-6 pb-4;
}

.header__nav-item {
  @apply flex items-center gap-2;
  @apply px-4 py-2;
  @apply font-outfit font-medium;
  @apply text-text-secondary;
  @apply rounded-lg;
  @apply transition-all duration-200;
  font-family: "Outfit", sans-serif;
  color: var(--color-text-secondary);
}

.header__nav-item:hover {
  @apply bg-bg-tertiary text-primary;
  background-color: var(--color-bg-tertiary);
  color: var(--color-primary);
}

.header__nav-item--active {
  @apply bg-primary text-bg-primary;
  background-color: var(--color-primary);
  color: var(--color-bg-primary);
}

/* Mobile toggle */
.header__mobile-toggle {
  @apply md:hidden;
  @apply text-text-primary;
  color: var(--color-text-primary);
}
</style>
```

---

## 7. Resumen de Decisiones

| Decisión                   | Opción elegida         | Confianza | Razón                                   |
| -------------------------- | ---------------------- | --------- | --------------------------------------- |
| **StockCard data source**  | Props + Store (dual)   | 🟢 ALTA   | Flexibilidad máxima                     |
| **Chart library**          | ApexCharts             | 🟢 ALTA   | Potente, customizable, bien documentado |
| **Form validation**        | Inline + real-time     | 🟢 ALTA   | Mejor UX, feedback inmediato            |
| **Portfolio distribution** | Progress bars (no pie) | 🟡 MEDIA  | Más legible en espacios reducidos       |
| **Header navigation**      | Router-based           | 🟢 ALTA   | SPA estándar con Vue Router             |

---

## 8. Próximos Pasos

1. ✅ **Especificación completada** (2025-01-30)
2. ⏳ **Implementar organisms** en `/src/components/organisms`
3. ⏳ **Integración con Pinia stores**
4. ⏳ **Testing E2E** con componentes completos
5. ⏳ **Views specs** (archivos 16-21)

---

**Última actualización:** 2025-01-30  
**Estado:** ✅ ESPECIFICACIÓN COMPLETA  
**Siguiente:** Archivos 16-21 (guías de desarrollo, deployment, presentación)
