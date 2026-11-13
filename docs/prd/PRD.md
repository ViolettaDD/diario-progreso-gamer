# PRD — Épica E2 «Metas y rachas»

- **Producto:** Diario de Progreso Gamer
- **Épica:** E2 «Metas y rachas»
- **Fecha:** 2026-11-13
- **Fuentes:** ficha de hechos del cliente, producto actual (E1), diagnóstico del proyecto y decisiones de negocio de la autora.

---

## 1. Contexto

El Diario de Progreso Gamer es una aplicación web publicada en internet, pensada para una sola persona. La épica E1, ya entregada, le permite:

- Llevar una **ficha por videojuego**: nombre, plataforma, género, estado («jugando», «pausado», «completado» o «abandonado») y su lista de logros.
- Registrar cada **partida**: el día en que jugó, cuántos minutos y qué porcentaje de avance tenía el juego al terminar.
- Ver en el detalle de cada juego un **resumen calculado**: cuántas partidas lleva, cuántas horas en total, el día de la última partida y el avance actual (el de la partida más reciente).
- Filtrar la lista de juegos por estado y eliminar un juego junto con todas sus partidas.

E2 se construye sobre esto: usa las mismas partidas y el mismo avance, y no cambia nada de lo que ya funciona.

## 2. Problema

La persona registra sus partidas, pero no sabe si está jugando lo que se propuso ni si es constante. Su patrón típico es jugar mucho un fin de semana y luego abandonar el juego dos semanas. El Diario muestra el total acumulado, pero no le dice cómo va **esta semana** ni cuántos días seguidos lleva jugando.

## 3. Usuarios

Es la misma persona que ya registra sus videojuegos y partidas en el Diario. Hay una sola persona usuaria: no hay cuentas ni datos compartidos con otras personas.

## 4. Objetivo y métrica de éxito

**Objetivo:** que la persona pueda fijar una meta semanal por videojuego (horas y días por semana) y ver, en el detalle del juego:

- cómo va la semana actual;
- cuántos días seguidos lleva jugando;
- qué hitos de avance ha alcanzado.

**Métrica de éxito:** en un mes, la persona **cumple su meta semanal al menos 3 de 4 semanas**.

- **Semana cumplida:** en esa semana se alcanzan **las dos cosas**: las horas de la meta y los días de la meta. Ejemplo: con una meta de 5 h y 4 días, jugar 6 h repartidas solo en sábado y domingo **no** cumple la semana, porque faltan días. Lo que se busca es la constancia.
- **Mes:** 4 semanas completas y consecutivas, de lunes a domingo, contadas desde la primera semana completa en la que el juego tiene una meta activa.

Esta métrica no se puede medir dentro de la aplicación en E2. Ver el punto abierto PA-01.

## 5. Alcance

E2 incluye:

1. **Meta por videojuego.** Crearla con horas por semana, días por semana y hasta 5 hitos de avance. También editarla, desactivarla y reactivarla.
2. **Progreso de la semana actual** en el detalle del juego:
   - horas jugadas;
   - días jugados frente a los días de la meta;
   - porcentaje de horas respecto de la meta.
3. **Racha actual y mejor racha** del juego.
4. **Hitos de la meta**, cada uno con su estado: alcanzado o pendiente.
5. **Eliminación completa:** al eliminar un juego se eliminan también sus metas, además de sus partidas.
6. **Reglas de fecha más estrictas para las partidas:** no se aceptan partidas con fecha futura.
7. **Corregir una partida ya registrada** desde la aplicación. Es el último elemento de la épica y se puede recortar si falta tiempo. Se incluye porque corregir una partida mal cargada, en vez de borrarla y crearla de nuevo, evita deshacer una racha o un hito.

## 6. No-alcance

- Notificaciones y recordatorios.
- Metas compartidas entre usuarios.
- Rankings.
- Gráficos históricos y, en general, consultar semanas pasadas: solo se ve la semana actual.
- Varias personas usuarias o cuentas.
- Guardar qué meta regía en cada semana (RN-04).

