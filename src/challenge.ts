import {
  COLS, GARBAGE_COLOR, SPRINT_TARGET_LINES, SPRINT_TIME_LIMIT_MS,
  GARBAGE_INTERVAL_MS, PRESET_BLOCKS_PATTERN, ROWS,
} from './constants';
import type { Board } from './types';

export type ObjectiveId = 'sprint' | 'survival' | 'preset-blocks';
export type ObjectiveStatus = 'active' | 'won' | 'lost';

export interface ObjectiveState {
  id: ObjectiveId;
  status: ObjectiveStatus;
  startTime: number;
  elapsedMs: number;
  nextGarbageAt: number;
}

export function startObjective(id: ObjectiveId, now: number): ObjectiveState {
  return { id, status: 'active', startTime: now, elapsedMs: 0, nextGarbageAt: now + GARBAGE_INTERVAL_MS };
}

export interface ObjectiveUpdateResult {
  status: ObjectiveStatus;
  elapsedMs: number;
  nextGarbageAt: number;
  garbageDue: boolean;
}

/**
 * Pure per-tick objective evaluation. Garbage insertion itself (board mutation)
 * happens outside this function - it only reports whether one is due, so the
 * caller can insert it and then check the resulting board for a top-out,
 * keeping this function free of Game/board coupling.
 */
export function updateObjective(objective: ObjectiveState, now: number, linesCleared: number): ObjectiveUpdateResult {
  const elapsedMs = now - objective.startTime;
  let status = objective.status;
  let nextGarbageAt = objective.nextGarbageAt;
  let garbageDue = false;

  if (status === 'active') {
    if (objective.id === 'sprint') {
      if (linesCleared >= SPRINT_TARGET_LINES) status = 'won';
      else if (elapsedMs >= SPRINT_TIME_LIMIT_MS) status = 'lost';
    } else if (objective.id === 'survival' && now >= nextGarbageAt) {
      garbageDue = true;
      nextGarbageAt = now + GARBAGE_INTERVAL_MS;
    }
  }

  return { status, elapsedMs, nextGarbageAt, garbageDue };
}

/** Shifts the board up one row and inserts a garbage row with one random gap column. */
export function insertGarbageRow(board: Board): void {
  board.shift();
  const holeCol = Math.floor(Math.random() * COLS);
  const row = new Array(COLS).fill(GARBAGE_COLOR);
  row[holeCol] = 0;
  board.push(row);
}

export function applyPresetBlocks(board: Board): void {
  for (const [r, c] of PRESET_BLOCKS_PATTERN) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) board[r][c] = GARBAGE_COLOR;
  }
}
