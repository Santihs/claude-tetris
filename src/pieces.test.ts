import { describe, it, expect } from 'vitest';
import { rotateCW, tryRotate, randomPiece, selectNextPieceType } from './pieces';
import { createBoard, collide } from './board';
import { STANDARD_TYPES, PENTOMINO_TYPES, REWARD_PIECE_TYPE, CHALLENGE_PIECE_TYPE, CHALLENGE_PIECE_INTERVAL } from './constants';
import type { Piece } from './types';

describe('rotateCW', () => {
  it('rotates the O piece into itself', () => {
    const shape = [[2, 2], [2, 2]];
    expect(rotateCW(shape)).toEqual([[2, 2], [2, 2]]);
  });

  it('rotates the T piece 90deg clockwise', () => {
    const shape = [[0, 3, 0], [3, 3, 3], [0, 0, 0]];
    expect(rotateCW(shape)).toEqual([[0, 3, 0], [0, 3, 3], [0, 3, 0]]);
  });

  it('handles non-square shapes (e.g. a 2x4 pentomino)', () => {
    const shape = [[8, 0], [8, 8], [0, 8], [0, 8]];
    const rotated = rotateCW(shape);
    expect(rotated.length).toBe(2);
    expect(rotated[0].length).toBe(4);
  });
});

describe('tryRotate', () => {
  it('rotates in place when there is room', () => {
    const board = createBoard();
    const current: Piece = { type: 3, shape: [[0, 3, 0], [3, 3, 3], [0, 0, 0]], x: 4, y: 4 };
    tryRotate(board, current);
    expect(current.shape).toEqual([[0, 3, 0], [0, 3, 3], [0, 3, 0]]);
    expect(current.x).toBe(4);
  });

  it('applies a wall kick when rotation collides against the right wall', () => {
    const board = createBoard();
    const current: Piece = { type: 1, shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], x: 8, y: 4 };
    tryRotate(board, current);
    expect(current.x).not.toBe(8);
  });

  it('no-ops when no kick offset fits', () => {
    const board = createBoard();
    for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++) board[r][c] = 9;
    const current: Piece = { type: 3, shape: [[0, 3, 0], [3, 3, 3], [0, 0, 0]], x: 4, y: 0 };
    const before = JSON.stringify(current.shape);
    tryRotate(board, current);
    expect(JSON.stringify(current.shape)).toBe(before);
  });

  it('never collides on spawn for every piece type, standard and special', () => {
    const board = createBoard();
    for (const type of [...STANDARD_TYPES, ...PENTOMINO_TYPES, REWARD_PIECE_TYPE, CHALLENGE_PIECE_TYPE]) {
      const piece = randomPiece(type);
      expect(collide(board, piece.shape, piece.x, piece.y)).toBe(false);
    }
  });
});

describe('selectNextPieceType', () => {
  it('prioritizes the Tetris-reward piece over anything else', () => {
    const result = selectNextPieceType(true, 0);
    expect(result.type).toBe(REWARD_PIECE_TYPE);
    expect(result.pendingRewardPiece).toBe(false);
  });

  it('spawns the challenge piece every CHALLENGE_PIECE_INTERVAL pieces', () => {
    const result = selectNextPieceType(false, CHALLENGE_PIECE_INTERVAL - 1);
    expect(result.type).toBe(CHALLENGE_PIECE_TYPE);
    expect(result.pieceSpawnCount).toBe(CHALLENGE_PIECE_INTERVAL);
  });

  it('otherwise rolls a standard or pentomino type', () => {
    const result = selectNextPieceType(false, 1);
    expect([...STANDARD_TYPES, ...PENTOMINO_TYPES]).toContain(result.type);
  });

  it('never rolls both reward and challenge on the same call', () => {
    const result = selectNextPieceType(true, CHALLENGE_PIECE_INTERVAL - 1);
    expect(result.type).toBe(REWARD_PIECE_TYPE);
  });
});
