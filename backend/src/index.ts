import { leerEnv } from './config/env';
import { conectarDB, cerrarDB } from './config/conexionDB';
import { crearApp } from './app';

async function main(): Promise<void> {
  const entorno = leerEnv();
  await conectarDB();
  const servidor = crearApp(entorno).listen(entorno.port, () => {
    console.log(`API escuchando en http://localhost:${entorno.port}`);
  });
  const salir = () => {
    servidor.close(() => {
      void cerrarDB();
    });
  };
  process.on('SIGINT', salir);
  process.on('SIGTERM', salir);
}

main().catch((e: unknown) => {
  console.error('No se pudo iniciar la API:', e instanceof Error ? e.message : 'error desconocido');
  process.exit(1);
});
