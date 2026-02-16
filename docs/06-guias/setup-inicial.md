# Setup Inicial

## Prerequisitos

- Node.js 20.x LTS o superior
- npm 10.x o superior
- Git
- Antigravity IDE (o VS Code)
- Cuenta GitHub
- Cuenta Vercel (gratis)

## 1. Crear Proyecto

```bash
# Crear proyecto Vue con Vite
npm create vue@latest tesoreria-simple

# Opciones a seleccionar:
✅ TypeScript? No
✅ JSX Support? No
✅ Vue Router? Yes
✅ Pinia? Yes
✅ Vitest? Yes
✅ ESLint? Yes
✅ Prettier? Yes
```

## 2. Instalar Dependencias Adicionales

```bash
cd tesoreria-simple

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# ApexCharts
npm install apexcharts vue3-apexcharts

# Lucide Icons
npm install lucide-vue-next
```

## 3. Configurar Tailwind

Edita `tailwind.config.js`:

```javascript
// Ver docs/03-arquitectura/stack-tecnico.md para config completa
```

Edita `src/assets/main.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 4. Variables de Entorno

Crea `.env.local`:

```env
VITE_FINNHUB_API_KEY=tu_key_aqui
VITE_ALPHA_VANTAGE_API_KEY=tu_key_aqui
```

Crea `.env.example` (para GitHub):

```env
VITE_FINNHUB_API_KEY=
VITE_ALPHA_VANTAGE_API_KEY=
```

## 5. Obtener API Keys

**Finnhub:**

1. https://finnhub.io/register
2. Dashboard → API Key
3. Copiar y pegar en `.env.local`

**Alpha Vantage:**

1. https://www.alphavantage.co/support/#api-key
2. Free tier
3. Copiar y pegar en `.env.local`

## 6. Correr Proyecto

```bash
npm run dev
```

Abre http://localhost:3000

## 7. Verificar que Todo Funciona

✅ App carga sin errores  
✅ Tailwind funciona (ver estilos)  
✅ Hot reload funciona (edita un archivo, auto-refresh)  
✅ ESLint no muestra errores

## 8. Primer Commit

```bash
git init
git add .
git commit -m "Initial setup: Vue 3 + Tailwind + APIs"
git branch -M main
git remote add origin [tu-repo-url]
git push -u origin main
```

## 9. Deploy a Vercel

1. https://vercel.com/new
2. Import Git Repository
3. Conecta tu repo de GitHub
4. Framework Preset: Vite
5. Add environment variables (API keys)
6. Deploy

---

## Troubleshooting

**Error: "Cannot find module 'tailwindcss'"**
→ `npm install -D tailwindcss postcss autoprefixer`

**Error: "API key invalid"**
→ Verifica que `.env.local` tiene las keys correctas

**Puerto 3000 ocupado**
→ Edita `vite.config.js`: `server: { port: 3001 }`

Ver [Troubleshooting](troubleshooting.md) para más problemas comunes.