---

## 7. Reglas de negocio

Los ejemplos usan fechas de noviembre de 2026. La semana actual va del **lunes 9 al domingo 15**, y «hoy» es el **viernes 13**, salvo que el ejemplo diga otra cosa.

### RN-01 · Racha y día de hoy

> Si hoy todavía no hay partida pero ayer sí, la racha sigue viva y cuenta hasta ayer. Se rompe cuando pasa un día completo sin jugar. La racha cuenta días, no semanas.

**Ejemplo:** hay partidas el miércoles 11 y el jueves 12, y hoy viernes 13 todavía no ha jugado. La racha es **2**: sigue viva. Si el viernes 13 termina sin partidas, el sábado 14 la racha es **0**.

### RN-02 · Varias partidas el mismo día

> Varias partidas el mismo día cuentan como un solo día jugado (racha y días de la semana). Las horas de todas se suman.

**Ejemplo:** el lunes 9 hay dos partidas, de 30 y de 90 minutos. Cuentan como **1 día jugado** y suman **2 h**.

### RN-03 · Día de una partida

> Una partida pertenece al día de su fecha registrada, aunque dure más allá de la medianoche. Su duración no se reparte entre dos días. La app registra el día, no la hora.

**Ejemplo:** una partida registrada el domingo 15 que va de las 23:00 a la 01:30 del lunes suma sus **150 minutos (2,5 h) al domingo 15**, dentro de la semana del 9 al 15. No suma nada al lunes 16.

### RN-04 · Cambio de meta a mitad de semana

> La semana completa se calcula con la meta activa al consultar. No se guarda qué meta regía cada semana. Limitación aceptada.

**Ejemplo:** la meta era de 8 h y el miércoles 11 la persona la cambia a 4 h. Ya lleva 5 h en la semana. Desde ese momento, toda la semana se compara con **4 h**: antes mostraba 63 % (5 de 8 h) y ahora muestra 100 %.

### RN-05 · Meta superada

> El porcentaje de la semana se limita a 100 %. Las horas reales se muestran siempre.

**Ejemplo:** con una meta de 5 h y **7 h** jugadas, el porcentaje es **100 %** y se muestran las 7 h.

### RN-06 · Hitos con el avance actual

> Un hito se calcula con el avance actual del juego en cada consulta. Si el avance baja por debajo de su objetivo, deja de estar alcanzado.

**Ejemplo:** el hito es «Llegar al 50 %».

- La última partida registra un avance del **60 %**: el hito está **alcanzado**.
- Después se registra otra partida, más reciente, con **40 %**: el hito vuelve a **pendiente**.

### RN-07 · Metas según el estado del juego

> Solo los juegos «jugando» o «pausado» pueden recibir una meta activa (crearla o reactivarla). Si el juego pasa a «completado» o «abandonado» con una meta activa, la meta se conserva hasta que la persona la desactive.

**Ejemplo:**

- Crear una meta, o reactivar una antigua, en un juego **completado** se rechaza.
- En un juego **pausado** se puede.
- Si un juego **jugando** con una meta activa de 5 h pasa a **abandonado**, la meta de 5 h sigue activa hasta que la persona la desactive.

### RN-08 · Eliminar un videojuego

> Eliminar un videojuego elimina también sus metas y sus partidas.

**Ejemplo:** un juego con **2 metas** (una activa y una inactiva) y **12 partidas**. Al eliminarlo desaparecen el juego, las 2 metas y las 12 partidas. No queda ningún dato suelto.

### RN-09 · Una sola meta activa por juego

> Un videojuego tiene como máximo una meta activa. Intentar una segunda se rechaza con un mensaje claro. Para cambiarla, se edita la existente o se desactiva y se crea otra.

**Ejemplo:** el juego tiene una meta activa de 5 h. Al crear otra de 8 h, la persona ve que ya existe una meta activa y que puede editarla o desactivarla. La de 5 h no se desactiva sola.

