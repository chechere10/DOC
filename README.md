# 🏥 Sistema Médico FUNDAMUFA

Sistema de gestión médica para el registro de pacientes, historias clínicas, fórmulas médicas y notas.

**🌐 URL en producción:** https://doc-tau-one.vercel.app

---

## 🚀 Tecnologías

| Componente | Tecnología |
|-----------|------------|
| **Frontend** | React 19 + Vite + TailwindCSS |
| **Backend** | Node.js + Express (Vercel Serverless Functions) |
| **Base de Datos** | PostgreSQL (Prisma Postgres en la nube) |
| **ORM** | Prisma |
| **Autenticación** | JWT (JSON Web Tokens) |
| **Hosting** | Vercel |
| **Repositorio** | GitHub (chechere10/DOC) |

---

## 🏗️ Arquitectura del Proyecto en Vercel

```
sistema-medico/
├── api/
│   └── index.js              ← Backend completo (Vercel Serverless Function)
├── frontend/
│   └── src/                   ← Aplicación React (Vite)
├── prisma/
│   ├── schema.prisma          ← Esquema de la base de datos (PostgreSQL)
│   └── seed.js                ← Datos iniciales (solo usar una vez)
├── backend/                   ← Backend original (solo para desarrollo local con SQLite)
├── vercel.json                ← Configuración de Vercel
└── package.json               ← Dependencias del backend serverless
```

### ¿Cómo funciona en Vercel?

1. **Frontend (React):** Vercel compila el frontend con `vite build` y lo sirve como archivos estáticos desde `frontend/dist/`.
2. **Backend (API):** El archivo `api/index.js` se convierte en una **Serverless Function**. Cada vez que el frontend hace una petición a `/api/...`, Vercel ejecuta esta función.
3. **Base de Datos:** La base de datos es **PostgreSQL en la nube** (Prisma Postgres). Los datos viven en la nube, NO en el código. Los datos **NUNCA** se pierden al hacer deploy.
4. **Rewrites:** El `vercel.json` redirige todas las peticiones `/api/*` al serverless function y todo lo demás al frontend React (SPA).

---

## ⚠️ REGLAS CRÍTICAS PARA ACTUALIZAR EL PROYECTO

### 🔴 LO QUE NUNCA DEBES HACER

| ❌ PROHIBIDO | Por qué |
|-------------|---------|
| `npx prisma migrate reset` | **BORRA TODOS LOS DATOS** de la base de datos |
| `node prisma/seed.js` (después del primer uso) | Puede duplicar o sobreescribir datos reales |
| Cambiar el `DATABASE_URL` | Desconecta la base de datos con todos los datos |
| Eliminar y recrear la base de datos en Prisma Console | Se pierden todos los pacientes, historias, fórmulas |

### 🟢 LO QUE SÍ PUEDES HACER SIN RIESGO

| ✅ SEGURO | Explicación |
|-----------|-------------|
| `git add . && git commit && git push` | Solo sube código, **nunca toca los datos** |
| Editar archivos del frontend (React) | Solo cambia la interfaz visual |
| Editar `api/index.js` | Solo cambia la lógica del servidor |
| `npx prisma db push` | Agrega columnas nuevas SIN borrar datos (si tienen `@default`) |

---

## 📖 GUÍA: Cómo hacer cambios y subirlos a Vercel

### Paso 1: Hacer los cambios en el código

Edita los archivos que necesites:
- **Frontend (interfaz):** Archivos en `frontend/src/`
- **Backend (API):** El archivo `api/index.js`
- **Base de datos (agregar campos):** El archivo `prisma/schema.prisma`

### Paso 2: Si modificaste el schema de Prisma

Si agregaste un campo nuevo a `prisma/schema.prisma`, **SIEMPRE** ponle un valor por defecto:

```prisma
// ✅ CORRECTO - No borra datos porque tiene @default
model Historia {
  campoNuevo String @default("valor_inicial")
}

// ✅ CORRECTO - No borra datos porque es opcional (?)
model Historia {
  campoNuevo String?
}

// ❌ INCORRECTO - Esto puede causar error o borrar datos
model Historia {
  campoNuevo String   // Sin default y sin ? = PELIGROSO
}
```

