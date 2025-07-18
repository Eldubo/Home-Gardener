import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

// Agregar planta (requiere autenticación)
router.post('/agregar', authenticateToken, async (req, res) => {
  const { nombre, tipo } = req.body;
  const idUsuario = req.user.ID;
  if (!nombre || !tipo) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios' });
  }
  try {
    const query = 'INSERT INTO "Planta" ("Nombre", "Tipo", "IdUsuario") VALUES ($1, $2, $3) RETURNING "ID"';
    const values = [nombre, tipo, idUsuario];
    const result = await pool.query(query, values);
    const newId = result.rows[0]?.ID;
    if (newId > 0) {
      return res.status(StatusCodes.CREATED).json({ message: 'Planta agregada exitosamente', plantaId: newId });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la planta' });
    }
  } catch (error) {
    console.error('Error en /agregar:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Agregar foto a la planta (requiere autenticación)
router.post('/agregarFoto', authenticateToken, async (req, res) => {
  const { foto, id } = req.body;
  if (!foto || !id || typeof id !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios o id no es válido' });
  }
  try {
    const query = 'UPDATE "Planta" SET "Foto" = $1 WHERE "ID" = $2 RETURNING "ID"';
    const values = [foto, id];
    const result = await pool.query(query, values);
    if (result.rows[0]?.id) {
      return res.status(StatusCodes.OK).json({ message: 'Foto agregada' });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la foto' });
    }
  } catch (error) {
    console.error('Error en /agregarFoto:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar foto de la planta (requiere autenticación)
router.post('/actualizarFoto', authenticateToken, async (req, res) => {
  const { foto, idPlanta } = req.body;
  if (!foto || !idPlanta || typeof idPlanta !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios o idPlanta no es válido' });
  }
  try {
    const query = 'UPDATE "Planta" SET "Foto" = $1 WHERE "ID" = $2 RETURNING "ID"';
    const values = [foto, idPlanta];
    const result = await pool.query(query, values);
    if (result.rows[0]?.id) {
      return res.status(StatusCodes.OK).json({ message: 'Foto actualizada' });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo actualizar la foto' });
    }
  } catch (error) {
    console.error('Error en /actualizarFoto:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Listar plantas por usuario (requiere autenticación)
router.get('/', authenticateToken, async (req, res) => {
  const idUsuario = req.user.ID;
  try {
    const query = 'SELECT "ID", "Nombre", "Tipo", "Foto" FROM "Planta" WHERE "IdUsuario" = $1';
    const values = [idUsuario];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.OK).json({ message: 'No hay plantas' });
    }
    return res.status(StatusCodes.OK).json(result.rows);
  } catch (error) {
    console.error('Error en listar plantas:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Modificar nombre de la planta (requiere autenticación)
router.put('/modificarNombre', authenticateToken, async (req, res) => {
  const { idPlanta, nuevoNombre } = req.body;
  if (!idPlanta || typeof idPlanta !== 'number' || !nuevoNombre) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta y nuevoNombre son obligatorios y válidos' });
  }
  try {
    // Solo permite modificar plantas del usuario autenticado
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }
    const query = 'UPDATE "Planta" SET "Nombre" = $1 WHERE "ID" = $2 RETURNING "ID"';
    const values = [nuevoNombre, idPlanta];
    const result = await pool.query(query, values);
    if (result.rows[0]?.id) {
      return res.status(StatusCodes.OK).json({ message: 'Se modificó el nombre' });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo modificar el nombre' });
    }
  } catch (error) {
    console.error('Error en modificar nombre:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Verificar si está conectado a módulo (requiere autenticación)
router.get('/conectadoAModulo', authenticateToken, async (req, res) => {
  const { idPlanta } = req.body;
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

// Obtener tipo de planta (requiere autenticación)
router.get('/tipoPlanta', authenticateToken, async (req, res) => {
  const { idPlanta } = req.body;
  if (!idPlanta || typeof idPlanta !== 'number') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser numérico' });
  }
  try {
    // Solo permite consultar tipo de plantas del usuario autenticado
    const idUsuario = req.user.ID;
    const checkQuery = 'SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2';
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }
    const query = `
    SELECT "TipoEspecifico"."Nombre", "TipoEspecifico"."Grupo" 
    FROM "TipoEspecifico" 
    INNER JOIN "Planta" ON "TipoEspecifico"."Nombre" = "Planta"."Tipo" 
    WHERE "Planta"."ID" = $1
  `;    const result = await pool.query(query, [idPlanta]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay un grupo' });
    }
    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /tipoPlanta:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

export default router;