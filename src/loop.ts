import { collide, createBoard, merge, clearLines } from './board';
import { randomPiece, selectNextPieceType } from './pieces';
import { applyPowerUpEffect } from './powerups';
import { draw, drawPiecePreview, drawQueueStrip, ghostY } from './render';
import { updateHUD, type HudRefs } from './hud';
import {
  hardDropPoints, SOFT_DROP_POINTS,
  calculateComboBonus, calculateTSpinBonus, calculateB2BBonus, calculatePerfectClearBonus,
} from './scoring';
import {
  POWER_UP_LINE_INTERVAL, T_PIECE_TYPE, QUEUE_LOOKAHEAD, SKILL_ENERGY_MAX,
} from './constants';
import {
  startObjective, updateObjective, insertGarbageRow, applyPresetBlocks,
  type ObjectiveId, type ObjectiveState,
} from './challenge';
import type { Board, Piece } from './types';
import { isTopFive, renderScoresTable } from './scores';

export type GameMode = 'endless' | 'challenge';

export interface GameRefs extends HudRefs {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  nextCanvas: HTMLCanvasElement;
  nextCtx: CanvasRenderingContext2D;
  holdCanvas: HTMLCanvasElement;
  holdCtx: CanvasRenderingContext2D;
  holdSection: HTMLElement;
  powerUpProgressEl: HTMLElement;
  comboCalloutEl: HTMLElement;
  skillBarFillEl: HTMLElement;
  skillOverlay: HTMLElement;
  queuePreviewCanvas: HTMLCanvasElement;
  queuePreviewCtx: CanvasRenderingContext2D;
  queuePreviewSection: HTMLElement;
  objectiveSection: HTMLElement;
  objectiveLabelEl: HTMLElement;
  objectiveValueEl: HTMLElement;
  modeSelect: HTMLElement;
  overlay: HTMLElement;
  overlayTitle: HTMLElement;
  overlayScore: HTMLElement;
  overlayNameSection: HTMLElement;
  overlayNameInput: HTMLInputElement;
  overlayHighScores: HTMLElement;
  modeSelectHighScores: HTMLElement;
}

export interface UndoSnapshot {
  board: Board;
  current: Piece;
  queue: Piece[];
  hold: Piece | null;
  score: number;
  lines: number;
  level: number;
  dropInterval: number;
  comboCount: number;
  lastClearWasTetris: boolean;
  pendingRewardPiece: boolean;
  pieceSpawnCount: number;
  linesUntilPowerUp: number;
  powerUpReady: boolean;
}

export class Game {
  board!: Board;
  current!: Piece;
  queue: Piece[] = [];
  hold: Piece | null = null;
  holdUsedThisTurn = false;
  pendingRewardPiece = false;
  pieceSpawnCount = 0;
  linesUntilPowerUp = POWER_UP_LINE_INTERVAL;
  powerUpReady = false;
  freezeUntil: number | null = null;
  slowTimeUntil: number | null = null;
  peekUntil: number | null = null;
  comboCount = 0;
  peakCombo = 0;
  lastClearWasTetris = false;
  lastActionWasRotation = false;
  lastTSpinFlag = false;
  skillEnergy = 0;
  skillReady = false;
  skillMenuOpen = false;
  undoSnapshot: UndoSnapshot | null = null;
  private pendingUndoSnapshot: UndoSnapshot | null = null;
  gameMode: GameMode = 'endless';
  objective: ObjectiveState | null = null;
  started = false;
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

  constructor(public refs: GameRefs) {}

  spawn(): void {
    this.current = this.queue.shift()!;
    this.refillQueue();
    this.holdUsedThisTurn = false;
    this.updateHoldPanel();
    this.updatePowerUpProgress();
    if (collide(this.board, this.current.shape, this.current.x, this.current.y)) {
      this.endGame();
    }
    this.drawNext();
    this.drawQueuePreviewIfPeeking();
  }

  private refillQueue(): void {
    while (this.queue.length < QUEUE_LOOKAHEAD) {
      const selection = selectNextPieceType(this.pendingRewardPiece, this.pieceSpawnCount, this.powerUpReady);
      this.pendingRewardPiece = selection.pendingRewardPiece;
      this.pieceSpawnCount = selection.pieceSpawnCount;
      if (selection.powerUpConsumed) {
        this.powerUpReady = false;
        this.linesUntilPowerUp = POWER_UP_LINE_INTERVAL;
      }
      this.queue.push(randomPiece(selection.type));
    }
  }

