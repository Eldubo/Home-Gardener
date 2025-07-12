
# Home-Gardener

Bienvenido a la aplicación con código abierto de Home Gardener - Una aplicación para gestionar tu jardín y plantas.

## 🚀 Características

- 🌱 Gestión de plantas y jardines
- 👤 Sistema de autenticación de usuarios
- 📱 Interfaz responsive para web y móvil
- 🔐 Autenticación JWT segura
- 🗄️ Base de datos PostgreSQL

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL
- Expo CLI (para desarrollo móvil)

## 🛠️ Instalación

### 1. Clonar el proyecto

```bash
git clone https://github.com/Eldubo/Home-Gardener.git
cd Home-Gardener
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=home_gardener_db

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Configuración del servidor
PORT=3000
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar la Base de Datos

Crear la base de datos PostgreSQL:

```sql
CREATE DATABASE home_gardener_db;
```

Crear la tabla de usuarios:

```sql
CREATE TABLE "Usuario" (
    "ID" SERIAL PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) UNIQUE NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "Direccion" TEXT NOT NULL,
    "FechaCreacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:

```env
EXPO_SUPABASE_URL=tu_url_de_supabase
EXPO_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## 🚀 Ejecutar el proyecto

### Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en: http://localhost:3000

### Frontend

```bash
cd frontend
npm start
```

Luego presiona `w` para abrir en web: http://localhost:19006

## 📱 Uso

1. **Registro**: Crea una nueva cuenta con tu email y contraseña
2. **Login**: Inicia sesión con tus credenciales
3. **Gestión de Plantas**: Agrega y gestiona tus plantas
4. **Perfil**: Actualiza tu información personal

## 🛠️ Scripts disponibles

### Backend
- `npm start`: Inicia el servidor en producción
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm run clean`: Limpia node_modules
- `npm run reinstall`: Reinstala dependencias

### Frontend
- `npm start`: Inicia Expo
- `npm run android`: Inicia en Android
- `npm run ios`: Inicia en iOS
- `npm run web`: Inicia en web

## 🔧 Tecnologías utilizadas

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- CORS

### Frontend
- React Native
- Expo
- React Navigation
- AsyncStorage
- Vector Icons

## 📞 Soporte

Para soporte, contacta a: magondubi@gmail.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