Luego ejecuta SOLO este comando para aplicar los cambios a la base de datos:

```bash
cd sistema-medico
npx prisma db push
```

Este comando:
- ✅ Agrega las columnas nuevas
- ✅ Mantiene todos los datos existentes intactos
- ✅ Los registros existentes obtienen el valor por defecto
- ❌ NO borra nada

### Paso 3: Subir los cambios a GitHub

```bash
cd sistema-medico
git add -A
git commit -m "Descripción de los cambios"
git push origin main
```

### Paso 4: Vercel se actualiza automáticamente

- Vercel detecta el push a `main` automáticamente
- Compila el frontend y despliega el serverless function
- En **30-60 segundos** los cambios están en producción
- Los datos en la base de datos **NO se tocan**

### Paso 5: Verificar

Abre https://doc-tau-one.vercel.app y verifica que todo funcione.

---

## 🔐 Credenciales de Acceso

```
Usuario: admin     | Contraseña: admin123
Usuario: jorge     | Contraseña: jorge123
```

---

## 📊 Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| **Clientes** | Registro de pacientes (nombre, cédula, teléfono, dirección) |
| **Historias** | Historias clínicas con tipo de pago (pagó/abonó) y referido |
| **Fórmulas** | Recetas médicas con ítems, cantidad y unidad personalizable |
| **Notas** | Recordatorios con estado (abierta/cerrada) |
| **Usuarios** | Gestión de usuarios del sistema (crear, editar, eliminar) |

---

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Verificar token
- `GET /api/auth/usuarios` - Listar usuarios
- `PUT /api/auth/usuarios/:id` - Actualizar usuario
- `PUT /api/auth/usuarios/:id/password` - Cambiar contraseña
- `DELETE /api/auth/usuarios/:id` - Eliminar usuario

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Detalle de cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Historias
- `GET /api/historias` - Listar historias
- `POST /api/historias` - Crear historia (con tipoPago y referido)
- `PUT /api/historias/:id` - Actualizar historia
- `DELETE /api/historias/:id` - Eliminar historia

### Fórmulas
- `GET /api/formulas` - Listar fórmulas
- `POST /api/formulas` - Crear fórmula (con unidad por ítem)
- `PUT /api/formulas/:id` - Actualizar fórmula
- `DELETE /api/formulas/:id` - Eliminar fórmula

### Notas
- `GET /api/notas` - Listar notas
- `POST /api/notas` - Crear nota
- `PUT /api/notas/:id` - Actualizar nota
- `PATCH /api/notas/:id/estado` - Cambiar estado
- `DELETE /api/notas/:id` - Eliminar nota

---

## 🖨️ Impresión

El sistema permite imprimir:
- **Fórmulas médicas** - Con encabezado institucional, datos del paciente, ítems con unidad personalizable, y línea de corte ✂
- **Historias clínicas** - Con encabezado, observaciones, tipo de pago, referido, firma y línea de corte ✂
- **Notas** - Con encabezado y contenido

---

## ⚙️ Variables de Entorno en Vercel

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de Prisma Postgres (NO cambiar) |
| `JWT_SECRET` | Clave secreta para tokens JWT |

Estas se configuran en: **Vercel Dashboard → Settings → Environment Variables**

---

## 🛠️ Desarrollo Local (opcional)

Si quieres trabajar localmente con SQLite:

```bash
# Backend local (usa SQLite)
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm start

# Frontend local
cd frontend
npm install
npm run dev
```

El desarrollo local usa el backend en `backend/` con SQLite. La producción en Vercel usa `api/index.js` con PostgreSQL.

---

## 📝 Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| 2026-02-12 | Deploy inicial en Vercel con PostgreSQL |
| 2026-02-12 | Agregar selector Pagó/Abonó, campo Referido, unidad en fórmulas |
| 2026-02-12 | Agregar línea de corte ✂ en impresiones |
| 2026-02-12 | Permitir editar cédula de clientes |

---

© 2026 FUNDAMUFA - Fundación Huésped Mujer y Familia. Todos los derechos reservados.
