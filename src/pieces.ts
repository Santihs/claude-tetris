import {
  COLS, ROWS, PIECES, STANDARD_TYPES, PENTOMINO_TYPES,
  REWARD_PIECE_TYPE, CHALLENGE_PIECE_TYPE, CHALLENGE_PIECE_INTERVAL, PENTOMINO_ROLL_CHANCE,
  POWER_UP_TYPE_BY_KIND, T_PIECE_TYPE,
} from './constants';
import { collide } from './board';
import { powerUpKindForType, randomPowerUpKind } from './powerups';
import type { Board, Piece, Shape } from './types';

export function centeredX(shape: Shape): number {
  return Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
}

function pickWeightedType(): number {
  if (Math.random() < PENTOMINO_ROLL_CHANCE) {
    return PENTOMINO_TYPES[Math.floor(Math.random() * PENTOMINO_TYPES.length)];
  }
  return STANDARD_TYPES[Math.floor(Math.random() * STANDARD_TYPES.length)];
}

export function spawnOrientation(type: number): Piece {
  const shape = (PIECES[type] as Shape).map(row => [...row]);
  const powerUpKind = powerUpKindForType(type);
  return { type, shape, x: centeredX(shape), y: 0, ...(powerUpKind ? { powerUpKind } : {}) };
}

export function randomPiece(forcedType?: number): Piece {
  return spawnOrientation(forcedType ?? pickWeightedType());
}

export interface NextPieceSelection {
  type: number;
  pendingRewardPiece: boolean;
  pieceSpawnCount: number;
  powerUpConsumed: boolean;
}

/**
 * Priority order for the piece that will become `next`: Tetris-reward > power-up > challenge-interval > standard/pentomino roll.
 * Pure function so the spawn-selection priority is unit-testable without the DOM/canvas-bound Game class.
 */
export function selectNextPieceType(pendingRewardPiece: boolean, pieceSpawnCount: number, powerUpReady: boolean): NextPieceSelection {
  if (pendingRewardPiece) {
    return { type: REWARD_PIECE_TYPE, pendingRewardPiece: false, pieceSpawnCount, powerUpConsumed: false };
  }
  if (powerUpReady) {
    const type = POWER_UP_TYPE_BY_KIND[randomPowerUpKind()];
    return { type, pendingRewardPiece: false, pieceSpawnCount, powerUpConsumed: true };
  }
  const nextCount = pieceSpawnCount + 1;
  if (nextCount % CHALLENGE_PIECE_INTERVAL === 0) {
    return { type: CHALLENGE_PIECE_TYPE, pendingRewardPiece: false, pieceSpawnCount: nextCount, powerUpConsumed: false };
  }
  return { type: pickWeightedType(), pendingRewardPiece: false, pieceSpawnCount: nextCount, powerUpConsumed: false };
}

export function rotateCW(shape: Shape): Shape {
  const rows = shape.length, cols = shape[0].length;
  const result: Shape = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

export interface RotateResult {
  rotated: boolean;
  isTSpin: boolean;
}

/**
 * Standard 3-of-4-corner T-spin heuristic, checked against the piece's 3x3
 * bounding box (T is always 3x3, in every rotation). Only meaningful for
 * type T; callers should gate on current.type === T_PIECE_TYPE.
 */
function countOccupiedCorners(board: Board, current: Piece): number {
  const corners = [[0, 0], [2, 0], [0, 2], [2, 2]];
  let count = 0;
  for (const [dx, dy] of corners) {
    const nx = current.x + dx, ny = current.y + dy;
    if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx])) count++;
  }
  return count;
}

export function tryRotate(board: Board, current: Piece): RotateResult {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(board, rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      const isTSpin = current.type === T_PIECE_TYPE && countOccupiedCorners(board, current) >= 3;
      return { rotated: true, isTSpin };
    }
  }
  return { rotated: false, isTSpin: false };
}
