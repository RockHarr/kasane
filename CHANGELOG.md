# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-02-25

### ✨ Agregado

#### Configuración Inicial del Proyecto
- **Migración a Tailwind CSS v4**
  - Instalado `@tailwindcss/postcss` como plugin separado (requerido en v4)
  - Actualizado `postcss.config.js` con sintaxis v4
  - Migrado `src/style.css` de `@tailwind` a `@import "tailwindcss"`
  - Agregado `@config` para referencia al config legacy

- **Tailwind Config Completo**
  - Sistema de colores custom: `bg.*`, `accent.*`, `text.*`
  - Font families semánticas: `heading`, `body`, `mono`
  - Box shadows: `glow-growth`, `glow-alert`, `glow-neutral`
  - Plugin custom para `.sr-only` (accesibilidad)

- **Alias de Rutas Vite**
  - Configurado `@` → `src/` en `vite.config.js`
  - Importaciones absolutas funcionando en toda la app

- **Build Optimizations**
  - Manual chunks para ApexCharts en `vite.config.js`
  - Reducción del bundle size con code splitting

#### Firebase + Autenticación
- **Firebase Setup Completo**
  - `src/services/firebase.ts` — inicialización con env vars
  - `src/services/auth.ts` — Google OAuth + Email/Password
  - `src/services/firestore.ts` — CRUD para profile, portfolio, onboarding, simulations

- **Auth Store (Pinia)**
  - Observer de `onAuthStateChanged` con `init()` en main.js
  - Carga automática de datos de Firestore al login
  - `signInWithGoogle()`, `signInWithEmail()`, `register()`, `signOut()`
  - Loading states para evitar race conditions con router guards

- **Router Guards**
  - Protección de rutas autenticadas (`meta.requiresAuth`)
  - Redirect a `/login` si no autenticado
  - Timeout de 5s para evitar cuelgue si Firebase no responde
  - Espera a `authStore.loading = false` antes de navegar

#### Stores de Pinia (6/6)
- ✅ `auth` — autenticación + carga inicial de datos
- ✅ `userInputs` — perfil financiero (excedente, reserva, aporte, horizonte)
- ✅ `portfolio` — asignación (bonds/dividends/stocks) + instrumentos
- ✅ `onboarding` — perfil de identidad (freelancer/emprendedor, meta, país)
- ✅ `marketData` — precios de APIs (Finnhub/Alpha Vantage)
- ✅ `simulations` — historial de simulaciones guardadas

#### Vistas (7/7)
- **LoginView** — Auth con Google OAuth + Email/Password, manejo robusto de errores
- **OnboardingView** — Wizard de 3 pasos (identidad, meta, país) con validación
- **HomeView** — DiagnosticoForm + redirect a onboarding si no completado
- **DashboardView** — Resumen financiero + barra de progreso hacia meta + PortfolioSuggestion
- **SimulatorView** — Proyecciones DCA + gráfica de crecimiento + InstrumentMixer
- **SimulationsView** — Historial de simulaciones guardadas con SimulationCard
- **NotFoundView** — Página 404

#### Componentes Atomic Design
**Atoms (6):**
- `BaseButton` — variants: primary, secondary, alert
- `BaseInput` — con prefix, suffix, error states
- `BaseCard` — variants: default, elevated, bordered
- `BaseBadge` — variants: growth, alert, neutral
- `BaseLoader` — spinner con label opcional
- `BaseTooltip` — tooltips educativos (Progressive Disclosure)

**Molecules (4):**
- `MetricDisplay` — label + valor + trend indicator
- `FormField` — orquesta BaseInput + label + hint + tooltip
- `InstrumentCard` — card de ETF con precio y cambio
- `PercentageChange` — badge con % positivo/negativo

**Organisms (6):**
- `DiagnosticoForm` — formulario de 4 campos con validación
- `PortfolioSuggestion` — allocation sliders + instrumentos sugeridos
- `OCASimulator` — métricas DCA + distribución de portafolio
- `ComparisonChart` — gráfica ApexCharts multi-serie
- `InstrumentMixer` — sliders comparativos de instrumentos
- `SimulationCard` — card de historial con delete

#### Cálculos Financieros
- **DCA (Dollar Cost Averaging)**
  - Simulación mes a mes con interés compuesto
  - Fórmula: `valorTotal × (1 + tasaMensual) + aporteMensual`
  - Snapshots por mes para gráfica

