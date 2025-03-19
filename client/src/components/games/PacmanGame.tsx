import { useEffect, useRef } from 'react';
import { Game } from '@/lib/gameEngine';
import { GameParameters } from '@shared/schema';

interface PacmanGameProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasSize: { width: number; height: number };
  isPaused: boolean;
  isMuted: boolean;
  onScoreChange: (score: number) => void;
  onGameOver: (score: number) => void;
  parameters: GameParameters;
}

class PacmanGameEngine extends Game {
  pacman: {
    x: number;
    y: number;
    radius: number;
    speed: number;
    direction: { x: number; y: number };
    mouthOpen: number;
    mouthDir: number;
  };
  
  ghosts: {
    x: number;
    y: number;
    radius: number;
    speed: number;
    direction: { x: number; y: number };
    color: string;
  }[];
  
  dots: { x: number; y: number; size: number; isEaten: boolean }[];
  powerPellets: { x: number; y: number; size: number; isEaten: boolean }[];
  walls: { x: number; y: number; width: number; height: number }[];
  frightened: boolean;
  frightenedTimer: number;
  parameters: GameParameters;

  constructor(
    canvas: HTMLCanvasElement, 
    onScoreChange: (score: number) => void, 
    onGameOver: (score: number) => void,
    parameters: GameParameters
  ) {
    super(canvas, onScoreChange, onGameOver);
    this.parameters = parameters;
    
    // Apply parameters to game
    const { difficulty, speedMultiplier, enemyCount, specialFeatures, customColors } = this.parameters;
    
    // Adjust speed based on difficulty and speedMultiplier
    const baseSpeed = 2;
    const difficultyMultiplier = {
      'easy': 0.8,
      'medium': 1.0,
      'hard': 1.2,
      'expert': 1.5
    }[difficulty] || 1.0;
    
    const finalSpeed = baseSpeed * difficultyMultiplier * speedMultiplier;
    
    // Initialize player with parameters
    this.pacman = {
      x: this.width / 4,
      y: this.height / 2,
      radius: 12,
      speed: finalSpeed,
      direction: { x: 1, y: 0 }, // Start moving right
      mouthOpen: 0.2,
      mouthDir: 1
    };
    
    // Create ghosts based on enemyCount parameter
    this.ghosts = [];
    const ghostColors = ['#FF5454', '#FFB8FF', '#00FFFF', '#FFB851', '#50FF50'];
    const ghostCount = Math.min(Math.max(enemyCount, 1), 5); // Ensure between 1 and 5 ghosts
    
    for (let i = 0; i < ghostCount; i++) {
      // Position ghosts evenly around the right side of the screen
      const yPos = this.height * ((i + 1) / (ghostCount + 1));
      
      // Adjust ghost speed based on difficulty
      const ghostSpeed = (1.0 + (i * 0.1)) * difficultyMultiplier * speedMultiplier;
      
      this.ghosts.push({
        x: this.width * 0.75,
        y: yPos,
        radius: 10,
        speed: ghostSpeed,
        direction: { x: -1, y: 0 },
        color: customColors?.enemy || ghostColors[i % ghostColors.length]
      });
    }
    
    // Initialize dots array
    this.dots = [];
    
    // Power pellets in corners (initialize before generateDots)
    this.powerPellets = [
      { x: 40, y: 40, size: 6, isEaten: false },
      { x: this.width - 40, y: 40, size: 6, isEaten: false },
      { x: 40, y: this.height - 40, size: 6, isEaten: false },
      { x: this.width - 40, y: this.height - 40, size: 6, isEaten: false }
    ];
    
    // Now generate dots after powerPellets are initialized
    this.generateDots();
    
    // Create some walls
    this.walls = [];
    this.generateWalls();
    
    // Frightened mode (after eating power pellet)
    this.frightened = false;
    this.frightenedTimer = 0;
  }
  
