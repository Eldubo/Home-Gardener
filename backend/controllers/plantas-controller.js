import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from './../configs/db_configs.js';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const pool = new Pool(DB_config);

// JWT_SECRET para firmar el token
const JWT_SECRET = process.env.JWT_SECRET || 'clave_supersecreta';
console.log('DB connection config:', {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
// Agregar
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

//Lista plantas
router.get('/', async (req, res) => {
    const { idUsuario } = req.body;
  
    // Verifica que los campos sean proporcionados
    if (!idPlanta) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idPlanta' });
    }
  
    try {
      //Registro.TemperaturaDsp, Registro.HumedadDsp 
      // Consulta para buscar al usuario por su email
      const query = 'SELECT Nombre, Tipo FROM Planta WHERE IdUsuario = $1';
      const values = [idUsuario];


      const result = await pool.query(query, [email.toLowerCase()]);
  
      // Si el usuario no existe, retorna un error
      if (result.rows.length === 0) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
      }
  
  
  
      return res.status(StatusCodes.OK).json({
          message: 'Login exitoso',
          token,
          user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            direccion: user.direccion
          }
        });
  
      const user = result.rows[0];
  
      // Compara la contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
      }
  
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  
      return res.status(StatusCodes.OK).json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          direccion: user.direccion
        }
      });
    } catch (error) {
      console.error('Error en /login:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
  });

// Mostrar datos de tabla planta
router.get('/datos', async (req, res) => {
  const { idPlanta, idUsuario } = req.body;

  // Verifica que los campos sean proporcionados
  if (!idPlanta) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se envía el idPlanta' });
  }

  try {
    //Registro.TemperaturaDsp, Registro.HumedadDsp 
    // Consulta para buscar al usuario por su email
    const query = 'SELECT Nombre, Tipo FROM Planta WHERE IdUsuario = $1';
    const result = await pool.query(query, [email.toLowerCase()]);

    // Si el usuario no existe, retorna un error
    if (result.rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
    }



    return res.status(StatusCodes.OK).json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          direccion: user.direccion
        }
      });

    const user = result.rows[0];

    // Compara la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(StatusCodes.OK).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        direccion: user.direccion
      }
    });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
