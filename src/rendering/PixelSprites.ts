import { TILE_SIZE, COLORS, ThemeColors } from '../constants';
import { Direction } from '../types';

// 8x8 pixel matrices for tank sprites (1=body, 2=dark, 3=barrel, 0=transparent)
const TANK_UP: number[][] = [
  [0,1,1,3,3,1,1,0],
  [1,1,2,3,3,2,1,1],
  [1,2,1,1,1,1,2,1],
  [1,2,1,2,2,1,2,1],
  [1,2,1,2,2,1,2,1],
  [1,2,1,1,1,1,2,1],
  [1,1,2,2,2,2,1,1],
  [0,1,1,1,1,1,1,0],
];

function rotateCW(m: number[][]): number[][] {
  const s = m.length;
  const r: number[][] = [];
  for (let i = 0; i < s; i++) {
    r[i] = [];
    for (let j = 0; j < s; j++) {
      r[i][j] = m[s - 1 - j][i];
    }
  }
  return r;
}

const TANK_RIGHT = rotateCW(TANK_UP);
const TANK_DOWN = rotateCW(TANK_RIGHT);
const TANK_LEFT = rotateCW(TANK_DOWN);

const TANK_SPRITES: Record<Direction, number[][]> = {
  up: TANK_UP, right: TANK_RIGHT, down: TANK_DOWN, left: TANK_LEFT,
};

// Eagle/base sprite 8x8
const EAGLE_SPRITE: number[][] = [
  [0,0,1,1,1,1,0,0],
  [0,1,2,1,1,2,1,0],
  [1,2,1,2,2,1,2,1],
  [1,1,2,1,1,2,1,1],
  [0,1,1,2,2,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,2,2,1,1,0],
  [1,1,0,1,1,0,1,1],
];

// Brick tile pattern 8x8
const BRICK_PATTERN: number[][] = [
  [1,1,1,0,1,1,1,1],
  [1,1,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,0],
  [1,1,1,1,1,0,1,1],
  [1,1,1,1,1,0,1,1],
  [0,0,0,0,0,0,0,0],
  [1,1,1,0,1,1,1,1],
  [1,1,1,0,1,1,1,1],
];

// Steel tile pattern 8x8
const STEEL_PATTERN: number[][] = [
  [2,1,1,1,1,1,1,2],
  [1,1,1,1,1,1,1,1],
  [1,1,2,2,2,2,1,1],
  [1,1,2,1,1,2,1,1],
  [1,1,2,1,1,2,1,1],
  [1,1,2,2,2,2,1,1],
  [1,1,1,1,1,1,1,1],
  [2,1,1,1,1,1,1,2],
];

function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: number[][],
  x: number, y: number,
  size: number,
  colorMap: Record<number, string>
): void {
  const pixelSize = size / matrix.length;
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const val = matrix[row][col];
      if (val === 0) continue;
      const color = colorMap[val];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.floor(x + col * pixelSize),
        Math.floor(y + row * pixelSize),
        Math.ceil(pixelSize),
        Math.ceil(pixelSize)
      );
    }
  }
}

export function drawTank(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  direction: Direction,
  bodyColor: string,
  darkColor: string
): void {
  const sprite = TANK_SPRITES[direction];
  drawPixelMatrix(ctx, sprite, x, y, TILE_SIZE, {
    1: bodyColor,
    2: darkColor,
    3: '#333333',
  });
}

export function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, theme?: ThemeColors): void {
  drawPixelMatrix(ctx, BRICK_PATTERN, x, y, TILE_SIZE, {
    1: theme?.brick ?? COLORS.brick,
    2: theme?.brickLight ?? COLORS.brickLight,
  });
}

export function drawSteel(ctx: CanvasRenderingContext2D, x: number, y: number, theme?: ThemeColors): void {
  drawPixelMatrix(ctx, STEEL_PATTERN, x, y, TILE_SIZE, {
    1: theme?.steel ?? COLORS.steel,
    2: theme?.steelLight ?? COLORS.steelLight,
  });
}

export function drawEagle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  drawPixelMatrix(ctx, EAGLE_SPRITE, x, y, TILE_SIZE, {
    1: COLORS.base,
    2: COLORS.baseDark,
  });
}

export function drawBullet(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = COLORS.bullet;
  ctx.fillRect(Math.floor(x + 1), Math.floor(y + 1), 4, 4);
}

export function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
  const alpha = 0.3 + 0.4 * Math.abs(Math.sin(frame * 8));
  ctx.strokeStyle = COLORS.shield;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 2, y - 2, TILE_SIZE + 4, TILE_SIZE + 4);
  ctx.globalAlpha = 1;
}

export function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  type: string,
  frame: number
): void {
  const flash = Math.sin(frame * 6) > 0;
  if (!flash) return;

  ctx.fillStyle = COLORS.powerUp;
  ctx.fillRect(x, y, 28, 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const labels: Record<string, string> = {
    star: '\u2605', bomb: '\u2737', shovel: '\u2692', tank: '\u25C6',
  };
  ctx.fillText(labels[type] || '?', x + 14, y + 14);
}
