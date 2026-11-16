# DESIGN.md — Diario de Progreso Gamer

Fuente de verdad visual del frontend. Los valores salen de `frontend/src/estilos.css` (variables en `:root`).
Si necesitas un valor que no existe aquí, primero se agrega como variable en `:root` y se documenta en este archivo; después se usa.

## Identidad
Un «archivo de partidas guardadas» con aire de revista y anuncio de videojuegos de inicios de los 2000:
fondo negro con cuadrícula tenue, títulos en mayúsculas con sombra dura, bordes gruesos, botones con relieve y una
barra de experiencia segmentada como elemento memorable. Cada juego es una ranura con una franja de color según su estado.

## Colores
| Variable | Valor | Uso |
|---|---|---|
| `--fondo` / `--fondo-2` | `#000000` / `#0b0c12` | Fondo de página |
| `--panel` / `--panel-2` | `rgba(18,20,30,.96)` / `rgba(26,30,42,.96)` | Superficies elevadas |
| `--tinta` | `#f3f0e9` | Texto principal |
| `--tinta-suave` | `#d9d1c3` | Texto secundario, solo sobre fondos oscuros |
| `--borde` | `rgba(255,255,255,.08)` | Bordes sutiles |
| `--primario` / `--primario-oscuro` | `#ff3c54` / `#d91538` | Marca, botón primario, borde de cabecera |
| `--segundo` / `--segundo-oscuro` | `#ff9d22` / `#ff6a00` | Botón secundario, enlaces |
| `--acento` / `--acento-oscuro` | `#ffd863` / `#ffb000` | Elemento activo del menú |
| `--xp` / `--xp-vacio` | `#ffdd60` / `#1d2334` | Barra de experiencia y foco visible |
| `--peligro` | `#ff6c8e` | Acciones destructivas |
| `--jugando` | `#2bcc6d` | Estado «jugando» |
| `--pausado` | `#f7be2c` | Estado «pausado» |
| `--completado` | `#2ea3ff` | Estado «completado» |
| `--abandonado` | `#a69ec7` | Estado «abandonado» |

Tokens nuevos permitidos para E2 (crearlos en `:root` en el primer ticket de frontend, antes de usarlos):
`--meta-ok: var(--jugando)` (hito alcanzado), `--meta-pendiente: var(--tinta-suave)` (hito pendiente),
`--racha: var(--acento)` (racha) y `--tinta-oscura: #1a0c00` (texto sobre el degradado naranja del resumen).

## Tipografía
- Títulos, marca, navegación y cifras grandes: **Orbitron** (400–800), mayúsculas, `letter-spacing` 0.04em.
- Texto, formularios y tablas: **Rubik** (400–800). Respaldo: `system-ui, sans-serif`.
- Escala: h1 `clamp(2.1rem, 4vw, 3.4rem)`; h2 `1.3rem`; texto `1rem`; etiquetas y encabezados de tabla `0.7–0.75rem` en mayúsculas.
- **Bangers** se carga en `index.html` pero no se usa: no usarla sin decidirlo aquí.

## Espaciado y forma
- Escala en `rem`: 0.4 · 0.6 · 0.8 · 1 · 1.25 · 2. Contenedor `max-width: 1160px`, relleno lateral `1.25rem`.
- Radios: `--radio-chico` 12px (botones, campos), 18px (paneles), `--radio-grande` 22–24px (resumen), 999px (etiquetas).
- Sombras «duras»: `0 10px 0 rgba(0,0,0,.2)` más `--sombra`. Bordes de 3–4px en paneles y botones.
- Objetivo táctil mínimo: `2.65rem` de alto en campos y `2.8rem` en botones.

## Componentes
- **Cabecera**: fija, degradado oscuro, borde inferior de 5px en `--primario`, marca con sombra roja.
- **Botones**: `.boton` (primario), `.boton-secundario` (naranja), `.boton-peligro` (rosa), `.boton-texto` (subrayado).
  Texto en mayúsculas, peso 800. Deshabilitado: opacidad 0.55 y cursor `not-allowed`.
- **Ranura de juego** (`.ranura`): franja izquierda de 14px con el color del estado.
- **Etiqueta** (`.etiqueta`): píldora en mayúsculas; la de estado toma el color de su variable.
- **Panel** (`.panel`): superficie oscura con borde de 3px y encabezado h2.
- **Resumen** (`.resumen`) y **barra XP** (`.xp`): 10 segmentos; los llenos usan `--xp`. Es el patrón para la barra de horas de E2.
- **Estados**: `.estado-carga`, `.estado-error` (borde rosado, `role="alert"`) y `.estado-vacio` (borde punteado, invita a una acción).
- **Formularios**: `.campo` (etiqueta arriba), `.fila` para campos en columnas, errores del API visibles sobre el formulario.
- **Tablas**: `.tabla` con encabezados en mayúsculas pequeñas dentro de `.tabla-contenedor` con desplazamiento horizontal.

### Sección de progreso semanal (E2)
Se presenta como un `.panel` junto al resumen. Barra de horas con el patrón `.xp` y su valor en texto; días jugados contra
días objetivo en texto («3 de 4 días»); racha actual y mejor racha como cifras en Orbitron; hitos en lista con su estado escrito.
Sin meta activa: estado vacío que invita a crear una.

## Tono de los textos
Español de Ecuador, tuteo, frases cortas y directas, en verbo de acción («Registra tu primera partida»).
Los errores dicen qué pasó y qué hacer («No se pudo guardar la meta. Revisa los datos e inténtalo de nuevo»).
Los estados vacíos invitan a actuar, no solo informan. Sin tecnicismos ni códigos HTTP en pantalla. Las confirmaciones
nombran lo que se va a afectar («¿Desactivar la meta de Hades?»).

## Accesibilidad
- Contraste mínimo AA (4.5:1 para texto normal). Medido con los tokens actuales, sobre fondo oscuro:
  `--tinta` 18.5, `--tinta-suave` 12.2, `--primario` 6.0, `--segundo-oscuro` 7.3, `--acento` 15.3.
- **No usar** `--primario-oscuro` como color de texto sobre fondo oscuro (4.1:1) ni `--tinta-suave` sobre el degradado del
  `.resumen` (entre 1.1:1 y 1.5:1, ilegible). Sobre ese degradado el texto va en `--tinta-oscura` (8.3:1 o más).
- El botón primario con texto claro tiene 3.4:1 y no cumple AA para texto normal. En E2 la acción principal usa
  `.boton-secundario` (8.3:1). El botón primario existente queda como deuda anotada en el backlog.
- Nada se comunica solo con color: el estado de un hito se escribe («Alcanzado» / «Pendiente»), no solo se colorea.
- Foco visible siempre (`:focus-visible`, 4px `--xp`). Respetar `prefers-reduced-motion`.
- Barras de progreso con `role="progressbar"`, `aria-valuenow`, `aria-valuemin` y `aria-valuemax`.
- Texto solo para lectores de pantalla con `.solo-lector`. Errores del API con `role="alert"`.

## No hacemos
- No librerías de UI ni de gráficos; nada que no esté en `package.json`.
- No colores literales (`#...`, `rgb()`, `rgba()`) en estilos nuevos: solo variables de `:root`.
- No `fetch` dentro de componentes: todo pasa por `frontend/src/api/`.
- No gráficos históricos, notificaciones, recordatorios, rankings ni metas compartidas (fuera del alcance de E2).
- No animaciones largas ni que parpadeen; no emojis como único portador de significado.
- No fuentes nuevas ni más de dos familias tipográficas.
- No inventar estados visuales nuevos para los juegos: se usan los cuatro existentes.
