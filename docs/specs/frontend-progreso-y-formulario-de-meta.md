# Spec — Frontend: progreso semanal y formulario de meta (E2)

## Contexto y alcance

Esta spec cubre la **parte visible** de la épica E2 «Metas y rachas» en el frontend: React, TypeScript y Vite, sin librerías de UI.

**Fuentes:**

- `docs/prd/PRD.md`, con las reglas RN-01 a RN-20.
- `docs/backlog/E2-metas-y-rachas.md`.
- `DESIGN.md`.
- La spec de backend `docs/specs/backend-meta-y-progreso.md`, que define las rutas y las respuestas que se consumen aquí.

**Lo que implementa:**

- **Historias**, en su parte visible: H-01, H-02 (incluidas H-02.9 y H-02.10), H-03, H-04, H-05, H-06, H-07 y H-08. Además, H-09, la edición de partidas: es recortable y corresponde a P8.
- **Deuda:** D-P2.5. `hoyISO` usa la hora de Ecuador (P2/P9).
- **Tickets:** T-23 a T-30. T-31 (despliegue y pull request) no necesita spec.

El frontend **muestra** lo que calcula el backend y no recalcula nada. Las reglas de cálculo y sus tests automatizados están en la spec de backend. Aquí cada criterio se verifica con una **revisión visual** que tiene pasos concretos. El frontend no tiene tests automatizados (supuesto del diagnóstico §9: Vitest solo en el backend).

## Reglas

### DEBE

1. **Llamadas a la API**
   - Todas pasan por `frontend/src/api/http.ts`.
   - Las de metas y progreso viven en `frontend/src/api/metasApi.ts` y son seis: `crearMeta`, `obtenerMeta`, `actualizarMeta`, `desactivarMeta`, `listarMetasDeVideojuego` y `obtenerProgresoSemanal`.
2. **Tokens de E2.** En T-24, y antes de usarlos, se añaden a `:root` de `estilos.css`, tal como dice DESIGN.md:
   - `--meta-ok: var(--jugando)`
   - `--meta-pendiente: var(--tinta-suave)`
   - `--racha: var(--acento)`
   - `--tinta-oscura: #1a0c00`
3. **Estilos nuevos**
   - Toda regla CSS nueva usa solo variables de `:root` para colores y sombras.
   - Las clases nuevas llevan el prefijo `progreso-`, `meta-`, `hito-` o `historial-`.
4. **«Hoy» por defecto en el formulario de partida** (D-P2.5): `hoyISO()` devuelve la fecha actual de America/Guayaquil en formato `AAAA-MM-DD` usando `Intl.DateTimeFormat` con `timeZone: 'America/Guayaquil'`. No depende de la zona horaria del equipo.
5. **Sección de progreso**
   - En el detalle del juego, justo debajo del bloque «Tu progreso» y encima de las columnas de logros y partidas, hay un `.panel` con el título h2 «Esta semana».
   - Muestra el rango de la semana con el formato «Semana del 9 al 15 de noviembre».
6. **Con meta activa**, la sección muestra:
   - **Horas**: el texto «X h de Y h», con coma decimal y como máximo 1 decimal, más el porcentaje «N %».
   - **Barra de horas**: usa el patrón `.xp` de 10 segmentos, con `llenos = Math.round(porcentajeHoras / 10)`. Lleva `role="progressbar"`, `aria-label="Horas de la semana"`, `aria-valuenow={porcentajeHoras}`, `aria-valuemin={0}` y `aria-valuemax={100}`.
   - **Días**: el texto «N de M días».
7. **Sin meta activa**, la sección muestra:
   - las horas como «X h esta semana» y los días como «N días jugados», en singular «1 día jugado»;
   - **sin barra, sin porcentaje y sin «de N»** (RN-12);
   - un `.estado-vacio` con el texto «Aún no tienes una meta para este juego. Crea una para seguir tu semana.» y el enlace «Crear meta» con clase `.boton-secundario`.
8. **Racha.** Siempre se muestran «Racha actual» y «Mejor racha», como cifras en Orbitron con color `var(--racha)`, seguidas de «día» o «días» según el número.
9. **Hitos** (RN-06 y RN-15)
   - Con meta activa, se muestra una lista `<ul>` con cada hito: su texto, su objetivo («50 %») y su estado **escrito**, «Alcanzado» o «Pendiente».
   - El estado usa el color `var(--meta-ok)` o `var(--meta-pendiente)`.
   - Sin meta activa no se muestra ninguna lista de hitos.
   - Una meta con 0 hitos no muestra la lista.
