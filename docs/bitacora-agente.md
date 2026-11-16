# Bitácora del agente — Épica E2 «Metas y rachas»

Proyecto 3 · Diario de Progreso Gamer · rama `feature/e2-metas-rachas`

Cadena seguida: diagnóstico → harness → PRD → épica → historias → criterios → tickets → specs → código con tests → auditoría.

---

## Momento 1 · Fase 1 · Diagnóstico del Proyecto 3 (plan mode)

- **Qué se le pidió:** diagnosticar el repositorio pensando en E2 y confirmar o descartar siete sospechas con evidencia (archivo y línea): sin framework de tests, `fecha` sin normalizar, sin 409, cascada sin metas ni transacción, fórmula del resumen mezclada con el acceso a datos, sin capa de metas ni tokens en el frontend, y sin pantalla para editar partidas.
- **Qué hizo bien:** entregó una tabla de problemas con evidencia por archivo y línea y una clasificación propuesta (bloquea / se difiere) con su motivo. Encontró además hallazgos que no se le habían pedido: contraste de colores, CSS sobrante, una carrera al crear partidas, decimales en la duración y falta de paginación. Al no tener la ficha del cliente, **preguntó en lugar de inventar** los campos de la respuesta.
- **Qué hizo mal o faltó:** al preguntar propuso nombres propios, como `rachaMaxima`, que no son los de la ficha (`mejorRacha`). La causa estaba en mi prompt, que citaba «la forma exacta de la ficha», un documento que el agente no tenía.
- **Cómo se corrigió:** se le dieron los campos exactos (`mejorRacha`, rangos de la meta, rutas) y se le indicó que no decidiera el tope del porcentaje, porque era el hueco 5 del PRD. Las decisiones quedaron en `docs/diagnostico.md`.
- **Reflexión:** el agente solo es tan preciso como los documentos que tiene. Que preguntara en vez de inventar evitó nombres de campos distintos a los del contrato; lo que faltaba era el documento, no la capacidad del agente.

## Momento 2 · Fase 2 · Harness: hooks, skills y una regla que sí se aplicó

- **Qué se preparó:** `AGENTS.md` (45 líneas, con las tres reglas obligatorias: nunca leer ni modificar `.env`, ninguna funcionalidad sin spec en `docs/specs/`, ejecutar tests antes de terminar), `CLAUDE.md` con `@AGENTS.md`, `DESIGN.md`, dos hooks (un `PreToolUse` que bloquea `.env` salvo `.env.example` y un `PostToolUse` que formatea con Prettier) y dos skills (`/nueva-spec` y `/commit-ticket`, solo invocables por la usuaria). El script `probar.mjs` comprueba los hooks y el agente lo ejecutó más tarde con resultado «Todo bien».
- **Qué pasó con los hooks en uso real:** durante la revisión de T-31 el hook bloqueó dos comandos del agente que mencionaban `.env` y `process\.env`. El agente **no lo rodeó**: leyó `src/config/env.ts` con la herramienta de lectura, que es código, y dejó la comprobación de archivos `.env` en git a la usuaria. El patrón del hook es conservador: bloquea cualquier comando que nombre `.env`, aunque solo busque la palabra en el código.
- **Incidente aparte (no fue error del agente):** un `prettier --write` ejecutado antes de copiar `.prettierrc.json` cambió comillas simples por dobles en unos 30 archivos. Se detectó revisando `git diff` antes de commitear, se descartó con `git restore` y se volvió a formatear con la configuración activa en un commit aparte (`16ae096`).
- **Reflexión:** una regla escrita en `AGENTS.md` se puede olvidar; un hook no. La regla de `.env` funcionó porque estaba también en un hook, y el costo fue un falso positivo ocasional.

## Momento 3 · Fase 3 · PRD: el agente avisó de dos choques entre reglas

- **Qué se le pidió:** escribir el PRD y las épicas con las reglas RN-01 a RN-13. RN-05 decía «el porcentaje se limita a 100 %».
- **Qué hizo bien (1):** en lugar de aplicar la instrucción en silencio, avisó de que RN-05 **reemplazaba un acuerdo anterior** (mostrar el valor real, por ejemplo 140 %). Dejó **seis puntos abiertos (PA-02 a PA-07) sin decidir** y los devolvió. Comprobó con una búsqueda que ni el PRD ni las épicas tuvieran detalle técnico.
- **Qué hizo bien (2):** al incorporar RN-14 («la semana en que se crea la meta cuenta completa») detectó que la definición de «mes» para la métrica, que empezaba en la «primera semana completa con meta», la contradecía. La corrigió y lo explicó en su resumen.
- **Cómo se resolvió:** se eligió la opción A: el porcentaje se limita a 100 % y las horas reales se muestran siempre. Los seis puntos se cerraron con las reglas RN-14 a RN-19, y RN-20 completó el alcance. Solo quedó abierto PA-01: la métrica de éxito no se puede medir dentro de la app.
- **Reflexión:** el valor del agente aquí no fue escribir el PRD, sino negarse a decidir por mí lo que era una decisión de producto. Dos avisos a tiempo ahorraron reescribir historias y criterios más adelante.

