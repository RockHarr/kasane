<div align="center">

<img src="docs/02-diseno/assets/logo.svg" alt="Kasane Logo" width="80" />

# Kasane 重ねる

**Tu tranquilidad financiera, capa a capa.**

[![Vue.js](https://img.shields.io/badge/Vue.js-3-41b883?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://kasane-six.vercel.app)

[**🚀 Ver Demo en Vivo**](https://kasane-six.vercel.app)

</div>

---

## ¿Qué es Kasane?

Kasane es una aplicación web SPA (Single Page Application) de educación financiera personal. El nombre viene del japonés *重ねる* ("superponer, acumular capa a capa"), reflejando la filosofía de construir riqueza con pequeños aportes constantes en el tiempo.

La plataforma guía al usuario a través de un diagnóstico financiero personalizado, proyecta el crecimiento de su dinero con la estrategia **Dollar Cost Averaging (DCA)** y ofrece un **laboratorio de trading simulado** para aprender sin riesgo.

> ⚠️ **Aviso:** Kasane es solo educativa. Nada de lo que muestra constituye asesoramiento financiero profesional.

---

## Funcionalidades principales

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Autenticación** | Google OAuth y email/contraseña vía Firebase Auth |
| 📋 **Diagnóstico financiero** | Onboarding con excedente, meta de ahorro, horizonte y perfil de riesgo |
| 📊 **Dashboard Portafolio** | Resumen de situación financiera + sugerencia de instrumentos |
| 📈 **Simulador DCA** | Proyección interactiva con gráfico de 2 líneas (ahorro vs. inversión) |
| 🌐 **Mercado Global** | Feed híbrido de noticias (API externa + curado) con filtros por categoría |
| 🧪 **Trading Lab** | Compra/venta simulada de acciones con precios animados, RSI, SMA y semáforo |
| 🕰️ **Historial** | Simulaciones guardadas en Firestore y consultables en cualquier dispositivo |
| 🔔 **Tips de carga** | Pantallas de espera educativas estilo videojuego con barra de progreso |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Framework** | Vue 3 + Composition API + `<script setup>` |
| **Lenguaje** | TypeScript 5 |
| **Build tool** | Vite 6 |
| **Estado global** | Pinia |
| **Routing** | Vue Router 4 |
| **Estilos** | Tailwind CSS v4 con diseño *glassmorphism* |
| **Backend** | Firebase Firestore (base de datos) + Firebase Auth |
| **Íconos** | Lucide Vue Next |
| **Gráficos** | ApexCharts (via vue3-apexcharts) |
| **Deploy** | Vercel (CI/CD automático desde `main`) |
| **Testing** | Vitest |

---

## Uso de `localStorage` y `sessionStorage`

Este proyecto demuestra explícitamente el uso de ambos mecanismos de almacenamiento del navegador para distintos propósitos:

### `localStorage` — Persistencia entre sesiones
| Clave | Descripción |
|-------|-------------|
| `kasane_educa_dismissed` | Si el usuario ya vio y descartó el modal educativo del Simulador |
| `kasane_hide_read_news` | Prefencia del usuario de ocultar noticias ya leídas |
| `kasane_watchlist` | Lista de acciones en seguimiento en el Trading Lab |
| `kasane_last_selected` | Última acción seleccionada en el Trading Lab |

### `sessionStorage` — Duración de pestaña activa
| Clave | Descripción |
|-------|-------------|
| `kasane_read_history` | IDs de noticias leídas en la sesión actual (se limpia al cerrar) |
| `kasane_prices_<SYMBOL>` | Caché de precios mock de acciones durante la sesión |

El módulo de noticias también expone controles de UI para que el usuario gestione su historial de lectura, dejando claro la diferencia entre persistencia temporal y permanente.

---

## Arquitectura del proyecto

```
src/
├── assets/            # Fuentes, imágenes globales
├── components/
│   ├── atoms/         # BaseButton, BaseBadge, BaseCard, KasaneLogo…
│   ├── molecules/     # StockCard, FormField, MetricDisplay…
│   └── organisms/     # DashboardSkeleton, TradingPortfolioWidget, MarketNews…
├── composables/       # useMockPrices, useTradingStorage, useStorageHistory, useToast
├── data/              # acciones.ts, instruments.ts, divisas.ts, news.ts
├── router/            # Rutas + guards de autenticación y onboarding
├── services/          # calculations.ts, indicators.ts, firestore.ts, newsService.ts
├── stores/            # auth, userInputs, portfolio, trading, simulations (Pinia)
├── types/             # index.ts — tipos globales TypeScript
└── views/             # LandingView, LoginView, OnboardingView, DashboardView,
                       # SimulatorView, TradingView, PrivacyView…
```

---

## Instalación y uso local

### Requisitos
- Node.js >= 20
- Un proyecto Firebase con Firestore y Authentication habilitados

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/RockHarr/kasane.git
cd kasane

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Llenar .env.local con tus credenciales de Firebase

# 4. Levantar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de producción
npm run preview  # Preview del build
npm run test     # Ejecutar tests con Vitest
```

---

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Opcional: APIs de mercado para datos en tiempo real
VITE_FINNHUB_API_KEY=...
VITE_GNEWS_API_KEY=...
```

> El archivo `.env.local` está en `.gitignore` y **nunca** se sube a GitHub.

---

## Autora / Equipo

Desarrollado como proyecto educativo de Frontend por **Rockwell** (@RockHarr).

---

## Licencia

Este proyecto es de carácter educativo. Si lo usas o lo tomas como referencia, un ⭐ en el repo es siempre bienvenido 😊.
