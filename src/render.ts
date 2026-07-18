import { BLOCK, COLS, ROWS } from './constants';
import { collide } from './board';
import { getCurrentSkin, getPalette } from './skin';
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
  const skin = getCurrentSkin();
  const color = getPalette(skin)[colorIndex] as string;
  context.globalAlpha = alpha ?? 1;

  if (skin === 'neon') {
    // Glowing filled square with canvas shadow bloom
    context.shadowColor = color;
    context.shadowBlur = size * 0.55;
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    context.shadowBlur = 0;
  } else if (skin === 'pastel') {
    // Rounded rectangle with a soft white top highlight
    const radius = Math.max(3, size * 0.2);
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x * size + 1, y * size + 1, size - 2, size - 2, radius);
    context.fill();
    context.fillStyle = 'rgba(255,255,255,0.22)';
    context.beginPath();
    context.roundRect(x * size + 1, y * size + 1, size - 2, Math.max(3, size * 0.18), radius);
    context.fill();
  } else if (skin === 'pixel-art') {
    // Edge-to-edge fill with chiselled 2-px border (light top-left, dark bottom-right)
    context.fillStyle = color;
    context.fillRect(x * size, y * size, size, size);
    // Dark shadow — bottom and right edges
    context.fillStyle = 'rgba(0,0,0,0.38)';
    context.fillRect(x * size, y * size + size - 2, size, 2);
    context.fillRect(x * size + size - 2, y * size, 2, size);
    // Light highlight — top and left edges
    context.fillStyle = 'rgba(255,255,255,0.40)';
    context.fillRect(x * size, y * size, size, 2);
    context.fillRect(x * size, y * size, 2, size);
  } else {
    // Retro — flat square with a thin white top shine (original behaviour)
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    context.fillStyle = 'rgba(255,255,255,0.12)';
    context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  }

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

  if (current.powerUpKind) drawPowerUpOutline(ctx, current);
}

function drawPowerUpOutline(ctx: CanvasRenderingContext2D, current: Piece): void {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        ctx.strokeRect((current.x + c) * BLOCK + 2, (current.y + r) * BLOCK + 2, BLOCK - 4, BLOCK - 4);
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

/** Stacks small previews of each piece vertically in one canvas - used for the "peek next" skill. */
export function drawQueueStrip(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  pieces: Piece[],
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (pieces.length === 0) return;
  const slotHeight = canvas.height / pieces.length;
  const box = 4;
  const cell = Math.min(slotHeight, canvas.width) / box;
  pieces.forEach((piece, i) => {
    const shape = piece.shape;
    const offX = Math.floor((box - shape[0].length) / 2);
    const offY = Math.floor((box - shape.length) / 2);
    const baseY = (i * slotHeight) / cell;
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++)
        if (shape[r][c])
          drawBlock(ctx, offX + c, baseY + offY + r, shape[r][c], cell);
  });
}

export { ghostY };
