
import { Pool } from 'pg';
import DB_config from '../configs/db_configs.js';

const pool = new Pool(DB_config);

export default class sensoresRepository {

};

/*
import { Pool } from 'pg';
import DB_config from '../configs/db_configs.js';

const pool = new Pool(DB_config);

export default class RegistroRepository {
  async validarPropietario(idPlanta, idUsuario) {
    const query = `
      SELECT p."ID"
      FROM "Planta" p
      JOIN "Ambiente" a ON p."IdAmbiente" = a."ID"
      WHERE p."ID" = $1 AND a."IdUsuario" = $2
    `;
    const result = await pool.query(query, [idPlanta, idUsuario]);
    return result.rows.length > 0;
  }

  async obtenerUltimoRegistroSensor(idPlanta) {
    const query = `
      SELECT "Temperatura", "HumedadDsp", "Fecha"
      FROM "Registro"
      WHERE "IdPlanta" = $1
      ORDER BY "Fecha" DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [idPlanta]);
    return result.rows[0] || null;
  }

  async obtenerUltimoRiego(idPlanta) {
    const query = `
      SELECT MAX("Fecha") AS "UltimaFechaRiego" 
      FROM "Registro"
      WHERE "DuracionRiego" IS NOT NULL AND "IdPlanta" = $1
    `;
    const result = await pool.query(query, [idPlanta]);
    return result.rows[0]?.UltimaFechaRiego ? result.rows[0] : null;
  }

  async verificarModulo(idModulo) {
    const query = 'SELECT "ID" FROM "Modulo" WHERE "ID" = $1';
    const result = await pool.query(query, [idModulo]);
    return result.rows[0] || null;
  }

  async conectarModulo(idModulo, idPlanta) {
    const query = 'UPDATE "Modulo" SET "IdPlanta" = $2 WHERE "ID" = $1 RETURNING "ID"';
    const result = await pool.query(query, [idModulo, idPlanta]);
    return result.rows[0];
  }

  async obtenerModulosDePlanta(idPlanta) {
    const query = 'SELECT "ID" FROM "Modulo" WHERE "IdPlanta" = $1';
    const result = await pool.query(query, [idPlanta]);
    return result.rows;
  }

  async desconectarModulo(idPlanta) {
    const query = 'UPDATE "Modulo" SET "IdPlanta" = NULL WHERE "IdPlanta" = $1 RETURNING "ID"';
    const result = await pool.query(query, [idPlanta]);
    return result.rows;
  }

  async obtenerUltimaHumedad(idPlanta) {
    const query = `
      SELECT "HumedadDsp"
      FROM "Registro"
      WHERE "IdPlanta" = $1 AND "HumedadDsp" IS NOT NULL
      ORDER BY "Fecha" DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [idPlanta]);
    return result.rows.length > 0 ? result.rows[0].HumedadDsp : 0;
  }

  async insertarDatosPlanta(idPlanta, temperatura, humedad, fecha, humedadAntes) {
    const fechaInsertar = fecha ? new Date(fecha) : new Date();
    const query = `
      INSERT INTO "Registro" ("IdPlanta", "Temperatura", "HumedadDsp", "Fecha", "HumedadAntes")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [idPlanta, temperatura, humedad, fechaInsertar, humedadAntes]);
    return result.rows[0];
  }

  async insertarUltimoRiego(idPlanta, fecha, duracionRiego) {
    const fechaInsertar = fecha ? new Date(fecha) : new Date();
    const query = `
      INSERT INTO "Registro" ("IdPlanta", "Fecha", "DuracionRiego", "HumedadAntes")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [idPlanta, fechaInsertar, duracionRiego, 0]);
    return result.rows[0];
  }
}

*/