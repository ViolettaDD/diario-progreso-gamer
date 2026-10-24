import { RequestHandler } from 'express';

/** Registra método, ruta, status y duración de cada petición. */
export const logger: RequestHandler = (req, res, next) => {
  const inicio = Date.now();
  res.once('finish', () => {
    console.log(
      JSON.stringify({ id: req.id, metodo: req.method, ruta: req.originalUrl, status: res.statusCode, ms: Date.now() - inicio }),
    );
  });
  next();
};
