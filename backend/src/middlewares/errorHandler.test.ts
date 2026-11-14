import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { errorHandler } from './errorHandler';
import { ApiError } from '../apiError';

/** Ejecuta el errorHandler con req/res simulados y devuelve el status y el cuerpo enviados. */
function manejar(err: unknown) {
  const salida: { status?: number; cuerpo?: Record<string, unknown> } = {};
  const res = {
    headersSent: false,
    status(codigo: number) {
      salida.status = codigo;
      return this;
    },
    json(cuerpo: Record<string, unknown>) {
      salida.cuerpo = cuerpo;
      return this;
    },
  };
  const req = { id: 'req-prueba' };
  const next = vi.fn();
  errorHandler(err, req as unknown as Request, res as unknown as Response, next as unknown as NextFunction);
  return salida;
}

describe('errorHandler', () => {
  it('H-01.6: un ApiError 409 responde 409 conflicto con requestId (RN-09)', () => {
    const { status, cuerpo } = manejar(new ApiError(409, 'Este juego ya tiene una meta activa'));
    expect(status).toBe(409);
    expect(cuerpo).toEqual({
      error: 'Este juego ya tiene una meta activa',
      tipo: 'conflicto',
      requestId: 'req-prueba',
    });
  });

  it('H-01.6: un error E11000 responde 409 conflicto (RN-09)', () => {
    const duplicado = Object.assign(new Error('E11000 duplicate key error collection: metas'), {
      name: 'MongoServerError',
      code: 11000,
    });
    const { status, cuerpo } = manejar(duplicado);
    expect(status).toBe(409);
    expect(cuerpo?.tipo).toBe('conflicto');
    expect(cuerpo?.requestId).toBe('req-prueba');
  });

  it('T-15: los 400, 404 y 500 existentes no cambian', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(manejar(new ApiError(400, 'Dato inválido'))).toMatchObject({ status: 400, cuerpo: { tipo: 'validacion' } });
    expect(manejar(new ApiError(404, 'No existe'))).toMatchObject({ status: 404, cuerpo: { tipo: 'no_encontrado' } });
    expect(manejar(new ApiError(404, 'Ref', 'referencia_inexistente'))).toMatchObject({
      status: 404,
      cuerpo: { tipo: 'referencia_inexistente' },
    });

    const validacion = new mongoose.Error.ValidationError();
    validacion.addError(
      'nombre',
      new mongoose.Error.ValidatorError({ message: 'El nombre es obligatorio', path: 'nombre' }),
    );
    expect(manejar(validacion)).toMatchObject({
      status: 400,
      cuerpo: { tipo: 'validacion', detalles: ['El nombre es obligatorio'] },
    });

    expect(manejar(new mongoose.Error.CastError('ObjectId', 'abc', '_id'))).toMatchObject({
      status: 400,
      cuerpo: { tipo: 'id_mal_formado' },
    });

    const interno = manejar(new Error('fallo inesperado'));
    expect(interno).toMatchObject({ status: 500, cuerpo: { tipo: 'interno', error: 'Error interno del servidor' } });
    expect(interno.cuerpo?.requestId).toBe('req-prueba');
  });
});
