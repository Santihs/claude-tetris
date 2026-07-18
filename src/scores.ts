const SCORES_KEY = 'tetris-high-scores';

export interface ScoreEntry {
  name: string;
  score: number;
  lines: number;
  bestCombo: number;
  date: string;
}

export function getScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScoreEntry[];
  } catch {
    return [];
  }
}

/**
 * Insert a new entry, persist the top-5 sorted by score descending.
 * Returns the resulting top-5 list and the 0-based rank of the inserted
 * entry (null if it did not make the top 5).
 */
export function insertScore(entry: ScoreEntry): { scores: ScoreEntry[]; rank: number | null } {
  const scores = getScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const top5 = scores.slice(0, 5);
  const rank = top5.indexOf(entry);
  localStorage.setItem(SCORES_KEY, JSON.stringify(top5));
  return { scores: top5, rank: rank >= 0 ? rank : null };
}

/** True when the given score would enter the stored top 5. */
export function isTopFive(score: number): boolean {
  const scores = getScores();
  if (scores.length < 5) return true;
  return score > scores[scores.length - 1].score;
}

export function resetScores(): void {
  localStorage.removeItem(SCORES_KEY);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Populate `container` with a top-5 scores table.
 * `highlightRank` (0-based) optionally highlights that row.
 */
export function renderScoresTable(container: HTMLElement, highlightRank?: number): void {
  const scores = getScores();
  if (scores.length === 0) {
    container.innerHTML = '<p class="scores-empty">Sin récords aún.</p>';
    return;
  }
  const rows = scores
    .map((entry, i) => {
      const cls = i === highlightRank ? ' class="score-highlight"' : '';
      return `<tr${cls}>
        <td>${i + 1}</td>
        <td>${escapeHtml(entry.name)}</td>
        <td>${entry.score.toLocaleString()}</td>
        <td>${entry.lines}</td>
        <td>${entry.bestCombo > 0 ? `x${entry.bestCombo}` : '—'}</td>
        <td>${entry.date}</td>
      </tr>`;
    })
    .join('');
  container.innerHTML = `
    <table class="scores-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Pts</th>
          <th>Líneas</th>
          <th>Combo</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
