# AGENTS.md — Diario de Progreso Gamer

## Proyecto
App MERN para registrar videojuegos y partidas y ver su progreso. Trabajamos la épica E2 «Metas y rachas»
en la rama feature/e2-metas-rachas. Producto, reglas y decisiones: docs/ (diagnostico.md, prd/, backlog/, specs/).

## Stack
- Backend: Node 20+, Express 4, TypeScript, Mongoose 8, MongoDB Atlas. Tests: Vitest.
- Frontend: React 18, TypeScript, Vite, React Router 6. Sin librerías de UI.
- Despliegue: Render (API como Web Service, frontend como Static Site).

## Estructura
- backend/src/{config,modelos,services,controllers,routes,middlewares,dominio}
- frontend/src/{api,components,paginas,tipos.ts,estilos.css}
- docs/{diagnostico.md,prd/,backlog/,specs/,AUDITORIA.md,bitacora-agente.md}
- .claude/{settings.json,hooks/,skills/}

## Comandos
- Backend (cd backend): npm run dev | npm run check | npm run build | npm test
- Frontend (cd frontend): npm run dev | npm run check | npm run build
- npm test existe desde el ticket que instala Vitest; antes de eso usa npm run check.

## Convenciones
- Nombres de dominio en español (Videojuego, Partida, Meta). Capas: rutas → controladores → servicios → modelos.
- Errores con la forma { error, tipo, requestId } a través del errorHandler (400, 404, 409, 500).
- Dependencias con versión exacta; no instales ninguna sin que se pida.
- Commits: feat(E2): T-03 descripción (nombra el ticket). Cada spec se commitea antes que su código.
- Haz solo lo que pide el ticket: sin refactors ni «mejoras» no pedidas.

## Reglas
- NUNCA leas ni modifiques archivos .env (solo .env.example). Un hook lo bloquea.
- Ninguna funcionalidad sin una spec en docs/specs/. Sin spec, propón escribirla; no programes.
- Ejecuta los tests (npm test y npm run check) antes de dar una tarea por terminada.
- En tickets de tipo test el estado esperado es rojo: falla por falta de implementación, nunca por error de sintaxis.
- Semana, racha, hitos y resumen son funciones puras en backend/src/dominio/: sin Mongoose y sin
  leer la hora internamente («hoy» entra por parámetro).
- Zona horaria: America/Guayaquil. La fecha de una Partida es un día de calendario, guardado a medianoche UTC.
- Lo que no esté en docs/prd/ ni en la spec es un supuesto: pregunta antes de decidirlo.
- Si el código y la spec chocan, detente y avisa; no cambies la spec en silencio.

## Frontend
Antes de tocar la interfaz lee DESIGN.md. Estilos solo con variables CSS de :root; fetch solo en frontend/src/api/.

## Harness
- Hooks: formato con Prettier al editar archivos; bloqueo de lectura y edición de .env.
- Skills (solo se invocan a mano): /nueva-spec y /commit-ticket.
