import { GAME_TYPES } from "./constants";

// Base Game class that specific game implementations will extend
export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  isRunning: boolean;
  score: number;
  animationFrameId: number | null;
  onScoreChange: (score: number) => void;
  onGameOver: (score: number) => void;
  keys: { [key: string]: boolean };
  
  constructor(canvas: HTMLCanvasElement, onScoreChange: (score: number) => void, onGameOver: (score: number) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.isRunning = false;
    this.score = 0;
    this.animationFrameId = null;
    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;
    this.keys = {};
    
    // Setup key listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Setup touch listeners for mobile
    this.setupTouchControls();
  }
  
  handleKeyDown(e: KeyboardEvent) {
    this.keys[e.code] = true;
    
    // Prevent default behavior for game control keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  }
  
  handleKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
  }
  
  setupTouchControls() {
    // To be implemented by specific games
  }
  
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.gameLoop();
    }
  }
  
  pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.gameLoop();
    }
  }
  
  reset() {
    this.score = 0;
    this.onScoreChange(this.score);
    // Other reset logic to be implemented by specific games
  }
  
  gameLoop() {
    if (!this.isRunning) return;
    
    this.update();
    this.render();
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  update() {
    // To be implemented by specific games
  }
  
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Rendering to be implemented by specific games
  }
  
  updateScore(points: number) {
    this.score += points;
    this.onScoreChange(this.score);
  }
  
  gameOver() {
    this.pause();
    this.onGameOver(this.score);
  }
  
  cleanup() {
    this.pause();
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    // Cleanup any touch listeners
  }
}

// Factory function to create the appropriate game based on type
export const createGame = (
  gameType: string, 
  canvas: HTMLCanvasElement, 
  onScoreChange: (score: number) => void, 
  onGameOver: (score: number) => void
): Game | null => {
  // The actual game implementations will be imported and instantiated
  // in the game components
  return null;
};
