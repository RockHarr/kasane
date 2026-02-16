# ADR 002: Tailwind CSS vs CSS Custom

**Fecha:** 2026-01-25  
**Estado:** ✅ Aceptado  
**Decidido por:** Rockwell Harrison + Claude

---

## Contexto

Necesitamos decidir cómo manejar estilos en la aplicación. Requisitos:

- Estética única (terminal futurista, no genérica)
- Desarrollo rápido
- Componentes reutilizables
- Dark theme
- Accesibilidad (WCAG AA)

## Opciones Consideradas

### 1. Tailwind CSS

- Utility-first
- No componentes pre-diseñados (libertad total)
- Customizable vía config
- Tree-shaking (solo CSS usado)
- IntelliSense en VSCode

### 2. CSS Custom (Vanilla)

- Control total
- Sin dependencies
- Más trabajo manual
- Naming conventions propias

### 3. CSS-in-JS (styled-components, emotion)

- Popular en React
- No ideal para Vue
- Runtime overhead

### 4. Bootstrap/Material

- Componentes pre-hechos
- Difícil customizar estética única
- Look genérico

## Decisión

**Elegimos Tailwind CSS**

## Rationale

1. **Velocidad de desarrollo:** Clases utility permiten prototipar rápido
2. **No look genérico:** A diferencia de Bootstrap, Tailwind no trae componentes pre-diseñados
3. **Customización total:** `tailwind.config.js` permite definir sistema completo de diseño
4. **Learning opportunity:** Rockwell es novato en Tailwind, buena oportunidad para aprender skill útil
5. **Tree-shaking:** Build final solo incluye clases usadas
6. **Ecosistema:** Plugins, IntelliSense, Prettier integration

## Consecuencias

### Positivas

- ✅ Desarrollo más rápido que vanilla CSS
- ✅ HTML más verboso pero autocompleta bien
- ✅ No naming fatigue (no inventar nombres de clases)
- ✅ Responsive design fácil (sm:, md:, lg:)
- ✅ Dark mode built-in (aunque solo usamos dark)
- ✅ Accesibilidad helpers (sr-only, focus-visible)

### Negativas

- ⚠️ Curva de aprendizaje (Rockwell es novato)
- ⚠️ HTML más largo (muchas clases)
- ⚠️ Requiere purge/tree-shaking configurado
- ⚠️ Tentación de usar muchas utilities en vez de componentes

### Mitigaciones

- Documentamos clases más usadas en cheatsheet
- Creamos componentes Vue para evitar repetir utilities
- ESLint + Prettier con plugin Tailwind para ordenar clases

## Configuración Custom

Sistema de diseño definido en `tailwind.config.js`:

```javascript
colors: {
  bg: { primary, secondary, elevated },
  accent: { growth, alert, neutral } + -bg variants,
  text: { primary, secondary, muted }
},
fontFamily: {
  display: 'Outfit',
  mono: 'JetBrains Mono',
  body: 'DM Sans'
},
boxShadow: {
  'glow-growth', 'glow-alert'
}
```

## Alternativas No Elegidas

- **Bootstrap:** Demasiado genérico, difícil lograr estética terminal futurista
- **Vanilla CSS:** Más lento, más propenso a bugs, naming fatigue
- **CSS Modules:** Buen approach pero más verboso que Tailwind para prototipar

## Notas

- Si Tailwind resulta problemático en desarrollo, podemos migrar a CSS custom sin mucho esfuerzo (es solo styling)
- Tailwind 4.0 viene pronto pero nos quedamos en 3.4 (estable)
- Prettier plugin ordena clases automáticamente (consistencia)

## Alternativa Considerada Post-Decisión

### Vuetify (2026-01-25 - Reconsiderado)

**Contexto:** Rockwell preguntó si Vuetify estaría más a su alcance dado que es novato en Tailwind.

**Vuetify ventajas:**

- Componentes pre-hechos (`<v-btn>`, `<v-card>`)
- Curva de aprendizaje más suave
- Menos código (props en vez de utility classes)
- Material Design built-in

**Vuetify desventajas:**

- ❌ Estética Material Design incompatible con "terminal futurista"
- ❌ Bundle muy pesado (~200KB+ vs Tailwind purged ~10KB)
- ❌ Difícil customizar para look único
- ❌ Requeriría re-documentar sistema de diseño completo
- ❌ Requeriría re-hacer wireframes

**Decisión final:** **Mantener Tailwind**

**Rationale de confirmación:**

1. Estética única es prioridad (diferenciador en portfolio)
2. Sistema de diseño ya documentado en Tailwind
3. Wireframes ya creados con esa estética
4. Mitigación: Claude proveerá componentes completos copy-paste ready
5. IntelliSense + Prettier facilitan desarrollo
6. Skill más transferible (Tailwind usado en múltiples frameworks)

**Compromiso de soporte:**

- Claude proveerá componentes base completos con clases
- Cheatsheet de utilidades más usadas
- Soporte continuo durante desarrollo

## Referencias

- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Tailwind + Vue Best Practices](https://tailwindcss.com/docs/guides/vite#vue)
- [Why Tailwind for Custom Designs](https://www.youtube.com/watch?v=R50q4NES6Iw)
- [Vuetify (alternativa considerada)](https://vuetifyjs.com/)

---

**Última revisión:** 2026-01-25 (Decisión confirmada tras considerar Vuetify)  
**Relacionado:** ADR-001 (Vue), Sistema de Diseño (docs/02-diseno/), componentes-lego.md
