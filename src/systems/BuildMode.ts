import {
  TILE_SIZE, GRID_COLS, GRID_ROWS, GAME_WIDTH, GAME_HEIGHT,
  BUILD_INITIAL_POINTS, BUILD_MATERIALS, BUILD_RECYCLE_RATE,
  BuildMaterialKey, SPAWN_POINTS_X, ThemeColors,
} from '../constants';
import { TileType, TileTypeEnum } from '../map';
import { Input } from './Input';
import { Entity } from '../entities/Entity';
import { drawBrick, drawSteel } from '../rendering/PixelSprites';

interface PlacedBlock {
  row: number;
  col: number;
  tile: TileType;
  cost: number;
}

export class BuildMode {
  active = false;
  cursorRow = 6;
  cursorCol = 6;
  selectedMaterial: BuildMaterialKey = 1;
  points: number = BUILD_INITIAL_POINTS;

  private placedBlocks: PlacedBlock[] = [];
  private inputCooldown = 0;

  addPoints(amount: number): void {
    this.points += amount;
  }

  toggle(): void {
    this.active = !this.active;
  }

  update(
    dt: number,
    input: Input,
    map: TileType[][],
    entities: Entity[],
    addWallCallback: (row: number, col: number, tile: TileType) => void,
    removeWallCallback: (row: number, col: number) => boolean,
  ): void {
    if (!this.active) return;

    this.inputCooldown -= dt;
    if (this.inputCooldown > 0) return;

    const cooldown = 0.12;

    // Cursor movement
    if (input.isPressed('w') || input.isPressed('W')) {
      this.cursorRow = Math.max(0, this.cursorRow - 1);
      this.inputCooldown = cooldown;
    } else if (input.isPressed('s') || input.isPressed('S')) {
      this.cursorRow = Math.min(GRID_ROWS - 1, this.cursorRow + 1);
      this.inputCooldown = cooldown;
    } else if (input.isPressed('a') || input.isPressed('A')) {
      this.cursorCol = Math.max(0, this.cursorCol - 1);
      this.inputCooldown = cooldown;
    } else if (input.isPressed('d') || input.isPressed('D')) {
      this.cursorCol = Math.min(GRID_COLS - 1, this.cursorCol + 1);
      this.inputCooldown = cooldown;
    }

    // Material selection
    for (let k = 1; k <= 5; k++) {
      if (input.isPressed(String(k))) {
        this.selectedMaterial = k as BuildMaterialKey;
        this.inputCooldown = cooldown;
      }
    }

    // Place
    if (input.isPressed('j') || input.isPressed('J') || input.isPressed(' ')) {
      this.tryPlace(map, entities, addWallCallback);
      this.inputCooldown = 0.2;
    }

    // Delete
    if (input.isPressed('x') || input.isPressed('X')) {
      this.tryRemove(map, removeWallCallback);
      this.inputCooldown = 0.2;
    }
  }

  private canPlace(map: TileType[][], entities: Entity[]): boolean {
    const row = this.cursorRow;
    const col = this.cursorCol;

    // Must be empty
    if (map[row][col] !== TileTypeEnum.Empty) return false;

    // Not on spawn points (row 0)
    if (row === 0) {
      for (const sx of SPAWN_POINTS_X) {
        const spawnCol = Math.floor(sx / TILE_SIZE);
        if (col === spawnCol) return false;
      }
    }

    // Not on base row last row center
    if (row === GRID_ROWS - 1 && col === Math.floor(GRID_COLS / 2)) return false;

    // Not overlapping any entity
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;
    for (const e of entities) {
      if (e.x < x + TILE_SIZE && e.x + e.width > x &&
          e.y < y + TILE_SIZE && e.y + e.height > y) {
        return false;
      }
    }

    // Enough points
    const mat = BUILD_MATERIALS[this.selectedMaterial];
    if (this.points < mat.cost) return false;

    return true;
  }

  private tryPlace(
    map: TileType[][],
    entities: Entity[],
    addWallCallback: (row: number, col: number, tile: TileType) => void,
  ): void {
    if (!this.canPlace(map, entities)) return;

    const mat = BUILD_MATERIALS[this.selectedMaterial];
    this.points -= mat.cost;
    map[this.cursorRow][this.cursorCol] = mat.tile;
    addWallCallback(this.cursorRow, this.cursorCol, mat.tile);
    this.placedBlocks.push({
      row: this.cursorRow,
      col: this.cursorCol,
      tile: mat.tile,
      cost: mat.cost,
    });
  }

  private tryRemove(
    map: TileType[][],
    removeWallCallback: (row: number, col: number) => boolean,
  ): void {
    const idx = this.placedBlocks.findIndex(
      b => b.row === this.cursorRow && b.col === this.cursorCol
    );
    if (idx === -1) return; // Can only remove player-placed blocks

    const block = this.placedBlocks[idx];
    map[block.row][block.col] = TileTypeEnum.Empty as TileType;
    removeWallCallback(block.row, block.col);
    this.points += Math.floor(block.cost * BUILD_RECYCLE_RATE);
    this.placedBlocks.splice(idx, 1);
  }

  draw(ctx: CanvasRenderingContext2D, map: TileType[][], entities: Entity[], animFrame: number, theme?: ThemeColors): void {
    if (!this.active) return;

    // Grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE_SIZE);
      ctx.lineTo(GAME_WIDTH, r * TILE_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * TILE_SIZE, 0);
      ctx.lineTo(c * TILE_SIZE, GAME_HEIGHT);
      ctx.stroke();
    }

    const x = this.cursorCol * TILE_SIZE;
    const y = this.cursorRow * TILE_SIZE;
    const canPlace = this.canPlace(map, entities);

    // Material preview (semi-transparent)
    ctx.globalAlpha = 0.4;
    const mat = BUILD_MATERIALS[this.selectedMaterial];
    switch (mat.tile) {
      case 1: drawBrick(ctx, x, y, theme); break;
      case 2: drawSteel(ctx, x, y, theme); break;
      case 4:
        ctx.fillStyle = theme?.river ?? '#1a3a6a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;
      case 5:
        ctx.fillStyle = theme?.tree ?? '#2d5a1e';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;
      case 6:
        ctx.fillStyle = theme?.ice ?? '#a0d0e0';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;
    }
    ctx.globalAlpha = 1;

    // Cursor border (flashing green/red)
    const flash = Math.sin(animFrame * 8) > 0;
    if (flash) {
      ctx.strokeStyle = canPlace ? '#00ff00' : '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    // BUILD MODE indicator
    ctx.fillStyle = '#00ff00';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUILD MODE', GAME_WIDTH / 2, GAME_HEIGHT - 4);
  }

  drawSidebar(ctx: CanvasRenderingContext2D, sx: number): void {
    if (!this.active) return;

    ctx.fillStyle = '#00cc00';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BUILD', sx + 8, 200);

    // Material list
    const keys = [1, 2, 3, 4, 5] as const;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const mat = BUILD_MATERIALS[k];
      const selected = this.selectedMaterial === k;
      ctx.fillStyle = selected ? '#00ff00' : '#888888';
      ctx.fillText(
        `${k}:${mat.symbol} ${mat.cost}`,
        sx + 8,
        214 + i * 12,
      );
    }

    // Points
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PT:' + this.points, sx + 8, 280);

    // Controls hint
    ctx.fillStyle = '#666666';
    ctx.font = '8px monospace';
    ctx.fillText('J:PUT X:DEL', sx + 4, 294);
    ctx.fillText('B:EXIT', sx + 4, 304);
  }
}
