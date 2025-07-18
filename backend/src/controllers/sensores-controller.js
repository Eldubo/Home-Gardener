import e, { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

// Obtener datos de los sensores (requiere autenticación)
router.get('/datosSensores', authenticateToken, async (req, res) => {
  const { idPlanta } = req.body;
  if (!idPlanta || typeof idPlanta !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }
  try {
    // Opcional: Validar que la planta pertenezca al usuario autenticado
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }
    const query = `
    SELECT "TemperaturaDsp", "HumedadDsp", "Fecha" 
    FROM "Registro" 
    WHERE "IdPlanta" = $1 
    ORDER BY "Fecha" DESC 
    LIMIT 1
  `;    const result = await pool.query(query, [idPlanta]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay mediciones para esta planta' });
    }
    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /datosSensores:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Obtener último riego (requiere autenticación)
router.get('/ultRiego', authenticateToken, async (req, res) => {
  const { idPlanta } = req.body;
  if (!idPlanta || typeof idPlanta !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }
  try {
    // Opcional: Validar que la planta pertenezca al usuario autenticado
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }
    const query = `
    SELECT MAX("Fecha") AS "UltimaFechaRiego" 
    FROM "Registro" 
    WHERE "DuracionRiego" IS NOT NULL AND "IdPlanta" = $1 
    GROUP BY "IdPlanta"
  `;    const result = await pool.query(query, [idPlanta]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay registros de riego para esta planta' });
    }
    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /ultRiego:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Conectar módulo 
//ADSIGNAR BIEN AL DIVIDIR EN REPOSITORIES, SERVICES Y CONTROLLERS --> VA A SER PUT O POST DEPENDIENDO DE SI ESTÁ O NO REGISTRADO ESE MODULO
router.put('/conectarModulo', authenticateToken, async (req, res) => {
  const { idPlanta, idModulo } = req.body;
  if (!idPlanta || typeof idPlanta !== 'number' || !idModulo || typeof idModulo !== 'number') {
    
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Los parámetros son obligatorios y deben ser numérico' });
  }
  try {
//Verificar q esté el módulo cargado en la bd 
//Enlazar 

    //const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID"  FROM "Modulo" WHERE "ID" = $1 ';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) { 
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No se encuentra el módulo' });
    }
    
    const query = 'UPDATE "Modulo" SET "IdPlanta" = $2 WHERE "ID" = $1 RETURNING "ID"';
    const result = await pool.query(query, [idModulo, idPlanta]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No pudo conectar el módulo' });
    }
    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /conectadoAModulo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});


// desconectar módulo (requiere autenticación)
router.delete('/desconectarModulo', authenticateToken, async (req, res) => {
  const { idPlanta, idModulo } = req.body;
  if (!idPlanta || typeof idPlanta !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }
  try {
    // Solo permite consultar módulos de plantas del usuario autenticado
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }
    const query = 'SELECT "ID" FROM "Modulo" WHERE "IdPlanta" = $1';
    const result = await pool.query(query, [idPlanta]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay un módulo conectado' });
    }
    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /conectadoAModulo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

export default router;