  private updatePowerUpProgress(): void {
    this.refs.powerUpProgressEl.textContent = this.powerUpReady
      ? '¡Listo!'
      : String(this.linesUntilPowerUp);
  }

  private updateSkillBar(): void {
    const pct = Math.min(100, (this.skillEnergy / SKILL_ENERGY_MAX) * 100);
    this.refs.skillBarFillEl.style.width = `${pct}%`;
  }

  drawNext(): void {
    drawPiecePreview(this.refs.nextCtx, this.refs.nextCanvas, this.queue[0].shape);
  }

  drawHold(): void {
    if (this.hold) drawPiecePreview(this.refs.holdCtx, this.refs.holdCanvas, this.hold.shape);
    else this.refs.holdCtx.clearRect(0, 0, this.refs.holdCanvas.width, this.refs.holdCanvas.height);
    this.updateHoldPanel();
  }

  private updateHoldPanel(): void {
    this.refs.holdSection.classList.toggle('hold-locked', this.holdUsedThisTurn);
  }

  private drawQueuePreviewIfPeeking(): void {
    const peeking = this.peekUntil !== null && performance.now() < this.peekUntil;
    this.refs.queuePreviewSection.classList.toggle('hidden', !peeking);
    if (peeking) drawQueueStrip(this.refs.queuePreviewCtx, this.refs.queuePreviewCanvas, this.queue.slice(1));
  }

  lockPiece(): void {
    // hardDrop() captures its own pre-scoring snapshot before calling this, so
    // its hard-drop points are included in what undo reverts. Everything else
    // that locks a piece (softDrop's forced lock, natural gravity lock) has no
    // prior mutation this turn, so capturing here is equivalent and simpler.
    this.undoSnapshot = this.pendingUndoSnapshot ?? this.captureSnapshot();
    this.pendingUndoSnapshot = null;

    const isTSpin = this.current.type === T_PIECE_TYPE && this.lastActionWasRotation && this.lastTSpinFlag;

    merge(this.board, this.current.shape, this.current.x, this.current.y);
    if (this.current.powerUpKind) {
      const effect = applyPowerUpEffect(this.board, this.current.powerUpKind, this.current.x, this.current.y, performance.now());
      if (effect.freezeUntil) this.freezeUntil = effect.freezeUntil;
    }
    const result = clearLines(this.board, this.lines, this.level);

    if (result.cleared) {
      this.lines = result.linesAfter;
      this.level = result.levelAfter;
      this.dropInterval = result.dropIntervalAfter;

      this.comboCount++;
      if (this.comboCount > this.peakCombo) this.peakCombo = this.comboCount;
      const isTetris = result.cleared === 4;
      const isBackToBack = isTetris && this.lastClearWasTetris;

      let bonus = result.scoreDelta;
      bonus += calculateComboBonus(this.comboCount, this.level);
      if (isTSpin) bonus += calculateTSpinBonus(result.cleared, this.level);
      if (isBackToBack) bonus += calculateB2BBonus(true, this.level);
      if (result.isPerfectClear) bonus += calculatePerfectClearBonus(this.level);
      this.score += bonus;

      this.lastClearWasTetris = isTetris;
      if (isTetris) this.pendingRewardPiece = true;
      this.linesUntilPowerUp = Math.max(0, this.linesUntilPowerUp - result.cleared);
      if (this.linesUntilPowerUp === 0) this.powerUpReady = true;

      this.skillEnergy = Math.min(SKILL_ENERGY_MAX, this.skillEnergy + result.cleared);
      if (this.skillEnergy >= SKILL_ENERGY_MAX) this.skillReady = true;
      this.updateSkillBar();

      this.showCombo(isTSpin, isBackToBack, result.isPerfectClear);
      this.updateHUD();
    } else {
      this.comboCount = 0;
      this.lastClearWasTetris = false;
    }

    this.lastActionWasRotation = false;
    this.lastTSpinFlag = false;
    this.spawn();
  }

  private captureSnapshot(): UndoSnapshot {
    return structuredClone({
      board: this.board,
      current: this.current,
      queue: this.queue,
      hold: this.hold,
      score: this.score,
      lines: this.lines,
      level: this.level,
      dropInterval: this.dropInterval,
      comboCount: this.comboCount,
      lastClearWasTetris: this.lastClearWasTetris,
      pendingRewardPiece: this.pendingRewardPiece,
      pieceSpawnCount: this.pieceSpawnCount,
      linesUntilPowerUp: this.linesUntilPowerUp,
      powerUpReady: this.powerUpReady,
    });
  }

