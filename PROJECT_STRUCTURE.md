# Estructura del Proyecto - Visualización Completa

```
webencuesta/
│
├── 📁 components/                          # Componentes React reutilizables
│   ├── AdminLogin.tsx                     # Formulario de login admin
│   ├── AdminVotesTable.tsx                # Tabla con detalles de votos
│   ├── Countdown.tsx                      # Contador regresivo de 72h
│   ├── Results.tsx                        # Gráficos con Chart.js
│   └── VotingForm.tsx                     # Formulario de votación
│
├── 📁 lib/                                 # Funciones y utilidades reutilizables
│   ├── auth.ts                            # Gestión de autenticación admin
│   ├── prisma.ts                          # Cliente Prisma (singleton)
│   ├── rateLimit.ts                       # Rate limiting por IP
│   ├── security.ts                        # Hashing y validación de seguridad
│   ├── time.ts                            # Funciones de tiempo y countdown
│   └── validation.ts                      # Sanitización de inputs (XSS/CSRF)
│
├── 📁 pages/                               # Páginas y rutas Next.js
│   ├── 📁 api/                            # API Endpoints
│   │   ├── vote.ts                        # POST /api/vote - Registrar voto
│   │   ├── poll.ts                        # GET /api/poll - Obtener encuesta
│   │   ├── results.ts                     # GET /api/results - Resultados
│   │   └── 📁 admin/                      # Rutas protegidas para admin
│   │       ├── login.ts                   # POST /api/admin/login
│   │       ├── stats.ts                   # GET /api/admin/stats
│   │       └── export.ts                  # GET /api/admin/export
│   │
│   ├── 📁 admin/                          # Página del panel admin
│   │   └── index.tsx                      # GET /admin - Panel administrador
│   │
│   ├── 📁 poll/                           # Página de votación dinámica
│   │   └── [pollId].tsx                   # GET /poll/[pollId] - Votación
│   │
│   ├── 404.tsx                            # Página 404 (no encontrado)
│   ├── 500.tsx                            # Página 500 (error servidor)
│   ├── _app.tsx                           # App wrapper (imports CSS global)
│   └── index.tsx                          # GET / - Página de inicio
│
├── 📁 prisma/                              # Configuración de base de datos
│   ├── schema.prisma                      # Schema con 3 modelos: Poll, Option, Vote
│   └── seed.ts                            # Script para crear datos iniciales
│
├── 📁 styles/                              # Estilos globales
│   └── globals.css                        # Tailwind directives + componentes
│
├── 📁 public/                              # Archivos estáticos (favicon, etc)
│
├── 📋 Archivos de Configuración
│   ├── .env.example                       # Plantilla de variables de entorno
│   ├── .env.local                         # Variables locales (NO commitar)
│   ├── .gitignore                         # Archivos ignorados por Git
│   ├── package.json                       # Dependencias y scripts npm
│   ├── package-lock.json                  # Lock de versiones exactas
│   ├── tsconfig.json                      # Configuración de TypeScript
│   ├── tailwind.config.ts                 # Configuración de Tailwind
│   ├── postcss.config.js                  # PostCSS para Tailwind
│   ├── next.config.js                     # Configuración de Next.js
│   └── README.md                          # README generado por Next.js
│
└── 📚 Documentación
    ├── README.md                          # Guía completa del proyecto
    ├── QUICK_START.md                     # Instalación en 5 minutos
    ├── DEPLOY_RAILWAY.md                  # Guía de deploy en Railway
    ├── SECURITY.md                        # Documentación de seguridad
    ├── CHANGELOG.md                       # Cambios y roadmap
    ├── PROJECT_SUMMARY.md                 # Este archivo
    ├── setup.sh                           # Script setup (Linux/macOS)
    └── setup.bat                          # Script setup (Windows)
```

---

## 🎯 Flujo de Datos

### Votación

```
Usuario Browser
    ↓
VotingForm.tsx (React)
    ↓ Selecciona opción
    ↓
POST /api/vote
    ↓
pages/api/vote.ts
├─ Valida rate limit (rateLimit.ts)
├─ Genera fingerprint (security.ts)
├─ Valida inputs (validation.ts)
├─ Verifica sin duplicados (security.ts + Prisma)
└─ Crea voto y incrementa contador (transacción)
    ↓
PostgreSQL (Prisma)
├─ INSERT vote
└─ UPDATE option.votes++
    ↓
Retorna 200 OK
    ↓
Frontend muestra "Voto registrado"
```

### Ver Resultados

