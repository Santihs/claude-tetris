import './style.css';
import { Game, type GameRefs } from './loop';
import { bindInput } from './input';
import { initTheme, toggleTheme } from './theme';
import { loadHighScores, resetHighScores, renderHighScores } from './scores';
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
const gameOverBox = document.getElementById('game-over-box')!;
const pauseMenuBox = document.getElementById('pause-menu-box')!;
const pauseResumeBtn = document.getElementById('pause-resume-btn')!;
const pauseRestartBtn = document.getElementById('pause-restart-btn')!;
const pauseControlsBtn = document.getElementById('pause-controls-btn')!;
const pauseControlsList = document.getElementById('pause-controls-list')!;
const pauseLevelInput = document.getElementById('pause-level-input') as HTMLInputElement;
const themeToggleBtn = document.getElementById('theme-toggle')!;
const themeIcon = document.getElementById('theme-icon')!;
const highScoreEntryEl = document.getElementById('high-score-entry')!;
const highScoreNameInput = document.getElementById('high-score-name-input') as HTMLInputElement;
const highScoreSaveBtn = document.getElementById('high-score-save-btn') as HTMLButtonElement;
const highScoresTableBody = document.getElementById('high-scores-table-body')!;
const highScoresResetBtn = document.getElementById('high-scores-reset-btn')!;

const refs: GameRefs = {
  canvas, ctx, nextCanvas, nextCtx,
  holdCanvas, holdCtx, holdSection, powerUpProgressEl, comboCalloutEl,
  skillBarFillEl, skillOverlay, queuePreviewCanvas, queuePreviewCtx, queuePreviewSection,
  objectiveSection, objectiveLabelEl, objectiveValueEl, modeSelect,
  scoreEl, linesEl, levelEl,
  overlay, overlayTitle, overlayScore, gameOverBox, pauseMenuBox, pauseLevelInput,
  restartBtn, highScoreEntryEl, highScoreNameInput, highScoreSaveBtn, highScoresTableBody,
};

const game = new Game(refs);

restartBtn.addEventListener('click', () => game.restart());
bindInput(game);

pauseResumeBtn.addEventListener('click', () => game.togglePause());
pauseRestartBtn.addEventListener('click', () => game.restart());
pauseControlsBtn.addEventListener('click', () => {
  const nowHidden = pauseControlsList.classList.toggle('hidden');
  pauseControlsBtn.setAttribute('aria-expanded', String(!nowHidden));
});
pauseLevelInput.addEventListener('change', () => {
  game.setPendingStartLevel(Number(pauseLevelInput.value));
});

renderHighScores(highScoresTableBody, loadHighScores());

highScoreSaveBtn.addEventListener('click', () => game.submitHighScoreName(highScoreNameInput.value));
highScoreNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    game.submitHighScoreName(highScoreNameInput.value);
  }
});

highScoresResetBtn.addEventListener('click', () => {
  resetHighScores();
  renderHighScores(highScoresTableBody, []);
});

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
