import { EnemyTank } from '../entities/EnemyTank';
import { Bullet } from '../entities/Bullet';
import { EnemyTypeName, SPAWN_POINTS_X, MAX_ENEMIES_ON_SCREEN } from '../constants';
import { LevelConfig } from '../levels';

export class EnemySpawner {
  private spawnedCount = 0;
  private destroyedCount = 0;
  private enemies: EnemyTank[] = [];
  private spawnTimer = 0;
  private totalEnemies = 20;
  private spawnInterval = 3;
  private enemyQueue: EnemyTypeName[] = [];

  configure(level: LevelConfig): void {
    this.enemyQueue = [];
    for (const entry of level.enemies) {
      for (let i = 0; i < entry.count; i++) {
        this.enemyQueue.push(entry.type);
      }
    }
    // Shuffle the queue
    for (let i = this.enemyQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.enemyQueue[i], this.enemyQueue[j]] = [this.enemyQueue[j], this.enemyQueue[i]];
    }
    this.totalEnemies = this.enemyQueue.length;
    this.spawnInterval = level.spawnInterval;
    this.spawnedCount = 0;
    this.destroyedCount = 0;
    this.enemies = [];
    this.spawnTimer = 0;
  }

  update(deltaTime: number): Bullet[] {
    this.spawnTimer -= deltaTime;
    const newBullets: Bullet[] = [];

    if (this.spawnedCount < this.totalEnemies
        && this.enemies.length < MAX_ENEMIES_ON_SCREEN
        && this.spawnTimer <= 0) {
      const x = SPAWN_POINTS_X[Math.floor(Math.random() * SPAWN_POINTS_X.length)];
      const typeName = this.enemyQueue[this.spawnedCount] || 'normal';
      const enemy = new EnemyTank(x, 0, typeName);
      this.enemies.push(enemy);
      this.spawnedCount++;
      this.spawnTimer = this.spawnInterval;
    }

    // Update all enemies and collect their bullets
    for (const enemy of this.enemies) {
      enemy.update(deltaTime);
      const bullet = enemy.getPendingBullet();
      if (bullet) {
        newBullets.push(bullet);
      }
    }

    return newBullets;
  }

  getEnemies(): EnemyTank[] {
    return this.enemies;
  }

  removeEnemy(enemy: EnemyTank): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
      this.destroyedCount++;
    }
  }

  getDestroyedCount(): number {
    return this.destroyedCount;
  }

  getRemainingCount(): number {
    return this.totalEnemies - this.spawnedCount + this.enemies.length;
  }

  getTotalEnemies(): number {
    return this.totalEnemies;
  }

  isVictory(): boolean {
    return this.destroyedCount >= this.totalEnemies;
  }
}
