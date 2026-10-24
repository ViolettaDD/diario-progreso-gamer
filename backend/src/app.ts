import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { router as videojuegos } from './routes/videojuegos.routes';
import { router as partidas } from './routes/partidas.routes';
import { requestId } from './middlewares/requestId';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import { ApiError } from './apiError';
import type { Entorno } from './config/env';

/** Ensambla la aplicación Express (no se conecta a la base ni escucha puertos). */
export function crearApp(entorno: Pick<Entorno, 'corsOrigin' | 'permitirErrorPrueba'>) {
  const app = express();
  app.disable('x-powered-by');

  // CORS: en producción solo se acepta el origen del frontend (CORS_ORIGIN). Sin valor, se aceptan todos (desarrollo).
  app.use(cors(entorno.corsOrigin ? { origin: entorno.corsOrigin } : {}));
  app.use(requestId);
  app.use(logger);
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/salud', (_req, res) => {
    const conectado = mongoose.connection.readyState === 1;
    res.status(conectado ? 200 : 503).json({ estado: conectado ? 'ok' : 'sin_conexion' });
  });

  app.use('/api/videojuegos', videojuegos);
  app.use('/api/partidas', partidas);

  if (entorno.permitirErrorPrueba) {
    // Solo en local (PERMITIR_ERROR_PRUEBA=true): permite comprobar el manejo del error 500.
    app.get('/api/debug/error', () => {
      throw new Error('Fallo simulado para comprobar el error 500');
    });
  }

  app.use((req, _res, next) => next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`)));
  app.use(errorHandler);
  return app;
}
