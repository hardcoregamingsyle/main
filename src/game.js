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
    ctx.moveTo(15, 0);
    ctx.lineTo(25, -3);
    ctx.lineTo(25, 3);
    ctx.closePath();
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
  constructor(x, gapY, gapHeight = 150) {
    this.x = x;
    this.width = 60;
    this.gapY = gapY;
    this.gapHeight = gapHeight;
    this.passed = false;
    this.speed = 3;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx, canvasHeight) {
    ctx.fillStyle = '#2E8B57';
    
    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.gapY);
    // Pipe cap top
    ctx.fillRect(this.x - 5, this.gapY - 20, this.width + 10, 20);
    
    // Bottom pipe
    const bottomY = this.gapY + this.gapHeight;
    ctx.fillRect(this.x, bottomY, this.width, canvasHeight - bottomY);
    // Pipe cap bottom
    ctx.fillRect(this.x - 5, bottomY, this.width + 10, 20);
  }

  collidesWith(bird) {
    const birdBounds = bird.getBounds();
    
    // Check collision with top pipe
    if (birdBounds.x < this.x + this.width &&
        birdBounds.x + birdBounds.width > this.x &&
        birdBounds.y < this.gapY &&
        birdBounds.y + birdBounds.height > 0) {
      return true;
    }
    
    // Check collision with bottom pipe
    const bottomY = this.gapY + this.gapHeight;
    if (birdBounds.x < this.x + this.width &&
        birdBounds.x + birdBounds.width > this.x &&
        birdBounds.y + birdBounds.height > bottomY &&
        birdBounds.y < bottomY + (canvas.height - bottomY)) {
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
    
    this.bird = new Bird(150, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.highScore = 0;
    this.gameState = 'start'; // start, playing, gameOver
    this.pipeSpawnTimer = 0;
    this.pipeSpawnInterval = 1500; // ms
    this.lastTime = 0;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleJump();
      }
    });
    
    this.canvas.addEventListener('click', () => {
      this.handleJump();
    });
    
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleJump();
    });
  }

  handleJump() {
    if (this.gameState === 'playing') {
      this.bird.jump();
    } else if (this.gameState === 'start') {
      this.startGame();
    } else if (this.gameState === 'gameOver') {
      this.resetGame();
    }
  }

  startGame() {
    this.gameState = 'playing';
    this.bird = new Bird(150, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.pipeSpawnTimer = 0;
  }

  resetGame() {
    this.gameState = 'start';
    this.bird = new Bird(150, this.height / 2);
    this.pipes = [];
    this.score = 0;
  }

  spawnPipe() {
    const minGapY = 100;
    const maxGapY = this.height - 100 - 150;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    this.pipes.push(new Pipe(this.width, gapY));
  }

  update(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    this.bird.update();
    
    // Check ground/ceiling collision
    if (this.bird.y - this.bird.radius < 0 || 
        this.bird.y + this.bird.radius > this.height) {
      this.gameOver();
      return;
    }
    
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
      
      // Check score
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
        if (this.score > this.highScore) {
          this.highScore = this.score;
        }
      }
      
      // Remove off-screen pipes
      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }
  }

  gameOver() {
    this.gameState = 'gameOver';
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
    this.pipes.forEach(pipe => pipe.draw(this.ctx, this.height));
    
    // Draw bird
    this.bird.draw(this.ctx);
    
    // Draw score
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score.toString(), this.width / 2, 60);
    
    // Draw high score
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, 90);
    
    // Draw state messages
    if (this.gameState === 'start') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Flappy Bird', this.width / 2, this.height / 2 - 50);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press SPACE or Click to Start', this.width / 2, this.height / 2 + 20);
    } else if (this.gameState === 'gameOver') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#FF4444';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 50);
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
      this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, this.height / 2 + 50);
      this.ctx.fillText('Press SPACE or Click to Restart', this.width / 2, this.height / 2 + 100);
    }
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.update(deltaTime);
    this.draw();
    
    requestAnimationFrame((ts) => this.loop(ts));
  }

  start() {
    requestAnimationFrame((ts) => this.loop(ts));
  }
}

// Initialize game when DOM is ready
let game;

function initGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  // Set canvas size
  canvas.width = 400;
  canvas.height = 600;
  
  game = new Game(canvas);
  game.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Bird, Pipe, Game };
}