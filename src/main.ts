import './style.css';
import { Game, type GameRefs } from './loop';
import { bindInput } from './input';
import { initTheme, toggleTheme } from './theme';

const canvas = document.getElementById('board') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
const nextCtx = nextCanvas.getContext('2d')!;
const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;
const holdCtx = holdCanvas.getContext('2d')!;
const holdSection = document.getElementById('hold-section')!;
const scoreEl = document.getElementById('score')!;
const linesEl = document.getElementById('lines')!;
const levelEl = document.getElementById('level')!;
const overlay = document.getElementById('overlay')!;
const overlayTitle = document.getElementById('overlay-title')!;
const overlayScore = document.getElementById('overlay-score')!;
const restartBtn = document.getElementById('restart-btn')!;
const themeToggleBtn = document.getElementById('theme-toggle')!;
const themeIcon = document.getElementById('theme-icon')!;

const refs: GameRefs = {
  canvas, ctx, nextCanvas, nextCtx,
  holdCanvas, holdCtx, holdSection,
  scoreEl, linesEl, levelEl,
  overlay, overlayTitle, overlayScore,
};

const game = new Game(refs);

restartBtn.addEventListener('click', () => game.init());
bindInput(game);

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

game.init();
