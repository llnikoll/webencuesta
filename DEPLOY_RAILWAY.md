# Guía de Deploy en Railway 🚀

Esta guía te ayudará a desplegar la aplicación de votación segura en Railway.

## Requisitos Previos

- Cuenta de GitHub (para conectar el repositorio)
- Cuenta de Railway ([railway.app](https://railway.app))
- Git instalado en tu computadora

## Paso 1: Preparar el Código Localmente

### 1.1 Crear repositorio Git

```bash
cd webencuesta
git init
git add .
git commit -m "Initial commit: Secure voting application"
```

### 1.2 Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Crea un repositorio llamado `webencuesta`
3. **NO** inicialices con README (ya existe)
4. Copia el comando de push:

```bash
git remote add origin https://github.com/tu-usuario/webencuesta.git
git branch -M main
git push -u origin main
```

## Paso 2: Configurar Railway

### 2.1 Crear cuenta en Railway

1. Accede a [railway.app](https://railway.app)
2. Haz clic en "Sign Up" o "Sign In con GitHub"
3. Autoriza Railway en GitHub

### 2.2 Crear nuevo proyecto

1. En el dashboard de Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub"
3. Selecciona tu repositorio `webencuesta`
4. Haz clic en "Deploy"

## Paso 3: Agregar PostgreSQL

### 3.1 Conectar base de datos

1. En tu proyecto de Railway, haz clic en "Add"
2. Selecciona "Database"
3. Selecciona "PostgreSQL"
4. Railway automáticamente:
   - Creará una instancia de PostgreSQL
   - Agregará `DATABASE_URL` a las variables de entorno
   - Vinculará la BD al proyecto

### 3.2 Verificar conexión

Railway automáticamente agregará `DATABASE_URL` como variable de entorno.

## Paso 4: Configurar Variables de Entorno

### 4.1 Agregar credenciales

En tu proyecto de Railway:

1. Haz clic en la pestaña "Variables"
2. Agrega las siguientes variables:

```env
ADMIN_USER=nicolas
ADMIN_PASSWORD=6454
NODE_ENV=production
```

**Nota**: `DATABASE_URL` se genera automáticamente.

### 4.2 Variables disponibles

Haz clic en tu servicio de PostgreSQL y copia:
- `DATABASE_URL`: Conexión a la BD

## Paso 5: Migraciones Automáticas ✅

**Las migraciones ahora son automáticas** gracias a la configuración en `railway.json`.

El deploy ejecutará automáticamente:
1. `npm run build` - Compila la aplicación
2. `npx prisma migrate deploy` - Aplica migraciones a PostgreSQL
3. `npm run prisma:seed` - Crea datos iniciales (si no existen)
4. `npm start` - Inicia el servidor

**No necesitas ejecutar comandos manualmente.**

### Si necesitas ejecutar migraciones manualmente:

```bash
# Accede a la consola de Railway (Shell)
npx prisma migrate deploy
```

## Paso 6: Verificar el Deploy

### 6.1 Estado del deployment

1. En Railway, ve a "Deployments"
2. Espera a que el status cambie de "Building" a "Success"
3. Si hay errores, ve a "Deploy Logs" para verlos

### 6.2 Acceder a la aplicación

1. Ve a la pestaña "Settings"
2. Copia el "Public URL"
3. La aplicación está disponible en esa URL

## Paso 7: Verificar Funcionalidad

### 7.1 Probar votación

1. Accede a `https://tu-app.railway.app`
2. Haz clic en la encuesta
3. Intenta votar
4. Verifica que recibes: "Tu voto fue registrado correctamente"

### 7.2 Probar panel admin

1. Ve a `https://tu-app.railway.app/admin`
2. Ingresa:
   - Usuario: `nicolas`
   - Contraseña: `6454`
3. Verifica que ves los votos registrados

## Troubleshooting

### Error: "Database connection failed"

**Causa**: DATABASE_URL no está configurado correctamente.

**Solución**:
1. En Railway, ve a tu BD PostgreSQL
2. Copia la variable `DATABASE_URL`
3. Pégala en tu aplicación (Variables)

### Error: "Tabla 'polls' no existe"

**Causa**: Las migraciones no se ejecutaron.

**Solución**:
```bash
# Ejecuta localmente
export DATABASE_URL="tu_database_url_de_railway"
npm run prisma:migrate -- --skip-generate
npx tsx prisma/seed.ts
```

### Error: "No polls found"

**Causa**: El seed no se ejecutó.

**Solución**:
```bash
npx tsx prisma/seed.ts
```

### La aplicación se cae después del deploy

**Causa**: Puede ser por variables de entorno faltantes.

**Solución**:
1. Ve a "Deploy Logs" en Railway
2. Lee los errores
3. Asegúrate de tener todas las variables configuradas

## Actualizar la Aplicación

Después de hacer cambios locales:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Railway automáticamente:
1. Detecta el nuevo push
2. Ejecuta `npm run build`
3. Ejecuta `npm start`
4. Redeploya la aplicación

## Monitoreo

### Ver logs en vivo

En Railway:
1. Ve a tu proyecto
2. Selecciona tu aplicación web
3. Ve a la pestaña "Logs"
4. Verás los logs en tiempo real

### Problemas comunes en logs

- `Error: connect ECONNREFUSED`: Database no está disponible
- `Module not found`: Dependencia no instalada
- `SyntaxError`: Error en el código

## Backup de Base de Datos

Railway crea backups automáticos. Para exportar datos manualmente:

```bash
# Conectarse a la BD
psql $DATABASE_URL

# Exportar como SQL
pg_dump $DATABASE_URL > backup.sql

# Importar desde SQL
psql $DATABASE_URL < backup.sql
```

## Escalamiento

Si la aplicación crece:

1. **Aumentar memoria**:
   - Ir a "Settings" > "Resources"
   - Aumentar RAM asignada

2. **Usar Redis** (opcional):
   - Agregar Redis para rate limiting
   - Modificar `lib/rateLimit.ts` para usar Redis

3. **CDN**: Railway automáticamente incluye CDN

## Costos

Railway es gratuito para:
- 5GB de RAM
- 100GB de almacenamiento
- Suficiente para aplicaciones pequeñas a medianas

Para más detalles: [Railway Pricing](https://railway.app/pricing)

## Soporte

Para problemas con Railway:
- Documentación: [docs.railway.app](https://docs.railway.app)
- Discord: [Railway Community](https://discord.gg/railway)

---

**¡Tu aplicación de votación está en el aire! 🎉**
