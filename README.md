# 🎮 Diario de Progreso Gamer

> **¿Qué estoy jugando ahora, cuánto le he dedicado y cuánto he avanzado?**

Aplicación web MERN (MongoDB, Express, React, Node.js con TypeScript) para llevar el control de los videojuegos que tengo, registrar cada sesión de juego y ver un **resumen de progreso calculado por el backend**.

## URLs públicas (Render)

| Servicio | URL |
|---|---|
| Frontend (Static Site) | `PENDIENTE: https://TU-FRONTEND.onrender.com` |
| API (Web Service) | `PENDIENTE: https://TU-API.onrender.com` |
| Salud del API | `PENDIENTE: https://TU-API.onrender.com/api/salud` |

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
| `fecha` | Date | **obligatorio** |
| `duracionMinutos` | number | **obligatorio**, `min` 1, `max` 1440 (una sesión no supera 24 horas) |
| `porcentajeAvance` | number | **obligatorio**, `min` 0, `max` 100 |
| `notas` | string | opcional, máximo 500 caracteres |
| `createdAt`, `updatedAt` | Date | `timestamps` automáticos |

Índice `{ videojuego: 1, fecha: -1 }` para que la ruta anidada y el resumen consulten rápido las partidas de un juego ordenadas por fecha.

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

`GET /api/videojuegos/:id/resumen` → función `resumenDeVideojuego` en `backend/src/services/partidas.service.ts` (capa de servicio; ni el controlador ni el frontend calculan nada).

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
| DELETE | `/api/videojuegos/:id` | 204 (borra también sus partidas) |
| PATCH | `/api/videojuegos/:id/logros/:logroId` | 200 `{ videojuego, requestId }` con `{ "obtenido": true }` |
| GET | `/api/videojuegos/:id/partidas` | 200 `{ partidas, total, requestId }` (ruta anidada) |
| GET | `/api/videojuegos/:id/resumen` | 200 `{ totalPartidas, horasTotales, ultimaPartida, porcentajeAvanceActual }` |
| GET | `/api/partidas` | 200 `{ partidas, total, requestId }` con `populate("videojuego")` |
| GET | `/api/partidas/:id` | 200 `{ partida, requestId }` con `populate("videojuego")` |
| POST | `/api/partidas` | 201 `{ partida, requestId }` (404 si el videojuego no existe) |
| PUT | `/api/partidas/:id` | 200 `{ partida, requestId }` (actualización parcial) |
| DELETE | `/api/partidas/:id` | 204 |
| GET | `/api/salud` | 200 `{ estado: "ok" }` / 503 sin conexión |

Los cuerpos aceptan solo los campos del modelo (lista blanca en `validacion.ts`); los demás se ignoran.

## 5. Manejo de errores

Middlewares: `requestId` (id único por petición, también en la cabecera `X-Request-Id`), `logger` (método, ruta, status y duración) y `errorHandler` centralizado. Todas las respuestas de error tienen la forma `{ error, tipo, requestId }` (y `detalles` en las validaciones). Nunca se envían stacks ni secretos al cliente.

| Tipo | Status | `tipo` | Cómo provocarlo (ver `backend/pruebas.http`) |
|---|---|---|---|
| Validación de esquema | 400 | `validacion` | `POST /api/videojuegos` con `{"nombre":"","plataforma":"Atari","genero":"accion"}` |
| Id mal formado (CastError) | 400 | `id_mal_formado` | `GET /api/videojuegos/abc` |
| Referencia inexistente | 404 | `referencia_inexistente` | `POST /api/partidas` con `"videojuego": "65afffffffffffffffffffff"` |
| Recurso inexistente | 404 | `no_encontrado` | `GET /api/videojuegos/65afffffffffffffffffffff` |
| Error inesperado | 500 | `interno` | `GET /api/debug/error` con `PERMITIR_ERROR_PRUEBA=true` en el `.env` local (ruta desactivada en producción) |

## 6. Frontend

React + TypeScript + Vite + React Router. Cinco pantallas:

| Ruta | Pantalla |
|---|---|
| `/` | Lista de videojuegos con filtro por estado |
| `/videojuegos/:id` | Detalle: datos, logros (se marcan con una casilla), **resumen calculado** y partidas del juego |
| `/videojuegos/nuevo` y `/videojuegos/:id/editar` | Formulario crear/editar videojuego, con editor de logros |
| `/partidas` | Lista de todas las partidas (con el nombre del juego por `populate`) |
| `/partidas/nueva` | Formulario de nueva partida; al guardar vuelve al detalle del juego con el resumen actualizado |

- Las páginas nunca llaman a `fetch`: usan `src/api/videojuegosApi.ts` y `src/api/partidasApi.ts`, que pasan por `src/api/http.ts`.
- Cada pantalla que depende de la API muestra los estados **cargando, error (con botón Reintentar) y vacío** mediante `components/EstadoCarga.tsx`.
- Formularios controlados con `useState`.

## 7. Estructura

```
backend/
  src/
    config/env.ts           variables de entorno (validación)
    config/conexionDB.ts    conexión a MongoDB Atlas
    modelos/                esquemas Videojuego y Partida
    services/               lógica de negocio, validación de referencias y resumen
    controllers/            traducción HTTP
    routes/                 endpoints
    middlewares/            requestId, logger, errorHandler
    app.ts                  ensambla Express (CORS, JSON, rutas, errores)
    index.ts                conecta a la base y escucha
  pruebas.http              peticiones de prueba (incluye los 4 tipos de error)
  .env.example
frontend/
  src/
    api/                    http.ts, videojuegosApi.ts, partidasApi.ts
    components/             EstadoCarga, BloqueResumen
    paginas/                las 5 pantallas
    tipos.ts                tipos compartidos y utilidades
  .env.example
```

## 8. Instalación y ejecución local

Requisitos: Node.js 20 o superior, una base en MongoDB Atlas y Git.

```bash
git clone https://github.com/TU-USUARIO/diario-progreso-gamer.git
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

### Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `MONGODB_URI` | backend | Cadena de conexión de Atlas. **Solo en `.env` local o en el panel de Render; nunca en el repositorio** |
| `MONGODB_DB` | backend | Nombre de la base (por ejemplo `diario_gamer`) |
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

## 11. Decisiones de diseño

- **Borrado en cascada:** eliminar un videojuego elimina también sus partidas, para no dejar referencias huérfanas (el frontend lo advierte antes de confirmar).
- **Filtro de la lista:** por `estado`, que responde directamente a "¿qué estoy jugando ahora?".
- **`porcentajeAvance` obligatorio:** el "avance actual" del resumen depende de él; si fuera opcional, el resumen podría quedar indefinido.
- **Fechas:** el formulario envía `AAAA-MM-DD`, que se guarda como medianoche UTC y se muestra en UTC para no desplazar el día.

## 12. Demo

Flujo grabado: crear un videojuego con logros → registrar varias partidas → ver el resumen actualizarse en el detalle → marcar un logro como obtenido.
