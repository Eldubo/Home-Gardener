import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/userRepository.js';
import {validaciones} from '../helpers/validaciones.js'

const JWT_SECRET = process.env.JWT_SECRET || 'clave_supersecreta';

const validator = new validaciones();
// Helpers

export default class AuthService {
  async register ({ nombre, email, password, direccion }){
    if (!email || !password || !direccion) throw new Error('Email, contraseña y dirección son obligatorios');
    if (!validator.validateEmail(email)) throw new Error('Formato de email inválido');
    if (!validator.validatePassword(password)) throw new Error('La contraseña debe tener al menos 8 caracteres, una letra y un número');
    if (!nombre || nombre.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');

    const exists = await UserRepository.emailExists(email.toLowerCase());
    if (exists) throw new Error('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserRepository.create(nombre.trim(), email.toLowerCase().trim(), hashedPassword, direccion.trim());

    const token = jwt.sign({ id: newUser.ID, email: newUser.Email }, JWT_SECRET, { expiresIn: '1d' });
    return { user: newUser, token };
  }

  async login ({ email, password }){
    if (!email || !password) throw new Error('Email y contraseña son requeridos');
    if (!validateEmail(email)) throw new Error('Formato de email inválido');

    const user = await UserRepository.findByEmail(email.toLowerCase().trim());
    if (!user) throw new Error('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) throw new Error('Credenciales inválidas');

    const token = jwt.sign(
      { ID: user.ID, nombre: user.Nombre, email: user.Email, direccion: user.Direccion },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user, token };
  }
  async getProfile(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async updateProfile(id, { nombre, email, password, direccion }) {
    let updateFields = {};
    if (email) {
      if (!validateEmail(email)) throw new Error('Formato de email inválido');
      updateFields.Email = email.toLowerCase().trim();
    }
    if (password) {
      if (!validatePassword(password)) throw new Error('Contraseña inválida');
      updateFields.Password = await bcrypt.hash(password, 10);
    }
    if (nombre) {
      if (nombre.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
      updateFields.Nombre = nombre;
    }
    if (direccion) updateFields.Direccion = direccion.trim();

    if (Object.keys(updateFields).length === 0) throw new Error('No hay campos para actualizar');

    return await UserRepository.update(id, updateFields);
  }
};