  restoreSnapshot(snapshot: UndoSnapshot): void {
    this.board = snapshot.board;
    this.current = snapshot.current;
    this.queue = snapshot.queue;
    this.hold = snapshot.hold;
    this.score = snapshot.score;
    this.lines = snapshot.lines;
    this.level = snapshot.level;
    this.dropInterval = snapshot.dropInterval;
    this.comboCount = snapshot.comboCount;
    this.lastClearWasTetris = snapshot.lastClearWasTetris;
    this.pendingRewardPiece = snapshot.pendingRewardPiece;
    this.pieceSpawnCount = snapshot.pieceSpawnCount;
    this.linesUntilPowerUp = snapshot.linesUntilPowerUp;
    this.powerUpReady = snapshot.powerUpReady;
    this.undoSnapshot = null;
    this.updateHoldPanel();
    this.updatePowerUpProgress();
    this.drawHold();
    this.drawNext();
    this.updateHUD();
  }

  private showCombo(isTSpin: boolean, isBackToBack: boolean, isPerfectClear: boolean): void {
    const parts: string[] = [];
    if (isTSpin) parts.push('T-SPIN');
    if (isBackToBack) parts.push('BACK-TO-BACK');
    if (isPerfectClear) parts.push('PERFECT CLEAR');
    if (this.comboCount > 1) parts.push(`COMBO x${this.comboCount - 1}`);
    if (parts.length === 0) return;

    const el = this.refs.comboCalloutEl;
    el.textContent = parts.join(' · ');
    el.classList.remove('show');
    // force reflow so re-triggering the fade restarts the transition
    void el.offsetWidth;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 900);
  }

  ghostY(): number {
    return ghostY(this.board, this.current);
  }

  hardDrop(): void {
    this.pendingUndoSnapshot = this.captureSnapshot();
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
    if (this.objective) {
      this.objective.status = 'lost';
      this.refs.overlayTitle.textContent = 'DESAFÍO FALLIDO';
    } else {
      this.refs.overlayTitle.textContent = 'GAME OVER';
    }
    this.refs.overlayScore.textContent = `Puntuación: ${this.score.toLocaleString()}`;
    this.refs.overlay.classList.remove('hidden');
    this.showScorePrompt();
  }

  private showScorePrompt(): void {
    if (isTopFive(this.score)) {
      this.refs.overlayNameInput.value = '';
      this.refs.overlayNameSection.classList.remove('hidden');
    } else {
      this.refs.overlayNameSection.classList.add('hidden');
    }
    renderScoresTable(this.refs.overlayHighScores);
  }

  togglePause(): void {
    if (!this.started || this.gameOver || this.skillMenuOpen) return;
    this.paused = !this.paused;
    if (!this.paused) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    } else {
      cancelAnimationFrame(this.animId);
      this.refs.overlayTitle.textContent = 'PAUSA';
      this.refs.overlayScore.textContent = '';
      this.refs.overlayNameSection.classList.add('hidden');
      this.refs.overlayHighScores.innerHTML = '';
      this.refs.overlay.classList.remove('hidden');
    }
  }

  openSkillMenu(): void {
    if (!this.skillReady || this.skillMenuOpen || this.paused || this.gameOver) return;
    this.skillMenuOpen = true;
    cancelAnimationFrame(this.animId);
    this.refs.skillOverlay.classList.remove('hidden');
  }

  closeSkillMenu(): void {
    if (!this.skillMenuOpen) return;
    this.skillMenuOpen = false;
    this.refs.skillOverlay.classList.add('hidden');
    if (!this.paused && !this.gameOver) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  spendSkillCharge(): void {
    this.skillEnergy = 0;
    this.skillReady = false;
    this.updateSkillBar();
    this.closeSkillMenu();
  }

  loop = (ts: number): void => {
    const dt = ts - this.lastTime;
    this.lastTime = ts;
    const frozen = this.freezeUntil !== null && ts < this.freezeUntil;
    const slowed = !frozen && this.slowTimeUntil !== null && ts < this.slowTimeUntil;
    if (this.slowTimeUntil !== null && ts >= this.slowTimeUntil) this.slowTimeUntil = null;

    if (frozen) {
      // Freeze suspends gravity only - movement/rotation/hard-drop still work via input.ts.
    } else {
      if (this.freezeUntil !== null) {
        this.freezeUntil = null;
        this.dropAccum = 0; // avoid an instant drop the moment freeze ends
      }
      this.dropAccum += slowed ? dt * 0.5 : dt;
      if (this.dropAccum >= this.dropInterval) {
        this.dropAccum = 0;
        if (!collide(this.board, this.current.shape, this.current.x, this.current.y + 1)) {
          this.current.y++;
          this.lastActionWasRotation = false;
        } else {
          this.lockPiece();
        }
      }
    }
    this.drawQueuePreviewIfPeeking();

    if (this.objective && this.objective.status === 'active' && !this.gameOver) {
      const result = updateObjective(this.objective, ts, this.lines);
      this.objective.status = result.status;
      this.objective.elapsedMs = result.elapsedMs;
      this.objective.nextGarbageAt = result.nextGarbageAt;
      if (result.garbageDue) {
        insertGarbageRow(this.board);
        if (collide(this.board, this.current.shape, this.current.x, this.current.y)) {
          this.objective.status = 'lost';
        }
      }
      this.updateObjectiveHUD();
      if (this.objective.status !== 'active') {
        this.endChallenge();
        return;
      }
    }

    if (this.gameOver) return;
    this.draw();
    this.animId = requestAnimationFrame(this.loop);
  };

  init(mode: GameMode = 'endless', objectiveId?: ObjectiveId): void {
    this.board = createBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.paused = false;
    this.gameOver = false;
    this.dropInterval = 1000;
    this.dropAccum = 0;
    this.lastTime = performance.now();
    this.hold = null;
    this.holdUsedThisTurn = false;
    this.pendingRewardPiece = false;
    this.pieceSpawnCount = 0;
    this.linesUntilPowerUp = POWER_UP_LINE_INTERVAL;
    this.powerUpReady = false;
    this.freezeUntil = null;
    this.slowTimeUntil = null;
    this.peekUntil = null;
    this.comboCount = 0;
    this.peakCombo = 0;
    this.lastClearWasTetris = false;
    this.lastActionWasRotation = false;
    this.lastTSpinFlag = false;
    this.skillEnergy = 0;
    this.skillReady = false;
    this.skillMenuOpen = false;
    this.undoSnapshot = null;
    this.started = true;
    this.refs.skillOverlay.classList.add('hidden');
    this.refs.modeSelect.classList.add('hidden');
    this.updateSkillBar();

    this.gameMode = mode;
    this.objective = mode === 'challenge' && objectiveId ? startObjective(objectiveId, this.lastTime) : null;
    if (this.objective?.id === 'preset-blocks') applyPresetBlocks(this.board);
    this.updateObjectiveHUD();

    this.queue = Array.from({ length: QUEUE_LOOKAHEAD }, () => randomPiece());
    this.spawn();
    this.drawHold();
    this.updateHUD();
    this.refs.overlay.classList.add('hidden');
    cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(this.loop);
  }

  private updateObjectiveHUD(): void {
    if (!this.objective) {
      this.refs.objectiveSection.classList.add('hidden');
      return;
    }
    this.refs.objectiveSection.classList.remove('hidden');
    const labels: Record<ObjectiveId, string> = {
      sprint: 'SPRINT 40L',
      survival: 'SUPERVIVENCIA',
      'preset-blocks': 'BLOQUES FIJOS',
    };
    this.refs.objectiveLabelEl.textContent = labels[this.objective.id];
    if (this.objective.id === 'sprint') {
      const remaining = Math.max(0, 120 - Math.floor(this.objective.elapsedMs / 1000));
      this.refs.objectiveValueEl.textContent = `${this.lines}/40 · ${remaining}s`;
    } else if (this.objective.id === 'survival') {
      this.refs.objectiveValueEl.textContent = `${Math.floor(this.objective.elapsedMs / 1000)}s`;
    } else {
      this.refs.objectiveValueEl.textContent = '—';
    }
  }

  private endChallenge(): void {
    if (!this.objective) return;
    this.gameOver = true;
    cancelAnimationFrame(this.animId);
    this.refs.overlayTitle.textContent = this.objective.status === 'won' ? '¡OBJETIVO CUMPLIDO!' : 'DESAFÍO FALLIDO';
    this.refs.overlayScore.textContent = `Puntuación: ${this.score.toLocaleString()}`;
    this.refs.overlay.classList.remove('hidden');
    this.showScorePrompt();
  }

  /** Restart button: endless mode restarts endless, challenge mode returns to mode-select. */
  restart(): void {
    if (this.gameMode === 'challenge') {
      this.started = false;
      this.gameMode = 'endless';
      this.objective = null;
      cancelAnimationFrame(this.animId);
      this.refs.overlay.classList.add('hidden');
      this.refs.objectiveSection.classList.add('hidden');
      this.refs.modeSelect.classList.remove('hidden');
      renderScoresTable(this.refs.modeSelectHighScores);
    } else {
      this.init('endless');
    }
  }
}
