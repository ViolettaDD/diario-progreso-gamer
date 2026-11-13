# Backlog — Épica E2 «Metas y rachas»

- **Fuentes:** PRD de E2 (RN-01 a RN-20), épicas, diagnóstico (decisiones §5–§7, deudas P2 y P5, lo diferido) y AGENTS.md.
- **Fechas de los ejemplos:** noviembre de 2026. La semana actual va del **lunes 9 al domingo 15**, y «hoy» es el **viernes 13**, salvo que el criterio diga otra cosa.
- **Convenciones:**
  - Cada criterio se nombra `H-xx.n` y cita la regla que comprueba.
  - Los criterios de las historias no tienen detalle técnico. Los tickets sí lo tienen.

---

## 1. Historias de usuario

### H-01 · Fijar una meta semanal para un juego

**Como** persona que juega varios juegos a la vez, **quiero** fijar para un juego cuántas horas y cuántos días por semana quiero jugarlo, con algunos hitos de avance, **para** saber si estoy jugando lo que me propuse.

| #      | Criterio                                                                                                                                                                                                                                     | RN    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| H-01.1 | **DADO** un juego «jugando» sin meta, **CUANDO** creo una meta de 5 h y 4 días con el hito «Llegar al 50 %» (objetivo 50 %), **ENTONCES** queda como su meta activa con esos valores.                                                        | RN-13 |
| H-01.2 | **DADO** el formulario de meta, **CUANDO** indico 0 h o 100,5 h por semana, **ENTONCES** se rechaza con un mensaje que explica el rango. Con 0,5 h o 100 h se acepta.                                                                        | RN-13 |
| H-01.3 | **DADO** el formulario de meta, **CUANDO** indico 0 u 8 días por semana, **ENTONCES** se rechaza. Con 1 o 7 días se acepta.                                                                                                                  | RN-13 |
| H-01.4 | **DADO** una meta con 5 hitos, **CUANDO** agrego un sexto, o un hito con objetivo de 0 % o de 101 %, **ENTONCES** se rechaza. Dos hitos con objetivo del 50 % se aceptan.                                                                    | RN-13 |
| H-01.5 | **DADO** el formulario de meta, **CUANDO** dejo el texto de un hito vacío o con solo espacios, o escribo 61 caracteres, **ENTONCES** se rechaza. Un texto de 60 caracteres se acepta, y «␣␣Llegar al 50 %␣» se guarda como «Llegar al 50 %». | RN-17 |
| H-01.6 | **DADO** un juego con una meta activa de 5 h, **CUANDO** intento crear otra de 8 h, **ENTONCES** se rechaza con un mensaje que dice que ya hay una meta activa y que puedo editarla o desactivarla. La de 5 h sigue activa y sin cambios.    | RN-09 |
| H-01.7 | **DADO** un juego «completado» o «abandonado» sin meta activa, **CUANDO** intento crear una meta, **ENTONCES** se rechaza con un mensaje claro. En un juego «pausado» la misma meta se acepta.                                               | RN-07 |

### H-02 · Ver cuántas horas llevo esta semana frente a mi meta

**Como** persona con una meta semanal, **quiero** ver en el detalle del juego cuántas horas llevo esta semana frente a las horas de mi meta, **para** saber si voy al día antes de que termine la semana.

| #       | Criterio                                                                                                                                                                                                                                                                                       | RN           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| H-02.1  | **DADO** una meta de 5 h y partidas el domingo 8 (3 h), el lunes 9 (2 h) y el miércoles 11 (1,5 h), **CUANDO** abro el detalle el viernes 13, **ENTONCES** veo la semana del 9 al 15 con «3,5 h de 5 h» y 70 %. La del domingo 8 no cuenta, porque es de la semana anterior.                   | RN-11        |
| H-02.2  | **DADO** que hoy es domingo 15 a las 23:00 en Ecuador y registro una partida del domingo 15 de 150 minutos, de 23:00 a 01:30, **CUANDO** miro la semana, **ENTONCES** suma 2,5 h a la semana del 9 al 15. El lunes 16, la semana del 16 al 22 empieza en 0 h.                                  | RN-03, RN-11 |
| H-02.3  | **DADO** una meta de 5 h y 7 h jugadas en la semana, **CUANDO** miro el progreso, **ENTONCES** veo 100 % y «7 h de 5 h».                                                                                                                                                                       | RN-05        |
| H-02.4  | **DADO** una meta de 8 h con 5 h jugadas (63 %), **CUANDO** el miércoles 11 cambio la meta a 4 h, **ENTONCES** toda la semana se compara con 4 h: veo 100 % y «5 h de 4 h».                                                                                                                    | RN-04        |
| H-02.5  | **DADO** que hoy es miércoles 11, hay una partida el lunes 9 (3 h) y otra guardada antes de la regla con fecha viernes 13 (2 h), **CUANDO** miro la semana, **ENTONCES** veo 3 h: la partida con fecha futura no suma.                                                                         | RN-10        |
| H-02.6  | **DADO** un juego **sin meta activa** con partidas el lunes 9 (1 h), el jueves 12 (1,5 h) y el viernes 13 (1,5 h), **CUANDO** miro la semana, **ENTONCES** veo 4 h sin porcentaje ni «de N h». **DADO** un juego con meta de 5 h y **sin partidas**, **ENTONCES** veo «0 h de 5 h» y 0 %.      | RN-12        |
| H-02.7  | **DADO** partidas el lunes 9 (2 h) y el miércoles 11 (1,5 h), **CUANDO** el viernes 13 creo una meta de 5 h, **ENTONCES** la semana muestra «3,5 h de 5 h» y 70 % desde el primer momento.                                                                                                     | RN-14        |
| H-02.8  | **DADO** una meta de 10 h, **CUANDO** el martes 10 registro dos partidas de 24 h y de 10 h, **ENTONCES** las dos se aceptan y veo 100 % y «34 h de 10 h».                                                                                                                                      | RN-18        |
| H-02.9  | **DADO** el detalle de un juego con meta de 5 h y 3,5 h jugadas esta semana (70 %), **CUANDO** registro una partida de 1 h hoy, **ENTONCES** el progreso pasa a «4,5 h de 5 h» y 90 % sin que yo recargue la página. Lo mismo al eliminar esa partida (vuelve a 70 %) y al editar su duración. | —            |
| H-02.10 | **DADO** que el progreso todavía no llega, **ENTONCES** veo un estado de carga. **DADO** que la consulta falla, **ENTONCES** veo un mensaje de error con opción de reintentar y el resto del detalle del juego sigue visible.                                                                  | —            |

