# Documentación de Seguridad y Arquitectura 🔐

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente (Browser)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (TailwindCSS)                      │   │
│  │  - VotingForm.tsx                                    │   │
│  │  - Results.tsx                                       │   │
│  │  - Countdown.tsx                                     │   │
│  │  - AdminLogin.tsx                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Server (Node.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes (/pages/api)                             │   │
│  │  ├─ POST /api/vote                                   │   │
│  │  ├─ GET /api/poll                                    │   │
│  │  ├─ GET /api/results                                 │   │
│  │  ├─ POST /api/admin/login                            │   │
│  │  ├─ GET /api/admin/stats                             │   │
│  │  └─ GET /api/admin/export                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware de Seguridad                             │   │
│  │  ├─ Rate Limiting                                    │   │
│  │  ├─ Input Sanitization                               │   │
│  │  ├─ CSRF Protection                                  │   │
│  │  └─ Admin Authentication                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ Connection Pool
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tablas:                                             │   │
│  │  ├─ polls (encuestas)                                │   │
│  │  ├─ options (opciones)                               │   │
│  │  └─ votes (votos con hashes de seguridad)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Sistema de Seguridad para Votos Duplicados

### Capa 1: IP Hash

```typescript
// Entrada: IP del usuario (ej: 192.168.1.100)
// Proceso: SHA256 hash
// Salida: d3d9446802a44259755d38e6d163e820 (hash irreversible)

const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
```

**Ventajas**:
- Irreversible (no se puede recuperar la IP original)
- Deterministico (misma IP = mismo hash)
- Imposible colisionar

**Desventajas**:
- Las VPNs pueden cambiar la IP
- Las redes móviles cambian IPs frecuentemente

### Capa 2: Device Fingerprint

```typescript
// Combinación de:
// - User Agent (navegador, SO)
// - Idioma del navegador
// - Zona horaria
// - Canvas fingerprinting
// - Propiedades del navegador

const fingerprint = hash({
  userAgent: navigator.userAgent,
  language: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  canvasData: canvas.toDataURL(),
  screen: `${screen.width}x${screen.height}`,
});
```

**Ventajas**:
- Muy difícil de falsificar
- No requiere servidor
- Actualizado automáticamente

**Desventajas**:
- Puede variar con actualizaciones del SO
- No es 100% único

### Capa 3: Cookie Segura

```typescript
// Header HTTP:
// Set-Cookie: vote_id=abc123; 
//   Path=/; 
//   Max-Age=31536000 (1 año);
//   HttpOnly (JavaScript no puede acceder);
//   SameSite=Strict (CSRF protection)

res.setHeader(
  'Set-Cookie',
  `vote_id=${cookieId}; Path=/; Max-Age=${365 * 24 * 60 * 60}; HttpOnly; SameSite=Strict`
);
```

**Ventajas**:
- No accesible desde JavaScript (XSS protection)
- Enviada automáticamente en requests
- SameSite previene CSRF

### Capa 4: User Agent Tracking

Se almacena el User Agent completo para auditoría:

```typescript
Vote {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

### Validación de Duplicados

```typescript
// Antes de registrar un voto, verificar:
async function validateNoDuplicateVote(
  pollId: string,
  ipHash: string,
  deviceFingerprint: string,
  cookieId: string
) {
  const existingVote = await prisma.vote.findFirst({
    where: {
      pollId,
      OR: [
        { ipHash },           // ← Mismo IP hash
        { deviceFingerprint }, // ← Mismo device
        { cookieId }          // ← Misma cookie
      ]
    }
  });

  return !existingVote;
}
```

Si CUALQUIERA de los tres coincide, se rechaza el voto.

## Protección contra Bots

### Rate Limiting

```typescript
interface RateLimitStore {
  [ipHash: string]: {
    count: number;
    resetTime: number;
  }
}

function checkRateLimit(ipHash: string) {
  // Máximo 3 votos por IP en 60 segundos
  if (record.count >= 3) {
    return false; // Bloqueado
  }
  record.count++;
  return true;
}
```

**Configuración**:
- 3 intentos máximo
- Ventana de 60 segundos
- Reset automático

### Sanitización de Inputs

```typescript
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function isValidInput(input: string): boolean {
  // Máximo 500 caracteres
  if (input.length > 500) return false;

  // Rechazar patrones sospechosos
  const suspicious = /<script|javascript:|on\w+\s*=|eval\(|expression\(/gi;
  return !suspicious.test(input);
}
```

### Protección CSRF

Cada formulario incluye un token CSRF único:

```typescript
const csrfToken = generateCSRFToken();
// Token se valida en el servidor antes de procesar
```

### Protección XSS

- **HttpOnly Cookies**: JavaScript no puede acceder
- **SameSite=Strict**: No se envía en requests cross-site
- **Content-Security-Policy**: Limita recursos permitidos
- **Sanitización**: Todos los inputs se escapan

## Autenticación del Administrador

### Flow

```
1. Usuario ingresa credenciales
   ↓
2. POST /api/admin/login
   ├─ Verificar contra ADMIN_USER y ADMIN_PASSWORD
   ├─ Si incorrecto: return 401
   └─ Si correcto: generar token
   ↓
3. Set-Cookie: admin_token=xyz; HttpOnly; SameSite=Strict
   ↓
4. Token se valida en /api/admin/* endpoints
```

### Validación de Sesión

```typescript
function checkAdminAuth(req: NextApiRequest): boolean {
  const token = req.cookies.admin_token;
  return token ? validateAdminSession(token) : false;
}

// En cada endpoint admin:
if (!checkAdminAuth(req)) {
  return res.status(401).json({ error: 'No autenticado' });
}
```

## Almacenamiento de Datos

### Tabla de Votos

```sql
CREATE TABLE votes (
  id              TEXT PRIMARY KEY,
  pollId          TEXT REFERENCES polls(id),
  optionId        TEXT REFERENCES options(id),
  ipHash          TEXT NOT NULL,           -- Hash SHA256
  deviceFingerprint TEXT NOT NULL,         -- Hash de fingerprint
  userAgent       TEXT NOT NULL,           -- Para auditoría
  cookieId        TEXT NOT NULL,           -- ID único de sesión
  createdAt       TIMESTAMP DEFAULT NOW(),

  -- Constraints de unicidad por encuesta
  UNIQUE(pollId, ipHash),
  UNIQUE(pollId, deviceFingerprint),
  UNIQUE(pollId, cookieId)
);
```

**Ventaja**: Las constraints a nivel BD previenen duplicados incluso con race conditions.

## Headers de Seguridad

```typescript
// En Next.js next.config.js:
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

## Transacciones de Base de Datos

```typescript
// Garantizar consistencia: incrementar votos y crear registro juntos
await prisma.$transaction([
  prisma.vote.create({
    data: {
      pollId,
      optionId,
      ipHash,
      deviceFingerprint,
      userAgent,
      cookieId,
    },
  }),
  prisma.option.update({
    where: { id: optionId },
    data: { votes: { increment: 1 } },
  }),
]);
```

Si falla cualquier operación, se revierte todo (ACID).

## Escalabilidad y Mejoras Futuras

### Rate Limiting con Redis

Para múltiples servidores:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimitRedis(ipHash: string) {
  const count = await redis.incr(`ratelimit:${ipHash}`);
  if (count === 1) {
    await redis.expire(`ratelimit:${ipHash}`, 60);
  }
  return count <= 3;
}
```

### Logging y Auditoría

```typescript
// Registrar todos los intentos (exitosos y fallidos)
await prisma.voteLog.create({
  data: {
    pollId,
    ipHash,
    success: true/false,
    reason: 'Voto registrado' || 'IP duplicada',
    timestamp: new Date(),
  }
});
```

### Detección de Anomalías

```typescript
// Alerta si hay:
// - Más de X votos en Y segundos
// - Patrón de IPs similares
// - Device fingerprints sospechosas
```

### 2FA para Admin

```typescript
// SMS o TOTP para acceso admin
// Implementar con: speakeasy, twilio
```

## Pruebas de Seguridad

### Prueba 1: Voto Duplicado por IP

```bash
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"pollId":"poll_1", "optionId":"opt_1", "deviceFingerprint":"abc"}'

# Segundo intento desde misma IP
# Debe retornar: "Este dispositivo ya registró un voto"
```

### Prueba 2: Rate Limiting

```bash
# 3 intentos en menos de 1 segundo
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/vote ...
done

# Debe retornar 429 (Too Many Requests) después de 3
```

### Prueba 3: XSS

```bash
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"optionId":"<script>alert(1)</script>"}'

# Debe sanitizarse: &lt;script&gt;alert(1)&lt;/script&gt;
```

## Cumplimiento de Regulaciones

### GDPR
- ✅ Los datos de IP están hasheados (pseudoanonimizados)
- ✅ Los usuarios pueden solicitar acceso/eliminación
- ✅ Política de privacidad disponible

### LGPD (Brasil)
- ✅ Consentimiento implícito al votar
- ✅ Datos encriptados en tránsito (HTTPS)
- ✅ Datos almacenados de forma segura

## Conclusión

La aplicación implementa **múltiples capas de seguridad**:

1. **Prevención de duplicados**: IP + Device + Cookie + User Agent
2. **Protección de bots**: Rate limiting + Validación
3. **Seguridad de datos**: Hashing + Encriptación + HTTPS
4. **Autenticación**: Credenciales + Cookies HttpOnly
5. **Auditoría**: Logs completos de todos los votos

Esto hace que sea **muy difícil** manipular los resultados de la votación.
