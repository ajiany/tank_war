import { Entity } from './Entity';
import { Direction } from '../types';
import { Input } from '../systems/Input';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, TILE_SIZE, COLORS } from '../constants';
import { drawTank, drawShield } from '../rendering/PixelSprites';

export class Tank extends Entity {
  protected direction: Direction = 'up';
  protected speed: number = PLAYER_SPEED;
  protected bodyColor: string = COLORS.playerTank;
  protected darkColor: string = COLORS.playerTankDark;
  protected input: Input;
  invincibleTimer = 0;
  private animFrame = 0;

  constructor(x: number, y: number, input: Input) {
    super(x, y, 32, 32);
    this.input = input;
  }

  update(deltaTime: number): void {
    this.animFrame += deltaTime;
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= deltaTime;
    }
    this.handleInput();
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
    this.snapToHalfGrid();
    this.checkBoundaries();
  }

  private handleInput(): void {
    if (this.input.isPressed('w') || this.input.isPressed('W')) {
      this.direction = 'up';
      this.velocity.x = 0;
      this.velocity.y = -this.speed;
    } else if (this.input.isPressed('s') || this.input.isPressed('S')) {
      this.direction = 'down';
      this.velocity.x = 0;
      this.velocity.y = this.speed;
    } else if (this.input.isPressed('a') || this.input.isPressed('A')) {
      this.direction = 'left';
      this.velocity.x = -this.speed;
      this.velocity.y = 0;
    } else if (this.input.isPressed('d') || this.input.isPressed('D')) {
      this.direction = 'right';
      this.velocity.x = this.speed;
      this.velocity.y = 0;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  // Snap perpendicular axis to half-grid for smoother corridor navigation
  private snapToHalfGrid(): void {
    const half = TILE_SIZE / 2;
    if (this.velocity.x !== 0) {
      this.y = Math.round(this.y / half) * half;
    } else if (this.velocity.y !== 0) {
      this.x = Math.round(this.x / half) * half;
    }
  }

  private checkBoundaries(): void {
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > GAME_WIDTH) this.x = GAME_WIDTH - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > GAME_HEIGHT) this.y = GAME_HEIGHT - this.height;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    if (this.invincibleTimer > 0 && Math.floor(this.animFrame * 10) % 2 === 0) return;

    drawTank(ctx, this.x, this.y, this.direction, this.bodyColor, this.darkColor);

    if (this.invincibleTimer > 0) {
      drawShield(ctx, this.x, this.y, this.animFrame);
    }
  }

  drawAtPosition(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.visible) return;
    if (this.invincibleTimer > 0 && Math.floor(this.animFrame * 10) % 2 === 0) return;

    drawTank(ctx, x, y, this.direction, this.bodyColor, this.darkColor);

    if (this.invincibleTimer > 0) {
      drawShield(ctx, x, y, this.animFrame);
    }
  }

  getDirection(): Direction {
    return this.direction;
  }

  get isInvincible(): boolean {
    return this.invincibleTimer > 0;
  }
}
