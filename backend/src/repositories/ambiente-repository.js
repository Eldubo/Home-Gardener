import { Pool } from 'pg';
import DB_config from '../configs/db_configs.js';

const pool = new Pool(DB_config);

export default class AmbienteRepository {
  async create(nombre, temperatura, idUsuario) {
    const query = `
      INSERT INTO "Ambiente" ("Nombre", "Temperatura", "IdUsuario")
      VALUES ($1, $2, $3)
      RETURNING "ID"
    `;
    const values = [nombre, temperatura, idUsuario];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getAllByUserId(idUsuario) {
    const query = `
      SELECT 
        "A"."ID", 
        "A"."Nombre", 
        "A"."Temperatura", 
        "A"."IdUsuario",
        COALESCE(ARRAY_AGG("P"."Nombre"), '{}') AS "Plantas" -- Trae las plantas asociadas al ambiente
      FROM "Ambiente" AS "A"
      LEFT JOIN "Planta" AS "P" ON "P"."IdAmbiente" = "A"."ID"
      WHERE "A"."IdUsuario" = $1
      GROUP BY "A"."ID"
      ORDER BY "A"."Nombre" ASC
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows;
  }

  async findById(id) {
    const query = `SELECT "ID", "IdUsuario" FROM "Ambiente" WHERE "ID" = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async updateNombre(id, nombre) {
    const query = `
      UPDATE "Ambiente"
      SET "Nombre" = $1
      WHERE "ID" = $2
      RETURNING "ID", "Nombre"
    `;
    const result = await pool.query(query, [nombre, id]);
    return result.rows[0];
  }
}
