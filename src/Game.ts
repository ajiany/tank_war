import { Tank } from './entities/Tank';
import { EnemyTank } from './entities/EnemyTank';
import { Bullet } from './entities/Bullet';
import { Input } from './systems/Input';
import { drawMapGround, drawTreeOverlay, TileTypeEnum } from './map';
import { TileType } from './map';
import { Wall } from './entities/Wall';
import { Base } from './entities/Base';
import { Entity } from './entities/Entity';
import { PowerUp } from './entities/PowerUp';
import { Collision } from './systems/Collision';
import { EnemySpawner } from './systems/EnemySpawner';
import { Effects } from './systems/Effects';
import { BuildMode } from './systems/BuildMode';
import { LEVELS } from './levels';
import {
  GAME_WIDTH, GAME_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT, SIDEBAR_WIDTH,
  TILE_SIZE, PLAYER_SPAWN_X, PLAYER_SPAWN_Y, PLAYER_SHOOT_COOLDOWN,
  PLAYER_INVINCIBLE_TIME, PLAYER_LIVES, BULLET_SPEED, COLORS,
  POWERUP_TYPES, ThemeColors, THEMES, BUILD_KILL_REWARDS,
} from './constants';

type GameState = 'menu' | 'stage_intro' | 'playing' | 'paused' | 'gameover' | 'victory';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning = false;
  private readonly MS_PER_UPDATE = 16;
  private previousTime = 0;
  private lag = 0;

  private input!: Input;
  private player!: Tank;
  private walls: Wall[] = [];
  private base!: Base;
  private bullets: Bullet[] = [];
  private powerUps: PowerUp[] = [];
  private enemySpawner!: EnemySpawner;
  private effects!: Effects;
  private buildMode!: BuildMode;

  private gameState: GameState = 'menu';
  private lives = PLAYER_LIVES;
  private score = 0;
  private shootCooldown = 0;
  private currentLevel = 0;
  private stageIntroTimer = 0;
  private gameOverScrollY = GAME_HEIGHT;
  private currentMap: TileType[][] = LEVELS[0].map;
  private currentTheme: ThemeColors = THEMES.city;
  private animFrame = 0;
  private playerBulletOnScreen = false;
  private exhaustTimer = 0;
  private prevBKey = false;

  constructor(canvasId: string = 'gameCanvas') {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas "${canvasId}" not found`);
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d')!;
    this.input = new Input();
    this.effects = new Effects();
    this.enemySpawner = new EnemySpawner();
    this.player = new Tank(PLAYER_SPAWN_X, PLAYER_SPAWN_Y, this.input);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.previousTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;
    const frameTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
    this.lag += frameTime;
    while (this.lag >= this.MS_PER_UPDATE) {
      this.update(this.MS_PER_UPDATE / 1000);
      this.lag -= this.MS_PER_UPDATE;
    }
    this.render(this.lag / this.MS_PER_UPDATE);
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(dt: number): void {
    this.animFrame += dt;
    this.effects.update(dt);

    switch (this.gameState) {
      case 'menu': this.updateMenu(); break;
      case 'stage_intro': this.updateStageIntro(dt); break;
      case 'playing': this.updatePlaying(dt); break;
      case 'paused': this.updatePaused(); break;
      case 'gameover': this.updateGameOver(dt); break;
      case 'victory':
        if (this.input.isPressed('Enter')) this.startStage(this.currentLevel + 1);
        break;
    }
  }

  private updateMenu(): void {
    if (this.input.isPressed('Enter')) {
      this.score = 0;
      this.lives = PLAYER_LIVES;
      this.startStage(0);
    }
  }

  private startStage(levelIndex: number): void {
    this.currentLevel = levelIndex % LEVELS.length;
    this.gameState = 'stage_intro';
    this.stageIntroTimer = 2;
  }

  private updateStageIntro(dt: number): void {
    this.stageIntroTimer -= dt;
    if (this.stageIntroTimer <= 0) {
      this.initLevel();
      this.gameState = 'playing';
    }
  }

  private initLevel(): void {
    const level = LEVELS[this.currentLevel];
    this.currentMap = level.map;
    this.currentTheme = THEMES[level.theme] || THEMES.city;
    this.walls = [];
    this.bullets = [];
    this.powerUps = [];
    this.playerBulletOnScreen = false;

    for (let row = 0; row < this.currentMap.length; row++) {
      for (let col = 0; col < this.currentMap[row].length; col++) {
        const tile = this.currentMap[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        if (tile === TileTypeEnum.Brick || tile === TileTypeEnum.Steel) {
          const wall = new Wall(x, y, tile);
          wall.theme = this.currentTheme;
          this.walls.push(wall);
        } else if (tile === TileTypeEnum.Base) {
          this.base = new Base(x, y);
        }
      }
    }

    this.input.destroy();
    this.input = new Input();
    this.player = new Tank(PLAYER_SPAWN_X, PLAYER_SPAWN_Y, this.input);
    this.player.invincibleTimer = PLAYER_INVINCIBLE_TIME;
    this.enemySpawner = new EnemySpawner();
    this.enemySpawner.configure(level);
    this.effects = new Effects();
    this.effects.setEnvironment(this.currentTheme.envParticleType, this.currentTheme.envParticle);
    this.buildMode = new BuildMode();
    this.gameOverScrollY = GAME_HEIGHT;
  }

  private updatePaused(): void {
    if (this.input.isPressed('Escape')) {
      this.gameState = 'playing';
    }
  }

  private updateGameOver(dt: number): void {
    if (this.gameOverScrollY > GAME_HEIGHT / 2 - 24) {
      this.gameOverScrollY -= 120 * dt;
    }
    if (this.input.isPressed('Enter')) {
      this.gameState = 'menu';
    }
  }

  private updatePlaying(dt: number): void {
    if (this.input.isPressed('Escape') && !this.buildMode.active) {
      this.gameState = 'paused';
      return;
    }

    // Toggle build mode with B (edge-triggered)
    const bPressed = this.input.isPressed('b') || this.input.isPressed('B');
    if (bPressed && !this.prevBKey) {
      this.buildMode.toggle();
      if (this.buildMode.active) {
        // Place cursor at player position
        this.buildMode.cursorRow = Math.floor((this.player.y + 16) / TILE_SIZE);
        this.buildMode.cursorCol = Math.floor((this.player.x + 16) / TILE_SIZE);
      }
    }
    this.prevBKey = bPressed;

    // Build mode: player frozen, delegate input to BuildMode
    if (this.buildMode.active) {
      this.player.velocity.x = 0;
      this.player.velocity.y = 0;

      const allEntities = [
        this.player as Entity,
        ...this.enemySpawner.getEnemies(),
      ];

      this.buildMode.update(
        dt, this.input, this.currentMap, allEntities,
        (row, col, tile) => this.onBuildPlace(row, col, tile),
        (row, col) => this.onBuildRemove(row, col),
      );
    } else {
      // Player
      this.player.update(dt);
      this.resolveWallCollisions(this.player);
      this.resolveTerrainEffects(this.player, dt);

      // Player shooting (1 bullet limit)
      if (this.shootCooldown > 0) this.shootCooldown -= dt;
      if ((this.input.isPressed('j') || this.input.isPressed('J') || this.input.isPressed(' '))
          && this.shootCooldown <= 0 && !this.playerBulletOnScreen) {
        this.playerShoot();
        this.shootCooldown = PLAYER_SHOOT_COOLDOWN;
      }
    }

    // Enemies frozen during build mode
    if (!this.buildMode.active) {
      const enemyBullets = this.enemySpawner.update(dt);
      this.bullets.push(...enemyBullets);

      for (const enemy of this.enemySpawner.getEnemies()) {
        this.resolveWallCollisions(enemy);
        this.resolveTerrainEffects(enemy, dt);
      }
    }

    // Bullets + trails (only update existing bullets during build mode)
    if (!this.buildMode.active) {
      for (const bullet of this.bullets) {
        bullet.update(dt);
        this.effects.addBulletTrail(bullet.x + 3, bullet.y + 3);
      }
      this.bullets = this.bullets.filter(b => !b.isOutOfBounds());
    }

    // Tank exhaust
    if (!this.buildMode.active) {
      this.exhaustTimer += dt;
      if (this.exhaustTimer > 0.05) {
        this.exhaustTimer = 0;
        if (this.player.velocity.x !== 0 || this.player.velocity.y !== 0) {
          this.effects.addExhaust(this.player.x + 16, this.player.y + 16, '#555555');
        }
        for (const enemy of this.enemySpawner.getEnemies()) {
          if (enemy.velocity.x !== 0 || enemy.velocity.y !== 0) {
            this.effects.addExhaust(enemy.x + 16, enemy.y + 16, '#444444');
          }
        }
      }
    }

    // Power-ups & collisions (frozen during build mode)
    if (!this.buildMode.active) {
      for (const pu of this.powerUps) {
        pu.update(dt);
        if (this.player.collidesWith(pu) && pu.visible) {
          this.collectPowerUp(pu);
        }
      }
      this.powerUps = this.powerUps.filter(p => p.visible);

      this.checkBulletCollisions();

      if (this.enemySpawner.isVictory()) {
        this.gameState = 'victory';
      }
    }
  }

  private onBuildPlace(row: number, col: number, tile: TileType): void {
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;
    // Only brick/steel become Wall entities (for collision)
    if (tile === TileTypeEnum.Brick || tile === TileTypeEnum.Steel) {
      const wall = new Wall(x, y, tile);
      wall.theme = this.currentTheme;
      this.walls.push(wall);
    }
    this.effects.addParticles(x + 16, y + 16, '#00cc00');
  }

  private onBuildRemove(row: number, col: number): boolean {
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;
    // Remove wall entity if exists
    const idx = this.walls.findIndex(w => w.x === x && w.y === y);
    if (idx !== -1) {
      this.walls.splice(idx, 1);
    }
    this.effects.addParticles(x + 16, y + 16, '#cc0000');
    return true;
  }

  // Check terrain tile under entity center
  private getTileAt(x: number, y: number): TileType {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= this.currentMap.length || col < 0 || col >= this.currentMap[0].length) {
      return 0 as TileType;
    }
    return this.currentMap[row][col];
  }

  private resolveTerrainEffects(entity: { x: number; y: number; width: number; height: number; velocity: { x: number; y: number } }, _dt: number): void {
    const cx = entity.x + entity.width / 2;
    const cy = entity.y + entity.height / 2;
    const tile = this.getTileAt(cx, cy);

    // River: push entity back (tanks can't cross)
    if (tile === TileTypeEnum.River) {
      // Undo movement by pushing back
      if (entity.velocity.x > 0) entity.x -= 2;
      if (entity.velocity.x < 0) entity.x += 2;
      if (entity.velocity.y > 0) entity.y -= 2;
      if (entity.velocity.y < 0) entity.y += 2;
    }
  }


  private resolveWallCollisions(entity: Tank | EnemyTank): void {
    for (const wall of this.walls) {
      if (entity.collidesWith(wall)) {
        Collision.resolveTankWallCollision(entity, wall);
        if (entity instanceof EnemyTank) {
          entity.onWallCollision();
        }
      }
    }
  }

  private playerShoot(): void {
    const dir = this.player.getDirection();
    let bx = this.player.x + 13;
    let by = this.player.y + 13;
    switch (dir) {
      case 'up':    by -= 16; break;
      case 'down':  by += 32; break;
      case 'left':  bx -= 16; break;
      case 'right': bx += 32; break;
    }
    const bullet = new Bullet(bx, by, 'player');
    switch (dir) {
      case 'up':    bullet.velocity.y = -BULLET_SPEED; break;
      case 'down':  bullet.velocity.y = BULLET_SPEED; break;
      case 'left':  bullet.velocity.x = -BULLET_SPEED; break;
      case 'right': bullet.velocity.x = BULLET_SPEED; break;
    }
    this.bullets.push(bullet);
    this.playerBulletOnScreen = true;
  }

  private checkBulletCollisions(): void {
    const bulletsToRemove = new Set<Bullet>();

    for (const bullet of this.bullets) {
      for (const wall of this.walls) {
        if (bullet.collidesWith(wall)) {
          bulletsToRemove.add(bullet);
          if (wall.isDestructible) {
            wall.visible = false;
            this.effects.addParticles(wall.x + 16, wall.y + 16, COLORS.brick);
          } else {
            this.effects.addParticles(wall.x + 16, wall.y + 16, COLORS.steel);
          }
          break;
        }
      }

      if (this.base && bullet.collidesWith(this.base) && !this.base.destroyed) {
        bulletsToRemove.add(bullet);
        this.base.destroyed = true;
        this.effects.addExplosion(this.base.x + 16, this.base.y + 16, true);
        this.effects.shake();
        this.gameState = 'gameover';
      }

      if (bullet.owner === 'player') {
        for (const enemy of this.enemySpawner.getEnemies()) {
          if (bullet.collidesWith(enemy)) {
            bulletsToRemove.add(bullet);
            const destroyed = enemy.takeDamage();
            if (destroyed) {
              enemy.visible = false;
              this.enemySpawner.removeEnemy(enemy);
              this.score += enemy.scoreValue;
              this.buildMode.addPoints(BUILD_KILL_REWARDS[enemy.typeName] || 1);
              this.effects.addExplosion(enemy.x + 16, enemy.y + 16, true);
              this.effects.shake();
              if (Math.random() < 0.2) {
                const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
                this.powerUps.push(new PowerUp(type));
              }
            } else {
              this.effects.addExplosion(enemy.x + 16, enemy.y + 16, false);
            }
            break;
          }
        }
      }

      if (bullet.owner === 'enemy' && bullet.collidesWith(this.player) && !this.player.isInvincible) {
        bulletsToRemove.add(bullet);
        this.lives--;
        this.effects.addExplosion(this.player.x + 16, this.player.y + 16, true);
        this.effects.shake();
        if (this.lives <= 0) {
          this.gameState = 'gameover';
        } else {
          this.player.x = PLAYER_SPAWN_X;
          this.player.y = PLAYER_SPAWN_Y;
          this.player.invincibleTimer = PLAYER_INVINCIBLE_TIME;
        }
      }
    }

    this.walls = this.walls.filter(w => w.visible);
    this.bullets = this.bullets.filter(b => !bulletsToRemove.has(b));
    this.playerBulletOnScreen = this.bullets.some(b => b.owner === 'player');
  }

  private collectPowerUp(pu: PowerUp): void {
    pu.visible = false;
    switch (pu.type) {
      case 'star': this.shootCooldown = 0; break;
      case 'bomb':
        for (const enemy of [...this.enemySpawner.getEnemies()]) {
          this.effects.addExplosion(enemy.x + 16, enemy.y + 16, true);
          this.enemySpawner.removeEnemy(enemy);
          this.score += enemy.scoreValue;
          this.buildMode.addPoints(BUILD_KILL_REWARDS[enemy.typeName] || 1);
        }
        this.effects.shake();
        break;
      case 'tank': this.lives++; break;
    }
  }

  // ── Rendering ──────────────────────────────────────────

  private render(_interpolation: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.sidebar;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    switch (this.gameState) {
      case 'menu': this.renderMenu(ctx); return;
      case 'stage_intro': this.renderStageIntro(ctx); return;
      case 'gameover': this.renderGameplay(ctx); this.renderGameOver(ctx); return;
      case 'paused': this.renderGameplay(ctx); this.renderPaused(ctx); return;
      case 'victory': this.renderGameplay(ctx); this.renderVictory(ctx); return;
      case 'playing': this.renderGameplay(ctx); return;
    }
  }

  private renderGameplay(ctx: CanvasRenderingContext2D): void {
    const shake = this.effects.getShakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    // Game area background + ground tiles (river, ice, decorations)
    drawMapGround(ctx, this.currentMap, this.currentTheme, this.animFrame);

    // Walls (dynamic - can be destroyed)
    for (const wall of this.walls) {
      wall.draw(ctx);
    }

    // Base
    if (this.base) this.base.draw(ctx);

    // Power-ups
    for (const pu of this.powerUps) {
      pu.draw(ctx);
    }

    // Player
    this.player.draw(ctx);

    // Enemies
    for (const enemy of this.enemySpawner.getEnemies()) {
      enemy.draw(ctx);
    }

    // Bullets
    for (const bullet of this.bullets) {
      bullet.draw(ctx);
    }

    // Effects (explosions, particles, trails)
    this.effects.draw(ctx);

    // Tree overlay (drawn ABOVE tanks for hiding effect)
    drawTreeOverlay(ctx, this.currentMap, this.currentTheme);

    // Environment particles (snow, leaves, dust)
    this.effects.drawEnvironment(ctx);

    // Build mode overlay (grid + cursor)
    this.buildMode.draw(ctx, this.currentMap, [this.player, ...this.enemySpawner.getEnemies()], this.animFrame, this.currentTheme);

    ctx.restore();

    // Sidebar
    this.renderSidebar(ctx);
  }

  private renderSidebar(ctx: CanvasRenderingContext2D): void {
    const sx = GAME_WIDTH + 4;
    ctx.fillStyle = COLORS.sidebar;
    ctx.fillRect(GAME_WIDTH, 0, SIDEBAR_WIDTH, CANVAS_HEIGHT);

    // Border line
    ctx.fillStyle = '#444444';
    ctx.fillRect(GAME_WIDTH, 0, 2, CANVAS_HEIGHT);

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    // Enemy icons remaining
    ctx.fillStyle = COLORS.text;
    ctx.fillText('ENEMY', sx + 8, 16);
    const remaining = this.enemySpawner.getRemainingCount();
    for (let i = 0; i < remaining; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      ctx.fillStyle = '#dc143c';
      ctx.fillRect(sx + 8 + col * 16, 24 + row * 16, 12, 12);
    }

    // Player info
    const infoY = 280;
    ctx.fillStyle = COLORS.textGold;
    ctx.font = '10px monospace';
    ctx.fillText('1P', sx + 8, infoY);

    // Lives icons
    ctx.fillStyle = COLORS.playerTank;
    for (let i = 0; i < this.lives; i++) {
      ctx.fillRect(sx + 8 + i * 16, infoY + 6, 12, 12);
    }

    // Score
    ctx.fillStyle = COLORS.text;
    ctx.fillText(String(this.score), sx + 8, infoY + 34);

    // Stage number
    ctx.fillStyle = COLORS.text;
    ctx.fillText('STAGE', sx + 8, CANVAS_HEIGHT - 30);
    ctx.font = '16px monospace';
    ctx.fillText(String(this.currentLevel + 1), sx + 30, CANVAS_HEIGHT - 10);

    // Build mode sidebar info
    this.buildMode.drawSidebar(ctx, sx);

    // Always show build points (even outside build mode)
    if (!this.buildMode.active) {
      ctx.fillStyle = '#888888';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('BP:' + this.buildMode.points, sx + 8, 200);
    }
  }

  private renderMenu(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = COLORS.textGold;
    ctx.font = '32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TANK', GAME_WIDTH / 2, 120);
    ctx.fillText('WAR', GAME_WIDTH / 2, 160);

    // Decorative line
    ctx.fillStyle = COLORS.textGold;
    ctx.fillRect(GAME_WIDTH / 2 - 80, 175, 160, 2);

    // Menu options
    ctx.fillStyle = COLORS.text;
    ctx.font = '14px monospace';
    ctx.fillText('1 PLAYER', GAME_WIDTH / 2, 220);

    // Tank cursor
    ctx.fillStyle = COLORS.playerTank;
    ctx.fillRect(GAME_WIDTH / 2 - 70, 212, 10, 10);

    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.fillText('PRESS ENTER', GAME_WIDTH / 2, 300);

    // Controls hint
    ctx.fillStyle = '#666666';
    ctx.font = '10px monospace';
    ctx.fillText('WASD: MOVE  J/SPACE: FIRE', GAME_WIDTH / 2, 370);
    ctx.fillText('B: BUILD  ESC: PAUSE', GAME_WIDTH / 2, 386);
  }

  private renderStageIntro(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS.sidebar;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = COLORS.text;
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STAGE ' + (this.currentLevel + 1), GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);

    const level = LEVELS[this.currentLevel];
    const themeNames: Record<string, string> = { city: 'CITY', forest: 'FOREST', snow: 'SNOWFIELD' };
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText(themeNames[level.theme] || '', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16);
  }

  private renderPaused(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = COLORS.text;
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSE', GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }

  private renderGameOver(ctx: CanvasRenderingContext2D): void {
    // Classic scrolling GAME OVER text
    ctx.fillStyle = '#cc0000';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME', GAME_WIDTH / 2, this.gameOverScrollY);
    ctx.fillText('OVER', GAME_WIDTH / 2, this.gameOverScrollY + 28);

    if (this.gameOverScrollY <= GAME_HEIGHT / 2 - 24) {
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px monospace';
      ctx.fillText('SCORE: ' + this.score, GAME_WIDTH / 2, this.gameOverScrollY + 70);
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      ctx.fillText('PRESS ENTER', GAME_WIDTH / 2, this.gameOverScrollY + 100);
    }
  }

  private renderVictory(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = COLORS.textGold;
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STAGE CLEAR!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);

    ctx.fillStyle = COLORS.text;
    ctx.font = '12px monospace';
    ctx.fillText('SCORE: ' + this.score, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);

    const nextText = this.currentLevel < LEVELS.length - 1 ? 'NEXT STAGE' : 'PLAY AGAIN';
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.fillText('PRESS ENTER - ' + nextText, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
  }
}