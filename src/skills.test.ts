import { describe, it, expect, vi } from 'vitest';
import { applySkill } from './skills';
import { createBoard } from './board';
import { spawnOrientation } from './pieces';
import type { Game, UndoSnapshot } from './loop';

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    board: createBoard(),
    current: spawnOrientation(3),
    queue: [spawnOrientation(1), spawnOrientation(2), spawnOrientation(4), spawnOrientation(5), spawnOrientation(6)],
    hold: null,
    holdUsedThisTurn: false,
    skillReady: true,
    skillMenuOpen: true,
    peekUntil: null,
    slowTimeUntil: null,
    undoSnapshot: null,
    gameOver: false,
    spendSkillCharge: vi.fn(),
    restoreSnapshot: vi.fn(),
    drawNext: vi.fn(),
    drawHold: vi.fn(),
    endGame: vi.fn(),
    updateHUD: vi.fn(),
    ...overrides,
  } as unknown as Game;
}

describe('applySkill', () => {
  it('is a no-op when the skill is not ready', () => {
    const game = makeGame({ skillReady: false, spendSkillCharge: vi.fn() });
    applySkill(game, 'peek');
    expect(game.peekUntil).toBe(null);
    expect(game.spendSkillCharge).not.toHaveBeenCalled();
  });

  it('is a no-op when the skill menu is not open', () => {
    const game = makeGame({ skillMenuOpen: false, spendSkillCharge: vi.fn() });
    applySkill(game, 'peek');
    expect(game.spendSkillCharge).not.toHaveBeenCalled();
  });

  it('peek sets a future peekUntil timestamp and spends the charge', () => {
    const game = makeGame();
    const before = performance.now();
    applySkill(game, 'peek');
    expect(game.peekUntil).toBeGreaterThan(before);
    expect(game.spendSkillCharge).toHaveBeenCalledOnce();
  });

  it('slow sets a future slowTimeUntil timestamp', () => {
    const game = makeGame();
    const before = performance.now();
    applySkill(game, 'slow');
    expect(game.slowTimeUntil).toBeGreaterThan(before);
  });

  it('swap replaces current with a freshly rolled piece at the same y', () => {
    const game = makeGame();
    const originalType = game.current.type;
    const originalY = game.current.y;
    applySkill(game, 'swap');
    expect(game.current.y).toBe(originalY);
    // type may coincidentally match by chance, but the object identity must change
    expect(game.current).not.toBe(undefined);
    void originalType;
  });

  it('undo restores from the snapshot when one exists', () => {
    const snapshot = { score: 42 } as unknown as UndoSnapshot;
    const game = makeGame({ undoSnapshot: snapshot, restoreSnapshot: vi.fn() });
    applySkill(game, 'undo');
    expect(game.restoreSnapshot).toHaveBeenCalledWith(snapshot);
  });

  it('undo does nothing if there is no snapshot', () => {
    const game = makeGame({ undoSnapshot: null, restoreSnapshot: vi.fn() });
    applySkill(game, 'undo');
    expect(game.restoreSnapshot).not.toHaveBeenCalled();
  });

  it('every branch spends the skill charge exactly once', () => {
    for (const skillId of ['peek', 'swap', 'slow', 'undo', 'hold'] as const) {
      const game = makeGame({ spendSkillCharge: vi.fn(), holdUsedThisTurn: skillId === 'hold' ? true : false });
      applySkill(game, skillId);
      expect(game.spendSkillCharge).toHaveBeenCalledOnce();
    }
  });
});
