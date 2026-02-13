export class Input {
  private keys: Set<string> = new Set();
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
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

  destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.keys.clear();
  }
}
