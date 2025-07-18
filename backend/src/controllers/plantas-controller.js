import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const pool = new Pool(DB_config);

/*
// JWT_SECRET para firmar el token
const JWT_SECRET = process.env.JWT_SECRET || 'clave_supersecreta';
console.log('DB connection config:', {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
*/

// Agregar planta
router.post('/agregar', async (req, res) => {
  const { nombre, tipo, idUsuario } = req.body;

  // Verifica que los campos obligatorios estén presentes
  if (!nombre || !tipo || !idUsuario) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios' });
  }

  try {

    // Consulta para insertar nueva planta
    const query = 'INSERT INTO Planta (Nombre, Tipo, IdUsuario) VALUES ($1, $2, $3) RETURNING id';
    const values = [entity?.nombre ?? '', entity?.tipo ?? '', entity?.idUsuario];

    // Ejecuta la consulta
    const result = await pool.query(query, values);
    const newId = result.rows[0]?.id;

    // Verifica si se insertó correctamente
    if (newId > 0) {
      return res.status(StatusCodes.CREATED).json({
        message: 'Planta agregada exitosamente',
        userId: newId
      });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la planta' });
    }
  } catch (error) {
    console.error('Error en /agregar:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// AgregarFoto
router.post('/agregarFoto', async (req, res) => {
  const { foto, id } = req.body;

  // Verifica que los campos obligatorios estén presentes
  if (!foto) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios' });
  }

  try {

    // Consulta para insertar nueva planta
    const query = 'INSERT INTO Planta (Foto) VALUES ($1) WHERE ID = $2 RETURNING id';
    const values = [foto, id];

    // Ejecuta la consulta
    const result = await pool.query(query, values);

    // Verifica si se insertó correctamente
    if (result.rows[0]?.id) {
      return res.status(StatusCodes.CREATED).json({ message: 'Foto agregada'});
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la foto' });
    }
  } catch (error) {
    console.error('Error en /agregarFoto:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// editar Foto de la planta
router.post('/actualizarFoto', async (req, res) => {
  const { foto, idPlanta } = req.body;

  // Verifica que los campos obligatorios estén presentes
  if (!foto) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios' });
  }

  try {

    // Consulta para insertar nueva planta
    const query = 'UPDATE Planta SET Foto =$1 WHERE IdPlanta = $2 RETURNING id';
    const value = [foto, idPlanta];

    // Ejecuta la consulta
    const result = await pool.query(query, values);

    // Verifica si se insertó correctamente
    if (result.rows[0]?.id) {
      return res.status(StatusCodes.CREATED).json({ message: 'Foto agregada'});
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo agregar la foto' });
    }
  } catch (error) {
    console.error('Error en /agregarFoto:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

//Lista plantas (Nombres)
router.get('/', async (req, res) => {
    const { idUsuario } = req.body;
  
    // Verifica que los campos sean proporcionados
    if (!idUsuario) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idUsuario' });
    }
  
    try {
      const query = 'SELECT Nombre FROM Planta WHERE p.IdUsuario = $1;';
      const values = [idUsuario];


      const result = await pool.query(query, idUsuario);
  
      if (result.rows.length === 0) {
        return res.status(StatusCodes.OK).json({ message: 'No hay plantas' });
      }

    } catch (error) {
      console.error('Error en listar plantas:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
  });

  //modificar Nombre de la planta
  router.put('/modificarNombre', async (req, res) => {
    const { idPlanta, nuevoNombre } = req.body;
  
    // Verifica que los campos sean proporcionados
    if (!idPlanta || !nuevoNombre) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idPlanta o el nuevoNombre' });
    }else if(Number.isInteger(idPlanta)){
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'idPlanta no es válido' });
    }
  
    try {
      const query = 'UPDATE Planta SET Nombre =$1 WHERE IdPlanta = $2 RETURNING id;';
      const values = [nuevoNombre, idPlanta];


      const result = await pool.query(query, values);
  
      if (result.rows[0]?.id) {
        return res.status(StatusCodes.OK).json({ message: 'Se modificó el nombre' });
      }else{
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo modificar el nombre' });
      }

    } catch (error) {
      console.error('Error en listar plantas:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
  });

//Si está conectado a módulo 
router.get('/conectadoAModulo', async (req, res) => {
  const { idPlanta } = req.body;

  // Verifica que los campos sean proporcionados
  if (!idPlanta) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idPlanta' });
  }

  try {
    const query = 'SELECT ID FROM Modulo WHERE IdPlanta = $1';
    const result = await pool.query(query, idPlanta);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No hay un módulo conectado' });
    }
  } catch (error) {
    console.error('Error en /datos:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});



//Obtener tipo de planta
router.get('/tipoPlanta', async (req, res) => {
  const { idPlanta } = req.body;

  // Verifica que los campos sean proporcionados
  if (!idPlanta) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idPlanta' });
  }

  try {
    const query = 'SELECT TipoEspecifico.Nombre, TipoEspecifico.Grupo FROM TipoEspecifico INNER JOIN Planta ON TipoEspecifico.Nombre = Planta.Tipo WHERE Planta.ID = $1';
    const result = await pool.query(query, idPlanta);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No hay un grupo' });
    }
  } catch (error) {
    console.error('Error en /tipoPlanta:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;