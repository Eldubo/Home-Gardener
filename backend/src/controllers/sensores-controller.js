import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const pool = new Pool(DB_config);

//Preguntas
//Envían idModulo o idPlanta?

// Obtener   datos de los sensores
router.get('/datosSensores', async (req, res) => {
    const { idPlanta } = req.body;
  
    // Verifica que los campos sean proporcionados
    if (!idPlanta) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idPlanta' });
    }
  
    try {
      const query = 'SELECT TOP 1 "TemperaturaDsp", "HumedadDsp", "Fecha" FROM Registro WHERE IdPlanta = $1 ORDER BY Registro.Fecha DESC';
      const result = await pool.query(query, idPlanta);
  
      if (result.rows.length === 0) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No hay mediciones' });
      }
    } catch (error) {
      console.error('Error en /datos:', error);
  
      res.status(StatusC odes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
  });
  

  
  //Obtener Último riego
  router.get('/ultRiego', async (req, res) => {
    const { idPlanta } = req.body;
  
    // Verifica que los campos sean proporcionados
    if (!idPlanta) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idPlanta' });
    }else if(Number.isInteger(idPlanta)){
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta no es válido' });
    }
  
    try {
      const query = 'SELECT MAX(Fecha) AS UltimaFechaRiego FROM Registro WHERE DuracionRiego IS NOT NULL AND IdPlanta = $1 GROUP BY IdPlanta;';
      const values = [idPlanta];


      const result = await pool.query(query, idUsuario);
  
      if (result.rows.length === 0) {
        return res.status(StatusCodes.OK).json({ message: 'No hay plantas' });
      }

    } catch (error) {
      console.error('Error en listar plantas:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
  });