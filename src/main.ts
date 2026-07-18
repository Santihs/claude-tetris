import './style.css';
import { Game, type GameRefs } from './loop';
import { bindInput } from './input';
import { initTheme, toggleTheme } from './theme';
import { insertScore, resetScores, renderScoresTable } from './scores';
import type { ObjectiveId } from './challenge';

const canvas = document.getElementById('board') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
const nextCtx = nextCanvas.getContext('2d')!;
const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;
const holdCtx = holdCanvas.getContext('2d')!;
const holdSection = document.getElementById('hold-section')!;
const powerUpProgressEl = document.getElementById('powerup-progress')!;
const comboCalloutEl = document.getElementById('combo-callout')!;
const skillBarFillEl = document.getElementById('skill-bar-fill')!;
const skillOverlay = document.getElementById('skill-overlay')!;
const queuePreviewCanvas = document.getElementById('queue-preview-canvas') as HTMLCanvasElement;
const queuePreviewCtx = queuePreviewCanvas.getContext('2d')!;
const queuePreviewSection = document.getElementById('queue-preview-section')!;
const objectiveSection = document.getElementById('objective-section')!;
const objectiveLabelEl = document.getElementById('objective-label')!;
const objectiveValueEl = document.getElementById('objective-value')!;
const modeSelect = document.getElementById('mode-select')!;
const scoreEl = document.getElementById('score')!;
const linesEl = document.getElementById('lines')!;
const levelEl = document.getElementById('level')!;
const overlay = document.getElementById('overlay')!;
const overlayTitle = document.getElementById('overlay-title')!;
const overlayScore = document.getElementById('overlay-score')!;
const restartBtn = document.getElementById('restart-btn')!;
const overlayNameSection = document.getElementById('overlay-name-section')!;
const overlayNameInput = document.getElementById('overlay-name-input') as HTMLInputElement;
const overlaySaveBtn = document.getElementById('overlay-save-btn')!;
const overlayHighScores = document.getElementById('overlay-high-scores')!;
const modeSelectHighScores = document.getElementById('mode-select-high-scores')!;
const scoresResetBtn = document.getElementById('scores-reset-btn')!;
const themeToggleBtn = document.getElementById('theme-toggle')!;
const themeIcon = document.getElementById('theme-icon')!;

const refs: GameRefs = {
  canvas, ctx, nextCanvas, nextCtx,
  holdCanvas, holdCtx, holdSection, powerUpProgressEl, comboCalloutEl,
  skillBarFillEl, skillOverlay, queuePreviewCanvas, queuePreviewCtx, queuePreviewSection,
  objectiveSection, objectiveLabelEl, objectiveValueEl, modeSelect,
  scoreEl, linesEl, levelEl,
  overlay, overlayTitle, overlayScore,
  overlayNameSection, overlayNameInput, overlayHighScores, modeSelectHighScores,
};

const game = new Game(refs);

restartBtn.addEventListener('click', () => game.restart());

overlaySaveBtn.addEventListener('click', () => {
  const name = overlayNameInput.value.trim() || 'Jugador';
  const { rank } = insertScore({
    name,
    score: game.score,
    lines: game.lines,
    bestCombo: game.peakCombo,
    date: new Date().toLocaleDateString('es'),
  });
  overlayNameSection.classList.add('hidden');
  renderScoresTable(overlayHighScores, rank ?? undefined);
  renderScoresTable(modeSelectHighScores);
});

// Allow submitting the name with Enter key
overlayNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') overlaySaveBtn.click();
});

scoresResetBtn.addEventListener('click', () => {
  resetScores();
  renderScoresTable(modeSelectHighScores);
});

bindInput(game);

for (const btn of modeSelect.querySelectorAll<HTMLButtonElement>('.mode-btn')) {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode!;
    if (mode === 'endless') {
      game.init('endless');
    } else {
      game.init('challenge', mode as ObjectiveId);
    }
  });
}

themeToggleBtn.addEventListener('click', () => {
  toggleTheme({ themeToggleBtn, themeIcon }, gridLineColor => {
    game.gridLineColor = gridLineColor;
    if (game.board) game.draw();
  });
});

initTheme({ themeToggleBtn, themeIcon }, gridLineColor => {
  game.gridLineColor = gridLineColor;
  if (game.board) game.draw();
});

// Render stored scores on the start screen immediately
renderScoresTable(modeSelectHighScores);
