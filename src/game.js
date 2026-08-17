// src/game.js
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.bird = {
      x: 50,
      y: this.height / 2,
      radius: 15,
      velocity: 0,
      gravity: 0.5,
      jumpPower: -8
    };
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.pipeGap = 150;
    this.pipeWidth = 60;
    this.pipeSpeed = 2;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.loop();
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
      return;
    }
    this.bird.velocity = this.bird.jumpPower;
  }

  reset() {
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Check boundaries
    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.height) {
      this.gameOver = true;
    }

    // Generate pipes
    this.frameCount++;
    if (this.frameCount % 100 === 0) {
      const gapStart = Math.random() * (this.height - this.pipeGap);
      this.pipes.push({
        x: this.width,
        gapStart,
        gapEnd: gapStart + this.pipeGap,
        passed: false
      });
    }

    // Move pipes
    for (let pipe of this.pipes) {
      pipe.x -= this.pipeSpeed;
    }

    // Remove off-screen pipes
    this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);

    // Collision detection
    for (let pipe of this.pipes) {
      if (
        this.bird.x + this.bird.radius > pipe.x &&
        this.bird.x - this.bird.radius < pipe.x + this.pipeWidth
      ) {
        if (
          this.bird.y - this.bird.radius < pipe.gapStart ||
          this.bird.y + this.bird.radius > pipe.gapEnd
        ) {
          this.gameOver = true;
        }
      }

      // Score
      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw bird
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw pipes
    this.ctx.fillStyle = '#00AA00';
    for (let pipe of this.pipes) {
      // Top pipe
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapStart);
      // Bottom pipe
      this.ctx.fillRect(pipe.x, pipe.gapEnd, this.pipeWidth, this.height - pipe.gapEnd);
    }

    // Draw score
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '36px Arial';
      this.ctx.fillText('Game Over', this.width / 2 - 100, this.height / 2);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press Space to restart', this.width / 2 - 80, this.height / 2 + 40);
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