### H-03 · Ver cuántos días jugué esta semana frente a mi meta

**Como** persona que quiere ser constante, **quiero** ver cuántos días distintos jugué esta semana frente a los días de mi meta, **para** no concentrar todo en un solo fin de semana.

| #      | Criterio                                                                                                                                                                                                                            | RN           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| H-03.1 | **DADO** una meta de 4 días, dos partidas el lunes 9 (30 y 90 min) y una el miércoles 11, **CUANDO** miro la semana, **ENTONCES** veo «2 de 4 días».                                                                                | RN-02        |
| H-03.2 | **DADO** una partida del domingo 15 de 23:00 a 01:30, **CUANDO** miro la semana el domingo 15 a las 23:30, hora de Ecuador, **ENTONCES** el domingo cuenta como día jugado de la semana del 9 al 15. El lunes 16 veo «0 de 4 días». | RN-03, RN-11 |
| H-03.3 | **DADO** un juego sin meta activa con partidas el lunes 9, el jueves 12 y el viernes 13, **CUANDO** miro la semana, **ENTONCES** veo «3 días jugados» sin «de N días». Con meta de 4 días y sin partidas veo «0 de 4 días».         | RN-12        |
| H-03.4 | **DADO** partidas el lunes 9 y el miércoles 11, **CUANDO** el viernes 13 creo una meta de 3 días, **ENTONCES** veo «2 de 3 días».                                                                                                   | RN-14        |
| H-03.5 | **DADO** dos partidas el martes 10 que suman 34 h, **CUANDO** miro la semana, **ENTONCES** el martes cuenta como **1** día jugado.                                                                                                  | RN-18        |

### H-04 · Ver mi racha actual y mi mejor racha

**Como** persona que quiere jugar con constancia, **quiero** ver cuántos días seguidos llevo jugando un juego y cuál fue mi mejor racha, **para** motivarme a no cortarla.

| #      | Criterio                                                                                                                                                                                                                                                                                        | RN    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| H-04.1 | **DADO** partidas el miércoles 11 y el jueves 12, **CUANDO** el viernes 13 miro el detalle antes de jugar, **ENTONCES** la racha es **2**: sigue viva.                                                                                                                                          | RN-01 |
| H-04.2 | **DADO** el mismo caso, si el viernes 13 termina sin partidas, **CUANDO** miro el detalle el sábado 14, **ENTONCES** la racha es **0**.                                                                                                                                                         | RN-01 |
| H-04.3 | **DADO** partidas el miércoles 11, el jueves 12 y el viernes 13, **CUANDO** miro el detalle el viernes 13, **ENTONCES** la racha es **3**.                                                                                                                                                      | RN-01 |
| H-04.4 | **DADO** tres partidas el jueves 12 y una el viernes 13, **CUANDO** miro el detalle el viernes 13, **ENTONCES** la racha es **2**, no 4.                                                                                                                                                        | RN-02 |
| H-04.5 | **DADO** una racha de 12 días del 1 al 12 de septiembre, partidas del domingo 8 al viernes 13 de noviembre y una meta creada el lunes 9, **CUANDO** miro el detalle el viernes 13, **ENTONCES** la racha actual es **6** (incluye el domingo 8, anterior a la meta) y la mejor racha es **12**. | RN-20 |
| H-04.6 | **DADO** que hoy es jueves 12, con partidas el miércoles 11 y el jueves 12 y una partida antigua con fecha viernes 13, **CUANDO** miro el detalle, **ENTONCES** la racha actual es **2** y la mejor racha es **2**.                                                                             | RN-10 |
| H-04.7 | **DADO** un juego sin partidas, con o sin meta, **CUANDO** miro el detalle, **ENTONCES** la racha actual es **0** y la mejor racha es **0**. Sin meta activa y con partidas el jueves 12 y el viernes 13, la racha es **2**.                                                                    | RN-12 |

### H-05 · Ver qué hitos de avance alcancé

**Como** persona con una meta, **quiero** ver qué hitos de avance del juego ya alcancé y cuáles me faltan, **para** sentir que avanzo hacia terminar el juego.

| #      | Criterio                                                                                                                                                                                  | RN    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| H-05.1 | **DADO** el hito «Llegar al 50 %» y una última partida con avance del 60 %, **CUANDO** miro el detalle, **ENTONCES** el hito dice «Alcanzado».                                            | RN-06 |
| H-05.2 | **DADO** ese hito alcanzado, **CUANDO** registro una partida más reciente con avance del 40 %, **ENTONCES** el hito vuelve a «Pendiente».                                                 | RN-06 |
| H-05.3 | **DADO** el hito «Llegar al 50 %» y una última partida con avance exacto del 50 %, **CUANDO** miro el detalle, **ENTONCES** el hito dice «Alcanzado» (supuesto 2 del PRD: igual o mayor). | RN-06 |
| H-05.4 | **DADO** una meta con hitos del 25 % y del 50 % y ninguna partida, **CUANDO** miro el detalle, **ENTONCES** los dos dicen «Pendiente».                                                    | RN-12 |
| H-05.5 | **DADO** una meta con hitos del 25 % y del 50 % y un avance del 30 %, **CUANDO** desactivo la meta, **ENTONCES** el detalle sigue mostrando horas, días y racha, pero **ningún hito**.    | RN-15 |

