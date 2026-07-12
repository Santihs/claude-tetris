# Claude Tetris

Implementación del clásico **Tetris** en TypeScript, usando HTML5 Canvas y CSS, empaquetado con Vite y gestionado con pnpm.

![Tech](https://img.shields.io/badge/HTML5-Canvas-orange)
![Tech](https://img.shields.io/badge/CSS3-blueviolet)
![Tech](https://img.shields.io/badge/TypeScript-blue)
![Tech](https://img.shields.io/badge/Vite-purple)
![Tech](https://img.shields.io/badge/pnpm-orange)

---

## Tabla de contenidos

- [Claude Tetris](#claude-tetris)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Qué hace el proyecto](#qué-hace-el-proyecto)
  - [Cómo ejecutar el juego](#cómo-ejecutar-el-juego)
  - [Tests](#tests)
  - [Controles](#controles)
  - [Cómo funciona](#cómo-funciona)
    - [1. `index.html`](#1-indexhtml)
    - [2. `src/style.css`](#2-srcstylecss)
    - [3. `src/*.ts`](#3-srcts)
    - [Flujo del juego](#flujo-del-juego)
  - [Tecnologías](#tecnologías)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Personalización](#personalización)
  - [Licencia](#licencia)

---

## Qué hace el proyecto

Es una versión jugable del Tetris clásico, con todas las mecánicas base y varias capas encima:

- Tablero de **10 × 20** celdas, las **7 piezas estándar** (I, O, T, S, Z, J, L), rotación con _wall kicks_, soft/hard drop, pieza fantasma, pausa y reinicio.
- **Hold**: reserva la pieza actual (`C` / `Shift`), una vez por turno.
- **Piezas especiales**: pentominós (`+`, `U`, `Y`) que aparecen ocasionalmente, una pieza `1×1` de recompensa tras un Tetris, y una pieza hueca `3×3` como reto periódico.
- **Power-ups**: cada 5 líneas aparece una pieza especial (bomba, rayo, congelar, gravedad, tinte) con un efecto distinto al colocarla.
- **Combos y bonificaciones**: rachas de líneas consecutivas, T-spin, back-to-back Tetris y Perfect Clear, con aviso visual en pantalla.
- **Barra de habilidad**: se carga al limpiar líneas; al llenarse (`V`) da a elegir entre ver las próximas 5 piezas, cambiar la pieza actual, ralentizar la caída, deshacer la última jugada, o un hold gratis.
- **Modo Desafío**: sprint de 40 líneas contrarreloj, supervivencia con basura que sube cada 10s, y una partida con bloques fijos pre-colocados — seleccionable desde la pantalla inicial.
- **Sistema de puntuación** clásico de Tetris (100 / 300 / 500 / 800 multiplicado por nivel) más las bonificaciones de combo/T-spin/B2B/perfect clear.
- **Niveles** que aumentan cada 10 líneas y aceleran la caída.

---

## Cómo ejecutar el juego

Requiere [pnpm](https://pnpm.io/).

```bash
pnpm install      # instala dependencias
pnpm dev          # servidor de desarrollo con hot-reload (Vite)
pnpm build        # typecheck + build de producción en dist/
pnpm preview      # sirve el build de producción localmente
```

Abre la URL que imprime `pnpm dev` (por defecto `http://localhost:5173`).

---

## Tests

Lógica pura (colisiones, rotación, limpieza de líneas, puntuación) cubierta con [Vitest](https://vitest.dev/):

```bash
pnpm test         # corre la suite una vez
pnpm test:watch   # modo watch
pnpm typecheck    # solo chequeo de tipos, sin build
```

---

## Controles

| Tecla         | Acción                              |
| ------------- | ------------------------------------ |
| `←` / `→`     | Mover la pieza horizontalmente       |
| `↑` o `X`     | Rotar la pieza en sentido horario    |
| `↓`           | Soft drop (bajar más rápido)         |
| `Espacio`     | Hard drop (caída instantánea)        |
| `C` / `Shift` | Hold (reservar pieza actual)         |
| `V`           | Abrir menú de habilidad (si está lista) |
| `1`–`5`       | Elegir habilidad (menú de habilidad) |
| `P`           | Pausar / reanudar                    |

---

## Cómo funciona

### 1. `index.html`

Define la estructura visual:

- Un `<canvas id="board">` de **300 × 600** píxeles donde se renderiza el tablero.
- Un panel lateral con `SCORE`, `LINES`, `LEVEL`, vista de la siguiente pieza y la lista de controles.
- Un overlay para los estados **PAUSA** y **GAME OVER**.
- Carga `src/main.ts` como módulo ES nativo (`<script type="module">`).

### 2. `src/style.css`

Aporta el aspecto visual con estética _dark / retro arcade_: fondo oscuro, tipografía monoespaciada para los marcadores y _backdrop blur_ en los overlays. Se importa desde `src/main.ts`.

### 3. `src/*.ts`

La lógica está separada por responsabilidad en módulos pequeños:

| Módulo | Responsabilidad |
| --- | --- |
| `constants.ts` | Dimensiones, paleta `COLORS`, formas `PIECES`, tablas de puntuación y todas las constantes de balance (intervalos de power-up, duración de freeze/slow-time, etc.) |
| `types.ts` | Tipos compartidos (`Board`, `Piece`, `Shape`, `PowerUpKind`) |
| `board.ts` | `createBoard`, `collide`, `merge`, `clearLines` (incluye `isPerfectClear`) — lógica pura, testeada con Vitest |
| `pieces.ts` | `randomPiece`, `rotateCW`, `tryRotate` (wall kicks + detección de T-spin), `selectNextPieceType` (prioridad de spawn especial) |
| `scoring.ts` | Puntuación de drop, combo, T-spin, back-to-back y perfect clear |
| `hold.ts` | Lógica de reservar/intercambiar pieza |
| `powerups.ts` | Efectos de las piezas power-up (bomba, rayo, congelar, gravedad, tinte) |
| `skills.ts` | Dispatcher de la barra de habilidad (`applySkill`) |
| `challenge.ts` | Objetivos del modo desafío: sprint, supervivencia (basura), bloques fijos |
| `render.ts` | Dibujado en canvas: tablero, grid, pieza, ghost, preview, tira de cola |
| `hud.ts` | Actualiza `SCORE`/`LINES`/`LEVEL` en el DOM |
| `theme.ts` | Tema claro/oscuro persistido en `localStorage` |
| `input.ts` | Bindings de teclado |
| `loop.ts` | Clase `Game`: orquesta todo el estado, `requestAnimationFrame`, spawn/lock/game-over/desafíos |
| `main.ts` | Punto de entrada: DOM refs, wiring, selección de modo |

Detalles de la lógica (sin cambios respecto a la versión original):

- **Modelo del tablero**: una matriz `ROWS × COLS` donde cada celda guarda `0` (vacía) o un índice de color (1–7) que identifica la pieza.
- **Piezas**: definidas como matrices cuadradas. Para rotar se calcula la transposición + reverso de filas (`rotateCW`).
- **Detección de colisiones** (`collide`): comprueba que ninguna celda de la pieza salga del tablero ni se solape con bloques ya fijados.
- **Wall kicks** (`tryRotate`): si la rotación choca, intenta desplazar la pieza ±1 y ±2 columnas antes de descartar el giro.
- **Game loop** (`Game.loop`): basado en `requestAnimationFrame`, acumula el tiempo transcurrido y baja la pieza una fila cuando se supera `dropInterval`. Si el juego termina a mitad de un tick, corta antes de reprogramar el siguiente frame.
- **Limpieza de líneas** (`clearLines`): recorre el tablero de abajo hacia arriba; cada fila completa se elimina y se inserta una vacía en la cima.
- **Puntuación**: usa la tabla clásica `[0, 100, 300, 500, 800]` multiplicada por el nivel actual; el hard drop suma 2 puntos por celda recorrida y el soft drop 1 punto por fila.
- **Nivel y velocidad**: el nivel sube cada 10 líneas; la velocidad de caída se calcula como `max(100, 1000 − (level − 1) × 90)` milisegundos.
- **Ghost piece** (`ghostY`): proyecta la posición final de la pieza actual hacia abajo y la dibuja con `globalAlpha = 0.2`.

### Flujo del juego

```
init()
  ├─ createBoard()                  → matriz vacía
  ├─ next = randomPiece()
  ├─ spawn()                        → mueve next a current y genera nueva next
  └─ requestAnimationFrame(loop)
        ↓
   loop(timestamp)
     ├─ acumula dt
     ├─ si dt ≥ dropInterval → baja la pieza o llama a lockPiece()
     ├─ draw()  (grid + tablero + ghost + pieza actual)
     └─ requestAnimationFrame(loop)

   keydown → mover / rotar / soft-drop / hard-drop / pausa
```

Cuando una pieza recién generada ya colisiona al aparecer (`spawn`), se dispara `endGame()` y se muestra el overlay de **Game Over**.

---

## Tecnologías

- **HTML5** — marcado y dos elementos `<canvas>` (tablero y vista previa).
- **CSS3** — _flexbox_, variables de color, `backdrop-filter` y `box-shadow`.
- **TypeScript** — tipado estricto (`strict: true`), módulos ES nativos.
- **Vite** — servidor de desarrollo con HMR y build de producción.
- **Vitest** — tests unitarios para la lógica de tablero, piezas y puntuación.
- **pnpm** — gestor de paquetes.
- **Canvas 2D API** — para todo el renderizado del juego.
- **`requestAnimationFrame`** — para el bucle de juego sincronizado con el navegador.

---

## Estructura del proyecto

```
03-tetris/
├── index.html        # Estructura del DOM y canvas
├── package.json      # Scripts (dev/build/test/typecheck) y dependencias
├── tsconfig.json      # Configuración de TypeScript
├── vite.config.ts     # Configuración de Vite + Vitest
└── src/
    ├── main.ts        # Punto de entrada, selección de modo
    ├── loop.ts        # Clase Game: orquestación del juego
    ├── board.ts       # Lógica de tablero (+ board.test.ts)
    ├── pieces.ts      # Piezas, rotación, T-spin (+ pieces.test.ts)
    ├── scoring.ts     # Puntuación y bonificaciones (+ scoring.test.ts)
    ├── hold.ts        # Hold/bucket (+ hold.test.ts)
    ├── powerups.ts    # Efectos de power-ups (+ powerups.test.ts)
    ├── skills.ts      # Barra de habilidad (+ skills.test.ts)
    ├── challenge.ts   # Modo desafío (+ challenge.test.ts)
    ├── render.ts      # Dibujado en canvas
    ├── hud.ts         # Marcadores DOM
    ├── theme.ts       # Tema claro/oscuro
    ├── input.ts       # Teclado
    ├── constants.ts   # Constantes del juego
    ├── types.ts       # Tipos compartidos
    └── style.css      # Estilos (dark theme)
```

---

## Personalización

Algunos parámetros fáciles de tunear en `src/constants.ts`:

| Constante      | Significado                              | Por defecto           |
| -------------- | ---------------------------------------- | --------------------- |
| `COLS`         | Columnas del tablero                     | `10`                  |
| `ROWS`         | Filas del tablero                        | `20`                  |
| `BLOCK`        | Tamaño en píxeles de cada celda          | `30`                  |
| `COLORS`       | Paleta de colores por tipo de pieza      | 7 colores             |
| `LINE_SCORES`  | Puntos por 1, 2, 3 o 4 líneas eliminadas | `[0,100,300,500,800]` |
| `dropInterval` | Velocidad inicial de caída en ms         | `1000`                |

> Si cambias `COLS`, `ROWS` o `BLOCK`, recuerda ajustar también `width` y `height` del `<canvas id="board">` en `index.html` para que coincida (`COLS × BLOCK` × `ROWS × BLOCK`).

---

## Licencia

Proyecto de uso libre con fines educativos y de práctica.
