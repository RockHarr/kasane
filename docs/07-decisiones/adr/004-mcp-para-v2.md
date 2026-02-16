# ADR 004: MCP (Model Context Protocol) para v2.0

**Fecha:** 2026-01-25  
**Estado:** 🟡 Propuesto (para v2.0)  
**Decidido por:** Rockwell Harrison + Claude

---

## Contexto

Rockwell preguntó si envolver las APIs bursátiles en MCP (Model Context Protocol) haría el sistema más inteligente.

**MCP** permite que Claude (vía Anthropic API) use "tools" (funciones) para:

- Llamar APIs externas
- Razonar sobre los datos
- Generar respuestas contextuales
- Crear un asistente IA conversacional

## Opciones Consideradas

### 1. MVP sin MCP (actual)

- Solo frontend Vue + APIs REST directas
- Lógica de asignación hardcodeada
- Tooltips estáticos
- Comparador con cálculos fijos

### 2. MVP con MCP

- Frontend + MCP server + Anthropic API
- Asistente IA conversacional
- Análisis inteligente de portafolio
- Explicaciones contextuales

### 3. v2.0 con MCP (recomendado)

- MVP simple primero (aprobar curso)
- v2.0 agrega MCP como killer feature
- Tiempo para aprender y implementar bien

## Decisión

**NO usar MCP en MVP. SÍ en v2.0**

## Rationale

### Por qué NO en MVP:

1. **Scope del curso:** Curso evalúa Vue/frontend, no IA
2. **Complejidad técnica:** MCP requiere:
   - MCP server (Node.js)
   - Anthropic API key + costo
   - Arquitectura más compleja
   - Debugging más difícil
3. **Tiempo limitado:** MVP debe estar en 4-5 semanas
4. **YAGNI:** No necesitamos IA para demostrar skills de frontend
5. **Aprendizaje:** Rockwell aprende Vue primero, MCP después

### Por qué SÍ en v2.0:

1. **Diferenciador brutal:** Ninguna app de inversión tiene asistente IA conversacional
2. **Valor real:** Usuarios realmente se benefician de explicaciones personalizadas
3. **Escalabilidad:** MCP permite features avanzadas:
   - "¿Por qué AGG bajó hoy?" → Claude busca noticias + explica
   - "¿Debería rebalancear?" → Claude analiza + sugiere
   - "¿Qué significa P/E ratio?" → Explica en contexto del usuario
4. **Marketing:** "Powered by Claude" es excelente marketing
5. **Tiempo adecuado:** Post-curso hay tiempo para implementar bien

## Consecuencias

### MVP (sin MCP):

**Positivas:**

- ✅ Scope manejable
- ✅ Menos complejidad técnica
- ✅ Aprobar curso sin distracciones
- ✅ Funcional y útil sin IA

**Negativas:**

- ⚠️ App es "calculadora bonita", no "inteligente"
- ⚠️ Sin diferenciación real vs otras apps

### v2.0 (con MCP):

**Positivas:**

- ✅ Diferenciador competitivo único
- ✅ Valor real para usuarios
- ✅ Roadmap claro ("Próximamente" en UI)
- ✅ Tiempo para aprender e implementar bien

**Negativas:**

- ⚠️ Costo de API (Anthropic cobra por uso)
- ⚠️ Complejidad de mantener MCP server
- ⚠️ Latencia (Claude toma ~2-5s en responder)

## Estrategia de Roadmap

### MVP (v1.0):

- Mostrar en UI: "🤖 Asistente IA - Próximamente Q2 2026"
- Badge "Coming Soon"
- Botón "Notificarme cuando esté listo"
- **Marketing honesto:** Realmente vamos a construirlo

### v2.0 (Q2 2026):

- Implementar MCP server
- Envolver Finnhub/Alpha Vantage en MCP tools
- Agregar Anthropic API integration
- Chat interface para preguntas
- Análisis contextual de portafolio

## Arquitectura Futura (v2.0)

```
Frontend (Vue)
    ↓
MCP Server (Node.js)
    ↓
┌─────────┬─────────────┐
│ Finnhub │ Alpha       │ ← APIs bursátiles
│ API     │ Vantage API │
└─────────┴─────────────┘
    ↓
Anthropic API (Claude)
    ↓
Respuesta inteligente al usuario
```

**MCP Tools a crear:**

- `get_market_data(symbol)` - Fetch quote
- `analyze_portfolio(allocation)` - Analizar asignación
- `calculate_projection(params)` - DCA calculations
- `search_news(topic)` - Noticias financieras

## Validación de Interés

En MVP incluimos:

- Sección "Próximamente" con Asistente IA
- Tracking de clicks en "Notificarme"
- Si 50+ personas muestran interés → validamos demanda

## Notas

- MCP es relativamente nuevo (2024) pero estable
- Anthropic ofrece tier gratuito limitado para testing
- Podríamos monetizar v2.0 ($9/mes con IA incluido)

## Referencias

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Anthropic API Pricing](https://www.anthropic.com/pricing)
- Rockwell research notes: H6 (MCP hypothesis)

---

**Próxima revisión:** Post-MVP (Q2 2026)  
**Relacionado:** RoadmapSection.vue, vision.md (Features v2.0)
