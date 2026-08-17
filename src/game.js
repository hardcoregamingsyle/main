class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
    this.gravity = 0.5;
    this.jumpStrength = -8;
    this.pipes = [];
    this.pipeGap = 150;
    this.pipeWidth = 50;
    this.pipeSpeed = 2;
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.frame = 0;
  }

  start() {
    this.gameStarted = true;
    this.loop();
  }

  loop() {
    if (!this.gameStarted) return;
    this.update();
    this.draw();
    if (!this.gameOver) {
      requestAnimationFrame(() => this.loop());
    }
  }

  update() {
    if (this.gameOver) return;
    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;
    if (this.bird.y < 0) {
      this.bird.y = 0;
      this.bird.velocity = 0;
    }
    if (this.bird.y + this.bird.height > this.canvas.height) {
      this.gameOver = true;
    }
    this.frame++;
    if (this.frame % 100 === 0) {
      const pipeHeight = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
      this.pipes.push({
        x: this.canvas.width,
        topHeight: pipeHeight,
        bottomY: pipeHeight + this.pipeGap,
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
      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
      if (
        this.bird.x < pipe.x + this.pipeWidth &&
        this.bird.x + this.bird.width > pipe.x &&
        (this.bird.y < pipe.topHeight || this.bird.y + this.bird.height > pipe.bottomY)
      ) {
        this.gameOver = true;
      }
    }
    if (this.bird.y + this.bird.height >= this.canvas.height) {
      this.gameOver = true;
    }
  }

  draw() {
    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#deb887';
    this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
    this.ctx.fillStyle = '#228b22';
    for (const pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
      this.ctx.fillStyle = '#2e8b57';
      this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
      this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
      this.ctx.fillStyle = '#228b22';
    }
    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2, this.bird.width / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + this.bird.width * 0.7, this.bird.y + this.bird.height * 0.3, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 30px Arial';
    this.ctx.fillText(this.score, this.canvas.width / 2, 50);
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 40px Arial';
      this.ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2 - 20);
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Press Space to restart', this.canvas.width / 2 - 80, this.canvas.height / 2 + 30);
    }
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
      return;
    }
    if (this.gameStarted) {
      this.bird.velocity = this.jumpStrength;
    }
  }

  reset() {
    this.bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
    this.pipes = [];
    this.score = 0;
    this.frame = 0;
    this.gameOver = false;
    this.gameStarted = true;
    this.loop();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
