import mongoose from 'mongoose';
import { leerEnv } from './env';

/** Conecta con MongoDB Atlas usando solo variables de entorno (sin credenciales en el código). */
export async function conectarDB(): Promise<void> {
  const { mongoUri, dbName } = leerEnv();
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, { dbName });
  console.log(`Conectado a MongoDB Atlas (base: ${dbName})`);
}

export async function cerrarDB(): Promise<void> {
  await mongoose.disconnect();
}
