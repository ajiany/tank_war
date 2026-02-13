import { Entity } from './Entity';
import { BULLET_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { drawBullet } from '../rendering/PixelSprites';

export class Bullet extends Entity {
  owner: 'player' | 'enemy';

  constructor(x: number, y: number, owner: 'player' | 'enemy') {
    super(x, y, BULLET_SIZE, BULLET_SIZE);
    this.owner = owner;
  }

  update(deltaTime: number): void {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
  }

  isOutOfBounds(): boolean {
    return this.x < 0 || this.x > GAME_WIDTH || this.y < 0 || this.y > GAME_HEIGHT;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    drawBullet(ctx, this.x, this.y);
  }
}
