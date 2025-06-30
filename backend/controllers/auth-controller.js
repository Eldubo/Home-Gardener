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
// Registro
router.post('/register', async (req, res) => {
  const { nombre, email, password, direccion } = req.body;

  // Verifica que los campos obligatorios estén presentes
  if (!email || !password || !direccion) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Consulta para insertar el nuevo usuario
    const query = 'INSERT INTO Usuario (nombre, email, password, direccion) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [entity?.nombre ?? '', entity?.email.toLowerCase() ?? '', hashedPassword, entity?.direccion];

    // Ejecuta la consulta
    const result = await pool.query(query, values);
    const newId = result.rows[0]?.id;

    // Verifica si se insertó correctamente
    if (newId > 0) {
      return res.status(StatusCodes.CREATED).json({
        message: 'Usuario registrado exitosamente',
        userId: newId
      });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo registrar el usuario' });
    }
  } catch (error) {
    console.error('Error en /register:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Verifica que los campos sean proporcionados
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email y contraseña requeridos' });
  }

  try {
    // Consulta para buscar al usuario por su email
    const query = 'SELECT * FROM Usuario WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);

    // Si el usuario no existe, retorna un error
    if (result.rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
    }

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
