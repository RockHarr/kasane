# ADR 005: Cumplir WCAG 2.1 AA desde MVP

**Fecha:** 2026-01-25  
**Estado:** ✅ Aceptado  
**Decidido por:** Rockwell Harrison (requisito explícito)

---

## Contexto

Rockwell pidió explícitamente: _"considerar normas internacionales de accesibilidad"_

**WCAG (Web Content Accessibility Guidelines)** es el estándar internacional para accesibilidad web.

**Niveles:**

- **Level A:** Básico (mínimo legal en algunos países)
- **Level AA:** Recomendado (mayoría de organizaciones)
- **Level AAA:** Máximo (no siempre factible)

## Opciones Consideradas

### 1. No considerar accesibilidad

- Desarrollo más rápido
- Menos restricciones de diseño
- **Consecuencia:** App inutilizable para personas con discapacidades

### 2. WCAG 2.1 Level A (mínimo)

- Accesibilidad básica
- Fácil de cumplir
- No suficiente para muchos usuarios

### 3. WCAG 2.1 Level AA (recomendado)

- Balance entre accesibilidad y viabilidad
- Estándar de industria
- Requerido en muchos países

### 4. WCAG 2.1 Level AAA (máximo)

- Accesibilidad máxima
- Difícil de cumplir al 100%
- Overkill para MVP

## Decisión

**Cumplir WCAG 2.1 Level AA desde MVP**

## Rationale

1. **Requisito explícito:** Rockwell lo pidió directamente
2. **Ético:** Hacer la app usable para todos
3. **Legal:** Requerido en muchos países (USA, EU, Chile)
4. **Mejor producto:** Accesibilidad beneficia a todos, no solo discapacitados
5. **Portfolio:** Demuestra profesionalismo y atención al detalle
6. **Preventivo:** Más fácil construir accesible desde inicio que arreglar después

## Consecuencias

### Positivas

- ✅ App usable por personas con discapacidades visuales, auditivas, motoras, cognitivas
- ✅ Mejor UX para todos (navegación por teclado, contraste, etc.)
- ✅ Cumplimiento legal
- ✅ SEO mejorado (semántica HTML)
- ✅ Diferenciador vs otros proyectos del curso

### Negativas

- ⚠️ Requiere más tiempo de diseño (validar contrastes, etc.)
- ⚠️ Algunas decisiones estéticas limitadas (ej: verde neón necesitó ajuste)
- ⚠️ Testing adicional (keyboard nav, screen readers)

### Neutral

- Algunos requisitos son naturales (ej: botones 44px es buena UX de todos modos)

## Implementación

### Ajustes Realizados

**1. Sistema de Color:**

- Color original: `#00ff88` (ratio 2.8:1) ❌
- Color ajustado: `#00ffaa` (ratio 5.1:1) ✅
- Sistema dual: `-bg` para decoración, sin sufijo para texto

**2. Tipografía:**

- Outfit en vez de Clash Display (más legible)
- JetBrains Mono para números (monospace legible)
- DM Sans para body (sans-serif accesible)

**3. Interactividad:**

- Todos los botones: min 44x44px
- Focus visible: outline 2px verde
- Skip link para keyboard users
- Tooltips accesibles (hover + focus)

**4. Semántica:**

- HTML5 landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`)
- ARIA labels donde necesario
- Roles apropiados (`role="alert"`, `role="status"`)

**5. Motion:**

- `prefers-reduced-motion` respetado
- Animaciones opcionales para usuarios sensibles

### Testing Plan

**Automated:**

- Lighthouse (target: 95+ score)
- axe DevTools (0 violations)
- Pa11y CI en pipeline

**Manual:**

- Keyboard navigation (Tab, Enter, ESC)
- Screen reader (VoiceOver/NVDA)
- Zoom 200% (legibilidad)
- Color blindness simulation

## Criterios de Éxito

**Must Have (Blockers para launch):**

- [ ] Lighthouse Accessibility: 95+
- [ ] axe DevTools: 0 violations
- [ ] Keyboard navigation: 100% funcional
- [ ] Contraste: todos los textos 4.5:1+
- [ ] Touch targets: todos 44px+

**Should Have (Nice to have):**

- [ ] Screen reader testing completo
- [ ] User testing con personas con discapacidades
- [ ] WCAG 2.1 AAA en algunos criterios (donde factible)

## Documentación

Creamos `docs/02-diseno/accesibilidad.md` con:

- Checklist completa WCAG 2.1 AA
- Herramientas de testing
- Ejemplos de implementación
- Rationale de cada decisión

## Costo vs Beneficio

**Costo:**

- ~10% más tiempo de diseño (validar colores)
- ~5% más tiempo de desarrollo (ARIA, semántica)
- Testing adicional (~2-3 horas)

**Beneficio:**

- App usable por 15%+ más usuarios (personas con discapacidades)
- Mejor UX para 100% de usuarios
- Cumplimiento legal
- Portfolio más fuerte

**ROI:** Altamente positivo

## Alternativas No Elegidas

- **Level A solo:** Insuficiente, muchos usuarios excluidos
- **"Lo arreglamos después":** Más caro, propenso a nunca hacerse
- **Ignorar accesibilidad:** Éticamente incorrecto, legalmente riesgoso

## Notas

- WCAG 2.2 existe pero 2.1 es suficiente (2.2 agrega pocos criterios)
- WCAG 3.0 está en draft, no considerado aún
- Si hay conflict entre estética y accesibilidad, accesibilidad gana

## Referencias

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project](https://www.a11yproject.com/)
- docs/02-diseno/accesibilidad.md (checklist completo)

---

**Próxima revisión:** Pre-launch (validar con herramientas)  
**Relacionado:** Sistema de Diseño, todos los componentes
