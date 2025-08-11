import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
const JWT_SECRET = process.env.JWT_SECRET || 'clave_supersecreta';
export default function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(StatusCodes.FORBIDDEN).json({ message: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}