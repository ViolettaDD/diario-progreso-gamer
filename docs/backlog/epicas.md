# Épicas — Diario de Progreso Gamer

| Épica | Nombre                         | Estado                 |
| ----- | ------------------------------ | ---------------------- |
| E1    | Registro y resumen de progreso | Entregada (Proyecto 3) |
| E2    | Metas y rachas                 | En curso               |

---

## E1 · Registro y resumen de progreso

**Objetivo:** responder a la pregunta «¿qué estoy jugando ahora, cuánto le he dedicado y cuánto he avanzado?» para una persona que lleva varios juegos a la vez y pierde la cuenta.

**Alcance (entregado):**

- Ficha de cada videojuego con nombre, plataforma, género, estado («jugando», «pausado», «completado» o «abandonado») y su lista de logros, que se pueden marcar como obtenidos.
- Registro de partidas: día, duración en minutos, porcentaje de avance y notas.
- Lista de todas las partidas y lista de las partidas de cada juego.
- Resumen calculado por juego: partidas, horas totales, día de la última partida y avance actual. Se recalcula cada vez y refleja al instante cualquier cambio.
- Lista de juegos filtrable por estado.
- Eliminar un juego elimina también sus partidas, con un aviso previo.
- Aplicación publicada en internet.

**No-alcance:**

- Cuentas o varias personas usuarias.
- Metas, constancia y rachas (pasan a E2).
- Corregir una partida desde la aplicación: el producto lo permite por dentro, pero no hay pantalla para hacerlo. Pasa a E2 como elemento recortable.
- Estadísticas a lo largo del tiempo o gráficos.

---

## E2 · Metas y rachas

**Objetivo:** que la persona fije una meta semanal por videojuego y vea en el detalle del juego cómo va la semana, cuántos días seguidos lleva jugando y qué hitos ha alcanzado, para jugar con constancia y no a rachas sueltas.

**Métrica de éxito:** en un mes, la persona cumple su meta semanal al menos 3 de 4 semanas. En E2 se mide fuera de la aplicación (ver el PRD, punto abierto PA-01).

**Alcance:**

- Meta por videojuego, con horas por semana, días por semana y hasta 5 hitos de avance. Se puede crear, editar, desactivar y reactivar. No se borra: las inactivas quedan como historial.
- Como máximo una meta activa por juego, y solo en juegos «jugando» o «pausado».
- Progreso de la semana actual, de lunes a domingo en hora de Ecuador: horas, días jugados y porcentaje de horas respecto de la meta, con un máximo de 100 %.
- Racha actual y mejor racha, calculadas sobre todo el historial de partidas del juego.
- Hitos de la meta activa con su estado, alcanzado o pendiente, calculado con el avance actual.
- Aviso en juegos completados o abandonados que conservan su meta activa.
- Eliminar un juego elimina también sus metas.
- No se aceptan partidas con fecha futura.
- Corregir una partida desde la aplicación: es el último elemento y se puede recortar.

**No-alcance:**

- Notificaciones y recordatorios.
- Metas compartidas entre usuarios.
- Rankings.
- Gráficos históricos y consulta de semanas pasadas.
- Varias personas usuarias o cuentas.
- Borrar metas.
- Limitar las horas que se pueden registrar en un mismo día.

**Detalle:** reglas de negocio RN-01 a RN-20, supuestos, puntos abiertos y glosario en el PRD de E2.
