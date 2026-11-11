---
name: commit-ticket
description: Hace el commit de un ticket de E2 con mensaje feat(E2): T-XX descripción, comprobando antes la rama, los checks y que la spec del ticket ya esté en Git. Nunca hace push ni agrega archivos .env.
disable-model-invocation: true
---

Haz el commit del ticket: $ARGUMENTS (formato esperado: `T-03 descripción corta`)

Comprobaciones, en orden. Si alguna falla, detente, explica por qué y no hagas el commit:

1. `git branch --show-current` debe ser `feature/e2-metas-rachas`.
2. `git status --short` y `git diff --cached --name-only`: identifica los archivos del ticket. Agrega cada archivo por su ruta con `git add <ruta>`. Nunca uses `git add -A` ni `git add .`, y nunca agregues archivos `.env` (solo `.env.example`).
3. Ejecuta `npm run check` en las carpetas cambiadas (backend y/o frontend). Si `backend/package.json` tiene el script `test`, ejecuta también `npm test` en backend.
4. Trazabilidad: si el commit toca `backend/src/` o `frontend/src/` (implementación), la spec del ticket debe estar ya commiteada en un commit anterior (`git log --oneline -- docs/specs/`). Si no lo está, o si la spec va en el mismo conjunto de cambios, detente: la spec va en su propio commit antes del código.
5. Mensaje: `<tipo>(E2): T-XX descripción`, con tipo `feat`, `fix`, `test`, `docs` o `chore`. Debe nombrar el ticket.

Si todo pasa, crea el commit y muestra `git log -1 --stat`. No hagas push.
