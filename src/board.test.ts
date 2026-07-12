import { describe, it, expect } from 'vitest';
import { createBoard, collide, merge, clearLines } from './board';
import { COLS, ROWS } from './constants';

describe('createBoard', () => {
  it('creates an empty ROWS x COLS board', () => {
    const board = createBoard();
    expect(board.length).toBe(ROWS);
    expect(board[0].length).toBe(COLS);
    expect(board.every(row => row.every(v => v === 0))).toBe(true);
  });
});

describe('collide', () => {
  const shape = [[1]];

  it('detects left/right/bottom out-of-bounds', () => {
    const board = createBoard();
    expect(collide(board, shape, -1, 0)).toBe(true);
    expect(collide(board, shape, COLS, 0)).toBe(true);
    expect(collide(board, shape, 0, ROWS)).toBe(true);
  });

  it('does not false-positive when spawning above row 0', () => {
    const board = createBoard();
    expect(collide(board, shape, 0, -3)).toBe(false);
  });

  it('detects overlap with existing board blocks', () => {
    const board = createBoard();
    board[5][3] = 1;
    expect(collide(board, shape, 3, 5)).toBe(true);
    expect(collide(board, shape, 4, 5)).toBe(false);
  });
});

describe('merge', () => {
  it('writes only non-zero shape cells into the board', () => {
    const board = createBoard();
    merge(board, [[0, 2], [2, 0]], 1, 1);
    expect(board[1][2]).toBe(2);
    expect(board[1][1]).toBe(0);
    expect(board[2][1]).toBe(2);
    expect(board[2][2]).toBe(0);
  });
});

describe('clearLines', () => {
  it('returns cleared=0 and unchanged state when no line is full', () => {
    const board = createBoard();
    const result = clearLines(board, 0, 1);
    expect(result.cleared).toBe(0);
    expect(result.scoreDelta).toBe(0);
    expect(result.linesAfter).toBe(0);
    expect(result.levelAfter).toBe(1);
  });

  it('clears a single full line and scores 100 * level', () => {
    const board = createBoard();
    board[ROWS - 1] = new Array(COLS).fill(1);
    const result = clearLines(board, 0, 1);
    expect(result.cleared).toBe(1);
    expect(result.scoreDelta).toBe(100);
    expect(board[ROWS - 1].every(v => v === 0)).toBe(true);
  });

  it('scores a tetris (4 lines) at 800 * level', () => {
    const board = createBoard();
    for (let r = ROWS - 4; r < ROWS; r++) board[r] = new Array(COLS).fill(1);
    const result = clearLines(board, 0, 2);
    expect(result.cleared).toBe(4);
    expect(result.scoreDelta).toBe(1600);
  });

  it('levels up every 10 lines and floors dropInterval at 100', () => {
    const board = createBoard();
    board[ROWS - 1] = new Array(COLS).fill(1);
    const result = clearLines(board, 9, 1);
    expect(result.linesAfter).toBe(10);
    expect(result.levelAfter).toBe(2);

    const board2 = createBoard();
    board2[ROWS - 1] = new Array(COLS).fill(1);
    const highLevelResult = clearLines(board2, 990, 100);
    expect(highLevelResult.dropIntervalAfter).toBe(100);
  });

  it('reports isPerfectClear when clearing empties the whole board', () => {
    const board = createBoard();
    board[ROWS - 1] = new Array(COLS).fill(1);
    const result = clearLines(board, 0, 1);
    expect(result.isPerfectClear).toBe(true);
  });

  it('does not report isPerfectClear when other rows remain', () => {
    const board = createBoard();
    board[ROWS - 1] = new Array(COLS).fill(1);
    board[ROWS - 2][0] = 1;
    const result = clearLines(board, 0, 1);
    expect(result.isPerfectClear).toBe(false);
  });

  it('does not report isPerfectClear when nothing was cleared, even on an empty board', () => {
    const board = createBoard();
    const result = clearLines(board, 0, 1);
    expect(result.isPerfectClear).toBe(false);
  });
});
