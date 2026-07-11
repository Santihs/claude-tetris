import { describe, it, expect } from 'vitest';
import {
  hardDropPoints, SOFT_DROP_POINTS,
  calculateComboBonus, calculateTSpinBonus, calculateB2BBonus, calculatePerfectClearBonus,
} from './scoring';

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

describe('calculateComboBonus', () => {
  it('is 0 for the first clear in a streak (comboCount 1)', () => {
    expect(calculateComboBonus(1, 1)).toBe(0);
  });

  it('scales with streak length and level', () => {
    expect(calculateComboBonus(2, 1)).toBe(50);
    expect(calculateComboBonus(3, 1)).toBe(100);
    expect(calculateComboBonus(2, 3)).toBe(150);
  });

  it('is 0 when the streak was just broken (comboCount 0)', () => {
    expect(calculateComboBonus(0, 5)).toBe(0);
  });
});

describe('calculateTSpinBonus', () => {
  it('is 0 when no lines were cleared (T-spin-no-lines is out of scope)', () => {
    expect(calculateTSpinBonus(0, 1)).toBe(0);
  });

  it('scores a T-spin single/double/triple at level 1', () => {
    expect(calculateTSpinBonus(1, 1)).toBe(800);
    expect(calculateTSpinBonus(2, 1)).toBe(1200);
    expect(calculateTSpinBonus(3, 1)).toBe(1600);
  });

  it('scales with level', () => {
    expect(calculateTSpinBonus(1, 2)).toBe(1600);
  });
});

describe('calculateB2BBonus', () => {
  it('is 0 when not back-to-back', () => {
    expect(calculateB2BBonus(false, 5)).toBe(0);
  });

  it('scales with level when back-to-back', () => {
    expect(calculateB2BBonus(true, 1)).toBe(400);
    expect(calculateB2BBonus(true, 2)).toBe(800);
  });
});

describe('calculatePerfectClearBonus', () => {
  it('scales with level', () => {
    expect(calculatePerfectClearBonus(1)).toBe(2000);
    expect(calculatePerfectClearBonus(3)).toBe(6000);
  });
});
