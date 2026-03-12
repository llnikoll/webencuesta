@echo off
REM Script de setup para desarrollo local en Windows
REM Uso: setup.bat

echo 🚀 Configurando Plataforma de Votacion Segura...

REM Verificar si Node.js está instalado
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node -v') do set NODE_VERSION=%%a
echo ✓ %NODE_VERSION%

REM Verificar si npm está instalado
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no está instalado.
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('npm -v') do set NPM_VERSION=%%a
echo ✓ npm %NPM_VERSION%

REM Instalar dependencias
echo.
echo 📦 Instalando dependencias...
call npm install

if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

REM Crear archivo .env.local si no existe
if not exist .env.local (
    echo.
    echo 📝 Creando .env.local...
    copy .env.example .env.local
    echo ⚠️  IMPORTANTE: Edita .env.local con tus credenciales de PostgreSQL
)

REM Generar cliente Prisma
echo.
echo 🔧 Generando cliente Prisma...
call npm run prisma:generate

if errorlevel 1 (
    echo ❌ Error generando cliente Prisma
    pause
    exit /b 1
)

echo.
echo ✅ Setup completado!
echo.
echo 📋 Próximos pasos:
echo 1. Edita .env.local con tus credenciales de PostgreSQL
echo 2. Ejecuta: npm run prisma:migrate
echo 3. Ejecuta: npm run prisma:seed
echo 4. Ejecuta: npm run dev
echo.
echo 🌐 Accede a: http://localhost:3000
echo 👨‍💼 Panel admin: http://localhost:3000/admin
echo.
pause
