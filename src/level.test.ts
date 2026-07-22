import { describe, it, expect } from 'vitest';
import { clampLevel, dropIntervalForLevel, MIN_LEVEL, MAX_LEVEL } from './level';

describe('clampLevel', () => {
  it('passes through values already in range', () => {
    expect(clampLevel(5)).toBe(5);
  });

  it('clamps below MIN_LEVEL up to MIN_LEVEL', () => {
    expect(clampLevel(0)).toBe(MIN_LEVEL);
    expect(clampLevel(-3)).toBe(MIN_LEVEL);
  });

  it('clamps above MAX_LEVEL down to MAX_LEVEL', () => {
    expect(clampLevel(16)).toBe(MAX_LEVEL);
    expect(clampLevel(999)).toBe(MAX_LEVEL);
  });

  it('rounds fractional input', () => {
    expect(clampLevel(3.6)).toBe(4);
    expect(clampLevel(3.4)).toBe(3);
  });

  it('falls back to MIN_LEVEL for non-finite input', () => {
    expect(clampLevel(NaN)).toBe(MIN_LEVEL);
    expect(clampLevel(Infinity)).toBe(MIN_LEVEL);
  });
});

describe('dropIntervalForLevel', () => {
  it('is 1000ms at level 1', () => {
    expect(dropIntervalForLevel(1)).toBe(1000);
  });

  it('decreases by 90ms per level', () => {
    expect(dropIntervalForLevel(2)).toBe(910);
    expect(dropIntervalForLevel(5)).toBe(640);
  });

  it('floors at 100ms for high levels', () => {
    expect(dropIntervalForLevel(15)).toBe(100);
    expect(dropIntervalForLevel(100)).toBe(100);
  });
});