  // Create a seeded random function using the layoutSeed parameter
  seededRandom(min = 0, max = 1) {
    // Simple seeded random function using a linear congruential generator
    this.parameters.layoutSeed = (this.parameters.layoutSeed * 9301 + 49297) % 233280;
    const rnd = this.parameters.layoutSeed / 233280;
    return min + rnd * (max - min);
  }

  generateDots() {
    this.dots = [];
    const dotSpacing = 20;
    const dotDensity = this.parameters.difficulty === 'easy' ? 0.7 : 
                       this.parameters.difficulty === 'medium' ? 0.6 : 
                       this.parameters.difficulty === 'hard' ? 0.5 : 0.4;
    
    // Always ensure a minimum path is available near pacman start position
    const safeZoneX = this.width / 4;
    const safeZoneY = this.height / 2;
    const safeRadius = 60;
    
    for (let y = 20; y < this.height; y += dotSpacing) {
      for (let x = 20; x < this.width; x += dotSpacing) {
        // Skip dots where power pellets will be
        const isClear = !this.powerPellets.some(pellet => 
          Math.abs(x - pellet.x) < 20 && Math.abs(y - pellet.y) < 20
        );
        
        // Add more dots in easier difficulties, fewer in harder ones
        if (this.seededRandom() > (1 - dotDensity) && isClear) {
          this.dots.push({ x, y, size: 2, isEaten: false });
        }
      }
    }
    
    // Ensure minimum number of dots to make game playable
    if (this.dots.length < 20) {
      for (let i = this.dots.length; i < 20; i++) {
        const x = 20 + Math.floor(this.seededRandom(0, (this.width - 40) / dotSpacing)) * dotSpacing;
        const y = 20 + Math.floor(this.seededRandom(0, (this.height - 40) / dotSpacing)) * dotSpacing;
        this.dots.push({ x, y, size: 2, isEaten: false });
      }
    }
  }
  
  generateWalls() {
    this.walls = [];
    
    // Adjust wall density based on difficulty
    const wallDensity = this.parameters.difficulty === 'easy' ? 0.3 : 
                       this.parameters.difficulty === 'medium' ? 0.4 : 
                       this.parameters.difficulty === 'hard' ? 0.5 : 0.6;
    
    // Define a safe zone around the starting position
    const safeZoneX = this.width / 4;
    const safeZoneY = this.height / 2;
    const safeRadius = 60;
    
    // Generate horizontal walls
    for (let y = 60; y < this.height; y += 60) {
      for (let x = 0; x < this.width; x += 80) {
        // Skip walls near player start position
        const distToPlayer = Math.sqrt((x - safeZoneX)**2 + (y - safeZoneY)**2);
        
        if (this.seededRandom() < wallDensity && distToPlayer > safeRadius) {
          // Make sure walls don't completely block paths
          const wallWidth = Math.min(60, this.width - x - 20);
          if (wallWidth > 10) { // Only add if wall has meaningful size
            this.walls.push({ x, y, width: wallWidth, height: 10 });
          }
        }
      }
    }
    
    // Generate vertical walls
    for (let x = 60; x < this.width; x += 60) {
      for (let y = 0; y < this.height; y += 80) {
        // Skip walls near player start position
        const distToPlayer = Math.sqrt((x - safeZoneX)**2 + (y - safeZoneY)**2);
        
        if (this.seededRandom() < wallDensity && distToPlayer > safeRadius) {
          // Make sure walls don't completely block paths
          const wallHeight = Math.min(60, this.height - y - 20);
          if (wallHeight > 10) { // Only add if wall has meaningful size
            this.walls.push({ x, y, width: 10, height: wallHeight });
          }
        }
      }
    }
    
    // Ensure there are some walls for gameplay
    if (this.walls.length < 5) {
      // Add some guaranteed walls away from player start
      for (let i = 0; i < 5; i++) {
        const wallX = this.seededRandom() < 0.5 ? this.width * 0.1 : this.width * 0.8;
        const wallY = this.height * (0.2 + (i * 0.15));
        this.walls.push({ x: wallX, y: wallY, width: 60, height: 10 });
      }
    }
  }
  
