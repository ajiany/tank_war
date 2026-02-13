import { TILE_SIZE, ThemeColors, THEMES } from './constants';

export type TileType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const TileTypeEnum = {
  Empty: 0 as const,
  Brick: 1 as const,
  Steel: 2 as const,
  Base: 3 as const,
  River: 4 as const,
  Tree: 5 as const,
  Ice: 6 as const,
};

// Simple hash for deterministic decoration
function tileHash(row: number, col: number): number {
  return ((row * 7 + col * 13 + row * col * 3) & 0xff) / 255;
}

export function drawMapGround(
  ctx: CanvasRenderingContext2D,
  map: TileType[][],
  theme: ThemeColors,
  animTime: number
): void {
  // Fill ground
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, 0, map[0].length * TILE_SIZE, map.length * TILE_SIZE);

  // Ground decorations
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      const h = tileHash(row, col);

      if (map[row][col] === TileTypeEnum.Empty) {
        // Subtle ground detail dots
        ctx.fillStyle = theme.groundDetail;
        if (h > 0.7) {
          const dx = Math.floor(h * 24);
          const dy = Math.floor((h * 7) % 1 * 24);
          ctx.fillRect(x + dx, y + dy, 2, 2);
        }
        if (h > 0.85) {
          ctx.fillRect(x + 8, y + 18, 1, 1);
          ctx.fillRect(x + 22, y + 6, 1, 1);
        }
      }

      // River tiles (animated)
      if (map[row][col] === TileTypeEnum.River) {
        drawRiver(ctx, x, y, theme, animTime);
      }

      // Ice tiles
      if (map[row][col] === TileTypeEnum.Ice) {
        drawIce(ctx, x, y, theme);
      }
    }
  }
}

function drawRiver(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  theme: ThemeColors,
  animTime: number
): void {
  ctx.fillStyle = theme.river;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  // Animated wave lines
  ctx.fillStyle = theme.riverLight;
  const offset = Math.floor(animTime * 3) % 8;
  for (let i = 0; i < 4; i++) {
    const wy = y + 4 + i * 8 + offset;
    if (wy >= y && wy < y + TILE_SIZE - 1) {
      ctx.fillRect(x + 2, wy, 6, 1);
      ctx.fillRect(x + 14, wy + 2, 8, 1);
      ctx.fillRect(x + 26, wy, 4, 1);
    }
  }
}

function drawIce(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  theme: ThemeColors
): void {
  ctx.fillStyle = theme.ice;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  // Shine marks
  ctx.fillStyle = theme.iceLight;
  ctx.fillRect(x + 4, y + 4, 8, 2);
  ctx.fillRect(x + 20, y + 14, 6, 2);
  ctx.fillRect(x + 10, y + 24, 4, 2);

  // Edge lines
  ctx.fillStyle = theme.ice;
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = theme.iceLight;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  ctx.globalAlpha = 1;
}

// Draw tree canopy (overlay layer - drawn ABOVE tanks)
export function drawTreeOverlay(
  ctx: CanvasRenderingContext2D,
  map: TileType[][],
  theme: ThemeColors
): void {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] !== TileTypeEnum.Tree) continue;
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      // Tree canopy pixel pattern
      ctx.fillStyle = theme.tree;
      ctx.fillRect(x + 2, y + 2, 28, 28);

      ctx.fillStyle = theme.treeDark;
      ctx.fillRect(x + 6, y + 6, 8, 8);
      ctx.fillRect(x + 18, y + 4, 6, 6);
      ctx.fillRect(x + 8, y + 18, 10, 8);
      ctx.fillRect(x + 22, y + 20, 6, 6);

      // Lighter leaf spots
      ctx.fillStyle = theme.tree;
      ctx.fillRect(x + 4, y + 4, 4, 4);
      ctx.fillRect(x + 14, y + 10, 4, 4);
      ctx.fillRect(x + 24, y + 16, 4, 4);
      ctx.fillRect(x + 10, y + 24, 4, 4);
    }
  }
}

// Legacy compat - draw static tiles (brick, steel, base)
export function drawMap(
  ctx: CanvasRenderingContext2D,
  map: TileType[][],
  theme?: ThemeColors
): void {
  const t = theme || THEMES.city;
  drawMapGround(ctx, map, t, 0);
}
