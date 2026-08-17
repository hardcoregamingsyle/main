// Flappy Bird Game - Core Game Logic

class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.width = 34;
    this.height = 24;
    this.gravity = 0.5;
    this.lift = -10;
    this.maxVelocity = 10;
    this.minVelocity = -10;
  }

  jump() {
    this.velocity = this.lift;
  }

  update() {
    this.velocity += this.gravity;
    if (this.velocity > this.maxVelocity) this.velocity = this.maxVelocity;
    if (this.velocity < this.minVelocity) this.velocity = this.minVelocity;
    this.y += this.velocity;
  }

  collidesWith(pipe) {
    // Check collision with a pipe
    const birdRect = {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height
    };

    // Top pipe
    const topPipeRect = {
      x: pipe.x,
      y: 0,
      w: pipe.width,
      h: pipe.height
    };

    // Bottom pipe
    const bottomPipeY = pipe.height + pipe.gap;
    const bottomPipeRect = {
      x: pipe.x,
      y: bottomPipeY,
      w: pipe.width,
      h: 600 - bottomPipeY // canvas height
    };

    return this.rectCollision(birdRect, topPipeRect) || this.rectCollision(birdRect, bottomPipeRect);
  }

  rectCollision(r1, r2) {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  }

  isOutOfBounds(canvasHeight) {
    return this.y - this.height / 2 < 0 || this.y + this.height / 2 > canvasHeight;
  }

  draw(ctx) {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}

class Pipe {
  constructor(x, height) {
    this.x = x;
    this.height = height;
    this.width = 60;
    this.gap = 150;
    this.speed = 3;
    this.passed = false;
  }

  update() {
    this.x -= this.speed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  draw(ctx, canvasHeight) {
    // Top pipe
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x, 0, this.width, this.height);
    // Bottom pipe
    const bottomPipeY = this.height + this.gap;
    ctx.fillRect(this.x, bottomPipeY, this.width, canvasHeight - bottomPipeY);
  }
}

class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.bird = new Bird(150, canvas.height / 2);
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.pipeInterval = 90; // frames between pipes
    this.lastPipeFrame = 0;
    this.baseSpeed = 3;
  }

  start() {
    this.gameLoop();
  }

  gameLoop() {
    if (this.gameOver) return;

    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.bird.update();
    this.frameCount++;

    // Add new pipes
    if (this.frameCount - this.lastPipeFrame >= this.pipeInterval) {
      const minHeight = 50;
      const maxHeight = this.canvas.height - 200;
      const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      this.pipes.push(new Pipe(this.canvas.width, height));
      this.lastPipeFrame = this.frameCount;
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();

      // Check collision
      if (this.bird.collidesWith(pipe)) {
        this.gameOver = true;
        return;
      }

      // Score
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }

      // Remove off-screen pipes
      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }

    // Check bounds
    if (this.bird.isOutOfBounds(this.canvas.height)) {
      this.gameOver = true;
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw pipes
    for (const pipe of this.pipes) {
      pipe.draw(this.ctx, this.canvas.height);
    }

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw score
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press Space to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }

  handleInput(key) {
    if (key === ' ' || key === 'Space') {
      if (this.gameOver) {
        this.restart();
      } else {
        this.bird.jump();
      }
    }
  }

  restart() {
    this.bird = new Bird(150, this.canvas.height / 2);
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.lastPipeFrame = 0;
  }
}

// Export for module usage (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Bird, Pipe, Game };
}

// Browser global
if (typeof window !== 'undefined') {
  window.Bird = Bird;
  window.Pipe = Pipe;
  window.Game = Game;
}
