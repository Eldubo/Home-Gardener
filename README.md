## ANTES DE HACER CAMBIOS CREAR UNA BRANCH Y HACER PULL REQUEST!!

# Home Gardener

Aplicación de **gestión de plantas y jardines** con *backend* en Node.js/Express + PostgreSQL y *frontend* móvil con React Native (Expo).

> Monorepo con dos carpetas principales: `backend/` y `frontend/`.

---

## Tabla de contenidos

1. [Arquitectura](#arquitectura)
2. [Características](#características)
3. [Requisitos](#requisitos)
4. [Configuración rápida](#configuración-rápida)

   * [Backend](#backend)
   * [Frontend (Expo)](#frontend-expo)
5. [Variables de entorno](#variables-de-entorno)
6. [Base de datos (SQL sugerido)](#base-de-datos-sql-sugerido)
7. [Endpoints principales](#endpoints-principales)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Comandos útiles](#comandos-útiles)
10. [Troubleshooting](#troubleshooting)
11. [Colección Postman](#colección-postman)
12. [Licencia](#licencia)

---

## Arquitectura

```
frontend (React Native / Expo)
   ↕ HTTP (REST, JSON)
backend (Node.js / Express) — PostgreSQL
```

* **Backend** expone la API REST (`/api/...` + `/health`).
* **Frontend** consume la API (por defecto `http://localhost:3000` en desarrollo).

## Características

* 🔐 **Autenticación JWT**: registro, login, perfil.
* 🌱 **Gestión de plantas**: altas/bajas/modificaciones y listado.
* 🌡️ **Sensores / riego**: lectura de datos y registro de riegos.
* 🏠 **Ambientes**: alta, edición y listado de ambientes.
* 🛡️ **Validaciones** de entrada y manejo de errores consistente.
* 🩺 **Health Check**: `GET /health` para monitoreo simple.

## Requisitos

* **Node.js** ≥ 18
* **npm** ≥ 8
* **PostgreSQL** ≥ 13
* (Frontend) **Expo CLI** (`npm i -g expo-cli`) *opcional pero recomendado*

## Configuración rápida

### Backend

```bash
cd backend
npm install
# Copiar variables de entorno
cp .env.example .env   # si existe; si no, crear .env con el bloque de abajo
npm run dev            # o: npm start
```

El servidor escucha en `PORT` (por defecto 3000) y registra logs con zona horaria `America/Argentina/Buenos_Aires`.

### Frontend (Expo)

```bash
cd frontend
npm install
npm run start           # o: npm run android / npm run ios / npm run web
```

> **Importante (dispositivos físicos):** si probás en el celular, `http://localhost:3000` **no** apunta a tu PC. Cambiá la *base URL* del frontend por la **IP LAN** de tu máquina (ej.: `http://192.168.0.10:3000`). En `src/screens/HealthStatus.js` el componente acepta `baseUrl` como prop y por defecto usa `http://localhost:3000`.

## Variables de entorno

Crea un archivo **`backend/.env`** con alguno de estos esquemas:

### Opción A — Cadena completa (DB\_URL)

```
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_super_secreta
DB_URL=postgres://user:password@host:5432/home_gardener_db
```

### Opción B — Parámetros individuales

```
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_super_secreta
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=home_gardener_db
```

> El backend usa `backend/configs/db_configs.js` y soporta `DB_URL` o los parámetros individuales. En producción (p. ej. Supabase/Heroku) puede requerirse `ssl`.

## Base de datos (SQL sugerido)

> **Nota:** las tablas reales pueden variar; este es un esquema mínimo basado en el código del repo (`controllers/*`). Ajustalo según tus necesidades.

```sql
-- Base de datos
CREATE DATABASE home_gardener_db;

-- Usuarios
CREATE TABLE "Usuario" (
  "ID" SERIAL PRIMARY KEY,
  "Nombre" TEXT NOT NULL,
  "Email" TEXT UNIQUE NOT NULL,
  "Password" TEXT NOT NULL,
  "Direccion" TEXT
);

-- Ambientes (hogar, balcón, interior, etc.)
CREATE TABLE "Ambiente" (
  "ID" SERIAL PRIMARY KEY,
  "Nombre" TEXT NOT NULL
);

-- Plantas del usuario
CREATE TABLE "Planta" (
  "ID" SERIAL PRIMARY KEY,
  "Nombre" TEXT NOT NULL,
  "Tipo" TEXT,
  "Foto" TEXT,
  "UltimaFechaRiego" TIMESTAMP NULL,
  "IdAmbiente" INTEGER REFERENCES "Ambiente"("ID") ON DELETE SET NULL,
  "IdUsuario" INTEGER NOT NULL REFERENCES "Usuario"("ID") ON DELETE CASCADE
);

-- Registros de riego / sensores
CREATE TABLE "Registro" (
  "ID" SERIAL PRIMARY KEY,
  "IdPlanta" INTEGER NOT NULL REFERENCES "Planta"("ID") ON DELETE CASCADE,
  "Fecha" TIMESTAMP NOT NULL DEFAULT NOW(),
  "HumedadAntes" NUMERIC,
  "HumedadDsp" NUMERIC,
  "Temperatura" NUMERIC,
  "TemperaturaDsp" NUMERIC,
  "DuracionRiego" INTEGER
);
```

## Endpoints principales

> Prefijo base del backend: normalmente `http://localhost:3000`

### Salud

* `GET /health` → estado del servidor.

### Auth (`/api/auth`)

* `POST /register` → alta de usuario.
* `POST /login` → login (devuelve JWT).
* `GET /profile` → perfil actual (requiere `Authorization: Bearer <token>`).
* `PUT /profile` → actualizar perfil (JWT).

### Plantas (`/api/plantas`)

* `POST /agregar` → crear planta (JWT).
* `GET /misPlantas` → listar plantas del usuario (JWT).
* `PUT /modificarNombre` → renombrar planta (JWT).
* `PUT /actualizarFoto` → actualizar foto por URL/base64 (JWT).
* `DELETE /eliminar/:id` → eliminar planta (JWT).

### Sensores / Riego (`/api/sensores`)

* `GET /datosSensores?idPlanta=...` → últimos datos (JWT).
* `GET /ultimaMedicion?idPlanta=...` → última medición (JWT).
* `POST /subirDatosPlanta` → registrar medición (JWT).
* `POST /registrarUltRiego` → registrar riego finalizado (JWT).

### Ambientes (`/api/ambiente`)

* `POST /agregar` → crear ambiente (JWT).
* `GET /listar` → listar ambientes (JWT).
* `PUT /editar/:id` → editar ambiente (JWT).

> Las rutas exactas y validaciones están en `backend/src/controllers/*`.

## Estructura del proyecto

```
Home-Gardener/
├─ backend/
│  ├─ index.js                # servidor Express y wiring de rutas
│  ├─ configs/db_configs.js   # conexión PostgreSQL (DB_URL o variables)
│  ├─ src/
│  │  ├─ controllers/         # auth, plantas, sensores, ambiente
│  │  └─ middlewares/auth.js  # verificación JWT
│  └─ package.json
│
├─ frontend/
│  ├─ App.js                  # NavigationContainer
│  ├─ app.config.js           # configuración Expo
│  ├─ src/
│  │  ├─ components/          # Footer, etc.
│  │  ├─ navigation/AppNavigator.js
│  │  ├─ screens/             # Home, Login, Register, Perfil, Plantas, QR, etc.
│  │  │  └─ HealthStatus.js   # usa `GET /health`
│  │  └─ services/            # axios wrapper y servicios
│  └─ package.json
└─ README.md
```

## Comandos útiles

### Backend

```bash
npm run dev       # nodemon (si está instalado)
npm start         # node index.js
npm run clean     # elimina node_modules y package-lock.json
npm run reinstall # clean + npm install
```

### Frontend

```bash
npm run start     # abre el bundler de Expo
npm run android   # intenta abrir en emulador/Android conectado
npm run ios       # simulador iOS (macOS)
npm run web       # versión web con React Native Web
```

## Troubleshooting

* **CORS / red de dispositivos**: si usás celular físico, usá la **IP LAN** de tu PC en vez de `localhost`.
* **JWT `Unauthorized`**: verificá que enviás `Authorization: Bearer <token>` en rutas protegidas.
* **Conexión DB**: revisá `DB_URL` o variables y que la base existe. El backend loguea la configuración cargada (`db_configs.js`).
* **Puertos ocupados**: cambiá `PORT` en el `.env` o cerrá procesos en uso.

## Colección Postman

En `backend/New Collection.postman_collection.json` hay una colección con ejemplos para probar la API.

## Licencia

Este proyecto se distribuye bajo la **Licencia MIT**.
