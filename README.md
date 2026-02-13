# 🏥 Sistema Médico FUNDAMUFA

Sistema de gestión médica moderno para el registro de pacientes, historias clínicas, fórmulas y notas.

## 🚀 Tecnologías

- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Base de Datos:** SQLite (Prisma ORM)
- **Autenticación:** JWT

## 📋 Requisitos

- Node.js 18+ 
- npm 9+

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
# Backend
cd sistema-medico/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar base de datos

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed  # Crear usuario admin
```

### 3. Iniciar servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🔐 Credenciales de Acceso

```
Usuario: admin
Password: admin123
```

## 📁 Estructura del Proyecto

```
sistema-medico/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de BD
│   │   ├── seed.js          # Datos iniciales
│   │   └── dev.db           # Base de datos SQLite
│   ├── src/
│   │   ├── index.js         # Entrada del servidor
│   │   ├── middleware/      # Auth middleware
│   │   └── routes/          # Rutas API
│   └── uploads/             # Fotos de clientes
│
└── frontend/
    └── src/
        ├── components/      # Componentes reutilizables
        ├── context/         # Contexto de autenticación
        ├── pages/           # Páginas de la app
        └── services/        # API client
```

## 📊 Módulos

| Módulo | Descripción |
|--------|-------------|
| **Clientes** | Registro de pacientes (nombre, cédula, teléfono, dirección, foto) |
| **Historias** | Historias clínicas vinculadas a clientes |
| **Fórmulas** | Recetas médicas con múltiples ítems |
| **Notas** | Recordatorios con estado (abierta/cerrada) |

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Verificar token

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Detalle de cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Historias
- `GET /api/historias` - Listar historias
- `GET /api/historias/:id` - Detalle de historia
- `POST /api/historias` - Crear historia
- `PUT /api/historias/:id` - Actualizar historia
- `DELETE /api/historias/:id` - Eliminar historia

### Fórmulas
- `GET /api/formulas` - Listar fórmulas
- `GET /api/formulas/:id` - Detalle de fórmula
- `POST /api/formulas` - Crear fórmula
- `PUT /api/formulas/:id` - Actualizar fórmula
- `DELETE /api/formulas/:id` - Eliminar fórmula

### Notas
- `GET /api/notas` - Listar notas
- `GET /api/notas/:id` - Detalle de nota
- `POST /api/notas` - Crear nota
- `PUT /api/notas/:id` - Actualizar nota
- `DELETE /api/notas/:id` - Eliminar nota

## 🎨 Screenshots

El sistema incluye:
- ✅ Login moderno con validación
- ✅ Dashboard con estadísticas y accesos rápidos
- ✅ Gestión completa de clientes con fotos
- ✅ Historias clínicas con búsqueda
- ✅ Fórmulas médicas con múltiples ítems
- ✅ Notas con estados (abierta/cerrada)
- ✅ Diseño responsive (móvil, tablet, desktop)

## 📝 Licencia

© 2026 FUNDAMUFA - Todos los derechos reservados
