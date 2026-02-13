import { Entity } from './Entity';
import { drawEagle } from '../rendering/PixelSprites';

export class Base extends Entity {
  destroyed = false;

  constructor(x: number, y: number) {
    super(x, y, 32, 32);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    if (this.destroyed) {
      ctx.fillStyle = '#333333';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      drawEagle(ctx, this.x, this.y);
    }
  }
}
