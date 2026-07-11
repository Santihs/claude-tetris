import {
  COLS, PIECES, STANDARD_TYPES, PENTOMINO_TYPES,
  REWARD_PIECE_TYPE, CHALLENGE_PIECE_TYPE, CHALLENGE_PIECE_INTERVAL, PENTOMINO_ROLL_CHANCE,
} from './constants';
import { collide } from './board';
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
  return { type, shape, x: centeredX(shape), y: 0 };
}

export function randomPiece(forcedType?: number): Piece {
  return spawnOrientation(forcedType ?? pickWeightedType());
}

export interface NextPieceSelection {
  type: number;
  pendingRewardPiece: boolean;
  pieceSpawnCount: number;
}

/**
 * Priority order for the piece that will become `next`: Tetris-reward > challenge-interval > standard/pentomino roll.
 * Pure function so the spawn-selection priority is unit-testable without the DOM/canvas-bound Game class.
 */
export function selectNextPieceType(pendingRewardPiece: boolean, pieceSpawnCount: number): NextPieceSelection {
  if (pendingRewardPiece) {
    return { type: REWARD_PIECE_TYPE, pendingRewardPiece: false, pieceSpawnCount };
  }
  const nextCount = pieceSpawnCount + 1;
  if (nextCount % CHALLENGE_PIECE_INTERVAL === 0) {
    return { type: CHALLENGE_PIECE_TYPE, pendingRewardPiece: false, pieceSpawnCount: nextCount };
  }
  return { type: pickWeightedType(), pendingRewardPiece: false, pieceSpawnCount: nextCount };
}

export function rotateCW(shape: Shape): Shape {
  const rows = shape.length, cols = shape[0].length;
  const result: Shape = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

export function tryRotate(board: Board, current: Piece): void {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(board, rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}