## Momento 4 · Fase 4 · Backlog: el primer borrador quedó incompleto

- **Qué se le pidió:** descomponer E2 en historias INVEST, criterios DADO / CUANDO / ENTONCES, tickets con DoD y dependencias, y una tabla de trazabilidad de las 20 reglas.
- **Qué hizo bien:** 9 historias con valor para la persona usuaria, las 20 reglas con al menos un criterio y cada test antes de su código en el orden de los tickets.
- **Qué faltó:** no había criterio ni ticket para el **refresco del progreso** al registrar, editar o eliminar una partida, ni para los estados de carga y error; la sección «Cómo trabajamos con el agente» del README no estaba en ningún ticket; tres criterios llevaban detalle técnico (UTC, «base de datos»); los tickets de deuda no estaban marcados; y no había ticket de despliegue ni de pull request.
- **Cómo se corrigió:** se revisó el borrador contra el enunciado y la rúbrica y se pidió una segunda pasada con cada ajuste y una búsqueda de control. Resultado: H-02.9 y H-02.10, el ticket T-31 y las marcas «(deuda P2)» y «(deuda P5)». La revisión también encontró un error de tecleo («a70 %») que el agente no había notado.
- **Reflexión:** un backlog que cumple su propia estructura puede aun así no cubrir el enunciado. Compararlo contra la rúbrica, y no solo contra sí mismo, fue lo que encontró los huecos.

## Momento 5 · Fase 5 · Specs con `/nueva-spec` y una revisión de nueve cambios

- **Qué se le pidió:** una spec de backend (T-01 a T-22) y otra de frontend (T-23 a T-30), con el nombre de cada test empezando por el id del criterio.
- **Qué hizo bien:** las 58 filas de criterios del backlog tenían verificación, las dos specs tenían sus tres tablas (criterio → verificación, ticket → archivos, supuestos) y todos los archivos de test citados aparecían en algún ticket, comprobado con un script.
- **Qué faltó:** una revisión posterior pidió nueve cambios: las dependencias de T-29, el nombre `Meta.test.ts`, una importación de modelos desde `dominio/`, la ambigüedad de «reactivar», y que T-30 debía recortar `fecha` a 10 caracteres y usar `partida.videojuego._id`.
- **Cómo se corrigió:** un prompt con los nueve cambios y una lista de comprobación. Las specs quedaron commiteadas **antes de cualquier código** (`2a352e9`, `80f0632`, `1a16251` y el ajuste `b92b918`).
- **Reflexión:** corregir la spec cuesta una línea; corregir el código que la siguió cuesta un ticket. Por eso conviene gastar la atención en esta fase.

## Momento 6 · Fase 6 (preparación) · Un fallo del harness detectado antes de usarlo

- **Qué pasó:** la skill `/commit-ticket` y la DoD común del backlog exigían `npm run check` y `npm test` en verde. Siete tickets de test (T-02, T-05, T-07, T-09, T-11, T-13 y T-15) terminan en rojo a propósito, porque el código llega en el ticket siguiente. La skill habría rechazado justo los commits que muestran «test antes que código».
- **Cómo se detectó:** al revisar el plan de la fase 6 contra la skill, antes de ejecutar ningún ticket. No lo notó el agente: fue un error mío al diseñar el harness.
- **Cómo se corrigió:** tres cambios en un solo prompt: una excepción de estado rojo en la DoD, una rama en el paso 3 de la skill para tickets de test (el rojo debe ser solo por falta del módulo, citando el mensaje; si es por sintaxis o por un test mal escrito, se detiene) y una regla en `AGENTS.md`. Commits `404a941` y `089f83d`. Los commits de test llevaron después «(rojo: falta T-xx)».
- **Reflexión:** un harness también hay que probarlo contra el flujo real antes de usarlo. Una regla razonable en abstracto («siempre en verde») chocaba con el método que la propia épica pedía.

## Momento 7 · Fase 6 · Backend por tickets (T-01 a T-22)

- **Qué se le pidió:** implementar los 22 tickets en orden de dependencias, test antes que código, con una parada de revisión por lote, un commit por ticket y una lista de comprobación en cada prompt para que verificara por su cuenta.
- **Qué hizo bien:** 22 commits, uno por ticket, con la marca `(deuda P2)` en T-02, T-03 y T-04, `(deuda P5)` en T-05 y T-06, y `(rojo: falta T-xx)` en los tests. Al final: 49 tests en 10 archivos en verde, `npm run check` sin errores, `npm run build` sin ningún `*.test.js` en `dist/`, y 36 de 36 comprobaciones manuales contra la base de desarrollo (juego sin partidas, cinco partidas con racha rota, errores 400, 404 y 409, y la cascada). Antes de T-06 guardó el resumen anterior y comprobó después que era idéntico (D-P5.5). En cada parada revisó que `dominio/` no importara Mongoose ni leyera la hora y que no existiera ruta para borrar metas.
- **Qué decidió por su cuenta (huecos de la spec):** guardar los hitos con `_id: false`; el texto del mensaje del error E11000, que la spec no definía; y editar el README con un script para que el hook de Prettier no lo reformateara entero. Los tres los declaró en su informe.
- **Cómo se resolvió:** las dos primeras decisiones pasaron a la spec como supuestos 13 y 14 (commit `be54c5e`) para que la spec no quedara por detrás del código.
- **Reflexión:** el agente no mintió sobre lo que hizo, pero tampoco preguntó antes de decidir. Los huecos de la spec aparecen siempre; lo importante es que lleguen a la spec y no se queden solo en el código.

