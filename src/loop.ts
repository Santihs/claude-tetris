import { collide, createBoard, merge, clearLines } from './board';
import { randomPiece } from './pieces';
import { draw, drawPiecePreview, ghostY } from './render';
import { updateHUD, type HudRefs } from './hud';
import { hardDropPoints, SOFT_DROP_POINTS } from './scoring';
import type { Board, Piece } from './types';

export interface GameRefs extends HudRefs {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  nextCanvas: HTMLCanvasElement;
  nextCtx: CanvasRenderingContext2D;
  overlay: HTMLElement;
  overlayTitle: HTMLElement;
  overlayScore: HTMLElement;
}

export class Game {
  board!: Board;
  current!: Piece;
  next!: Piece;
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  lastTime = 0;
  dropAccum = 0;
  dropInterval = 1000;
  animId = 0;
  gridLineColor = '#22222e';

  constructor(private refs: GameRefs) {}

  spawn(): void {
    this.current = this.next;
    this.next = randomPiece();
    if (collide(this.board, this.current.shape, this.current.x, this.current.y)) {
      this.endGame();
    }
    this.drawNext();
  }

  drawNext(): void {
    drawPiecePreview(this.refs.nextCtx, this.refs.nextCanvas, this.next.shape);
  }

  lockPiece(): void {
    merge(this.board, this.current.shape, this.current.x, this.current.y);
    const result = clearLines(this.board, this.lines, this.level);
    if (result.cleared) {
      this.lines = result.linesAfter;
      this.score += result.scoreDelta;
      this.level = result.levelAfter;
      this.dropInterval = result.dropIntervalAfter;
      this.updateHUD();
    }
    this.spawn();
  }

  ghostY(): number {
    return ghostY(this.board, this.current);
  }

  hardDrop(): void {
    const gy = this.ghostY();
    this.score += hardDropPoints(gy - this.current.y);
    this.current.y = gy;
    this.lockPiece();
  }

  softDrop(): void {
    if (!collide(this.board, this.current.shape, this.current.x, this.current.y + 1)) {
      this.current.y++;
      this.score += SOFT_DROP_POINTS;
      this.updateHUD();
    } else {
      this.lockPiece();
    }
  }

  updateHUD(): void {
    updateHUD(this.refs, this.score, this.lines, this.level);
  }

  draw(): void {
    draw(this.refs.ctx, this.refs.canvas, this.board, this.current, this.ghostY(), this.gridLineColor);
  }

  endGame(): void {
    this.gameOver = true;
    cancelAnimationFrame(this.animId);
    this.refs.overlayTitle.textContent = 'GAME OVER';
    this.refs.overlayScore.textContent = `Puntuación: ${this.score.toLocaleString()}`;
    this.refs.overlay.classList.remove('hidden');
  }

  togglePause(): void {
    if (this.gameOver) return;
    this.paused = !this.paused;
    if (!this.paused) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    } else {
      cancelAnimationFrame(this.animId);
      this.refs.overlayTitle.textContent = 'PAUSA';
      this.refs.overlayScore.textContent = '';
      this.refs.overlay.classList.remove('hidden');
    }
  }

  loop = (ts: number): void => {
    const dt = ts - this.lastTime;
    this.lastTime = ts;
    this.dropAccum += dt;
    if (this.dropAccum >= this.dropInterval) {
      this.dropAccum = 0;
      if (!collide(this.board, this.current.shape, this.current.x, this.current.y + 1)) {
        this.current.y++;
      } else {
        this.lockPiece();
      }
    }
    if (this.gameOver) return;
    this.draw();
    this.animId = requestAnimationFrame(this.loop);
  };

  init(): void {
    this.board = createBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.paused = false;
    this.gameOver = false;
    this.dropInterval = 1000;
    this.dropAccum = 0;
    this.lastTime = performance.now();
    this.next = randomPiece();
    this.spawn();
    this.updateHUD();
    this.refs.overlay.classList.add('hidden');
    cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(this.loop);
  }
}
