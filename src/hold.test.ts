import { describe, it, expect, vi } from 'vitest';
import { holdPiece } from './hold';
import { createBoard } from './board';
import { spawnOrientation } from './pieces';
import type { Game } from './loop';

function makeGame(): Game {
  return {
    board: createBoard(),
    current: spawnOrientation(3), // T
    queue: [spawnOrientation(1)], // I
    hold: null,
    holdUsedThisTurn: false,
    gameOver: false,
    drawNext: vi.fn(),
    drawHold: vi.fn(),
    endGame: vi.fn(function (this: any) { this.gameOver = true; }),
  } as unknown as Game;
}

describe('holdPiece', () => {
  it('first use: stores current, pulls next as current', () => {
    const game = makeGame();
    const originalNext = game.queue[0];
    holdPiece(game);
    expect(game.hold?.type).toBe(3);
    expect(game.current).toBe(originalNext);
    expect(game.holdUsedThisTurn).toBe(true);
  });

  it('second use: swaps current and hold', () => {
    const game = makeGame();
    holdPiece(game);
    game.holdUsedThisTurn = false; // simulate next turn
    const heldType = game.hold!.type;
    const currentType = game.current.type;
    holdPiece(game);
    expect(game.current.type).toBe(heldType);
    expect(game.hold!.type).toBe(currentType);
  });

  it('no-ops when already used this turn', () => {
    const game = makeGame();
    game.holdUsedThisTurn = true;
    const before = game.current;
    holdPiece(game);
    expect(game.current).toBe(before);
    expect(game.hold).toBe(null);
  });
});
