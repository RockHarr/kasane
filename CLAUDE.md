# Configuración del Proyecto - Kasane

Guía de desarrollo y preferencias para trabajar en este proyecto.

## 📋 Descripción General

**Proyecto:** Kasane — Tu tranquilidad financiera, capa a capa.
**Tipo:** Aplicación web SPA para gestión financiera personal
**Stack:** Vue 3 + Vite + Pinia + Tailwind CSS + ApexCharts + Firebase
**Versión:** 1.0 MVP
**Estado:** En desarrollo activo
**Scope:** Proyecto de curso (v2.0 post-curso con MCP+IA)

## 🎯 Espíritu del Proyecto

**Kasane** viene del japonés *Kasaneru* (重ねる): apilar con intención. No es amontonar — es construir con método.

### El problema real que resuelve
No "¿en qué invierto?" sino **"¿cuándo puedo dar el siguiente paso?"**
- ¿Puedo dejar de aceptar clientes que me agotan?
- ¿Tengo colchón para contratar a alguien?
- ¿Cuándo puedo renunciar al proyecto que me paga pero me quita el alma?

### Usuario objetivo
- **Perfil:** Freelancer → Emprendedor (un viaje, no dos usuarios)
- **Primario:** Profesional chileno independiente (Rockwell Harrison, RockCode SpA)
- **Expansión futura:** LATAM (cada país con sus propios indicadores)
- Tech-savvy, sin formación financiera formal, busca tranquilidad no adrenalina

### Personalización Geográfica ⚠️
- **Chile:** UF, UTM, CLP, tasas Banco Central de Chile
- **Global/Cripto:** USD, EUR, BTC, ETH
- Un argentino no entiende la UF chilena → personalización por país es clave para escalar LATAM

### Filosofía de producto
- No es "calculadora bonita" — es un compañero que dice "cuándo estás listo para el siguiente nivel"
- Crecimiento que se acumula, no que fluctúa (capas sólidas, no líneas rojas/verdes)
- Loops de engagement: Real vs Simulado, escenarios "¿Qué pasa si...?", progreso mensual
- YAGNI: solo lo necesario ahora, sin sobreingeniería

## 🗂️ Estructura del Proyecto

```
src/
├── components/        # Atomic Design: atoms/, molecules/, organisms/
├── views/             # HomeView, LoginView, DashboardView, SimulatorView
├── stores/            # Pinia: auth, userInputs, portfolio
├── services/          # API clients, calculations, utils
├── router/            # Vue Router con guards
└── assets/            # Estilos y fonts

docs/                  # Documentación completa
firestore.rules        # Firestore Security Rules
```

## 🛠️ Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework** | Vue 3 (Composition API) | 3.5+ |
| **Build** | Vite | 6.0+ |
| **State** | Pinia | 2.2+ |
| **Routing** | Vue Router | 4.0+ |
| **Styling** | Tailwind CSS | 3.4+ |
| **Icons** | Lucide Vue | 0.468+ |
| **Charts** | ApexCharts (vue3-apexcharts) | 3.54+ |
| **Auth/DB** | Firebase (Auth + Firestore) | 11+ |
| **HTTP** | Fetch API (nativa) | - |
| **Testing** | Vitest | 2.1+ |
| **Linting** | ESLint | 9.15+ |
| **Formatting** | Prettier | 3.3+ |
| **Deployment** | Vercel | - |

## 📐 Convenciones de Código

### Componentes (Atomic Design / Metodología LEGO)

- **Atoms** (`atoms/`): Prefijo `Base*` → `BaseButton.vue`, `BaseInput.vue`
- **Molecules** (`molecules/`): Descriptivo → `FormField.vue`, `MetricDisplay.vue`
- **Organisms** (`organisms/`): Nombre del feature → `DiagnosticoForm.vue`, `ComparisonChart.vue`
- **Views** (`views/`): Sufijo `*View.vue` → `HomeView.vue`, `DashboardView.vue`

### Estilo de Código

- **Indentación:** 2 espacios
- **Comillas:** Simples
- **Punto y coma:** No (semicolon: false)
- **Props:** TypeValidator con `defineProps`
- **Emits:** Declarados con `defineEmits`
- **Estilos:** Scoped
- **CSS:** Preferir Tailwind sobre CSS custom
- **Siempre:** `<script setup>` (no Options API)

