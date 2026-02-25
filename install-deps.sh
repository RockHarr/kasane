#!/bin/bash

# Script de instalación de dependencias - Kasane
# Ejecutar con: bash install-deps.sh

echo "📦 Instalando dependencias de producción..."
npm install pinia vue-router apexcharts vue3-apexcharts lucide-vue-next @vueuse/core

echo ""
echo "🛠️  Instalando dependencias de desarrollo..."
npm install -D tailwindcss postcss autoprefixer vitest @vue/test-utils happy-dom

echo ""
echo "⚙️  Inicializando Tailwind CSS..."
npx tailwindcss init -p

echo ""
echo "✅ Instalación completada!"
echo ""
echo "Próximos pasos:"
echo "1. Configurar Tailwind CSS"
echo "2. Crear estructura de directorios /src"
echo "3. Implementar servicios"