  setupTouchControls() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = touch.clientX - rect.left;
      const canvasY = touch.clientY - rect.top;
      
      // Calculate direction based on touch position relative to pacman
      const touchDirection = {
        x: canvasX - this.pacman.x,
        y: canvasY - this.pacman.y
      };
      
      // Determine dominant direction (x or y)
      if (Math.abs(touchDirection.x) > Math.abs(touchDirection.y)) {
        this.pacman.direction = { 
          x: touchDirection.x > 0 ? 1 : -1, 
          y: 0 
        };
      } else {
        this.pacman.direction = { 
          x: 0, 
          y: touchDirection.y > 0 ? 1 : -1 
        };
      }
    });
  }
  
  update() {
    if (!this.isRunning) return;
    
    // Update mouth animation
    this.pacman.mouthOpen += 0.05 * this.pacman.mouthDir;
    if (this.pacman.mouthOpen > 0.8 || this.pacman.mouthOpen < 0.05) {
      this.pacman.mouthDir *= -1;
    }
    
    // Handle keyboard input for pacman movement
    if (this.keys['ArrowUp']) {
      this.pacman.direction = { x: 0, y: -1 };
    } else if (this.keys['ArrowDown']) {
      this.pacman.direction = { x: 0, y: 1 };
    } else if (this.keys['ArrowLeft']) {
      this.pacman.direction = { x: -1, y: 0 };
    } else if (this.keys['ArrowRight']) {
      this.pacman.direction = { x: 1, y: 0 };
    }
    
    // Update pacman position
    const newX = this.pacman.x + this.pacman.direction.x * this.pacman.speed;
    const newY = this.pacman.y + this.pacman.direction.y * this.pacman.speed;
    
    // Check wall collisions
    let hitWall = false;
    for (const wall of this.walls) {
      if (this.checkCollision(
        { x: newX, y: newY, radius: this.pacman.radius },
        { x: wall.x, y: wall.y, width: wall.width, height: wall.height }
      )) {
        hitWall = true;
        break;
      }
    }
    
    // Only update position if not hitting a wall
    if (!hitWall) {
      this.pacman.x = newX;
      this.pacman.y = newY;
    }
    
    // Wrap around edges
    if (this.pacman.x < -this.pacman.radius) this.pacman.x = this.width + this.pacman.radius;
    if (this.pacman.x > this.width + this.pacman.radius) this.pacman.x = -this.pacman.radius;
    if (this.pacman.y < -this.pacman.radius) this.pacman.y = this.height + this.pacman.radius;
    if (this.pacman.y > this.height + this.pacman.radius) this.pacman.y = -this.pacman.radius;
    
    // Check dot collisions
    for (const dot of this.dots) {
      if (!dot.isEaten && this.distance(this.pacman.x, this.pacman.y, dot.x, dot.y) < this.pacman.radius) {
        dot.isEaten = true;
        this.updateScore(10);
      }
    }
    
    // Check power pellet collisions
    for (const pellet of this.powerPellets) {
      if (!pellet.isEaten && this.distance(this.pacman.x, this.pacman.y, pellet.x, pellet.y) < this.pacman.radius) {
        pellet.isEaten = true;
        this.updateScore(50);
        this.frightened = true;
        this.frightenedTimer = 300; // About 5 seconds at 60fps
      }
    }
    
    // Update frightened mode timer
    if (this.frightened) {
      this.frightenedTimer--;
      if (this.frightenedTimer <= 0) {
        this.frightened = false;
      }
    }
    
    // Update ghosts
    for (let i = 0; i < this.ghosts.length; i++) {
      const ghost = this.ghosts[i];
      
      // Move ghost
      ghost.x += ghost.direction.x * ghost.speed * (this.frightened ? 0.5 : 1);
      ghost.y += ghost.direction.y * ghost.speed * (this.frightened ? 0.5 : 1);
      
      // Random direction changes based on seeded random
      if (this.seededRandom() < 0.01 || this.isAtWall(ghost)) {
        this.changeGhostDirection(ghost);
      }
      
      // Wrap around edges
      if (ghost.x < -ghost.radius) ghost.x = this.width + ghost.radius;
      if (ghost.x > this.width + ghost.radius) ghost.x = -ghost.radius;
      if (ghost.y < -ghost.radius) ghost.y = this.height + ghost.radius;
      if (ghost.y > this.height + ghost.radius) ghost.y = -ghost.radius;
      
      // Check ghost-pacman collision
      if (this.distance(ghost.x, ghost.y, this.pacman.x, this.pacman.y) < ghost.radius + this.pacman.radius) {
        if (this.frightened) {
          // Pacman eats ghost
          ghost.x = this.width * this.seededRandom();
          ghost.y = this.height * this.seededRandom();
          this.updateScore(200);
        } else {
          // Ghost catches pacman
          this.gameOver();
          return;
        }
      }
    }
    
    // Check if all dots and pellets are eaten
    const allEaten = this.dots.every(dot => dot.isEaten) && 
                      this.powerPellets.every(pellet => pellet.isEaten);
    
    if (allEaten) {
      this.gameOver();
    }
  }
  
  isAtWall(ghost: { x: number; y: number; radius: number; direction: { x: number; y: number } }) {
    // Check if ghost is close to a wall
    for (const wall of this.walls) {
      if (this.checkCollision(
        { x: ghost.x + ghost.direction.x * 5, y: ghost.y + ghost.direction.y * 5, radius: ghost.radius },
        { x: wall.x, y: wall.y, width: wall.width, height: wall.height }
      )) {
        return true;
      }
    }
    return false;
  }
  
  changeGhostDirection(ghost: { direction: { x: number; y: number } }) {
    // Choose a new random direction
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];
    
    // Filter out the current direction
    const filteredDirections = directions.filter(d => 
      !(d.x === ghost.direction.x && d.y === ghost.direction.y) &&
      !(d.x === -ghost.direction.x && d.y === -ghost.direction.y)
    );
    
    // Pick a random new direction based on seeded random
    const newDir = filteredDirections[Math.floor(this.seededRandom() * filteredDirections.length)];
    ghost.direction = newDir;
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw walls
    this.ctx.fillStyle = '#1A1A9F';
    for (const wall of this.walls) {
      this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    // Draw dots
    this.ctx.fillStyle = 'white';
    for (const dot of this.dots) {
      if (!dot.isEaten) {
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // Draw power pellets
    this.ctx.fillStyle = 'white';
    for (const pellet of this.powerPellets) {
      if (!pellet.isEaten) {
        this.ctx.beginPath();
        this.ctx.arc(pellet.x, pellet.y, pellet.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // Get player color from parameters or use default
    const playerColor = this.parameters.customColors?.player || '#FFD166';
    
    // Draw pacman
    this.ctx.fillStyle = playerColor;
    this.ctx.beginPath();
    
    // Calculate mouth angle based on direction
    let startAngle, endAngle;
    
    if (this.pacman.direction.x === 1) {
      startAngle = (0.5 - this.pacman.mouthOpen) * Math.PI;
      endAngle = (0.5 + this.pacman.mouthOpen) * Math.PI;
    } else if (this.pacman.direction.x === -1) {
      startAngle = (1.5 - this.pacman.mouthOpen) * Math.PI;
      endAngle = (1.5 + this.pacman.mouthOpen) * Math.PI;
    } else if (this.pacman.direction.y === 1) {
      startAngle = (1.0 - this.pacman.mouthOpen) * Math.PI;
      endAngle = (1.0 + this.pacman.mouthOpen) * Math.PI;
    } else {
      startAngle = (0.0 - this.pacman.mouthOpen) * Math.PI;
      endAngle = (0.0 + this.pacman.mouthOpen) * Math.PI;
    }
    
    this.ctx.arc(
      this.pacman.x, 
      this.pacman.y, 
      this.pacman.radius, 
      startAngle, 
      endAngle
    );
    
    this.ctx.lineTo(this.pacman.x, this.pacman.y);
    this.ctx.fill();
    
    // Draw ghosts
    for (const ghost of this.ghosts) {
      // Ghost body color
      this.ctx.fillStyle = this.frightened ? '#0000FF' : ghost.color;
      
      // Draw ghost body (similar to a pill shape with a wavy bottom)
      this.ctx.beginPath();
      this.ctx.arc(ghost.x, ghost.y - 5, ghost.radius, Math.PI, 0, false);
      this.ctx.lineTo(ghost.x + ghost.radius, ghost.y + ghost.radius);
      
      // Create wavy bottom
      for (let i = 4; i >= -4; i--) {
        const waveHeight = i % 2 === 0 ? ghost.radius * 0.3 : 0;
        this.ctx.lineTo(ghost.x + i * (ghost.radius / 4), ghost.y + ghost.radius - waveHeight);
      }
      
      this.ctx.lineTo(ghost.x - ghost.radius, ghost.y - 5);
      this.ctx.fill();
      
      // Eyes
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(ghost.x - 4, ghost.y - 5, 3, 0, Math.PI * 2);
      this.ctx.arc(ghost.x + 4, ghost.y - 5, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pupils - look in movement direction
      this.ctx.fillStyle = 'black';
      this.ctx.beginPath();
      
      const pupilOffsetX = ghost.direction.x * 1;
      const pupilOffsetY = ghost.direction.y * 1;
      
      this.ctx.arc(
        ghost.x - 4 + pupilOffsetX, 
        ghost.y - 5 + pupilOffsetY, 
        1.5, 
        0, 
        Math.PI * 2
      );
      this.ctx.arc(
        ghost.x + 4 + pupilOffsetX, 
        ghost.y - 5 + pupilOffsetY, 
        1.5, 
        0, 
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }
  
  reset() {
    super.reset();
    
    // Reset pacman
    this.pacman.x = this.width / 4;
    this.pacman.y = this.height / 2;
    this.pacman.direction = { x: 1, y: 0 };
    
    // Reset ghosts to evenly spaced positions
    const ghostCount = this.ghosts.length;
    for (let i = 0; i < ghostCount; i++) {
      this.ghosts[i].x = this.width * 0.75;
      this.ghosts[i].y = this.height * ((i + 1) / (ghostCount + 1));
    }
    
    // Reset dots and pellets
    this.dots.forEach(dot => dot.isEaten = false);
    this.powerPellets.forEach(pellet => pellet.isEaten = false);
    
    // Reset frightened mode
    this.frightened = false;
    this.frightenedTimer = 0;
  }
}

export default function PacmanGame({
  canvasRef,
  canvasSize,
  isPaused,
  isMuted,
  onScoreChange,
  onGameOver,
  parameters
}: PacmanGameProps) {
  const gameRef = useRef<PacmanGameEngine | null>(null);
  
  // Initialize and handle game lifecycle
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Initialize game with parameters
    const game = new PacmanGameEngine(canvas, onScoreChange, onGameOver, parameters);
    gameRef.current = game;
    game.start();
    
    // Clean up on unmount
    return () => {
      game.cleanup();
    };
  }, [canvasRef, canvasSize, onScoreChange, onGameOver, parameters]);
  
  // Handle pause/resume
  useEffect(() => {
    if (!gameRef.current) return;
    
    if (isPaused) {
      gameRef.current.pause();
    } else {
      gameRef.current.resume();
    }
  }, [isPaused]);
  
  // Handle reset event from parent
  useEffect(() => {
    const handleReset = () => {
      if (gameRef.current) {
        gameRef.current.reset();
        gameRef.current.resume();
      }
    };
    
    const containerElement = canvasRef.current?.parentElement;
    if (containerElement) {
      containerElement.addEventListener('resetGame', handleReset);
      
      return () => {
        containerElement.removeEventListener('resetGame', handleReset);
      };
    }
  }, [canvasRef]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full max-h-[500px] image-rendering-pixelated"
      width={canvasSize.width}
      height={canvasSize.height}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}