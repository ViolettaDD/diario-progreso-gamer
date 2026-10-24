import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ApiError, TipoError } from '../apiError';

/**
 * Manejador central de errores. Distingue los 4 tipos:
 * 1. Validación de esquema (ValidationError) ........ 400  tipo "validacion"
 * 2. Id mal formado (CastError) ..................... 400  tipo "id_mal_formado"
 * 3. Recurso o referencia inexistente (ApiError) .... 404  tipo "no_encontrado" / "referencia_inexistente"
 * 4. Error inesperado ............................... 500  tipo "interno" (sin stack ni secretos)
 */
export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  let status = 500;
  let tipo: TipoError = 'interno';
  let error = 'Error interno del servidor';
  let detalles: string[] | undefined;

  if (err instanceof ApiError) {
    status = err.status;
    tipo = err.tipo;
    error = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    tipo = 'validacion';
    error = 'Los datos no cumplen las validaciones del esquema';
    detalles = Object.values(err.errors).map((e) => e.message);
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    tipo = 'id_mal_formado';
    error = `Valor mal formado para "${err.path}": ${String(err.value)}`;
  } else if (err instanceof SyntaxError && 'status' in err && (err as { status: unknown }).status === 400) {
    status = 400;
    tipo = 'validacion';
    error = 'El cuerpo no es un JSON válido';
  }

  if (status === 500) {
    // Solo en el servidor. Al cliente nunca se le envían stacks ni datos internos.
    console.error({
      requestId: req.id,
      nombre: err instanceof Error ? err.name : 'Desconocido',
      mensaje: err instanceof Error ? err.message : String(err),
    });
  }

  res.status(status).json({ error, tipo, ...(detalles ? { detalles } : {}), requestId: req.id });
};
