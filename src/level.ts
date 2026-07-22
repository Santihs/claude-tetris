export const MIN_LEVEL = 1;
export const MAX_LEVEL = 15;

/**
 * Clamps a requested starting level into the supported [MIN_LEVEL, MAX_LEVEL]
 * range, rounding to the nearest integer and falling back to MIN_LEVEL for
 * non-finite input (e.g. an empty/NaN level-select input).
 */
export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return MIN_LEVEL;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level)));
}

/**
 * Same gravity curve `clearLines()` applies when the player levels up
 * mid-game, exposed standalone so a chosen starting level (pause-menu level
 * selector) can seed `dropInterval` before any lines have been cleared.
 */
export function dropIntervalForLevel(level: number): number {
  return Math.max(100, 1000 - (level - 1) * 90);
}
