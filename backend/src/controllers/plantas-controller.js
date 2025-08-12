import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

// Validación genérica para números enteros positivos
const isValidId = (value) => Number.isInteger(value) && value > 0;

// ✅ Agregar planta
router.post('/agregar', authenticateToken, async (req, res) => {
  let { nombre, tipo, idAmbiente } = req.body;
  const idUsuario = req.user.ID;

  idAmbiente = Number(idAmbiente); // Convertir a número

  if (
    !nombre || typeof nombre !== 'string' ||
    !tipo || typeof tipo !== 'string' ||
    !isValidId(idAmbiente)
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Nombre, tipo y ambiente son obligatorios y deben ser del tipo de dato correcto'
    });
  }

  try {
    // Verificar tipo de planta
    const tipoQuery = `SELECT "Nombre" FROM "TipoEspecifico" WHERE "Nombre" = $1`;
    const tipoResult = await pool.query(tipoQuery, [tipo.trim()]);
    if (tipoResult.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tipo de planta no válido' });
    }

    // Verificar ambiente
    const ambienteQuery = `SELECT "Nombre" FROM "Ambiente" WHERE "ID" = $1 AND "IdUsuario" = $2`;
    const ambienteResult = await pool.query(ambienteQuery, [idAmbiente, idUsuario]);
    if (ambienteResult.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Ambiente no encontrado' });
    }

    // Insertar planta
    const query = `INSERT INTO "Planta" ("Nombre", "Tipo", "IdAmbiente") VALUES ($1, $2, $3) RETURNING "ID"`;
    const values = [nombre.trim(), tipo.trim(), idAmbiente];
    const result = await pool.query(query, values);

    return res.status(StatusCodes.CREATED).json({
      message: 'Planta agregada exitosamente',
      plantaId: result.rows[0].ID
    });
  } catch (error) {
    console.error('Error en /agregar:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ✅ Eliminar planta
router.delete('/eliminar', authenticateToken, async (req, res) => {
  let { idPlanta } = req.body;
  const idUsuario = req.user.ID;

  idPlanta = Number(idPlanta);

  if (!isValidId(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'El ID de planta es obligatorio y debe ser un número válido' });
  }

  try {
    // Verificar que exista y pertenezca al usuario
    const existenciaQuery = `
      SELECT "P"."ID"
      FROM "Planta" AS "P"
      INNER JOIN "Ambiente" AS "A" ON "P"."IdAmbiente" = "A"."ID"
      WHERE "P"."ID" = $1 AND "A"."IdUsuario" = $2
    `;
    const existenciaResult = await pool.query(existenciaQuery, [idPlanta, idUsuario]);
    if (existenciaResult.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Planta no encontrada o sin permiso para eliminarla' });
    }

    // Verificar que no tenga módulo
    const moduloQuery = `SELECT "ID" FROM "Modulo" WHERE "IdPlanta" = $1`;
    const moduloResult = await pool.query(moduloQuery, [idPlanta]);
    if (moduloResult.rows.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'La planta tiene un módulo conectado' });
    }

    // Eliminar
    await pool.query(`DELETE FROM "Planta" WHERE "ID" = $1`, [idPlanta]);
    return res.status(StatusCodes.OK).json({ message: 'Planta eliminada exitosamente' });
  } catch (error) {
    console.error('Error en /eliminar:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ✅ Subir o actualizar foto de planta
router.post('/actualizarFoto', authenticateToken, async (req, res) => {
  let { foto, idPlanta } = req.body;
  idPlanta = Number(idPlanta);

  if (!foto || !isValidId(idPlanta)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Foto y idPlanta son obligatorios' });
  }

  try {
    const checkQuery = `SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2`;
    const checkResult = await pool.query(checkQuery, [idPlanta, req.user.ID]);
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para actualizar esta planta' });
    }

    const updateQuery = `UPDATE "Planta" SET "Foto" = $1 WHERE "ID" = $2 RETURNING "ID", "Foto"`;
    const result = await pool.query(updateQuery, [foto.trim(), idPlanta]);

    return res.status(StatusCodes.OK).json({ message: 'Foto de la planta actualizada exitosamente', foto: result.rows[0].Foto });
  } catch (error) {
    console.error('Error en /actualizarFoto:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ✅ Listar plantas
router.get('/misPlantas', authenticateToken, async (req, res) => {
  const idUsuario = req.user.ID;

  try {
    const query = `
      SELECT "P"."ID", "P"."Nombre", "P"."Tipo", "P"."Foto", "A"."Nombre" AS "Ambiente"
      FROM "Planta" AS "P"
      INNER JOIN "Ambiente" AS "A" ON "P"."IdAmbiente" = "A"."ID"
      WHERE "A"."IdUsuario" = $1
    `;
    const result = await pool.query(query, [idUsuario]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No tienes plantas asociadas' });
    }

    return res.status(StatusCodes.OK).json(result.rows);
  } catch (error) {
    console.error('Error en /misPlantas:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// ✅ Modificar nombre de planta
router.put('/modificarNombre', authenticateToken, async (req, res) => {
  let { idPlanta, nuevoNombre } = req.body;
  idPlanta = Number(idPlanta);

  if (!isValidId(idPlanta) || !nuevoNombre || typeof nuevoNombre !== 'string') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta y nuevoNombre son obligatorios y deben ser válidos' });
  }

  try {
    const idUsuario = req.user.ID;
    const checkQuery = `
      SELECT "P"."ID"
      FROM "Planta" AS "P"
      INNER JOIN "Ambiente" AS "A" ON "P"."IdAmbiente" = "A"."ID"
      WHERE "P"."ID" = $1 AND "A"."IdUsuario" = $2
    `;
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);

    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    await pool.query(`UPDATE "Planta" SET "Nombre" = $1 WHERE "ID" = $2`, [nuevoNombre.trim(), idPlanta]);
    return res.status(StatusCodes.OK).json({ message: 'Se modificó el nombre exitosamente' });
  } catch (error) {
    console.error('Error en modificar nombre:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

export default router;