10. **Aviso de juego terminado** (RN-19)
    - Si hay meta activa y el estado del juego es «completado» o «abandonado», se muestra dentro de la sección un párrafo con `role="status"`: «Este juego está {completado|abandonado} y su meta sigue activa. Desactívala cuando ya no la necesites.»
    - Desaparece cuando no hay meta activa.
11. **Estados de la sección** (H-02.10)
    - El progreso se pide **aparte** del juego, del resumen y de las partidas.
    - Mientras llega, la sección muestra `EstadoCarga` cargando.
    - Si falla, muestra el error con «Reintentar», que vuelve a pedir **solo** el progreso. El resto del detalle sigue visible.
12. **Refresco** (H-02.9)
    - Al eliminar una partida desde el detalle, se vuelven a pedir el resumen, las partidas, el progreso y las metas, sin recargar la página.
    - Al registrar o editar una partida, el formulario navega al detalle del juego, que pide todo de nuevo al montarse.
13. **Formulario de meta**
    - **Rutas:** `/videojuegos/:id/meta/nueva` para crear y `/metas/:id/editar` para editar.
    - **Campos:**
      - «Horas por semana»: número que admite decimales.
      - «Días por semana»: número entero.
      - Hitos: texto y «Objetivo (%)», con los botones «Agregar hito» y «Quitar».
    - El formulario lleva `noValidate` y valida al enviar.
    - Antes de validar y de enviar, recorta los espacios del inicio y del final del texto de cada hito.
14. **Mensajes de validación del formulario de meta.** Se muestran sobre el formulario con `role="alert"`, antes de llamar a la API:
    - Horas ≤ 0 o > 100: «Las horas por semana deben ser mayores que 0 y como máximo 100.»
    - Días no enteros o fuera de 1–7: «Los días por semana deben ser un número entero entre 1 y 7.»
    - Objetivo fuera de 1–100: «El objetivo de cada hito debe estar entre 1 % y 100 %.»
    - Texto vacío o de más de 60 caracteres tras el recorte: «Cada hito necesita un texto de 1 a 60 caracteres.»
15. **Límite de hitos.** Con 5 hitos, «Agregar hito» queda deshabilitado y se lee «Máximo 5 hitos».
16. **Errores de la API en el formulario**
    - Si la API rechaza la meta, por ejemplo con los 409 de RN-07 o RN-09, se muestra su mensaje sobre el formulario con `role="alert"`.
    - Si no hay mensaje, se usa «No se pudo guardar la meta. Revisa los datos e inténtalo de nuevo.»
17. **Acción principal.** «Guardar meta», «Crear meta» y «Reactivar» usan `.boton-secundario` (DESIGN.md, contraste 8.3:1).
18. **Desactivar**
    - Con meta activa, la sección ofrece «Editar meta», un enlace al formulario, y «Desactivar meta».
    - «Desactivar meta» pide confirmación: «¿Desactivar la meta de {nombre del juego}?».
    - Al confirmar, desactiva la meta y vuelve a pedir el progreso y las metas.
19. **Historial**
    - Si el juego tiene metas inactivas, debajo de la sección de progreso aparece un `.panel` con el título h2 «Metas anteriores».
    - Cada meta inactiva se muestra como «{horas} h · {días} días · creada el {día} de {mes}». La fecha sale de `createdAt` en America/Guayaquil, por ejemplo «creada el 2 de noviembre».
    - Cada una tiene el botón «Reactivar». Si la API rechaza la reactivación, su mensaje se muestra con `role="alert"`.
20. **Confirmación al borrar un juego** (RN-08): «¿Eliminar "{nombre}", sus {n} meta(s) y sus {m} partida(s)? No se puede deshacer.»
21. **Editar partida** (T-30, recortable)
    - La ruta es `/partidas/:id/editar` y reutiliza `FormularioPartida` en modo edición.
    - El título es «Editar partida» y los datos de la partida vienen precargados.
    - Usa `obtenerPartida` y `actualizarPartida`, que ya existen.
    - Hay un botón «Editar» junto a «Eliminar» en la tabla de partidas del detalle y en la lista general de partidas.
    - Al guardar, navega al detalle del juego. Los errores de la API se muestran con `role="alert"`.
