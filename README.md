# 🎮 Diario de Progreso Gamer

> **¿Qué estoy jugando ahora, cuánto le he dedicado y cuánto he avanzado?**

Aplicación web MERN (MongoDB, Express, React, Node.js con TypeScript) para llevar el control de los videojuegos que tengo, registrar cada sesión de juego y ver un **resumen de progreso calculado por el backend**.

## URLs públicas (Render)

| Servicio | URL |
|---|---|
| Frontend (Static Site) | https://diario-gamer-violettadd.onrender.com |
| API (Web Service) | https://diario-gamer-api-violettadd.onrender.com |
| Salud del API | https://diario-gamer-api-violettadd.onrender.com/api/salud |

> El plan gratuito de Render apaga el API tras 15 minutos sin visitas: la primera carga puede tardar cerca de un minuto.

---

## 1. Intención del proyecto

Llevo varios juegos a la vez y pierdo la cuenta de cuánto tiempo les dedico y cuánto me falta. Este diario guarda:

- La **ficha de cada videojuego** (plataforma, género, estado) con su **lista de logros**.
- Cada **partida** jugada: cuándo, cuánto tiempo y qué porcentaje de avance quedó.
- Un **resumen calculado** por juego: partidas jugadas, horas totales, fecha de la última partida y avance actual.

El proyecto reutiliza el razonamiento de modelado del ejercicio de Pawnee (Criaturas con habilidades embebidas y Avistamientos referenciados) en un dominio propio, y agrega una pieza nueva: el backend **calcula** información a partir de los datos guardados.

## 2. Modelo de datos

### Videojuego (colección `videojuegos`)

| Campo | Tipo | Validaciones |
|---|---|---|
| `nombre` | string | **obligatorio**, sin espacios sobrantes, 1 a 100 caracteres |
| `plataforma` | union literal | **obligatorio**, `enum`: `PC`, `PlayStation`, `Xbox`, `Switch`, `Movil` |
| `genero` | union literal | **obligatorio**, `enum`: `accion`, `rol`, `estrategia`, `puzzle`, `deportes`, `otro` |
| `estado` | union literal | `enum`: `jugando`, `pausado`, `completado`, `abandonado`; por defecto `jugando` |
| `logros` | `[{ nombre: string, obtenido: boolean }]` | **EMBEBIDO**. Cada logro: `nombre` obligatorio (1 a 100 caracteres), `obtenido` por defecto `false`. Máximo 50 logros |
| `createdAt`, `updatedAt` | Date | `timestamps` automáticos |

### Partida (colección `partidas`)

| Campo | Tipo | Validaciones |
|---|---|---|
| `videojuego` | ObjectId | **REFERENCIADO** (`ref: "Videojuego"`), obligatorio; el servicio comprueba que exista (404 si no) |
| `fecha` | Date | **obligatorio**. El API acepta solo `AAAA-MM-DD` (día de calendario, guardado a medianoche UTC); con hora, formato inválido, fecha inexistente o posterior a hoy en Ecuador responde 400 |
| `duracionMinutos` | number | **obligatorio**, `min` 1, `max` 1440 (una sesión no supera 24 horas) |
| `porcentajeAvance` | number | **obligatorio**, `min` 0, `max` 100 |
| `notas` | string | opcional, máximo 500 caracteres |
| `createdAt`, `updatedAt` | Date | `timestamps` automáticos |

Índice `{ videojuego: 1, fecha: -1 }` para que la ruta anidada y el resumen consulten rápido las partidas de un juego ordenadas por fecha.

### Meta (colección `metas`, épica E2)

| Campo | Tipo | Validaciones |
|---|---|---|
| `videojuego` | ObjectId | **REFERENCIADO** (`ref: "Videojuego"`), obligatorio; el servicio comprueba que exista (404 si no) |
| `horasSemanales` | number | **obligatorio**, mayor que 0 y máximo 100 |
| `diasPorSemana` | number | **obligatorio**, entero de 1 a 7 |
| `activa` | boolean | por defecto `true` |
| `hitos` | `[{ descripcion: string, porcentajeObjetivo: number }]` | **EMBEBIDO**, máximo 5. `descripcion` obligatoria, sin espacios al inicio ni al final, de 1 a 60 caracteres; `porcentajeObjetivo` de 1 a 100 (se permiten repetidos) |
| `createdAt`, `updatedAt` | Date | `timestamps` automáticos |