### Nomenclatura

- Variables/Funciones: camelCase
- Constantes: UPPER_SNAKE_CASE
- Archivos JS: camelCase
- Archivos Vue: PascalCase

## 🎨 Sistema de Diseño

### Colores (Tailwind extendido)

```javascript
colors: {
  bg: { primary: '#0a0e17', secondary: '#111827', elevated: '#1a2332' },
  accent: {
    'growth-bg': '#00ff88',   // Para backgrounds, glow
    growth: '#00ffaa',         // Para texto (5.1:1 WCAG AA ✅)
    'alert-bg': '#ff6b35',
    alert: '#ffaa77',
    'neutral-bg': '#3b82f6',
    neutral: '#5b9dff'
  },
  text: { primary: '#f3f4f6', secondary: '#9ca3af', muted: '#6b7280' }
}
```

### Tipografía

- **Outfit** (headings): Weights 600, 700, 800
- **JetBrains Mono** (datos/números): Weights 400, 500, 700
- **DM Sans** (body): Weights 400, 500, 600

### Principios UX

- Clarity: Los números son prioridad visual
- Accesibilidad: WCAG AA (min 4.5:1 contrast, focus visible, keyboard nav)
- Responsivo: Mobile-first, 3 breakpoints
- Dark mode único (no theme switcher en MVP)

## 📦 State Management (Pinia)

1. **auth** — Usuario autenticado (Firebase Auth, Google OAuth)
2. **userInputs** — Diagnóstico (excedente, reserva, aporteMensual, horizonte)
3. **portfolio** — Asignación y selección de instrumentos

Reglas: State simple, getters para computed, actions para mutaciones, lógica pesada en `services/`

## 🔌 APIs Externas

- **Finnhub** (primaria): Real-time quotes de ETFs
- **Alpha Vantage** (secundaria): Datos históricos y backup
- **Firebase** (auth + persistencia): Google OAuth + Firestore por usuario

Variables de entorno: `.env.local` (gitignored)

## 🔐 Autenticación

- Google OAuth via Firebase Auth
- `authStore.signOut()` (no `.logout()`)
- Router guard con timeout 5s via `Promise.race`
- Rutas protegidas: DashboardView, SimulatorView

## 🧪 Testing

- **Framework:** Vitest
- **Scope MVP:** Funciones puras en `services/` (calculations.js, format.js)
- **NO testear:** Componentes, E2E (YAGNI para MVP)
- Ejecutar: `npm run test`

## 🔄 Estrategia TypeScript: Hybrid Migration

- Código existente: JavaScript (no migrar forzadamente)
- Código nuevo: TypeScript cuando aplique
- Componentes nuevos: `<script setup lang="ts">`

## 🚀 Scripts

```bash
npm run dev        # Dev server (port 3000)
npm run build      # Build producción
npm run preview    # Vista previa del build
npm run lint       # ESLint
npm run format     # Prettier
npm run test       # Vitest
```

## 📝 Preferencias de Claude

### Comunicación
- **Idioma:** Español
- **Estilo:** Conciso, directo, técnico
- **Referencias:** Incluir rutas con número de línea (file.vue:42)

### Flujo de Trabajo
- ✅ TodoWrite para tareas multi-paso
- ✅ Leer archivos antes de proponer cambios
- ✅ Preferir editar sobre crear nuevos archivos
- ✅ YAGNI: no sobreingeniería
- ⚠️ Confirmar antes de git destructivo

### Herramientas
- Usar Read, Edit, Glob, Grep sobre Bash
- Preferir npm

## ⚠️ Notas Importantes

1. `authStore.signOut()` — no `.logout()` (no existe)
2. Manejo de errores en LoginView por `e.code`, no `e.message`
3. `<script setup>` siempre (no Options API)
4. Accesibilidad WCAG AA en todo componente nuevo
5. Docs internos pueden decir "Tesorería Simple" (rebranding en progreso, baja prioridad)

---

**Última actualización:** 2026-02-23
Ver documentación completa en `/docs`