22. **Accesibilidad**
    - El foco es visible en todos los controles nuevos (`:focus-visible` existente).
    - El texto nuevo solo usa los colores `--tinta`, `--tinta-suave`, `--racha`, `--meta-ok`, `--meta-pendiente` y `--segundo-oscuro`. Todos superan 4.5:1 sobre fondo oscuro según DESIGN.md, y `--meta-ok` (`--jugando`) llega a ≈9:1.
    - Cada hito muestra su estado con la palabra «Alcanzado» o «Pendiente», además del color.

### NO DEBE

1. Hacer cálculos de negocio en `frontend/src/`. Ningún archivo suma `duracionMinutos`, compara `porcentajeAvance` con `porcentajeObjetivo` ni calcula fechas de la semana. La única operación sobre datos del progreso es `Math.round(porcentajeHoras / 10)` para los segmentos de la barra.
2. Llamar a `fetch` fuera de `frontend/src/api/`.
3. Usar colores literales (`#…`, `rgb()`, `rgba()`) en reglas CSS nuevas.
4. Instalar librerías de UI, de gráficos o de fechas, ni cualquier otra dependencia.
5. Usar fuentes nuevas ni Bangers.
6. Añadir reglas `animation` o `@keyframes`, o `transition` de más de 200 ms, en el CSS nuevo. Tampoco usar un emoji sin texto que diga lo mismo.
7. Inventar estados de juego nuevos.
8. Mostrar gráficos históricos ni semanas pasadas.
9. Ofrecer un botón o una acción para **borrar** una meta (RN-16).
10. Mostrar códigos HTTP en pantalla.
11. Usar `.boton` (el primario) en las acciones nuevas de E2.
12. Usar `--primario-oscuro` como color de texto ni `--tinta-suave` sobre el degradado de `.resumen`.
13. Modificar reglas CSS que ya existían fuera de `:root`, porque P6 y P13 están diferidos. Solo se añaden reglas nuevas y los 4 tokens.
14. Esconder el botón «Crear meta» en juegos completados o abandonados. Quien rechaza es la API (RN-07).

## Criterio → verificación

**Preparación común**

- Backend local apuntando a la base de desarrollo, con su propio `MONGODB_DB`, y frontend con `npm run dev`.
- Juego de prueba «Hades», estado «jugando», sin metas ni partidas, salvo que el criterio diga otra cosa.
- **Notación:**
  - **H** es el día de la revisión, H-1 es ayer, y así sucesivamente.
  - **L** es el lunes de la semana en curso, y L-1 es el domingo anterior.
  - Las partidas se registran desde «Registrar partida» con fechas pasadas.
- **Día de la revisión:** los casos de semana se revisan un **viernes** (H = L+4), igual que los ejemplos del backlog, salvo que la fila diga otra cosa.

