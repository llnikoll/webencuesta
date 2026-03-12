# Plataforma de Votación Segura 🗳️

Una aplicación web moderna de votación segura sin necesidad de registro. Los usuarios pueden votar una sola vez por dispositivo con múltiples capas de protección.

## 🌟 Características

- ✅ **Votación sin registro**: Acceso inmediato, sin necesidad de crear cuenta
- 🔒 **Seguridad de múltiples capas**: 
  - Hash de IP del usuario
  - Device fingerprint
  - User Agent tracking
  - Cookies HttpOnly seguras
  - Rate limiting por IP
  - Protección CSRF/XSS
- ⏱️ **Contador regresivo**: Los resultados se ocultan durante 72 horas
- 📊 **Gráficos en tiempo real**: Con Chart.js
- 👨‍💼 **Panel Administrador**: Ver resultados en tiempo real
- 📥 **Exportación a CSV**: Descarga los votos registrados
- 🎨 **Diseño responsivo**: Basado en TailwindCSS

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14**: Framework React para producción
- **React 18**: Librería de UI
- **TailwindCSS**: Estilos minimalistas
- **Chart.js**: Gráficos interactivos
- **React Chart.js 2**: Integración de gráficos

### Backend
- **Node.js**: Entorno de ejecución
- **Next.js API Routes**: Endpoints sin servidor
- **TypeScript**: Tipado estático

### Base de Datos
- **PostgreSQL**: Base de datos relacional
- **Prisma**: ORM moderno

## 📋 Requisitos Previos

- Node.js 18+ y npm/yarn
- PostgreSQL 12+
- Git

## 🚀 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/webencuesta.git
cd webencuesta
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/webencuesta"
ADMIN_USER=nicolas
ADMIN_PASSWORD=6454
NODE_ENV=development
```

### 4. Crear la base de datos

```bash
npm run prisma:migrate
```

### 5. Generar cliente Prisma

```bash
npm run prisma:generate
```

### 6. Inicializar datos de ejemplo

```bash
npm run prisma:seed
```

### 7. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Uso

### Votación Pública

1. Accede a `http://localhost:3000`
2. Haz clic en la encuesta disponible
3. Selecciona una opción y presiona "Votar"
4. Verás un contador regresivo de 72 horas
5. Después de 72 horas, los resultados se mostrarán automáticamente

### Panel Administrador

1. Accede a `http://localhost:3000/admin`
2. Ingresa las credenciales:
   - Usuario: `nicolas`
   - Contraseña: `6454`
3. Observa los resultados en tiempo real
4. Exporta los votos a CSV con el botón "Exportar"

## 🔐 Sistema de Seguridad

### 1. Prevención de Votos Duplicados

```typescript
// Se valida:
- Hash SHA256 de la IP del usuario
- Device fingerprint (basado en user agent + navegador)
- Cookie de votación única
- User Agent
```

### 2. Rate Limiting

- Máximo 3 intentos por IP en 1 minuto
- En memoria (usar Redis en producción)

### 3. Validación de Inputs

- Sanitización contra XSS
- Validación de longitud
- Rechazo de caracteres peligrosos

### 4. Protección del Servidor

- Cookies HttpOnly y SameSite
- Headers de seguridad
- Transacciones ACID con Prisma

## 📦 Estructura del Proyecto

```
webencuesta/
├── components/          # Componentes React
│   ├── AdminLogin.tsx
│   ├── AdminVotesTable.tsx
│   ├── Countdown.tsx
│   ├── Results.tsx
│   └── VotingForm.tsx
├── lib/                 # Utilidades
│   ├── auth.ts          # Autenticación admin
│   ├── prisma.ts        # Cliente Prisma
│   ├── rateLimit.ts     # Rate limiting
│   ├── security.ts      # Funciones de seguridad
│   ├── time.ts          # Gestión de tiempo
│   └── validation.ts    # Validación de inputs
├── pages/               # Páginas Next.js
│   ├── api/             # API routes
│   │   ├── vote.ts
│   │   ├── poll.ts
│   │   ├── results.ts
│   │   └── admin/
│   │       ├── login.ts
│   │       ├── stats.ts
│   │       └── export.ts
│   ├── admin/
│   │   └── index.tsx
│   ├── poll/
│   │   └── [pollId].tsx
│   └── index.tsx
├── prisma/
│   ├── schema.prisma    # Esquema de BD
│   └── seed.ts          # Datos iniciales
├── styles/
│   └── globals.css      # Estilos globales
├── .env.example         # Plantilla de variables
├── package.json         # Dependencias
├── tailwind.config.ts   # Config de TailwindCSS
└── tsconfig.json        # Config de TypeScript
```

