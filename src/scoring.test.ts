import { describe, it, expect } from 'vitest';
import { hardDropPoints, SOFT_DROP_POINTS } from './scoring';

describe('hardDropPoints', () => {
  it('awards 2 points per row dropped', () => {
    expect(hardDropPoints(0)).toBe(0);
    expect(hardDropPoints(5)).toBe(10);
  });
});

describe('SOFT_DROP_POINTS', () => {
  it('is 1 point per row', () => {
    expect(SOFT_DROP_POINTS).toBe(1);
  });
});