| Criterio | Verificación                                                                                                                                                                                                                                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-01.1   | Revisión visual: en el detalle de Hades, pulsar «Crear meta», escribir 5 horas y 4 días, «Agregar hito» con «Llegar al 50 %» y 50, y pulsar «Guardar meta». Debe volver al detalle y verse «0 h de 5 h», «0 de 4 días» y el hito «Llegar al 50 % · 50 % · Pendiente».                                                                                                             |
| H-01.2   | Revisión visual: en el formulario, guardar con 0 horas y luego con 100,5. Debe verse dos veces el mensaje de horas de la regla 14, sin salir del formulario. Con 0,5 y luego con 100 (en dos juegos sin meta), la meta se guarda.                                                                                                                                                 |
| H-01.3   | Revisión visual: guardar con 0 días y con 8 días. Debe verse el mensaje de días de la regla 14. Con 1 y con 7 se guarda.                                                                                                                                                                                                                                                          |
| H-01.4   | Revisión visual: agregar 5 hitos. «Agregar hito» queda deshabilitado con «Máximo 5 hitos». Un hito con objetivo 0 o 101 muestra el mensaje de objetivo. Dos hitos con objetivo 50 se guardan y se ven los dos.                                                                                                                                                                    |
| H-01.5   | Revisión visual: un hito con texto vacío, otro con solo espacios y otro con 61 caracteres muestran el mensaje de texto. Con 60 caracteres se guarda. «␣␣Llegar al 50 %␣» aparece en el detalle como «Llegar al 50 %».                                                                                                                                                             |
| H-01.6   | Revisión visual: con Hades con meta activa de 5 h, abrir directamente `/videojuegos/{id}/meta/nueva`, poner 8 h y guardar. Debe verse sobre el formulario el mensaje de la API («Este juego ya tiene una meta activa…»), sin código HTTP. Volver al detalle: sigue «de 5 h».                                                                                                      |
| H-01.7   | Revisión visual: marcar Hades como «completado» (sin meta), pulsar «Crear meta» y guardar 5 h / 4 días. Debe verse el mensaje de la API («Solo los juegos en estado jugando o pausado…»). Con Hades en «pausado» la misma meta se guarda.                                                                                                                                         |
| H-02.1   | Revisión visual (viernes): meta de 5 h. Partidas en L-1 de 180 min, en L de 120 min y en L+2 de 90 min. «Esta semana» muestra «Semana del {L} al {L+6}», «3,5 h de 5 h», «70 %» y 7 segmentos llenos.                                                                                                                                                                             |
| H-02.2   | Revisión visual un **domingo después de las 19:00 en Ecuador**, cuando en UTC ya es lunes: registrar una partida de hoy de 150 min. Debe sumar 2,5 h a la semana que termina hoy, y el rango termina en el domingo de hoy. Al día siguiente (lunes), la sección muestra la semana nueva con «0 h de …». La regla del cálculo la cubre el test de backend H-02.2.                  |
| H-02.3   | Revisión visual: meta de 5 h y partidas de la semana que suman 420 min. Se ven «7 h de 5 h», «100 %» y los 10 segmentos llenos, con `aria-valuenow` = 100 (inspeccionar el elemento).                                                                                                                                                                                             |
| H-02.4   | Revisión visual: meta de 8 h y 300 min jugados esta semana. Se ve «63 %». «Editar meta», cambiar a 4 h y guardar: se ve «5 h de 4 h» y «100 %», y «Metas anteriores» no gana ninguna entrada nueva.                                                                                                                                                                               |
| H-02.5   | Revisión visual: insertar en la base de desarrollo (Atlas, Data Explorer) una partida de Hades con fecha H+1 a medianoche UTC y 120 min, y registrar otra en L de 180 min. La sección muestra 3 h: la futura no suma.                                                                                                                                                             |
| H-02.6   | Revisión visual: Hades sin meta y con partidas en L (60), L+3 (90) y L+4 (90). Se ve «4 h esta semana», «3 días jugados», sin barra, sin «%» y con el estado vacío «Crear meta». Otro juego con meta de 5 h y sin partidas muestra «0 h de 5 h» y «0 %».                                                                                                                          |
| H-02.7   | Revisión visual: Hades sin meta con partidas en L (120) y L+2 (90). Crear una meta de 5 h. Al volver al detalle se ve «3,5 h de 5 h» y «70 %».                                                                                                                                                                                                                                    |
| H-02.8   | Revisión visual: meta de 10 h. Registrar dos partidas en L+1, de 1440 y 600 min. Las dos se aceptan y se ve «34 h de 10 h» y «100 %».                                                                                                                                                                                                                                             |
| H-02.9   | Revisión visual: meta de 5 h y partidas de la semana que suman 210 min («3,5 h de 5 h», 70 %). Desde el detalle, «Registrar partida» de hoy con 60 min: al volver se ve «4,5 h de 5 h» y «90 %» sin pulsar F5. «Eliminar» esa partida en la tabla del detalle: vuelve a «3,5 h de 5 h» y 70 % sin recargar. La edición de la duración se verifica en H-09.4.                      |
| H-02.10  | Revisión visual: en DevTools, red con «Slow 3G» → al abrir el detalle, la sección «Esta semana» muestra «Cargando…» mientras el resto ya está. En DevTools, «Block request URL» con `progreso-semanal` y recargar → la sección muestra el error y «Reintentar», y el resumen, los logros y las partidas siguen visibles. Desbloquear y pulsar «Reintentar» → aparece el progreso. |
| H-03.1   | Revisión visual: meta de 4 días. Partidas en L de 30 y 90 min y en L+2 de 60 min. Se ve «2 de 4 días».                                                                                                                                                                                                                                                                            |
| H-03.2   | Revisión visual con los mismos pasos que H-02.2: el domingo por la noche, la partida de hoy cuenta como día («N de 4 días» sube en 1). El lunes siguiente se ve «0 de 4 días».                                                                                                                                                                                                    |
| H-03.3   | Revisión visual: sin meta y con partidas en L, L+3 y L+4 → «3 días jugados», sin «de N». Con meta de 4 días y sin partidas → «0 de 4 días».                                                                                                                                                                                                                                       |
| H-03.4   | Revisión visual: partidas en L y L+2, sin meta. Crear una meta de 3 días → se ve «2 de 3 días».                                                                                                                                                                                                                                                                                   |
| H-03.5   | Revisión visual: dos partidas en L+1 de 1440 y 600 min → los días de la semana suben en 1, no en 2.                                                                                                                                                                                                                                                                               |
| H-04.1   | Revisión visual: partidas en H-2 y H-1, ninguna hoy → «Racha actual 2 días».                                                                                                                                                                                                                                                                                                      |
| H-04.2   | Revisión visual: partidas en H-3 y H-2, ninguna en H-1 ni hoy → «Racha actual 0 días».                                                                                                                                                                                                                                                                                            |
| H-04.3   | Revisión visual: partidas en H-2, H-1 y H → «Racha actual 3 días».                                                                                                                                                                                                                                                                                                                |
| H-04.4   | Revisión visual: tres partidas en H-1 y una en H → «Racha actual 2 días».                                                                                                                                                                                                                                                                                                         |
| H-04.5   | Revisión visual: 12 partidas en días seguidos de hace dos meses, y partidas de H-5 a H. Crear la meta después de las partidas → «Racha actual 6 días» y «Mejor racha 12 días».                                                                                                                                                                                                    |
| H-04.6   | Revisión visual: partidas en H-1 y H, y una insertada en Atlas con fecha H+1 → «Racha actual 2 días» y «Mejor racha 2 días».                                                                                                                                                                                                                                                      |
| H-04.7   | Revisión visual: juego sin partidas → «Racha actual 0 días» y «Mejor racha 0 días», con meta y sin ella. Sin meta y con partidas en H-1 y H → «Racha actual 2 días».                                                                                                                                                                                                              |
| H-05.1   | Revisión visual: meta con el hito «Llegar al 50 %» y última partida con avance 60 → el hito dice «Alcanzado» con su color `--meta-ok`.                                                                                                                                                                                                                                            |
| H-05.2   | Revisión visual: registrar una partida de hoy con avance 40 → al volver, el hito dice «Pendiente».                                                                                                                                                                                                                                                                                |
| H-05.3   | Revisión visual: última partida con avance 50 → el hito «Llegar al 50 %» dice «Alcanzado».                                                                                                                                                                                                                                                                                        |
| H-05.4   | Revisión visual: meta con hitos del 25 % y del 50 % y sin partidas → los dos dicen «Pendiente».                                                                                                                                                                                                                                                                                   |
| H-05.5   | Revisión visual: meta con hitos del 25 % y del 50 % y avance 30. «Desactivar meta» y confirmar → la sección sigue con horas, días y racha, pero sin lista de hitos.                                                                                                                                                                                                               |
| H-06.1   | Revisión visual: igual que H-02.4. Tras editar, «Metas anteriores» no tiene entradas nuevas y la sección muestra «de 4 h».                                                                                                                                                                                                                                                        |
| H-06.2   | Revisión visual: insertar en Atlas el `createdAt` 2026-11-02 en la meta de 5 h y 4 días, o crearla ese día. «Desactivar meta» y confirmar «¿Desactivar la meta de Hades?» → aparece «Metas anteriores» con «5 h · 4 días · creada el 2 de noviembre» y «Reactivar». No hay ningún botón «Borrar» ni «Eliminar» para metas.                                                        |
| H-06.3   | Revisión visual: tras desactivar la única meta → horas y días sin «de N», sin barra, sin «%», sin hitos y con el estado vacío «Crear meta».                                                                                                                                                                                                                                       |
| H-06.4   | Revisión visual: Hades en «pausado» y avance 30, con una meta inactiva de 5 h con hitos del 25 % y del 50 %. Pulsar «Reactivar» → la sección vuelve a «de 5 h» con «25 % · Alcanzado» y «50 % · Pendiente», y la meta sale de «Metas anteriores».                                                                                                                                 |
| H-06.5   | Revisión visual: Hades con meta activa de 8 h y una inactiva de 5 h. Pulsar «Reactivar» en la de 5 h → se ve el mensaje de la API («ya tiene una meta activa») con `role="alert"`, y la sección sigue «de 8 h».                                                                                                                                                                   |
| H-06.6   | Revisión visual: Hades «completado» con una meta inactiva. Pulsar «Reactivar» → se ve el mensaje de la API («Solo los juegos en estado jugando o pausado…»).                                                                                                                                                                                                                      |
| H-06.7   | Revisión visual: Hades con meta activa de 8 h y una inactiva de 5 h → la sección dice «de 8 h» y «Metas anteriores» lista solo la de 5 h.                                                                                                                                                                                                                                         |
| H-07.1   | Revisión visual: Hades «jugando» con meta de 5 h. «Editar juego» → estado «abandonado» → guardar. En el detalle sigue «de 5 h» y aparece el aviso de RN-19 con «abandonado».                                                                                                                                                                                                      |
| H-07.2   | Revisión visual: Hades «completado» con meta de 6 h y 3 días y una partida de hoy de 120 min → «2 h de 6 h», «33 %», «1 de 3 días», la racha y los hitos, y el aviso «Este juego está completado y su meta sigue activa…».                                                                                                                                                        |
| H-07.3   | Revisión visual: en ese mismo juego, «Desactivar meta» y confirmar → el aviso desaparece.                                                                                                                                                                                                                                                                                         |
| H-08.1   | Revisión visual: Hades con 2 metas (1 activa y 1 inactiva) y 12 partidas. «Eliminar juego» y confirmar → vuelve a «Mis juegos» sin Hades, y «Partidas» no muestra ninguna de Hades. Que las 2 metas también se borraron lo verifica `backend/pruebas.http` «H-08.1: obtener cada meta del juego eliminado → 404».                                                                 |
| H-08.2   | Revisión visual: con el mismo juego, «Eliminar juego» → la confirmación dice «¿Eliminar "Hades", sus 2 meta(s) y sus 12 partida(s)? No se puede deshacer.». Cancelar no borra nada.                                                                                                                                                                                               |
| H-09.1   | Revisión visual: partida registrada en H-1 cuando debía ser H-2. «Editar» → fecha H-2 → guardar. En la tabla aparece en H-2, y la racha y los días de la semana se recalculan.                                                                                                                                                                                                    |
| H-09.2   | Revisión visual: «Editar» una partida y poner como fecha H+1 → se ve el mensaje de la API de fecha futura con `role="alert"`. Al volver, la partida conserva su fecha.                                                                                                                                                                                                            |
| H-09.3   | Revisión visual: hito «Llegar al 50 %» y la partida más reciente con avance 40 («Pendiente»). «Editar» → avance 60 → guardar. El hito dice «Alcanzado».                                                                                                                                                                                                                           |
| H-09.4   | Revisión visual: partidas de H-3 a H (racha 4), la de H-2 con 300 min. «Editar» → 30 min → guardar. Sigue «Racha actual 4 días» y las horas de la semana bajan 4,5 h sin pulsar F5 (cubre también H-02.9 al editar).                                                                                                                                                              |
| D-P2.5   | Revisión visual entre las 10:00 y las 23:59 en Ecuador: cambiar la zona horaria de Windows a «(UTC+09:00) Osaka, Sapporo, Tokio», donde ya es el día siguiente. Recargar y abrir «Registrar partida» → la fecha propuesta es la de hoy **en Ecuador**, no la de Tokio. Restaurar la zona.                                                                                         |

