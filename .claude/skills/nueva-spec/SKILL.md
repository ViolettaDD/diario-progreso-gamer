---
name: nueva-spec
description: Crea el borrador de una spec en docs/specs/ (backend o frontend) a partir del backlog de la épica E2, con reglas DEBE / NO DEBE, tabla criterio → verificación y tabla ticket → archivos. No escribe código.
disable-model-invocation: true
---

Crea una spec nueva para: $ARGUMENTS

Pasos:

1. Identifica el ámbito (backend o frontend) y el tema en $ARGUMENTS. Si falta alguno, pregúntalo antes de seguir.
2. Lee `docs/prd/`, `docs/backlog/epicas.md` y `docs/backlog/E2-metas-y-rachas.md`. Si el ámbito es frontend, lee también `DESIGN.md`.
3. Toma SOLO las historias, criterios y tickets del backlog que corresponden a ese ámbito. Si un criterio que necesitas no está en el backlog, detente y avisa: no lo inventes ni lo agregues a la spec.
4. Crea `docs/specs/<ambito>-<tema>.md` (por ejemplo `docs/specs/backend-meta-y-progreso.md`) con exactamente estas secciones:
   - **Contexto y alcance**: qué cubre la spec y qué historias y tickets del backlog implementa (por id).
   - **Reglas**: lista «DEBE» y lista «NO DEBE». Cada regla se puede comprobar sin interpretar.
   - **Criterio → verificación**: tabla con columnas `Criterio | Verificación`. La verificación nombra el test (por ejemplo `backend/src/dominio/progreso.test.ts`), la petición curl o la revisión visual concreta. Todo criterio verificable sin base de datos tiene un test.
   - **Ticket → archivos**: tabla con columnas `Ticket | Archivos que se crean o modifican`.
   - **Supuestos y puntos abiertos**: lo que la spec asume y no estaba en el PRD.
5. No escribas código, no hagas commit y no modifiques el backlog. Termina listando los criterios que quedaron sin verificación asignada.
