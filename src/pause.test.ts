import { describe, it, expect } from 'vitest';
import { dropIntervalForLevel, clampStartLevel, MAX_START_LEVEL } from './loop';

describe('dropIntervalForLevel', () => {
  it('returns 1000ms at level 1 (base speed)', () => {
    expect(dropIntervalForLevel(1)).toBe(1000);
  });

  it('decreases by 90ms per level', () => {
    expect(dropIntervalForLevel(2)).toBe(910);
    expect(dropIntervalForLevel(3)).toBe(820);
    expect(dropIntervalForLevel(5)).toBe(640);
  });

  it('floors at 100ms and does not go below it', () => {
    // At level 11: 1000 - 10*90 = 100ms (exact floor)
    expect(dropIntervalForLevel(11)).toBe(100);
    // Levels above 11 stay at 100ms
    expect(dropIntervalForLevel(12)).toBe(100);
    expect(dropIntervalForLevel(MAX_START_LEVEL)).toBe(100);
    expect(dropIntervalForLevel(999)).toBe(100);
  });

  it('matches the board.ts clearLines formula', () => {
    // Verify our exported helper matches the inline formula used by clearLines
    for (let lvl = 1; lvl <= MAX_START_LEVEL; lvl++) {
      const expected = Math.max(100, 1000 - (lvl - 1) * 90);
      expect(dropIntervalForLevel(lvl)).toBe(expected);
    }
  });
});

describe('clampStartLevel', () => {
  it('passes through valid levels unchanged', () => {
    expect(clampStartLevel(1)).toBe(1);
    expect(clampStartLevel(5)).toBe(5);
    expect(clampStartLevel(MAX_START_LEVEL)).toBe(MAX_START_LEVEL);
  });

  it('clamps values below 1 to 1', () => {
    expect(clampStartLevel(0)).toBe(1);
    expect(clampStartLevel(-5)).toBe(1);
  });

  it('clamps values above MAX_START_LEVEL to MAX_START_LEVEL', () => {
    expect(clampStartLevel(MAX_START_LEVEL + 1)).toBe(MAX_START_LEVEL);
    expect(clampStartLevel(999)).toBe(MAX_START_LEVEL);
  });

  it('MAX_START_LEVEL is 15', () => {
    expect(MAX_START_LEVEL).toBe(15);
  });
});