## Ticket → archivos

Las rutas son relativas a `frontend/src/`, salvo que se indique otra cosa.

| Ticket | Archivos que se crean o modifican                                                                                                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-23   | **Modificado:** `tipos.ts` (`hoyISO` con `Intl` y `America/Guayaquil`)                                                                                                                                                                                                           |
| T-24   | **Nuevo:** `api/metasApi.ts`. **Modificados:** `tipos.ts` (tipos `Meta`, `Hito`, `MetaInput` y `ProgresoSemanal`; funciones `formatearHoras`, con coma decimal, y `formatearDiaCreacion`, en America/Guayaquil) y `estilos.css` (4 tokens en `:root`)                            |
| T-25   | **Nuevo:** `components/SeccionProgreso.tsx`. **Modificados:** `paginas/DetalleVideojuego.tsx` (carga aparte del progreso y refresco al eliminar una partida) y `estilos.css` (clases `progreso-*`)                                                                               |
| T-26   | **Modificados:** `components/SeccionProgreso.tsx` (creado en T-25: lista de hitos y aviso de RN-19) y `estilos.css` (clases `hito-*` y `meta-aviso`)                                                                                                                             |
| T-27   | **Nuevo:** `paginas/FormularioMeta.tsx`. **Modificados:** `App.tsx` (rutas `/videojuegos/:id/meta/nueva` y `/metas/:id/editar`), `components/SeccionProgreso.tsx` (enlaces «Crear meta» y «Editar meta»), `estilos.css` (clases `meta-*`) y `README.md` (raíz: pantallas nuevas) |
| T-28   | **Nuevo:** `components/HistorialMetas.tsx`. **Modificados:** `components/SeccionProgreso.tsx` («Desactivar meta»), `paginas/DetalleVideojuego.tsx` (carga de metas y refresco) y `estilos.css` (clases `historial-*`)                                                            |
| T-29   | **Modificado:** `paginas/DetalleVideojuego.tsx` (texto de la confirmación, que menciona metas y partidas)                                                                                                                                                                        |
| T-30   | **Modificados:** `paginas/FormularioPartida.tsx` (modo edición), `App.tsx` (ruta `/partidas/:id/editar`), `paginas/DetalleVideojuego.tsx` y `paginas/ListaPartidas.tsx` (botón «Editar»), y `README.md` (raíz: pantalla nueva)                                                   |

