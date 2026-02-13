import { Entity } from './Entity';
import { TileTypeEnum } from '../map';
import { ThemeColors } from '../constants';
import { drawBrick, drawSteel } from '../rendering/PixelSprites';

export class Wall extends Entity {
  type: number;
  theme?: ThemeColors;

  constructor(x: number, y: number, type: number) {
    super(x, y, 32, 32);
    this.type = type;
  }

  get isDestructible(): boolean {
    return this.type === TileTypeEnum.Brick;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    if (this.type === TileTypeEnum.Brick) {
      drawBrick(ctx, this.x, this.y, this.theme);
    } else {
      drawSteel(ctx, this.x, this.y, this.theme);
    }
  }
}
