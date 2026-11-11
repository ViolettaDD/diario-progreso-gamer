// Hook PostToolUse: formatea con Prettier el archivo que el agente acaba de editar o crear.
// Solo toca .ts, .tsx, .json, .md y .mjs dentro del proyecto. No formatea .css (el estilo compacto de
// estilos.css es deliberado) ni node_modules, dist, .vite ni package-lock.json.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname, isAbsolute, relative, resolve } from 'node:path';

const EXTENSIONES = new Set(['.ts', '.tsx', '.json', '.md', '.mjs']);
const IGNORAR = /(^|\/)(node_modules|dist|\.vite|\.git)\/|(^|\/)package-lock\.json$/;
const PRETTIER = 'prettier@3.3.3'; // versión fija

let texto = '';
for await (const trozo of process.stdin) texto += trozo;

let evento;
try {
  evento = JSON.parse(texto);
} catch {
  process.exit(0);
}

const archivo = evento.tool_input?.file_path;
if (typeof archivo !== 'string') process.exit(0);

const raiz = typeof evento.cwd === 'string' ? evento.cwd : process.cwd();
const absoluta = isAbsolute(archivo) ? archivo : resolve(raiz, archivo);
const relativa = relative(raiz, absoluta).replace(/\\/g, '/');

if (relativa.startsWith('..') || IGNORAR.test(relativa)) process.exit(0);
if (!EXTENSIONES.has(extname(absoluta).toLowerCase()) || !existsSync(absoluta)) process.exit(0);

// shell: true hace que npx funcione igual en Windows (PowerShell o Git Bash), macOS y Linux.
const resultado = spawnSync(`npx --yes ${PRETTIER} --write "${absoluta}"`, {
  cwd: raiz,
  shell: true,
  encoding: 'utf8',
  timeout: 55_000,
});

if (resultado.status !== 0) {
  console.error(`formatear: Prettier no pudo formatear ${relativa}.\n${resultado.stderr ?? ''}`);
  process.exit(1); // no bloqueante: se informa, pero el trabajo sigue
}
process.exit(0);