### H-06 · Cambiar, desactivar o reactivar mi meta sin perder el historial

**Como** persona cuyos planes cambian, **quiero** editar mi meta, desactivarla y reactivar una anterior, **para** ajustar lo que me propongo sin perder lo que me había propuesto antes.

| #      | Criterio                                                                                                                                                                                                                                                                            | RN           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| H-06.1 | **DADO** una meta de 8 h con 5 h jugadas, **CUANDO** el miércoles 11 la edito a 4 h, **ENTONCES** la semana muestra 100 % y «5 h de 4 h», y no se crea otra meta.                                                                                                                   | RN-04        |
| H-06.2 | **DADO** una meta activa de 5 h y 4 días creada el 2 de noviembre, **CUANDO** la desactivo, **ENTONCES** aparece en la lista de metas inactivas del juego con «5 h · 4 días · creada el 2 de noviembre» y una opción para reactivarla. No hay ninguna opción para borrarla.         | RN-16        |
| H-06.3 | **DADO** que acabo de desactivar la única meta, **CUANDO** miro el progreso, **ENTONCES** veo horas, días y racha sin porcentaje ni «de N», sin hitos, y una invitación a crear una meta.                                                                                           | RN-12, RN-15 |
| H-06.4 | **DADO** un juego «pausado» sin meta activa y con una meta inactiva de 5 h con hitos del 25 % y del 50 %, y un avance del 30 %, **CUANDO** la reactivo, **ENTONCES** vuelve a ser la meta activa y sus hitos se muestran con el avance actual: 25 % «Alcanzado» y 50 % «Pendiente». | RN-07, RN-15 |
| H-06.5 | **DADO** un juego con una meta activa de 8 h y una inactiva de 5 h, **CUANDO** intento reactivar la de 5 h, **ENTONCES** se rechaza con un mensaje que dice que ya hay una meta activa. La de 8 h sigue activa.                                                                     | RN-09        |
| H-06.6 | **DADO** un juego «completado» con una meta inactiva, **CUANDO** intento reactivarla, **ENTONCES** se rechaza con un mensaje claro.                                                                                                                                                 | RN-07        |
| H-06.7 | **DADO** un juego que tuvo una meta de 5 h, ya desactivada, y que hoy tiene una de 8 h activa, **CUANDO** miro el detalle, **ENTONCES** veo la de 8 h como activa y la de 5 h en la lista de inactivas: el juego conserva sus **2** metas.                                          | RN-16        |

### H-07 · Saber que un juego terminado sigue con meta activa

**Como** persona que marca juegos como terminados, **quiero** que se me avise si un juego completado o abandonado sigue con su meta activa, **para** decidir si la desactivo.

| #      | Criterio                                                                                                                                                                                                                                                                                    | RN    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| H-07.1 | **DADO** un juego «jugando» con una meta activa de 5 h, **CUANDO** lo marco como «abandonado», **ENTONCES** la meta de 5 h sigue activa.                                                                                                                                                    | RN-07 |
| H-07.2 | **DADO** un juego «completado» con una meta activa de 6 h y 3 días, que esta semana lleva 2 h en 1 día, **CUANDO** abro el detalle, **ENTONCES** veo «2 h de 6 h», 33 %, «1 de 3 días», la racha y los hitos como siempre, más un aviso de que la meta sigue activa hasta que la desactive. | RN-19 |
| H-07.3 | **DADO** ese mismo juego, **CUANDO** desactivo la meta, **ENTONCES** el aviso desaparece.                                                                                                                                                                                                   | RN-19 |

### H-08 · Eliminar un juego sin dejar metas ni partidas sueltas

**Como** persona que deja de seguir un juego, **quiero** eliminarlo junto con todo lo suyo, **para** que no queden datos sueltos.

| #      | Criterio                                                                                                                                                      | RN    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| H-08.1 | **DADO** un juego con 2 metas (1 activa y 1 inactiva) y 12 partidas, **CUANDO** lo elimino, **ENTONCES** desaparecen el juego, las 2 metas y las 12 partidas. | RN-08 |
| H-08.2 | **DADO** ese juego, **CUANDO** pulso «Eliminar», **ENTONCES** la confirmación nombra el juego y avisa que también se borrarán sus metas y sus partidas.       | RN-08 |

### H-09 · Corregir una partida mal cargada (recortable, P8)

**Como** persona que a veces se equivoca al registrar, **quiero** corregir una partida ya guardada, **para** no tener que borrarla y crearla de nuevo, lo que podría deshacer mi racha o un hito.

| #      | Criterio                                                                                                                                                                                                                                       | RN    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| H-09.1 | **DADO** una partida registrada por error el jueves 12, **CUANDO** corrijo su fecha al miércoles 11, **ENTONCES** la semana y la racha la cuentan como jugada el miércoles 11.                                                                 | RN-03 |
| H-09.2 | **DADO** que hoy es viernes 13, **CUANDO** corrijo la fecha de una partida al sábado 14, **ENTONCES** se rechaza con un mensaje claro y la partida no cambia.                                                                                  | RN-10 |
| H-09.3 | **DADO** el hito «Llegar al 50 %» y una partida más reciente cargada con 40 % en vez de 60 %, **CUANDO** corrijo el avance a 60 %, **ENTONCES** el hito pasa a «Alcanzado».                                                                    | RN-06 |
| H-09.4 | **DADO** partidas del martes 10 al viernes 13 (racha 4), con la del miércoles 11 cargada con 300 minutos en vez de 30, **CUANDO** corrijo la duración a 30 minutos, **ENTONCES** la racha sigue en **4** y las horas de la semana bajan 4,5 h. | RN-01 |

---

## 2. Deuda técnica pagada con ciclo completo

### D-P2 · La fecha de una partida es un día de calendario y no puede ser futura

Cubre el problema P2 del diagnóstico, que incluye P9.

