# Stack Técnico

**Tesorería Simple** • Tech Stack Completo y Rationale

**Última actualización:** 2026-02-16
**Versión:** 1.0 MVP

---

## 📋 Resumen Ejecutivo

### Stack Core

```
Frontend:  Vue 3 + Tailwind CSS v4 + Pinia + TypeScript
Build:     Vite
Charts:    ApexCharts
Auth:      Firebase Authentication (Google + email/password)
Database:  Cloud Firestore
Deploy:    Vercel
```

> ⚠️ **Cambio respecto al diseño inicial:** Se integró Firebase Auth + Firestore
> en lugar de operar sin backend. Ver ADR 006 para el rationale completo.

### Principios de Selección

1. **YAGNI** (You Aren't Gonna Need It) - No agregar complejidad prematura
2. **Ecosistema maduro** - Herramientas probadas, buena documentación
3. **Developer Experience** - Rápido de desarrollar, fácil de mantener
4. **Escalabilidad** - Puede crecer si el proyecto lo requiere
5. **Portfolio-friendly** - Demuestra skills relevantes para empleadores

---

## 🎯 Core Stack

### Framework: Vue 3

**Versión:** 3.5+  
**API Style:** Composition API

#### ¿Por qué Vue?

✅ **Mandatorio del curso** - No negociable  
✅ **Composition API moderna** - Mejor que Options API  
✅ **Reactivity nativa** - Perfecto para data en tiempo real  
✅ **Ecosistema maduro** - Router, Pinia, librerías  
✅ **Learning curve suave** - Rockwell aprende rápido

#### Alternativas Consideradas

| Tecnología | Por qué NO                           |
| ---------- | ------------------------------------ |
| React      | No es requisito del curso            |
| Svelte     | Menos maduro, menos jobs             |
| Angular    | Overkill, curva de aprendizaje steep |

#### Ejemplo de Uso

```vue
<script setup>
import { ref, computed } from "vue";
import { usePortfolioStore } from "@/stores/portfolio";

const store = usePortfolioStore();
const amount = ref(1000);

const investable = computed(() => amount.value - store.userInputs.reserva);
</script>

<template>
  <div class="bg-bg-elevated p-6 rounded-lg">
    <MetricDisplay label="Monto invertible" :value="investable" />
  </div>
</template>
```

---

### Build Tool: Vite

**Versión:** 6.0+

#### ¿Por qué Vite?

✅ **Default de Vue 3** - `npm create vue@latest`  
✅ **HMR instantáneo** - Cambios se ven al instante  
✅ **ESM nativo** - No bundling en dev (super rápido)  
✅ **Configuración mínima** - Funciona out-of-the-box  
✅ **Build optimizado** - Tree-shaking, code-splitting

#### Alternativas Consideradas

| Tecnología | Por qué NO                        |
| ---------- | --------------------------------- |
| Webpack    | Más lento, configuración compleja |
| Parcel     | Menos features, menos popular     |
| esbuild    | Demasiado low-level               |

#### Configuración

```javascript
// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
```

---

### State Management: Pinia

**Versión:** 2.2+

#### ¿Por qué Pinia?

✅ **State management oficial de Vue 3**  
✅ **Composition API native** - Sintaxis moderna  
✅ **TypeScript-friendly** - Aunque no usemos TS ahora  
✅ **DevTools integration** - Debugging fácil  
✅ **Simple y ligero** - Menos boilerplate que Vuex

#### Stores del Proyecto

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
    montoInvertible: (state) => state.excedente - state.reserva,
  },

  actions: {
    setInputs(data) {
      this.excedente = data.excedente;
      this.reserva = data.reserva;
      this.aporteMensual = data.aporteMensual;
      this.horizonte = data.horizonte;
    },
  },
});
```

**Otros stores:**

- `portfolio.js` - Asignación de portafolio + instrumentos
- `marketData.js` - Quotes de APIs (precios, cambios)

#### Alternativas Consideradas

| Tecnología           | Por qué NO                          |
| -------------------- | ----------------------------------- |
| Vuex                 | Legacy, más verboso                 |
| Composition API solo | No persiste state entre componentes |
| Context API          | No existe en Vue (es de React)      |

---

### Routing: Vue Router

**Versión:** 4.0+

#### ¿Por qué Vue Router?

✅ **Router oficial de Vue**  
✅ **URLs limpias** - `/dashboard` mejor que `/#/dashboard`  
✅ **Navigation guards** - Proteger rutas  
✅ **Lazy loading** - Cargar vistas solo cuando se necesitan  
✅ **Profesional** - Mejor para portfolio

