import { Entity } from '../entities/Entity';
import { Tank } from '../entities/Tank';
import { Bullet } from '../entities/Bullet';
import { Wall } from '../entities/Wall';
import { Base } from '../entities/Base';

export class Collision {
  static checkTankWall(tank: Tank, walls: Wall[]): boolean {
    for (const wall of walls) {
      if (tank.collidesWith(wall)) {
        return true;
      }
    }
    return false;
  }

  static checkBulletWall(bullet: Bullet, walls: Wall[]): Wall | null {
    for (const wall of walls) {
      if (bullet.collidesWith(wall)) {
        return wall;
      }
    }
    return null;
  }

  static checkBulletTank(bullet: Bullet, tank: Tank): boolean {
    return bullet.collidesWith(tank) && bullet.owner !== 'player';
  }

  static checkBulletBase(bullet: Bullet, base: Base): boolean {
    return bullet.collidesWith(base);
  }

  static resolveTankWallCollision(tank: Entity, wall: Entity): void {
    const overlapX = Math.min(tank.x + tank.width, wall.x + wall.width) - Math.max(tank.x, wall.x);
    const overlapY = Math.min(tank.y + tank.height, wall.y + wall.height) - Math.max(tank.y, wall.y);

    if (overlapX < overlapY) {
      if (tank.x < wall.x) {
        tank.x -= overlapX;
      } else {
        tank.x += overlapX;
      }
    } else {
      if (tank.y < wall.y) {
        tank.y -= overlapY;
      } else {
        tank.y += overlapY;
      }
    }
  }
}
