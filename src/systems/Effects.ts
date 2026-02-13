import { COLORS, EXPLOSION_DURATION, PARTICLE_COUNT, SCREEN_SHAKE_DURATION, SCREEN_SHAKE_INTENSITY, GAME_WIDTH, GAME_HEIGHT } from '../constants';

interface Explosion {
  x: number;
  y: number;
  timer: number;
  size: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface EnvParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

export class Effects {
  private explosions: Explosion[] = [];
  private particles: Particle[] = [];
  private envParticles: EnvParticle[] = [];
  private shakeTimer = 0;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;
  private envTimer = 0;
  private envType: 'none' | 'leaves' | 'snow' | 'dust' = 'none';
  private envColor = '#ffffff';

  setEnvironment(type: 'none' | 'leaves' | 'snow' | 'dust', color: string): void {
    this.envType = type;
    this.envColor = color;
  }

  addExplosion(x: number, y: number, big = false): void {
    this.explosions.push({ x, y, timer: EXPLOSION_DURATION, size: big ? 48 : 32 });
  }

  addParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
      const speed = 60 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.2,
        color,
        size: 3,
      });
    }
  }

  // Bullet trail - small fading dots behind bullet
  addBulletTrail(x: number, y: number): void {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 2,
      y: y + (Math.random() - 0.5) * 2,
      vx: 0, vy: 0,
      life: 0.12,
      color: '#ffcc00',
      size: 2,
    });
  }

  // Tank exhaust - small puff behind moving tank
  addExhaust(x: number, y: number, color: string): void {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 0.2 + Math.random() * 0.15,
      color,
      size: 2,
    });
  }

  shake(): void {
    this.shakeTimer = SCREEN_SHAKE_DURATION;
  }

  getShakeOffset(): { x: number; y: number } {
    return { x: this.shakeOffsetX, y: this.shakeOffsetY };
  }

  update(dt: number): void {
    // Explosions
    this.explosions = this.explosions.filter(e => {
      e.timer -= dt;
      return e.timer > 0;
    });

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      return p.life > 0;
    });

    // Screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      this.shakeOffsetX = (Math.random() - 0.5) * SCREEN_SHAKE_INTENSITY * 2;
      this.shakeOffsetY = (Math.random() - 0.5) * SCREEN_SHAKE_INTENSITY * 2;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Environment particles
    if (this.envType !== 'none') {
      this.envTimer += dt;
      const spawnRate = this.envType === 'snow' ? 0.03 : 0.06;
      if (this.envTimer > spawnRate) {
        this.envTimer = 0;
        this.spawnEnvParticle();
      }
    }

    this.envParticles = this.envParticles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotSpeed * dt;
      p.life -= dt;
      return p.life > 0 && p.y < GAME_HEIGHT + 10;
    });
  }

  private spawnEnvParticle(): void {
    const x = Math.random() * GAME_WIDTH;
    let vx = 0, vy = 0, size = 2, life = 4, rotSpeed = 0;

    switch (this.envType) {
      case 'snow':
        vx = (Math.random() - 0.5) * 15;
        vy = 20 + Math.random() * 20;
        size = 1 + Math.random() * 2;
        life = 6 + Math.random() * 3;
        break;
      case 'leaves':
        vx = 10 + Math.random() * 20;
        vy = 15 + Math.random() * 25;
        size = 2 + Math.random() * 2;
        life = 5 + Math.random() * 3;
        rotSpeed = 2 + Math.random() * 3;
        break;
      case 'dust':
        vx = (Math.random() - 0.5) * 10;
        vy = 5 + Math.random() * 10;
        size = 1;
        life = 3 + Math.random() * 2;
        break;
    }

    this.envParticles.push({
      x, y: -5,
      vx, vy,
      life, maxLife: life,
      size, color: this.envColor,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed,
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Explosions
    for (const exp of this.explosions) {
      const progress = 1 - exp.timer / EXPLOSION_DURATION;
      const frame = Math.floor(progress * 4);
      const colors = [COLORS.explosion1, COLORS.explosion2, COLORS.explosion3, COLORS.explosion4];
      const color = colors[Math.min(frame, 3)];
      const radius = exp.size * (0.3 + progress * 0.7);

      ctx.fillStyle = color;
      ctx.globalAlpha = 1 - progress * 0.5;

      const half = radius / 2;
      ctx.fillRect(exp.x - half, exp.y - radius / 3, radius, radius * 0.66);
      ctx.fillRect(exp.x - radius / 3, exp.y - half, radius * 0.66, radius);

      const q = radius * 0.25;
      ctx.fillRect(exp.x - half + q, exp.y - half + q, q, q);
      ctx.fillRect(exp.x + half - q * 2, exp.y - half + q, q, q);
      ctx.fillRect(exp.x - half + q, exp.y + half - q * 2, q, q);
      ctx.fillRect(exp.x + half - q * 2, exp.y + half - q * 2, q, q);

      ctx.globalAlpha = 1;
    }

    // Regular particles (debris, trails, exhaust)
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.min(1, p.life * 4);
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  drawEnvironment(ctx: CanvasRenderingContext2D): void {
    for (const p of this.envParticles) {
      const alpha = Math.min(1, p.life / p.maxLife * 2, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.6;

      if (this.envType === 'leaves') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -1, p.size, 2);
        ctx.restore();
      } else {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  hasActiveEffects(): boolean {
    return this.explosions.length > 0 || this.particles.length > 0;
  }
}