#### Rutas del Proyecto

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useUserInputsStore } from "@/stores/userInputs";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/DashboardView.vue"),
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
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
```

#### Alternativas Consideradas

| Solución              | Por qué NO              |
| --------------------- | ----------------------- |
| Conditional rendering | No URLs, no back button |
| Hash mode             | URLs feas (`/#/`)       |

---

## 🎨 Styling & UI

### CSS Framework: Tailwind CSS

**Versión:** 3.4+

#### ¿Por qué Tailwind?

✅ **Utility-first** - Componentes custom sin CSS pesado  
✅ **Rápido para prototipar** - No pensar en nombres de clases  
✅ **Customizable** - Perfecto para estética única  
✅ **Tree-shaking** - Solo CSS que usas  
✅ **Learning opportunity** - Rockwell aprende skill útil

#### Configuración Custom

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0e17",
          secondary: "#111827",
          elevated: "#1a2332",
        },
        accent: {
          "growth-bg": "#00ff88",
          growth: "#00ffaa",
          "alert-bg": "#ff6b35",
          alert: "#ffaa77",
          "neutral-bg": "#3b82f6",
          neutral: "#5b9dff",
        },
        text: {
          primary: "#f3f4f6",
          secondary: "#9ca3af",
          muted: "#6b7280",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        "glow-growth": "0 0 20px rgba(0, 255, 170, 0.3)",
        "glow-alert": "0 0 20px rgba(255, 170, 119, 0.3)",
      },
    },
  },
  plugins: [],
};
```

#### Ejemplo de Uso

```vue
<template>
  <button
    class="
      bg-accent-growth-bg 
      text-bg-primary 
      font-mono 
      px-6 py-3 
      rounded-lg 
      hover:shadow-glow-growth 
      transition-all
      min-h-[44px]
    "
  >
    Calcular Portafolio
  </button>
</template>
```

#### Alternativas Consideradas

| Tecnología  | Por qué NO                               |
| ----------- | ---------------------------------------- |
| Bootstrap   | Demasiado "genérico", difícil customizar |
| Material UI | No hay versión Vue oficial buena         |
| Vanilla CSS | Más lento, más código                    |
| UnoCSS      | Menos maduro, documentación menor        |

---

### Icons: Lucide Vue

**Versión:** 0.468+

#### ¿Por qué Lucide?

✅ **Moderno y limpio** - Diseño consistente  
✅ **Tree-shakeable** - Solo importas los que usas  
✅ **Vue component-based** - `<ChevronRight />`  
✅ **Open source** - Gratis, sin atribución

#### Ejemplo de Uso

```vue
<script setup>
import { TrendingUp, AlertCircle, Info } from "lucide-vue-next";
</script>

<template>
  <div class="flex items-center gap-2">
    <TrendingUp class="text-accent-growth" :size="20" />
    <span>+5.2%</span>
  </div>
