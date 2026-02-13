import { Velocity } from '../types';

export class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: Velocity;
  visible: boolean;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = { x: 0, y: 0 };
    this.visible = true;
  }

  update(deltaTime: number): void {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
  }

  collidesWith(other: Entity): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
