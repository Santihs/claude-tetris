# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tetris built with TypeScript + Vite + pnpm, tested with Vitest. Migrated from an earlier vanilla-JS single-file version (`game.js`) — that file no longer exists; all logic now lives under `src/` as typed ES modules.

## Running it

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm build        # tsc --noEmit && vite build
pnpm preview       # preview a production build
pnpm typecheck    # tsc --noEmit only
pnpm test         # vitest run
pnpm test:watch   # vitest watch mode
```

Deploys to GitHub Pages via `.github/workflows/deploy.yml` (builds `dist/` with Actions — the site does not serve raw source from the branch root).

## Architecture

`index.html` is the shell: a `#board` canvas, `#next-canvas`/`#hold-canvas` previews, a queue-preview strip, HUD elements, `#mode-select` (start screen), and two overlays — `#overlay` (shared by GAME OVER and PAUSE) and `#skill-overlay` (its own independent overlay for the skill menu). `main.ts` looks up every DOM ref once and constructs the `Game`.

### Core state (`src/loop.ts`)

`Game` is a class holding all mutable state as public fields (`board`, `current`, `queue`, `hold`, `score`, `lines`, `level`, `paused`, `gameOver`, `comboCount`, skill/power-up timers, etc.) plus a single `refs: GameRefs` object (DOM references, passed once via the constructor). There is no separate state-machine layer — screens toggle via `classList.add/remove('hidden')` directly from `Game` methods.

Two overlay patterns exist and matter for extending the UI:
- `#overlay` — reused for GAME OVER and PAUSE (`endGame()`, `togglePause()`, `endChallenge()`). Don't repurpose its contents for unrelated UI.
- `#skill-overlay` — a fully independent overlay with its own show/hide methods (`openSkillMenu()`/`closeSkillMenu()`) and its own `animId` cancel/resume around the `requestAnimationFrame` loop. **This is the template to copy for any new standalone overlay/menu.**

`loop.ts`'s `loop = (ts) => {...}` is the single `requestAnimationFrame` tick: handles freeze/slow-time timers, gravity via `dropAccum >= dropInterval`, and challenge-objective progression, then calls `draw()` and reschedules itself.

### Modules

- `board.ts` — board matrix creation, `collide`, `merge`, `clearLines`.
- `pieces.ts` — piece definitions/spawn selection (`randomPiece`, `selectNextPieceType`), reads `PIECES`/`COLORS`/piece-type constants from `constants.ts`.
- `constants.ts` — all tunables: `COLS`/`ROWS`/`BLOCK`, `COLORS` and `PIECES` (parallel arrays indexed by type, 1-17: 7 standard + 3 pentomino + reward/challenge/power-up/garbage pieces), scoring/timing constants.
- `scoring.ts` — hard/soft-drop points, combo/T-spin/back-to-back/perfect-clear bonuses.
- `powerups.ts` — power-up piece effects (bomb, lightning, freeze, gravity, dye), applied on lock via `applyPowerUpEffect`.
- `challenge.ts` — challenge-mode objectives (sprint 40L, survival, preset-blocks): `startObjective`, `updateObjective`, garbage-row insertion.
- `hold.ts` — hold-piece swap logic.
- `skills.ts` — the chargeable skill-bar ability system (energy fills on line clears, `skillReady` opens `#skill-overlay`).
- `render.ts` — canvas drawing: `draw`, `drawPiecePreview`, `drawQueueStrip`, `ghostY`.
- `hud.ts` — `updateHUD(refs, score, lines, level)`, minimal DOM text updates.
- `theme.ts` — light/dark toggle only (`applyTheme`/`initTheme`/`toggleTheme`, `document.body.dataset.theme`, one localStorage key). Not a multi-skin system.
- `types.ts` — shared `Shape`/`Board`/`Piece`/`PowerUpKind` types.
- `input.ts` — single `keydown` listener, early-return gated on `!game.started`, `skillMenuOpen`, `paused || gameOver`. `KeyP` toggles pause.
- `main.ts` — entry point: DOM ref lookups, `Game` construction, event wiring.

Each module with meaningful pure logic has a co-located `*.test.ts` (Vitest) — `board`, `challenge`, `hold`, `pieces`, `powerups`, `scoring`, `skills`.

### Tunables

`COLS`, `ROWS`, `BLOCK`, `COLORS`, `PIECES`, scoring/timing constants all live in `src/constants.ts`. If `COLS`/`ROWS`/`BLOCK` change, the `#board` canvas `width`/`height` in `index.html` must match (`COLS×BLOCK`, `ROWS×BLOCK`).