```
Usuario Browser
    ↓
Countdown.tsx (React)
├─ Consulta revealAt cada 1 segundo
└─ Si 72h pasadas, muestra resultados
    ↓
Results.tsx
├─ GET /api/results?pollId=poll_1
└─ Recibe options con votos
    ↓
Chart.js (React Chartjs2)
├─ Gráfico de barras
└─ Gráfico circular
```

### Panel Admin

```
Usuario Browser
    ↓
AdminLogin.tsx (React)
    ↓ Ingresa nicolás / 6454
    ↓
POST /api/admin/login
    ↓
lib/auth.ts valida credenciales
    ↓ OK
    ↓
Set-Cookie: admin_token=xxx
    ↓
GET /api/admin/stats?pollId=poll_1
    ↓
Middleware: checkAdminAuth()
├─ Verifica cookie admin_token
└─ Si no existe, retorna 401
    ↓
Retorna estadísticas en tiempo real
    ↓
AdminVotesTable.tsx
├─ Muestra tabla de votos
└─ Botón de exportar a CSV
```

---

## 🔄 Ciclo de Vida de un Voto

```
t=0s
├─ Usuario accede a /poll/poll_1
├─ Carga Poll y options desde /api/poll
└─ Ve Countdown de 72h

t=1s
├─ Usuario selecciona opción
├─ Presiona botón "Votar"
└─ Frontend genera device fingerprint

t=2s
├─ POST /api/vote con:
│  ├─ pollId: "poll_1"
│  ├─ optionId: "opt_123"
│  ├─ deviceFingerprint: "hash_aed3..."
│  └─ userAgent: "Mozilla/5.0..."
└─ Backend recibe request

t=3s
Backend procesa:
├─ Extrae IP del cliente: "192.168.1.100"
├─ Genera ipHash: "d3d9446802a44259..."
├─ Rate limit check: ✓ OK
├─ Input validation: ✓ OK
├─ Verifica duplicados:
│  ├─ ¿Existe voto con este ipHash? NO
│  ├─ ¿Existe voto con este deviceFingerprint? NO
│  └─ ¿Existe voto con esta cookie? NO
└─ ✓ APROBADO

t=4s
├─ Inicia transacción de BD
├─ Crea vote en BD
├─ Incrementa option.votes
└─ Commit transacción (ACID)

t=5s
├─ Set-Cookie: vote_id=xyz... (HttpOnly)
├─ Retorna 200 OK
└─ {success: true, message: "Voto registrado..."}

t=6s
├─ Frontend muestra animación de éxito
├─ Usuario ve: "Tu voto fue registrado"
└─ Countdown continúa

t=6s a t=259200s (72h después)
├─ Countdown cuenta hacia atrás
├─ Resultados permanecen ocultos
└─ Solo admin ve resultados en tiempo real

t=259200s
├─ Countdown llega a 0
├─ shouldRevealResults() retorna true
├─ Frontend muestra gráficos
└─ Resultados públicos
```

---

## 📊 Modelo de Datos

```
┌─────────────────────────────┐
│         polls               │
├─────────────────────────────┤
│ id (STRING, PK)            │
│ title (STRING)             │
│ createdAt (DATETIME)       │
│ revealAt (DATETIME)        │  ← Cuándo revelar
└──────────────┬──────────────┘
               │ 1:N
               │
         ┌─────▼──────────────────────────┐
         │       options                  │
         ├────────────────────────────────┤
         │ id (STRING, PK)                │
         │ pollId (STRING, FK) ────────┐  │
         │ text (STRING)                │  │
         │ votes (INT) ◄──────────────┐ │  │
         └────────────────────────────┼─┘  │
                                      │    │
                                 Incrementado
                                   por vote.ts
         ┌────────────────────────────┼────┐
         │         votes              │    │
         ├────────────────────────────┼────┤
         │ id (STRING, PK)            │    │
         │ pollId (STRING, FK)────────┼────┘
         │ optionId (STRING, FK)──────┘
         │ ipHash (STRING, UNIQUE)
         │ deviceFingerprint (STRING, UNIQUE)
         │ userAgent (STRING)
         │ cookieId (STRING, UNIQUE)
         │ createdAt (DATETIME)
         └────────────────────────────┘
```

---

## 🔌 Endpoints Disponibles

### Públicos

#### GET /api/poll
```
Query: pollId=poll_1

Response:
{
  "id": "poll_1",
  "title": "¿Cuál es tu lenguaje favorito?",
  "options": [
    {"id": "opt_1", "text": "JavaScript", "votes": 5},
    {"id": "opt_2", "text": "Python", "votes": 3}
  ],
  "createdAt": "2025-03-12T10:00:00Z",
  "revealAt": "2025-03-15T10:00:00Z"
}
```

