export type Shape = number[][];

export type Board = number[][];

export type PowerUpKind = 'bomb' | 'lightning' | 'freeze' | 'gravity' | 'dye';

export interface Piece {
  type: number;
  shape: Shape;
  x: number;
  y: number;
  powerUpKind?: PowerUpKind;
}

export interface GameState {
  board: Board;
  current: Piece;
  next: Piece;
  score: number;
  lines: number;
  level: number;
  paused: boolean;
  gameOver: boolean;
  lastTime: number;
  dropAccum: number;
  dropInterval: number;
  animId: number;
}
