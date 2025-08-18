import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthService from '../services/auth-service.js';
import authenticateToken from '../middlewares/auth.js';

const router = Router();

const authService = new AuthService();
// Registro
router.post('/register', async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(StatusCodes.CREATED).json({ message: 'Usuario registrado exitosamente', user, token });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 
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
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 

    res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
    });
  }
});

// Perfil
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.ID);
    res.status(StatusCodes.OK).json({ message: 'Perfil obtenido exitosamente', user });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 

    res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
    });  }
});

// Actualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.ID, req.body);
    res.status(StatusCodes.OK).json({ message: 'Usuario actualizado exitosamente', user });
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; 

    res.status(statusCode).json({
        success: false,
        message: error.message,
        token: ''
    });  }
});

export default router;

