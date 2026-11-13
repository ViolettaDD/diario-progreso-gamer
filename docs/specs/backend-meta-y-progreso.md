# Spec — Backend: meta y progreso semanal (E2)

## Contexto y alcance

Esta spec cubre el backend de la épica E2 «Metas y rachas».

**Fuentes:**

- `docs/prd/PRD.md`, con las reglas RN-01 a RN-20.
- `docs/backlog/E2-metas-y-rachas.md`.
- `docs/diagnostico.md` §5 a §7, de donde salen las rutas, las respuestas, los códigos de error y las carpetas.

**Lo que implementa:**

- **Historias:** H-01 a H-08, solo en su parte de backend: datos, reglas y respuestas.
- **Deudas con ciclo completo:** D-P2 (la fecha de una partida es un día de calendario y no puede ser futura) y D-P5 (el resumen pasa a ser una función pura).
- **Tickets:** T-01 a T-22.

**No cubre** la interfaz, que es de los tickets T-23 a T-31 y de la spec de frontend:

- los criterios de pantalla H-02.9, H-02.10, H-07.3, H-08.2 y D-P2.5;
- el aviso visual de H-07.2;
- la historia H-09, que es la recortable P8.

## Reglas

### DEBE

1. **Capas y dominio**
   - Las capas son rutas → controladores → servicios → modelos.
   - Los cálculos de semana, progreso, racha, hitos, resumen, fechas y estados que admiten meta viven en `backend/src/dominio/` como funciones puras.
   - «Hoy» llega a esas funciones por parámetro, como texto `AAAA-MM-DD`.
2. **Fecha de una partida** (D-P2, RN-03 y RN-10)
   - Al crear y al editar, el API acepta solo el formato `AAAA-MM-DD`, con una fecha que exista en el calendario. Cualquier otro valor responde 400 `validacion`.
   - Una fecha posterior al «hoy» de America/Guayaquil responde 400 `validacion`.
   - Se guarda a medianoche UTC, como hasta ahora.
   - El día de una partida guardada es `fecha.toISOString().slice(0, 10)`.
3. **«Hoy» en Ecuador**
   - `hoyEnEcuador(instante)` devuelve `AAAA-MM-DD` usando `Intl.DateTimeFormat` con `timeZone: 'America/Guayaquil'`.
   - Solo los servicios la llaman, pasándole `new Date()`.
4. **Semana** (RN-11): va de lunes a domingo. `semana.inicio` y `semana.fin` van en formato `AAAA-MM-DD`, con los dos extremos incluidos.
5. **Progreso de la semana** (diagnóstico §7.3, RN-02, RN-05, RN-12 y RN-18)
   - `horasSemana` = suma de `duracionMinutos` de los días de la semana ÷ 60, redondeada a 1 decimal.
   - `diasJugadosSemana` = cantidad de días distintos con partida en la semana.
   - `porcentajeHoras` = `min(100, Math.round(horasSemana / horasSemanales × 100))`, y vale `null` si no hay meta activa.
   - Un día que suma más de 24 h se acepta y se cuenta tal cual.
6. **Partidas futuras** (RN-10): las que tienen día posterior a «hoy» se ignoran en la semana, la racha, los hitos y el resumen.
7. **Racha** (RN-01, RN-02 y RN-20)
   - Se calcula sobre todos los días distintos con partida del juego, hasta «hoy».
   - `rachaActual` cuenta los días seguidos que terminan en hoy, si hoy hay partida, o en ayer, si no la hay. Si el último día jugado es anterior a ayer, vale 0.
   - `mejorRacha` es la secuencia más larga de días seguidos del historial, y siempre es ≥ `rachaActual`.
8. **Hitos** (RN-06 y RN-15)
   - Se calcula `alcanzado = avanceActual >= porcentajeObjetivo`.
   - `avanceActual` es el `porcentajeAvance` de la partida más reciente: la de mayor día y, si hay empate, la de mayor `createdAt`. Si no hay partidas, vale 0.
   - La «partida más reciente» se calcula con la misma función que usa el resumen.
   - Sin meta activa, `hitos: []`.
