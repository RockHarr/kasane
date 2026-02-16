# ADR 001: Vue 3 vs React para Frontend

**Fecha:** 2026-01-25  
**Estado:** ✅ Aceptado  
**Decidido por:** Rockwell Harrison  

---

## Contexto

Necesitamos elegir un framework frontend para construir Tesorería Simple. El proyecto requiere:
- Componentes reutilizables
- State management
- Routing
- Integración con APIs REST
- Performance en tiempo real (gráficos, simulador)

## Opciones Consideradas

### 1. Vue 3
- Composition API moderna
- Reactivity nativa
- Ecosistema maduro (Router, Pinia)
- Learning curve suave
- Bundle size pequeño

### 2. React
- Más popular en el mercado
- Hooks modernos
- Ecosistema enorme
- Más verboso (JSX)
- Requiere más decisiones (state management, routing)

### 3. Svelte
- Muy performante
- Sintaxis simple
- Menos maduro
- Menos jobs disponibles

## Decisión

**Elegimos Vue 3**

## Rationale

1. **Mandatorio del curso:** El curso de frontend usa Vue, no negociable
2. **Composition API:** Moderna y comparable a React Hooks
3. **Reactivity nativa:** Perfecto para datos que cambian (precios, simulador)
4. **Ecosistema oficial:** Vue Router + Pinia son oficiales y bien integrados
5. **Menos decisiones:** Vue es más "opinionated", menos fatiga de decisiones
6. **Performance:** Suficiente para nuestras necesidades

## Consecuencias

### Positivas
- ✅ Cumple requisito del curso
- ✅ Desarrollo más rápido (menos configuración)
- ✅ Documentación oficial excelente
- ✅ DevTools integradas
- ✅ Reactivity out-of-the-box

### Negativas
- ⚠️ Menos demanda laboral que React (en general)
- ⚠️ Ecosistema de librerías más pequeño que React
- ⚠️ Rockwell tiene menos experiencia con Vue (oportunidad de aprender)

### Neutral
- Vue 3 es relativamente nuevo (2020), pero estable
- TypeScript es opcional (decidimos NO usarlo por ahora)

## Notas

- Si el proyecto escala significativamente, Vue 3 puede manejarlo sin problemas
- La decisión está validada por el requisito académico
- Aprender Vue es transferible (conceptos similares a React)

## Referencias

- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)
- Stack Overflow Developer Survey 2025: Vue es el 3er framework más querido

---

**Próxima revisión:** Post-MVP (Q2 2026)  
**Relacionado:** ADR-002 (Tailwind vs CSS), ADR-003 (ApexCharts)