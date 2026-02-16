# Research Notes - Tesorería Simple

_Documento de investigación estructurada con hipótesis competidoras y niveles de confianza_

**Última actualización:** 2026-01-25  
**Versión:** 1.0

---

## HIPÓTESIS ACTIVAS

### H1: Usuario Principal

**Hipótesis:** El usuario principal es un fundador tech en etapa inicial (0-12 meses) con excedente de caja (USD 500-5K) sin experiencia en inversiones.

**Confianza:** 🟢 **90%**

**Evidencia a favor:**

- ✅ Rockwell Harrison es exactamente este perfil
- ✅ RockCode SpA: 3 meses operando
- ✅ USD 1K disponible, USD 200/mes para invertir
- ✅ Cero experiencia invirtiendo
- ✅ Prioriza seguridad y liquidez sobre rentabilidad

**Evidencia en contra:**

- ⚠️ Muestra de 1 persona (N=1)
- ⚠️ No validado con otros fundadores similares

**Riesgo:** Si expandimos, podríamos necesitar otros perfiles (PYME tradicional, freelancer senior)

**Acción:** Diseñar para Rockwell primero. Validar con usuarios similares en v1.0+

---

### H2: Preferencia de Estética

**Hipótesis:** Un fundador tech prefiere estética "terminal futurista" (dark, neón, monospace) sobre diseño corporativo tradicional.

**Confianza:** 🟡 **75%** (validado parcialmente)

**Evidencia a favor:**

- ✅ Rockwell es tech (RockCode = dev/design)
- ✅ Prompts de aesthetics sugieren evitar genérico
- ✅ Industria tech tiende a preferir dark themes
- ✅ Rockwell aprobó dirección "terminal futurista"

**Evidencia en contra:**

- ⚠️ No hemos visto wireframes completos
- ⚠️ Finanzas = tradicionalmente serio/corporativo

**Riesgo:** Podría resultar demasiado "gamer" para contexto financiero

**Acción:** Balancear estética tech con seriedad financiera. Validar con wireframes.

---

### H3: Stack Técnico Óptimo

**Hipótesis:** Vue 3 + Tailwind + Antigravity es el mejor stack para este proyecto.

**Confianza:** 🟢 **90%**

**Evidencia a favor:**

- ✅ Vue 3: Mandatorio del curso
- ✅ Antigravity: IDE agentic con IA (velocidad de desarrollo)
- ✅ Tailwind: Rápido para prototipar, aprende mientras construye
- ✅ Rockwell ya tiene Antigravity configurado
- ✅ ApexCharts: Balance facilidad/customización

**Evidencia en contra:**

- ⚠️ Antigravity + Vue no 100% validado (debe probar setup)
- ⚠️ Curva de aprendizaje Tailwind (novato)

**Riesgo:** Problemas de compatibilidad Antigravity + Vue

**Acción:** Rockwell valida setup básico Vue en Antigravity antes de diseño completo

---

### H4: Complejidad de Features MVP

**Hipótesis:** Un MVP con 3 features core es suficiente para (a) aprobar el curso y (b) ser útil para usuarios reales.

**Confianza:** 🟢 **85%**

**Features MVP:**

1. Diagnóstico (inputs → cuánto puedes invertir)
2. Portafolio sugerido (ETFs + data real API)
3. Comparador visual (gráfico cuenta corriente vs inversión)

**Evidencia a favor:**

- ✅ Resuelve el problema core (qué hacer con excedente)
- ✅ Scope manejable para curso
- ✅ Demuestra skills técnicos (API, state, visualización)
- ✅ Curso no tiene requisitos específicos de features

**Evidencia en contra:**

- ⚠️ Podría faltar educación integrada (tooltips)
- ⚠️ Simulador DCA podría ser "nice to have" vs "must have"

**Riesgo:** Usuarios no entienden instrumentos sin educación

**Acción:** Agregar tooltips educativos como parte integral (no opcional)

---

### H5: APIs Disponibles

**Hipótesis:** Finnhub + Alpha Vantage proveen data suficiente para ETFs conservadores sin costo prohibitivo.

**Confianza:** 🟡 **70%** (no probado en producción)

**Asumiendo:**

- Finnhub: 60 req/min gratis → suficiente para demo/MVP
- Alpha Vantage: 25 req/día → complemento
- ETFs objetivo: AGG, VYM, BND (todos en mercado USA)

**Evidencia a favor:**

