const HIGH_SCORES_KEY = 'tetris-high-scores';
export const MAX_HIGH_SCORES = 5;

export interface HighScoreEntry {
  name: string;
  score: number;
  lines: number;
  maxCombo: number;
  date: string;
}

/** Returns a new array sorted by score descending (does not mutate the input). */
export function sortHighScores(entries: HighScoreEntry[]): HighScoreEntry[] {
  return [...entries].sort((a, b) => b.score - a.score);
}

/** Reads the top scores from localStorage, defensively handling missing/corrupt data. */
export function loadHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortHighScores(parsed as HighScoreEntry[]).slice(0, MAX_HIGH_SCORES);
  } catch {
    return [];
  }
}

/** Persists the given entries, sorted and capped to the top MAX_HIGH_SCORES. */
export function saveHighScores(entries: HighScoreEntry[]): void {
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(sortHighScores(entries).slice(0, MAX_HIGH_SCORES)));
}

/**
 * A score qualifies for the table when there's still an open slot, or when it
 * beats the current lowest of a full top-5. Ties with the current lowest do
 * not qualify (they'd just evict an equally-deserving entry).
 */
export function qualifiesForHighScore(score: number, entries: HighScoreEntry[] = loadHighScores()): boolean {
  if (entries.length < MAX_HIGH_SCORES) return true;
  const sorted = sortHighScores(entries);
  const lowest = sorted[sorted.length - 1].score;
  return score > lowest;
}

/**
 * Inserts a new entry, re-sorts, caps to the top MAX_HIGH_SCORES, and persists
 * the result. Returns the updated (capped) list - use `updated.indexOf(entry)`
 * to find where (or whether) the entry landed, since the same object
 * reference is preserved through the sort/slice.
 */
export function addHighScore(entry: HighScoreEntry, entries: HighScoreEntry[] = loadHighScores()): HighScoreEntry[] {
  const updated = sortHighScores([...entries, entry]).slice(0, MAX_HIGH_SCORES);
  saveHighScores(updated);
  return updated;
}

/** Clears the high-score table. */
export function resetHighScores(): void {
  localStorage.removeItem(HIGH_SCORES_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Renders the top-5 table body, optionally highlighting the entry at `highlightIndex`. */
export function renderHighScores(tableBody: HTMLElement, entries: HighScoreEntry[], highlightIndex = -1): void {
  tableBody.innerHTML = '';
  if (entries.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'high-scores-empty';
    td.textContent = 'Sin puntuaciones aún';
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }
  entries.forEach((entry, i) => {
    const tr = document.createElement('tr');
    if (i === highlightIndex) tr.classList.add('high-score-new');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(entry.name)}</td>
      <td>${entry.score.toLocaleString()}</td>
      <td>${entry.lines}</td>
      <td>${entry.maxCombo}</td>
    `;
    tableBody.appendChild(tr);
  });
}
