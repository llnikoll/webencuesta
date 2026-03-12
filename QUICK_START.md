# Guía Rápida de Instalación ⚡

## Requisitos Mínimos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn
- Git

## Instalación en 5 Minutos

### 1. Clonar y navegar

```bash
git clone https://github.com/tu-usuario/webencuesta.git
cd webencuesta
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar base de datos

**Opción A: Base de datos local**

```bash
# Crear base de datos PostgreSQL
createdb webencuesta

# Editar .env.local
cp .env.example .env.local

# Configurar DATABASE_URL en .env.local:
# DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/webencuesta"
```

**Opción B: Usar Railway (cloud)**

```bash
# Crear cuenta en railway.app
# Railway generará DATABASE_URL automáticamente
# Copiar en .env.local
```

### 4. Inicializar base de datos

```bash
# Ejecutar migraciones
npm run prisma:migrate

# Generar cliente Prisma
npm run prisma:generate

# Crear datos iniciales
npm run prisma:seed
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

**¡Listo!** Accede a:
- 🌐 Votación: http://localhost:3000
- 👨‍💼 Admin: http://localhost:3000/admin (nicolás / 6454)

---

## Pruebas Rápidas

### Votar

1. Abre http://localhost:3000
2. Haz clic en la encuesta
3. Selecciona una opción
4. Presiona "Votar"
5. Verás: "Tu voto fue registrado correctamente"

### Intentar votar de nuevo

6. Intenta votar nuevamente desde el mismo navegador
7. Verás: "Este dispositivo ya registró un voto"

### Panel Admin

8. Abre http://localhost:3000/admin
9. Usuario: `nicolas`
10. Contraseña: `6454`
11. Verás todos los votos en tiempo real

### Exportar datos

12. En el panel admin, presiona "Exportar a CSV"
13. Se descargará `votos.csv`

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev           # Iniciar servidor de desarrollo

# Base de datos
npm run prisma:migrate     # Crear/actualizar BD
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:seed        # Crear datos iniciales
npm run prisma:studio      # Abrir Prisma Studio (GUI)

# Producción
npm run build         # Compilar para producción
npm start             # Iniciar servidor en producción

# Otros
npm run lint          # Linter de código
```

---

## Problemas Comunes

### ❌ "ECONNREFUSED: PostgreSQL no disponible"

**Solución**: Asegúrate de que PostgreSQL está corriendo

```bash
# macOS (con Homebrew)
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo systemctl start postgresql

# Windows
# Abre Services y busca "PostgreSQL"
```

### ❌ "DATABASE_URL no configurado"

**Solución**: Verifica que `.env.local` existe

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

### ❌ "Error: Tabla 'polls' no existe"

**Solución**: Ejecuta las migraciones

```bash
npm run prisma:migrate
npm run prisma:seed
```

### ❌ "Module not found: 'react'"

**Solución**: Instala las dependencias

```bash
npm install
npm run prisma:generate
```

### ❌ "Error: Port 3000 already in use"

**Solución**: Usa otro puerto

```bash
npm run dev -- -p 3001
# O cierra el proceso que usa 3000
```

---

## Variables de Entorno

Archivo `.env.local`:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/webencuesta"

# Admin (opcional, estos son los valores por defecto)
ADMIN_USER=nicolas
ADMIN_PASSWORD=6454

# Entorno
NODE_ENV=development
```

---

## Estructura de Carpetas

```
webencuesta/
├── components/        # React components
├── lib/              # Funciones auxiliares
├── pages/            # Páginas y API
│   ├── api/          # Endpoints
│   ├── admin/        # Panel admin
│   ├── poll/         # Encuesta
│   └── index.tsx     # Inicio
├── prisma/           # Base de datos
│   ├── schema.prisma # Schema
│   └── seed.ts       # Datos iniciales
├── styles/           # CSS global
└── public/           # Archivos estáticos
```

---

## Deploy en Railway

```bash
# 1. Crear repositorio en GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/webencuesta.git
git push -u origin main

# 2. En railway.app:
# - New Project
# - Deploy from GitHub
# - Selecciona webencuesta
# - Add Database → PostgreSQL
# - Configura variables de entorno
# - Deploy

# 3. Ejecutar migraciones en Railway
# Ver DEPLOY_RAILWAY.md para detalles
```

---

## Próximos Pasos

- 📖 Lee [README.md](README.md) para documentación completa
- 🔐 Lee [SECURITY.md](SECURITY.md) para detalles de seguridad
- 🚀 Lee [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md) para deploy en producción
- 📝 Lee [CHANGELOG.md](CHANGELOG.md) para cambios y roadmap

---

¡Felicidades! 🎉 Tu aplicación de votación está lista.

Preguntas? Abre un issue en GitHub.
