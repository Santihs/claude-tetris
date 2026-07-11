import { collide } from './board';
import { tryRotate } from './pieces';
import type { Game } from './loop';

export function bindInput(game: Game): void {
  document.addEventListener('keydown', e => {
    if (e.code === 'KeyP') { game.togglePause(); return; }
    if (game.paused || game.gameOver) return;
    switch (e.code) {
      case 'ArrowLeft':
        if (!collide(game.board, game.current.shape, game.current.x - 1, game.current.y)) game.current.x--;
        break;
      case 'ArrowRight':
        if (!collide(game.board, game.current.shape, game.current.x + 1, game.current.y)) game.current.x++;
        break;
      case 'ArrowDown':
        game.softDrop();
        break;
      case 'ArrowUp':
      case 'KeyX':
        tryRotate(game.board, game.current);
        break;
      case 'Space':
        e.preventDefault();
        game.hardDrop();
        break;
    }
    game.updateHUD();
  });
}
