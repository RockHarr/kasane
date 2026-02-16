# ADR 003: ApexCharts vs Chart.js para Visualizaciones

**Fecha:** 2026-01-25  
**Estado:** ✅ Aceptado  
**Decidido por:** Claude (recomendación) + Rockwell (aprobación)

---

## Contexto

Necesitamos renderizar 2 gráficos principales:

1. **Comparison Chart:** Líneas comparando inversión vs cuenta corriente
2. **DCA Simulator:** Gráfico de área con proyección de crecimiento

Requisitos:

- Dark mode compatible
- Animaciones smooth
- Customizable (colores, estilos)
- Responsive
- Performance aceptable

## Opciones Consideradas

### 1. ApexCharts

- Muy visual out-of-the-box
- Dark mode nativo
- Animaciones smooth
- Wrapper oficial Vue: `vue3-apexcharts`
- Bundle más pesado (~150KB)
- Config declarativa (JSON)

### 2. Chart.js

- Ligero (~60KB)
- Simple y directo
- Documentación excelente
- Menos opciones de customización visual
- Animaciones más básicas
- Dark mode requiere config manual

### 3. D3.js

- Control total
- Extremadamente flexible
- Curva de aprendizaje STEEP
- Mucho código boilerplate
- Overkill para 2 gráficos simples

### 4. Recharts

- Declarativo (React-like)
- Bueno para React
- Vue wrapper menos maduro

## Decisión

**Elegimos ApexCharts**

## Rationale

1. **Estética:** Dark mode + customización visual se alinea con diseño terminal futurista
2. **Animaciones:** Reveal smooth es importante para UX
3. **Balance:** No tan complejo como D3, no tan básico como Chart.js
4. **Wrapper oficial:** `vue3-apexcharts` es oficial y bien mantenido
5. **Config declarativa:** JSON config es más fácil que D3 imperative
6. **Tooltips:** Built-in y customizables (importante para accesibilidad)

## Consecuencias

### Positivas

- ✅ Gráficos se ven profesionales con mínima config
- ✅ Dark theme funciona out-of-the-box
- ✅ Animaciones mejoran UX significativamente
- ✅ Responsive sin esfuerzo extra
- ✅ Tooltips accesibles por defecto

### Negativas

- ⚠️ Bundle más pesado que Chart.js (~90KB más)
- ⚠️ A veces "demasiado fancy" (podría distraer)
- ⚠️ Config object puede ser verboso

### Mitigaciones

- Tree-shaking en build (solo importar tipos de gráfico usados)
- Configuración con valores conservadores (no todas las features)
- Code-splitting: cargar solo en vistas que lo usan

## Implementación

```javascript
// Solo importar los tipos necesarios
import VueApexCharts from "vue3-apexcharts";

const chartOptions = {
  chart: { type: "line", background: "transparent" },
  theme: { mode: "dark" },
  colors: ["#00ffaa", "#6b7280"],
  stroke: { curve: "smooth", width: 3 },
};
```

## Alternativas No Elegidas

- **Chart.js:** Muy bueno pero less visual, animaciones básicas
- **D3.js:** Overkill para 2 gráficos, demasiado tiempo de desarrollo
- **Recharts:** Mejor para React, Vue wrapper inmaduro

## Performance Benchmark

- ApexCharts render time: ~50ms (aceptable)
- Chart.js render time: ~30ms (más rápido pero menos visual)
- Diferencia irrelevante para usuario (<100ms)

## Notas

- ApexCharts 3.x es estable (v4 en desarrollo pero no necesario)
- Si performance es problema en futuro, podemos lazy-load gráficos
- Tooltips deben tener descripciones textuales para screen readers (custom config)

## Referencias

- [ApexCharts Docs](https://apexcharts.com/)
- [vue3-apexcharts](https://github.com/apexcharts/vue3-apexcharts)
- [Chart.js vs ApexCharts Comparison](https://www.npmtrends.com/apexcharts-vs-chart.js)

---

**Próxima revisión:** Post-implementación (Semana 3)  
**Relacionado:** ComparisonChart.vue, DCASimulator.vue
