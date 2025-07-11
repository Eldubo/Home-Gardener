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

// Validaciones
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

console.log('DB connection config:', DB_config);

// Registro
router.post('/register', async (req, res) => {
  const { nombre = '', email = '', password = '', direccion = '' } = req.body;

  // Validaciones
  if (!email || !password || !direccion) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Email, contraseña y dirección son campos obligatorios' 
    });
  }

  if (!validateEmail(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Formato de email inválido' 
    });
  }

  if (!validatePassword(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'La contraseña debe tener al menos 8 caracteres, una letra y un número' 
    });
  }

  if (nombre.length < 2) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'El nombre debe tener al menos 2 caracteres' 
    });
  }

  try {
    // Verificar si el email ya existe
    const existingUser = await pool.query('SELECT "ID" FROM "Usuario" WHERE "Email" = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({ 
        message: 'El email ya está registrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO "Usuario" ("Nombre", "Email", "Password", "Direccion") VALUES ($1, $2, $3, $4) RETURNING "ID", "Nombre", "Email", "Direccion"';
    const values = [nombre.trim(), email.toLowerCase().trim(), hashedPassword, direccion.trim()];

    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    if (newUser) {
      // Generar token JWT para el nuevo usuario
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
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'No se pudo registrar el usuario' 
      });
    }
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Email y contraseña son requeridos' 
    });
  }

  if (!validateEmail(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Formato de email inválido' 
    });
  }

  try {
    const query = 'SELECT "ID", "Nombre", "Email", "Password", "Direccion" FROM "Usuario" WHERE "Email" = $1';
    const result = await pool.query(query, [email.toLowerCase().trim()]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    const user = result.rows[0];
    console.log('password desde la DB:', user.Password); // Depuración
    console.log('Resultado de la consulta:', result.rows[0]);

    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (!passwordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar token con toda la información del usuario
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
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Middleware para verificar autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ 
      message: 'Token de acceso requerido' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        message: 'Token inválido o expirado' 
      });
    }
    console.log('Payload del token:', user); // Verifica qué contiene el payload del token
    req.user = user;
    next();
  });
};


// Obtener perfil del usuario (requiere autenticación)
// Obtener perfil del usuario (requiere autenticación)
router.get('/profile', authenticateToken, async (req, res) => {
  console.log('ID del usuario desde el token:', req.user.ID); // Verifica el ID del usuario

  try {
    const query = 'SELECT "ID", "Nombre", "Email", "Direccion" FROM "Usuario" WHERE "ID" = $1';
    const result = await pool.query(query, [req.user.ID]); // Usamos req.user.ID

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    return res.status(StatusCodes.OK).json({
      message: 'Perfil obtenido exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error en /profile:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



// Actualizar usuario (requiere autenticación)
// Actualizar usuario (requiere autenticación)
router.put('/profile', authenticateToken, async (req, res) => {
  let { nombre, email, password, direccion } = req.body;

  try {
    // Primero verificamos que el usuario exista con el ID proveniente del token
    console.log('ID del usuario desde el token:', req.user.ID); // Verifica que ID del usuario se esté pasando correctamente

    const userCheck = await pool.query('SELECT * FROM "Usuario" WHERE "ID" = $1', [req.user.ID]);
    if (userCheck.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    // Validaciones
    if (email && !validateEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Formato de email inválido' 
      });
    }

    if (password && !validatePassword(password)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'La contraseña debe tener al menos 8 caracteres, una letra y un número' 
      });
    }

    if (nombre && nombre.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'El nombre debe tener al menos 2 caracteres' 
      });
    }

    // Verificar si el email ya existe (si se está actualizando)
    if (email && email !== userCheck.rows[0].email) {
      const existingUser = await pool.query('SELECT "ID" FROM "Usuario" WHERE "Email" = $1 AND "ID" != $2', [email.toLowerCase(), req.user.ID]);
      if (existingUser.rows.length > 0) {
        return res.status(StatusCodes.CONFLICT).json({ 
          message: 'El email ya está registrado por otro usuario' 
        });
      }
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
      fields.push(`"Nombre" = $${idx++}`);
      values.push(nombre.trim());
    }
    if (email !== undefined) {
      fields.push(`"Email" = $${idx++}`);
      values.push(email.toLowerCase().trim());
    }
    if (password !== undefined) {
      fields.push(`"Password" = $${idx++}`);
      values.push(password);
    }
    if (direccion !== undefined) {
      fields.push(`"Direccion" = $${idx++}`);
      values.push(direccion.trim());
    }

    if (fields.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'No se enviaron campos para actualizar' 
      });
    }

    values.push(req.user.ID); // último parámetro para WHERE ID = $n
    const query = `UPDATE "Usuario" SET ${fields.join(', ')} WHERE "ID" = $${idx} RETURNING "ID", "Nombre", "Email", "Direccion"`;

    const result = await pool.query(query, values);

    return res.status(StatusCodes.OK).json({ 
      message: 'Usuario actualizado correctamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error en /profile:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


export default router;