### RN-10 · Fechas futuras

> No se aceptan partidas con fecha futura (según el día de hoy en Ecuador) y las ya guardadas con fecha futura no cuentan.

**Ejemplo:**

- El jueves 12 a las 21:00, hora de Ecuador, se intenta registrar una partida del viernes 13. Se **rechaza**, porque en Ecuador todavía es jueves, aunque en otras zonas horarias ya sea viernes.
- Una partida guardada antes de esta regla con fecha del viernes 20 **no suma** horas, días, racha ni avance.

### RN-11 · Semana

> La semana va de lunes a domingo en hora de Ecuador.

**Ejemplo:** el domingo 15 a las 23:00 en Ecuador todavía es la semana del **9 al 15**. La semana del 16 al 22 empieza a las 00:00 del lunes 16, hora de Ecuador.

### RN-12 · Sin meta y sin partidas

> Sin meta activa se muestran horas, días y rachas, pero sin porcentaje ni comparación con meta. Sin partidas, todo vale cero y ningún hito está alcanzado.

**Ejemplo:**

- **Sin meta activa.** Partidas el lunes 9 (1 h), el jueves 12 (1,5 h) y el viernes 13 (1,5 h). Se muestran **4 h**, **3 días jugados** y **racha 2**. No se muestra porcentaje ni «3 de N días».
- **Juego con meta y sin partidas.** Se muestran **0 h**, **0 días**, **racha 0**, **mejor racha 0** y todos sus hitos **pendientes**.

### RN-13 · Límites de la meta

> De más de 0 a 100 horas por semana; de 1 a 7 días por semana; hasta 5 hitos, con objetivo entre 1 % y 100 %. Se permiten objetivos repetidos (supuesto).

**Ejemplo:**

- **Horas por semana:** 0 h y 100,5 h se rechazan; 0,5 h y 100 h se aceptan.
- **Días por semana:** 0 y 8 días se rechazan; 1 y 7 se aceptan.
- **Hitos:** un sexto hito se rechaza, igual que un objetivo de 0 % o de 101 %. Dos hitos con objetivo del 50 % se aceptan.

---

## 8. Supuestos

Son puntos que no están en la ficha ni en las reglas. Se dan por buenos salvo que se diga lo contrario.

1. **Objetivos de hito repetidos.** Se permiten, como ya indica RN-13.
2. **Cuándo se alcanza un hito.** Cuando el avance actual es **igual o mayor** que su objetivo: con 50 % se alcanza «Llegar al 50 %».
3. **Horas con fracción.** Las horas por semana de la meta admiten fracciones, por ejemplo 2,5 h.
4. **Metas sin hitos.** Una meta puede tener entre 0 y 5 hitos: la ficha habla de una «lista corta» y no exige un mínimo.
5. **Fechas inexistentes.** Una fecha que no existe, como el 30 de febrero, se rechaza igual que una fecha mal escrita.
6. **Partidas anteriores a la meta.** Cuentan para la semana y para la racha. La racha no depende de la meta (RN-12): si la meta se crea el jueves 12, las partidas del lunes 9 también cuentan.
7. **Mejor racha.** Es la racha más larga de todo el historial del juego hasta hoy, no solo desde que existe la meta. Nunca es menor que la racha actual.

## 9. Puntos abiertos

### PA-01 · La métrica de éxito no se puede medir automáticamente en E2

- **Qué falta:** saber, dentro de la aplicación, si la persona cumplió su meta 3 de 4 semanas.
- **Justificación:**
  - Medirlo exige revisar semanas pasadas, y los gráficos históricos están fuera del alcance. E2 solo muestra la semana actual.
  - Por RN-04 no se guarda qué meta regía en cada semana, así que una semana pasada no se puede evaluar con la meta que tenía entonces.