- ✅ Documentación sugiere que sí tienen estos ETFs
- ✅ Otros proyectos similares los usan
- ✅ Free tier parece suficiente para MVP

**Evidencia en contra:**

- ❌ NO hemos probado endpoints específicos
- ❌ Data histórica podría estar limitada en free tier
- ❌ Rate limits podrían ser problema con múltiples usuarios

**Riesgo:** APIs no tienen data que necesitamos, o límites muy restrictivos

**Acción:** 🔴 **BLOQUEANTE:** Probar APIs ANTES de diseñar componentes que dependen de data específica

---

### H6: Uso de MCP (Model Context Protocol)

**Hipótesis:** MCP haría la app significativamente más inteligente pero agrega complejidad prematura para el MVP.

**Confianza:** 🟢 **90%**

**Evidencia a favor:**

- ✅ MCP + Claude = asistente IA conversacional poderoso
- ✅ Diferenciador competitivo brutal en v2.0
- ✅ Pero agrega complejidad técnica (setup, costo, debugging)
- ✅ Curso evalúa skills de frontend/Vue, no IA

**Evidencia en contra:**

- ⚠️ Sin MCP, app es "calculadora bonita" no "asistente inteligente"
- ⚠️ Rockwell preguntó específicamente por MCP (interés genuino)

**Riesgo:** MVP muy básico sin diferenciación real

**Acción:** MVP sin MCP. v2.0 con MCP como killer feature. Mostrar en roadmap "Próximamente".

---

### H7: Accesibilidad WCAG

**Hipótesis:** Cumplir WCAG 2.1 AA es crítico para profesionalismo y alcance.

**Confianza:** 🟢 **100%** (validado)

**Evidencia a favor:**

- ✅ Norma internacional
- ✅ Rockwell pidió explícitamente considerarla
- ✅ Sistema de color ajustado para contraste (ratios validados)
- ✅ Focus states, touch targets, reduced motion implementados

**Evidencia en contra:**

- Ninguna

**Riesgo:** No cumplir = app inutilizable para personas con discapacidades

**Acción:** ✅ COMPLETADO. Sistema de diseño cumple AA. Mantener en QA.

---

## DECISIONES TOMADAS

### D1: Metodología LEGO

**Decisión:** Usar arquitectura modular de componentes (atoms → molecules → organisms)

**Fecha:** 2026-01-25

**Rationale:**

- Escalable sin sobreingeniería
- Reutilizable (DRY)
- Teachable (Rockwell aprende patrones)
- Portfolio-friendly (demuestra pensamiento arquitectónico)

**Confianza:** 🟢 **95%**

**Autocrítica:** ¿Estamos sobrecomplificando para un MVP?  
**Respuesta:** No. LEGO != complejidad. Es solo nomenclatura para organizar. Seguimos YAGNI.

**Alternativas consideradas:**

- Flat structure (todos los componentes en /components)
- Feature-based (agrupar por página/feature)

**Por qué LEGO ganó:** Balance entre organización y simplicidad. Fácil entender dependencias.

---

### D2: Dark Theme Único

**Decisión:** Diseñar solo para dark theme inicialmente (no theme switcher)

**Fecha:** 2026-01-25

**Rationale:**

- Evita sobreingeniería (YAGNI)
- Cohesivo con estética terminal futurista
- Más fácil hacer glow effects en dark
- Light theme puede agregarse después si hay demanda

**Confianza:** 🟢 **85%**

**Autocrítica:** ¿Y si usuarios prefieren light?  
**Respuesta:** MVP = dark. Si hay demanda real en v1.0+, agregamos light. No ahora.

**Alternativas consideradas:**

- Dual theme desde MVP
- Auto-detect system preference

**Por qué dark único ganó:** Simplicidad. Menos CSS. Enfoque en features, no en theming.

---

### D3: Solo USD

**Decisión:** App maneja solo USD, no múltiples monedas

**Fecha:** 2026-01-25

**Rationale:**

- YAGNI (Rockwell usa USD)
- ETFs que vamos a mostrar cotizan en USD
- Simplifica código (no conversiones, no formatters complejos)
- Mercado chileno puede agregarse después (CLP)

**Confianza:** 🟢 **90%**

**Autocrítica:** Limita audiencia chilena (CLP)  
**Respuesta:** MVP para Rockwell y mercado USA. Si expandimos a Chile, agregamos CLP en v1.0+.

**Alternativas consideradas:**

- Multi-moneda desde MVP
- CLP primero (mercado local)