</template>
```

#### Alternativas Consideradas

| Librería       | Por qué NO                          |
| -------------- | ----------------------------------- |
| Heroicons      | Menos iconos disponibles            |
| Font Awesome   | Bundle pesado, estilo menos moderno |
| Material Icons | Muy "Google", no fit con estética   |
| Emojis         | Poco profesional                    |

---

### Typography: Google Fonts

#### Fonts Seleccionadas

1. **Outfit** (Headings)
   - Weights: 600, 700, 800
   - Uso: Títulos, CTAs, elementos impactantes
   - Por qué: Geométrica, moderna, limpia

2. **JetBrains Mono** (Datos/Código)
   - Weights: 400, 500, 700
   - Uso: Números, precios, badges, código
   - Por qué: Monospace premium, legible

3. **DM Sans** (Body)
   - Weights: 400, 500, 600
   - Uso: Párrafos, descripciones, UI text
   - Por qué: Legible, profesional, friendly

#### Carga

```css
/* src/assets/main.css */
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap");
```

---

## 📊 Data & Visualization

### Charts: ApexCharts

**Versión:** 3.54+ (core)  
**Wrapper:** vue3-apexcharts 1.6+

#### ¿Por qué ApexCharts?

✅ **Balance perfecto** - Fácil de usar, muy customizable  
✅ **Dark mode nativo** - Perfecto para nuestra estética  
✅ **Animaciones smooth** - Reveal, transitions, tooltips  
✅ **Responsive** - Se adapta a mobile  
✅ **Wrapper oficial Vue** - `vue3-apexcharts`

#### Ejemplo de Uso

```vue
<script setup>
import { ref } from "vue";
import VueApexCharts from "vue3-apexcharts";

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
    categories: ["Mes 1", "Mes 6", "Mes 12", "Mes 24"],
  },
});

const series = ref([
  {
    name: "Inversión",
    data: [700, 1500, 2400, 4200],
  },
  {
    name: "Cuenta Corriente",
    data: [700, 1900, 3100, 5500],
  },
]);
</script>

<template>
  <VueApexCharts
    type="line"
    :options="chartOptions"
    :series="series"
    height="300"
  />
</template>
```

#### Alternativas Consideradas

| Librería | Por qué NO                         |
| -------- | ---------------------------------- |
| Chart.js | Menos customización visual         |
| D3.js    | Curva de aprendizaje muy steep     |
| Recharts | Wrapper Vue menos maduro           |
| Plotly   | Overkill para nuestras necesidades |

---

### HTTP Client: Fetch API (nativo)

#### ¿Por qué Fetch?

✅ **Built-in browser** - Cero dependencies  
✅ **Suficiente para GET requests** - YAGNI  
✅ **Modern syntax** - async/await  
✅ **Standards-based** - WHATWG spec

#### Wrapper Custom

```javascript
// src/services/api.js
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