#### POST /api/vote
```
Body:
{
  "pollId": "poll_1",
  "optionId": "opt_1",
  "deviceFingerprint": "hash_abc123",
  "userAgent": "Mozilla/5.0..."
}

Response:
{
  "success": true,
  "message": "Tu voto fue registrado correctamente"
}

Error (409):
{
  "error": "Este dispositivo ya registró un voto"
}
```

#### GET /api/results
```
Query: pollId=poll_1

Response (si no revelados):
{
  "revealed": false,
  "totalVotes": 0,
  "options": []
}

Response (si revelados):
{
  "revealed": true,
  "totalVotes": 8,
  "options": [
    {"id": "opt_1", "text": "JavaScript", "votes": 5},
    {"id": "opt_2", "text": "Python", "votes": 3}
  ]
}
```

### Administrador (Protegidos)

#### POST /api/admin/login
```
Body:
{
  "username": "nicolas",
  "password": "6454"
}

Response:
{
  "success": true,
  "token": "admin_1234567890_xyz",
  "message": "Autenticación exitosa"
}

Set-Cookie: admin_token=...; HttpOnly; SameSite=Strict
```

#### GET /api/admin/stats
```
Query: pollId=poll_1
Auth: Cookie admin_token

Response:
{
  "totalVotes": 8,
  "totalOptions": 2,
  "options": [
    {"text": "JavaScript", "votes": 5},
    {"text": "Python", "votes": 3}
  ],
  "votes": [
    {
      "id": "vote_1",
      "option": {"text": "JavaScript"},
      "ipHash": "d3d944...",
      "deviceFingerprint": "aef123...",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-03-12T10:15:00Z"
    }
  ]
}
```

#### GET /api/admin/export
```
Query: pollId=poll_1
Auth: Cookie admin_token

Response: CSV file
"Opción","IP Hash","Device Fingerprint","User Agent","Fecha"
"JavaScript","d3d944...","aef123...","Mozilla/5.0...","2025-03-12 10:15:00"
```

---

## 🎨 Componentes React

### VotingForm.tsx
```typescript
Props: {
  options: Array<{id, text}>
  onVote: (optionId) => Promise
  isLoading: boolean
  error?: string
}

Estado:
- selectedOption: "opt_1" | ""
- voted: true | false

Output:
- Radio buttons para cada opción
- Botón de votar
- Mensaje de error si existe
- Animación de éxito
```

### Results.tsx
```typescript
Props: {
  options: Array<{id, text, votes}>
  totalVotes: number
}

Output:
- Barra de progreso para cada opción
- Gráfico de barras (Chart.js)
- Gráfico circular (Chart.js)
- Total de votos
```

### Countdown.tsx
```typescript
Props: {
  revealAt: string (ISO date)
  isRevealed: boolean
}

Output:
- Countdown en formato: "2d 11h 30m 45s"
- Actualiza cada segundo
- Muestra "¡Resultados disponibles!" cuando termina
```

### AdminLogin.tsx
```typescript
Props: {
  onLogin: (username, password) => Promise
  isLoading: boolean
  error?: string
}

Output:
- Inputs de usuario y contraseña
- Botón de login
- Mensaje de error
```

### AdminVotesTable.tsx
```typescript
Props: {
  votes: Array<{id, option, ipHash, deviceFingerprint, userAgent, createdAt}>
  onExport: () => Promise
}

Output:
- Tabla con 5 columnas
- Botón de exportar CSV
- Mensaje si no hay votos
```

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Inicia servidor en puerto 3000

# Base de datos
npm run prisma:generate    # Genera cliente Prisma
npm run prisma:migrate     # Ejecuta migraciones
npm run prisma:seed        # Crea datos iniciales
npm run prisma:studio      # Abre Prisma GUI

# Producción
npm run build             # Compila para producción
npm start                 # Inicia servidor en modo producción

# Linting
npm run lint              # Ejecuta ESLint
```

---

## 🔐 Variables de Entorno

```env
# REQUERIDO
DATABASE_URL="postgresql://usuario:pass@localhost:5432/webencuesta"

# OPCIONAL (defaults disponibles)
ADMIN_USER=nicolas                    # Default: "nicolas"
ADMIN_PASSWORD=6454                   # Default: "6454"
NODE_ENV=development                  # Default: "development"
```

---

Este documento proporciona una visualización completa de cómo está organizado el proyecto.

Para más detalles específicos, consulta:
- 📖 [README.md](README.md)
- 🔐 [SECURITY.md](SECURITY.md)
- ⚡ [QUICK_START.md](QUICK_START.md)
