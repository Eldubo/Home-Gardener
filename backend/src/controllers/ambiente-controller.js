import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

// Validación para nombre no vacío y temperatura número
const isValidString = (str) => typeof str === 'string' && str.trim().length > 0;
const isValidNumber = (num) => typeof num === 'number' && !isNaN(num);

router.post('/agregar', authenticateToken, async (req, res) => {
  let { nombre, temperatura } = req.body;
  const idUsuario = req.user.ID; // uuid del token

  temperatura = Number(temperatura);

  if (!isValidString(nombre) || !isValidNumber(temperatura)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Nombre y temperatura son obligatorios y deben ser válidos',
    });
  }

  try {
    const query = `
      INSERT INTO "Ambiente" ("Nombre", "Temperatura", "IdUsuario")
      VALUES ($1, $2, $3)
      RETURNING "ID"
    `;
    const values = [nombre.trim(), temperatura, idUsuario];

    const result = await pool.query(query, values);

    return res.status(StatusCodes.CREATED).json({
      message: 'Ambiente agregado exitosamente',
      ambienteId: result.rows[0].ID,
    });
  } catch (error) {
    console.error('Error en /ambiente/agregar:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

router.get('/listar', authenticateToken, async (req, res) => {
    const idUsuario = req.user.ID; // uuid del token
  
    try {
      const query = `
        SELECT 
          "A"."ID", 
          "A"."Nombre", 
          "A"."Temperatura", 
          "A"."IdUsuario",
          COALESCE(ARRAY_AGG("P"."Nombre"), '{}') AS "Plantas"  -- Trae las plantas asociadas al ambiente
        FROM "Ambiente" AS "A"
        LEFT JOIN "Planta" AS "P" ON "P"."IdAmbiente" = "A"."ID"  -- Realiza un JOIN con la tabla Planta
        WHERE "A"."IdUsuario" = $1
        GROUP BY "A"."ID"
        ORDER BY "A"."Nombre" ASC
      `;
      const values = [idUsuario];
  
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'No se encontraron ambientes para este usuario',
        });
      }
  
      return res.status(StatusCodes.OK).json({
        message: 'Ambientes obtenidos correctamente',
        ambientes: result.rows,
      });
    } catch (error) {
      console.error('Error en /ambiente/listar:', error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  });
  

  router.put('/editar/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;  // ID del ambiente a editar
    const { nombre } = req.body;  // Nuevo nombre del ambiente
    const idUsuario = req.user.ID; // uuid del token
  
    // Validación del nombre
    if (!isValidString(nombre)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'El nombre del ambiente es obligatorio y debe ser válido',
      });
    }
  
    try {
      // Verificar si el ambiente pertenece al usuario
      const checkQuery = `
        SELECT "ID", "IdUsuario"
        FROM "Ambiente"
        WHERE "ID" = $1
      `;
      const checkResult = await pool.query(checkQuery, [id]);
  
      if (checkResult.rows.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'Ambiente no encontrado',
        });
      }
  
      if (checkResult.rows[0].IdUsuario !== idUsuario) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'No tienes permiso para editar este ambiente',
        });
      }
  
      // Actualizar el nombre del ambiente
      const updateQuery = `
        UPDATE "Ambiente"
        SET "Nombre" = $1
        WHERE "ID" = $2
        RETURNING "ID", "Nombre"
      `;
      const updateValues = [nombre.trim(), id];
  
      const updateResult = await pool.query(updateQuery, updateValues);
  
      return res.status(StatusCodes.OK).json({
        message: 'Ambiente actualizado exitosamente',
        ambiente: updateResult.rows[0],
      });
    } catch (error) {
      console.error('Error en /ambiente/editar/:id:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
    }
  });
  
  
export default router;
