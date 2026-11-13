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

- **Semana cumplida:** una semana se cumple solo si se alcanzan **las dos cosas**: las horas objetivo **y** los días objetivo de la meta. Alcanzar solo una no basta. Ejemplo: con una meta de 5 h y 4 días, jugar 6 h repartidas solo en sábado y domingo **no** cumple la semana, porque faltan 2 días. Lo que se busca es la constancia.
- **Mes:** 4 semanas **completas** y consecutivas, cada una de lunes a domingo. La primera es la semana en que se crea la meta, que cuenta completa con las partidas que ya tenía (RN-14).

Esta métrica no se puede medir dentro de la aplicación en E2. Ver el punto abierto PA-01.

## 5. Alcance

E2 incluye:

1. **Meta por videojuego.** Crearla con horas por semana, días por semana y hasta 5 hitos de avance. También editarla, desactivarla y reactivarla. Las metas no se borran: las inactivas quedan como historial del juego (RN-16). El detalle del juego muestra la lista de metas inactivas (horas, días y fecha de creación), cada una con la opción de reactivarla.
2. **Progreso de la semana actual** en el detalle del juego:
   - horas jugadas;
   - días jugados frente a los días de la meta;
   - porcentaje de horas respecto de la meta.
3. **Racha actual y mejor racha** del juego, sobre todo su historial de partidas.
4. **Hitos de la meta activa**, cada uno con su estado: alcanzado o pendiente.
5. **Aviso en juegos terminados:** en un juego «completado» o «abandonado» que conserva su meta activa, un aviso de que la meta sigue activa hasta que se desactive (RN-19).
6. **Eliminación completa:** al eliminar un juego se eliminan también sus metas, además de sus partidas.
7. **Reglas de fecha más estrictas para las partidas:** no se aceptan partidas con fecha futura.
8. **Corregir una partida ya registrada** desde la aplicación. Es el último elemento de la épica y se puede recortar si falta tiempo. Se incluye porque corregir una partida mal cargada, en vez de borrarla y crearla de nuevo, evita deshacer una racha o un hito.

## 6. No-alcance

- Notificaciones y recordatorios.
- Metas compartidas entre usuarios.
- Rankings.
- Gráficos históricos y, en general, consultar semanas pasadas: solo se ve la semana actual.
- Varias personas usuarias o cuentas.
- Guardar qué meta regía en cada semana (RN-04).
- Borrar una meta (RN-16).
- Limitar las horas que se pueden registrar en un mismo día (RN-18).

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

> Meta superada: el porcentaje de horas de la semana se limita a 100 %. Las horas reales se muestran siempre (ejemplo: 7 h con meta de 5 h muestra 100 % y «7 h de 5 h»).

**Ejemplo:** con una meta de 5 h y **7 h** jugadas, se muestra **100 %** y **«7 h de 5 h»**. Con 4 h jugadas se mostraría 80 % y «4 h de 5 h».

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

### RN-14 · Semana en que se crea la meta

> La semana en que se crea una meta cuenta completa para la métrica, con las partidas que ya existían en esa semana.

**Ejemplo:** el viernes 13 se crea una meta de 5 h y 3 días. Esa semana ya había partidas el lunes 9 (2 h) y el miércoles 11 (1,5 h), y el sábado 14 juega 2 h más. La semana del 9 al 15 suma **5,5 h en 3 días**: está **cumplida** y es la **primera de las 4 semanas** del mes de la métrica.

### RN-15 · Hitos sin meta activa

> Sin meta activa no se muestran hitos.

**Ejemplo:** la meta tenía dos hitos, «Llegar al 25 %» (alcanzado) y «Llegar al 50 %» (pendiente), y el avance actual es 30 %. Al desactivarla, el detalle sigue mostrando las horas, los días y la racha, pero **ningún hito**. Si se reactiva, vuelven los 2 hitos, calculados con el avance de ese momento.

### RN-16 · Las metas no se borran

> Las metas no se borran: solo se desactivan, y quedan como historial del videojuego.

**Ejemplo:** en octubre el juego tuvo una meta de 5 h, que se desactivó, y hoy tiene una meta activa de 8 h. El juego conserva **2 metas**: 1 activa y 1 inactiva. La de 5 h no se puede borrar. Solo desaparece si se elimina el juego entero (RN-08).

### RN-17 · Texto de un hito

> El texto de un hito es obligatorio, de 1 a 60 caracteres, sin espacios al inicio ni al final.

**Ejemplo:**

- Un hito sin texto, o con solo espacios, se rechaza.
- «Llegar al 50 %» (14 caracteres) se acepta.
- Un texto de 60 caracteres se acepta y uno de 61 se rechaza.
- «␣␣Llegar al 50 %␣» queda como «Llegar al 50 %»: se quitan los espacios del inicio y del final, y el largo se cuenta sin ellos.

### RN-18 · Más de 24 horas en un día

> Si en un día se registran partidas que suman más de 24 horas, se aceptan y se cuentan tal cual. Queda como limitación conocida.