- **Tasas Estimadas**
  - Bonds: 4.5% anual
  - Dividends: 7% anual
  - Stocks: 10% anual
  - Tasa ponderada por allocation

- **Progreso hacia Meta**
  - Conversión de monedas (CLP/USD/UF)
  - Cálculo de meses restantes al ritmo actual
  - Detección de "en ritmo" vs "fuera de ritmo"
  - Sugerencia de aporte necesario si no alcanza

#### Testing
- **32 tests en Vitest** (100% passing)
  - `calculations.test.ts` (26 tests) — lógica DCA y asignación
  - `simulations.test.ts` (6 tests) — store con mocks de Firestore

#### Firestore Security Rules
- Validación de estructura de datos (profile, portfolio, onboarding, simulations)
- Regla de owner-only: solo el usuario autenticado puede acceder a sus datos
- Validación de rangos (excedente > 0, allocation suma 100%, etc.)
- Simulaciones inmutables (solo create + delete)

### 🐛 Corregido

#### Tailwind v4 Compatibility
- **13 componentes Vue** actualizados con `@reference "tailwindcss"` + `@config` en `<style scoped>`
- Agregados tokens faltantes en `tailwind.config.js`:
  - `bg.elevated`, `text.muted`
  - `accent.growth`, `accent.alert`, `accent.neutral` (con `-bg` variants)
  - `fontFamily.heading`, `fontFamily.body`, `fontFamily.mono`
  - `boxShadow.glow-growth`, `boxShadow.glow-alert`

- **CSS Custom Properties** limpias en `src/style.css`:
  - Eliminadas variables redundantes
  - Quitados `@layer base/utilities` innecesarios en v4
  - Google Fonts import movido antes de `@import "tailwindcss"`

#### Overflow de Valores en Cards
- **MetricDisplay.vue**: texto responsive (`text-2xl sm:text-3xl lg:text-4xl`)
- **MetricDisplay.vue**: agregado `break-words` y `min-w-0` para wrapping correcto
- **OCASimulator.vue**: `min-width: 0` en grid items para evitar overflow
- **BaseCard.vue**: `overflow-hidden` para contener contenido

### 🎨 Mejorado

#### Sistema de Diseño
- **Colores directos** en tailwind.config.js (hex values) en vez de doble indirección con CSS vars
- **Organización semántica**: bg/accent/text grupos claros
- **Accesibilidad WCAG AA**: contraste 4.5:1 mínimo, focus-visible en todos los interactivos

#### UX/UI Polish
- Animaciones de transición en wizard de onboarding (slide-left/slide-right)
- Progress dots animados en onboarding
- Glow effects en cards seleccionadas
- Loading states en todos los botones de submit
- Error messages friendly con códigos Firebase traducidos
- Tooltips educativos (?) en campos del diagnóstico

### 📚 Documentación

- **CLAUDE.md** actualizado con:
  - Stack técnico completo
  - Estructura del proyecto
  - Convenciones de código
  - Scripts disponibles
  - Preferencias de Claude

- **README.md** — guía de desarrollo local con stack, scripts, estructura

- **CHANGELOG.md** — este archivo (formato Keep a Changelog)

---

## [Unreleased]

### 🔜 Próximas Features

- Integración con APIs de mercado (Finnhub/Alpha Vantage) para precios reales
- Catálogo completo de instrumentos (ETFs) en `src/data/instruments.ts`
- Deploy a producción en Vercel
- Firestore Rules deployment
- Progressive Web App (PWA) support
- Modo offline con cache de datos

### 🐛 Known Issues

- Formateo de moneda: muestra USD en vez de CLP en algunas vistas (inconsistencia)
- Ganancia estimada muestra valor incorrecto en SimulatorView (981,805 en vez de 981.80)

---

## Formato del Changelog

### Tipos de Cambios
- **Agregado** para funcionalidades nuevas
- **Cambiado** para cambios en funcionalidades existentes
- **Obsoleto** para funcionalidades que serán eliminadas
- **Eliminado** para funcionalidades eliminadas
- **Corregido** para corrección de bugs
- **Seguridad** para vulnerabilidades

### Versionado
- **MAJOR** (1.x.x) — cambios incompatibles con versiones anteriores
- **MINOR** (x.1.x) — nuevas funcionalidades compatible con versiones anteriores
- **PATCH** (x.x.1) — corrección de bugs

---

**Última actualización:** 2026-02-25
**Versión actual:** 1.0.0
