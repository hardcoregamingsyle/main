class Bird {
  constructor(x, y, width = 30, height = 30) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = 0;
    this.gravity = 0.5;
    this.lift = -10;
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

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

class Pipe {
  constructor(canvasWidth, canvasHeight, gap = 150, width = 60) {
    this.x = canvasWidth;
    this.width = width;
    this.gap = gap;
    this.canvasHeight = canvasHeight;
    this.top = Math.random() * (canvasHeight - gap - 100) + 50;
    this.bottom = this.top + gap;
    this.speed = 2;
    this.passed = false;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = '#228B22';
    // top pipe
    ctx.fillRect(this.x, 0, this.width, this.top);
    // bottom pipe
    ctx.fillRect(this.x, this.bottom, this.width, this.canvasHeight - this.bottom);
  }

  getBounds() {
    return {
      top: {
        x: this.x,
        y: 0,
        width: this.width,
        height: this.top,
      },
      bottom: {
        x: this.x,
        y: this.bottom,
        width: this.width,
        height: this.canvasHeight - this.bottom,
      },
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = new Bird(150, canvas.height / 2);
    this.pipes = [];
    this.frameCount = 0;
    this.spawnInterval = 100;
    this.score = 0;
    this.gameOver = false;
    this.running = false;
  }

  start() {
    this.running = true;
    this.gameOver = false;
    this.score = 0;
    this.pipes = [];
    this.bird = new Bird(150, this.canvas.height / 2);
    this.frameCount = 0;
    this.loop();
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    if (!this.gameOver) {
      requestAnimationFrame(() => this.loop());
    }
  }

  update() {
    if (this.gameOver) return;
    this.bird.update();

    this.frameCount++;
    if (this.frameCount % this.spawnInterval === 0) {
      this.pipes.push(new Pipe(this.canvas.width, this.canvas.height));
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();
      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
        continue;
      }
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
      if (this.checkCollision(pipe)) {
        this.gameOver = true;
        this.running = false;
      }
    }

    // Check if bird hits ground or ceiling
    if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
      this.gameOver = true;
      this.running = false;
    }
  }

  checkCollision(pipe) {
    const birdBounds = this.bird.getBounds();
    const pipeBounds = pipe.getBounds();

    // Check top pipe
    if (
      birdBounds.x < pipeBounds.top.x + pipeBounds.top.width &&
      birdBounds.x + birdBounds.width > pipeBounds.top.x &&
      birdBounds.y < pipeBounds.top.y + pipeBounds.top.height &&
      birdBounds.y + birdBounds.height > pipeBounds.top.y
    ) {
      return true;
    }

    // Check bottom pipe
    if (
      birdBounds.x < pipeBounds.bottom.x + pipeBounds.bottom.width &&
      birdBounds.x + birdBounds.width > pipeBounds.bottom.x &&
      birdBounds.y < pipeBounds.bottom.y + pipeBounds.bottom.height &&
      birdBounds.y + birdBounds.height > pipeBounds.bottom.y
    ) {
      return true;
    }

    return false;
  }

  draw() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pipes
    for (const pipe of this.pipes) {
      pipe.draw(ctx);
    }

    // Bird
    this.bird.draw(ctx);

    // Score
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFF';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
      ctx.textAlign = 'start';
    }
  }

  handleInput() {
    if (!this.gameOver) {
      this.bird.jump();
    } else {
      this.start();
    }
  }
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.Bird = Bird;
  window.Pipe = Pipe;
  window.Game = Game;
}

// Export for module use (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Bird, Pipe, Game };
}
