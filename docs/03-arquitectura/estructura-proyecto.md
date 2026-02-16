# Estructura del Proyecto

**Tesorería Simple** • Organización de Carpetas y Archivos

**Última actualización:** 2026-01-25  
**Versión:** 1.0 MVP

---

## 📋 Resumen Ejecutivo

### Filosofía de Organización

Este proyecto sigue principios de:

- **Atomic Design adaptado (LEGO):** Componentes organizados por complejidad
- **Feature-agnostic:** Componentes reutilizables, no atados a features específicas
- **Colocation:** Assets/tests cerca del código que los usa
- **Escalabilidad:** Estructura que crece sin re-organizaciones masivas

### Estructura de Alto Nivel

```
tesoreria-simple/
├── docs/              # Documentación completa del proyecto
├── public/            # Assets estáticos (favicon, etc)
├── src/               # Código fuente de la aplicación
├── tests/             # Tests unitarios y de integración
└── config files       # Configuración (Vite, Tailwind, ESLint, etc)
```

---

## 🗂️ Árbol Completo

```
tesoreria-simple/
│
├── docs/                                    # 📚 Documentación
│   ├── README.md                            # Índice principal
│   ├── 01-producto/
│   │   ├── vision.md
│   │   ├── user-personas.md
│   │   ├── user-journey.md
│   │   ├── features.md
│   │   └── roadmap.md
│   ├── 02-diseno/
│   │   ├── sistema-de-diseno.html           # Sistema de diseño completo
│   │   ├── accesibilidad.md
│   │   ├── wireframes/
│   │   │   ├── home.png
│   │   │   ├── dashboard.png
│   │   │   └── simulator.png
│   │   └── assets/
│   │       └── color-palette.png
│   ├── 03-arquitectura/
│   │   ├── stack-tecnico.md
│   │   ├── estructura-proyecto.md           # 👈 Este archivo
│   │   ├── componentes-lego.md
│   │   ├── stores.md
│   │   ├── servicios.md
│   │   └── diagramas/
│   │       ├── flujo-completo.mmd
│   │       ├── flujo-diagnostico.mmd
│   │       ├── flujo-portafolio.mmd
│   │       ├── flujo-simulador.mmd
│   │       ├── arquitectura-datos.mmd
│   │       ├── navegacion.mmd
│   │       └── componentes-lego.mmd
│   ├── 04-apis/
│   │   ├── finnhub.md
│   │   ├── alpha-vantage.md
│   │   ├── integracion.md
│   │   └── ejemplos-response.json
│   ├── 05-componentes/
│   │   ├── README.md
│   │   ├── atoms/
│   │   │   ├── BaseButton.md
│   │   │   ├── BaseInput.md
│   │   │   └── ... (6 componentes)
│   │   ├── molecules/
│   │   │   └── ... (4 componentes)
│   │   └── organisms/
│   │       └── ... (5 componentes)
│   ├── 06-guias/
│   │   ├── setup-inicial.md
│   │   ├── desarrollo.md
│   │   ├── testing.md
│   │   ├── deployment.md
│   │   ├── tailwind-cheatsheet.md
│   │   └── troubleshooting.md
│   ├── 07-decisiones/
│   │   ├── research-notes.md
│   │   ├── adr/
│   │   │   ├── 001-vue-vs-react.md
│   │   │   ├── 002-tailwind-vs-css.md
│   │   │   ├── 003-apexcharts-vs-chartjs.md
│   │   │   ├── 004-mcp-para-v2.md
│   │   │   └── 005-accesibilidad-wcag.md
│   │   └── changelog.md
│   └── 08-presentacion/
│       ├── pitch.md
│       ├── demo-script.md
│       └── screenshots/
│
├── public/                                  # 🌐 Assets públicos
│   └── favicon.ico                          # Favicon de la app
│
├── src/                                     # 💻 Código fuente
│   │
│   ├── assets/                              # 🎨 Assets de desarrollo
│   │   ├── styles/
│   │   │   ├── main.css                     # Tailwind imports + global styles
│   │   │   └── animations.css               # Keyframes custom (reveal, shimmer, etc)
│   │   └── fonts/                           # (Opcional si no usas CDN)
│   │       ├── Outfit-Bold.woff2
│   │       ├── JetBrainsMono-Regular.woff2
│   │       └── DMSans-Regular.woff2
│   │
│   ├── components/                          # 🧱 Componentes Vue (LEGO)
│   │   │
│   │   ├── atoms/                           # Piezas más pequeñas (sin dependencias)
│   │   │   ├── BaseButton.vue               # Botón reutilizable (primary, secondary, alert)
│   │   │   ├── BaseInput.vue                # Input de formulario con validación
│   │   │   ├── BaseCard.vue                 # Card contenedor con estilos base
│   │   │   ├── BaseTooltip.vue              # Tooltip educativo
│   │   │   ├── BaseBadge.vue                # Badge (growth, alert, neutral)
│   │   │   └── BaseLoader.vue               # Spinner/skeleton loader
│   │   │
│   │   ├── molecules/                       # Combinaciones de atoms
│   │   │   ├── FormField.vue                # Label + Input + Error message
│   │   │   ├── InstrumentCard.vue           # Card de ETF/acción con precio + %
│   │   │   ├── MetricDisplay.vue            # Número grande con label (ej: $1,234)
│   │   │   └── PercentageChange.vue         # % con ícono (TrendingUp/Down)
│   │   │
│   │   └── organisms/                       # Features completas
│   │       ├── DiagnosticoForm.vue          # Form completo (4 inputs + validación)
│   │       ├── PortfolioSuggestion.vue      # Grid de InstrumentCards + lógica
│   │       ├── ComparisonChart.vue          # Gráfico ApexCharts configurado
│   │       ├── DCASimulator.vue             # Sliders + gráfico + métricas
│   │       └── RoadmapSection.vue           # Sección "Próximamente"
│   │
│   ├── views/                               # 📄 Vistas/Páginas principales
│   │   ├── HomeView.vue                     # Landing + DiagnosticoForm
│   │   ├── DashboardView.vue                # Portafolio + Comparador
│   │   └── SimulatorView.vue                # Simulador DCA
│   │
│   ├── router/                              # 🧭 Vue Router
│   │   └── index.js                         # Definición de rutas + guards
│   │
│   ├── stores/                              # 🗄️ Pinia Stores (State Management)
│   │   ├── userInputs.js                    # Estado del diagnóstico
│   │   ├── portfolio.js                     # Asignación + instrumentos
│   │   └── marketData.js                    # Quotes de APIs (precios, cambios)
│   │
│   ├── services/                            # ⚙️ Lógica de negocio y APIs
│   │   ├── api.js                           # Wrapper de Fetch + endpoints
│   │   └── calculations.js                  # Cálculos puros (DCA, asignación, etc)
│   │
│   ├── utils/                               # 🔧 Utilidades generales
│   │   ├── format.js                        # formatUSD, formatPercent
│   │   └── constants.js                     # ETFs, tasas, valores hardcodeados
│   │
│   ├── App.vue                              # 🏠 Componente raíz
│   └── main.js                              # 🚀 Entry point de la aplicación
│
├── tests/                                   # 🧪 Tests
│   └── unit/
│       ├── calculations.test.js             # Tests de lógica de negocio
│       └── format.test.js                   # Tests de formatters
│
├── .env.example                             # 🔒 Template de variables de entorno
├── .env.local                               # 🔑 Keys de APIs (gitignored)
├── .gitignore                               # 🚫 Archivos ignorados por Git
├── .eslintrc.cjs                            # ⚙️ Configuración ESLint
├── .prettierrc.json                         # 💅 Configuración Prettier
├── index.html                               # 📄 HTML entry point
├── package.json                             # 📦 Dependencies + scripts
├── package-lock.json                        # 🔒 Lockfile de npm
├── postcss.config.js                        # ⚙️ PostCSS (Tailwind)
├── tailwind.config.js                       # 🎨 Configuración Tailwind custom
├── vite.config.js                           # ⚡ Configuración Vite
├── vitest.config.js                         # 🧪 Configuración Vitest
└── README.md                                # 📖 Readme del proyecto
```

