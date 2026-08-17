class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = { x: 60, y: canvas.height / 2, vy: 0, radius: 15, gravity: 0.5, jump: -8 };
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.frameCount = 0;
    this.pipeWidth = 60;
    this.pipeGap = 150;
    this.pipeSpeed = 2;
    this.pipeInterval = 90;
  }

  start() {
    this.loop();
  }

  handleInput() {
    if (!this.gameOver) {
      if (!this.started) {
        this.started = true;
      }
      this.bird.vy = this.bird.jump;
    } else {
      this.reset();
      this.started = true;
    }
  }

  reset() {
    this.bird.y = this.canvas.height / 2;
    this.bird.vy = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
  }

  update() {
    if (!this.started || this.gameOver) return;

    this.bird.vy += this.bird.gravity;
    this.bird.y += this.bird.vy;

    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.canvas.height) {
      this.gameOver = true;
    }

    this.frameCount++;
    if (this.frameCount % this.pipeInterval === 0) {
      this.pipes.push(this.generatePipe());
    }

    for (let pipe of this.pipes) {
      pipe.x -= this.pipeSpeed;
    }

    this.pipes = this.pipes.filter(p => p.x + this.pipeWidth > 0);

    for (let pipe of this.pipes) {
      if (
        this.bird.x + this.bird.radius > pipe.x &&
        this.bird.x - this.bird.radius < pipe.x + this.pipeWidth
      ) {
        if (
          this.bird.y - this.bird.radius < pipe.top ||
          this.bird.y + this.bird.radius > pipe.bottom
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

  generatePipe() {
    const pipeHeight = Math.floor(Math.random() * (this.canvas.height - this.pipeGap - 100)) + 50;
    return {
      x: this.canvas.width,
      top: pipeHeight,
      bottom: pipeHeight + this.pipeGap,
      passed: false
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'yellow';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'green';
    for (let pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.top);
      this.ctx.fillRect(pipe.x, pipe.bottom, this.pipeWidth, this.canvas.height - pipe.bottom);
    }

    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (!this.started) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Press Space to Start', 100, this.canvas.height / 2);
    }

    if (this.gameOver) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '30px Arial';
      this.ctx.fillText('Game Over', 120, this.canvas.height / 2);
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Press Space to Restart', 110, this.canvas.height / 2 + 30);
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
