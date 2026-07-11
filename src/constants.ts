import type { PowerUpKind, Shape } from './types';

export const COLS = 10;
export const ROWS = 20;
export const BLOCK = 30;

export const COLORS: (string | null)[] = [
  null,
  '#4dd0e1', // 1 I - cyan
  '#ffd54f', // 2 O - yellow
  '#ba68c8', // 3 T - purple
  '#81c784', // 4 S - green
  '#e57373', // 5 Z - red
  '#64b5f6', // 6 J - blue
  '#ffb74d', // 7 L - orange
  '#f06292', // 8 + (plus pentomino) - pink
  '#4db6ac', // 9 U pentomino - teal
  '#9575cd', // 10 Y pentomino - deep purple
  '#ffffff', // 11 1x1 reward piece - white
  '#78909c', // 12 hollow 3x3 challenge piece - blue-grey
  '#ff5252', // 13 power-up: bomb - red
  '#fff176', // 14 power-up: lightning - bright yellow
  '#80deea', // 15 power-up: freeze - icy cyan
  '#a1887f', // 16 power-up: gravity - brown
  '#ce93d8', // 17 power-up: dye - orchid
];

export const PIECES: (Shape | null)[] = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // 1 I
  [[2,2],[2,2]],                               // 2 O
  [[0,3,0],[3,3,3],[0,0,0]],                  // 3 T
  [[0,4,4],[4,4,0],[0,0,0]],                  // 4 S
  [[5,5,0],[0,5,5],[0,0,0]],                  // 5 Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // 6 J
  [[0,0,7],[7,7,7],[0,0,0]],                  // 7 L
  [[0,8,0],[8,8,8],[0,8,0]],                  // 8 + pentomino
  [[9,0,9],[9,9,9]],                          // 9 U pentomino
  [[0,10],[10,10],[0,10],[0,10]],             // 10 Y pentomino
  [[11]],                                     // 11 1x1 reward piece
  [[12,12,12],[12,0,12],[12,12,12]],          // 12 hollow 3x3 challenge piece
  [[13,13],[13,13]],                          // 13 power-up: bomb
  [[14,14],[14,14]],                          // 14 power-up: lightning
  [[15,15],[15,15]],                          // 15 power-up: freeze
  [[16,16],[16,16]],                          // 16 power-up: gravity
  [[17,17],[17,17]],                          // 17 power-up: dye
];

export const LINE_SCORES = [0, 100, 300, 500, 800];

export const STANDARD_TYPES = [1, 2, 3, 4, 5, 6, 7];
export const T_PIECE_TYPE = 3;
export const PENTOMINO_TYPES = [8, 9, 10];
export const REWARD_PIECE_TYPE = 11;
export const CHALLENGE_PIECE_TYPE = 12;
export const CHALLENGE_PIECE_INTERVAL = 15;
export const PENTOMINO_ROLL_CHANCE = 0.15;

export const POWER_UP_TYPE_BY_KIND: Record<PowerUpKind, number> = {
  bomb: 13,
  lightning: 14,
  freeze: 15,
  gravity: 16,
  dye: 17,
};
export const POWER_UP_KIND_BY_TYPE: Record<number, PowerUpKind> = {
  13: 'bomb',
  14: 'lightning',
  15: 'freeze',
  16: 'gravity',
  17: 'dye',
};
export const POWER_UP_TYPES = Object.values(POWER_UP_TYPE_BY_KIND);
export const POWER_UP_LINE_INTERVAL = 5;
export const FREEZE_DURATION_MS = 5000;