| #      | Criterio                                                                                                                                                                                                                                             | RN    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| D-P2.1 | **DADO** una partida con fecha «2026-11-12», **CUANDO** la registro, **ENTONCES** se acepta y cuenta para el jueves 12.                                                                                                                              | RN-03 |
| D-P2.2 | **DADO** una fecha con hora («2026-11-12 10:00»), con zona horaria, con texto («ayer»), vacía o inexistente («2026-02-30»), **CUANDO** registro o edito una partida, **ENTONCES** se rechaza con un mensaje que pide una fecha de calendario válida. | RN-03 |
| D-P2.3 | **DADO** que en Ecuador son las 21:00 del jueves 12, **CUANDO** registro una partida del viernes 13, **ENTONCES** se rechaza por ser futura, sin importar la zona horaria desde la que se use la aplicación. La del jueves 12 se acepta.             | RN-10 |
| D-P2.4 | **DADO** que en Ecuador son las 23:59 del lunes 9 de noviembre, **CUANDO** se determina el día de hoy, **ENTONCES** es el lunes 9 y la semana en curso es la del 9 al 15.                                                                            | RN-11 |
| D-P2.5 | **DADO** que son las 21:00 del jueves 12 en Ecuador y el equipo de la persona usa otra zona horaria, **CUANDO** abro el formulario de nueva partida, **ENTONCES** la fecha propuesta es el jueves 12.                                                | RN-10 |

- **Tickets:** T-02 (test), T-03 (código), T-04 (aplicación en el registro y la edición de partidas) y T-23 (frontend).
- **DoD:**
  - Los tests de T-02 pasan.
  - La tabla de verificación manual contra la base de desarrollo da:
    - rechazo con una fecha con hora;
    - rechazo con una fecha futura;
    - aceptación con una fecha válida de hoy.
  - D-P2.5 está comprobado en el navegador.
  - No hace falta migrar datos: Atlas tiene 0 partidas fuera de medianoche UTC y 0 futuras (diagnóstico §3).

### D-P5 · El resumen pasa a ser una función pura sin cambiar lo que devuelve

| #      | Criterio                                                                                                                                                                  | RN    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| D-P5.1 | **DADO** un juego sin partidas, **CUANDO** pido su resumen, **ENTONCES** veo 0 partidas, 0 h, ninguna última partida y 0 % de avance.                                     | RN-12 |
| D-P5.2 | **DADO** partidas que suman 870 minutos, **CUANDO** pido el resumen, **ENTONCES** veo 14,5 h. Con 100 minutos veo 1,67 h.                                                 | —     |
| D-P5.3 | **DADO** dos partidas con la misma fecha y avances del 40 % y del 60 %, la de 60 % registrada después, **CUANDO** pido el resumen, **ENTONCES** el avance actual es 60 %. | RN-06 |
| D-P5.4 | **DADO** una partida antigua con fecha futura, **CUANDO** pido el resumen, **ENTONCES** no se cuenta: no suma horas ni define el avance actual.                           | RN-10 |
| D-P5.5 | **DADO** un juego con partidas, **CUANDO** comparo su resumen antes y después del cambio, **ENTONCES** es idéntico.                                                       | —     |

- **Tickets:** T-05 (test) y T-06 (código).
- **DoD:**
  - Los tests de T-05 pasan.
  - D-P5.5 está comprobado con un juego con partidas y otro sin partidas.
  - Los hitos (T-14) reutilizan la misma lógica de «partida más reciente».
- **Nota:** D-P5.4 aplica RN-10 («no suma horas, días, racha ni avance») al resumen. Esto cierra el pendiente del diagnóstico §9. Con los datos actuales el resultado no cambia, porque no hay partidas futuras.

---

## 3. Tickets

**DoD común a todos los tickets**, además de la DoD propia de cada uno:

- La spec del ticket está en `docs/specs/` y se commiteó antes que el código.
- `npm run check` pasa en las carpetas tocadas, y `npm test` pasa en el backend (desde T-01).
- El commit tiene la forma `<tipo>(E2): T-xx descripción` y solo contiene los archivos del ticket.
- Los tickets de deuda llevan la marca en su commit: `(deuda P2)` en T-02, T-03, T-04 y T-23, y `(deuda P5)` en T-05 y T-06. Por ejemplo, `test(E2): T-02 tests de fecha de calendario (deuda P2)`.
- Duración máxima de media jornada.
- Frontend: se revisa contra DESIGN.md, con solo variables CSS de `:root` y `fetch` solo en `frontend/src/api/`.

