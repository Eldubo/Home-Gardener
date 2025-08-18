import plantaRepository from '../repositories/plantaRepository.js';
import { validaciones } from '../helpers/validaciones.js';
import { StatusCodes } from 'http-status-codes';

const plantaRepo = new plantaRepository();
const validator = new validaciones(); 

export default class  plantaService {
  async agregarPlanta({ nombre, tipo, idAmbiente, idUsuario }) {
    if (!nombre || typeof nombre !== 'string' ||
        !tipo || typeof tipo !== 'string' ||
        !isValidId(idAmbiente)) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Datos inválidos' };
    }

    const tipoOk = await plantaRepository.verificarTipo(tipo.trim());
    if (tipoOk.length === 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Tipo de planta no válido' };
    }

    const ambienteOk = await plantaRepository.verificarAmbiente(idAmbiente, idUsuario);
    if (ambienteOk.length === 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Ambiente no encontrado' };
    }

    const planta = await plantaRepository.insertarPlanta(nombre.trim(), tipo.trim(), idAmbiente);
    return { error: false, status: StatusCodes.CREATED, data: planta };
  }

  async eliminarPlanta({ idPlanta, idUsuario }) {
    if (!isValidId(idPlanta)) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'ID inválido' };
    }

    const existe = await plantaRepository.verificarExistencia(idPlanta, idUsuario);
    if (existe.length === 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Planta no encontrada o sin permiso' };
    }

    const tieneModulo = await plantaRepository.verificarModulo(idPlanta);
    if (tieneModulo.length > 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'La planta tiene un módulo conectado' };
    }

    await plantaRepository.eliminarPlanta(idPlanta);
    return { error: false, status: StatusCodes.OK };
  }

  async actualizarFoto ({ foto, idPlanta, idUsuario }) {
    if (!foto || !isValidId(idPlanta)) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Datos inválidos' };
    }

    const permiso = await plantaRepository.verificarExistencia(idPlanta, idUsuario);
    if (permiso.length === 0) {
      return { error: true, status: StatusCodes.FORBIDDEN, message: 'Sin permiso para actualizar esta planta' };
    }

    const updated = await plantaRepository.actualizarFoto(foto.trim(), idPlanta);
    return { error: false, status: StatusCodes.OK, data: updated };
  }

  async listarPlantas (idUsuario) {
    const plantas = await plantaRepository.listarPlantas(idUsuario);
    if (plantas.length === 0) {
      return { error: true, status: StatusCodes.NOT_FOUND, message: 'No tienes plantas asociadas' };
    }
    return { error: false, status: StatusCodes.OK, data: plantas };
  }

  async modificarNombre ({ idPlanta, nuevoNombre, idUsuario }){
    if (!isValidId(idPlanta) || !nuevoNombre || typeof nuevoNombre !== 'string') {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Datos inválidos' };
    }

    const permiso = await plantaRepository.verificarExistencia(idPlanta, idUsuario);
    if (permiso.length === 0) {
      return { error: true, status: StatusCodes.FORBIDDEN, message: 'Sin permiso para modificar esta planta' };
    }

    await plantaRepository.modificarNombre(nuevoNombre.trim(), idPlanta);
    return { error: false, status: StatusCodes.OK };
  }
};

