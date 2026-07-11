import { describe, it, expect } from 'vitest';
import { startObjective, updateObjective, insertGarbageRow, applyPresetBlocks } from './challenge';
import { createBoard } from './board';
import { COLS, ROWS, GARBAGE_COLOR, SPRINT_TARGET_LINES, SPRINT_TIME_LIMIT_MS } from './constants';

describe('updateObjective - sprint', () => {
  it('wins once the target line count is reached', () => {
    const objective = startObjective('sprint', 0);
    const result = updateObjective(objective, 1000, SPRINT_TARGET_LINES);
    expect(result.status).toBe('won');
  });

  it('loses once the time limit elapses without reaching the target', () => {
    const objective = startObjective('sprint', 0);
    const result = updateObjective(objective, SPRINT_TIME_LIMIT_MS + 1, SPRINT_TARGET_LINES - 1);
    expect(result.status).toBe('lost');
  });

  it('stays active before the deadline and below the target', () => {
    const objective = startObjective('sprint', 0);
    const result = updateObjective(objective, 1000, 5);
    expect(result.status).toBe('active');
  });

  it('does not flip status once already won/lost', () => {
    const objective = startObjective('sprint', 0);
    objective.status = 'won';
    const result = updateObjective(objective, SPRINT_TIME_LIMIT_MS + 1, 0);
    expect(result.status).toBe('won');
  });

  it('never reports garbageDue for a sprint objective', () => {
    const objective = startObjective('sprint', 0);
    const result = updateObjective(objective, 999999, 0);
    expect(result.garbageDue).toBe(false);
  });
});

describe('updateObjective - survival', () => {
  it('reports garbageDue once nextGarbageAt is reached, and reschedules it', () => {
    const objective = startObjective('survival', 0);
    const result = updateObjective(objective, objective.nextGarbageAt, 0);
    expect(result.garbageDue).toBe(true);
    expect(result.nextGarbageAt).toBeGreaterThan(objective.nextGarbageAt);
  });

  it('does not report garbageDue before the interval elapses', () => {
    const objective = startObjective('survival', 0);
    const result = updateObjective(objective, objective.nextGarbageAt - 1, 0);
    expect(result.garbageDue).toBe(false);
  });

  it('has no win condition - stays active indefinitely absent external game-over', () => {
    const objective = startObjective('survival', 0);
    const result = updateObjective(objective, 999999999, 0);
    expect(result.status).toBe('active');
  });
});

describe('insertGarbageRow', () => {
  it('shifts the board up and appends a row with exactly one gap', () => {
    const board = createBoard();
    board[0][0] = 1; // sentinel that should be shifted off the top
    insertGarbageRow(board);
    expect(board.length).toBe(ROWS);
    expect(board[0][0]).toBe(0); // the old top row got shifted out
    const lastRow = board[ROWS - 1];
    const filled = lastRow.filter(v => v === GARBAGE_COLOR).length;
    const empty = lastRow.filter(v => v === 0).length;
    expect(filled).toBe(COLS - 1);
    expect(empty).toBe(1);
  });
});

describe('applyPresetBlocks', () => {
  it('seeds the board with garbage-colored cells without throwing', () => {
    const board = createBoard();
    expect(() => applyPresetBlocks(board)).not.toThrow();
    const filledCount = board.flat().filter(v => v === GARBAGE_COLOR).length;
    expect(filledCount).toBeGreaterThan(0);
  });
});
