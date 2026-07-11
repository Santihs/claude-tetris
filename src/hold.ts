import { collide } from './board';
import { randomPiece, spawnOrientation } from './pieces';
import type { Game } from './loop';

export function holdPiece(game: Game): void {
  if (game.holdUsedThisTurn) return;

  if (game.hold === null) {
    game.hold = spawnOrientation(game.current.type);
    game.current = game.next;
    game.next = randomPiece();
    game.drawNext();
  } else {
    const heldType = game.hold.type;
    game.hold = spawnOrientation(game.current.type);
    game.current = spawnOrientation(heldType);
  }

  game.holdUsedThisTurn = true;
  game.drawHold();

  if (collide(game.board, game.current.shape, game.current.x, game.current.y)) {
    game.endGame();
  }
}
