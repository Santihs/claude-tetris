import { describe, it, expect, beforeEach } from 'vitest';
import { getPalette, getCurrentSkin, setCurrentSkin, PALETTES } from './skin';
import type { SkinName } from './skin';

const ALL_SKINS: SkinName[] = ['retro', 'neon', 'pastel', 'pixel-art'];

describe('getPalette', () => {
  it('returns an array of length 19 for every skin', () => {
    for (const skin of ALL_SKINS) {
      expect(getPalette(skin)).toHaveLength(19);
    }
  });

  it('has null at index 0 for every skin', () => {
    for (const skin of ALL_SKINS) {
      expect(getPalette(skin)[0]).toBeNull();
    }
  });

  it('has non-null hex colour strings at indices 1-18 for every skin', () => {
    for (const skin of ALL_SKINS) {
      const palette = getPalette(skin);
      for (let i = 1; i <= 18; i++) {
        expect(typeof palette[i]).toBe('string');
        expect(palette[i]).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  it('retro palette preserves the original COLORS values at key indices', () => {
    const retro = getPalette('retro');
    expect(retro[1]).toBe('#4dd0e1'); // I - cyan
    expect(retro[2]).toBe('#ffd54f'); // O - yellow
    expect(retro[3]).toBe('#ba68c8'); // T - purple
    expect(retro[7]).toBe('#ffb74d'); // L - orange
    expect(retro[18]).toBe('#546e7a'); // garbage
  });

  it('neon palette differs from retro palette at standard piece indices', () => {
    const retro = getPalette('retro');
    const neon = getPalette('neon');
    for (let i = 1; i <= 7; i++) {
      expect(neon[i]).not.toBe(retro[i]);
    }
  });

  it('pastel palette differs from retro palette at standard piece indices', () => {
    const retro = getPalette('retro');
    const pastel = getPalette('pastel');
    for (let i = 1; i <= 7; i++) {
      expect(pastel[i]).not.toBe(retro[i]);
    }
  });

  it('pixel-art palette differs from retro palette at standard piece indices', () => {
    const retro = getPalette('retro');
    const pixelArt = getPalette('pixel-art');
    for (let i = 1; i <= 7; i++) {
      expect(pixelArt[i]).not.toBe(retro[i]);
    }
  });
});

describe('getCurrentSkin / setCurrentSkin', () => {
  beforeEach(() => {
    setCurrentSkin('retro');
  });

  it('starts as retro after a reset', () => {
    expect(getCurrentSkin()).toBe('retro');
  });

  it('reflects the skin that was last set', () => {
    setCurrentSkin('neon');
    expect(getCurrentSkin()).toBe('neon');

    setCurrentSkin('pastel');
    expect(getCurrentSkin()).toBe('pastel');

    setCurrentSkin('pixel-art');
    expect(getCurrentSkin()).toBe('pixel-art');
  });

  it('setting the same skin twice is idempotent', () => {
    setCurrentSkin('neon');
    setCurrentSkin('neon');
    expect(getCurrentSkin()).toBe('neon');
  });
});

describe('PALETTES object', () => {
  it('contains entries for exactly the four expected skin names', () => {
    expect(Object.keys(PALETTES).sort()).toEqual(
      ['neon', 'pastel', 'pixel-art', 'retro'],
    );
  });

  it('all four skins have palettes of equal length', () => {
    const lengths = ALL_SKINS.map(s => PALETTES[s].length);
    expect(new Set(lengths).size).toBe(1);
  });
});
