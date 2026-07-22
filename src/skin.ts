import { COLORS } from './constants';

/**
 * Visual skins for piece/block rendering — a separate concept from the
 * light/dark mode in `theme.ts`. Skins never touch `document.body.dataset`
 * or the light/dark storage key; they only affect how blocks are painted
 * onto the canvas in `render.ts`.
 */
export type SkinId = 'retro' | 'neon' | 'pastel' | 'pixel';

export const SKIN_KEY = 'tetris-skin';
export const DEFAULT_SKIN: SkinId = 'retro';

export const SKINS: { id: SkinId; label: string }[] = [
  { id: 'retro', label: 'Retro' },
  { id: 'neon', label: 'Neon' },
  { id: 'pastel', label: 'Pastel' },
  { id: 'pixel', label: 'Pixel art' },
];

export function isSkinId(value: string | null | undefined): value is SkinId {
  return value === 'retro' || value === 'neon' || value === 'pastel' || value === 'pixel';
}

/** Minimal shape of the `Storage` interface, kept small so it's trivial to mock in tests. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadSkinFromStorage(storage: StorageLike | null | undefined): SkinId {
  const saved = storage?.getItem(SKIN_KEY) ?? null;
  return isSkinId(saved) ? saved : DEFAULT_SKIN;
}

export function saveSkinToStorage(storage: StorageLike | null | undefined, skin: SkinId): void {
  storage?.setItem(SKIN_KEY, skin);
}

/** In-memory fallback used only when `localStorage` isn't available (e.g. non-browser test runners). */
const memoryStorage: StorageLike = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: key => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = value;
    },
  };
})();

function safeLocalStorage(): StorageLike {
  return typeof localStorage !== 'undefined' ? localStorage : memoryStorage;
}

let currentSkin: SkinId = DEFAULT_SKIN;

/** Reads the current in-memory skin (defaults to 'retro' until `initSkin`/`setSkin` runs). */
export function getSkin(): SkinId {
  return currentSkin;
}

/** Sets the in-memory skin and persists it, independent of the light/dark theme key. */
export function setSkin(skin: SkinId): void {
  currentSkin = skin;
  saveSkinToStorage(safeLocalStorage(), skin);
}

/** Restores the persisted skin on load (falls back to the default when nothing/invalid is stored). */
export function initSkin(): SkinId {
  currentSkin = loadSkinFromStorage(safeLocalStorage());
  return currentSkin;
}

/** Blends a `#rrggbb` color toward white by `amount` (0..1) — used for the pastel skin. */
export function pastelize(hex: string, amount = 0.45): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return hex;
  const num = parseInt(match[1], 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

/** Resolves the fill color to paint for a given board color index, adjusted per skin. */
export function getPaletteColor(colorIndex: number, skin: SkinId): string | null {
  const base = COLORS[colorIndex];
  if (!base) return null;
  if (skin === 'pastel') return pastelize(base);
  return base;
}
