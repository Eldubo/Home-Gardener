import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

// Validación genérica para números enteros positivos
const isValidId = (value) => Number.isInteger(value) && value > 0;

// Agregar planta (requiere autenticación)
router.post('/agregar', authenticateToken, async (req, res) => {
  const { nombre, tipo } = req.body;
  const idUsuario = req.user.ID;

  if (!nombre || typeof nombre !== 'string' || !tipo || typeof tipo !== 'string') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Nombre y tipo son obligatorios y deben ser cadenas' });
  }

  try {
    // Validar que el tipo existe en TipoEspecifico
    const tipoQuery = `SELECT "Nombre" FROM "TipoEspecifico" WHERE "Nombre" = $1`;
    const tipoResult = await pool.query(tipoQuery, [tipo.trim()]);

    if (tipoResult.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tipo de planta no válido' });
    }

    const query = `INSERT INTO "Planta" ("Nombre", "Tipo", "IdUsuario") VALUES ($1, $2, $3) RETURNING "ID"`;
    const values = [nombre.trim(), tipo.trim(), idUsuario];
    const result = await pool.query(query, values);

    const newId = result.rows[0]?.ID;
    if (isValidId(newId)) {
      return res.status(StatusCodes.CREATED).json({ message: 'Planta agregada exitosamente', plantaId: newId });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la planta' });
    }
  } catch (error) {
    console.error('Error en /agregar:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});


// Agregar o actualizar foto de la planta (requiere autenticación)
const upsertFoto = async (req, res, idField) => {
  const { foto } = req.body;
  const id = req.body[idField];

  if (!foto || typeof foto !== 'string' || !isValidId(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Foto es obligatoria y el ID debe ser un número entero válido' });
  }

  try {
    const query = `UPDATE "Planta" SET "Foto" = $1 WHERE "ID" = $2 RETURNING "ID"`;
    const result = await pool.query(query, [foto.trim(), id]);

    if (result.rows.length > 0) {
      const action = idField === 'idPlanta' ? 'actualizada' : 'agregada';
      return res.status(StatusCodes.OK).json({ message: `Foto ${action} exitosamente` });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo modificar la foto' });
    }
  } catch (error) {
    console.error(`Error en /${req.path}:`, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
};

router.post('/agregarFoto', authenticateToken, (req, res) => upsertFoto(req, res, 'id'));
router.post('/actualizarFoto', authenticateToken, (req, res) => upsertFoto(req, res, 'idPlanta'));

// Listar plantas por usuario (requiere autenticación)
router.get('/', authenticateToken, async (req, res) => {
  const idUsuario = req.user.ID;

  try {
    const query = `SELECT "ID", "Nombre", "Tipo", "Foto" FROM "Planta" WHERE "IdUsuario" = $1`;
    const result = await pool.query(query, [idUsuario]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.OK).json({ message: 'No hay plantas para este usuario' });
    }

    return res.status(StatusCodes.OK).json(result.rows);
  } catch (error) {
    console.error('Error en listar plantas:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Modificar nombre de la planta (requiere autenticación)
router.put('/modificarNombre', authenticateToken, async (req, res) => {
  const { idPlanta, nuevoNombre } = req.body;

  if (!isValidId(idPlanta) || !nuevoNombre || typeof nuevoNombre !== 'string') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta y nuevoNombre son obligatorios y deben ser válidos' });
  }

  try {
    const idUsuario = req.user.ID;
    const checkQuery = `SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2`;
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);

    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para modificar esta planta' });
    }

    const query = `UPDATE "Planta" SET "Nombre" = $1 WHERE "ID" = $2 RETURNING "ID"`;
    const result = await pool.query(query, [nuevoNombre.trim(), idPlanta]);

    if (result.rows.length > 0) {
      return res.status(StatusCodes.OK).json({ message: 'Se modificó el nombre exitosamente' });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo modificar el nombre' });
    }
  } catch (error) {
    console.error('Error en modificar nombre:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Verificar si está conectado a módulo (requiere autenticación)
router.get('/conectadoAModulo', authenticateToken, async (req, res) => {
  const { idPlanta } = req.query;

  if (!isValidId(Number(idPlanta))) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser un número entero válido' });
  }

  try {
    const idUsuario = req.user.ID;
    const checkQuery = `SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2`;
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);

    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }

    const query = `SELECT "ID" FROM "Modulo" WHERE "IdPlanta" = $1`;
    const result = await pool.query(query, [idPlanta]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No hay un módulo conectado a esta planta' });
    }

    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /conectadoAModulo:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Obtener tipo de planta (requiere autenticación)
router.get('/tipoPlanta', authenticateToken, async (req, res) => {
  const { idPlanta } = req.query;

  if (!isValidId(Number(idPlanta))) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta es obligatorio y debe ser un número entero válido' });
  }

  try {
    const idUsuario = req.user.ID;
    const checkQuery = `SELECT "ID" FROM "Planta" WHERE "ID" = $1 AND "IdUsuario" = $2`;
    const checkResult = await pool.query(checkQuery, [idPlanta, idUsuario]);

    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'No tienes permiso para consultar esta planta' });
    }

    const query = `
      SELECT "TipoEspecifico"."Nombre", "TipoEspecifico"."Grupo" 
      FROM "TipoEspecifico" 
      INNER JOIN "Planta" ON "TipoEspecifico"."Nombre" = "Planta"."Tipo" 
      WHERE "Planta"."ID" = $1
    `;

    const result = await pool.query(query, [idPlanta]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No se encontró información del grupo' });
    }

    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /tipoPlanta:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

export default router;
