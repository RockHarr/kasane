# Tesorería Simple

> Gestión inteligente de inversiones. Sin complicaciones.

Aplicación web SPA que analiza tu situación financiera y te sugiere una estrategia de inversión personalizada con simulación de Dollar Cost Averaging (DCA).

**Live:** [kasane-six.vercel.app](https://kasane-six.vercel.app)

---

## ¿Qué hace?

1. **Diagnóstico financiero** — ingresas tu excedente, fondo de reserva, aporte mensual y horizonte de inversión
2. **Portafolio sugerido** — el algoritmo distribuye tu capital en Bonos / Dividendos / Acciones según tu perfil de riesgo
3. **Simulación DCA** — proyecta el crecimiento mes a mes con interés compuesto y gráfica interactiva
4. **Historial** — guarda tus simulaciones en la nube para consultarlas después

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Vue 3 + Composition API + TypeScript |
| Build | Vite |
| State | Pinia |
| Routing | Vue Router |
| Styling | Tailwind CSS v4 |
| Charts | ApexCharts |
| Auth | Firebase Authentication (Google) |
| Database | Cloud Firestore |
| Deploy | Vercel |

## Desarrollo local

```bash
# Clonar
git clone https://github.com/RockHarr/kasane.git
cd kasane

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase

# Iniciar servidor de desarrollo
npm run dev
```

## Scripts

```bash
npm run dev      # Dev server en localhost:5173
npm run build    # Build de producción
npm run test     # Tests con Vitest
npm run lint     # ESLint
npm run format   # Prettier
```

## Variables de entorno

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Estructura

```
src/
├── components/
│   ├── atoms/       # BaseButton, BaseInput, BaseCard, BaseBadge, BaseLoader
│   ├── molecules/   # MetricDisplay, FormField, InstrumentCard, PercentageChange
│   └── organisms/   # DiagnosticoForm, PortfolioSuggestion, OCASimulator, ComparisonChart
├── views/           # LoginView, HomeView, DashboardView, SimulatorView
├── stores/          # auth, userInputs, portfolio
├── services/        # firebase, auth, firestore, calculations
├── types/           # index.ts — tipos TypeScript del dominio
└── router/          # index.ts — rutas + guardias de auth
```

## Tests

17 tests sobre las funciones de cálculo financiero (`calculations.ts`):
- `calcularDCA` — proyección con interés compuesto mensual
- `calcularTasaPortafolio` — tasa ponderada según asignación
- `simularPortafolio` — simulación completa con snapshots mensuales
- `sugerirAsignacion` — distribución según horizonte de inversión

```bash
npm run test
```

---

Desarrollado con Vue 3 + Firebase + Tailwind CSS v4
