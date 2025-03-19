import { useEffect, useRef } from 'react';
import { Game } from '@/lib/gameEngine';

interface FroggerGameProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasSize: { width: number; height: number };
  isPaused: boolean;
  isMuted: boolean;
  onScoreChange: (score: number) => void;
  onGameOver: (score: number) => void;
}

// Frogger game implementation
class FroggerGameEngine extends Game {
  frog: {
    x: number;
    y: number;
    width: number;
    height: number;
    lives: number;
  };
  cars: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
  }[];
  logs: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
  }[];
  homeBases: {
    x: number;
    width: number;
    isFilled: boolean;
  }[];
  waterY: number;
  roadY: number;
  laneHeight: number;
  moveCooldown: number;
  
  constructor(canvas: HTMLCanvasElement, onScoreChange: (score: number) => void, onGameOver: (score: number) => void) {
    super(canvas, onScoreChange, onGameOver);
    
    // Game dimensions
    this.laneHeight = 40;
    this.waterY = this.laneHeight * 2; // Starting y of water section
    this.roadY = this.laneHeight * 7; // Starting y of road section
    
    // Initialize frog
    this.frog = {
      x: this.width / 2 - 15,
      y: this.height - this.laneHeight / 2,
      width: 30,
      height: 30,
      lives: 3
    };
    
    // Move cooldown to prevent too rapid movement
    this.moveCooldown = 0;
    
    // Initialize cars
    this.cars = [];
    this.createCars();
    
    // Initialize logs
    this.logs = [];
    this.createLogs();
    
    // Initialize home bases (goals)
    this.homeBases = [];
    this.createHomeBases();
  }
  
  createCars() {
    const lanes = 4; // Number of road lanes
    const carColors = ['#FF5454', '#FFD166', '#8C3FFF', '#00FFFF'];
    
    for (let lane = 0; lane < lanes; lane++) {
      const laneY = this.roadY + lane * this.laneHeight;
      const direction = lane % 2 === 0 ? 1 : -1; // Alternate directions
      const carCount = 3 + Math.floor(Math.random() * 2); // 3-4 cars per lane
      
      for (let i = 0; i < carCount; i++) {
        const carWidth = 60 + Math.random() * 30; // Random car width
        
        // Space cars evenly
        const spacing = this.width / carCount;
        let startX = i * spacing;
        
        // Add some randomness to spacing
        startX += (Math.random() * 0.5 - 0.25) * spacing;
        
        // If going left, start from right edge
        if (direction === -1) {
          startX = this.width - startX - carWidth;
        }
        
        this.cars.push({
          x: startX,
          y: laneY + this.laneHeight / 2 - 15, // Center in lane
          width: carWidth,
          height: 30,
          speed: (1 + Math.random() * 1.5) * direction, // Random speed
          color: carColors[lane % carColors.length]
        });
      }
    }
  }
  
  createLogs() {
    const lanes = 4; // Number of water lanes
    
    for (let lane = 0; lane < lanes; lane++) {
      const laneY = this.waterY + lane * this.laneHeight;
      const direction = lane % 2 === 0 ? 1 : -1; // Alternate directions
      const logCount = 2 + Math.floor(Math.random() * 2); // 2-3 logs per lane
      
      for (let i = 0; i < logCount; i++) {
        const logWidth = 80 + Math.random() * 60; // Random log width
        
        // Space logs evenly
        const spacing = this.width / logCount;
        let startX = i * spacing;
        
        // Add some randomness to spacing
        startX += (Math.random() * 0.5 - 0.25) * spacing;
        
        // If going left, start from right edge
        if (direction === -1) {
          startX = this.width - startX - logWidth;
        }
        
        this.logs.push({
          x: startX,
          y: laneY + this.laneHeight / 2 - 15, // Center in lane
          width: logWidth,
          height: 30,
          speed: (0.5 + Math.random() * 1) * direction // Random speed
        });
      }
    }
  }
  
  createHomeBases() {
    const baseCount = 5;
    const baseWidth = 40;
    const spacing = this.width / baseCount;
    const offset = (spacing - baseWidth) / 2;
    
    for (let i = 0; i < baseCount; i++) {
      this.homeBases.push({
        x: i * spacing + offset,
        width: baseWidth,
        isFilled: false
      });
    }
  }
  
  setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      
      // Calculate swipe direction
      const diffX = endX - touchStartX;
      const diffY = endY - touchStartY;
      
      // Only move if we're not on cooldown
      if (this.moveCooldown === 0) {
        // Check if horizontal or vertical swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
          // Horizontal swipe
          if (diffX > 20) {
            this.moveFrog('right');
          } else if (diffX < -20) {
            this.moveFrog('left');
          }
        } else {
          // Vertical swipe
          if (diffY > 20) {
            this.moveFrog('down');
          } else if (diffY < -20) {
            this.moveFrog('up');
          }
        }
      }
    });
  }
  
  update() {
    if (!this.isRunning) return;
    
    // Update cooldown
    if (this.moveCooldown > 0) this.moveCooldown--;
    
    // Handle keyboard input
    if (this.moveCooldown === 0) {
      if (this.keys['ArrowUp']) {
        this.moveFrog('up');
      } else if (this.keys['ArrowDown']) {
        this.moveFrog('down');
      } else if (this.keys['ArrowLeft']) {
        this.moveFrog('left');
      } else if (this.keys['ArrowRight']) {
        this.moveFrog('right');
      }
    }
    
    // Update cars
    this.updateCars();
    
    // Update logs
    this.updateLogs();
    
    // Check if frog is in water
    this.checkWater();
    
    // Check if frog reached a home base
    this.checkHomeBase();
    
    // Check if all home bases are filled
    if (this.homeBases.every(base => base.isFilled)) {
      this.gameOver();
    }
  }
  
  moveFrog(direction: string) {
    switch(direction) {
      case 'up':
        this.frog.y -= this.laneHeight;
        break;
      case 'down':
        this.frog.y += this.laneHeight;
        break;
      case 'left':
        this.frog.x -= 30;
        break;
      case 'right':
        this.frog.x += 30;
        break;
    }
    
    // Keep frog within bounds
    this.frog.x = Math.max(0, Math.min(this.width - this.frog.width, this.frog.x));
    this.frog.y = Math.max(0, Math.min(this.height - this.frog.height, this.frog.y));
    
    // Set cooldown to prevent rapid movement
    this.moveCooldown = 10;
  }
  
  updateCars() {
    for (const car of this.cars) {
      // Move car
      car.x += car.speed;
      
      // Wrap around edges
      if (car.speed > 0 && car.x > this.width) {
        car.x = -car.width;
      } else if (car.speed < 0 && car.x + car.width < 0) {
        car.x = this.width;
      }
      
      // Check collision with frog
      if (this.checkCollision(car, this.frog)) {
        this.frogDeath();
        return;
      }
    }
  }
  
  updateLogs() {
    for (const log of this.logs) {
      // Move log
      log.x += log.speed;
      
      // Wrap around edges
      if (log.speed > 0 && log.x > this.width) {
        log.x = -log.width;
      } else if (log.speed < 0 && log.x + log.width < 0) {
        log.x = this.width;
      }
    }
  }
  
  checkWater() {
    // Check if frog is in water zone
    if (this.frog.y >= this.waterY && this.frog.y < this.roadY) {
      let onLog = false;
      
      // Check if frog is on a log
      for (const log of this.logs) {
        if (this.checkCollision(this.frog, log)) {
          // Move frog with log
          this.frog.x += log.speed;
          
          // Keep frog within bounds
          this.frog.x = Math.max(0, Math.min(this.width - this.frog.width, this.frog.x));
          
          onLog = true;
          break;
        }
      }
      
      // If frog is in water but not on a log, it drowns
      if (!onLog) {
        this.frogDeath();
      }
    }
  }
  
  checkHomeBase() {
    // Check if frog is at the top (home base zone)
    if (this.frog.y < this.waterY) {
      for (let i = 0; i < this.homeBases.length; i++) {
        const base = this.homeBases[i];
        
        if (this.frog.x + this.frog.width / 2 >= base.x && 
            this.frog.x + this.frog.width / 2 <= base.x + base.width) {
          
          // Check if base is already filled
          if (!base.isFilled) {
            base.isFilled = true;
            this.updateScore(200); // Points for reaching home
            
            // Reset frog position
            this.frog.x = this.width / 2 - 15;
            this.frog.y = this.height - this.laneHeight / 2;
            
            // Add bonus points for each filled base
            const filledCount = this.homeBases.filter(b => b.isFilled).length;
            if (filledCount === this.homeBases.length) {
              this.updateScore(1000); // Bonus for filling all bases
            }
          } else {
            // Can't enter an already filled base
            this.frogDeath();
          }
          
          break;
        }
      }
    }
  }
  
  frogDeath() {
    this.frog.lives--;
    
    if (this.frog.lives <= 0) {
      this.gameOver();
    } else {
      // Reset frog position
      this.frog.x = this.width / 2 - 15;
      this.frog.y = this.height - this.laneHeight / 2;
    }
  }
  
  checkCollision(obj1: { x: number; y: number; width: number; height: number },
                obj2: { x: number; y: number; width: number; height: number }) {
    return (obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y);
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw water zone (blue)
    this.ctx.fillStyle = '#0077be';
    this.ctx.fillRect(0, this.waterY, this.width, this.roadY - this.waterY);
    
    // Draw safe zone (grass green)
    this.ctx.fillStyle = '#00a651';
    this.ctx.fillRect(0, 0, this.width, this.waterY);
    this.ctx.fillRect(0, this.roadY + this.laneHeight * 4, this.width, this.height - (this.roadY + this.laneHeight * 4));
    
    // Draw road (dark gray)
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, this.roadY, this.width, this.laneHeight * 4);
    
    // Draw lane markings on road
    this.ctx.strokeStyle = '#fff';
    this.ctx.setLineDash([20, 10]);
    this.ctx.lineWidth = 2;
    
    for (let i = 1; i < 4; i++) {
      const y = this.roadY + i * this.laneHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
    
    // Draw home bases
    for (let i = 0; i < this.homeBases.length; i++) {
      const base = this.homeBases[i];
      
      if (base.isFilled) {
        // Filled base
        this.ctx.fillStyle = '#8C3FFF'; // Purple
      } else {
        // Empty base
        this.ctx.fillStyle = '#00cc66'; // Lighter green
      }
      
      this.ctx.fillRect(base.x, 10, base.width, this.laneHeight - 20);
    }
    
    // Draw logs
    this.ctx.fillStyle = '#8B4513'; // Brown logs
    for (const log of this.logs) {
      this.ctx.fillRect(log.x, log.y, log.width, log.height);
      
      // Add wood texture
      this.ctx.strokeStyle = '#6B3E26';
      this.ctx.lineWidth = 2;
      
      // Horizontal lines on logs
      for (let i = 1; i < 3; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(log.x, log.y + i * 10);
        this.ctx.lineTo(log.x + log.width, log.y + i * 10);
        this.ctx.stroke();
      }
    }
    
    // Draw cars
    for (const car of this.cars) {
      // Car body
      this.ctx.fillStyle = car.color;
      this.ctx.fillRect(car.x, car.y, car.width, car.height);
      
      // Car details
      this.ctx.fillStyle = 'black'; // Wheels
      this.ctx.fillRect(car.x + 10, car.y - 3, 8, 3);
      this.ctx.fillRect(car.x + 10, car.y + car.height, 8, 3);
      this.ctx.fillRect(car.x + car.width - 18, car.y - 3, 8, 3);
      this.ctx.fillRect(car.x + car.width - 18, car.y + car.height, 8, 3);
      
      // Windows
      this.ctx.fillStyle = '#89CFF0'; // Light blue
      this.ctx.fillRect(car.x + car.width * 0.7, car.y + 5, car.width * 0.2, car.height - 10);
    }
    
    // Draw frog
    this.ctx.fillStyle = '#00cc66'; // Green frog
    
    // Frog body (circular)
    this.ctx.beginPath();
    this.ctx.arc(this.frog.x + this.frog.width / 2, this.frog.y + this.frog.height / 2, 
                this.frog.width / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Frog eyes
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(this.frog.x + this.frog.width * 0.3, this.frog.y + this.frog.height * 0.3, 
                this.frog.width * 0.15, 0, Math.PI * 2);
    this.ctx.arc(this.frog.x + this.frog.width * 0.7, this.frog.y + this.frog.height * 0.3, 
                this.frog.width * 0.15, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Frog pupils
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(this.frog.x + this.frog.width * 0.3, this.frog.y + this.frog.height * 0.3, 
                this.frog.width * 0.05, 0, Math.PI * 2);
    this.ctx.arc(this.frog.x + this.frog.width * 0.7, this.frog.y + this.frog.height * 0.3, 
                this.frog.width * 0.05, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw lives
    this.ctx.fillStyle = '#00cc66';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`LIVES: ${this.frog.lives}`, 10, this.height - 10);
    
    // Draw filled base count
    const filledCount = this.homeBases.filter(base => base.isFilled).length;
    this.ctx.fillStyle = '#FFD166';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`HOMES: ${filledCount}/${this.homeBases.length}`, this.width - 10, this.height - 10);
  }
  
  reset() {
    super.reset();
    
    // Reset frog
    this.frog.x = this.width / 2 - 15;
    this.frog.y = this.height - this.laneHeight / 2;
    this.frog.lives = 3;
    
    // Reset home bases
    for (const base of this.homeBases) {
      base.isFilled = false;
    }
    
    // Reset cooldown
    this.moveCooldown = 0;
  }
}

export default function FroggerGame({
  canvasRef,
  canvasSize,
  isPaused,
  isMuted,
  onScoreChange,
  onGameOver
}: FroggerGameProps) {
  const gameRef = useRef<FroggerGameEngine | null>(null);
  
  // Initialize and handle game lifecycle
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Initialize game
    const game = new FroggerGameEngine(canvas, onScoreChange, onGameOver);
    gameRef.current = game;
    game.start();
    
    // Clean up on unmount
    return () => {
      game.cleanup();
    };
  }, [canvasRef, canvasSize, onScoreChange, onGameOver]);
  
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
