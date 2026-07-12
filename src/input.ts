import { collide } from './board';
import { tryRotate } from './pieces';
import { holdPiece } from './hold';
import { applySkill, SKILL_BY_DIGIT } from './skills';
import type { Game } from './loop';

export function bindInput(game: Game): void {
  document.addEventListener('keydown', e => {
    if (!game.started) return;
    if (game.skillMenuOpen) {
      const skillId = SKILL_BY_DIGIT[e.code];
      if (skillId) applySkill(game, skillId);
      return;
    }
    if (e.code === 'KeyP') { game.togglePause(); return; }
    if (e.code === 'KeyV') { game.openSkillMenu(); return; }
    if (game.paused || game.gameOver) return;
    switch (e.code) {
      case 'ArrowLeft':
        if (!collide(game.board, game.current.shape, game.current.x - 1, game.current.y)) {
          game.current.x--;
          game.lastActionWasRotation = false;
        }
        break;
      case 'ArrowRight':
        if (!collide(game.board, game.current.shape, game.current.x + 1, game.current.y)) {
          game.current.x++;
          game.lastActionWasRotation = false;
        }
        break;
      case 'ArrowDown':
        game.softDrop();
        break;
      case 'ArrowUp':
      case 'KeyX': {
        const result = tryRotate(game.board, game.current);
        if (result.rotated) {
          game.lastActionWasRotation = true;
          game.lastTSpinFlag = result.isTSpin;
        }
        break;
      }
      case 'Space':
        e.preventDefault();
        game.hardDrop();
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        holdPiece(game);
        break;
    }
    game.updateHUD();
  });
}