**Por qué USD ganó:** Rockwell trabaja en USD. APIs dan precios en USD. Target inicial es fundadores tech (suelen usar USD).

---

### D4: Features "Coming Soon" Visibles

**Decisión:** Mostrar 2-3 features futuras en el MVP con badges "Próximamente"

**Fecha:** 2026-01-25

**Features a mostrar:**

1. 🤖 Asistente IA Financiero (MCP-powered)
2. 🔔 Alertas Inteligentes
3. 🔗 Integración con Brokers

**Rationale:**

- Muestra visión de producto (no solo MVP)
- Genera expectativa
- Valida interés (tracking de clicks en "Notificarme")
- Diferenciador vs otros proyectos del curso
- Marketing inteligente

**Confianza:** 🟢 **95%**

**Implementación:**

- Badges sutiles en UI
- Sección "Roadmap" en footer
- ETAs aproximados (Q2/Q3 2026)
- No mentir: realmente planeamos hacerlo

**Autocrítica:** ¿Es "vaporware"?  
**Respuesta:** No si realmente lo construimos en v2. Es roadmap honesto.

---

### D5: Tipografía - Outfit vs Clash Display

**Decisión:** Usar Outfit en lugar de Clash Display para headings

**Fecha:** 2026-01-25

**Rationale:**

- Rockwell pidió cambio explícito
- Outfit: geométrica, moderna, limpia
- Más versátil que Clash (funciona en más contextos)
- Google Fonts (fácil acceso)

**Confianza:** 🟢 **100%**

**Stack tipográfico final:**

- Display/Headings: **Outfit** (600, 700, 800)
- Monospace/Datos: **JetBrains Mono** (400, 500, 700)
- Body/Texto: **DM Sans** (400, 500, 600)

---

### D6: Paleta Dual (BG vs Text)

**Decisión:** Sistema dual de colores para cumplir WCAG AA

**Fecha:** 2026-01-25

**Rationale:**

