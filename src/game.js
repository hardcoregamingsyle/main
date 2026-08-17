class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.gravity = 0.5;
    this.lift = -8;
    this.pipeSpeed = 2;
    this.pipeGap = 150;
    this.pipeWidth = 60;
    this.pipeFrequency = 90;
    this.bird = {
      x: 80,
      y: this.height / 2,
      radius: 15,
      velocity: 0
    };
    this.pipes = [];
    this.frameCount = 0;
    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.animationId = null;
  }

  start() {
    this.started = true;
    this.gameLoop();
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
      return;
    }
    if (!this.started) return;
    this.bird.velocity = this.lift;
  }

  reset() {
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.frameCount = 0;
    this.gameOver = false;
  }

  update() {
    if (!this.started || this.gameOver) return;

    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;

    if (this.bird.y + this.bird.radius > this.height || this.bird.y - this.bird.radius < 0) {
      this.gameOver = true;
      return;
    }

    if (this.frameCount % this.pipeFrequency === 0) {
      const top = Math.random() * (this.height - this.pipeGap - 100) + 50;
      this.pipes.push({
        x: this.width,
        topHeight: top,
        bottomY: top + this.pipeGap,
        passed: false
      });
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
        continue;
      }

      if (
        this.bird.x + this.bird.radius > pipe.x &&
        this.bird.x - this.bird.radius < pipe.x + this.pipeWidth &&
        (this.bird.y - this.bird.radius < pipe.topHeight || this.bird.y + this.bird.radius > pipe.bottomY)
      ) {
        this.gameOver = true;
        return;
      }

      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
    }

    this.frameCount++;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#2d5a27';
    for (const pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
      this.ctx.fillStyle = '#1b3d1b';
      this.ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, this.pipeWidth + 6, 20);
      this.ctx.fillRect(pipe.x - 3, pipe.bottomY, this.pipeWidth + 6, 20);
      this.ctx.fillStyle = '#2d5a27';
    }

    this.ctx.fillStyle = '#f5d742';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 20);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press Space to restart', this.width / 2, this.height / 2 + 20);
      this.ctx.textAlign = 'start';
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
