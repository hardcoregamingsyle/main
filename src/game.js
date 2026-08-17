class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = {
      x: 50,
      y: canvas.height / 2,
      width: 30,
      height: 30,
      velocity: 0,
    };
    this.gravity = 0.5;
    this.lift = -8;
    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 150;
    this.pipeSpeed = 2;
    this.spawnInterval = 90;
    this.frameCount = 0;
    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.animationId = null;
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.gameOver = false;
    this.score = 0;
    this.bird.y = this.canvas.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.frameCount = 0;
    this.gameLoop();
  }

  handleInput() {
    if (this.gameOver) {
      this.restart();
    } else {
      this.bird.velocity = this.lift;
    }
  }

  gameLoop() {
    if (!this.gameOver) {
      this.update();
    }
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;

    if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
      this.gameOver = true;
    }

    this.frameCount++;
    if (this.frameCount % this.spawnInterval === 0) {
      const minPipeHeight = 50;
      const maxPipeHeight = this.canvas.height - this.pipeGap - minPipeHeight;
      const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
      this.pipes.push({
        x: this.canvas.width,
        topHeight: topHeight,
        bottomHeight: this.canvas.height - topHeight - this.pipeGap,
        passed: false,
      });
    }

    for (let pipe of this.pipes) {
      pipe.x -= this.pipeSpeed;
    }

    this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);

    for (let pipe of this.pipes) {
      if (
        this.bird.x + this.bird.width > pipe.x &&
        this.bird.x < pipe.x + this.pipeWidth
      ) {
        if (
          this.bird.y < pipe.topHeight ||
          this.bird.y + this.bird.height > this.canvas.height - pipe.bottomHeight
        ) {
          this.gameOver = true;
        }
      }

      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#558b2f';
    for (let pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.fillRect(pipe.x, this.canvas.height - pipe.bottomHeight, this.pipeWidth, pipe.bottomHeight);
    }

    this.ctx.fillStyle = '#fdd835';
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '36px Arial';
      this.ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press Space to restart', this.canvas.width / 2 - 90, this.canvas.height / 2 + 40);
    }
  }

  restart() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.started = false;
    this.start();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