9. **Resumen** (D-P5): `GET /api/videojuegos/:id/resumen` mantiene sus campos `totalPartidas`, `horasTotales`, `ultimaPartida` y `porcentajeAvanceActual`, con las mismas fórmulas y redondeos. El servicio solo consulta y la función pura calcula.
10. **Modelo Meta** (diagnóstico §7.1, RN-13 y RN-17)
    - `videojuego`: ObjectId con `ref: 'Videojuego'`, obligatorio.
    - `horasSemanales`: número obligatorio, mayor que 0 y como máximo 100.
    - `diasPorSemana`: entero obligatorio, de 1 a 7.
    - `activa`: booleano, por defecto `true`.
    - `hitos`: arreglo embebido de 0 a 5 elementos.
      - `descripcion`: obligatoria, sin espacios al inicio ni al final, de 1 a 60 caracteres.
      - `porcentajeObjetivo`: número de 1 a 100.
      - Se permiten objetivos repetidos.
    - Tiene `timestamps` y la colección se llama `metas`.
    - Lleva el índice único parcial `{ videojuego: 1 }` con `partialFilterExpression: { activa: true }`.
11. **Rutas** (diagnóstico §7.2)

    | Método | Ruta                                    | Éxito                                                                    |
    | ------ | --------------------------------------- | ------------------------------------------------------------------------ |
    | POST   | `/api/metas`                            | 201 `{ meta, requestId }`                                                |
    | GET    | `/api/metas/:id`                        | 200 `{ meta, requestId }`                                                |
    | PUT    | `/api/metas/:id`                        | 200 `{ meta, requestId }`                                                |
    | PATCH  | `/api/metas/:id/desactivar`             | 200 `{ meta, requestId }`                                                |
    | GET    | `/api/videojuegos/:id/metas`            | 200 `{ metas, total, requestId }`, ordenadas por `createdAt` descendente |
    | GET    | `/api/videojuegos/:id/progreso-semanal` | 200 con la forma de la regla 12                                          |

    - `POST` acepta `videojuego`, `horasSemanales`, `diasPorSemana`, `hitos` y `activa`.
    - `PUT` acepta solo `horasSemanales`, `diasPorSemana`, `hitos` y `activa`. Ignora `videojuego` y cualquier otro campo.

12. **Respuesta de progreso semanal** (diagnóstico §7.3)

    ```
    { semana: { inicio, fin }, meta: { horasSemanales, diasPorSemana } | null, horasSemana,
      porcentajeHoras | null, diasJugadosSemana, rachaActual, mejorRacha,
      hitos: [{ descripcion, porcentajeObjetivo, alcanzado }] }
    ```

13. **Conflictos** (RN-07 y RN-09): responden 409 con tipo `conflicto`.
    - Crear una meta activa, o reactivarla con `PUT` y `activa: true`, cuando el juego ya tiene otra activa.
    - Crear o reactivar una meta en un juego «completado» o «abandonado».
    - Un error de clave duplicada E11000, que es la red de seguridad del índice.
14. **Errores**
    - `TipoError` incluye `conflicto`, y `new ApiError(409, …)` toma `conflicto` como tipo por defecto.
    - Si el juego no existe al crear una meta, responde 404 `referencia_inexistente`.
    - Si la meta o el juego no existen en las demás rutas, responde 404 `no_encontrado`.
    - Un id mal formado responde 400 `id_mal_formado`.
    - Un dato de meta inválido responde 400 `validacion`, con `detalles`.
    - Todo error tiene la forma `{ error, tipo, detalles?, requestId }`.
15. **Cascada** (RN-08): eliminar un videojuego borra en este orden: sus metas, sus partidas y el videojuego.
16. **Tests**
    - Se usa Vitest con versión exacta, y `npm test` ejecuta `vitest run`.
    - El nombre de cada test empieza con el id del criterio que verifica, por ejemplo `H-04.1: la racha sigue viva si ayer jugó (RN-01)`.
    - Los tests de dominio fijan «hoy» por parámetro.
