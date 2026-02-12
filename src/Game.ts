export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning = false;

  private readonly MS_PER_UPDATE = 16;
  private previousTime = 0;
  private lag = 0;
  private frameCount = 0;

  constructor(canvasId: string = 'gameCanvas') {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    this.ctx = this.canvas.getContext('2d')!;
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
  }

  start(): void {
    if (this.isRunning) {
      console.warn('Game is already running');
      return;
    }
    this.isRunning = true;
    this.previousTime = performance.now();
    console.log('Game started');
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  stop(): void {
    this.isRunning = false;
    console.log('Game stopped');
  }

  private gameLoop(currentTime: number): void {
    if (!this.isRunning) {
      return;
    }

    const frameTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
    this.lag += frameTime;

    while (this.lag >= this.MS_PER_UPDATE) {
      this.update(this.MS_PER_UPDATE / 1000);
      this.lag -= this.MS_PER_UPDATE;
    }

    this.render(this.lag / this.MS_PER_UPDATE);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    this.frameCount++;

    if (this.frameCount % 60 === 0) {
      console.log(`Game update: frame ${this.frameCount}, dt=${deltaTime.toFixed(3)}s`);
    }
  }

  private render(interpolation: number): void {
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
