# 🛍️ Velour Inventory System

Sistema de inventario moderno desarrollado con arquitectura Fullstack utilizando Vue 3, Node.js y MySQL.

---

## ✨ Características

- 🔐 Autenticación segura con JWT
- 👥 Sistema RBAC (Role-Based Access Control)
- 🧩 Menús dinámicos según permisos
- 📊 Dashboard con estadísticas y gráficas
- 📦 Gestión completa de productos
- 🛒 Gestión de compras y ventas
- 🚚 Administración de proveedores
- 📁 Categorías y subcategorías
- 📄 Exportación PDF y Excel
- 🔔 Sistema de notificaciones Toast
- 📱 Diseño responsive moderno
- 🎨 UI/UX estilo SaaS Dashboard
- 🔄 Refresh Token Authentication
- 📈 Estadísticas en tiempo real
- ⚡ Middleware de permisos
- 🧠 Invalidación automática de tokens al cambiar permisos

---

# 🧱 Tecnologías Utilizadas

## Frontend
- Vue 3
- Composition API
- Vue Router
- Pinia
- Axios
- TailwindCSS
- Chart.js
- Lucide Icons

## Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Multer
- Middleware RBAC

---

# 🔐 Sistema RBAC

El sistema implementa un control de acceso basado en roles:

- Cada usuario posee un rol
- Cada rol tiene permisos específicos
- Los permisos se asignan por submenú
- El menú se construye dinámicamente desde backend
- Los tokens se invalidan automáticamente cuando cambian permisos

Permisos soportados:
- 👁️ Ver
- ➕ Crear
- ✏️ Editar
- 🗑️ Eliminar

---

# 📂 Estructura del Proyecto

```bash
Inventario-app/
│
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── helpers/
│   ├── db/
│   └── Libraries/
│
├── frontend/
│   ├── components/
│   ├── stores/
│   ├── views/
│   ├── router/
│   └── assets/
```

---

# ⚙️ Instalación

## 1️⃣ Clonar repositorio

```bash
git clone https://github.com/Byron-Xa/Proyect
```

---

## 2️⃣ Instalar dependencias

### Frontend

```bash
npm install
```

### Backend


```bash
cd backend
npm install
```

---

# 🔑 Variables de Entorno

Crear archivo `.env`

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inventario

JWT_SECRET=tu_secret
JWT_REFRESH_SECRET=tu_refresh_secret
```

---

# 🚀 Ejecutar proyecto

## Frontend

```bash
npm run dev
```

## Backend

```bash
node index.js
```

---

# 📸 Capturas

## Login
<img src="./screenshots/login.png" />

## Dashboard
<img src="./screenshots/dashboard.png" />

## Gestión de Usuarios
<img src="./screenshots/users.png" />

---

# 🌐 Deploy

Frontend desplegado en:
- Vercel

Backend desplegado en:
- Render / Railway

---

# 📌 Estado del Proyecto

✅ En desarrollo activo

Próximas mejoras:
- 🔔 Notificaciones en tiempo real con Socket.io
- 📝 Logs y auditoría
- 📊 Reportes avanzados
- 🌙 Modo oscuro/claro

---

# 👨‍💻 Autor

Desarrollado por Byron

GitHub:
- https://github.com/Byron-Xa