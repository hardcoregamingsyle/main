class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = { x: 50, y: canvas.height / 2, width: 30, height: 30, velocity: 0, gravity: 0.5, jump: -8 };
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.pipeGap = 150;
    this.pipeWidth = 60;
    this.pipeSpeed = 2;
    this.lastPipeTime = 0;
    this.maxPipesInScreen = 3;
    this.animationId = null;
  }
  start() {
    this.gameLoop();
  }
  handleInput() {
    if (!this.gameOver) {
      this.bird.velocity = this.bird.jump;
    } else {
      this.reset();
    }
  }
  reset() {
    this.bird.y = this.canvas.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.lastPipeTime = 0;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.start();
  }
  gameLoop() {
    this.update();
    this.draw();
    if (!this.gameOver) {
      this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
  }
  update() {
    if (this.gameOver) return;
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;
    if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
      this.gameOver = true;
    }
    this.frameCount++;
    if (this.frameCount - this.lastPipeTime > 100) {
      const gapY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
      this.pipes.push({ x: this.canvas.width, gapY, passed: false });
      this.lastPipeTime = this.frameCount;
    }
    for (let pipe of this.pipes) {
      pipe.x -= this.pipeSpeed;
      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        this.score++;
        pipe.passed = true;
      }
      if (this.bird.x + this.bird.width > pipe.x && this.bird.x < pipe.x + this.pipeWidth) {
        if (this.bird.y < pipe.gapY || this.bird.y + this.bird.height > pipe.gapY + this.pipeGap) {
          this.gameOver = true;
        }
      }
    }
    this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'yellow';
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
    this.ctx.fillStyle = 'green';
    for (let pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
      this.ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.canvas.height - pipe.gapY - this.pipeGap);
    }
    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 30);
    if (this.gameOver) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '36px Arial';
      this.ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2);
    }
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}