17. **Verificación manual**
    - Cada criterio que necesita base de datos tiene en `backend/pruebas.http` una petición cuyo título (`### …`) empieza con el id del criterio.
    - Se ejecutan contra una base de desarrollo con su propio `MONGODB_DB`.

### NO DEBE

1. Convertir la fecha guardada de una partida a la hora de Ecuador para saber su día.
2. Llamar a `new Date()` sin argumentos ni a `Date.now()` dentro de `backend/src/dominio/`.
3. Importar Mongoose en `backend/src/dominio/`.
4. Guardar en la base `alcanzado`, rachas, progreso semanal o resumen.
5. Desactivar en silencio la meta activa anterior al crear o reactivar otra.
6. Exponer una ruta para borrar metas. `DELETE /api/metas/:id` responde el 404 de «ruta no encontrada» (RN-16).
7. Rechazar por el estado del juego la edición de una meta que no se está reactivando. RN-07 solo habla de crear y reactivar.
8. Usar transacciones de MongoDB, porque P4b está diferido.
9. Instalar supertest, mongodb-memory-server u otra dependencia distinta de Vitest.
10. Cambiar los nombres, los tipos o los redondeos de la respuesta del resumen.
11. Tocar deuda diferida: P4b, P6, P13, P14, P15, P16, P17 y P18.

## Criterio → verificación

Todas las rutas de archivo son relativas a `backend/`. «hoy = X» es el valor que el test pasa por parámetro.

