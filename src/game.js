class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = { x: 50, y: canvas.height / 2, width: 30, height: 30, velocity: 0, gravity: 0.5, lift: -8 };
    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 150;
    this.pipeSpeed = 2;
    this.frameCount = 0;
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.birdColor = '#FFD700';
    this.pipeColor = '#00AA00';
    this.bgColor = '#70C5CE';
    this.textColor = '#FFFFFF';
    this.isRunning = false;
    this.frameInterval = 1000 / 60;
    this.lastFrame = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.gameStarted = true;
    this.reset();
    this.loop();
  }

  reset() {
    this.bird.y = this.canvas.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.frameCount = 0;
    this.score = 0;
    this.gameOver = false;
  }

  handleInput() {
    if (this.gameOver) {
      this.start();
      return;
    }
    if (this.gameStarted && !this.gameOver) {
      this.bird.velocity = this.bird.lift;
    }
  }

  loop() {
    if (!this.isRunning) return;
    const now = Date.now();
    if (now - this.lastFrame >= this.frameInterval) {
      this.lastFrame = now;
      this.update();
      this.draw();
    }
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    // Bird physics
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Check boundaries
    if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
      this.endGame();
    }

    // Generate pipes
    this.frameCount++;
    if (this.frameCount % 90 === 0) {
      const gapY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
      this.pipes.push({ x: this.canvas.width, gapY: gapY, width: this.pipeWidth, gap: this.pipeGap, scored: false });
    }

    // Move pipes and check collisions
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      // Collision detection
      if (
        this.bird.x + this.bird.width > pipe.x &&
        this.bird.x < pipe.x + pipe.width
      ) {
        if (
          this.bird.y < pipe.gapY ||
          this.bird.y + this.bird.height > pipe.gapY + pipe.gap
        ) {
          this.endGame();
        }
      }

      // Scoring
      if (!pipe.scored && pipe.x + pipe.width < this.bird.x) {
        pipe.scored = true;
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
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw pipes
    ctx.fillStyle = this.pipeColor;
    for (const pipe of this.pipes) {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + pipe.gap, pipe.width, this.canvas.height - pipe.gapY - pipe.gap);
    }

    // Draw bird
    ctx.fillStyle = this.birdColor;
    ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

    // Draw score
    ctx.fillStyle = this.textColor;
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + this.score, 10, 30);

    // Game over message
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 80);
      ctx.fillStyle = this.textColor;
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
      ctx.font = '16px Arial';
      ctx.fillText('Press Space to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
      ctx.textAlign = 'start';
    } else if (!this.gameStarted) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 80);
      ctx.fillStyle = this.textColor;
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Press Space to Start', this.canvas.width / 2, this.canvas.height / 2);
      ctx.textAlign = 'start';
    }
  }

  endGame() {
    this.gameOver = true;
    this.isRunning = false;
  }
}

// Export for Node.js (Jest) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
} else {
  window.Game = Game;
}
