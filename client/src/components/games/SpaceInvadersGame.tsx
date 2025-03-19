import { useEffect, useRef } from 'react';
import { Game } from '@/lib/gameEngine';
import { GameParameters } from '@shared/schema';

interface SpaceInvadersGameProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasSize: { width: number; height: number };
  isPaused: boolean;
  isMuted: boolean;
  onScoreChange: (score: number) => void;
  onGameOver: (score: number) => void;
  parameters: GameParameters;
}

// Space Invaders game implementation
class SpaceInvadersGameEngine extends Game {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    lives: number;
    invulnerable: boolean;
    invulnerabilityTimer: number;
  };
  bullets: Array<{x: number; y: number; width: number; height: number; speed: number}>;
  enemies: Array<{x: number; y: number; width: number; height: number; isAlive: boolean; points: number}>;
  enemyBullets: Array<{x: number; y: number; width: number; height: number; speed: number}>;
  moveRight: boolean;
  moveSpeed: number;
  dropDistance: number;
  shootCooldown: number;
  enemyShootCooldown: number;
  gameLevel: number;
  parameters: GameParameters;

  constructor(canvas: HTMLCanvasElement, onScoreChange: (score: number) => void, onGameOver: (score: number) => void, params: GameParameters) {
    super(canvas, onScoreChange, onGameOver);

    // Initialize with default parameters
    this.parameters = {
      difficulty: 'medium',
      speedMultiplier: 1.0,
      enemyCount: 4,
      specialFeatures: [],
      layoutSeed: 12345,
      livesCount: 3,
      bonusFrequency: 0.2,
      ...params
    };

    const difficultyMultiplier = {
      'easy': 0.8,
      'medium': 1.0,
      'hard': 1.2,
      'expert': 1.5
    }[this.parameters.difficulty] || 1.0;

    this.bullets = [];
    this.enemyBullets = [];
    this.moveRight = true;
    this.moveSpeed = 1 * this.parameters.speedMultiplier * difficultyMultiplier;
    this.dropDistance = 20;
    this.shootCooldown = 0;
    this.enemyShootCooldown = 0;
    this.gameLevel = 1;

    const playerHeight = 20;
    this.player = {
      x: this.width / 2 - 15,
      y: this.height - playerHeight - 10,
      width: 30,
      height: playerHeight,
      speed: 5 * this.parameters.speedMultiplier * difficultyMultiplier,
      lives: this.parameters.livesCount,
      invulnerable: false,
      invulnerabilityTimer: 0
    };

    this.enemies = [];
    this.createEnemies();
  }

  createEnemies() {
    this.enemies = [];

    const { difficulty, enemyCount, layoutSeed } = this.parameters;

    let rows = 5;
    let cols = 10;

    const totalEnemies = Math.max(1, enemyCount * 10);

    if (totalEnemies < 50) {
      rows = Math.max(1, Math.floor(Math.sqrt(totalEnemies / 2)));
      cols = Math.max(1, Math.ceil(totalEnemies / rows));
    } else {
      rows = 6;
      cols = 12;
    }

    const enemyWidth = 30;
    const enemyHeight = 20;
    const padding = 10;

    const seededRandom = () => {
      this.parameters.layoutSeed = (this.parameters.layoutSeed * 9301 + 49297) % 233280;
      return this.parameters.layoutSeed / 233280;
    };

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xVariation = difficulty === 'expert' ? (seededRandom() - 0.5) * 10 : 0;
        const yVariation = difficulty === 'expert' ? (seededRandom() - 0.5) * 5 : 0;

        const pointMultiplier = {
          'easy': 1,
          'medium': 1.5,
          'hard': 2,
          'expert': 3
        }[difficulty] || 1;

        const x = col * (enemyWidth + padding) + padding + xVariation;
        const y = row * (enemyHeight + padding) + padding + 40 + yVariation;

        this.enemies.push({
          x,
          y,
          width: enemyWidth,
          height: enemyHeight,
          isAlive: true,
          points: Math.floor((rows - row) * 10 * pointMultiplier)
        });
      }
    }

    if (difficulty === 'hard' || difficulty === 'expert') {
      const extraEnemies = Math.floor(seededRandom() * 5) + 3;
      for (let i = 0; i < extraEnemies; i++) {
        const x = seededRandom() * (this.width - 2 * enemyWidth) + enemyWidth;
        const y = seededRandom() * (this.height / 3) + enemyHeight * 2;

        this.enemies.push({
          x,
          y,
          width: enemyWidth,
          height: enemyHeight,
          isAlive: true,
          points: Math.floor(50 * {
            'easy': 1,
            'medium': 1.5,
            'hard': 2,
            'expert': 3
          }[difficulty] || 1)
        });
      }
    }
  }

  setupTouchControls() {
    let touchStartX = 0;

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;

      this.shoot();
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartX;

      if (diffX > 10) {
        this.player.x += this.player.speed;
        touchStartX = touch.clientX;
      } else if (diffX < -10) {
        this.player.x -= this.player.speed;
        touchStartX = touch.clientX;
      }

      this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
    });
  }

  update() {
    if (!this.isRunning) return;

    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.enemyShootCooldown > 0) this.enemyShootCooldown--;

    if (this.player.invulnerable) {
      this.player.invulnerabilityTimer--;
      if (this.player.invulnerabilityTimer <= 0) {
        this.player.invulnerable = false;
      }
    }

    if (this.keys['ArrowLeft']) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight']) {
      this.player.x += this.player.speed;
    }

    this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));

    if (this.keys['Space'] && this.shootCooldown === 0) {
      this.shoot();
    }

    this.updateBullets();
    this.updateEnemies();

    if (this.enemyShootCooldown === 0) {
      this.enemyShoot();

      const baseDelay = 50;
      const randomRange = 30;

      const enemyCount = this.enemies.filter(e => e.isAlive).length;
      const enemyCountFactor = Math.max(0.5, Math.min(1.5, enemyCount / 10));

      this.enemyShootCooldown = Math.floor(Math.random() * randomRange) +
                               Math.floor(baseDelay / enemyCountFactor);
    }
  }

  shoot() {
    const { difficulty, speedMultiplier, specialFeatures } = this.parameters;

    const difficultyMultiplier = {
      'easy': 0.8,
      'medium': 1.0,
      'hard': 1.2,
      'expert': 1.5
    }[difficulty] || 1.0;

    const bulletSpeed = 7 * speedMultiplier * difficultyMultiplier;

    const hasDoubleShot = specialFeatures.includes('doubleShot');

    if (hasDoubleShot) {
      this.bullets.push({
        x: this.player.x + this.player.width / 3 - 2,
        y: this.player.y,
        width: 4,
        height: 10,
        speed: bulletSpeed
      });

      this.bullets.push({
        x: this.player.x + (this.player.width * 2/3) - 2,
        y: this.player.y,
        width: 4,
        height: 10,
        speed: bulletSpeed
      });
    } else {
      this.bullets.push({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y,
        width: 4,
        height: 10,
        speed: bulletSpeed
      });
    }

    const cooldownBase = {
      'easy': 20,
      'medium': 15,
      'hard': 12,
      'expert': 10
    }[difficulty] || 15;

    this.shootCooldown = cooldownBase;
  }

  enemyShoot() {
    const { difficulty, speedMultiplier, enemyCount } = this.parameters;

    const livingEnemies = this.enemies.filter(enemy => enemy.isAlive);

    if (livingEnemies.length === 0) return;

    const shooterCount = difficulty === 'hard' ? 2 :
                         difficulty === 'expert' ? 3 : 1;

    const baseSpeed = 3;
    const difficultyModifier = {
      'easy': 0.8,
      'medium': 1.0,
      'hard': 1.3,
      'expert': 1.6
    }[difficulty] || 1.0;

    const actualShooterCount = Math.min(shooterCount, livingEnemies.length);

    for (let i = 0; i < actualShooterCount; i++) {
      const shooterIndex = Math.floor(Math.random() * livingEnemies.length);
      const shooter = livingEnemies[shooterIndex];

      livingEnemies.splice(shooterIndex, 1);

      const bulletSpeed = baseSpeed * difficultyModifier * speedMultiplier + Math.min(this.gameLevel, 3);

      this.enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 10,
        speed: bulletSpeed
      });

      if (livingEnemies.length === 0) break;
    }
  }

  updateBullets() {
    // Update player bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].y -= this.bullets[i].speed;

      // Remove bullets that are off screen
      if (this.bullets[i].y < 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check for collision with enemies
      let hitEnemy = false;
      for (let j = 0; j < this.enemies.length; j++) {
        const enemy = this.enemies[j];
        if (enemy.isAlive && this.checkCollision(this.bullets[i], enemy)) {
          enemy.isAlive = false;
          this.updateScore(10);
          hitEnemy = true;

          // Check if level is complete
          const remainingEnemies = this.enemies.filter(e => e.isAlive).length;
          if (remainingEnemies === 0) {
            // Use setTimeout to create a small delay before next level
            setTimeout(() => {
              this.gameLevel++;
              this.moveSpeed += 0.2;
              this.createEnemies();
            }, 1000);
          }
          break;
        }
      }

      if (hitEnemy) {
        this.bullets.splice(i, 1);
      }
    }
    // Update enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      this.enemyBullets[i].y += this.enemyBullets[i].speed;

      if (this.enemyBullets[i].y > this.height) {
        this.enemyBullets.splice(i, 1);
        continue;
      }

      if (!this.player.invulnerable && this.checkCollision(this.enemyBullets[i], this.player)) {
        this.enemyBullets.splice(i, 1);
        this.player.lives--;

        if (this.player.lives <= 0) {
          this.gameOver();
          return;
        } else {
          this.player.invulnerable = true;
          this.player.invulnerabilityTimer = 60;
        }
        continue;
      }
    }
  }

  updateEnemies() {
    let moveDown = false;
    let reachedEdge = false;

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      if (this.moveRight && enemy.x + enemy.width >= this.width) {
        reachedEdge = true;
        break;
      } else if (!this.moveRight && enemy.x <= 0) {
        reachedEdge = true;
        break;
      }
    }

    if (reachedEdge) {
      this.moveRight = !this.moveRight;
      moveDown = true;
    }

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      if (moveDown) {
        enemy.y += this.dropDistance;
      } else {
        enemy.x += this.moveRight ? this.moveSpeed : -this.moveSpeed;
      }

      if (enemy.y + enemy.height >= this.player.y) {
        this.gameOver();
        return;
      }
    }
  }

  levelUp() {
    const remainingEnemies = this.enemies.filter(enemy => enemy.isAlive).length;
    if (remainingEnemies === 0) {
      this.gameLevel++;
      this.moveSpeed += 0.5;
      this.createEnemies();
      this.updateScore(100);
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
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size = Math.random() * 2 + 1;
      this.ctx.fillRect(x, y, size, size);
    }

    if (!this.player.invulnerable || Math.floor(this.player.invulnerabilityTimer / 5) % 2 === 0) {
      this.ctx.fillStyle = '#8C3FFF';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

      this.ctx.fillRect(this.player.x + this.player.width / 2 - 2, this.player.y - 5, 4, 5);
    }

    this.ctx.fillStyle = '#FFD166';
    for (const bullet of this.bullets) {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    this.ctx.fillStyle = '#FF5454';
    for (const bullet of this.enemyBullets) {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      this.ctx.fillStyle = '#FF5454';
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
      this.ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 5, 5, 5);
      this.ctx.fillRect(enemy.x + enemy.width / 2 - 2, enemy.y + enemy.height - 5, 4, 5);
    }

    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`LEVEL: ${this.gameLevel}`, 10, 20);

    this.ctx.fillText(`LIVES: ${this.player.lives}`, 10, 40);

    const lifeSize = 15;
    const lifeSpacing = 5;
    this.ctx.fillStyle = '#8C3FFF';
    for (let i = 0; i < this.player.lives; i++) {
      const lifeX = 90 + i * (lifeSize + lifeSpacing);
      const lifeY = 30;
      this.ctx.fillRect(lifeX, lifeY, lifeSize, lifeSize/2);
    }
  }

  reset() {
    super.reset();

    this.player.x = this.width / 2 - 15;
    this.player.lives = this.parameters.livesCount || 3;
    this.player.invulnerable = false;
    this.player.invulnerabilityTimer = 0;

    this.bullets = [];
    this.enemyBullets = [];

    this.gameLevel = 1;
    this.moveSpeed = 1;
    this.moveRight = true;
    this.createEnemies();

    this.shootCooldown = 0;
    this.enemyShootCooldown = 0;
  }
}

export default function SpaceInvadersGame({
  canvasRef,
  canvasSize,
  isPaused,
  isMuted,
  onScoreChange,
  onGameOver,
  parameters
}: SpaceInvadersGameProps) {
  const gameRef = useRef<SpaceInvadersGameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const game = new SpaceInvadersGameEngine(
      canvas,
      onScoreChange,
      onGameOver,
      parameters
    );
    gameRef.current = game;
    game.start();

    return () => {
      game.cleanup();
    };
  }, [canvasRef, canvasSize, onScoreChange, onGameOver, parameters]);

  useEffect(() => {
    if (!gameRef.current) return;

    if (isPaused) {
      gameRef.current.pause();
    } else {
      gameRef.current.resume();
    }
  }, [isPaused]);

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