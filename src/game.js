class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.gravity = 0.5;
    this.jumpForce = -10;
    this.radius = 15;
    this.rotation = 0;
  }

  jump() {
    this.velocity = this.jumpForce;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    
    // Rotate bird based on velocity
    this.rotation = Math.min(Math.max(this.velocity * 0.1, -0.5), 0.5);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Bird body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(5, -3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(this.radius, 0);
    ctx.lineTo(this.radius + 15, 5);
    ctx.lineTo(this.radius, 10);
    ctx.fill();
    
    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }
}

class Pipe {
  constructor(x, gapY, gapHeight, width = 60, speed = 3) {
    this.x = x;
    this.gapY = gapY;
    this.gapHeight = gapHeight;
    this.width = width;
    this.speed = speed;
    this.passed = false;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx, canvasHeight) {
    ctx.fillStyle = '#2E8B57';
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 3;
    
    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.gapY);
    ctx.strokeRect(this.x, 0, this.width, this.gapY);
    
    // Top pipe cap
    ctx.fillRect(this.x - 5, this.gapY - 20, this.width + 10, 20);
    ctx.strokeRect(this.x - 5, this.gapY - 20, this.width + 10, 20);
    
    // Bottom pipe
    const bottomY = this.gapY + this.gapHeight;
    const bottomHeight = canvasHeight - bottomY;
    ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
    ctx.strokeRect(this.x, bottomY, this.width, bottomHeight);
    
    // Bottom pipe cap
    ctx.fillRect(this.x - 5, bottomY, this.width + 10, 20);
    ctx.strokeRect(this.x - 5, bottomY, this.width + 10, 20);
  }

  collidesWith(bird) {
    const bounds = bird.getBounds();
    
    // Check horizontal overlap
    if (bounds.x + bounds.width < this.x || bounds.x > this.x + this.width) {
      return false;
    }
    
    // Check vertical collision with top pipe
    if (bounds.y < this.gapY) {
      return true;
    }
    
    // Check vertical collision with bottom pipe
    if (bounds.y + bounds.height > this.gapY + this.gapHeight) {
      return true;
    }
    
    return false;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.bird = new Bird(100, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('flappyHighScore') || '0', 10);
    this.gameState = 'start'; // 'start', 'playing', 'gameover'
    this.pipeSpawnTimer = 0;
    this.pipeSpawnInterval = 1500;
    this.lastTime = 0;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    const handleJump = (e) => {
      if (e.type === 'keydown' && e.code !== 'Space') return;
      e.preventDefault();
      
      if (this.gameState === 'start') {
        this.start();
      } else if (this.gameState === 'playing') {
        this.bird.jump();
      } else if (this.gameState === 'gameover') {
        this.restart();
      }
    };

    window.addEventListener('keydown', handleJump);
    this.canvas.addEventListener('click', handleJump);
    this.canvas.addEventListener('touchstart', handleJump);
  }

  start() {
    this.gameState = 'playing';
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  restart() {
    this.bird = new Bird(100, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.pipeSpawnTimer = 0;
    this.gameState = 'playing';
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameLoop(currentTime) {
    if (this.gameState !== 'playing') return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.draw();
    
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(deltaTime) {
    this.bird.update();
    
    // Spawn pipes
    this.pipeSpawnTimer += deltaTime;
    if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
      this.spawnPipe();
      this.pipeSpawnTimer = 0;
    }
    
    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();
      
      // Check collision
      if (pipe.collidesWith(this.bird)) {
        this.gameOver();
        return;
      }
      
      // Check if pipe passed
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('flappyHighScore', this.highScore.toString());
        }
      }
      
      // Remove off-screen pipes
      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }
    
    // Check ground/ceiling collision
    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.height) {
      this.gameOver();
    }
  }

  spawnPipe() {
    const gapHeight = 150;
    const minGapY = 50;
    const maxGapY = this.height - gapHeight - 50;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    
    this.pipes.push(new Pipe(this.width, gapY, gapHeight));
  }

  gameOver() {
    this.gameState = 'gameover';
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw pipes
    for (const pipe of this.pipes) {
      pipe.draw(this.ctx, this.height);
    }
    
    // Draw bird
    this.bird.draw(this.ctx);
    
    // Draw score
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score.toString(), this.width / 2, 60);
    
    // Draw high score
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#666';
    this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, 90);
    
    // Draw state messages
    if (this.gameState === 'start') {
      this.drawStartScreen();
    } else if (this.gameState === 'gameover') {
      this.drawGameOverScreen();
    }
  }

  drawStartScreen() {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Flappy Bird', this.width / 2, this.height / 2 - 40);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press SPACE, Click, or Tap to Start', this.width / 2, this.height / 2 + 20);
  }

  drawGameOverScreen() {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#FF4444';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 60);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '32px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2);
    this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, this.height / 2 + 40);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press SPACE, Click, or Tap to Restart', this.width / 2, this.height / 2 + 100);
  }
}

// Initialize game when DOM is ready
let game;

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    game = new Game(canvas);
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Bird, Pipe, Game };
}
