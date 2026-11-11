// Prueba manual de los hooks, sin abrir Claude Code:  node .claude/hooks/probar.mjs
// Opcional:  node .claude/hooks/probar.mjs --formato   (usa Prettier; la primera vez descarga el paquete)
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '..', '..');

function correr(script, evento) {
  const r = spawnSync(process.execPath, [join(aqui, script)], { input: JSON.stringify(evento), encoding: 'utf8' });
  return r.status;
}

const casosEnv = [
  ['Read backend/.env', { tool_name: 'Read', tool_input: { file_path: 'backend/.env' } }, 2],
  ['Edit .env en Windows', { tool_name: 'Edit', tool_input: { file_path: 'C:\\repo\\backend\\.env' } }, 2],
  ['Write .env.local', { tool_name: 'Write', tool_input: { file_path: '.env.local' } }, 2],
  ['Bash: cat backend/.env', { tool_name: 'Bash', tool_input: { command: 'cat backend/.env' } }, 2],
  ['Bash: type .env', { tool_name: 'Bash', tool_input: { command: 'type .env' } }, 2],
  ['Bash: Get-Content backend\\.env', { tool_name: 'Bash', tool_input: { command: 'Get-Content backend\\.env' } }, 2],
  ['Bash: source ./.env && node x', { tool_name: 'Bash', tool_input: { command: 'source ./.env && node x' } }, 2],
  ['Edit .env.example (permitido)', { tool_name: 'Edit', tool_input: { file_path: 'backend/.env.example' } }, 0],
  ['Bash: cat .env.example (permitido)', { tool_name: 'Bash', tool_input: { command: 'cat backend/.env.example' } }, 0],
  ['Bash: grep process.env (permitido)', { tool_name: 'Bash', tool_input: { command: 'grep -rn process.env backend/src' } }, 0],
  ['Read env.ts (permitido)', { tool_name: 'Read', tool_input: { file_path: 'backend/src/config/env.ts' } }, 0],
  ['Bash: npm test (permitido)', { tool_name: 'Bash', tool_input: { command: 'npm test' } }, 0],
];

let fallos = 0;
console.log('Hook PreToolUse · proteger-env.mjs');
for (const [nombre, evento, esperado] of casosEnv) {
  const obtenido = correr('proteger-env.mjs', evento);
  const ok = obtenido === esperado;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'OK   ' : 'FALLA'} ${nombre}  (exit ${obtenido}, esperado ${esperado})`);
}

console.log('Hook PostToolUse · formatear.mjs');
const omitidos = [
  ['archivo .css (se omite)', { cwd: raiz, tool_input: { file_path: 'frontend/src/estilos.css' } }],
  ['archivo inexistente (se omite)', { cwd: raiz, tool_input: { file_path: 'backend/src/no-existe.ts' } }],
  ['sin file_path (se omite)', { cwd: raiz, tool_input: {} }],
];
for (const [nombre, evento] of omitidos) {
  const obtenido = correr('formatear.mjs', evento);
  const ok = obtenido === 0;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'OK   ' : 'FALLA'} ${nombre}  (exit ${obtenido})`);
}

if (process.argv.includes('--formato')) {
  const dir = join(raiz, '.tmp-prueba-hooks');
  const archivo = join(dir, 'ejemplo.ts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(archivo, 'const   a = "hola"\nexport {a}\n');
  const estado = correr('formatear.mjs', { cwd: raiz, tool_input: { file_path: archivo } });
  const final = readFileSync(archivo, 'utf8');
  rmSync(dir, { recursive: true, force: true });
  const ok = estado === 0 && final.includes("const a = 'hola';");
  if (!ok) fallos++;
  console.log(`  ${ok ? 'OK   ' : 'FALLA'} Prettier formatea un .ts de prueba  (exit ${estado})`);
}

console.log(fallos === 0 ? '\nTodo bien.' : `\n${fallos} prueba(s) fallaron.`);
process.exit(fallos === 0 ? 0 : 1);