| Id   | Tipo     | Título                                                         | Cubre             | Depende de             |
| ---- | -------- | -------------------------------------------------------------- | ----------------- | ---------------------- |
| T-01 | test     | Configurar Vitest en el backend                                | base              | —                      |
| T-02 | test     | Tests de fecha de calendario y del «hoy» en Ecuador (deuda P2) | D-P2              | T-01                   |
| T-03 | backend  | Funciones puras de fecha y del «hoy» en Ecuador (deuda P2)     | D-P2              | T-02                   |
| T-04 | backend  | Validar la fecha al crear y editar partidas (deuda P2)         | D-P2              | T-03                   |
| T-05 | test     | Tests del resumen puro (deuda P5)                              | D-P5              | T-01                   |
| T-06 | deuda    | Resumen como función pura (deuda P5)                           | D-P5              | T-05, T-03             |
| T-07 | test     | Tests de la semana de lunes a domingo                          | H-02, H-03        | T-01                   |
| T-08 | backend  | Función pura de la semana                                      | H-02, H-03        | T-07                   |
| T-09 | test     | Tests de horas, días y porcentaje de la semana                 | H-02, H-03        | T-01                   |
| T-10 | backend  | Función pura del progreso de la semana                         | H-02, H-03        | T-09, T-08             |
| T-11 | test     | Tests de racha actual y mejor racha                            | H-04              | T-01                   |
| T-12 | backend  | Función pura de racha                                          | H-04              | T-11                   |
| T-13 | test     | Tests de hitos y de qué estados admiten meta                   | H-05, H-01        | T-01                   |
| T-14 | backend  | Funciones puras de hitos y de qué estados admiten meta         | H-05, H-01        | T-13, T-06             |
| T-15 | test     | Tests del modelo Meta y del error de conflicto                 | H-01, H-06        | T-01                   |
| T-16 | backend  | Error de conflicto (409 `conflicto`)                           | H-01, H-06        | T-15                   |
| T-17 | backend  | Modelo Meta con índice de meta activa única                    | H-01              | T-15, T-16             |
| T-18 | backend  | Crear y consultar una meta                                     | H-01              | T-17, T-14             |
| T-19 | backend  | Editar, desactivar, reactivar y listar metas                   | H-06, H-07        | T-18                   |
| T-20 | backend  | Progreso semanal del juego                                     | H-02 a H-05, H-07 | T-10, T-12, T-14, T-17 |
| T-21 | backend  | Cascada metas → partidas → videojuego                          | H-08              | T-17                   |
| T-22 | docs     | README, pruebas.http y .env.example                            | todas             | T-04 a T-21            |
| T-23 | frontend | `hoyISO` en hora de Ecuador (deuda P2)                         | D-P2              | T-04                   |
| T-24 | frontend | Tipos, API de metas y progreso, y tokens de E2                 | base              | T-19, T-20             |
| T-25 | frontend | Sección de progreso semanal                                    | H-02, H-03, H-04  | T-24                   |
| T-26 | frontend | Hitos y aviso de juego terminado                               | H-05, H-07        | T-25                   |
| T-27 | frontend | Formulario de crear y editar meta                              | H-01, H-06        | T-24                   |
| T-28 | frontend | Desactivar, reactivar e historial de metas                     | H-06              | T-25, T-27             |
| T-29 | frontend | La confirmación de borrar un juego menciona las metas          | H-08              | T-21                   |
| T-30 | frontend | Editar una partida (recortable)                                | H-09              | T-04, T-23             |
| T-31 | docs     | Desplegar en Render, verificar E2 y abrir el pull request      | todas             | T-22 a T-30            |

### T-01 · test · Configurar Vitest en el backend

- **Descripción:**
  - Instalar Vitest como dependencia de desarrollo del backend, con versión exacta.
  - Añadir el script `"test": "vitest run"`.
  - Escribir un test de humo.
  - No se instalan supertest ni mongodb-memory-server (diagnóstico §5.3).
- **DoD:**
  - `npm test` pasa con 1 test.
  - `package.json` tiene la versión sin `^` ni `~`.
  - `npm run build` no compila los archivos `*.test.ts` dentro de `dist/`.

### T-02 · test · Tests de fecha de calendario y del «hoy» en Ecuador (deuda P2)

- **Descripción:** crear `backend/src/dominio/fechas.test.ts` con estos casos:
  - formatos válidos e inválidos: con hora, con zona, texto, vacío y `2026-02-30` (D-P2.1 y D-P2.2);
  - fecha futura respecto de un «hoy» que llega por parámetro (D-P2.3);
  - la frontera `2026-11-10T04:59Z`, que debe dar `2026-11-09` (D-P2.4).
- **DoD:** los tests existen, cubren D-P2.1 a D-P2.4 y fallan por falta de implementación.

### T-03 · backend · Funciones puras de fecha y del «hoy» en Ecuador (deuda P2)

- **Descripción:** crear `backend/src/dominio/fechas.ts` con tres funciones:
  - validar `AAAA-MM-DD` como día de calendario;
  - «hoy» en America/Guayaquil a partir de un instante recibido;
  - comparar si una fecha es futura.
  - Sin Mongoose y sin leer la hora internamente.
- **DoD:** los tests de T-02 pasan.

### T-04 · backend · Validar la fecha al crear y editar partidas (deuda P2)

- **Descripción:**
  - Al crear y al actualizar en `partidas.service.ts`, validar el formato y rechazar fechas futuras con un 400 de tipo `validacion`.
  - «Hoy» se calcula en el borde, en el servicio, y se pasa a la función pura.
  - Se guarda a medianoche UTC, como hasta ahora.
- **DoD:**
  - Contra la base de desarrollo:
    - `POST` con hora → 400;
    - `POST` con fecha futura → 400;
    - `PUT` con fecha futura → 400;
    - `POST` con la fecha de hoy → 201.
  - Los cuatro casos están en `pruebas.http`.

### T-05 · test · Tests del resumen puro (deuda P5)

- **Descripción:** crear `backend/src/dominio/resumen.test.ts` con los casos D-P5.1 a D-P5.4.
- **DoD:** los tests existen y fallan por falta de implementación.

### T-06 · deuda · Resumen como función pura (deuda P5)

- **Descripción:**
  - Crear `backend/src/dominio/resumen.ts`, que calcula el resumen a partir de las partidas y de «hoy».
  - Exportar también la lógica de «partida más reciente».
  - `resumenDeVideojuego` queda solo con la consulta y la llamada a la función pura.
- **DoD:**
  - Los tests de T-05 pasan.
  - D-P5.5 está verificado en la base de desarrollo: el resumen de un juego con partidas y de otro sin partidas es idéntico antes y después del cambio.

### T-07 · test · Tests de la semana de lunes a domingo

- **Descripción:** crear `backend/src/dominio/semana.test.ts` con estos casos:
  - un «hoy» viernes 2026-11-13, lunes 9 y domingo 15 → semana del 2026-11-09 al 2026-11-15;
  - lunes 16 → del 16 al 22;
  - semana que cruza meses: 2026-12-02 → del 2026-11-30 al 2026-12-06;
  - semana que cruza años: 2027-01-01 → del 2026-12-28 al 2027-01-03.
- **DoD:** los tests existen y fallan. Comprueban el formato `AAAA-MM-DD` con los dos extremos incluidos (sección 5, decisiones para las specs).

