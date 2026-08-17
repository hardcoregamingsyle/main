class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.reset();
    this.running = false;
    this.animationId = null;
  }

  reset() {
    this.bird = {
      x: 50,
      y: this.height / 2,
      width: 30,
      height: 30,
      velocity: 0,
      gravity: 0.5,
      jump: -8
    };
    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 150;
    this.pipeSpeed = 3;
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.spawnInterval = 100;
  }

  start() {
    this.running = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.running) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (this.gameOver) return;

    // Bird physics
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Check boundaries
    if (this.bird.y + this.bird.height > this.height || this.bird.y < 0) {
      this.endGame();
    }

    // Spawn pipes
    if (this.frameCount % this.spawnInterval === 0) {
      this.spawnPipe();
    }

    // Move pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      // Remove off-screen pipes
      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
        continue;
      }

      // Collision detection
      if (this.checkCollision(this.bird, pipe)) {
        this.endGame();
      }

      // Scoring: when pipe passes bird's x
      if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.scored = true;
        this.score++;
      }
    }

    this.frameCount++;
  }

  spawnPipe() {
    const minHeight = 50;
    const maxHeight = this.height - this.pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomHeight = this.height - topHeight - this.pipeGap;

    this.pipes.push({
      x: this.width,
      topHeight: topHeight,
      bottomHeight: bottomHeight,
      width: this.pipeWidth,
      scored: false
    });
  }

  checkCollision(bird, pipe) {
    // Bird rect
    if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
      // Check top pipe
      if (bird.y < pipe.topHeight) return true;
      // Check bottom pipe
      if (bird.y + bird.height > this.height - pipe.bottomHeight) return true;
    }
    return false;
  }

  endGame() {
    this.gameOver = true;
    this.running = false;
    cancelAnimationFrame(this.animationId);
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
      this.start();
    } else {
      this.bird.velocity = this.bird.jump;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw pipes
    this.ctx.fillStyle = '#4CAF50';
    for (const pipe of this.pipes) {
      // Top pipe
      this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      // Bottom pipe
      this.ctx.fillRect(pipe.x, this.height - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
    }

    // Draw bird
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

    // Draw score
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '36px Arial';
      this.ctx.fillText('Game Over', this.width/2 - 100, this.height/2);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press Space to restart', this.width/2 - 100, this.height/2 + 40);
    }
  }
}