- **Mientras tanto:** la métrica se mide **fuera de la aplicación**. Se revisan a mano las partidas de las 4 semanas contra la meta, con la definición de «semana cumplida» de la sección 4.
- **Si se quiere automatizar:** corresponde a una épica futura de historial, que tendría que guardar la meta de cada semana.

### PA-02 · Meta creada a mitad de semana

- **Situación:** RN-04 resuelve el cálculo, porque se usa toda la semana con la meta actual. Pero si la meta se crea el viernes 13 con 4 días, quedan solo 3 días para cumplirla, salvo que ya haya jugado antes en la semana.
- **Propuesta:** que esa primera semana no cuente para la métrica de éxito. Coincide con la definición de «mes», que empieza en la primera semana completa con meta activa.

### PA-03 · Hitos de una meta desactivada

- **Situación:** al desactivar la meta, sus hitos dejan de verse en el detalle del juego, porque solo se muestran los de la meta activa. La ficha pide ver «qué hitos ha alcanzado».
- **Por confirmar:** si es aceptable que los hitos alcanzados de una meta desactivada dejen de mostrarse.

### PA-04 · Las metas no se eliminan, solo se desactivan

- **Situación:** las metas inactivas se conservan como historial del juego. Una meta creada por error queda en ese historial hasta que se elimine el juego.
- **Por confirmar:** si basta con desactivar o si hace falta poder eliminar una meta.

### PA-05 · Texto de un hito

- **Situación:** la ficha da un ejemplo («Llegar al 50 %») pero no dice si el texto es obligatorio ni cuál es su largo máximo.
- **Propuesta:** obligatorio y de hasta 100 caracteres, el mismo largo que el nombre de un juego o de un logro en E1.

### PA-06 · Un día puede sumar más de 24 horas

- **Situación:** cada partida dura como máximo 24 h, pero nada impide registrar dos partidas de 24 h el mismo día. Las horas de la semana se inflarían.
- **Propuesta:** diferirlo. Viene de E1, es improbable con una sola persona usuaria y no cambia ninguna regla de E2.

### PA-07 · Progreso de un juego terminado con meta activa

- **Situación:** por RN-07, un juego «completado» o «abandonado» puede conservar su meta activa.
- **Por confirmar:** si en ese caso el progreso semanal se sigue mostrando igual que en un juego «jugando», que es lo que se asume, o si conviene un aviso que sugiera desactivar la meta.

---

## 10. Glosario

| Término                     | Significado                                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Semana**                  | De lunes a domingo, en hora de Ecuador (RN-11). Solo se muestra la semana actual.                                                                        |
| **Día jugado**              | Un día de calendario con al menos una partida del juego, sin importar cuántas (RN-02). Una partida pertenece al día en que se registró (RN-03).          |
| **Racha**                   | Cantidad de días jugados seguidos, hasta hoy o hasta ayer si hoy todavía no hay partida. Se rompe con un día completo sin jugar (RN-01).                 |
| **Mejor racha**             | La racha más larga del historial del juego hasta hoy.                                                                                                    |
| **Meta**                    | Lo que la persona se propone jugar en un juego cada semana: horas por semana, días por semana y hasta 5 hitos (RN-13).                                   |
| **Meta activa**             | La única meta vigente de un juego, la que se usa para calcular la semana (RN-04, RN-09). Las demás quedan inactivas como historial.                      |
| **Hito**                    | Un objetivo de avance del juego dentro de una meta, por ejemplo «Llegar al 50 %». Está alcanzado mientras el avance actual llegue a su objetivo (RN-06). |
| **Avance del juego**        | El porcentaje de avance de la partida más reciente, el mismo del resumen de E1. Es lo que se compara con los hitos.                                      |
| **Porcentaje de la semana** | Horas jugadas en la semana respecto de las horas de la meta, con un máximo de 100 % (RN-05). No tiene relación con el avance del juego.                  |
| **Semana cumplida**         | Semana en la que se alcanzan las horas **y** los días de la meta. Es la base de la métrica de éxito.                                                     |