### T-08 · backend · Función pura de la semana

- **Descripción:** crear `backend/src/dominio/semana.ts`, que devuelve el inicio y el fin de la semana a partir de «hoy».
- **DoD:** los tests de T-07 pasan.

### T-09 · test · Tests de horas, días y porcentaje de la semana

- **Descripción:** crear `backend/src/dominio/progreso.test.ts` con estos casos:
  - horas con un decimal (30 + 90 min → 2,0 h) y días distintos (H-03.1);
  - partida del domingo 8 excluida y del domingo 15 incluida (H-02.1, H-02.2);
  - partidas futuras ignoradas (H-02.5);
  - 7 h de 5 h → 100 (H-02.3) y 3,5 de 5 → 70;
  - sin meta → porcentaje nulo (H-02.6);
  - 34 h en un día → 1 día (H-02.8, H-03.5);
  - sin partidas → 0.
- **DoD:** los tests existen y fallan.

### T-10 · backend · Función pura del progreso de la semana

- **Descripción:** crear `backend/src/dominio/progreso.ts`, que calcula horas, días jugados y porcentaje de la semana, con tope de 100.
- **DoD:** los tests de T-09 pasan.

### T-11 · test · Tests de racha actual y mejor racha

- **Descripción:** crear `backend/src/dominio/racha.test.ts` con los casos H-04.1 a H-04.7 y la invariante «mejor ≥ actual».
- **DoD:** los tests existen y fallan.

### T-12 · backend · Función pura de racha

- **Descripción:** crear `backend/src/dominio/racha.ts`, que calcula la racha actual y la mejor racha sobre todo el historial, ignorando las partidas futuras.
- **DoD:** los tests de T-11 pasan.

### T-13 · test · Tests de hitos y de qué estados admiten meta

- **Descripción:** crear `backend/src/dominio/hitos.test.ts` y `backend/src/dominio/meta.test.ts` con estos casos:
  - H-05.1 a H-05.4;
  - sin meta, la lista de hitos queda vacía (H-05.5);
  - «jugando» y «pausado» admiten meta activa; «completado» y «abandonado» no (H-01.7, H-06.6).
- **DoD:** los tests existen y fallan.

### T-14 · backend · Funciones puras de hitos y de qué estados admiten meta

- **Descripción:**
  - Crear `backend/src/dominio/hitos.ts`, que reutiliza el avance de la partida más reciente de T-06.
  - Crear `backend/src/dominio/meta.ts`.
- **DoD:** los tests de T-13 pasan.

### T-15 · test · Tests del modelo Meta y del error de conflicto

- **Descripción:**
  - `backend/src/modelos/Meta.test.ts` con `validateSync` y estos casos:
    - límites de RN-13: horas de 0, 0,5, 100 y 100,5; días de 0, 1, 7 y 8, y que sean enteros; 6 hitos; objetivos de 0, 1, 100 y 101; objetivos repetidos;
    - casos de RN-17: vacío, solo espacios, 60 y 61 caracteres, recorte de espacios.
  - `backend/src/middlewares/errorHandler.test.ts` con `req` y `res` simulados:
    - error de la API con 409 → 409 `conflicto` con `requestId`;
    - error de clave duplicada E11000 → 409 `conflicto`;
    - los 400, 404 y 500 existentes no cambian.
- **DoD:** los tests existen y fallan donde falta código.

### T-16 · backend · Error de conflicto

- **Descripción:**
  - Añadir `conflicto` a `TipoError`.
  - `ApiError(409)` pasa a tener `conflicto` como tipo por defecto.
  - El errorHandler traduce E11000 a 409.
- **DoD:** los tests del errorHandler de T-15 pasan.

### T-17 · backend · Modelo Meta con índice de meta activa única

- **Descripción:** crear `backend/src/modelos/Meta.model.ts` según el diagnóstico §7.1:
  - `descripcion` de 1 a 60 caracteres, con recorte de espacios (RN-17);
  - índice único parcial `{ videojuego: 1 }` con `activa: true`;
  - `timestamps`.
- **DoD:**
  - Los tests del modelo de T-15 pasan.
  - El índice existe en la base de desarrollo.

### T-18 · backend · Crear y consultar una meta

- **Descripción:** añadir `POST /api/metas` y `GET /api/metas/:id`, siguiendo la arquitectura en capas. El servicio comprueba:
  - que el juego existe (404 `referencia_inexistente`);
  - que su estado admite meta (409 `conflicto`, RN-07);
  - que no hay otra meta activa (409 `conflicto`, RN-09), con el índice como red de seguridad.
- **DoD:** curl contra la base de desarrollo:
  - creación correcta → 201;
  - segunda meta activa → 409 `conflicto`;
  - juego completado o abandonado → 409 `conflicto`;
  - juego inexistente → 404;
  - id mal formado → 400;
  - límites fuera de rango → 400.

### T-19 · backend · Editar, desactivar, reactivar y listar metas

- **Descripción:**
  - `PUT /api/metas/:id` con lista blanca: `horasSemanales`, `diasPorSemana`, `hitos` y `activa`. Se ignora `videojuego`.
  - `PATCH /api/metas/:id/desactivar`.
  - `GET /api/videojuegos/:id/metas`, de la más reciente a la más antigua.
  - Reactivar con `activa: true` aplica RN-07 y RN-09; los dos rechazos responden 409 `conflicto`.
  - No hay ruta para borrar (RN-16).
- **DoD:** curl contra la base de desarrollo:
  - editar → 200;
  - desactivar → 200;
  - reactivar con otra meta activa → 409 `conflicto`;
  - reactivar en un juego completado o abandonado → 409 `conflicto`;
  - la lista devuelve activas e inactivas en orden.

### T-20 · backend · Progreso semanal del juego

