import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getScores, insertScore, isTopFive, resetScores, type ScoreEntry } from './scores';

// ---------------------------------------------------------------------------
// Minimal localStorage mock (node environment has none)
// ---------------------------------------------------------------------------
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
};
vi.stubGlobal('localStorage', localStorageMock);
// ---------------------------------------------------------------------------

function makeEntry(name: string, score: number, lines = 0, bestCombo = 0): ScoreEntry {
  return { name, score, lines, bestCombo, date: '2026-01-01' };
}

beforeEach(() => {
  localStorageMock.clear();
});

describe('getScores', () => {
  it('returns empty array when nothing is stored', () => {
    expect(getScores()).toEqual([]);
  });
});

describe('insertScore', () => {
  it('inserts and returns rank 0 for the first entry', () => {
    const { scores, rank } = insertScore(makeEntry('Alice', 1000));
    expect(scores).toHaveLength(1);
    expect(rank).toBe(0);
  });

  it('keeps entries sorted by score descending', () => {
    insertScore(makeEntry('Bob', 500));
    insertScore(makeEntry('Alice', 1000));
    insertScore(makeEntry('Carol', 750));
    const scores = getScores();
    expect(scores[0].score).toBe(1000);
    expect(scores[1].score).toBe(750);
    expect(scores[2].score).toBe(500);
  });

  it('caps the list at 5 entries', () => {
    for (let i = 1; i <= 7; i++) {
      insertScore(makeEntry(`P${i}`, i * 100));
    }
    expect(getScores()).toHaveLength(5);
  });

  it('keeps only the top 5 scores, dropping the lowest', () => {
    for (let i = 1; i <= 7; i++) {
      insertScore(makeEntry(`P${i}`, i * 100));
    }
    const scores = getScores();
    // Top 5 from [700,600,500,400,300,200,100] => [700,600,500,400,300]
    expect(Math.min(...scores.map(e => e.score))).toBe(300);
  });

  it('returns null rank when entry does not make top 5', () => {
    for (let i = 1; i <= 5; i++) {
      insertScore(makeEntry(`P${i}`, i * 1000));
    }
    const { rank } = insertScore(makeEntry('Low', 50));
    expect(rank).toBeNull();
  });

  it('returns correct rank when entry inserts mid-list', () => {
    insertScore(makeEntry('A', 3000));
    insertScore(makeEntry('B', 1000));
    const { rank } = insertScore(makeEntry('C', 2000));
    // Resulting order: [3000, 2000, 1000] => C is at index 1
    expect(rank).toBe(1);
  });

  it('persists entries so a subsequent getScores reflects the insert', () => {
    insertScore(makeEntry('Alice', 500));
    const stored = getScores();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Alice');
    expect(stored[0].score).toBe(500);
  });
});

describe('isTopFive', () => {
  it('returns true when fewer than 5 scores are stored', () => {
    expect(isTopFive(0)).toBe(true);
    insertScore(makeEntry('A', 500));
    expect(isTopFive(1)).toBe(true);
  });

  it('returns true when score beats the lowest of 5', () => {
    for (let i = 1; i <= 5; i++) {
      insertScore(makeEntry(`P${i}`, i * 100));
    }
    // stored top-5: [500, 400, 300, 200, 100] => lowest is 100
    expect(isTopFive(101)).toBe(true);
    expect(isTopFive(100)).toBe(false); // tie does not qualify
    expect(isTopFive(50)).toBe(false);
  });
});

describe('resetScores', () => {
  it('clears all stored scores', () => {
    insertScore(makeEntry('A', 999));
    resetScores();
    expect(getScores()).toEqual([]);
  });
});
