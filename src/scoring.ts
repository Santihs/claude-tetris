export function hardDropPoints(rowsDropped: number): number {
  return rowsDropped * 2;
}

export const SOFT_DROP_POINTS = 1;

const COMBO_POINTS_PER_STEP = 50;
const TSPIN_LINE_SCORES = [0, 800, 1200, 1600];
const B2B_TETRIS_BONUS = 400;
const PERFECT_CLEAR_BONUS = 2000;

/** comboCount is the number of consecutive locks (including this one) that cleared >=1 line. */
export function calculateComboBonus(comboCount: number, level: number): number {
  return comboCount > 1 ? COMBO_POINTS_PER_STEP * (comboCount - 1) * level : 0;
}

/** Only awarded when the T-spin also clears at least one line (T-spin-no-lines is out of scope). */
export function calculateTSpinBonus(linesCleared: number, level: number): number {
  if (linesCleared <= 0) return 0;
  const table = TSPIN_LINE_SCORES[linesCleared] ?? TSPIN_LINE_SCORES[TSPIN_LINE_SCORES.length - 1];
  return table * level;
}

export function calculateB2BBonus(isBackToBack: boolean, level: number): number {
  return isBackToBack ? B2B_TETRIS_BONUS * level : 0;
}

export function calculatePerfectClearBonus(level: number): number {
  return PERFECT_CLEAR_BONUS * level;
}
