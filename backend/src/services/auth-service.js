import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user-repository.js';
import {validaciones} from '../utils/validaciones.js'
import AppError from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';



const JWT_SECRET = process.env.JWT_SECRET || 'clave_supersecreta';

const validator = new validaciones();
const userRepo = new UserRepository();


export default class AuthService {
  async register({ nombre, email, password, direccion }) {
    if (!validator.isValidEmail(email) || !validator.isValidPassword(password) || !isValidString(nombre) || !isValidString(direccion))
      throw new AppError('Formato de campos inválido', StatusCodes.BAD_REQUEST);

    const exists = await userRepo.emailExists(email.toLowerCase());
    if (exists) throw new AppError('El email ya está registrado', StatusCodes.CONFLICT);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userRepo.create(
      nombre.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      direccion.trim()
    );

    const token = jwt.sign({ id: newUser.ID, email: newUser.Email }, JWT_SECRET, { expiresIn: '1d' });
    return { user: newUser, token };
  }

  async login({ email, password }) {

    if (!validator.isValidEmail(email) && !validator.isValidString(password))
      throw new AppError('Formato de campos inválido', StatusCodes.BAD_REQUEST);

    const user = await userRepo.findByEmail(email.toLowerCase().trim());
    if (!user)
      throw new AppError('Credenciales inválidas', StatusCodes.UNAUTHORIZED);

    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch)
      throw new AppError('Credenciales inválidas', StatusCodes.UNAUTHORIZED);

    const token = jwt.sign(
      { ID: user.ID, nombre: user.Nombre, email: user.Email, direccion: user.Direccion },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user, token };
  }

  async getProfile(id) {
    const user = await userRepo.findById(id);
    if (!user)
      throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND);

    return user;
  }

  async updateProfile(id, { nombre, email, password, direccion }) {
    let updateFields = {};

    if (email) {
      if (!validator.isValidEmail(email))
        throw new AppError('Formato de email inválido', StatusCodes.BAD_REQUEST);
      updateFields.Email = email.toLowerCase().trim();
    }

    if (password) {
      if (!validator.isValidPassword(password))
        throw new AppError('Contraseña inválida', StatusCodes.BAD_REQUEST);
      updateFields.Password = await bcrypt.hash(password, 10);
    }

    if (nombre) {
      if (valida.isValidString(nombre))
        throw new AppError('El nombre debe tener al menos 3 caracteres', StatusCodes.BAD_REQUEST);
      updateFields.Nombre = nombre;
    }

    if (direccion) {
      if (valida.isValidString(direccion))
      throw new AppError('La direccion debe tener al menos 3 caracteres', StatusCodes.BAD_REQUEST);
      updateFields.Direccion = direccion.trim();
    }
    

    if (Object.keys(updateFields).length === 0)
      throw new AppError('No hay campos para actualizar', StatusCodes.BAD_REQUEST);

    return await userRepo.update(id, updateFields);
  }
};