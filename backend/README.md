# Home Gardener Backend API

Backend API para la aplicación Home Gardener - Sistema de gestión de plantas y jardines.

## 🚀 Características

- **Autenticación JWT**: Registro, login y actualización de perfil de usuario con tokens seguros.
- **Gestión de Usuarios**: Endpoints para registro, login, obtener y actualizar perfil.
- **Gestión de Plantas**: CRUD de plantas (según tu implementación actual).
- **Validaciones robustas**: Email, contraseña y datos de entrada.
- **Manejo centralizado de errores**: Respuestas consistentes y seguras.
- **CORS configurado**: Permite solo orígenes autorizados.
- **Logging**: Logs de peticiones y errores.
- **Health Check**: Endpoint para monitoreo del servidor.

## 📋 Requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 12.0
- npm >= 8.0.0

## 🛠️ Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/Eldubo/Home-Gardener.git
   cd Home-Gardener/backend
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura el archivo `.env`**  
   Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido (ajusta los valores a tu entorno):

   ```
   PORT=3000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=home_gardener

   JWT_SECRET=tu_clave_secreta_muy_segura

   FRONTEND_URL=http://localhost:3000
   ```

4. **Configura la base de datos**
   ```sql
   CREATE DATABASE home_gardener;

   CREATE TABLE Usuario (
     id SERIAL PRIMARY KEY,
     nombre VARCHAR(100) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     direccion TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE Planta (
     id SERIAL PRIMARY KEY,
     Nombre VARCHAR(100) NOT NULL,
     Tipo VARCHAR(50) NOT NULL,
     IdUsuario INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Ejecuta el servidor**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev

   # Producción
   npm start
   ```

## 📚 Endpoints de la API

### Autenticación (`/api/auth`)

#### POST `/register`
Registrar un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "contraseña123",
  "direccion": "Calle 123, Ciudad"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "direccion": "Calle 123, Ciudad"
  }
}
```

#### POST `/login`
Iniciar sesión.

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "direccion": "Calle 123, Ciudad"
  }
}
```

#### GET `/profile`
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/profile`
Actualizar perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Body (ejemplo):**
```json
{
  "nombre": "Juan Carlos Pérez",
  "direccion": "Nueva dirección"
}
```

### Plantas (`/api/plantas`)
> **Nota:** Todos los endpoints de plantas requieren autenticación JWT.  
> La estructura y lógica de estos endpoints depende de tu implementación actual.

### Utilidades

#### GET `/health`
Health check del servidor.

#### GET `/`
Información de la API y endpoints disponibles.

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt.
- JWT con expiración de 1 día.
- Validación de email y contraseña.
- CORS restringido.
- Manejo seguro de errores.

## 🚨 Manejo de Errores

Las respuestas de error siguen el formato:
```json
{
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en desarrollo)"
}
```

## 📝 Scripts Disponibles

- `npm start`: Ejecutar en producción
- `npm run dev`: Ejecutar en desarrollo con nodemon
- `npm run clean`: Eliminar node_modules y package-lock.json
- `npm run reinstall`: Reinstalar dependencias

## 🔧 Variables de Entorno

| Variable        | Descripción                        | Requerida | Default                  |
|-----------------|------------------------------------|-----------|--------------------------|
| `PORT`          | Puerto del servidor                | No        | 3000                     |
| `NODE_ENV`      | Ambiente (development/production)  | No        | development              |
| `JWT_SECRET`    | Clave secreta para JWT             | Sí        | -                        |
| `DB_HOST`       | Host de PostgreSQL                 | Sí        | -                        |
| `DB_PORT`       | Puerto de PostgreSQL               | No        | 5432                     |
| `DB_USER`       | Usuario de PostgreSQL              | Sí        | -                        |
| `DB_PASSWORD`   | Contraseña de PostgreSQL           | Sí        | -                        |
| `DB_NAME`       | Nombre de la base de datos         | Sí        | -                        |
| `FRONTEND_URL`  | URL del frontend para CORS         | No        | http://localhost:3000    |

## 🐛 Debugging y monitoreo

- Logs de todas las peticiones HTTP y errores.
- Endpoint `/health` para monitoreo.
- Manejo graceful de señales de terminación.

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFeature`)
3. Commit a tus cambios (`git commit -m 'Agrega NuevaFeature'`)
4. Push a la rama (`git push origin feature/NuevaFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 