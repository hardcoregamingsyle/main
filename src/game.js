class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = {
      x: 50,
      y: canvas.height / 2,
      vy: 0,
      size: 20
    };
    this.gravity = 0.5;
    this.jumpForce = -8;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.pipeWidth = 50;
    this.pipeGap = 150;
    this.pipeSpeed = 2;
    this.pipeInterval = 100;
    this.animationId = null;
  }

  start() {
    this.gameOver = false;
    this.score = 0;
    this.pipes = [];
    this.bird.y = this.canvas.height / 2;
    this.bird.vy = 0;
    this.frameCount = 0;
    this.loop = this.loop.bind(this);
    this.animationId = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop() {
    if (!this.gameOver) {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(this.loop);
    } else {
      this.drawGameOver();
    }
  }

  update() {
    // Bird physics
    this.bird.vy += this.gravity;
    this.bird.y += this.bird.vy;

    // Check boundaries
    if (this.bird.y < 0 || this.bird.y + this.bird.size > this.canvas.height) {
      this.gameOver = true;
    }

    // Generate pipes
    if (this.frameCount % this.pipeInterval === 0) {
      const minHeight = 50;
      const maxHeight = this.canvas.height - this.pipeGap - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      this.pipes.push({
        x: this.canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + this.pipeGap,
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
        this.bird.x + this.bird.size > pipe.x &&
        this.bird.x < pipe.x + this.pipeWidth
      ) {
        if (
          this.bird.y < pipe.topHeight ||
          this.bird.y + this.bird.size > pipe.bottomY
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

    this.frameCount++;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw bird
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.size, this.bird.size);
    // Draw pipes
    this.ctx.fillStyle = '#228B22';
    for (let pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
    }
    // Draw score
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 30);
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '30px Arial';
    this.ctx.fillText('Game Over', this.canvas.width/2 - 80, this.canvas.height/2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Score: ' + this.score, this.canvas.width/2 - 50, this.canvas.height/2 + 40);
    this.ctx.fillText('Press Space to restart', this.canvas.width/2 - 90, this.canvas.height/2 + 70);
  }

  handleInput() {
    if (this.gameOver) {
      this.start();
    } else {
      this.bird.vy = this.jumpForce;
    }
  }
}
