import sensoresRepository from '../repositories/sensores-repository.js';
import { validaciones } from '../utils/validaciones.js';
import { StatusCodes } from 'http-status-codes';

const sensoresRepo = new sensoresRepository();
const validator = new validaciones(); 

export default class  sensoresService {

};

/*
import { StatusCodes } from 'http-status-codes';
import RegistroRepository from '../repositories/registro-repository.js';
import AppError from '../utils/AppError.js';
import { validaciones } from '../utils/validaciones.js';

const repo = new RegistroRepository();
const validator = new validaciones();

export default class RegistroService {
  async obtenerDatosSensores(idPlanta, idUsuario) {
    if (!(await validator.isPositivo(idPlanta))) {
      throw new AppError('idPlanta inválido', StatusCodes.BAD_REQUEST);
    }

    const esPropietario = await repo.validarPropietario(idPlanta, idUsuario);
    if (!esPropietario) throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);

    const datos = await repo.obtenerUltimoRegistroSensor(idPlanta);
    if (!datos) throw new AppError('No hay mediciones', StatusCodes.NOT_FOUND);

    return { status: StatusCodes.OK, data: datos };
  }

  async obtenerUltimoRiego(idPlanta, idUsuario) {
    if (!(await validator.isPositivo(idPlanta))) {
      throw new AppError('idPlanta inválido', StatusCodes.BAD_REQUEST);
    }

    const esPropietario = await repo.validarPropietario(idPlanta, idUsuario);
    if (!esPropietario) throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);

    const riego = await repo.obtenerUltimoRiego(idPlanta);
    if (!riego) throw new AppError('No hay registros de riego', StatusCodes.NOT_FOUND);

    return { status: StatusCodes.OK, data: riego };
  }

  async conectarModulo(idPlanta, idModulo) {
    if (!(await validator.isPositivo(idPlanta)) || !(await validator.isPositivo(idModulo))) {
      throw new AppError('Parámetros inválidos', StatusCodes.BAD_REQUEST);
    }

    const moduloExiste = await repo.verificarModulo(idModulo);
    if (!moduloExiste) throw new AppError('No se encuentra el módulo', StatusCodes.NOT_FOUND);

    const modulo = await repo.conectarModulo(idModulo, idPlanta);
    return { status: StatusCodes.OK, data: { message: 'Módulo conectado exitosamente', id: modulo.ID } };
  }

  async desconectarModulo(idPlanta, idUsuario) {
    if (!(await validator.isPositivo(idPlanta))) {
      throw new AppError('idPlanta inválido', StatusCodes.BAD_REQUEST);
    }

    const esPropietario = await repo.validarPropietario(idPlanta, idUsuario);
    if (!esPropietario) throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);

    const modulos = await repo.obtenerModulosDePlanta(idPlanta);
    if (modulos.length === 0) throw new AppError('No hay módulo conectado', StatusCodes.NOT_FOUND);

    const result = await repo.desconectarModulo(idPlanta);
    return { status: StatusCodes.OK, data: { message: 'Módulo desconectado exitosamente', ids: result.map(r => r.ID) } };
  }

  async subirDatosPlanta({ idPlanta, temperatura, humedad, fecha, idUsuario }) {
    if (!(await validator.isPositivo(idPlanta)) || typeof temperatura !== 'number' || typeof humedad !== 'number') {
      throw new AppError('Parámetros inválidos', StatusCodes.BAD_REQUEST);
    }

    const esPropietario = await repo.validarPropietario(idPlanta, idUsuario);
    if (!esPropietario) throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);

    const humedadInt = Math.round(humedad);
    const humedadAntes = await repo.obtenerUltimaHumedad(idPlanta);

    const registro = await repo.insertarDatosPlanta(idPlanta, temperatura, humedadInt, fecha, humedadAntes);
    return { status: StatusCodes.CREATED, data: { message: 'Datos subidos correctamente', registro } };
  }

  async registrarUltimoRiego({ idPlanta, fecha, duracionRiego, idUsuario }) {
    if (!(await validator.isPositivo(idPlanta)) || typeof duracionRiego !== 'number') {
      throw new AppError('Parámetros inválidos', StatusCodes.BAD_REQUEST);
    }

    const esPropietario = await repo.validarPropietario(idPlanta, idUsuario);
    if (!esPropietario) throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);

    const registro = await repo.insertarUltimoRiego(idPlanta, fecha, duracionRiego);
    return { status: StatusCodes.CREATED, data: { message: 'Riego registrado correctamente', registro } };
  }
}

*/