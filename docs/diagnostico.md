# Diagnóstico del Proyecto 3 antes de la épica E2 «Metas y rachas»

- **Proyecto:** Diario de Progreso Gamer (Express + TypeScript + Mongoose en `backend/`, React + TypeScript + Vite en `frontend/`, desplegado en Render con MongoDB Atlas).
- **Rama:** `feature/e2-metas-rachas`
- **Fecha:** 2026-11-10
- **Propósito:** registrar el estado del repositorio, los problemas que afectan a E2, cómo se clasifica cada uno y las decisiones tomadas antes de escribir el PRD (Fase 3).

Archivos revisados: `README.md`, `backend/package.json`, `frontend/package.json`, todo `backend/src/`, todo `frontend/src/` y `backend/pruebas.http`. No se abrió ningún archivo `.env`.

---

## 1. Estado del proyecto

**Funciona:**

- CRUD de Videojuego con logros embebidos y `PATCH /api/videojuegos/:id/logros/:logroId`.
- CRUD de Partida referenciada al videojuego, con `populate`, ruta anidada `GET /api/videojuegos/:id/partidas` y validación de referencia (404).
- `GET /api/videojuegos/:id/resumen`, calculado en el servicio en cada petición.
- `errorHandler` centralizado con 400 (`validacion`, `id_mal_formado`), 404 (`no_encontrado`, `referencia_inexistente`) y 500 (`interno`), siempre con `requestId`.
- `crearApp` está separado de `listen` ([app.ts:13](../backend/src/app.ts#L13)), lo que facilita probar sin abrir puertos.
- El frontend tiene 6 rutas, una capa `api/` como único lugar que llama a `fetch`, y estados de cargando, error y vacío ([EstadoCarga.tsx](../frontend/src/components/EstadoCarga.tsx)).
- Despliegue en Render (Static Site + Web Service) con Atlas.

**Falta para E2:**

- Modelo Meta, carpeta `src/dominio/` y cualquier manejo de zona horaria (no aparecen `Intl` ni `America/Guayaquil` en el backend).
- Framework y script de tests.
- Error 409 y tipo `conflicto`.
- Metas en el borrado en cascada.
- En el frontend: tipos, API, sección de progreso y formulario de meta.
- No hay CI ni linter (fuera del alcance de E2).

---

## 2. Sospechas iniciales y evidencia

| Sospecha | Resultado | Evidencia |
|---|---|---|
| a) No hay framework de tests ni script `test` | **Confirmada** | Los scripts son solo `dev`, `build`, `start` y `check` ([backend/package.json:7-12](../backend/package.json#L7-L12); el frontend agrega `preview`, [frontend/package.json:6-11](../frontend/package.json#L6-L11)). No hay jest, vitest ni supertest, ni archivos `*.test.*`. |
| b) `Partida.fecha` es `Date` y solo el formulario la deja a medianoche UTC; el API acepta cualquier hora | **Confirmada, con un matiz** | El esquema es `{ type: Date, required }` sin más reglas ([Partida.model.ts:14](../backend/src/modelos/Partida.model.ts#L14)). El servicio no normaliza ([partidas.service.ts:36](../backend/src/services/partidas.service.ts#L36), [:47](../backend/src/services/partidas.service.ts#L47)). **Matiz:** el frontend tampoco normaliza de forma explícita; envía el `AAAA-MM-DD` del `<input type="date">` ([FormularioPartida.tsx:117](../frontend/src/paginas/FormularioPartida.tsx#L117)) y la medianoche UTC sale de que JavaScript interpreta una fecha sin hora como UTC. La regla solo figura en el README ([README.md:226](../README.md#L226)). |
| c) `errorHandler` y `ApiError` no contemplan 409 | **Confirmada** | `TipoError` no tiene tipo de conflicto ([apiError.ts:1](../backend/src/apiError.ts#L1)); `new ApiError(409, …)` caería en `'validacion'` ([apiError.ts:8](../backend/src/apiError.ts#L8)); no hay rama para el error E11000, que hoy termina en 500 ([errorHandler.ts:23-40](../backend/src/middlewares/errorHandler.ts#L23-L40)). |
| d) Eliminar un videojuego borra sus partidas sin transacción y sin considerar metas | **Confirmada** | Tres operaciones sueltas, sin sesión: `obtener` → `Partida.deleteMany` → `findByIdAndDelete` ([videojuegos.service.ts:33-37](../backend/src/services/videojuegos.service.ts#L33-L37)). |
| e) La fórmula del resumen está mezclada con el acceso a datos | **Confirmada** | `resumenDeVideojuego` consulta (`find…lean()`) y calcula (`reduce`, redondeo, partida más reciente) en la misma función ([partidas.service.ts:66-79](../backend/src/services/partidas.service.ts#L66-L79)). No se puede probar el cálculo sin base. |
| f) El frontend no tiene capa de metas ni tokens documentados, y hay colores literales fuera de las variables | **Confirmada** | En `api/` solo existen `http.ts`, `videojuegosApi.ts` y `partidasApi.ts`; [tipos.ts](../frontend/src/tipos.ts) no tiene Meta. `:root` define variables pero no hay documentación de tokens. Fuera de `:root` hay **34 colores hex y 41 `rgba()` en 45 líneas** de [estilos.css](../frontend/src/estilos.css). Hay **9 variables sin usar**: `--fondo`, `--fondo-2`, `--panel`, `--panel-2`, `--borde`, `--segundo`, `--acento-oscuro`, `--xp-vacio`, `--radio-grande`. Los `.tsx` no tienen colores literales. |
| g) No existe pantalla para editar partidas | **Confirmada** | No hay ruta de edición ([App.tsx:31-45](../frontend/src/App.tsx#L31-L45)); `obtenerPartida` y `actualizarPartida` existen pero ninguna pantalla las usa ([partidasApi.ts:15-25](../frontend/src/api/partidasApi.ts#L15-L25)). |

**Por qué b) importa para E2:** `2026-10-20T00:00:00Z` en America/Guayaquil (UTC−5) es el **19 de octubre a las 19:00**. Si los cálculos convirtieran la fecha guardada a hora local, todas las partidas existentes se correrían un día hacia atrás.

---

## 3. Evidencia de Atlas

Verificación hecha por la autora del proyecto en la base de producción de Atlas el **10 de noviembre de 2026**:

- **0 partidas** con hora distinta de medianoche UTC.
- **0 partidas** con fecha futura.

Consecuencia: la decisión de tratar `fecha` como día de calendario (sección 5.1) **no necesita migración de datos**.

---

## 4. Tabla final de problemas

Clasificaciones: **BLOQUEA** (hay que resolverlo para entregar E2), **Alcance E2** (trabajo propio de la épica), **Deuda con ciclo completo** (se paga dentro de E2 con criterio, test, código y verificación), **Ticket recortable**, **Primer commit** y **SE DIFIERE** (pasa al backlog con su motivo).

| id | Problema | Evidencia | Impacto en E2 | Clasificación | Motivo |
|---|---|---|---|---|---|
| P1 | No hay framework de tests ni script `test` | [backend/package.json:7-12](../backend/package.json#L7-L12) | E2 exige tests automatizados | **BLOQUEA** | Sin tests no se puede entregar E2 |
| P2 | `fecha` acepta cualquier hora, zona o fecha futura. Incluye **P9**: `hoyISO()` usa la zona del navegador | [Partida.model.ts:14](../backend/src/modelos/Partida.model.ts#L14), [partidas.service.ts:36](../backend/src/services/partidas.service.ts#L36), [:47](../backend/src/services/partidas.service.ts#L47), [tipos.ts:108-111](../frontend/src/tipos.ts#L108-L111) | La semana lunes-domingo y la racha dependen de saber a qué día pertenece cada partida | **BLOQUEA + deuda con ciclo completo** | Sin una regla de fecha fija, los cálculos de E2 serían ambiguos (sección 6.1) |
| P3 | No hay 409; un duplicado (E11000) termina en 500 | [apiError.ts:1](../backend/src/apiError.ts#L1), [:8](../backend/src/apiError.ts#L8), [errorHandler.ts:23-40](../backend/src/middlewares/errorHandler.ts#L23-L40) | La regla «una sola meta activa por juego» debe responder 409 | **BLOQUEA** | Con el índice único, el choque daría hoy 500 «interno» |
| P4a | La cascada no borra las metas | [videojuegos.service.ts:33-37](../backend/src/services/videojuegos.service.ts#L33-L37) | Quedarían metas huérfanas | **BLOQUEA** | Es parte del modelo de E2 |
| P4b | La cascada no usa transacción | mismo lugar | Un fallo a mitad deja un borrado parcial | **SE DIFIERE** | El orden metas → partidas → videojuego ya evita huérfanos; si algo falla, el juego sigue existiendo y se reintenta |
| P5 | La fórmula del resumen está mezclada con el acceso a datos | [partidas.service.ts:66-79](../backend/src/services/partidas.service.ts#L66-L79) | Los hitos necesitan la misma lógica de «partida más reciente» | **Deuda con ciclo completo** | Evita duplicar lógica y deja todo el cálculo en `dominio/` (sección 6.2) |
| P6 | Colores literales en el CSS (34 hex y 41 `rgba()` fuera de `:root`) y 9 variables sin usar | [estilos.css:5-31](../frontend/src/estilos.css#L5-L31), p. ej. [:46](../frontend/src/estilos.css#L46), [:81](../frontend/src/estilos.css#L81), [:128](../frontend/src/estilos.css#L128), [:153-154](../frontend/src/estilos.css#L153-L154), [:198](../frontend/src/estilos.css#L198) | La sección de progreso debe usar solo variables | **SE DIFIERE** | Basta con que el código nuevo use solo variables; la limpieza de lo existente no aporta a E2 |
| P7 | No hay capa de metas en el frontend | [tipos.ts](../frontend/src/tipos.ts), [api/](../frontend/src/api/) | Hay que crear tipos, `api` de metas, sección de progreso y formulario de meta | **Alcance E2** | Es trabajo de la épica, no deuda |
| P8 | No hay pantalla para editar partidas | [App.tsx:31-45](../frontend/src/App.tsx#L31-L45), [partidasApi.ts:15-25](../frontend/src/api/partidasApi.ts#L15-L25) | Corregir una partida mal cargada obliga a borrarla y crearla de nuevo, lo que puede afectar la racha o un hito | **Ticket recortable** (último del frontend) | El requisito dice «registrar, editar o eliminar» y el API ya existe; si falta tiempo, pasa a deuda con su motivo |
| P10 | `package-lock.json` vacío en la raíz y `frontend/.vite/` sin ignorar | `git status` del 2026-11-10 | Riesgo de subirlos por error | **Primer commit** | Resuelto en `chore: limpieza previa a E2` |
| P11 | README desactualizado: URL de clonación con `TU-USUARIO`, dice «Cinco pantallas» con 6 rutas, y no documenta E2 | [README.md:135](../README.md#L135), [:178](../README.md#L178) | La entrega de E2 debe quedar documentada | **Alcance E2** | Modelo Meta, endpoint, fórmulas y cómo correr los tests van en el README |
| P12 | `pruebas.http` sin casos de E2 | [pruebas.http](../backend/pruebas.http) | Faltan metas, progreso semanal y los casos 400/404/409 | **Alcance E2** | Es la base de la verificación manual de la Fase 6 |
| P13 | Contraste bajo en pantallas existentes: `.volver` y `.boton-texto` usan `#d91538` sobre negro (≈3,1:1); `dt` y `.nota` del resumen usan `--tinta-suave` sobre el degradado naranja-amarillo | [estilos.css:118](../frontend/src/estilos.css#L118), [:141](../frontend/src/estilos.css#L141), [:198](../frontend/src/estilos.css#L198), [:214](../frontend/src/estilos.css#L214), [:216](../frontend/src/estilos.css#L216) | La sección nueva no debe heredar esos estilos | **SE DIFIERE** | E2 no toca esas pantallas; la sección nueva sí cumple contraste AA |
| P14 | CSS sobrante: bordes `rgba(21,25,49,…)` invisibles sobre fondo negro y clase `.logo-fuente` sin uso | [estilos.css:113](../frontend/src/estilos.css#L113), [:239-241](../frontend/src/estilos.css#L239-L241), [:281](../frontend/src/estilos.css#L281) | Ninguno | **SE DIFIERE** | Es cosmético, sin efecto funcional; se limpia junto con P6 |
| P15 | Carrera al crear partida: se comprueba que el juego existe y luego se guarda | [partidas.service.ts:38-39](../backend/src/services/partidas.service.ts#L38-L39) | Una partida podría quedar huérfana si el juego se borra en ese instante | **SE DIFIERE** | La ventana es mínima con un solo usuario y cerrarla requiere transacción (mismo motivo que P4b) |
| P16 | `duracionMinutos` acepta decimales | [Partida.model.ts:15-20](../backend/src/modelos/Partida.model.ts#L15-L20) | Ninguno en las fórmulas de E2 | **SE DIFIERE** | Las horas se calculan dividiendo minutos y redondeando; un decimal no rompe ningún cálculo |
| P17 | `leerEnv()` se llama dos veces | [index.ts:6](../backend/src/index.ts#L6), [conexionDB.ts:6](../backend/src/config/conexionDB.ts#L6) | Ninguno | **SE DIFIERE** | Es inofensivo y los tests de E2 no se conectan a la base |
| P18 | `GET /api/partidas` no tiene paginación | [partidas.service.ts:19-21](../backend/src/services/partidas.service.ts#L19-L21) | Ninguno | **SE DIFIERE** | El volumen actual es pequeño y E2 consulta partidas por videojuego, no la lista general |

P9 se numeró por separado durante el diagnóstico y luego se integró en P2.

**Resumen de clasificación:**

- Bloquean o son alcance de E2: P1, P2, P3, P4a, P7, P11 y P12.
- Deudas con ciclo completo: P2 (con P9) y P5.
- Ticket recortable: P8.
- Primer commit: P10.
- Backlog: P4b, P6, P13, P14, P15, P16, P17 y P18.

---

## 5. Decisiones tomadas

### 5.1 `fecha` es un día de calendario

- El API acepta solo `AAAA-MM-DD`. Con hora o con otro formato responde **400**. La validación es una **función pura de dominio**.
- Se guarda a medianoche UTC, como hasta ahora.
- Los cálculos de E2 usan la **parte de fecha en UTC** como «día en Guayaquil».
- No se migran datos (sección 3).
- Una partida que cruza la medianoche pertenece al día de su `fecha`; la duración no se reparte entre días.

**Justificación:** así funciona ya el formulario, los datos de Atlas cumplen la regla, y tratar la fecha como instante obligaría a migrar y correría un día todas las partidas al convertirlas a UTC−5.

### 5.2 Se rechazan las fechas futuras

- Una partida con fecha posterior al «hoy» de America/Guayaquil responde **400**.
- `hoyISO()` del frontend usará Guayaquil, para que el valor por defecto del formulario nunca quede en el futuro (resuelve P9).

**Justificación:** una partida futura inflaría las horas de la semana y la racha.

### 5.3 Tests con Vitest, sin base de datos

- El núcleo son funciones puras con «hoy» como parámetro: semana, días jugados, racha, hitos y resumen. Pasar «hoy» permite probar la zona horaria.
- Sin supertest ni mongodb-memory-server.
- Sin base también se prueban: `validateSync` del modelo Meta y el `errorHandler` con `req`/`res` simulados, incluido E11000 → 409.
- Los 400/404/409 de punta a punta se verifican con la tabla de curl/Thunder Client de la Fase 6, contra una **base de desarrollo** con su propio `MONGODB_DB`, para no tocar la de Render.

**Justificación:** el riesgo de E2 está en los cálculos de fechas, que son puros. Probarlos sin infraestructura es rápido y determinista.

### 5.4 Una sola meta activa por juego → 409

- Doble protección:
  - comprobación en el servicio, con un mensaje claro;
  - índice único parcial `{ videojuego: 1 }` con `partialFilterExpression: { activa: true }`, como red de seguridad ante dos peticiones simultáneas.
- El `errorHandler` traduce ambos casos a **409** con el nuevo tipo **`conflicto`**.
- Crear una meta cuando ya hay una activa da 409; la anterior **no** se desactiva en silencio. Para cambiar de meta se edita la existente, o se desactiva y se crea otra.
- Reactivar una meta inactiva mientras hay otra activa también da 409.

**Justificación:** la comprobación da un buen mensaje y el índice cubre la carrera que la comprobación sola no puede evitar.

### 5.5 Borrado en cascada: metas → partidas → videojuego

- Al borrar un juego se borran sus metas y sus partidas: una meta sin juego ni partidas no tiene sentido.
- Sin transacción (P4b se difiere). El orden es primero los hijos y al final el padre.

**Justificación:** si algo falla a mitad, el juego sigue existiendo y el borrado se puede reintentar; nunca quedan documentos huérfanos.

### 5.6 Racha

- Basta una partida ese día. Varias partidas del mismo día cuentan como un día.
- La racha cuenta días, no semanas.
- Si hoy todavía no hay partida pero ayer sí, la racha sigue viva (cuenta hasta ayer).
- Se rompe cuando pasa un día completo sin jugar: si el último día jugado es anterior a ayer, `rachaActual` es 0.

### 5.7 Hitos

- Se compara el `porcentajeObjetivo` de cada hito con el `porcentajeAvanceActual` del resumen.
- `alcanzado` **no se guarda**: se calcula en cada petición.
- **Consecuencia aceptada** (irá en el PRD): si después se registra una partida con menos avance, el hito deja de estar alcanzado.

### 5.8 `progreso-semanal` sin meta activa

- Responde **200** con `meta: null`, `porcentajeHoras: null` e `hitos: []`. Las horas, los días y las rachas sí se calculan.
- **404** solo si el videojuego no existe; **400** si el id es inválido.

### 5.9 El resumen se mueve a `dominio/` (P5)

- Se paga dentro de E2 con ciclo completo. El contrato de `GET /api/videojuegos/:id/resumen` **no cambia**.

**Justificación:** evita duplicar la lógica de «partida más reciente» que también usan los hitos.

### 5.10 Tokens de diseño

- Se documentan en `DESIGN.md` (Fase 2).
- El código nuevo usa **solo variables**; si falta un valor, primero se añade la variable.
- La limpieza de los colores literales existentes (P6) va al backlog.

### 5.11 Edición de partidas (P8)

- Entra en E2 como **último ticket del frontend y recortable**: se reutiliza `FormularioPartida` en modo edición, porque el API ya existe.

**Justificación:** el requisito dice «registrar, editar o eliminar», y corregir una partida mal cargada puede deshacer un hito. Si falta tiempo, pasa a deuda con su motivo.

### 5.12 Limpieza previa (P10)

- Commit propio al inicio de la rama: `chore: limpieza previa a E2`. Se borró el `package-lock.json` vacío de la raíz (no estaba versionado) y se añadió `.vite/` al `.gitignore`.

---

## 6. Deudas a pagar con ciclo completo

### 6.1 P2 (incluye P9): fecha como día de calendario y rechazo de fechas futuras

- **Criterio:**
  - `POST` y `PUT /api/partidas` aceptan solo `AAAA-MM-DD`; cualquier otro formato o una fecha con hora → 400.
  - Una fecha posterior al «hoy» de Guayaquil → 400.
  - `hoyISO()` devuelve la fecha actual en Guayaquil.
- **Test (Vitest, funciones puras):**
  - formatos válidos e inválidos (con hora, con zona, texto, vacío);
  - fecha futura con «hoy» como parámetro;
  - la frontera de la medianoche en Guayaquil: `2026-11-10T04:59Z` todavía es 9 de noviembre en Guayaquil.
- **Código:**
  - función pura de validación en `backend/src/dominio/`, usada por `crear` y `actualizar` en [partidas.service.ts](../backend/src/services/partidas.service.ts);
  - `hoyISO()` en [tipos.ts](../frontend/src/tipos.ts).
- **Verificación:** los tests pasan, y la tabla de curl/Thunder Client de la Fase 6 contra la base de desarrollo muestra 400 con hora, 400 con fecha futura y 201 con `AAAA-MM-DD` válido.

### 6.2 P5: el resumen como función pura

- **Criterio:** la respuesta de `GET /api/videojuegos/:id/resumen` es idéntica a la actual. El servicio solo consulta y la fórmula vive en `dominio/`.
- **Test (Vitest):**
  - cero partidas → `{ totalPartidas: 0, horasTotales: 0, ultimaPartida: null, porcentajeAvanceActual: 0 }`;
  - 870 minutos → 14,5 h y 100 minutos → 1,67 h;
  - con dos partidas en la misma fecha gana la de `createdAt` posterior.
- **Código:** función pura en `backend/src/dominio/`, llamada desde `resumenDeVideojuego` en [partidas.service.ts:66-79](../backend/src/services/partidas.service.ts#L66-L79). Los hitos reutilizan la lógica de «partida más reciente».
- **Verificación:** los tests pasan y la respuesta del endpoint en la base de desarrollo es la misma antes y después del cambio.

---

## 7. Datos fijos de E2

Datos confirmados. La ficha completa se usará en la Fase 3; aquí no se agrega nada que no esté confirmado.

### 7.1 Modelo Meta

| Campo | Tipo | Reglas |
|---|---|---|
| `videojuego` | ObjectId, `ref: "Videojuego"` | obligatorio |
| `horasSemanales` | number | mayor que 0 y máximo 100 |
| `diasPorSemana` | entero | de 1 a 7 |
| `activa` | boolean | por defecto `true` |
| `hitos` | arreglo **embebido** | máximo 5. Cada hito: `{ descripcion: string, porcentajeObjetivo: number entre 1 y 100 }` |
| `createdAt`, `updatedAt` | Date | `timestamps` |

- Campos editables por `PUT`: `horasSemanales`, `diasPorSemana`, `hitos` y `activa`.
- `videojuego` **se ignora en el `PUT`**, como cualquier campo fuera de la lista blanca (así funciona ya el resto del API). Una meta no cambia de videojuego.

### 7.2 Rutas (siguiendo el patrón de Partida)

| Método | Ruta | Nota |
|---|---|---|
| POST | `/api/metas` | El cuerpo trae el `videojuego` |
| GET | `/api/metas/:id` | |
| PUT | `/api/metas/:id` | Solo los campos editables |
| PATCH | `/api/metas/:id/desactivar` | |
| GET | `/api/videojuegos/:id/metas` | Todas, activas e inactivas, la más reciente primero: el modelo conserva el historial |
| GET | `/api/videojuegos/:id/progreso-semanal` | Semana lunes a domingo en America/Guayaquil |

### 7.3 Respuesta de `progreso-semanal`

```
{
  semana: { inicio, fin },
  meta: { horasSemanales, diasPorSemana } | null,
  horasSemana,
  porcentajeHoras | null,
  diasJugadosSemana,
  rachaActual,
  mejorRacha,
  hitos: [{ descripcion, porcentajeObjetivo, alcanzado }]
}
```

- `horasSemana` = minutos de la semana / 60, con **un decimal**.
- `porcentajeHoras` = `horasSemana / horasSemanales × 100`, redondeado a **entero**.
- El campo se llama `mejorRacha`.

### 7.4 Reglas de negocio para los criterios de aceptación

- Las funciones puras **ignoran toda partida posterior al «hoy» de Guayaquil**, y esto tiene su test. Hoy no hay ninguna en Atlas (sección 3), pero la regla protege ante datos anteriores a la validación.
- Las reglas de racha (5.6), hitos (5.7) y respuesta sin meta (5.8) son criterios de aceptación.

---

## 8. Backlog diferido

| id | Qué | Motivo para diferirlo |
|---|---|---|
| P4b | Transacción en el borrado en cascada | El orden hijos → padre ya evita huérfanos y el borrado se puede reintentar |
| P6 | Reemplazar los colores literales por variables y quitar las 9 variables sin uso | El código nuevo ya usa solo variables; limpiar lo existente no aporta a E2 |
| P13 | Contraste AA en las pantallas existentes | E2 no toca esas pantallas; la sección nueva sí cumple AA |
| P14 | CSS sobrante (bordes invisibles, `.logo-fuente`) | Cosmético; se limpia junto con P6 |
| P15 | Carrera entre comprobar el juego y guardar la partida | Ventana mínima con un solo usuario; cerrarla requiere transacción |
| P16 | Exigir minutos enteros en `duracionMinutos` | No afecta a ninguna fórmula de E2 |
| P17 | Doble llamada a `leerEnv()` | Inofensiva; los tests de E2 no se conectan a la base |
| P18 | Paginación de `GET /api/partidas` | Volumen pequeño; E2 consulta por videojuego |

---

## 9. Supuestos y pendientes

**Supuestos** (se confirman en el PRD si hace falta):

- Se permite repetir `porcentajeObjetivo` entre hitos de una misma meta; la ficha no lo prohíbe.
- Un hito está alcanzado cuando `porcentajeAvanceActual >= porcentajeObjetivo`.
- Vitest se usa solo en el backend.
- Una fecha con formato correcto pero inexistente (por ejemplo `2026-02-30`) se trata como formato inválido → 400.

**Pendientes para el PRD (Fase 3), sin decidir aquí:**

- El **tope de `porcentajeHoras`** (140 % o 100 %): hueco 5 de la ficha.
- La definición exacta de **`mejorRacha`**.
- El formato de **`semana.inicio`** y **`semana.fin`**.
- Si la regla de ignorar partidas posteriores a «hoy» se aplica también al resumen (5.9), cuyo contrato no cambia.