| Criterio | Verificación                                                                                                                                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-01.1   | `src/modelos/Meta.model.test.ts` → «H-01.1: acepta una meta de 5 h, 4 días y el hito "Llegar al 50 %" (RN-13)» · `pruebas.http` → «H-01.1: crear meta → 201»                                                                                                                              |
| H-01.2   | `src/modelos/Meta.model.test.ts` → «H-01.2: rechaza 0 h y 100,5 h y acepta 0,5 h y 100 h (RN-13)»                                                                                                                                                                                         |
| H-01.3   | `src/modelos/Meta.model.test.ts` → «H-01.3: rechaza 0 y 8 días y días no enteros, y acepta 1 y 7 (RN-13)»                                                                                                                                                                                 |
| H-01.4   | `src/modelos/Meta.model.test.ts` → «H-01.4: rechaza un sexto hito y objetivos de 0 y 101, y acepta dos hitos del 50 % (RN-13)»                                                                                                                                                            |
| H-01.5   | `src/modelos/Meta.model.test.ts` → «H-01.5: rechaza texto de hito vacío, solo espacios o de 61 caracteres, y acepta 60 y recorta espacios (RN-17)»                                                                                                                                        |
| H-01.6   | `src/middlewares/errorHandler.test.ts` → «H-01.6: un ApiError 409 responde 409 conflicto con requestId (RN-09)» y «H-01.6: un error E11000 responde 409 conflicto (RN-09)» · `pruebas.http` → «H-01.6: segunda meta activa → 409 conflicto»                                               |
| H-01.7   | `src/dominio/meta.test.ts` → «H-01.7: completado y abandonado no admiten meta activa; jugando y pausado sí (RN-07)» · `pruebas.http` → «H-01.7: crear meta en juego completado → 409 conflicto» y «H-01.7: crear meta en juego pausado → 201»                                             |
| H-02.1   | `src/dominio/semana.test.ts` → «H-02.1: con hoy viernes 13 la semana va del 2026-11-09 al 2026-11-15 (RN-11)» · `src/dominio/progreso.test.ts` → «H-02.1: con meta de 5 h suma 3,5 h y 70 % sin la partida del domingo 8 (RN-11)»                                                         |
| H-02.2   | `src/dominio/progreso.test.ts` → «H-02.2: la partida de 150 min del domingo 15 suma 2,5 h a la semana del 9 al 15 y el lunes 16 la semana empieza en 0 h (RN-03, RN-11)»                                                                                                                  |
| H-02.3   | `src/dominio/progreso.test.ts` → «H-02.3: 7 h con meta de 5 h da 100 % y horasSemana 7 (RN-05)»                                                                                                                                                                                           |
| H-02.4   | `src/dominio/progreso.test.ts` → «H-02.4: 5 h con meta de 8 h da 63 % y con meta de 4 h da 100 % (RN-04)» · `pruebas.http` → «H-02.4: editar meta a 4 h y consultar progreso → 100»                                                                                                       |
| H-02.5   | `src/dominio/progreso.test.ts` → «H-02.5: con hoy miércoles 11 la partida del viernes 13 no suma (RN-10)»                                                                                                                                                                                 |
| H-02.6   | `src/dominio/progreso.test.ts` → «H-02.6: sin meta da 4 h y porcentaje null; con meta de 5 h y sin partidas da 0 h y 0 % (RN-12)»                                                                                                                                                         |
| H-02.7   | `src/dominio/progreso.test.ts` → «H-02.7: las partidas previas a la meta cuentan: 3,5 h de 5 h y 70 % (RN-14)» · `pruebas.http` → «H-02.7: crear meta con partidas previas y consultar progreso → 70»                                                                                     |
| H-02.8   | `src/dominio/progreso.test.ts` → «H-02.8: partidas de 24 h y 10 h el mismo día dan 34 h y 100 % con meta de 10 h (RN-18)»                                                                                                                                                                 |
| H-02.9   | Sin verificación en esta spec (frontend, T-25)                                                                                                                                                                                                                                            |
| H-02.10  | Sin verificación en esta spec (frontend, T-25)                                                                                                                                                                                                                                            |
| H-03.1   | `src/dominio/progreso.test.ts` → «H-03.1: dos partidas el lunes 9 y una el miércoles 11 dan 2 días (RN-02)»                                                                                                                                                                               |
| H-03.2   | `src/dominio/progreso.test.ts` → «H-03.2: el domingo 15 cuenta como día de la semana del 9 al 15 y el lunes 16 da 0 días (RN-03, RN-11)»                                                                                                                                                  |
| H-03.3   | `src/dominio/progreso.test.ts` → «H-03.3: sin meta da 3 días; con meta de 4 días y sin partidas da 0 días (RN-12)»                                                                                                                                                                        |
| H-03.4   | `src/dominio/progreso.test.ts` → «H-03.4: con partidas el lunes 9 y el miércoles 11 y meta de 3 días da 2 días (RN-14)»                                                                                                                                                                   |
| H-03.5   | `src/dominio/progreso.test.ts` → «H-03.5: dos partidas del martes 10 que suman 34 h cuentan 1 día (RN-18)»                                                                                                                                                                                |
| H-04.1   | `src/dominio/racha.test.ts` → «H-04.1: la racha sigue viva si ayer jugó: 2 con hoy viernes 13 sin partida (RN-01)»                                                                                                                                                                        |
| H-04.2   | `src/dominio/racha.test.ts` → «H-04.2: con hoy sábado 14 y última partida el jueves 12 la racha es 0 (RN-01)»                                                                                                                                                                             |
| H-04.3   | `src/dominio/racha.test.ts` → «H-04.3: con partidas el 11, el 12 y el 13 y hoy 13 la racha es 3 (RN-01)»                                                                                                                                                                                  |
| H-04.4   | `src/dominio/racha.test.ts` → «H-04.4: tres partidas el jueves 12 y una el viernes 13 dan racha 2 (RN-02)»                                                                                                                                                                                |
| H-04.5   | `src/dominio/racha.test.ts` → «H-04.5: racha actual 6 desde el domingo 8 y mejor racha 12 de septiembre, con mejor ≥ actual (RN-20)»                                                                                                                                                      |
| H-04.6   | `src/dominio/racha.test.ts` → «H-04.6: con hoy jueves 12 la partida del viernes 13 se ignora: actual 2 y mejor 2 (RN-10)»                                                                                                                                                                 |
| H-04.7   | `src/dominio/racha.test.ts` → «H-04.7: sin partidas da actual 0 y mejor 0; con partidas el 12 y el 13 da 2 (RN-12)»                                                                                                                                                                       |
| H-05.1   | `src/dominio/hitos.test.ts` → «H-05.1: el hito del 50 % con avance 60 está alcanzado (RN-06)»                                                                                                                                                                                             |
| H-05.2   | `src/dominio/hitos.test.ts` → «H-05.2: una partida más reciente con 40 % deja el hito del 50 % pendiente (RN-06)»                                                                                                                                                                         |
| H-05.3   | `src/dominio/hitos.test.ts` → «H-05.3: con avance exacto de 50 el hito del 50 % está alcanzado (RN-06)»                                                                                                                                                                                   |
| H-05.4   | `src/dominio/hitos.test.ts` → «H-05.4: sin partidas los hitos del 25 % y el 50 % están pendientes (RN-12)»                                                                                                                                                                                |
| H-05.5   | `src/dominio/hitos.test.ts` → «H-05.5: sin meta activa la lista de hitos es vacía (RN-15)» · `pruebas.http` → «H-05.5: progreso tras desactivar la meta → hitos []»                                                                                                                       |
| H-06.1   | `pruebas.http` → «H-06.1: PUT meta a 4 h → 200, la misma meta» y «H-06.1: progreso tras editar → porcentajeHoras 100». El cálculo lo cubre el test H-02.4.                                                                                                                                |
| H-06.2   | `pruebas.http` → «H-06.2: desactivar meta → 200 activa false», «H-06.2: listar metas del juego → la inactiva con horasSemanales, diasPorSemana y createdAt» y «H-06.2: DELETE meta → 404 ruta no encontrada»                                                                              |
| H-06.3   | Tests H-05.5 y H-02.6 · `pruebas.http` → «H-06.3: progreso sin meta activa → meta null y porcentajeHoras null»                                                                                                                                                                            |
| H-06.4   | `src/dominio/hitos.test.ts` → «H-06.4: con avance 30 el hito del 25 % está alcanzado y el del 50 % pendiente (RN-15)» · `pruebas.http` → «H-06.4: reactivar meta en juego pausado → 200 activa true»                                                                                      |
| H-06.5   | `pruebas.http` → «H-06.5: reactivar con otra meta activa → 409 conflicto»                                                                                                                                                                                                                 |
| H-06.6   | Test H-01.7 · `pruebas.http` → «H-06.6: reactivar meta en juego completado → 409 conflicto»                                                                                                                                                                                               |
| H-06.7   | `pruebas.http` → «H-06.7: listar metas del juego → total 2, una activa y una inactiva»                                                                                                                                                                                                    |
| H-07.1   | `pruebas.http` → «H-07.1: juego a abandonado y obtener su meta → activa true»                                                                                                                                                                                                             |
| H-07.2   | `src/dominio/progreso.test.ts` → «H-07.2: 2 h en 1 día con meta de 6 h y 3 días dan 33 % y 1 día (RN-19)» · `pruebas.http` → «H-07.2: progreso de juego completado con meta activa → 200 con meta». El aviso visual es del frontend.                                                      |
| H-07.3   | Sin verificación en esta spec (aviso visual, frontend, T-26). El dato que lo apaga, `meta: null`, lo cubre H-06.3.                                                                                                                                                                        |
| H-08.1   | `pruebas.http` → «H-08.1: eliminar juego con 2 metas y 12 partidas → 204», «H-08.1: obtener cada meta del juego eliminado → 404» y «H-08.1: obtener una partida del juego eliminado → 404»                                                                                                |
| H-08.2   | Sin verificación en esta spec (confirmación en pantalla, frontend, T-29)                                                                                                                                                                                                                  |
| D-P2.1   | `src/dominio/fechas.test.ts` → «D-P2.1: "2026-11-12" es una fecha de calendario válida (RN-03)» · `pruebas.http` → «D-P2.1: registrar partida con la fecha de hoy → 201»                                                                                                                  |
| D-P2.2   | `src/dominio/fechas.test.ts` → «D-P2.2: rechaza fecha con hora, con zona, texto, vacía y 2026-02-30 (RN-03)» · `pruebas.http` → «D-P2.2: registrar partida con hora → 400 validacion» y «D-P2.2: editar partida con fecha "ayer" → 400 validacion»                                        |
| D-P2.3   | `src/dominio/fechas.test.ts` → «D-P2.3: a las 21:00 del jueves 12 en Ecuador hoy es el 12, el viernes 13 es futuro y el jueves 12 no (RN-10)» · `pruebas.http` → «D-P2.3: registrar partida con fecha futura → 400 validacion» y «D-P2.3: editar partida a fecha futura → 400 validacion» |
| D-P2.4   | `src/dominio/fechas.test.ts` → «D-P2.4: a las 23:59 del lunes 9 en Ecuador hoy es 2026-11-09 (RN-11)» · `src/dominio/semana.test.ts` → «D-P2.4: con hoy lunes 9 la semana va del 2026-11-09 al 2026-11-15 (RN-11)»                                                                        |
| D-P2.5   | Sin verificación en esta spec (frontend, T-23)                                                                                                                                                                                                                                            |
| D-P5.1   | `src/dominio/resumen.test.ts` → «D-P5.1: sin partidas da totalPartidas 0, horasTotales 0, ultimaPartida null y avance 0 (RN-12)»                                                                                                                                                          |
| D-P5.2   | `src/dominio/resumen.test.ts` → «D-P5.2: 870 minutos dan 14,5 h y 100 minutos dan 1,67 h»                                                                                                                                                                                                 |
| D-P5.3   | `src/dominio/resumen.test.ts` → «D-P5.3: con dos partidas de la misma fecha gana la registrada después: avance 60 (RN-06)»                                                                                                                                                                |
| D-P5.4   | `src/dominio/resumen.test.ts` → «D-P5.4: una partida con fecha futura no suma horas ni define el avance (RN-10)»                                                                                                                                                                          |
| D-P5.5   | `pruebas.http` → «D-P5.5: resumen de un juego con partidas» y «D-P5.5: resumen de un juego sin partidas». Se guardan las respuestas antes de T-06 y se comparan después: deben ser idénticas.                                                                                             |

