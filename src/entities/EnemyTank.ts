import { Entity } from './Entity';
import { Direction } from '../types';
import { Bullet } from './Bullet';
import { ENEMY_TYPES, EnemyTypeName, GAME_WIDTH, GAME_HEIGHT, BULLET_SPEED, COLORS } from '../constants';
import { drawTank, drawShield } from '../rendering/PixelSprites';

export class EnemyTank extends Entity {
  direction: Direction = 'down';
  private speed: number;
  private bodyColor: string;
  private darkColor: string;
  hp: number;
  readonly typeName: EnemyTypeName;
  readonly scoreValue: number;

  private directionTimer = 0;
  private shootTimer = 0;
  private shootCooldown = 0;
  private spawnShieldTimer = 1;
  private animFrame = 0;
  private pendingBullet: Bullet | null = null;

  constructor(x: number, y: number, typeName: EnemyTypeName = 'normal') {
    super(x, y, 32, 32);
    this.typeName = typeName;
    const config = ENEMY_TYPES[typeName];
    this.speed = config.speed;
    this.hp = config.hp;
    this.scoreValue = config.score;

    const colorMap: Record<EnemyTypeName, { body: string; dark: string }> = {
      normal: { body: COLORS.enemyNormal, dark: COLORS.enemyNormalDark },
      fast: { body: COLORS.enemyFast, dark: COLORS.enemyFastDark },
      armor: { body: COLORS.enemyArmor, dark: COLORS.enemyArmorDark },
    };
    this.bodyColor = colorMap[typeName].body;
    this.darkColor = colorMap[typeName].dark;

    this.directionTimer = 1 + Math.random() * 2;
    this.shootTimer = 1 + Math.random() * 2;
  }

  update(deltaTime: number): void {
    this.animFrame += deltaTime;
    this.pendingBullet = null;

    if (this.spawnShieldTimer > 0) {
      this.spawnShieldTimer -= deltaTime;
    }

    this.updateAI(deltaTime);
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
    this.checkBoundaries();

    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }
  }

  private updateAI(deltaTime: number): void {
    this.directionTimer -= deltaTime;
    this.shootTimer -= deltaTime;

    if (this.directionTimer <= 0) {
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      // 40% chance to go down (toward base)
      this.direction = Math.random() < 0.4
        ? 'down'
        : directions[Math.floor(Math.random() * 4)];
      this.directionTimer = 1 + Math.random() * 2;
    }

    switch (this.direction) {
      case 'up':    this.velocity.x = 0; this.velocity.y = -this.speed; break;
      case 'down':  this.velocity.x = 0; this.velocity.y = this.speed; break;
      case 'left':  this.velocity.x = -this.speed; this.velocity.y = 0; break;
      case 'right': this.velocity.x = this.speed; this.velocity.y = 0; break;
    }

    if (this.shootTimer <= 0 && this.shootCooldown <= 0) {
      this.fireShot();
      this.shootTimer = 1.5 + Math.random() * 2;
    }
  }

  private fireShot(): void {
    this.shootCooldown = 0.8;
    let bx = this.x + 13;
    let by = this.y + 13;

    switch (this.direction) {
      case 'up':    by -= 16; break;
      case 'down':  by += 32; break;
      case 'left':  bx -= 16; break;
      case 'right': bx += 32; break;
    }

    const bullet = new Bullet(bx, by, 'enemy');
    switch (this.direction) {
      case 'up':    bullet.velocity.y = -BULLET_SPEED; break;
      case 'down':  bullet.velocity.y = BULLET_SPEED; break;
      case 'left':  bullet.velocity.x = -BULLET_SPEED; break;
      case 'right': bullet.velocity.x = BULLET_SPEED; break;
    }
    this.pendingBullet = bullet;
  }

  getPendingBullet(): Bullet | null {
    const b = this.pendingBullet;
    this.pendingBullet = null;
    return b;
  }

  takeDamage(): boolean {
    this.hp--;
    return this.hp <= 0;
  }

  onWallCollision(): void {
    // Change direction when hitting a wall
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    this.direction = directions[Math.floor(Math.random() * 4)];
    this.directionTimer = 1 + Math.random() * 2;
  }

  private checkBoundaries(): void {
    if (this.x < 0) { this.x = 0; this.onWallCollision(); }
    if (this.x + this.width > GAME_WIDTH) { this.x = GAME_WIDTH - this.width; this.onWallCollision(); }
    if (this.y < 0) { this.y = 0; this.onWallCollision(); }
    if (this.y + this.height > GAME_HEIGHT) { this.y = GAME_HEIGHT - this.height; this.onWallCollision(); }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    drawTank(ctx, this.x, this.y, this.direction, this.bodyColor, this.darkColor);

    if (this.spawnShieldTimer > 0) {
      drawShield(ctx, this.x, this.y, this.animFrame);
    }

    // HP indicator for armored tanks
    if (this.typeName === 'armor' && this.hp > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(this.hp), this.x + 16, this.y - 2);
    }
  }

  getDirection(): Direction {
    return this.direction;
  }
}
