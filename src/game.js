// Flappy Bird Game - src/game.js

class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.gravity = 0.5;
    this.lift = -10;
    this.width = 30;
    this.height = 30;
  }

  jump() {
    this.velocity = this.lift;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
  }

  draw(ctx) {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Pipe {
  constructor(x, height, gap) {
    this.x = x;
    this.height = height;
    this.gap = gap;
    this.width = 50;
    this.passed = false;
  }

  update(speed) {
    this.x -= speed;
  }

  draw(ctx) {
    ctx.fillStyle = '#228B22';
    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.height);
    // Bottom pipe
    ctx.fillRect(this.x, this.height + this.gap, this.width, 600 - this.height - this.gap);
  }

  collidesWith(bird) {
    // Simple AABB collision
    if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
      if (bird.y < this.height || bird.y + bird.height > this.height + this.gap) {
        return true;
      }
    }
    return false;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = new Bird(150, 300);
    this.pipes = [];
    this.score = 0;
    this.frameCount = 0;
    this.gameOver = false;
    this.pipeSpeed = 3;
    this.pipeInterval = 90; // frames between pipes
    this.pipeGap = 150;
    this.pipeHeight = 200;
    this.canvasHeight = 600;
    this.canvasWidth = 400;
    this.topScore = parseInt(localStorage.getItem('flappyTopScore') || '0');
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.gameOver) {
          this.restart();
        } else {
          this.bird.jump();
        }
      }
    });
    this.canvas.addEventListener('click', () => {
      if (this.gameOver) {
        this.restart();
      } else {
        this.bird.jump();
      }
    });
  }

  start() {
    this.loop();
  }

  restart() {
    this.bird = new Bird(150, 300);
    this.pipes = [];
    this.score = 0;
    this.frameCount = 0;
    this.gameOver = false;
  }

  loop() {
    if (!this.gameOver) {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    } else {
      this.drawGameOver();
      // Allow restart via click/key
      requestAnimationFrame(() => this.loop());
    }
  }

  update() {
    this.bird.update();

    // Check boundaries
    if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvasHeight) {
      this.gameOver = true;
      this.saveScore();
      return;
    }

    // Generate pipes
    this.frameCount++;
    if (this.frameCount % this.pipeInterval === 0) {
      const height = Math.random() * (this.canvasHeight - this.pipeGap - 100) + 50;
      this.pipes.push(new Pipe(this.canvasWidth, height, this.pipeGap));
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update(this.pipeSpeed);

      // Collision check
      if (pipe.collidesWith(this.bird)) {
        this.gameOver = true;
        this.saveScore();
        return;
      }

      // Score increment
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }

      // Remove off-screen pipes
      if (pipe.x + pipe.width < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    // Clear canvas
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw pipes
    for (const pipe of this.pipes) {
      pipe.draw(ctx);
    }

    // Draw bird
    this.bird.draw(ctx);

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + this.score, 10, 30);
    ctx.fillText('Top: ' + this.topScore, 10, 60);
  }

  drawGameOver() {
    this.draw();
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.fillStyle = '#FFF';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', this.canvasWidth / 2, this.canvasHeight / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space or Click to Restart', this.canvasWidth / 2, this.canvasHeight / 2 + 20);
    ctx.fillText('Score: ' + this.score, this.canvasWidth / 2, this.canvasHeight / 2 + 50);
    ctx.textAlign = 'start';
  }

  saveScore() {
    if (this.score > this.topScore) {
      localStorage.setItem('flappyTopScore', this.score.toString());
      this.topScore = this.score;
    }
  }
}

// Export for testing
export { Bird, Pipe, Game };

// If running in a browser, auto-start when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const game = new Game(canvas);
      game.start();
    }
  });
}