## Momento 8 · Fases 7 y 9 · Frontend, revisión visual y auditoría

- **Qué se le pidió:** implementar T-23 a T-30 en tres lotes con parada de revisión, y después construir `docs/AUDITORIA.md` con una fila por criterio.
- **Qué hizo bien:** T-23 (deuda P2) devolvió el día de Ecuador a las 22:00 aunque en Tokio ya fuera el día siguiente, y la usuaria lo comprobó en el navegador con la zona de Windows cambiada. Cada lote llegó con build en verde, `fetch` solo en `api/`, ningún literal de color o fuente en el CSS nuevo y archivos solo de la tabla de la spec. Para los datos de revisión escribió un script con salvaguardas: aborta si la base no es `diario_gamer_dev`, no imprime la cadena de conexión, etiqueta todo con «PRUEBA-» y tiene `--limpiar`. Al registrar la revisión visual aplicó la regla de marcar ✓ solo los criterios con **todas** sus partes revisadas, y al revisar las capturas avisó de las que mostraban menos de lo que decía la auditoría.
- **El agente corrigió un error mío:** le pedí escribir un supuesto que decía que dos tickets modificaban el mismo archivo. Lo comparó con la tabla de la spec y con los commits, vio que no era cierto, se detuvo (como manda `AGENTS.md`) y propuso otra redacción.
- **Qué costó de más (error mío):** al partir los criterios por caso y convertir cada fila en una ficha de revisión, la revisión visual quedó en 51 fichas, muchas repetidas con tests del backend. Se redujo a lo que ningún test puede comprobar (estados, mensajes, refresco, avisos) y 18 criterios pasaron a «cubierto por test» con su test citado, registrado como supuesto 14 en la spec antes de cerrar la auditoría.
- **Qué quedó sin verificar:** H-02.10 (estados de carga y error con Network en el navegador) no se revisó en el navegador. Queda como «NO VERIFICADO EN NAVEGADOR», con la comprobación del agente en T-25 (render con datos de ejemplo) como única evidencia, y la nota de lo que no se probó. Lo mismo con la mitad de H-02.2 y H-03.2, que exigían un domingo por la noche: quedaron cubiertas por tests del backend.
- **Reflexión:** una auditoría honesta vale más que una completa. Preferí dejar una fila con «no verificado» y su motivo a marcar ✓ algo que nadie vio.

---

## Nota obligatoria · Un momento en que el agente se desvió de la spec

**Qué decía la spec:** la spec del frontend definía los textos de los mensajes de error, los estados y las etiquetas de cada pantalla, pero no definía el estado vacío del editor de hitos, el botón «Guardar partida» en modo edición, ni los mensajes de reserva que se muestran si la API no manda texto.

**Qué hizo el agente:** en el lote C (T-27 a T-30) añadió esos textos para poder cumplir la lista de comprobación del prompt, que pedía «carga, error y vacío en cada pantalla nueva»: «Esta meta aún no tiene hitos. Son opcionales.», «Guardar partida» y seis mensajes de reserva. Lo declaró al final del lote, en su informe. La causa estaba en mi prompt, que le pedía un estado vacío donde la spec no preveía ninguno.

**Cómo se detectó:** por el propio informe del agente y, después, al pedirle que comparara el texto que yo quería registrar con el código. Esa comparación encontró **más textos de los que había declarado**: las etiquetas «Meta de horas», «Volver al juego», «Hito {n}» y «Guardando…», dos mensajes de reserva más («No se pudo cargar el progreso de esta semana.» y «No se encontró el juego de esta partida.»), y tres mensajes que yo había asignado al ticket equivocado (T-28 y no T-27 o T-30).

**Qué se hizo:** se registró en la spec como el supuesto 12, con la lista completa y el ticket de cada texto, antes de cerrar la auditoría. Los textos se conservaron porque son de uso, no de diseño, y quitar cualquiera es un cambio de una línea.

**Un desvío anterior del mismo tipo (lote B):** T-26 necesitaba el estado del juego, que solo tiene `DetalleVideojuego.tsx`, y ese archivo no estaba en la fila de T-26. El agente lo resolvió solo: rehízo el commit de T-25 con `--amend` para declarar la prop `estadoJuego` allí, en lugar de detenerse a preguntar, que es lo que manda `AGENTS.md` cuando código y spec chocan. Lo contó en su informe. Se registró como el supuesto 11.

**Lo que me enseñó:** el agente no se desvía por descuido sino cuando la spec no responde a lo que necesita. En los dos casos el desvío fue pequeño, estaba declarado y se pudo absorber en la spec. Lo que lo evita es una spec con menos huecos y prompts que no pidan nada que la spec no prevea.
