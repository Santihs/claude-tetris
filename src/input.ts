import { collide } from './board';
import { tryRotate } from './pieces';
import { holdPiece } from './hold';
import type { Game } from './loop';

export function bindInput(game: Game): void {
  document.addEventListener('keydown', e => {
    if (e.code === 'KeyP') { game.togglePause(); return; }
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