**Ejemplo:** el martes 10 se registran dos partidas, de 24 h (el máximo de una partida) y de 10 h. Las dos se aceptan: el martes suma **34 h** y cuenta como **1 día jugado**. Con una meta de 10 h, la semana muestra **100 %** y «34 h de 10 h».

### RN-19 · Juego terminado con meta activa

> Un videojuego completado o abandonado con meta activa muestra su progreso normalmente, con un aviso de que la meta sigue activa hasta que se desactive.

**Ejemplo:** un juego con una meta activa de 6 h y 3 días pasa a «completado». Esta semana lleva 2 h en 1 día. El detalle muestra **«2 h de 6 h»**, **33 %**, **1 de 3 días**, la racha y los hitos igual que antes, junto con un aviso de que la meta sigue activa hasta que la persona la desactive.

### RN-20 · Racha sobre todo el historial

> La racha actual y la mejor racha se calculan sobre todo el historial de partidas del juego.

**Ejemplo:** el juego tuvo una racha de 12 días, del 1 al 12 de septiembre. La meta se creó el lunes 9 de noviembre, y hay partidas el domingo 8, el lunes 9, el martes 10, el miércoles 11, el jueves 12 y hoy viernes 13. La racha actual es **6**: cuenta también el domingo 8, anterior a la meta. La mejor racha es **12**, la de septiembre. La mejor racha nunca es menor que la actual.

---

## 8. Supuestos

Son puntos que no están en la ficha ni en las reglas. Se dan por buenos salvo que se diga lo contrario.

1. **Objetivos de hito repetidos.** Se permiten, como ya indica RN-13.
2. **Cuándo se alcanza un hito.** Cuando el avance actual es **igual o mayor** que su objetivo: con 50 % se alcanza «Llegar al 50 %».
3. **Horas con fracción.** Las horas por semana de la meta admiten fracciones, por ejemplo 2,5 h.
4. **Metas sin hitos.** Una meta puede tener entre 0 y 5 hitos: la ficha habla de una «lista corta» y no exige un mínimo.
5. **Fechas inexistentes.** Una fecha que no existe, como el 30 de febrero, se rechaza igual que una fecha mal escrita.

## 9. Puntos abiertos

### PA-01 · La métrica de éxito no se puede medir automáticamente en E2

- **Qué falta:** saber, dentro de la aplicación, si la persona cumplió su meta 3 de 4 semanas.
- **Justificación:**
  - Medirlo exige revisar semanas pasadas, y los gráficos históricos están fuera del alcance. E2 solo muestra la semana actual.
  - Por RN-04 no se guarda qué meta regía en cada semana, así que una semana pasada no se puede evaluar con la meta que tenía entonces.
- **Mientras tanto:** la métrica se mide **fuera de la aplicación**. Se revisan a mano las partidas de las 4 semanas contra la meta, con las definiciones de «semana cumplida» y «mes» de la sección 4.
- **Si se quiere automatizar:** corresponde a una épica futura de historial, que tendría que guardar la meta de cada semana.

Los puntos abiertos PA-02 a PA-07 de la versión anterior quedaron resueltos con las reglas RN-14 a RN-19.

---

## 10. Glosario

| Término                              | Significado                                                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Semana**                           | De lunes a domingo, en hora de Ecuador (RN-11). Solo se muestra la semana actual.                                                                                                                 |
| **Día jugado**                       | Un día de calendario con al menos una partida del juego, sin importar cuántas ni cuántas horas sumen (RN-02, RN-18). Una partida pertenece al día en que se registró (RN-03).                     |
| **Racha**                            | Cantidad de días jugados seguidos, hasta hoy o hasta ayer si hoy todavía no hay partida. Se rompe con un día completo sin jugar (RN-01). Se calcula sobre todo el historial del juego (RN-20).    |
| **Mejor racha**                      | La racha más larga de todo el historial del juego hasta hoy (RN-20).                                                                                                                              |
| **Meta**                             | Lo que la persona se propone jugar en un juego cada semana: horas por semana, días por semana y hasta 5 hitos (RN-13). No se borra, solo se desactiva (RN-16).                                    |
| **Meta activa**                      | La única meta vigente de un juego, la que se usa para calcular la semana (RN-04, RN-09). Las demás quedan inactivas como historial.                                                               |
| **Hito**                             | Un objetivo de avance del juego dentro de una meta, por ejemplo «Llegar al 50 %». Está alcanzado mientras el avance actual llegue a su objetivo (RN-06). Solo se muestra con meta activa (RN-15). |
| **Avance del juego**                 | El porcentaje de avance de la partida más reciente, el mismo del resumen de E1. Es lo que se compara con los hitos.                                                                               |
| **Porcentaje de horas de la semana** | Horas jugadas en la semana respecto de las horas de la meta, con un máximo de 100 % (RN-05). No tiene relación con el avance del juego.                                                           |
| **Semana cumplida**                  | Semana en la que se alcanzan las horas objetivo **y** los días objetivo de la meta. Es la base de la métrica de éxito.                                                                            |
| **Mes (para la métrica)**            | 4 semanas completas y consecutivas de lunes a domingo, empezando por la semana en que se crea la meta (RN-14).                                                                                    |
