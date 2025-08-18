import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthService from '../services/auth-service.js';
import authenticateToken from '../middlewares/auth.js';

const router = Router();

const authService = new AuthService();
// Registro
router.post('/register', async (req, res) => {
  try {
    const { user, token } = await AuthService.register(req.body);
    res.status(StatusCodes.CREATED).json({ message: 'Usuario registrado exitosamente', user, token });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.BAD_REQUEST;  // 500 por defecto

        res.status(statusCode).json({
            success: false,
            message: error.message,
            token: ''
        });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.status(StatusCodes.OK).json({ message: 'Login exitoso', user, token });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.BAD_REQUEST;  // 500 por defecto

    res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
    });
    //res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
  }
});

// Perfil
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.ID);
    res.status(StatusCodes.OK).json({ message: 'Perfil obtenido exitosamente', user });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
  }
});

// Actualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.ID, req.body);
    res.status(StatusCodes.OK).json({ message: 'Usuario actualizado exitosamente', user });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
});

export default router;



/*
import dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import DB_config from '../../configs/db_configs.js';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authenticateToken from '../middlewares/auth.js';

const router = Router();
const pool = new Pool(DB_config);

const JWT_SECRET = process.env.JWT_SECRET || 'clave_supersecreta';

// Validaciones
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

// Registro
router.post('/register', async (req, res) => {
  const { nombre = '', email = '', password = '', direccion = '' } = req.body;
  if (!email || !password || !direccion) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email, contraseña y dirección son campos obligatorios' });
  }
  if (!validateEmail(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Formato de email inválido' });
  }
  if (!validatePassword(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'La contraseña debe tener al menos 8 caracteres, una letra y un número' });
  }
  if (nombre.length < 2) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'El nombre debe tener al menos 2 caracteres' });
  }
  try {
    const existingUser = await pool.query('SELECT "ID" FROM "Usuario" WHERE "Email" = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO "Usuario" ("Nombre", "Email", "Password", "Direccion") VALUES ($1, $2, $3, $4) RETURNING "ID", "Nombre", "Email", "Direccion"';
    const values = [nombre.trim(), email.toLowerCase().trim(), hashedPassword, direccion.trim()];
    const result = await pool.query(query, values);
    const newUser = result.rows[0];
    if (newUser) {
      const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });
      return res.status(StatusCodes.CREATED).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          email: newUser.email,
          direccion: newUser.direccion
        }
      });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo registrar el usuario' });
    }
  } catch (error) {
    console.error('Error en /register:', error.stack || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body;
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email y contraseña son requeridos' });
  }
  if (!validateEmail(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Formato de email inválido' });
  }
  try {
    const query = 'SELECT "ID", "Nombre", "Email", "Password", "Direccion" FROM "Usuario" WHERE "Email" = $1';
    const result = await pool.query(query, [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({
      ID: user.ID,
      nombre: user.Nombre,
      email: user.Email,
      direccion: user.Direccion
    }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(StatusCodes.OK).json({
      message: 'Login exitoso',
      token,
      user: {
        ID: user.ID,
        nombre: user.Nombre,
        email: user.Email,
        direccion: user.Direccion
      }
    });
  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario (requiere autenticación)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT "ID", "Nombre", "Email", "Direccion" FROM "Usuario" WHERE "ID" = $1';
    const result = await pool.query(query, [req.user.ID]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Usuario no encontrado' });
    }
    return res.status(StatusCodes.OK).json({
      message: 'Perfil obtenido exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error en /profile:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar usuario (requiere autenticación)
router.put('/profile', authenticateToken, async (req, res) => {
  let { nombre, email, password, direccion } = req.body;
  try {
    const userCheck = await pool.query('SELECT * FROM "Usuario" WHERE "ID" = $1', [req.user.ID]);
    if (userCheck.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Usuario no encontrado' });
    }
    if (email && !validateEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Formato de email inválido' });
    }
    if (password && !validatePassword(password)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'La contraseña debe tener al menos 8 caracteres, una letra y un número' });
    }
    if (nombre && nombre.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'El nombre debe tener al menos 2 caracteres' });
    }
    let updateFields = [];
    let updateValues = [];
    if (nombre) {
      updateFields.push('"Nombre" = $' + (updateValues.length + 1));
      updateValues.push(nombre);
    }
    if (email) {
      updateFields.push('"Email" = $' + (updateValues.length + 1));
      updateValues.push(email.toLowerCase().trim());
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('"Password" = $' + (updateValues.length + 1));
      updateValues.push(hashedPassword);
    }
    if (direccion) {
      updateFields.push('"Direccion" = $' + (updateValues.length + 1));
      updateValues.push(direccion.trim());
    }
    if (updateFields.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No hay campos para actualizar' });
    }
    updateValues.push(req.user.ID);
    const updateQuery = `UPDATE "Usuario" SET ${updateFields.join(', ')} WHERE "ID" = $${updateValues.length} RETURNING "ID", "Nombre", "Email", "Direccion"`;
    const result = await pool.query(updateQuery, updateValues);
    return res.status(StatusCodes.OK).json({
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error en /profile (PUT):', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
  }
});

export default router;
*/