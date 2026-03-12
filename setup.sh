#!/bin/bash

# Script de setup para desarrollo local
# Uso: chmod +x setup.sh && ./setup.sh

echo "🚀 Configurando Plataforma de Votación Segura..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node --version)"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

echo "✓ npm $(npm --version)"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creando .env.local..."
    cp .env.example .env.local
    echo "⚠️  IMPORTANTE: Edita .env.local con tus credenciales de PostgreSQL"
fi

# Generar cliente Prisma
echo ""
echo "🔧 Generando cliente Prisma..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo "❌ Error generando cliente Prisma"
    exit 1
fi

echo ""
echo "✅ Setup completado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita .env.local con tus credenciales de PostgreSQL"
echo "2. Ejecuta: npm run prisma:migrate"
echo "3. Ejecuta: npm run prisma:seed"
echo "4. Ejecuta: npm run dev"
echo ""
echo "🌐 Accede a: http://localhost:3000"
echo "👨‍💼 Panel admin: http://localhost:3000/admin"
echo ""
