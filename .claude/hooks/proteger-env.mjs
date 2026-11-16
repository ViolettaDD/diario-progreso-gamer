// Hook PreToolUse: bloquea leer o modificar archivos .env (se permite .env.example).
// Claude Code envía el evento como JSON por stdin. Exit 2 = bloquear y avisar al agente por stderr.

let texto = '';
for await (const trozo of process.stdin) texto += trozo;

let evento;
try {
  evento = JSON.parse(texto);
} catch {
  console.error('proteger-env: no se pudo leer el evento del hook; no se bloquea nada.');
  process.exit(1); // error no bloqueante: se muestra a la persona y la ejecución sigue
}

/** ¿El nombre del archivo es .env o .env.algo (pero no .env.example)? */
function esArchivoEnv(ruta) {
  const nombre = String(ruta).replace(/\\/g, '/').split('/').pop().toLowerCase();
  return nombre === '.env' || (nombre.startsWith('.env.') && nombre !== '.env.example');
}

// Un archivo llamado .env como palabra suelta en un comando: "cat .env", "type backend\.env", "Get-Content ./.env".
// No coincide con process.env ni con .env.example.
const ENV_EN_COMANDO = /(^|[\s"'`/\\=:])\.env(\.(?!example(?![\w.-]))[\w.-]+)?($|[\s"'`;|&<>)])/i;

const entrada = evento.tool_input ?? {};
const rutas = [entrada.file_path, entrada.path, entrada.notebook_path].filter((v) => typeof v === 'string');

const bloqueaRuta = rutas.some(esArchivoEnv);
const bloqueaComando = typeof entrada.command === 'string' && ENV_EN_COMANDO.test(entrada.command);

if (bloqueaRuta || bloqueaComando) {
  console.error(
    'Bloqueado: AGENTS.md prohíbe leer o modificar archivos .env (contienen credenciales). ' +
      'Si necesitas una variable nueva, agrégala vacía a .env.example y avísale a la persona.',
  );
  process.exit(2);
}
process.exit(0);
