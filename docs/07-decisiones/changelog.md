# Changelog

Registro cronológico de cambios relevantes del proyecto.

---

## [Unreleased]

### Agregado
- **feat:** `BaseTooltip.vue` — atom de educación financiera integrada
  — hover/focus sobre ícono `?` muestra explicación contextual sin jerga
- **feat:** `FormField` acepta prop `tooltip` — ícono `?` junto al label
  — accesible: activable por teclado (focus) y mouse (hover), WCAG AA
- **feat:** `DiagnosticoForm` con tooltips educativos en los 4 campos
  — excedente, reserva, aporte mensual, horizonte explicados en lenguaje simple
- **feat:** `finnhubService.ts` — precios en tiempo real (AGG, VTI)
  — fallback silencioso si no hay API key, la app sigue con tasas curadas
- **feat:** `alphaVantageService.ts` — histórico y fundamentales de ETFs
  — cache en memoria: 7 días para series históricas, 30 días para fundamentales
  — manejo específico de errores AV (rate limit 25 req/día, símbolo inválido)
- **feat:** `marketData` store — orquesta Finnhub + Alpha Vantage
  — `fetchQuotes()` (Finnhub, automático), `fetchHistorical()` y `fetchFundamentals()` (AV, bajo demanda)
- **feat:** `CLAUDE.md` en raíz del repo — contexto y espíritu del proyecto persistente entre sesiones
- **types:** `AVDailyPoint`, `AVFundamentals` en `types/index.ts`

### Seguridad
- **fix:** `authStore.logout()` → `authStore.signOut()` en `DashboardView` y `SimulatorView`
  — el método no existía en el store, el logout no funcionaba
- **fix:** Manejo de errores en `LoginView` migrado de `e.message.includes()` a `e.code`
  — más robusto ante cambios de SDK; cubre `invalid-credential` (Firebase v9+),
  `too-many-requests` y `network-request-failed`
- **feat:** Firestore Security Rules completas (`firestore.rules`)
  — validación de estructura de datos por campo, aislamiento por UID,
  simulaciones inmutables, catch-all denegado
- **fix:** Router guard con timeout de 5s via `Promise.race`
  — evita cuelgue indefinido si Firebase no responde

### Infraestructura
- **chore:** `firebase.json` para despliegue de reglas con Firebase CLI
- **chore:** `firestore.indexes.json` con índice para `simulations` ordenadas por `createdAt`

---

## [0.3.0] — 2026-02-16

### Agregado
- Botón de logout en `DashboardView` y `SimulatorView`
- Guardar simulación en Firestore con feedback visual (idle / success / error)
- `vercel.json` para soporte de rutas SPA en Vercel

---

## [0.2.0] — 2026-02-10

### Agregado
- Integración Firebase Auth: Google OAuth + Email/Password
- Persistencia en Firestore: perfil, portafolio y simulaciones por usuario
- Router guards: rutas protegidas y redirección a login
- Stores Pinia: `auth`, `userInputs`, `portfolio`

---

## [0.1.0] — 2026-02-01

### Agregado
- SPA inicial sin backend — cálculos DCA en frontend
- Flujo: DiagnosticoForm → DashboardView → SimulatorView
- Componentes Atomic Design: atoms, molecules, organisms
- Tema dark con Tailwind CSS y ApexCharts