## 🗄️ Esquema de Base de Datos

### Tabla `polls`
```sql
id          String    PRIMARY KEY
title       String    
createdAt   DateTime  DEFAULT now()
revealAt    DateTime  (Tiempo cuando se revelan los resultados)
```

### Tabla `options`
```sql
id          String    PRIMARY KEY
pollId      String    FOREIGN KEY (polls.id)
text        String    
votes       Int       DEFAULT 0
```

### Tabla `votes`
```sql
id                  String    PRIMARY KEY
pollId              String    FOREIGN KEY (polls.id)
optionId            String    FOREIGN KEY (options.id)
ipHash              String    UNIQUE (por poll)
deviceFingerprint   String    UNIQUE (por poll)
userAgent           String    
cookieId            String    UNIQUE (por poll)
createdAt           DateTime  DEFAULT now()
```

## 🚀 Despliegue en Railway

### 1. Crear cuenta en Railway

Accede a [railway.app](https://railway.app) y crea una cuenta.

### 2. Subir código a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/webencuesta.git
git push -u origin main
```

### 3. Crear proyecto en Railway

1. Accede a tu dashboard de Railway
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub"
4. Selecciona tu repositorio `webencuesta`

### 4. Agregar PostgreSQL

1. En Railway, haz clic en "Add"
2. Selecciona "Database"
3. Elige "PostgreSQL"
4. Railway automáticamente conectará la BD

### 5. Configurar variables de entorno

En Railway, ve a "Variables" del proyecto y agregar:

```env
ADMIN_USER=nicolas
ADMIN_PASSWORD=6454
NODE_ENV=production
```

La `DATABASE_URL` se generará automáticamente.

### 6. Configurar build y start

Railway detectará automáticamente los scripts de `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 7. Deploy automático

1. Railway ejecutará `npm run build`
2. Luego ejecutará `npm start`
3. La aplicación estará disponible en un dominio generado

### 8. Ejecutar migraciones

En la consola de Railway:

```bash
npm run prisma:migrate
npm run prisma:seed
```

## 🌐 Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/webencuesta

# Admin
ADMIN_USER=nicolas
ADMIN_PASSWORD=6454

# Entorno
NODE_ENV=production
```

## 🧪 Testing

Para probar la aplicación localmente:

1. Abre `http://localhost:3000`
2. Intenta votar dos veces desde el mismo navegador
3. Verás el mensaje "Este dispositivo ya registró un voto"
4. Intenta votar varias veces muy rápido
5. Verás rate limiting después de 3 intentos

## 📊 Monitoreo

El panel administrador permite:

- Ver votación en tiempo real
- Consultar detalles de cada voto
- Ver IP hash, device fingerprint, user agent
- Exportar datos a CSV para análisis

## 🔍 Troubleshooting

### Error: "DATABASE_URL no está configurado"

Asegúrate de que `.env.local` existe y contiene:
```env
DATABASE_URL="postgresql://..."
```

### Error: "Encuesta no encontrada"

Ejecuta el seed para crear datos iniciales:
```bash
npm run prisma:seed
```

### Error: "Error al conectar a PostgreSQL"

Verifica que:
1. PostgreSQL está corriendo
2. Las credenciales en `.env.local` son correctas
3. La base de datos existe

## 📝 API Documentation

### POST `/api/vote`

Registra un voto.

**Request:**
```json
{
  "pollId": "poll_1",
  "optionId": "option_id",
  "deviceFingerprint": "hash_del_dispositivo",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tu voto fue registrado correctamente"
}
```

### GET `/api/poll?pollId=poll_1`

Obtiene detalles de una encuesta.

**Response:**
```json
{
  "id": "poll_1",
  "title": "¿Cuál es...",
  "options": [{"id": "opt_1", "text": "...", "votes": 5}],
  "revealAt": "2025-03-15T..."
}
```

### GET `/api/results?pollId=poll_1`

Obtiene resultados (solo si se revelaron).

### POST `/api/admin/login`

Autentica administrador.

**Request:**
```json
{
  "username": "nicolas",
  "password": "6454"
}
```

### GET `/api/admin/stats?pollId=poll_1`

Obtiene estadísticas en tiempo real (requiere autenticación).

### GET `/api/admin/export?pollId=poll_1`

Exporta votos a CSV (requiere autenticación).

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte, abre un issue en GitHub o contacta a través de correo electrónico.

---

**Hecho con ❤️ para votaciones seguras**
