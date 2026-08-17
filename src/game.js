class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.gravity = 0.5;
    this.lift = -10;
    this.width = 34;
    this.height = 24;
  }

  jump() {
    this.velocity = this.lift;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
  }

  draw(ctx) {
    // Draw a simple bird (girl themed)
    ctx.fillStyle = '#FF69B4'; // pink
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Draw eyes and bow
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 20, this.y + 5, 5, 5);
    // bow
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(this.x + 10, this.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Pipe {
  constructor(x, gapY, gapHeight = 150) {
    this.x = x;
    this.width = 50;
    this.gapY = gapY;
    this.gapHeight = gapHeight;
    this.passed = false;
  }

  update(speed) {
    this.x -= speed;
  }

  draw(ctx) {
    ctx.fillStyle = '#228B22';
    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.gapY);
    // Bottom pipe
    ctx.fillRect(this.x, this.gapY + this.gapHeight, this.width, ctx.canvas.height - this.gapY - this.gapHeight);
  }

  collidesWith(bird) {
    // Simple AABB collision
    if (bird.x < this.x + this.width && bird.x + bird.width > this.x) {
      if (bird.y < this.gapY || bird.y + bird.height > this.gapY + this.gapHeight) {
        return true;
      }
    }
    return false;
  }
}

class GirlFlapper {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.bird = new Bird(150, canvas.height / 2 - 12);
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.speed = 2;
    this.frameCount = 0;
    this.pipeInterval = 100;
    this.setupControls();
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (this.gameOver) {
          this.reset();
        } else {
          this.bird.jump();
        }
      }
    });
  }

  reset() {
    this.bird = new Bird(150, this.canvas.height / 2 - 12);
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
  }

  start() {
    this.loop();
  }

  loop() {
    if (!this.gameOver) {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }
  }

  update() {
    this.bird.update();
    this.frameCount++;

    // Add new pipe
    if (this.frameCount % this.pipeInterval === 0) {
      const gapY = Math.random() * (this.canvas.height - 150) + 50;
      this.pipes.push(new Pipe(this.canvas.width, gapY, 150));
    }

    // Update pipes
    for (let pipe of this.pipes) {
      pipe.update(this.speed);
    }

    // Remove off-screen pipes
    this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);

    // Check collisions
    for (let pipe of this.pipes) {
      if (pipe.collidesWith(this.bird)) {
        this.gameOver = true;
      }
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        this.score++;
        pipe.passed = true;
      }
    }

    // Check boundaries
    if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
      this.gameOver = true;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Background
    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.bird.draw(this.ctx);
    this.pipes.forEach(pipe => pipe.draw(this.ctx));

    // Score
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '48px Arial';
      this.ctx.fillText('Game Over', this.canvas.width / 2 - 120, this.canvas.height / 2);
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press Space to Restart', this.canvas.width / 2 - 120, this.canvas.height / 2 + 40);
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Bird, Pipe, GirlFlapper };
}
