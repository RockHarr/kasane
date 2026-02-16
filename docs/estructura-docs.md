docs/
├── README.md # Índice principal de documentación
│
├── 01-producto/
│ ├── vision.md # Problem statement, solución, diferenciador
│ ├── user-personas.md # Rockwell + otros perfiles
│ ├── user-journey.md # Flujo completo del usuario
│ ├── features.md # Lista detallada de features (MVP + futuras)
│ └── roadmap.md # Timeline de desarrollo
│
├── 02-diseno/
│ ├── sistema-de-diseno.html # Artifact (Sistema de Diseño completo)
│ ├── wireframes/
│ │ ├── home.png # Screenshot/mockup de Home
│ │ ├── dashboard.png # Screenshot/mockup de Dashboard
│ │ ├── simulator.png # Screenshot/mockup de Simulator
│ │ └── wireframes.fig # Archivo Figma
│ ├── accesibilidad.md # Checklist WCAG 2.1 AA
│ └── assets/
│ ├── logo.svg # Logo de la app
│ └── color-palette.png # Visual de paleta de colores
│
├── 03-arquitectura/
│ ├── stack-tecnico.md # Tech stack completo + rationale
│ ├── estructura-proyecto.md # Árbol de carpetas explicado
│ ├── componentes-lego.md # Metodología LEGO + dependencias
│ ├── stores.md # Pinia stores (userInputs, portfolio, marketData)
│ ├── servicios.md # API services + calculations
│ └── diagramas/
│ ├── flujo-completo.mmd # Mermaid: flujo end-to-end
│ ├── flujo-diagnostico.mmd # Mermaid: feature 1
│ ├── flujo-portafolio.mmd # Mermaid: feature 2
│ ├── flujo-simulador.mmd # Mermaid: feature 3
│ ├── arquitectura-datos.mmd # Mermaid: Pinia + APIs
│ ├── navegacion.mmd # Mermaid: sitemap
│ └── componentes-lego.mmd # Mermaid: dependencias
│
├── 04-apis/
│ ├── finnhub.md # Endpoints, rate limits, ejemplos
│ ├── alpha-vantage.md # Endpoints, rate limits, ejemplos
│ ├── integracion.md # Cómo se usan en la app
│ └── ejemplos-response.json # Responses reales de APIs
│
├── 05-componentes/
│ ├── README.md # Índice de componentes
│ ├── atoms/
│ │ ├── BaseButton.md # SPEC completa
│ │ ├── BaseInput.md
│ │ ├── BaseCard.md
│ │ ├── BaseTooltip.md
│ │ ├── BaseBadge.md
│ │ └── BaseLoader.md
│ ├── molecules/
│ │ ├── FormField.md
│ │ ├── InstrumentCard.md
│ │ ├── MetricDisplay.md
│ │ └── PercentageChange.md
│ └── organisms/
│ ├── DiagnosticoForm.md
│ ├── PortfolioSuggestion.md
│ ├── ComparisonChart.md
│ ├── DCASimulator.md
│ └── RoadmapSection.md
│
├── 06-guias/
│ ├── setup-inicial.md # Cómo instalar y correr el proyecto
│ ├── desarrollo.md # Workflow de desarrollo
│ ├── testing.md # Cómo correr tests
│ ├── deployment.md # Deploy a Vercel
│ ├── tailwind-cheatsheet.md # Clases más usadas en el proyecto
│ └── troubleshooting.md # Problemas comunes + soluciones
│
├── 07-decisiones/
│ ├── research-notes.md # Research notes (hipótesis + confianza)
│ ├── adr/ # Architecture Decision Records
│ │ ├── 001-vue-vs-react.md
│ │ ├── 002-tailwind-vs-css.md
│ │ ├── 003-apexcharts-vs-chartjs.md
│ │ ├── 004-mcp-para-v2.md
│ │ └── 005-accesibilidad-wcag.md
│ └── changelog.md # Cambios por versión
│
└── 08-presentacion/
├── pitch.md # Elevator pitch (para presentar)
├── demo-script.md # Script para demo en vivo
├── screenshots/ # Capturas de la app funcionando
│ ├── home-desktop.png
│ ├── home-mobile.png
│ ├── dashboard.png
│ └── simulator.png
└── video-demo.md # Link a video demo