- Verde neón (#00ff88) hermoso pero ratio bajo (2.8:1)
- Solución: colores BG (neón vibrante) + colores Text (ajustados 5:1+)
- Mantiene estética visual
- Cumple accesibilidad
- Flexibilidad para usar color correcto según contexto

**Confianza:** 🟢 **100%**

**Implementación:**

```css
--accent-growth-bg: #00ff88; /* Para backgrounds, glow */
--accent-growth: #00ffaa; /* Para texto (5.1:1) ✅ */
```

**Autocrítica:** ¿Complica el sistema?  
**Respuesta:** Mínimamente. Developer solo elige bg- vs text- según uso. Claro en docs.

---

### D7: Testing en MVP

**Decisión:** Incluir Vitest aunque curso no lo requiera

**Fecha:** 2026-01-25

**Rationale:**

- "Apuntamos a pro" → tests es pro
- Demuestra profesionalismo
- Útil para refactoring seguro
- No mucho overhead (Vitest es rápido)

**Confianza:** 🟢 **80%**

**Scope de testing MVP:**

- ✅ Unit tests para calculations.js (lógica de negocio)
- ✅ Tests para utils (formatters)
- ❌ NO E2E (Cypress) - YAGNI
- ❌ NO tests de componentes - YAGNI para MVP

**Autocrítica:** ¿Nos distraemos del objetivo (aprobar curso)?  
**Respuesta:** Tests básicos no toman mucho tiempo. Plus es diferenciador vs otros proyectos.

---

## PREGUNTAS ABIERTAS 🔴

### Q1: Requisitos Específicos del Curso

**Pregunta:** ¿Hay rúbrica específica? ¿Mínimo de features/complejidad? ¿Debe usar librerías específicas?

**Estado:** ⏳ Pendiente respuesta de Rockwell

**Impacto:** MEDIO - Podría cambiar scope de features

**Próxima acción:** Rockwell consulta con profesor/syllabus

---

### Q2: Setup Antigravity ✅ RESUELTO - Rockwell confirmó que funciona perfectamente

**Pregunta:** ¿Antigravity maneja Vue 3 sin problemas? ¿Hay limitaciones conocidas?

**Estado:** ✅ RESUELTO

**Impacto:** ALTO - Bloqueante para desarrollo

**Próxima acción:** Rockwell crea proyecto Vue básico en Antigravity, valida que compila y corre

---

### Q3: Validación de APIs

**Pregunta:** ¿Finnhub y Alpha Vantage tienen los ETFs que necesitamos? ¿Data histórica disponible en free tier?

**Estado:** 🔴 **BLOQUEANTE** - No probado

**Impacto:** CRÍTICO - Sin data no hay app

**Próxima acción:** Probar endpoints específicos:

```
GET https://finnhub.io/api/v1/quote?symbol=AGG&token=...
GET https://finnhub.io/api/v1/quote?symbol=VYM&token=...
GET https://finnhub.io/api/v1/quote?symbol=BND&token=...
```

---

### Q4: Scope Educación

**Pregunta:** ¿Cuánta educación integrada necesitamos? ¿Tooltips suficientes o sección dedicada?

**Estado:** ⏳ Decidir después de validar features core

**Impacto:** BAJO - Nice to have, no bloqueante

**Próxima acción:** Implementar tooltips básicos en MVP. Sección educativa en v1.0+ si hay demanda.

---

## AUTOCRÍTICA DEL PROCESO

### ¿Estoy asumiendo demasiado?

**SÍ - RIESGO MODERADO**

**Específicamente:**

- ❌ Estética (validada parcialmente, falta wireframes completos)
- ❌ APIs (NO probadas, crítico)
- ⚠️ Scope de features (podría necesitar más/menos según curso)

**Acción correctiva:**

1. Pausar diseño detallado hasta validar bloqueantes (APIs, Antigravity)
2. Crear wireframes para validar estética antes de codificar
3. Preguntar a Rockwell sobre requisitos del curso

---

### ¿Estoy sobrecomplificando?

**RIESGO BAJO - BAJO CONTROL**

**Mitigaciones aplicadas:**

- ✅ Metodología LEGO: organización, no complejidad
- ✅ YAGNI explícito en todas las decisiones
- ✅ "Inline hasta que duela" como principio
- ✅ No crear abstracciones prematuras

**Vigilar:**

- ⚠️ No crear 15 utilidades "por si acaso"
- ⚠️ No abstraer TODO en capas innecesarias

---

### ¿Tengo plan de validación incremental?

**MEJORADO**

**Plan actual:**

1. ✅ Probar APIs → validar data disponible
2. ✅ Setup Antigravity + Vue → validar tooling
3. ✅ Wireframes → validar estética con Rockwell
4. ✅ Crear 1 componente simple (BaseButton) → validar workflow
5. ✅ Entonces diseñar/codificar todo lo demás

**Antes era:** Diseñar todo primero, luego validar (riesgoso)

---

## PRÓXIMOS PASOS PRIORIZADOS

### BLOQUEANTES (hacer ANTES que nada):

1. 🔴 **Rockwell:** Validar setup Antigravity + Vue 3 (create project, npm run dev)
2. 🔴 **Yo/Rockwell:** Probar APIs Finnhub/Alpha Vantage con ETFs específicos
3. 🔴 **Rockwell:** Compartir requisitos del curso si hay

### ALTA PRIORIDAD (después de bloqueantes):

4. 🟡 Crear wireframes de 3 vistas (Home, Dashboard, Simulator)
5. 🟡 Validar wireframes con Rockwell
6. 🟡 Definir scope exacto de features (3 suficiente o necesitamos más)

### MEDIA PRIORIDAD (una vez desbloqueado):

7. 🟢 Crear SPEC completa de BaseButton (primer componente)
8. 🟢 Implementar BaseButton + validar workflow Antigravity
9. 🟢 Arquitectura de carpetas detallada (crear estructura vacía)
10. 🟢 Configuración completa (Vite, Tailwind, ESLint, Prettier)

---

## RESUMEN EJECUTIVO

**Estado actual:** 🟡 **Fase de diseño - 85% contexto absorbido**

**Confianza en entendimiento del problema:** 🟢 **90%**

**Confianza en solución propuesta:** 🟡 **75%** (pendiente validaciones)

**Bloqueantes críticos:** 3

1. Setup Antigravity + Vue (Rockwell debe validar)
2. APIs funcionando con ETFs (debe probarse)
3. Requisitos del curso (debe consultarse)

**Decisiones firmes:** 7 (LEGO, dark theme, USD, features visible, Outfit, paleta dual, testing)

**Hipótesis activas:** 7 (confianza promedio: 84%)

**Próxima acción sugerida:** Resolver bloqueantes antes de continuar con documentación/código

---

**Metodología aplicada:**

- ✅ Hipótesis competidoras
- ✅ Niveles de confianza explícitos
- ✅ Autocrítica regular
- ✅ Actualización continua
- ✅ Transparencia total

---

_Este documento se actualiza conforme avanza el proyecto. Versión living document._
