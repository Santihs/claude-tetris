import { COLS, ROWS, LINE_SCORES } from './constants';
import { dropIntervalForLevel } from './level';
import type { Board, Shape } from './types';

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

export function collide(board: Board, shape: Shape, ox: number, oy: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

export function merge(board: Board, shape: Shape, ox: number, oy: number): void {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c])
        board[oy + r][ox + c] = shape[r][c];
}

export interface ClearLinesResult {
  cleared: number;
  scoreDelta: number;
  linesAfter: number;
  levelAfter: number;
  dropIntervalAfter: number;
  isPerfectClear: boolean;
}

export function clearLines(board: Board, lines: number, level: number): ClearLinesResult {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  let linesAfter = lines;
  let levelAfter = level;
  let dropIntervalAfter = dropIntervalForLevel(level);
  let scoreDelta = 0;
  let isPerfectClear = false;
  if (cleared) {
    linesAfter = lines + cleared;
    scoreDelta = (LINE_SCORES[cleared] || 0) * level;
    levelAfter = Math.floor(linesAfter / 10) + 1;
    dropIntervalAfter = dropIntervalForLevel(levelAfter);
    isPerfectClear = board.every(row => row.every(v => v === 0));
  }
  return { cleared, scoreDelta, linesAfter, levelAfter, dropIntervalAfter, isPerfectClear };
}
