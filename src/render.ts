import { BLOCK, COLORS, COLS, ROWS } from './constants';
import { collide } from './board';
import type { Board, Piece, Shape } from './types';

export function drawBlock(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  colorIndex: number,
  size: number,
  alpha?: number,
): void {
  if (!colorIndex) return;
  const color = COLORS[colorIndex];
  context.globalAlpha = alpha ?? 1;
  context.fillStyle = color as string;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  context.globalAlpha = 1;
}

export function drawGrid(ctx: CanvasRenderingContext2D, gridLineColor: string): void {
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function ghostY(board: Board, current: Piece): number {
  let gy = current.y;
  while (!collide(board, current.shape, current.x, gy + 1)) gy++;
  return gy;
}

export function draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  board: Board,
  current: Piece,
  gy: number,
  gridLineColor: string,
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, gridLineColor);

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

export function drawPiecePreview(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  shape: Shape,
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const box = Math.max(4, shape.length, shape[0].length);
  const cell = Math.floor(canvas.width / box);
  const offX = Math.floor((box - shape[0].length) / 2);
  const offY = Math.floor((box - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(ctx, offX + c, offY + r, shape[r][c], cell);
}

export { ghostY };
