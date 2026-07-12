import { describe, it, expect } from 'vitest';
import { applyPowerUpEffect } from './powerups';
import { createBoard } from './board';
import { COLS, ROWS, FREEZE_DURATION_MS } from './constants';

function fillBoard(board: number[][], color = 1): void {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) board[r][c] = color;
}

describe('applyPowerUpEffect', () => {
  it('bomb clears a 3x3 area centered on the lock position, clamped to bounds', () => {
    const board = createBoard();
    fillBoard(board);
    applyPowerUpEffect(board, 'bomb', 5, 5, 0);
    for (let r = 4; r <= 6; r++) for (let c = 4; c <= 6; c++) expect(board[r][c]).toBe(0);
    expect(board[3][5]).toBe(1); // just outside the blast radius
  });

  it('bomb clamps at board edges without throwing', () => {
    const board = createBoard();
    fillBoard(board);
    expect(() => applyPowerUpEffect(board, 'bomb', 0, 0, 0)).not.toThrow();
    expect(board[0][0]).toBe(0);
  });

  it('lightning clears the full row the piece locked into', () => {
    const board = createBoard();
    fillBoard(board);
    applyPowerUpEffect(board, 'lightning', 3, 7, 0);
    expect(board[7].every(v => v === 0)).toBe(true);
    expect(board[8].every(v => v === 1)).toBe(true);
  });

  it('gravity compacts each column downward, closing gaps', () => {
    const board = createBoard();
    board[0][2] = 5;
    board[10][2] = 5;
    applyPowerUpEffect(board, 'gravity', 0, 0, 0);
    expect(board[ROWS - 1][2]).toBe(5);
    expect(board[ROWS - 2][2]).toBe(5);
    expect(board[0][2]).toBe(0);
  });

  it('dye removes every cell of one existing color from the board', () => {
    const board = createBoard();
    board[5][0] = 3;
    board[6][1] = 3;
    board[7][2] = 4;
    applyPowerUpEffect(board, 'dye', 0, 0, 0);
    const remainingColors = new Set(board.flat().filter(v => v !== 0));
    expect(remainingColors.size).toBeLessThanOrEqual(1);
  });

  it('dye is a no-op on an empty board', () => {
    const board = createBoard();
    expect(() => applyPowerUpEffect(board, 'dye', 0, 0, 0)).not.toThrow();
    expect(board.every(row => row.every(v => v === 0))).toBe(true);
  });

  it('freeze does not mutate the board and returns a freezeUntil timestamp', () => {
    const board = createBoard();
    fillBoard(board);
    const before = JSON.stringify(board);
    const result = applyPowerUpEffect(board, 'freeze', 0, 0, 1000);
    expect(JSON.stringify(board)).toBe(before);
    expect(result.freezeUntil).toBe(1000 + FREEZE_DURATION_MS);
  });
});
