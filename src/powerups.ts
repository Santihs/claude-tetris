import { COLS, ROWS, POWER_UP_TYPE_BY_KIND, POWER_UP_KIND_BY_TYPE, FREEZE_DURATION_MS } from './constants';
import type { Board, PowerUpKind } from './types';

export function powerUpKindForType(type: number): PowerUpKind | undefined {
  return POWER_UP_KIND_BY_TYPE[type];
}

export function randomPowerUpKind(): PowerUpKind {
  const kinds = Object.keys(POWER_UP_TYPE_BY_KIND) as PowerUpKind[];
  return kinds[Math.floor(Math.random() * kinds.length)];
}

export interface PowerUpEffectResult {
  freezeUntil?: number;
}

/**
 * Mutates `board` in place for the given power-up kind, anchored at the
 * locked piece's top-left cell (lockX, lockY). Does NOT run clearLines -
 * the caller must run a single clearLines() after this, on the mutated
 * board, so effect-driven clears aren't double-counted against combo state.
 */
export function applyPowerUpEffect(board: Board, kind: PowerUpKind, lockX: number, lockY: number, now: number): PowerUpEffectResult {
  switch (kind) {
    case 'bomb':
      destroyArea(board, lockX, lockY, 1);
      return {};
    case 'lightning':
      clearRow(board, lockY);
      return {};
    case 'gravity':
      compactColumns(board);
      return {};
    case 'dye': {
      const color = pickBoardColor(board);
      if (color !== null) removeColor(board, color);
      return {};
    }
    case 'freeze':
      return { freezeUntil: now + FREEZE_DURATION_MS };
  }
}

function destroyArea(board: Board, cx: number, cy: number, radius: number): void {
  for (let r = cy - radius; r <= cy + radius; r++) {
    if (r < 0 || r >= ROWS) continue;
    for (let c = cx - radius; c <= cx + radius; c++) {
      if (c < 0 || c >= COLS) continue;
      board[r][c] = 0;
    }
  }
}

function clearRow(board: Board, row: number): void {
  const r = Math.max(0, Math.min(ROWS - 1, row));
  board[r] = new Array(COLS).fill(0);
}

function compactColumns(board: Board): void {
  for (let c = 0; c < COLS; c++) {
    const values: number[] = [];
    for (let r = 0; r < ROWS; r++) if (board[r][c] !== 0) values.push(board[r][c]);
    const padding = ROWS - values.length;
    for (let r = 0; r < ROWS; r++) {
      board[r][c] = r < padding ? 0 : values[r - padding];
    }
  }
}

function pickBoardColor(board: Board): number | null {
  const colors = new Set<number>();
  for (const row of board) for (const cell of row) if (cell !== 0) colors.add(cell);
  if (colors.size === 0) return null;
  const list = [...colors];
  return list[Math.floor(Math.random() * list.length)];
}

function removeColor(board: Board, color: number): void {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c] === color) board[r][c] = 0;
}

