import dotenv from 'dotenv';

dotenv.config();

export interface Entorno {
  mongoUri: string;
  dbName: string;
  port: number;
  corsOrigin: string[] | undefined;
  permitirErrorPrueba: boolean;
}

/** Lee y valida las variables de entorno. Nunca imprime la cadena de conexión. */
export function leerEnv(): Entorno {
  const mongoUri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim();
  if (!mongoUri) throw new Error('Falta MONGODB_URI (archivo .env en local o panel de Render en producción)');
  if (!dbName) throw new Error('Falta MONGODB_DB (nombre de la base de datos)');

  const corsOrigin = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origen) => origen.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return {
    mongoUri,
    dbName,
    port: Number(process.env.PORT) || 3000,
    corsOrigin: corsOrigin.length ? corsOrigin : undefined,
    permitirErrorPrueba: process.env.PERMITIR_ERROR_PRUEBA === 'true',
  };
}
