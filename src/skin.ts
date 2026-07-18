export type SkinName = 'retro' | 'neon' | 'pastel' | 'pixel-art';

export const SKIN_KEY = 'tetris-skin';

/**
 * Colour palettes keyed by skin name.
 * Each array mirrors COLORS in constants.ts: index 0 = null, indices 1-18 = block colours.
 */
export const PALETTES: Record<SkinName, (string | null)[]> = {
  retro: [
    null,
    '#4dd0e1', // 1 I
    '#ffd54f', // 2 O
    '#ba68c8', // 3 T
    '#81c784', // 4 S
    '#e57373', // 5 Z
    '#64b5f6', // 6 J
    '#ffb74d', // 7 L
    '#f06292', // 8 +
    '#4db6ac', // 9 U
    '#9575cd', // 10 Y
    '#ffffff', // 11 reward
    '#78909c', // 12 challenge
    '#ff5252', // 13 bomb
    '#fff176', // 14 lightning
    '#80deea', // 15 freeze
    '#a1887f', // 16 gravity
    '#ce93d8', // 17 dye
    '#546e7a', // 18 garbage
  ],
  neon: [
    null,
    '#00f0ff', // 1 I
    '#f0f000', // 2 O
    '#f000f0', // 3 T
    '#00f000', // 4 S
    '#f00000', // 5 Z
    '#0088ff', // 6 J
    '#ff8800', // 7 L
    '#ff0088', // 8 +
    '#00ffcc', // 9 U
    '#8800ff', // 10 Y
    '#ffffff', // 11 reward
    '#888888', // 12 challenge
    '#ff2200', // 13 bomb
    '#ffff00', // 14 lightning
    '#00eeff', // 15 freeze
    '#ff5500', // 16 gravity
    '#cc00ff', // 17 dye
    '#444444', // 18 garbage
  ],
  pastel: [
    null,
    '#a8e6cf', // 1 I
    '#ffd3b6', // 2 O
    '#d4a5c9', // 3 T
    '#b8e0b8', // 4 S
    '#ffb3b3', // 5 Z
    '#b3d1ff', // 6 J
    '#ffd9a8', // 7 L
    '#ffb3d9', // 8 +
    '#a8d8d0', // 9 U
    '#d0b8e8', // 10 Y
    '#f0f0f0', // 11 reward
    '#c8d4da', // 12 challenge
    '#ff9d8a', // 13 bomb
    '#fff4a3', // 14 lightning
    '#a8eef4', // 15 freeze
    '#ffc299', // 16 gravity
    '#e8aaff', // 17 dye
    '#aabbcc', // 18 garbage
  ],
  'pixel-art': [
    null,
    '#00b4cc', // 1 I
    '#ffcc00', // 2 O
    '#9900cc', // 3 T
    '#00aa00', // 4 S
    '#dd2200', // 5 Z
    '#0044ff', // 6 J
    '#ff7700', // 7 L
    '#dd0066', // 8 +
    '#00998a', // 9 U
    '#5500bb', // 10 Y
    '#ffffff', // 11 reward
    '#556677', // 12 challenge
    '#cc2200', // 13 bomb
    '#ddcc00', // 14 lightning
    '#00aadd', // 15 freeze
    '#aa4400', // 16 gravity
    '#8800cc', // 17 dye
    '#334455', // 18 garbage
  ],
};

/** Returns the colour palette for the given skin name. */
export function getPalette(skin: SkinName): (string | null)[] {
  return PALETTES[skin];
}

let _currentSkin: SkinName = 'retro';

/** Returns the currently active skin name (module-level state). */
export function getCurrentSkin(): SkinName {
  return _currentSkin;
}

/** Updates the module-level skin state — no DOM side-effects. */
export function setCurrentSkin(skin: SkinName): void {
  _currentSkin = skin;
}

export interface SkinRefs {
  skinSelect: HTMLSelectElement;
}

/**
 * Applies a skin: updates module state, persists to localStorage,
 * stamps `data-skin` on `document.body`, syncs the select value,
 * and fires `onApplied` so the caller can re-render the canvas.
 */
export function applySkin(skin: SkinName, refs: SkinRefs, onApplied: () => void): void {
  setCurrentSkin(skin);
  localStorage.setItem(SKIN_KEY, skin);
  document.body.dataset.skin = skin;
  refs.skinSelect.value = skin;
  onApplied();
}

/** Reads the saved skin from localStorage (defaulting to 'retro') and applies it. */
export function initSkin(refs: SkinRefs, onApplied: () => void): void {
  const saved = localStorage.getItem(SKIN_KEY);
  const skin: SkinName = isValidSkin(saved) ? saved : 'retro';
  applySkin(skin, refs, onApplied);
}

function isValidSkin(value: string | null): value is SkinName {
  return (
    value === 'retro' ||
    value === 'neon' ||
    value === 'pastel' ||
    value === 'pixel-art'
  );
}
