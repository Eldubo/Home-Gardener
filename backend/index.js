import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment-timezone';

import AuthRoutes from './src/controllers/auth-controller.js';
import PlantasRoutes from './src/controllers/plantas-controller.js';
import SensoresRoutes from './src/controllers/sensores-controller.js';
import AmbienteRoutes from './src/controllers/ambiente-controller.js';

// Validar variables de entorno críticas
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingEnvVars);
  console.error('Por favor, configura las variables de entorno requeridas en tu archivo .env');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas correctamente');
console.log('🌱 Iniciando servidor Home Gardener...');

const app = express();

// Configuración de CORS más segura
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:3000'] // Solo permitir origen específico en producción
    : '*', // Permitir todos en desarrollo
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  // Obtener la fecha y hora en UTC-3
  const timestamp = moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYY HH:mm:ss');
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Rutas de la API
app.use('/api/auth', AuthRoutes);
app.use('/api/plantas', PlantasRoutes);
app.use('/api/sensores', SensoresRoutes);
app.use('/api/ambiente', AmbienteRoutes);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  // Obtener la fecha y hora en UTC-3 para la ruta de salud
  const timestamp = moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYY HH:mm:ss');
  res.status(StatusCodes.OK).json({
    status: 'OK',
    message: 'Servidor Home Gardener funcionando correctamente',
    timestamp: timestamp,
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
    success: false,
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
      success: false,
      message: 'Token inválido',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Error de expiración de JWT
  if (error.name === 'TokenExpiredError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Token expirado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Error de base de datos
  if (error.code === '23505') { // Unique violation
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: 'El recurso ya existe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  if (error.code === '23503') { // Foreign key violation
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Referencia inválida',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Error genérico
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

// Función para cerrar el servidor gracefully
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
