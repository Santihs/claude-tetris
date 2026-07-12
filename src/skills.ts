import { collide } from './board';
import { randomPiece } from './pieces';
import { holdPiece } from './hold';
import { SLOW_TIME_DURATION_MS, PEEK_DURATION_MS } from './constants';
import type { Game } from './loop';

export type SkillId = 'peek' | 'swap' | 'slow' | 'undo' | 'hold';

export const SKILL_BY_DIGIT: Record<string, SkillId> = {
  Digit1: 'peek',
  Digit2: 'swap',
  Digit3: 'slow',
  Digit4: 'undo',
  Digit5: 'hold',
};

export function applySkill(game: Game, skillId: SkillId): void {
  if (!game.skillReady || !game.skillMenuOpen) return;

  switch (skillId) {
    case 'peek':
      game.peekUntil = performance.now() + PEEK_DURATION_MS;
      break;
    case 'swap': {
      const replacement = randomPiece();
      replacement.y = game.current.y;
      if (!collide(game.board, replacement.shape, replacement.x, replacement.y)) {
        game.current = replacement;
      }
      break;
    }
    case 'slow':
      game.slowTimeUntil = performance.now() + SLOW_TIME_DURATION_MS;
      break;
    case 'undo':
      if (game.undoSnapshot) game.restoreSnapshot(game.undoSnapshot);
      break;
    case 'hold':
      holdPiece(game);
      break;
  }

  game.spendSkillCharge();
}