**Casos adicionales sin criterio propio**, pedidos por las DoD de los tickets:

- `src/dominio/humo.test.ts` → «T-01: Vitest funciona».
- `src/dominio/semana.test.ts` → «T-07: la semana del 2026-12-02 va del 2026-11-30 al 2026-12-06» y «T-07: la semana del 2027-01-01 va del 2026-12-28 al 2027-01-03».
- `src/middlewares/errorHandler.test.ts` → «T-15: los 400, 404 y 500 existentes no cambian».
- `pruebas.http` → «T-20: progreso de un juego inexistente → 404» y «T-20: progreso con id mal formado → 400».

## Ticket → archivos

Las rutas son relativas a `backend/`, salvo el README.

| Ticket | Archivos que se crean o modifican                                                                                                                                                                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-01   | `package.json` (Vitest con versión exacta en `devDependencies`, script `"test": "vitest run"`, `build` pasa a `tsc -p tsconfig.build.json`), `package-lock.json`, `tsconfig.build.json` (nuevo: extiende `tsconfig.json` y excluye `src/**/*.test.ts`), `src/dominio/humo.test.ts` |
| T-02   | `src/dominio/fechas.test.ts`                                                                                                                                                                                                                                                       |
| T-03   | `src/dominio/fechas.ts`                                                                                                                                                                                                                                                            |
| T-04   | `src/services/partidas.service.ts`, `pruebas.http`                                                                                                                                                                                                                                 |
| T-05   | `src/dominio/resumen.test.ts`                                                                                                                                                                                                                                                      |
| T-06   | `src/dominio/resumen.ts`, `src/services/partidas.service.ts`                                                                                                                                                                                                                       |
| T-07   | `src/dominio/semana.test.ts`                                                                                                                                                                                                                                                       |
| T-08   | `src/dominio/semana.ts`                                                                                                                                                                                                                                                            |
| T-09   | `src/dominio/progreso.test.ts`                                                                                                                                                                                                                                                     |
| T-10   | `src/dominio/progreso.ts`                                                                                                                                                                                                                                                          |
| T-11   | `src/dominio/racha.test.ts`                                                                                                                                                                                                                                                        |
| T-12   | `src/dominio/racha.ts`                                                                                                                                                                                                                                                             |
| T-13   | `src/dominio/hitos.test.ts`, `src/dominio/meta.test.ts`                                                                                                                                                                                                                            |
| T-14   | `src/dominio/hitos.ts`, `src/dominio/meta.ts`                                                                                                                                                                                                                                      |
| T-15   | `src/modelos/Meta.model.test.ts`, `src/middlewares/errorHandler.test.ts`                                                                                                                                                                                                           |
| T-16   | `src/apiError.ts`, `src/middlewares/errorHandler.ts`                                                                                                                                                                                                                               |
| T-17   | `src/modelos/Meta.model.ts`                                                                                                                                                                                                                                                        |
| T-18   | `src/services/metas.service.ts`, `src/controllers/metas.controller.ts`, `src/routes/metas.routes.ts`, `src/app.ts`                                                                                                                                                                 |
| T-19   | `src/services/metas.service.ts`, `src/controllers/metas.controller.ts`, `src/routes/metas.routes.ts`, `src/routes/videojuegos.routes.ts`, `src/controllers/videojuegos.controller.ts`                                                                                              |
| T-20   | `src/services/progreso.service.ts`, `src/routes/videojuegos.routes.ts`, `src/controllers/videojuegos.controller.ts`                                                                                                                                                                |
| T-21   | `src/services/videojuegos.service.ts`                                                                                                                                                                                                                                              |
| T-22   | `README.md` (raíz del repositorio), `pruebas.http`, `.env.example`                                                                                                                                                                                                                 |

