import { Entity } from './Entity';
import { PowerUpType, POWERUP_SIZE, POWERUP_DURATION, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';
import { drawPowerUp } from '../rendering/PixelSprites';

export class PowerUp extends Entity {
  readonly type: PowerUpType;
  private timer: number;
  private animFrame = 0;

  constructor(type: PowerUpType) {
    // Random position on empty area
    const x = TILE_SIZE + Math.floor(Math.random() * (GAME_WIDTH - TILE_SIZE * 3));
    const y = TILE_SIZE + Math.floor(Math.random() * (GAME_HEIGHT - TILE_SIZE * 3));
    super(x, y, POWERUP_SIZE, POWERUP_SIZE);
    this.type = type;
    this.timer = POWERUP_DURATION;
  }

  update(deltaTime: number): void {
    this.animFrame += deltaTime;
    this.timer -= deltaTime;
    if (this.timer <= 0) {
      this.visible = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    drawPowerUp(ctx, this.x, this.y, this.type, this.animFrame);
  }
}
