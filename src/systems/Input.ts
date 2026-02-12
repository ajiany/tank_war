export class Input {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keys.add(event.key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.key);
  }

  isPressed(key: string): boolean {
    return this.keys.has(key);
  }
}