Reglas de negocio (detalle en `docs/prd/PRD.md`):

- **Una sola meta activa por videojuego** (RN-09): el servicio lo comprueba y responde 409; el índice único parcial `{ videojuego: 1 }` con `activa: true` cubre la carrera entre dos peticiones (E11000 → 409).
- **Solo los juegos «jugando» o «pausado»** pueden recibir una meta activa, al crearla o reactivarla (RN-07, 409). Si el juego pasa a «completado» o «abandonado», la meta se conserva hasta que se desactive.
- **Las metas no se borran** (RN-16): se desactivan y quedan como historial del juego. Reactivar es pasar `activa` de `false` a `true`.

### Por qué `logros` se embebe

1. **Se lee siempre junto con el juego.** La lista y el detalle muestran los logros del juego; nunca se consulta "un logro" por su cuenta.
2. **No tiene entidad propia.** "Derrotar al primer jefe" solo tiene sentido dentro de su juego; si el juego se borra, sus logros desaparecen con él.
3. **Es una lista corta y acotada.** Un juego tiene unas decenas de logros como mucho (el esquema limita a 50), así que el documento no crece sin control.
4. **Se actualiza en un solo documento.** Marcar un logro como obtenido modifica únicamente el videojuego (`PATCH /api/videojuegos/:id/logros/:logroId`).

Es el mismo criterio que se usó con `habilidades` dentro de `Criatura`.

### Por qué `Partida` se referencia

1. **Crece sin límite.** Jugar varias veces por semana durante meses genera cientos de partidas. Embebidas, harían crecer el documento del juego sin tope (MongoDB limita cada documento a 16 MB) y cada lectura del juego arrastraría todo el historial.
2. **Se consulta por separado.** `GET /api/partidas` lista todas mis partidas de cualquier juego (por ejemplo, "todo lo que jugué esta semana"), sin necesidad de abrir cada videojuego.
3. **La relación se valida en el servicio.** Al crear o editar una partida se comprueba que el videojuego exista y, si no, se responde 404.

Es el mismo criterio que se usó con `Avistamiento` respecto de `Criatura`.

## 3. Resumen calculado: fórmula exacta

`GET /api/videojuegos/:id/resumen` → `resumenDeVideojuego` en `backend/src/services/partidas.service.ts` consulta las partidas y la fórmula es la función pura `calcularResumen` de `backend/src/dominio/resumen.ts` (ni el controlador ni el frontend calculan nada).

```
partidas = todas las Partida con videojuego = :id,
           ordenadas por fecha descendente (si hay empate, por createdAt descendente)

totalPartidas          = cantidad de partidas
horasTotales           = redondear( Σ duracionMinutos / 60 , 2 decimales )
ultimaPartida          = fecha de partidas[0] en formato ISO 8601   (null si no hay partidas)
porcentajeAvanceActual = porcentajeAvance de partidas[0]            (0 si no hay partidas)
```

- **Partida más reciente** = la de mayor `fecha`. Si dos partidas tienen la misma fecha, gana la registrada después.
- **Redondeo de horas:** `Math.round(minutos / 60 * 100) / 100`. Ejemplo: 870 minutos → `14.5` horas; 100 minutos → `1.67` horas.
- **Cero partidas:** responde `{ "totalPartidas": 0, "horasTotales": 0, "ultimaPartida": null, "porcentajeAvanceActual": 0 }` sin romperse.
- **Tiempo real:** el resumen no se guarda; se recalcula en cada petición. Al registrar o eliminar una partida, el detalle del juego vuelve a pedirlo y muestra los valores nuevos.
- Si el videojuego no existe responde 404; si el id está mal formado, 400.
- **Partidas futuras:** una partida con día posterior a hoy (America/Guayaquil) no cuenta en el resumen (RN-10).