---

## 📁 Detalle por Carpeta

### `/docs` - Documentación

**Propósito:** Toda la documentación del proyecto en un solo lugar.

**Rationale:**

- Separado del código fuente (no afecta build)
- Fácil de navegar (estructura clara)
- Portfolio-friendly (muestra proceso de pensamiento)

**Subcarpetas:**

- `01-producto/` - Visión, usuarios, features, roadmap
- `02-diseno/` - Sistema de diseño, wireframes, accesibilidad
- `03-arquitectura/` - Stack, estructura, diagramas
- `04-apis/` - Documentación de integraciones externas
- `05-componentes/` - SPECS de cada componente
- `06-guias/` - Setup, desarrollo, deployment
- `07-decisiones/` - Research notes, ADRs, changelog
- `08-presentacion/` - Pitch, demo script, screenshots

---

### `/public` - Assets Estáticos

**Propósito:** Archivos servidos tal cual, sin procesamiento.

**Qué va aquí:**

- ✅ `favicon.ico`
- ✅ `robots.txt` (si lo usamos)
- ✅ Imágenes que no se importan en componentes

**Qué NO va aquí:**

- ❌ Imágenes importadas en componentes (van a `/src/assets`)
- ❌ CSS (va a `/src/assets/styles`)
- ❌ Fonts locales (van a `/src/assets/fonts` o mejor, usar CDN)

