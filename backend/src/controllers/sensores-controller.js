import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

// Obtener datos de los sensores (requiere autenticación)
router.get('/datosSensores', authenticateToken, async (req, res) => {
  const idPlanta = Number(req.query.idPlanta);
  if (!Number.isInteger(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }

  try {
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
    `;
    const result = await pool.query(query, [idPlanta]);
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
  const idPlanta = Number(req.query.idPlanta);
  if (!Number.isInteger(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }

  try {
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
    `;
    const result = await pool.query(query, [idPlanta]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay registros de riego para esta planta' });
    }
    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /ultRiego:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Conectar módulo (PUT)
router.put('/conectarModulo', authenticateToken, async (req, res) => {
  const { idPlanta, idModulo } = req.body;
  if (!Number.isInteger(idPlanta) || !Number.isInteger(idModulo)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Los parámetros son obligatorios y deben ser numéricos' });
  }

  try {
    // Verificar que el módulo exista
    const checkQuery = 'SELECT "ID" FROM "Modulo" WHERE "ID" = $1';
    const checkResult = await pool.query(checkQuery, [idModulo]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No se encuentra el módulo' });
    }

    // Conectar el módulo a la planta
    const query = 'UPDATE "Modulo" SET "IdPlanta" = $2 WHERE "ID" = $1 RETURNING "ID"';
    const result = await pool.query(query, [idModulo, idPlanta]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No se pudo conectar el módulo' });
    }

    return res.status(StatusCodes.OK).json({ message: 'Módulo conectado exitosamente', id: result.rows[0].ID });
  } catch (error) {
    console.error('Error en /conectarModulo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Desconectar módulo (DELETE)
router.delete('/desconectarModulo', authenticateToken, async (req, res) => {
  const { idPlanta } = req.body;
  if (!Number.isInteger(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }

  try {
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    // Verificar si hay módulo conectado
    const checkModuloQuery = 'SELECT "ID" FROM "Modulo" WHERE "IdPlanta" = $1';
    const checkModuloResult = await pool.query(checkModuloQuery, [idPlanta]);
    if (checkModuloResult.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay un módulo conectado a esta planta' });
    }

    // Desconectar el módulo (setear IdPlanta a NULL)
    const updateQuery = 'UPDATE "Modulo" SET "IdPlanta" = NULL WHERE "IdPlanta" = $1 RETURNING "ID"';
    const result = await pool.query(updateQuery, [idPlanta]);

    return res.status(StatusCodes.OK).json({ message: 'Módulo desconectado exitosamente', ids: result.rows.map(r => r.ID) });
  } catch (error) {
    console.error('Error en /desconectarModulo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

export default router;