### Progreso semanal, racha e hitos (E2)

`GET /api/videojuegos/:id/progreso-semanal` → `progresoSemanalDeVideojuego` en `backend/src/services/progreso.service.ts`. El servicio solo consulta; los cálculos son funciones puras de `backend/src/dominio/` que reciben «hoy» por parámetro.

```
hoy                = fecha actual en America/Guayaquil (AAAA-MM-DD)
día de una partida = parte de fecha en UTC de `fecha` (nunca se convierte a hora local)
semana             = lunes a domingo que contiene hoy → { inicio, fin } en AAAA-MM-DD, ambos incluidos

horasSemana        = redondear( Σ duracionMinutos de la semana hasta hoy / 60 , 1 decimal )
diasJugadosSemana  = días distintos con al menos una partida en la semana
porcentajeHoras    = min( 100, redondear( horasSemana / horasSemanales × 100 ) )   (null sin meta activa)

rachaActual        = días seguidos con partida que terminan hoy, o ayer si hoy aún no hay partida;
                     0 si el último día jugado es anterior a ayer
mejorRacha         = secuencia más larga de días seguidos en todo el historial del juego (≥ rachaActual)

hito.alcanzado     = porcentajeAvanceActual del resumen >= porcentajeObjetivo
```

- Varias partidas el mismo día cuentan como un solo día jugado; sus horas se suman. Un día que suma más de 24 h se cuenta tal cual (RN-18).
- La semana completa se calcula con la meta activa en el momento de la consulta (RN-04); no se guarda qué meta regía cada semana.
- Las partidas con día posterior a hoy se ignoran (RN-10). Nada de esto se guarda: se recalcula en cada petición.
- **Sin meta activa:** `meta: null`, `porcentajeHoras: null` y `hitos: []`; horas, días y rachas sí se calculan.
- 404 si el videojuego no existe; 400 si el id está mal formado.

Ejemplo de respuesta (meta de 4 h; partidas de 30, 120 y 60 min esta semana; racha rota):

```json
{ "semana": { "inicio": "2026-11-09", "fin": "2026-11-15" }, "meta": { "horasSemanales": 4, "diasPorSemana": 4 },
  "horasSemana": 3.5, "porcentajeHoras": 88, "diasJugadosSemana": 3, "rachaActual": 2, "mejorRacha": 3,
  "hitos": [{ "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25, "alcanzado": true }] }
```

Ejemplo de respuesta:

```json
{ "totalPartidas": 8, "horasTotales": 14.5, "ultimaPartida": "2026-10-02T00:00:00.000Z", "porcentajeAvanceActual": 67 }
```

## 4. API REST

Arquitectura en capas: **rutas → controladores → servicios → modelos**.