**Acceso:**

```html
<!-- En HTML o componentes -->
<img src="/favicon.ico" alt="Logo" />
<!-- Vite sirve desde /public directamente -->
```

---

### `/src` - Código Fuente

**Propósito:** Todo el código de la aplicación.

---

#### `/src/assets` - Assets de Desarrollo

**Propósito:** Archivos que Vite procesa (CSS, imágenes, fonts).

**Subcarpetas:**

**`/assets/styles`**

```css
/* main.css */
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
body {
  @apply bg-bg-primary text-text-primary font-body;
}

#app {
  /* Grid background */
  background-image:
    linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

```css
/* animations.css */
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ... más keyframes */
```

**`/assets/fonts`** (opcional)

- Solo si decides no usar Google Fonts CDN
- Archivos `.woff2` optimizados

---

#### `/src/components` - Componentes LEGO

**Propósito:** Componentes Vue organizados por complejidad (Atomic Design).

**Convenciones de Naming:**

- **Atoms:** `Base*.vue` (ej: `BaseButton.vue`)
- **Molecules:** `*Card.vue`, `*Display.vue`, `*Field.vue`
- **Organisms:** Nombre descriptivo del feature (ej: `DiagnosticoForm.vue`)

**Estructura de un componente típico:**

```vue
<!-- src/components/atoms/BaseButton.vue -->
<script setup>
defineProps({
  variant: {
    type: String,
    default: "primary", // primary, secondary, alert
    validator: (value) => ["primary", "secondary", "alert"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>

<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  @apply font-mono text-sm px-6 py-3 rounded-lg border-none cursor-pointer;
  @apply transition-all min-h-[44px] min-w-[44px];
  @apply uppercase tracking-wide;
}

.btn-primary {
  @apply bg-accent-growth-bg text-bg-primary font-semibold;
}

.btn-primary:hover:not(:disabled) {
  @apply shadow-glow-growth -translate-y-0.5;
}

.btn-secondary {
  @apply bg-transparent text-accent-growth border-2 border-accent-growth;
}

.btn-secondary:hover:not(:disabled) {
  @apply bg-accent-growth bg-opacity-10 shadow-glow-growth;
}

.btn-alert {
  @apply bg-accent-alert-bg text-bg-primary font-semibold;
}

.btn-alert:hover:not(:disabled) {
  @apply shadow-glow-alert -translate-y-0.5;
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .btn:hover {
    @apply translate-y-0;
  }
}
</style>
```

**Reglas:**

- Un componente = un archivo
- Props tipados con `defineProps`
- Emits declarados con `defineEmits`
- Estilos scoped (no afectan otros componentes)
- Tailwind preferred, custom CSS solo cuando necesario

---

#### `/src/views` - Vistas/Páginas

**Propósito:** Componentes de nivel página (una por ruta).

**Convenciones:**

- Sufijo `*View.vue` (ej: `HomeView.vue`)
- Nombre = ruta (ej: `/dashboard` → `DashboardView.vue`)

**Responsabilidades:**

- Orquestar organisms
- Manejar navigation guards (si aplicable)
- Layout de la página
- NO lógica de negocio (va a stores/services)

**Ejemplo:**

```vue
<!-- src/views/DashboardView.vue -->
<script setup>
import { onMounted } from "vue";
import { useUserInputsStore } from "@/stores/userInputs";
import { useRouter } from "vue-router";
import PortfolioSuggestion from "@/components/organisms/PortfolioSuggestion.vue";
import ComparisonChart from "@/components/organisms/ComparisonChart.vue";

const router = useRouter();
const userInputsStore = useUserInputsStore();

// Redirect si no hay datos
onMounted(() => {
  if (!userInputsStore.excedente) {
    router.push({ name: "Home" });
  }
});
</script>

<template>
  <div class="container mx-auto px-6 py-12">
    <header class="mb-12">
      <h1 class="font-display text-5xl font-bold mb-2">
        Tu Portafolio Sugerido
      </h1>
      <p class="text-text-secondary text-lg">Basado en tu perfil conservador</p>
    </header>

    <PortfolioSuggestion class="mb-16" />

    <ComparisonChart class="mb-12" />

    <div class="flex justify-center">
      <BaseButton @click="router.push({ name: 'Simulator' })">
        Ir a Simulador DCA
      </BaseButton>
    </div>
  </div>
</template>
```

---

#### `/src/router` - Vue Router

**Archivo único:** `index.js`

**Contenido:**

```javascript
import { createRouter, createWebHistory } from "vue-router";
import { useUserInputsStore } from "@/stores/userInputs";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
    meta: { title: "Inicio - Tesorería Simple" },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { title: "Dashboard - Tesorería Simple" },
    beforeEnter: (to, from, next) => {
      const store = useUserInputsStore();
      if (!store.excedente) {
        next({ name: "Home" });
      } else {
        next();
      }
    },
  },
  {
    path: "/simulator",
    name: "Simulator",
    component: () => import("@/views/SimulatorView.vue"),
    meta: { title: "Simulador DCA - Tesorería Simple" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Update title on route change
router.afterEach((to) => {
  document.title = to.meta.title || "Tesorería Simple";
});

export default router;
```

**Características:**

- Lazy loading (`import()`) para code-splitting
- Navigation guards para proteger rutas
- Meta tags para SEO
- 404 redirect a home

---

#### `/src/stores` - Pinia Stores

**Propósito:** State management global.

**Un store por dominio:**

- `userInputs.js` - Datos del diagnóstico
- `portfolio.js` - Asignación + instrumentos
- `marketData.js` - Quotes de APIs

**Ejemplo:**

```javascript
// src/stores/userInputs.js
import { defineStore } from "pinia";

export const useUserInputsStore = defineStore("userInputs", {
  state: () => ({
    excedente: 0,
    reserva: 0,
    aporteMensual: 0,
    horizonte: 12, // meses
  }),

  getters: {
    montoInvertible: (state) => {
      return Math.max(0, state.excedente - state.reserva);
    },

    horizonteAnios: (state) => {
      return state.horizonte / 12;
    },
  },

  actions: {
    setInputs(data) {
      this.excedente = Number(data.excedente) || 0;
      this.reserva = Number(data.reserva) || 0;
      this.aporteMensual = Number(data.aporteMensual) || 0;
      this.horizonte = Number(data.horizonte) || 12;
    },

    reset() {
      this.$reset();
    },
  },
});
```

**Reglas:**

- State simple (no objetos anidados complejos)
- Getters para computed values
- Actions para mutations
- No lógica de negocio pesada (va a `/services`)

---

#### `/src/services` - Lógica de Negocio

**Propósito:** Funciones puras y llamadas a APIs.

**`api.js` - Wrapper de APIs:**

```javascript
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

export async function fetchQuote(symbol) {
  try {
    const res = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    return {
      symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    throw error;
  }
}

export async function fetchMultipleQuotes(symbols) {
  return Promise.all(symbols.map(fetchQuote));
}
```

**`calculations.js` - Lógica Pura:**

```javascript
/**
 * Calcula proyección DCA (Dollar Cost Averaging)
 * @param {number} inicial - Monto inicial
 * @param {number} mensual - Aporte mensual
 * @param {number} meses - Horizonte en meses
 * @param {number} rentabilidadAnual - Rentabilidad anual (ej: 0.05 = 5%)
 * @returns {object} { valorFinal, totalAportado, ganancia, rentabilidadTotal }
 */
export function calculateDCA({ inicial, mensual, meses, rentabilidadAnual }) {
  const tasaMensual = rentabilidadAnual / 12;

  let valor = inicial;

  // Aplica crecimiento al monto inicial
  valor = inicial * Math.pow(1 + tasaMensual, meses);

  // Suma aportes mensuales con interés compuesto
  for (let i = 0; i < meses; i++) {
    valor += mensual * Math.pow(1 + tasaMensual, meses - i - 1);
  }

  const totalAportado = inicial + mensual * meses;
  const ganancia = valor - totalAportado;
  const rentabilidadTotal = (ganancia / totalAportado) * 100;

  return {
    valorFinal: Math.round(valor * 100) / 100,
    totalAportado,
    ganancia: Math.round(ganancia * 100) / 100,
    rentabilidadTotal: Math.round(rentabilidadTotal * 100) / 100,
  };
}

/**
 * Calcula asignación de portafolio según horizonte
 * @param {number} meses - Horizonte en meses
 * @returns {object} { bonds, dividends, stocks }
 */
export function calculateAllocation(meses) {
  if (meses <= 12) {
    return { bonds: 0.7, dividends: 0.2, stocks: 0.1 };
  }
  if (meses <= 36) {
    return { bonds: 0.6, dividends: 0.3, stocks: 0.1 };
  }
  return { bonds: 0.5, dividends: 0.35, stocks: 0.15 };
}
```

**Características:**

- Funciones puras (sin side effects)
- Bien documentadas (JSDoc)
- Testeable fácilmente
- Sin dependencias de Vue/Pinia

---

#### `/src/utils` - Utilidades

**Propósito:** Funciones helper reutilizables.

**`format.js`:**

```javascript
/**
 * Formatea número como USD
 * @param {number} amount
 * @returns {string} ej: "$1,234.56"
 */
export function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea número como porcentaje
 * @param {number} value - Valor en porcentaje (ej: 5.2)
 * @returns {string} ej: "5.20%"
 */
export function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}
```

**`constants.js`:**

```javascript
// ETFs disponibles
export const INSTRUMENTS = [
  {
    symbol: "AGG",
    name: "iShares Core U.S. Aggregate Bond ETF",
    type: "bonds",
    description:
      "Bonos de alta calidad con vencimientos cortos. Ultra seguros.",
  },
  {
    symbol: "VYM",
    name: "Vanguard High Dividend Yield ETF",
    type: "dividends",
    description: "Empresas estables que pagan dividendos consistentes.",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    type: "stocks",
    description: "Empresa blue chip con historial de estabilidad.",
  },
];

// Rentabilidad conservadora asumida
export const ANNUAL_RETURN = 0.05; // 5%

// Mínimos/máximos
export const MIN_INVESTABLE = 500; // USD
export const MAX_INVESTABLE = 100000; // USD
```

---

#### `/src/App.vue` - Componente Raíz

```vue
<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div id="app">
    <!-- Skip link para accesibilidad -->
    <a href="#main-content" class="skip-link">
      Saltar al contenido principal
    </a>

    <!-- Header global (si lo usamos) -->
    <header role="banner" class="header">
      <!-- Nav -->
    </header>

    <!-- Main content area -->
    <main id="main-content" role="main" tabindex="-1">
      <RouterView />
    </main>

    <!-- Footer global -->
    <footer role="contentinfo" class="footer">
      <p>Tesorería Simple v1.0 • WCAG AA ✅</p>
    </footer>
  </div>
</template>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-growth-bg);
  color: var(--bg-primary);
  padding: 12px 24px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

---

#### `/src/main.js` - Entry Point

```javascript
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";

// Styles
import "./assets/styles/main.css";
import "./assets/styles/animations.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
```

---

### `/tests` - Tests

**Estructura:**

```
tests/
└── unit/
    ├── calculations.test.js
    └── format.test.js
```

**Ejemplo:**

```javascript
// tests/unit/calculations.test.js
import { describe, it, expect } from 'vitest'
import { calculateDCA, calculateAllocation } from '@/services/calculations'

describe('calculateDCA', () => {
  it('calcula correctamente con aportes mensuales', () => {
    const result = calculateDCA({
      inicial: 1000,
      mensual: 200,
      meses: 12,
      rentabilidadAnual: 0.05
    })

    expect(result.valorFinal).toBeCloseTo(3635, 0)
    expect(result.
```
