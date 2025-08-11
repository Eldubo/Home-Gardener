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
  const { nombre, tipo, idAmbiente } = req.body;
  const idUsuario = req.user.ID;

  if (
    !nombre || typeof nombre !== 'string' ||
    !tipo || typeof tipo !== 'string' ||
    !idAmbiente || typeof idAmbiente !== 'number' || !Number.isInteger(idAmbiente) || idAmbiente <= 0
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Nombre, tipo y ambiente son obligatorios y deben ser del tipo de dato correcto' });
  }
  
  try { 
    // Verificar que exista el tipo de planta
    const tipoQuery = `SELECT "Nombre" FROM "TipoEspecifico" WHERE "Nombre" = $1`;
    const tipoResult = await pool.query(tipoQuery, [tipo.trim()]);
    if (tipoResult.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tipo de planta no válido' });
    }
    
    // Verificar que exista el ambiente y que pertenezca al usuario
    const ambienteQuery = `SELECT "Nombre" FROM "Ambiente" WHERE "ID" = $1 AND "IdUsuario" = $2`;
    const ambienteResult = await pool.query(ambienteQuery, [idAmbiente, idUsuario]);
    if (ambienteResult.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Ambiente no encontrado' });
    }

    // Insertar la planta con el idAmbiente correcto
    const query = `INSERT INTO "Planta" ("Nombre", "Tipo", "IdAmbiente") VALUES ($1, $2, $3) RETURNING "ID"`;
    const values = [nombre.trim(), tipo.trim(), idAmbiente];
    const result = await pool.query(query, values);
    
    const newIdRaw = result.rows[0]?.ID || result.rows[0]?.id;
    const newId = parseInt(newIdRaw, 10);

    if (newId && Number.isInteger(newId)) {
      return res.status(StatusCodes.CREATED).json({ message: 'Planta agregada exitosamente', plantaId: newId });
    } else {
      console.warn('No se obtuvo ID válido tras inserción.');
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la planta' });
    }
  } catch (error) {
    console.error('Error en /agregar:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});


// Eliminar planta (requiere autenticación)
router.delete('/eliminar', authenticateToken, async (req, res) => {
  const { idPlanta } = req.body;
  const idUsuario = req.user.ID;

  if (!idPlanta || typeof idPlanta !== 'int') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'El ID de planta es obligatorio y deben ser un número' });
  }

  try {
    //Verificar que exista la planta
    const existenciaQuery = `SELECT * FROM "Planta" WHERE "ID" = $1`;
    const existenciaResult = await pool.query(existenciaQuery, [idPlanta.trim()]);
    if (existenciaResult.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'ID de planta no válido' });
    }

    //Verificar que exista no esté conectada a un módulo
    moduloQuery = `SELECT ID FROM "Modulo" WHERE "IdPlanta" = $1`;
    moduloResult = await pool.query(moduloQuery, [idPlanta.trim()]);
    if (moduloResult.rows.length != 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'La planta tiene un módulo conectado' });
    }

    const query = `DELETE FROM "Planta" WHERE "ID" = $1`;
    const values = [idPlanta];
    const result = await pool.query(query, values);

    console.log('Insert result:', result.rows[0]);

    const newIdRaw = result.rows[0]?.ID || result.rows[0]?.id;
    const newId = parseInt(newIdRaw, 10);

    if (newId && Number.isInteger(newId)) {
      return res.status(StatusCodes.CREATED).json({ message: 'Planta agregada exitosamente', plantaId: newId });
    } else {
      console.warn('No se obtuvo ID válido tras inserción.');
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la planta' });
    }
  } catch (error) {
    console.error('Error en /eliminar:', error);
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

//Cuál es la diferencia entre el ambos IDs enviados?
router.post('/agregarFoto', authenticateToken, (req, res) => upsertFoto(req, res, 'id'));
router.post('/actualizarFoto', authenticateToken, (req, res) => upsertFoto(req, res, 'idPlanta'));

// Listar plantas por usuario (requiere autenticación)
router.get('/', authenticateToken, async (req, res) => {
  const idUsuario = req.user.ID;

  try {
    const query = `
    SELECT "P"."ID", "P"."Nombre", "P"."Tipo", "P"."Foto"
    FROM "Planta" AS "P"
    INNER JOIN "Ambiente" AS "A" ON "P"."IdAmbiente" = "A"."ID"
    WHERE "A"."IdUsuario" = $1
  `;
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
    const checkQuery = `SELECT "ID" FROM "Planta" INNER JOIN "Ambiente" ON "Planta.IdAmbiente" = "Ambiente.ID" WHERE "Planta.ID" = $1 AND "Ambiente.IdUsuario" = $2`;
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
    //Verificar que la planta pertenezca al usuario
    const idUsuario = req.user.ID;
    const checkQuery = `SELECT "ID" FROM "Planta" INNER JOIN "Ambiente" ON "Planta.IdAmbiente" = "Ambiente.ID" WHERE "Planta.ID" = $1 AND "Ambiente.IdUsuario" = $2`;
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