| Método | Ruta | Respuesta exitosa |
|---|---|---|
| GET | `/api/videojuegos?estado=jugando` | 200 `{ videojuegos, total, requestId }` (filtro opcional por estado) |
| GET | `/api/videojuegos/:id` | 200 `{ videojuego, requestId }` |
| POST | `/api/videojuegos` | 201 `{ videojuego, requestId }` |
| PUT | `/api/videojuegos/:id` | 200 `{ videojuego, requestId }` (actualización parcial) |
| DELETE | `/api/videojuegos/:id` | 204 (borra también sus metas y sus partidas) |
| PATCH | `/api/videojuegos/:id/logros/:logroId` | 200 `{ videojuego, requestId }` con `{ "obtenido": true }` |
| GET | `/api/videojuegos/:id/partidas` | 200 `{ partidas, total, requestId }` (ruta anidada) |
| GET | `/api/videojuegos/:id/resumen` | 200 `{ totalPartidas, horasTotales, ultimaPartida, porcentajeAvanceActual }` |
| GET | `/api/videojuegos/:id/metas` | 200 `{ metas, total, requestId }` (activas e inactivas, la más reciente primero) |
| GET | `/api/videojuegos/:id/progreso-semanal` | 200 `{ semana, meta, horasSemana, porcentajeHoras, diasJugadosSemana, rachaActual, mejorRacha, hitos }` |
| GET | `/api/partidas` | 200 `{ partidas, total, requestId }` con `populate("videojuego")` |
| GET | `/api/partidas/:id` | 200 `{ partida, requestId }` con `populate("videojuego")` |
| POST | `/api/partidas` | 201 `{ partida, requestId }` (404 si el videojuego no existe) |
| PUT | `/api/partidas/:id` | 200 `{ partida, requestId }` (actualización parcial) |
| DELETE | `/api/partidas/:id` | 204 |
| POST | `/api/metas` | 201 `{ meta, requestId }` (409 si el juego ya tiene meta activa o no está «jugando» / «pausado») |
| GET | `/api/metas/:id` | 200 `{ meta, requestId }` |
| PUT | `/api/metas/:id` | 200 `{ meta, requestId }` (solo `horasSemanales`, `diasPorSemana`, `hitos` y `activa`; reactivar aplica las mismas reglas → 409) |
| PATCH | `/api/metas/:id/desactivar` | 200 `{ meta, requestId }` (no existe ruta para borrar metas) |
| GET | `/api/salud` | 200 `{ estado: "ok" }` / 503 sin conexión |

Los cuerpos aceptan solo los campos del modelo (lista blanca en `validacion.ts`); los demás se ignoran.

## 5. Manejo de errores

Middlewares: `requestId` (id único por petición, también en la cabecera `X-Request-Id`), `logger` (método, ruta, status y duración) y `errorHandler` centralizado. Todas las respuestas de error tienen la forma `{ error, tipo, requestId }` (y `detalles` en las validaciones de esquema). Nunca se envían stacks ni secretos al cliente.

| Tipo | Status | `tipo` | Cómo provocarlo (ver `backend/pruebas.http`) |
|---|---|---|---|
| Validación de esquema | 400 | `validacion` | `POST /api/videojuegos` con `{"nombre":"","plataforma":"Atari","genero":"accion"}` |
| Id mal formado (CastError) | 400 | `id_mal_formado` | `GET /api/videojuegos/abc` |
| Referencia inexistente | 404 | `referencia_inexistente` | `POST /api/partidas` con `"videojuego": "65afffffffffffffffffffff"` |
| Recurso inexistente | 404 | `no_encontrado` | `GET /api/videojuegos/65afffffffffffffffffffff` |
| Conflicto con el estado actual | 409 | `conflicto` | `POST /api/metas` por segunda vez para el mismo juego, o en un juego «completado» |
| Error inesperado | 500 | `interno` | `GET /api/debug/error` con `PERMITIR_ERROR_PRUEBA=true` en el `.env` local (ruta desactivada en producción) |

## 6. Frontend

React + TypeScript + Vite + React Router. Nueve rutas en seis pantallas:

| Ruta | Pantalla |
|---|---|
| `/` | Lista de videojuegos con filtro por estado |
| `/videojuegos/:id` | Detalle: datos, logros (se marcan con una casilla), **resumen calculado** y partidas del juego |
| `/videojuegos/nuevo` y `/videojuegos/:id/editar` | Formulario crear/editar videojuego, con editor de logros |
| `/partidas` | Lista de todas las partidas (con el nombre del juego por `populate`) |
| `/partidas/nueva` | Formulario de nueva partida; al guardar vuelve al detalle del juego con el resumen actualizado |
| `/partidas/:id/editar` | El mismo formulario en modo edición (el juego no se cambia); al guardar vuelve al detalle del juego |
| `/videojuegos/:id/meta/nueva` y `/metas/:id/editar` | Formulario crear/editar meta semanal (horas, días e hitos); al guardar vuelve al detalle del juego |