- **Descripción:** añadir `GET /api/videojuegos/:id/progreso-semanal`.
  - Calcula «hoy» en Ecuador en el borde.
  - Consulta las partidas y la meta activa, y combina semana, progreso, racha e hitos.
  - La respuesta sigue el diagnóstico §7.3, con `porcentajeHoras` topado en 100.
  - Responde 404 si el juego no existe y 400 si el id es inválido.
- **DoD:** curl contra la base de desarrollo:
  - sin meta → `meta` nula, porcentaje nulo y `hitos` vacío;
  - con meta → valores coherentes con H-02 a H-05;
  - 404 y 400.

### T-21 · backend · Cascada metas → partidas → videojuego

- **Descripción:** `eliminar` en `videojuegos.service.ts` borra en este orden: metas, partidas, videojuego. Sin transacción (P4b se difiere).
- **DoD:**
  - En la base de desarrollo, un juego con 2 metas y 12 partidas → 204.
  - Después, quedan 0 metas y 0 partidas con ese videojuego.

### T-22 · docs · README, pruebas.http y .env.example

- **Descripción:**
  - README:
    - modelo Meta, rutas nuevas, fórmulas de semana, racha, hitos y porcentaje;
    - reglas de fecha;
    - cómo ejecutar los tests;
    - corregir la URL de clonación y «Cinco pantallas» (P11);
    - sección «Cómo trabajamos con el agente», con:
      - el harness: AGENTS.md, CLAUDE.md, hooks, skills y DESIGN.md;
      - el flujo seguido: diagnóstico → harness → PRD → backlog → specs → código → auditoría;
      - dónde está cada documento.
  - `pruebas.http`: metas, progreso y casos 400, 404 y 409 (P12).
  - `.env.example`: confirmar que no hay variables nuevas y añadir una nota sobre usar un `MONGODB_DB` de desarrollo distinto del de Render.
- **DoD:**
  - Cada ruta nueva tiene al menos una petición en `pruebas.http`.
  - El README describe las 4 fórmulas y el comando `npm test`.
  - El README tiene la sección «Cómo trabajamos con el agente» con:
    - los 5 elementos del harness;
    - los 7 pasos del flujo;
    - la ruta de cada documento (diagnóstico, PRD, épicas, backlog, specs y auditoría).

### T-23 · frontend · `hoyISO` en hora de Ecuador (deuda P2)

- **Descripción:** `hoyISO()` en `tipos.ts` usa `Intl` con America/Guayaquil en lugar de la zona del navegador.
- **DoD:**
  - D-P2.5 está verificado: con el sistema en otra zona horaria, la fecha propuesta es la de Ecuador.
  - `npm run build` del frontend pasa.

### T-24 · frontend · Tipos, API de metas y progreso, y tokens de E2

- **Descripción:**
  - Tipos `Meta`, `Hito` y `ProgresoSemanal` en `tipos.ts`.
  - `frontend/src/api/metasApi.ts` con: crear, obtener, actualizar, desactivar, listar por juego y progreso semanal.
  - Tokens `--meta-ok`, `--meta-pendiente`, `--racha` y `--tinta-oscura` en `:root` (DESIGN.md).
- **DoD:**
  - `npm run build` pasa.
  - No hay ningún `fetch` fuera de `api/`.

### T-25 · frontend · Sección de progreso semanal

- **Descripción:** un panel en el detalle del juego, junto al resumen, con:
  - barra `.xp` de horas, con `role="progressbar"` y `aria-valuenow` topado en 100;
  - «X h de Y h»;
  - «N de M días»;
  - racha actual y mejor racha en Orbitron.
  - Estados de la sección con `EstadoCarga`:
    - carga mientras llega el progreso;
    - error con «Reintentar» que no oculta el resto del detalle;
    - vacío sin meta, que invita a crear una (RN-12).
  - El progreso se vuelve a pedir, sin recargar la página, al registrar y al eliminar una partida del juego (H-02.9).
- **DoD:**
  - Revisión visual de H-02.1, H-02.3, H-02.6, H-03.1, H-03.3, H-04.1 y H-04.7 en la base de desarrollo.
  - H-02.9 está verificado: al registrar una partida de 1 h, el progreso pasa de 70 % a 90 % sin recargar, y vuelve a 70 % al eliminarla.
  - H-02.10 está verificado:
    - el estado de carga se ve con la red lenta simulada;
    - con la API detenida aparece el error con «Reintentar» y el resto del detalle sigue visible;
    - «Reintentar» recupera el progreso al volver la API.
  - Contraste AA y foco visible.
  - Ningún color literal.

### T-26 · frontend · Hitos y aviso de juego terminado

- **Descripción:**
  - Lista de hitos con su estado escrito, «Alcanzado» o «Pendiente», no solo con color.
  - Sin meta activa no hay lista (RN-15).
  - Aviso en juegos «completado» o «abandonado» con meta activa (RN-19).
- **DoD:** revisión visual de H-05.1, H-05.2, H-05.5, H-07.2 y H-07.3.

### T-27 · frontend · Formulario de crear y editar meta

- **Descripción:**
  - Formulario controlado con horas, días y hasta 5 hitos (texto y objetivo).
  - Los errores de la API se muestran sobre el formulario con `role="alert"`, sin códigos HTTP.
  - La acción principal usa `.boton-secundario` (DESIGN.md).
- **DoD:** revisión visual de H-01.1 a H-01.7 y H-06.1. Los mensajes siguen el tono de DESIGN.md.

### T-28 · frontend · Desactivar, reactivar e historial de metas

- **Descripción:**
  - Botón «Desactivar» con la confirmación «¿Desactivar la meta de {juego}?».
  - Debajo de la sección de progreso, la lista de metas inactivas con horas, días y fecha de creación, y un botón «Reactivar» en cada una.
  - No hay botón de borrar (RN-16).
  - Los rechazos (RN-07, RN-09) se muestran con un mensaje claro.
- **DoD:** revisión visual de H-06.2 a H-06.7.

### T-29 · frontend · La confirmación de borrar un juego menciona las metas

