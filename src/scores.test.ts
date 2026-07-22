import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sortHighScores, loadHighScores, saveHighScores, qualifiesForHighScore,
  addHighScore, resetHighScores, MAX_HIGH_SCORES, type HighScoreEntry,
} from './scores';

function entry(score: number, name = 'AAA', overrides: Partial<HighScoreEntry> = {}): HighScoreEntry {
  return { name, score, lines: 0, maxCombo: 0, date: '2026-01-01T00:00:00.000Z', ...overrides };
}

function makeMemoryStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeMemoryStorage());
});

describe('sortHighScores', () => {
  it('sorts by score descending without mutating the input', () => {
    const input = [entry(100), entry(300), entry(200)];
    const sorted = sortHighScores(input);
    expect(sorted.map(e => e.score)).toEqual([300, 200, 100]);
    expect(input.map(e => e.score)).toEqual([100, 300, 200]);
  });
});

describe('loadHighScores / saveHighScores', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(loadHighScores()).toEqual([]);
  });

  it('round-trips saved entries, sorted by score', () => {
    saveHighScores([entry(100), entry(300), entry(200)]);
    expect(loadHighScores().map(e => e.score)).toEqual([300, 200, 100]);
  });

  it('caps to MAX_HIGH_SCORES on save', () => {
    const many = Array.from({ length: 8 }, (_, i) => entry(i * 10));
    saveHighScores(many);
    expect(loadHighScores()).toHaveLength(MAX_HIGH_SCORES);
    expect(loadHighScores()[0].score).toBe(70);
  });

  it('recovers gracefully from corrupt JSON', () => {
    localStorage.setItem('tetris-high-scores', '{not json');
    expect(loadHighScores()).toEqual([]);
  });

  it('recovers gracefully from a non-array payload', () => {
    localStorage.setItem('tetris-high-scores', JSON.stringify({ oops: true }));
    expect(loadHighScores()).toEqual([]);
  });
});

describe('qualifiesForHighScore', () => {
  it('qualifies any score when the table has open slots', () => {
    expect(qualifiesForHighScore(1, [])).toBe(true);
    expect(qualifiesForHighScore(0, [entry(500)])).toBe(true);
  });

  it('qualifies a score that beats the current lowest of a full table', () => {
    const full = [entry(500), entry(400), entry(300), entry(200), entry(100)];
    expect(qualifiesForHighScore(150, full)).toBe(true);
  });

  it('does not qualify a score tying the current lowest of a full table', () => {
    const full = [entry(500), entry(400), entry(300), entry(200), entry(100)];
    expect(qualifiesForHighScore(100, full)).toBe(false);
  });

  it('does not qualify a score below the current lowest of a full table', () => {
    const full = [entry(500), entry(400), entry(300), entry(200), entry(100)];
    expect(qualifiesForHighScore(50, full)).toBe(false);
  });

  it('defaults to reading the persisted table when none is passed', () => {
    saveHighScores([entry(500), entry(400), entry(300), entry(200), entry(100)]);
    expect(qualifiesForHighScore(600)).toBe(true);
    expect(qualifiesForHighScore(10)).toBe(false);
  });
});

describe('addHighScore', () => {
  it('inserts a new entry and persists the sorted, capped result', () => {
    const initial = [entry(500), entry(400), entry(300)];
    const newEntry = entry(450, 'BOB');
    const updated = addHighScore(newEntry, initial);
    expect(updated.map(e => e.score)).toEqual([500, 450, 400, 300]);
    expect(loadHighScores().map(e => e.score)).toEqual([500, 450, 400, 300]);
  });

  it('evicts the lowest entry when the table is already full', () => {
    const full = [entry(500), entry(400), entry(300), entry(200), entry(100)];
    const newEntry = entry(350, 'BOB');
    const updated = addHighScore(newEntry, full);
    expect(updated).toHaveLength(MAX_HIGH_SCORES);
    expect(updated.map(e => e.score)).toEqual([500, 400, 350, 300, 200]);
    expect(updated.some(e => e.score === 100)).toBe(false);
  });

  it('drops the new entry itself when it does not beat a full table', () => {
    const full = [entry(500), entry(400), entry(300), entry(200), entry(100)];
    const newEntry = entry(10, 'BOB');
    const updated = addHighScore(newEntry, full);
    expect(updated).toHaveLength(MAX_HIGH_SCORES);
    expect(updated.includes(newEntry)).toBe(false);
  });

  it('lets the caller locate the inserted entry via reference identity', () => {
    const initial = [entry(500), entry(300)];
    const newEntry = entry(400, 'BOB');
    const updated = addHighScore(newEntry, initial);
    expect(updated.indexOf(newEntry)).toBe(1);
  });
});

describe('resetHighScores', () => {
  it('clears the persisted table', () => {
    saveHighScores([entry(500), entry(400)]);
    expect(loadHighScores()).toHaveLength(2);
    resetHighScores();
    expect(loadHighScores()).toEqual([]);
  });
});
