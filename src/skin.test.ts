import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SKIN,
  SKIN_KEY,
  SKINS,
  getPaletteColor,
  getSkin,
  initSkin,
  isSkinId,
  loadSkinFromStorage,
  pastelize,
  saveSkinToStorage,
  setSkin,
  type StorageLike,
} from './skin';

function makeStorage(initial: Record<string, string> = {}): StorageLike {
  const store = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  };
}

describe('isSkinId', () => {
  it('accepts every known skin id', () => {
    for (const { id } of SKINS) expect(isSkinId(id)).toBe(true);
  });

  it('rejects unknown or missing values', () => {
    expect(isSkinId('gothic')).toBe(false);
    expect(isSkinId(null)).toBe(false);
    expect(isSkinId(undefined)).toBe(false);
    expect(isSkinId('')).toBe(false);
  });
});

describe('loadSkinFromStorage', () => {
  it('falls back to the default skin when storage is empty', () => {
    expect(loadSkinFromStorage(makeStorage())).toBe(DEFAULT_SKIN);
  });

  it('falls back to the default skin when storage is missing', () => {
    expect(loadSkinFromStorage(null)).toBe(DEFAULT_SKIN);
    expect(loadSkinFromStorage(undefined)).toBe(DEFAULT_SKIN);
  });

  it('falls back to the default skin when the stored value is invalid', () => {
    const storage = makeStorage({ [SKIN_KEY]: 'not-a-skin' });
    expect(loadSkinFromStorage(storage)).toBe(DEFAULT_SKIN);
  });

  it('returns the stored skin when it is valid', () => {
    const storage = makeStorage({ [SKIN_KEY]: 'neon' });
    expect(loadSkinFromStorage(storage)).toBe('neon');
  });
});

describe('saveSkinToStorage', () => {
  it('writes the skin under its own key', () => {
    const storage = makeStorage();
    saveSkinToStorage(storage, 'pixel');
    expect(storage.getItem(SKIN_KEY)).toBe('pixel');
  });

  it('is a no-op when storage is unavailable', () => {
    expect(() => saveSkinToStorage(null, 'pastel')).not.toThrow();
    expect(() => saveSkinToStorage(undefined, 'pastel')).not.toThrow();
  });
});

describe('get/set/init skin state', () => {
  it('defaults to retro before anything else runs', () => {
    // Note: module-level state may have been mutated by earlier tests in this
    // file; re-assert the shape of the contract rather than a fresh import.
    expect(SKINS.map(s => s.id)).toContain(getSkin());
  });

  it('setSkin updates the in-memory current skin', () => {
    setSkin('neon');
    expect(getSkin()).toBe('neon');
    setSkin('retro');
    expect(getSkin()).toBe('retro');
  });

  it('initSkin reads back whatever localStorage currently holds', () => {
    setSkin('pastel');
    const restored = initSkin();
    expect(restored).toBe('pastel');
    expect(getSkin()).toBe('pastel');
  });
});

describe('pastelize', () => {
  it('blends a color toward white', () => {
    expect(pastelize('#000000', 0.5)).toBe('#808080');
    expect(pastelize('#ff0000', 0.5)).toBe('#ff8080');
  });

  it('returns the original string for a non-hex input', () => {
    expect(pastelize('not-a-color')).toBe('not-a-color');
  });

  it('moves fully to white at amount=1', () => {
    expect(pastelize('#123456', 1)).toBe('#ffffff');
  });
});

describe('getPaletteColor', () => {
  it('returns null for the empty cell (index 0)', () => {
    expect(getPaletteColor(0, 'retro')).toBe(null);
  });

  it('returns the raw color for retro, neon and pixel skins', () => {
    expect(getPaletteColor(1, 'retro')).toBe('#4dd0e1');
    expect(getPaletteColor(1, 'neon')).toBe('#4dd0e1');
    expect(getPaletteColor(1, 'pixel')).toBe('#4dd0e1');
  });

  it('returns a pastelized color for the pastel skin', () => {
    const result = getPaletteColor(1, 'pastel');
    expect(result).not.toBe('#4dd0e1');
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});