- Las páginas nunca llaman a `fetch`: usan `src/api/videojuegosApi.ts` y `src/api/partidasApi.ts`, que pasan por `src/api/http.ts`.
- Cada pantalla que depende de la API muestra los estados **cargando, error (con botón Reintentar) y vacío** mediante `components/EstadoCarga.tsx`.
- Formularios controlados con `useState`.

## 7. Estructura

```
backend/
  src/
    config/env.ts           variables de entorno (validación)
    config/conexionDB.ts    conexión a MongoDB Atlas
    dominio/                funciones puras de E2 (fechas, semana, progreso, racha, hitos, resumen, meta) y sus tests
    modelos/                esquemas Videojuego, Partida y Meta (más el test del modelo Meta)
    services/               consultas y reglas de negocio: videojuegos, partidas, metas y progreso semanal
    controllers/            traducción HTTP
    routes/                 endpoints
    middlewares/            requestId, logger, errorHandler (con su test)
    app.ts                  ensambla Express (CORS, JSON, rutas, errores)
    index.ts                conecta a la base y escucha
  pruebas.http              peticiones de prueba (errores 400, 404, 409 y 500, y los casos de E2)
  tsconfig.build.json       compilación sin los archivos *.test.ts
  .env.example
frontend/
  src/
    api/                    http.ts, videojuegosApi.ts, partidasApi.ts
    components/             EstadoCarga, BloqueResumen
    paginas/                las 6 pantallas
    tipos.ts                tipos compartidos y utilidades
  .env.example
```

## 8. Instalación y ejecución local

Requisitos: Node.js 20 o superior, una base en MongoDB Atlas y Git.

```bash
git clone https://github.com/ViolettaDD/diario-progreso-gamer.git
cd diario-progreso-gamer

# Backend
cd backend
cp .env.example .env      # completa MONGODB_URI con tu cadena de Atlas
npm install
npm run dev               # http://localhost:3000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173 (el proxy de Vite envía /api al backend)
```

Comprobar tipos y compilar: `npm run check` y `npm run build` en cada carpeta.

### Tests

```bash
cd backend
npm test                  # Vitest: funciones puras de dominio, modelo Meta y errorHandler (sin base de datos)
```

Cada test empieza con el id del criterio que verifica (por ejemplo `H-04.1: la racha sigue viva si ayer jugó`). Lo que necesita base de datos se verifica con `backend/pruebas.http` contra una **base de desarrollo**, nunca contra la de Render: arranca el backend con `MONGODB_DB=diario_gamer_dev npm run dev` (el usuario de Atlas necesita permiso `readWrite` sobre esa base).

### Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `MONGODB_URI` | backend | Cadena de conexión de Atlas. **Solo en `.env` local o en el panel de Render; nunca en el repositorio** |
| `MONGODB_DB` | backend | Nombre de la base (por ejemplo `diario_gamer`). Para desarrollo y pruebas usa otra, por ejemplo `diario_gamer_dev` |
| `PORT` | backend | Puerto local (Render define el suyo) |
| `CORS_ORIGIN` | backend | URL del frontend permitida por CORS (en producción) |
| `PERMITIR_ERROR_PRUEBA` | backend | `true` solo en local para probar el error 500 |
| `VITE_API_URL` | frontend | URL pública del API en producción; vacía en local |

## 9. Despliegue en Render

**Backend · Web Service**: Root Directory `backend`, Build `npm install && npm run build`, Start `npm start`, plan Free. Variables en el panel: `MONGODB_URI`, `MONGODB_DB`, `CORS_ORIGIN` (URL del frontend, sin `/` final). No se define `PORT`.

**Frontend · Static Site**: Root Directory `frontend`, Build `npm install && npm run build`, Publish Directory `dist`. Variable `VITE_API_URL` = URL del API (sin `/` final ni `/api`). Regla Redirects/Rewrites: `/*` → `/index.html` (Rewrite), para que React Router funcione al recargar.

MongoDB Atlas: Network Access permite `0.0.0.0/0` porque Render usa IPs variables; la protección queda en el usuario y la contraseña, que solo viven en variables de entorno.