## Supuestos y puntos abiertos

**Supuestos.** Ninguno de estos puntos está en el PRD; la spec los da por buenos.

1. **Forma de las partidas en el dominio.** Las funciones puras reciben partidas planas `{ dia: 'AAAA-MM-DD', duracionMinutos, porcentajeAvance, createdAt }`. Los servicios las arman desde documentos `lean()` con `fecha.toISOString().slice(0, 10)`.
2. **Base del porcentaje.** `porcentajeHoras` se calcula sobre `horasSemana` ya redondeada a 1 decimal, como dice el diagnóstico §7.3. Así, 5 de 8 h da 63 % (62,5 se redondea hacia arriba).
3. **Edición de metas.** `PUT /api/metas/:id` carga la meta y la guarda con `save()`, en lugar de `findByIdAndUpdate`. Así corren todas las validaciones del esquema y el recorte de espacios de los hitos.
4. **Desactivar dos veces.** `PATCH /api/metas/:id/desactivar` sobre una meta ya inactiva responde 200 y no cambia nada.
5. **Juegos terminados.** Se puede editar una meta activa de un juego «completado» o «abandonado», porque RN-07 solo restringe crear y reactivar.
6. **Forma de la respuesta de progreso.** Va sin envoltorio y sin `requestId`, igual que la respuesta actual del resumen.
7. **Orden de los hitos.** Se devuelven en el orden en que se guardaron.
8. **Mensajes de los 409.**
   - RN-09: «Este juego ya tiene una meta activa. Edítala o desactívala antes de crear otra».
   - RN-07: «Solo los juegos en estado jugando o pausado pueden tener una meta activa».
9. **Dos configuraciones de TypeScript.** `npm run check` sigue con `tsc --noEmit` sobre `tsconfig.json`, así que también revisa los tests. `npm run build` usa `tsconfig.build.json`, que excluye los tests de `dist/`.
10. **Test de humo.** El de T-01 queda en el repositorio.

**Puntos abiertos.**

1. Si el test de humo se borra al cerrar la épica.
2. El cambio de `build` en `package.json` afecta a Render, porque su comando es `npm run build`. Hay que confirmar que el build sigue funcionando allí en T-31.
