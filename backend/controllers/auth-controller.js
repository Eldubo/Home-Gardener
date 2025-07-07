import dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from './../configs/db_configs.js';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const pool = new Pool(DB_config);

const JWT_SECRET = process.env.JWT_SECRET || 'clave_supersecreta';

console.log('DB connection config:', DB_config);

// Registro
router.post('/register', async (req, res) => {
  const { nombre = '', email = '', password = '', direccion = '' } = req.body;

  if (!email || !password || !direccion) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    //const query = 'INSERT INTO Usuario (nombre, email, password, direccion) VALUES ($1, $2, $3, $4) RETURNING id';
    //const values = [nombre, email.toLowerCase(), hashedPassword, direccion];

    const query = "INSERT INTO Usuario (nombre, email, password, direccion) VALUES ('1', '2', '3', '4') RETURNING id";
    const values = [];
   /* INSERT INTO public."Usuario"(
      "Password", "Email", "Direccion", "Nombre", "Foto"
  ) VALUES ('1', '2', '3', '4', '5'); */

    const result = await pool.query(query, values);
    const newId = result.rows[0]?.id;

    if (newId) {
      return res.status(StatusCodes.CREATED).json({
        message: 'Usuario registrado exitosamente',
        userId: newId
      });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo registrar el usuario' });
    }
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email y contraseña requeridos' });
  }

  try {
    const query = 'SELECT * FROM Usuario WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
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
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

// Actualizar usuario
router.put('/user/:id', async (req, res) => {
  const userId = req.params.id;
  let { nombre, email, password, direccion } = req.body;

  if (!userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'ID de usuario requerido' });
  }

  try {
    // Primero verificamos que el usuario exista
    const userCheck = await pool.query('SELECT * FROM Usuario WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Usuario no encontrado' });
    }

    // Si envían contraseña, la hasheamos
    if (password) {
      password = await bcrypt.hash(password, 10);
    }

    // Construimos la consulta dinámicamente para actualizar solo los campos enviados
    const fields = [];
    const values = [];
    let idx = 1;

    if (nombre !== undefined) {
      fields.push(`nombre = $${idx++}`);
      values.push(nombre);
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(email.toLowerCase());
    }
    if (password !== undefined) {
      fields.push(`password = $${idx++}`);
      values.push(password);
    }
    if (direccion !== undefined) {
      fields.push(`direccion = $${idx++}`);
      values.push(direccion);
    }

    if (fields.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se enviaron campos para actualizar' });
    }

    values.push(userId); // último parámetro para WHERE id = $n
    const query = `UPDATE Usuario SET ${fields.join(', ')} WHERE id = $${idx}`;

    await pool.query(query, values);

    return res.status(StatusCodes.OK).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error en /user/:id:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
