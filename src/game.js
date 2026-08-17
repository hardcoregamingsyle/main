class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 400;
    this.canvas.height = 600;

    this.bird = {
      x: 80,
      y: this.canvas.height / 2,
      width: 30,
      height: 24,
      velocity: 0,
      gravity: 0.5,
      jumpPower: -8
    };

    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 140;
    this.pipeSpeed = 2;
    this.pipeSpawnInterval = 90; // frames
    this.frameCount = 0;

    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.frameId = null;

    this.groundY = this.canvas.height - 40;
    this.ceilingY = 0;

    this.bird.color = '#f4c542';
    this.bird.eyeColor = '#000';
    this.pipeColor = '#4caf50';
    this.bgColor = '#70c5ce';
    this.groundColor = '#8b4513';
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.gameOver = false;
    this.score = 0;
    this.pipes = [];
    this.frameCount = 0;
    this.bird.y = this.canvas.height / 2;
    this.bird.velocity = 0;
    this.loop();
  }

  stop() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.started = false;
  }

  loop() {
    if (!this.started) return;
    this.update();
    this.draw();
    this.frameId = requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    // Bird physics
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Check ground/ceiling
    if (this.bird.y + this.bird.height >= this.groundY || this.bird.y <= this.ceilingY) {
      this.gameOver = true;
      this.bird.y = Math.min(this.bird.y, this.groundY - this.bird.height);
      this.bird.velocity = 0;
      return;
    }

    // Spawn pipes
    this.frameCount++;
    if (this.frameCount % this.pipeSpawnInterval === 0) {
      this.spawnPipe();
    }

    // Move pipes & check collisions
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      // Collision test
      if (this.rectCollision(this.bird, pipe.top) || this.rectCollision(this.bird, pipe.bottom)) {
        this.gameOver = true;
        return;
      }

      // Score when bird passes pipe's right edge
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }

      // Remove off-screen pipes
      if (pipe.x + pipe.width < -50) {
        this.pipes.splice(i, 1);
      }
    }
  }

  spawnPipe() {
    const minHeight = 50;
    const maxHeight = this.canvas.height - this.pipeGap - minHeight - 40; // bottom area
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    const pipe = {
      x: this.canvas.width,
      width: this.pipeWidth,
      passed: false,
      top: {
        x: this.canvas.width,
        y: 0,
        width: this.pipeWidth,
        height: topHeight
      },
      bottom: {
        x: this.canvas.width,
        y: topHeight + this.pipeGap,
        width: this.pipeWidth,
        height: this.canvas.height - topHeight - this.pipeGap - 40
      }
    };
    this.pipes.push(pipe);
  }

  rectCollision(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Ground
    this.ctx.fillStyle = this.groundColor;
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

    // Pipes
    this.ctx.fillStyle = this.pipeColor;
    for (const pipe of this.pipes) {
      this.ctx.fillRect(pipe.top.x, pipe.top.y, pipe.top.width, pipe.top.height);
      this.ctx.fillRect(pipe.bottom.x, pipe.bottom.y, pipe.bottom.width, pipe.bottom.height);
    }

    // Bird
    this.ctx.fillStyle = this.bird.color;
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

    // Eye
    this.ctx.fillStyle = this.bird.eyeColor;
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + this.bird.width - 8, this.bird.y + 8, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score, this.canvas.width / 2, 40);

    // Game over overlay
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 36px Arial';
      this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press Space to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    // Start overlay
    if (!this.started && !this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 30px Arial';
      this.ctx.fillText('Flappy Bird', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press Space to start', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
  }

  handleInput() {
    if (this.gameOver) {
      this.stop();
      this.start();
      return;
    }
    if (!this.started) {
      this.start();
      return;
    }
    this.bird.velocity = this.bird.jumpPower;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
