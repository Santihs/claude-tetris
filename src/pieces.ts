import { COLS, PIECES } from './constants';
import { collide } from './board';
import type { Board, Piece, Shape } from './types';

export function centeredX(shape: Shape): number {
  return Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
}

export function randomPiece(): Piece {
  const type = Math.floor(Math.random() * 7) + 1;
  const shape = (PIECES[type] as Shape).map(row => [...row]);
  return { type, shape, x: centeredX(shape), y: 0 };
}

export function spawnOrientation(type: number): Piece {
  const shape = (PIECES[type] as Shape).map(row => [...row]);
  return { type, shape, x: centeredX(shape), y: 0 };
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