export async function fetchQuote(symbol) {
  try {
    const res = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchMultipleQuotes(symbols) {
  return Promise.all(symbols.map((symbol) => fetchQuote(symbol)));
}
```

#### Alternativas Consideradas

| Librería | Por qué NO                                          |
| -------- | --------------------------------------------------- |
| Axios    | Dependency extra para features que no necesitamos   |
| ky       | Wrapper moderno pero innecesario para casos simples |

---

## 🔌 APIs Externas

### Primary: Finnhub

**URL:** https://finnhub.io  
**Plan:** Free Tier  
**Rate Limit:** 60 requests/minuto

#### ¿Por qué Finnhub?

✅ **Free tier generoso** - 60 req/min suficiente  
✅ **ETFs bien cubiertos** - AGG, VYM, BND disponibles  
✅ **Real-time quotes** - Data actualizada  
✅ **Documentación clara** - Fácil de integrar

#### Endpoints Usados

```javascript
// Quote (precio actual)
GET /quote?symbol=AGG&token={key}

Response:
{
  "c": 102.50,   // current price
  "d": 0.15,     // change
  "dp": 0.15,    // change percent
  "h": 102.60,   // high
  "l": 102.40,   // low
  "o": 102.45,   // open
  "pc": 102.35   // previous close
}
```

---

### Secondary: Alpha Vantage

**URL:** https://www.alphavantage.co  
**Plan:** Free Tier  
**Rate Limit:** 25 requests/día

#### ¿Por qué Alpha Vantage?

✅ **Backup/complemento** - Si Finnhub falla  
✅ **Data histórica** - Rentabilidad YTD, 1Y  
✅ **Gratis** - No costo

#### Endpoints Usados

```javascript
// Global Quote
GET /query?function=GLOBAL_QUOTE&symbol=AGG&apikey={key}

Response:
{
  "Global Quote": {
    "01. symbol": "AGG",
    "05. price": "102.5000",
    "09. change": "0.1500",
    "10. change percent": "0.1500%"
  }
}
```

---

## ⚙️ Code Quality

### Linter: ESLint

**Versión:** 9.15+  
**Plugin:** eslint-plugin-vue 9.30+

#### Configuración

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
};
```

---

### Formatter: Prettier

**Versión:** 3.3+  
**Plugin:** prettier-plugin-tailwindcss 0.6+

#### Configuración

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

### Testing: Vitest

**Versión:** 2.1+  
**Utilities:** @vue/test-utils 2.4+

#### ¿Por qué Vitest?

✅ **Vite-native** - Mismo config, super rápido  
✅ **API compatible con Jest** - Fácil de aprender  
✅ **Vue Test Utils** - Testing de componentes  
✅ **Profesionalismo** - Demuestra buenas prácticas

#### Scope de Testing (MVP)

```javascript
// tests/unit/calculations.test.js
import { describe, it, expect } from "vitest";
import { calculateDCA, calculateAllocation } from "@/services/calculations";

describe("calculateDCA", () => {
  it("calcula proyección correcta con aportes mensuales", () => {
    const result = calculateDCA({
      inicial: 1000,
      mensual: 200,
      meses: 12,
      rentabilidadAnual: 0.05,
    });

    expect(result.valorFinal).toBeCloseTo(3635, 0);
    expect(result.totalAportado).toBe(3400);
    expect(result.ganancia).toBeCloseTo(235, 0);
  });
});
```

**Qué testear:**

- ✅ Lógica de cálculos (`calculations.js`)
- ✅ Formatters (`format.js`)
- ✅ API wrappers (con mocks)
- ❌ NO componentes (YAGNI para MVP)
- ❌ NO E2E (YAGNI para MVP)

---

## 🚀 Deployment

### Hosting: Vercel

**Plan:** Free (Hobby)

#### ¿Por qué Vercel?

✅ **Optimizado para Vite/Vue** - Zero config  
✅ **Deploy automático** - Push a GitHub → live  
✅ **HTTPS + CDN** - Gratis  
✅ **Environment variables** - Fácil configurar keys  
✅ **Preview deployments** - Cada PR tiene preview

#### Configuración

```json
// vercel.json (opcional, usa defaults)
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

#### Workflow

```
1. Push a GitHub (branch main)
2. Vercel auto-detecta cambio
3. Build automático
4. Deploy a producción
5. URL: https://tesoreria-simple.vercel.app
```

#### Alternativas Consideradas

| Plataforma   | Por qué NO                        |
| ------------ | --------------------------------- |
| Netlify      | Similar pero menos Vue-optimizado |
| GitHub Pages | Solo estático, no env vars fácil  |
| Railway      | Más enfocado en backend           |

---

## 🛠️ Development Environment

### IDE: Antigravity (Google)

**¿Por qué Antigravity?**

✅ **IDE agentic con IA** - Gemini 3 Flash integrado  
✅ **Gestión de agentes** - Automatizar tareas repetitivas  
✅ **Sincronización total** - Editor + terminal + navegador  
✅ **Rockwell ya lo tiene** - No curva de aprendizaje

**Fallback:** VS Code (si Antigravity tiene problemas)

#### Extensiones Recomendadas (VS Code)

Si si utiliza VS Code como backup:

- Volar (Vue Language Features)
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- GitLens

---

### Node & Package Manager

**Node:** 20.x LTS  
**Package Manager:** npm (default)

#### ¿Por qué npm?

✅ **Viene con Node** - No install extra  
✅ **Maduro y estable** - Menos sorpresas  
✅ **Lockfile standard** - `package-lock.json`

**Alternativas:** pnpm (más rápido) o yarn (si prefieres)

---

## 🚫 Decisiones NO Tomadas (YAGNI)

### TypeScript

**Por qué NO:** JavaScript puro suficiente para MVP. TS puede agregarse después si escala.

### Axios

**Por qué NO:** Fetch API suficiente para GET requests simples.

### GSAP / Framer Motion

**Por qué NO:** CSS transitions + Vue transitions suficientes.

### Storybook

**Por qué NO:** Proyecto de 1 persona, no necesita catálogo aislado de componentes.

### Cypress / Playwright

**Por qué NO:** Unit tests suficientes para MVP. E2E es overkill.

### PWA / Service Workers

**Por qué NO:** No necesitamos offline-first en MVP.

### Server-Side Rendering (Nuxt)

**Por qué NO:** SPA puro suficiente. No necesitamos SEO.

### GraphQL

**Por qué NO:** REST APIs simples suficientes.

### Monorepo (Nx, Turborepo)

**Por qué NO:** Un solo proyecto, no multi-repo.

---

## 📊 Stack Diagram

```
┌─────────────────────────────────────────────────┐
│           USER INTERFACE (Browser)              │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │   Vue 3 Components (SFC)                │   │
│  │   - HomeView.vue                        │   │
│  │   - DashboardView.vue                   │   │
│  │   - SimulatorView.vue                   │   │
│  └─────────────────────────────────────────┘   │
│           ↓                    ↓                │
│  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Vue Router      │  │  Tailwind CSS    │    │
│  │  (Navigation)    │  │  (Styling)       │    │
│  └──────────────────┘  └──────────────────┘    │
│           ↓                                     │
│  ┌─────────────────────────────────────────┐   │
│  │   Pinia Stores (State)                  │   │
│  │   - userInputs                          │   │
│  │   - portfolio                           │   │
│  │   - marketData                          │   │
│  └─────────────────────────────────────────┘   │
│           ↓                                     │
│  ┌─────────────────────────────────────────┐   │
│  │   Services Layer                        │   │
│  │   - api.js (Fetch wrapper)              │   │
│  │   - calculations.js (Business logic)    │   │
│  └─────────────────────────────────────────┘   │
│           ↓                                     │
└─────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────┐
│        EXTERNAL APIs (REST)                     │
│                                                 │
│  ┌──────────────┐        ┌──────────────┐      │
│  │  Finnhub     │        │ Alpha Vantage│      │
│  │  (Primary)   │        │  (Secondary) │      │
│  └──────────────┘        └──────────────┘      │
└─────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────┐
│           DEPLOYMENT (Vercel)                   │
│   - Auto build on push                          │
│   - HTTPS + CDN                                 │
│   - Environment variables                       │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Build & Deploy Pipeline

```
Developer (Rockwell)
    ↓
  Antigravity IDE
    ↓
  Git commit
    ↓
  Push to GitHub (main branch)
    ↓
  GitHub triggers Vercel webhook
    ↓
  Vercel CI/CD:
    1. npm install
    2. npm run build (Vite)
    3. Deploy to CDN
    ↓
  Live at https://tesoreria-simple.vercel.app
    ↓
  Users access app
```

---

## 📝 Resumen de Decisiones

| Categoría | Tecnología  | Confianza | Rationale Key              |
| --------- | ----------- | --------- | -------------------------- |
| Framework | Vue 3       | 100%      | Mandatorio curso           |
| Build     | Vite        | 100%      | Default Vue, rápido        |
| State     | Pinia       | 95%       | Oficial Vue 3              |
| Router    | Vue Router  | 95%       | URLs profesionales         |
| CSS       | Tailwind    | 90%       | Velocidad + custom         |
| Charts    | ApexCharts  | 85%       | Balance facilidad/estética |
| HTTP      | Fetch API   | 90%       | YAGNI, suficiente          |
| Testing   | Vitest      | 80%       | Profesionalismo            |
| Deploy    | Vercel      | 95%       | Zero-config, gratis        |
| IDE       | Antigravity | 75%       | IA + validar compat        |

---

## 🚀 Next Steps

1. ✅ **Stack definido y documentado**
2. ⏳ **Validar Antigravity + Vue** (Rockwell crea proyecto test)
3. ⏳ **Probar APIs** (Finnhub/Alpha Vantage con ETFs reales)
4. ⏳ **Setup inicial** (crear proyecto, instalar deps)
5. ⏳ **Primer componente** (BaseButton para validar workflow)

---

_Stack optimizado para velocidad de desarrollo, escalabilidad futura, y aprendizaje de Rockwell._