## 10. Flujo de trabajo con Git

- `main` contiene la versión estable.
- Cada parte se desarrolla en una rama (`feature/backend`, `feature/frontend`) y se integra a `main` con **pull request**.
- Commits descriptivos por capa: `feat(modelo)`, `feat(servicio)`, `feat(controlador)`, `feat(ruta)`, `feat(pantalla)`, `docs`, `chore`.
- La épica E2 se desarrolla en `feature/e2-metas-rachas` con un commit por ticket: `<tipo>(E2): T-xx descripción`. Cada spec se commitea antes que su código y los tickets de test se commitean en rojo (`(rojo: falta T-xx)`).

## 11. Decisiones de diseño

- **Borrado en cascada:** eliminar un videojuego elimina también sus metas y sus partidas, en ese orden y al final el juego, para no dejar referencias huérfanas (el frontend lo advierte antes de confirmar). Sin transacción: si algo falla a mitad, el juego sigue existiendo y el borrado se puede reintentar.
- **Filtro de la lista:** por `estado`, que responde directamente a "¿qué estoy jugando ahora?".
- **`porcentajeAvance` obligatorio:** el "avance actual" del resumen depende de él; si fuera opcional, el resumen podría quedar indefinido.
- **Fechas:** la fecha de una partida es un día de calendario: el API solo acepta `AAAA-MM-DD`, la guarda como medianoche UTC y la muestra en UTC para no desplazar el día. «Hoy» siempre es el de America/Guayaquil, y no se aceptan partidas futuras.

## 12. Demo

Flujo grabado: crear un videojuego con logros → registrar varias partidas → ver el resumen actualizarse en el detalle → marcar un logro como obtenido.

## 13. Cómo trabajamos con el agente

La épica E2 se construyó con un agente de código (Claude Code) guiado por un *harness* versionado en el repositorio.

**Harness**

| Pieza | Para qué sirve |
|---|---|
| `AGENTS.md` | Reglas del proyecto para el agente: stack, estructura, comandos, convenciones, reglas (nunca leer `.env`, ninguna funcionalidad sin spec, dominio puro, zona horaria) |
| `CLAUDE.md` | Punto de entrada de Claude Code; importa `AGENTS.md` |
| `.claude/hooks/` | `proteger-env.mjs` bloquea leer o editar archivos `.env`; `formatear.mjs` pasa Prettier a lo que el agente edita; `probar.mjs` prueba ambos hooks (`node .claude/hooks/probar.mjs`) |
| `.claude/skills/` | `/nueva-spec` redacta una spec desde el backlog; `/commit-ticket` comprueba rama, checks y trazabilidad antes de commitear un ticket. Solo se invocan a mano |
| `DESIGN.md` | Fuente de verdad visual del frontend: tokens, componentes, accesibilidad y lo que no se hace |

**Flujo seguido**

1. **Diagnóstico** del Proyecto 3: estado, problemas P1–P18 y decisiones.
2. **Harness**: `AGENTS.md`, `CLAUDE.md`, hooks, skills y `DESIGN.md`.
3. **PRD** de E2 con las reglas de negocio RN-01 a RN-20.
4. **Backlog**: épicas, historias con criterios DADO / CUANDO / ENTONCES y tickets T-01 a T-31.
5. **Specs** de backend y frontend, commiteadas antes que el código.
6. **Código** ticket a ticket: cada ticket de test se commitea en rojo y el de código lo pone en verde.
7. **Auditoría** final de criterios y verificaciones.

**Dónde está cada documento**

| Documento | Ruta |
|---|---|
| Diagnóstico | `docs/diagnostico.md` |
| PRD | `docs/prd/PRD.md` |
| Épicas | `docs/backlog/epicas.md` |
| Backlog de E2 | `docs/backlog/E2-metas-y-rachas.md` |
| Specs | `docs/specs/backend-meta-y-progreso.md` y `docs/specs/frontend-progreso-y-formulario-de-meta.md` |
| Auditoría | `docs/AUDITORIA.md` |
