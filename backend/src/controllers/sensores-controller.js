//modificar la temp del ambiente (usando la info procesada por los sensores)

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);


// Obtener datos de los sensores (requiere autenticación)
router.get('/datosSensores', authenticateToken, async (req, res) => {
  const idPlanta = Number(req.query.idPlanta);
  const {email, password} = req.body;
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

    const updateQuery = 'UPDATE "Modulo" SET "IdPlanta" = NULL WHERE "IdPlanta" = $1 RETURNING "ID"';
    const result = await pool.query(updateQuery, [idPlanta]);

    return res.status(StatusCodes.OK).json({ message: 'Módulo desconectado exitosamente', ids: result.rows.map(r => r.ID) });
  } catch (error) {
    console.error('Error en /desconectarModulo:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});
router.post('/subirDatosPlanta', authenticateToken, async (req, res) => {
  const { idPlanta, temperatura, humedad, fecha } = req.body;
  if (!Number.isInteger(idPlanta) || typeof temperatura !== 'number' || typeof humedad !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Parámetros inválidos' });
  }

  try {
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    // Redondear humedad para HumedadDsp (int2)
    const humedadInt = Math.round(humedad);

    // Buscar el último registro de la planta para obtener el valor "antes"
    const lastQuery = `
      SELECT "Temperatura", "HumedadDsp"
      FROM "Registro"
      WHERE "IdPlanta" = $1 AND "Temperatura" IS NOT NULL AND "HumedadDsp" IS NOT NULL
      ORDER BY "Fecha" DESC
      LIMIT 1
    `;
    const lastResult = await pool.query(lastQuery, [idPlanta]);
    let humedadAntes = 0;
    if (lastResult.rows.length > 0) {
      humedadAntes = lastResult.rows[0].HumedadDsp ?? 0;
    }

    const insertQuery = `
      INSERT INTO "Registro" ("IdPlanta", "Temperatura", "HumedadDsp", "Fecha", "HumedadAntes")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const fechaInsertar = fecha ? new Date(fecha) : new Date();
    const result = await pool.query(insertQuery, [idPlanta, temperatura, humedadInt, fechaInsertar, humedadAntes]);
    return res.status(StatusCodes.CREATED).json({ message: 'Datos subidos correctamente', registro: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Ya existe un registro de datos para esta planta en esa fecha.' });
    }
    console.error('Error en /subirDatosPlanta:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});
router.post('/registrarUltRiego', authenticateToken, async (req, res) => {
  const { idPlanta, fecha, duracionRiego } = req.body;
  if (!Number.isInteger(idPlanta) || typeof duracionRiego !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Parámetros inválidos' });
  }

  try {
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    // Insertar registro de riego con duración y valores por defecto para columnas NOT NULL
    const insertQuery = `
      INSERT INTO "Registro" ("IdPlanta", "Fecha", "DuracionRiego", "HumedadAntes")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const fechaInsertar = fecha ? new Date(fecha) : new Date();
    // Puedes ajustar el valor de HumedadAntes según tu lógica
    const result = await pool.query(insertQuery, [idPlanta, fechaInsertar, duracionRiego, 0]);
    return res.status(StatusCodes.CREATED).json({ message: 'Riego registrado correctamente', registro: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Ya existe un registro de riego para esta planta en esa fecha.' });
    }
    console.error('Error en /registrarUltRiego:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});
export default router;