## Supuestos y puntos abiertos

**Supuestos.** Ninguno de estos puntos está en el PRD; la spec los da por buenos.

1. **Sin tests automatizados.** El frontend no tiene tests (diagnóstico §9). Toda verificación es visual, y las reglas de cálculo se prueban en el backend.
2. **Rutas nuevas.** Las del formulario de meta (`/videojuegos/:id/meta/nueva` y `/metas/:id/editar`) y la de edición de partida (`/partidas/:id/editar`) las propone esta spec.
3. **Validación en el formulario de meta.** Se repite en el navegador con mensajes propios (regla 14), siguiendo el patrón de `FormularioPartida`. El formulario no usa `maxLength` ni `min`/`max` nativos, para que los mensajes sean los de la spec y no los del navegador.
4. **Sexto hito.** Se impide deshabilitando «Agregar hito» con el texto «Máximo 5 hitos». Así se cumple el «se rechaza» de H-01.4.
5. **Validación de fechas en el formulario de partida.** El formulario no bloquea fechas futuras en el navegador. Las rechaza la API (RN-10) y el mensaje se muestra con `role="alert"`.
6. **Juego de una partida en edición.** En modo edición de partida, el juego se muestra pero no se puede cambiar.
7. **Textos de pantalla.** Los títulos, botones y mensajes de esta spec son propuestos y siguen el tono de DESIGN.md: «Esta semana», «Metas anteriores», «Crear meta», «Editar meta», «Desactivar meta», «Reactivar», «Máximo 5 hitos» y el aviso de RN-19.
8. **Datos en Atlas.** H-02.5, H-04.6 y H-06.2 necesitan insertar o editar datos en Atlas, porque la API ya no acepta fechas futuras ni deja fijar `createdAt`.
9. **Revisiones en días concretos.** H-02.2 y H-03.2 solo se pueden revisar un domingo por la noche y el lunes siguiente. Si no hay ocasión antes de la entrega, quedan cubiertas por los tests de backend con los mismos ids y la revisión visual queda pendiente en la auditoría.

**Puntos abiertos**

1. **`--tinta-oscura`** se crea en T-24 porque DESIGN.md y el backlog lo piden, pero ninguna pantalla de esta spec la usa: la sección de progreso va sobre `.panel` oscuro y no sobre el degradado del resumen. Hay que decidir si se crea igual, lo que suma una variable sin uso (P6), o si se pospone hasta que P13 la necesite.
2. **El texto de reserva de `http.ts`** («Error HTTP {status}», cuando la API no manda `error`) choca con «sin códigos HTTP en pantalla». El backend siempre manda `error`, así que no debería verse. Cambiarlo es tocar código existente que ningún ticket pide.
3. **El resumen existente muestra las horas con punto** («14.5 h»), mientras que la sección nueva usa coma («3,5 h»). Unificarlo sería un cambio no pedido en E1.
