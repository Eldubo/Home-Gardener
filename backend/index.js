import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';

import AuthRoutes from './controllers/auth-controller.js';
import PlantasRoutes from './controllers/plantas-controller.js';
<<<<<<< HEAD
=======
console.log('DB_HOST from env:', process.env.DB_HOST);
>>>>>>> e9a6e9dc09aeec24965f9be88dad2b2d0da86bd2

// Validar variables de entorno críticas
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingEnvVars);
  console.error('Por favor, configura las variables de entorno requeridas en tu archivo .env');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas correctamente');
console.log('🌱 Iniciando servidor Home Gardener...');

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Rutas de la API
app.use('/api/auth', AuthRoutes);
app.use('/api/plantas', PlantasRoutes);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'OK',
    message: 'Servidor Home Gardener funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'API Home Gardener',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      plantas: '/api/plantas',
      health: '/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  // Error de validación de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Token inválido',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Error de expiración de JWT
  if (error.name === 'TokenExpiredError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Token expirado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Error de base de datos
  if (error.code === '23505') { // Unique violation
    return res.status(StatusCodes.CONFLICT).json({
      message: 'El recurso ya existe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  if (error.code === '23503') { // Foreign key violation
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Referencia inválida',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Error genérico
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

// Función para cerrar el servidor gracefulmente
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);
  process.exit(0);
};

// Manejar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