- **Descripción:** el texto de confirmación pasa a nombrar el juego y a avisar que se borrarán también sus metas y sus partidas.
- **DoD:** revisión visual de H-08.2. H-08.1 se comprueba de punta a punta con T-21.

### T-30 · frontend · Editar una partida (recortable, P8)

- **Descripción:**
  - Ruta de edición que reutiliza `FormularioPartida` en modo edición, con `obtenerPartida` y `actualizarPartida`, que ya existen en `partidasApi.ts`.
  - Botón «Editar» en las listas de partidas.
- **DoD:**
  - Revisión visual de H-09.1 a H-09.4.
  - H-02.9 al editar: al cambiar la duración de una partida de la semana, el progreso del detalle refleja las horas nuevas sin recargar la página.
- **Si no entra:** pasa a la deuda técnica con su motivo.

### T-31 · docs · Desplegar en Render, verificar E2 y abrir el pull request

- **Depende de:** T-22 a T-30.
- **Descripción:**
  - Actualizar los servicios de Render.
  - Comprobar de punta a punta los flujos de la demo.
  - Abrir el PR de `feature/e2-metas-rachas` a `main`.
- **DoD:**
  - Las URLs públicas del frontend y de la API tienen E2 funcionando.
  - No hay ningún secreto en Git.
  - `.env.example` no tiene credenciales.
  - La descripción del PR lista los tickets y enlaza `docs/AUDITORIA.md`.

---

## 4. Deuda técnica diferida

| Id  | Qué                                                                                                                             | Motivo para diferirlo                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| P4b | Transacción en la eliminación en cascada                                                                                        | El orden metas → partidas → videojuego ya evita huérfanos. Si algo falla, el juego sigue existiendo y el borrado se puede reintentar. |
| P6  | Reemplazar los 75 colores literales del CSS por variables y quitar las 9 variables sin uso                                      | El código nuevo ya usa solo variables. Limpiar lo existente no aporta a E2.                                                           |
| P13 | Contraste AA en las pantallas existentes (`.volver`, `.boton-texto`, `dt` y `.nota` del resumen) y en el botón primario (3.4:1) | E2 no toca esas pantallas. La sección nueva cumple AA y usa `.boton-secundario`.                                                      |
| P14 | CSS sobrante (bordes invisibles, `.logo-fuente`)                                                                                | Es cosmético. Se limpia junto con P6.                                                                                                 |
| P15 | Carrera entre comprobar que el juego existe y guardar la partida                                                                | La ventana es mínima con una sola persona usuaria, y cerrarla requiere una transacción (mismo motivo que P4b).                        |
| P16 | Exigir minutos enteros en la duración                                                                                           | Un decimal no rompe ninguna fórmula de E2.                                                                                            |
| P17 | La configuración se lee dos veces                                                                                               | Es inofensivo, y los tests de E2 no se conectan a la base.                                                                            |
| P18 | Paginación de la lista general de partidas                                                                                      | El volumen es pequeño, y E2 consulta por videojuego.                                                                                  |
| P8  | Editar partidas (solo si T-30 no entra)                                                                                         | Es recortable por decisión del diagnóstico §5.11.                                                                                     |

---

## 5. Trazabilidad RN → historia → criterio

| RN    | Historia                           | Criterios                                      |
| ----- | ---------------------------------- | ---------------------------------------------- |
| RN-01 | H-04, H-09                         | H-04.1, H-04.2, H-04.3, H-09.4                 |
| RN-02 | H-03, H-04                         | H-03.1, H-04.4                                 |
| RN-03 | H-02, H-03, H-09, D-P2             | H-02.2, H-03.2, H-09.1, D-P2.1, D-P2.2         |
| RN-04 | H-02, H-06                         | H-02.4, H-06.1                                 |
| RN-05 | H-02                               | H-02.3                                         |
| RN-06 | H-05, H-09, D-P5                   | H-05.1, H-05.2, H-05.3, H-09.3, D-P5.3         |
| RN-07 | H-01, H-06, H-07                   | H-01.7, H-06.4, H-06.6, H-07.1                 |
| RN-08 | H-08                               | H-08.1, H-08.2                                 |
| RN-09 | H-01, H-06                         | H-01.6, H-06.5                                 |
| RN-10 | H-02, H-04, H-09, D-P2, D-P5       | H-02.5, H-04.6, H-09.2, D-P2.3, D-P2.5, D-P5.4 |
| RN-11 | H-02, H-03, D-P2                   | H-02.1, H-02.2, H-03.2, D-P2.4                 |
| RN-12 | H-02, H-03, H-04, H-05, H-06, D-P5 | H-02.6, H-03.3, H-04.7, H-05.4, H-06.3, D-P5.1 |
| RN-13 | H-01                               | H-01.1, H-01.2, H-01.3, H-01.4                 |
| RN-14 | H-02, H-03                         | H-02.7, H-03.4                                 |
| RN-15 | H-05, H-06                         | H-05.5, H-06.3, H-06.4                         |
| RN-16 | H-06                               | H-06.2, H-06.7                                 |
| RN-17 | H-01                               | H-01.5                                         |
| RN-18 | H-02, H-03                         | H-02.8, H-03.5                                 |
| RN-19 | H-07                               | H-07.2, H-07.3                                 |
| RN-20 | H-04                               | H-04.5                                         |

Las 20 reglas tienen al menos un criterio. Ninguna RN queda sin cubrir.

H-02.9 y H-02.10 no comprueban ninguna RN (columna «—»): cubren el refresco y los estados de la sección.

**Decisiones para las specs:**

- **Rechazos por RN-07** (juego completado o abandonado, al crear o reactivar una meta): responden 409 con tipo `conflicto`, igual que RN-09. La petición es válida, pero choca con el estado actual. Se aplica en T-18 y T-19.
- **`semana.inicio` y `semana.fin`:** formato `AAAA-MM-DD`, con los dos extremos incluidos (lunes y domingo). Se aplica en T-07, T-08 y T-20.
