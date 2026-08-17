class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.bird = {
      x: 80,
      y: this.height / 2,
      width: 34,
      height: 24,
      velocity: 0,
      gravity: 0.6,
      jump: -9
    };

    this.pipes = [];
    this.pipeWidth = 60;
    this.pipeGap = 140;
    this.pipeSpeed = 2.5;
    this.pipeInterval = 120;
    this.frame = 0;

    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.paused = false;

    this.bgColor = '#70c5ce';
    this.groundY = this.height - 30;

    this.addPipe = this.addPipe.bind(this);
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
    this.loop = this.loop.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.start = this.start.bind(this);
    this.reset = this.reset.bind(this);
  }

  start() {
    this.started = true;
    this.reset();
    this.loop();
  }

  reset() {
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frame = 0;
  }

  handleInput() {
    if (!this.started) {
      this.start();
      return;
    }
    if (this.gameOver) {
      this.reset();
      return;
    }
    this.bird.velocity = this.bird.jump;
  }

  addPipe() {
    const minPipeHeight = 50;
    const maxPipeHeight = this.height - this.pipeGap - minPipeHeight - 30;
    const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
    this.pipes.push({
      x: this.width,
      topHeight: topHeight,
      bottomY: topHeight + this.pipeGap,
      passed: false
    });
  }

  update() {
    if (this.gameOver || !this.started) return;

    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    if (this.bird.y + this.bird.height > this.groundY || this.bird.y < 0) {
      this.gameOver = true;
    }

    this.frame++;
    if (this.frame % this.pipeInterval === 0) {
      this.addPipe();
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      if (
        this.bird.x + this.bird.width > pipe.x &&
        this.bird.x < pipe.x + this.pipeWidth
      ) {
        if (
          this.bird.y < pipe.topHeight ||
          this.bird.y + this.bird.height > pipe.bottomY
        ) {
          this.gameOver = true;
        }
        if (!pipe.passed && this.bird.x > pipe.x + this.pipeWidth / 2) {
          pipe.passed = true;
          this.score++;
        }
      }

      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#2ecc71';
    for (const pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
      this.ctx.fillStyle = '#27ae60';
      this.ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, this.pipeWidth + 6, 20);
      this.ctx.fillRect(pipe.x - 3, pipe.bottomY, this.pipeWidth + 6, 20);
      this.ctx.fillStyle = '#2ecc71';
    }

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
    this.ctx.fillStyle = '#e67e22';
    this.ctx.fillRect(this.bird.x + this.bird.width - 8, this.bird.y + 4, 8, 4);
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + 24, this.bird.y + 8, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + 25, this.bird.y + 7, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 35);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 20);
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Press Space to restart', this.width / 2, this.height / 2 + 30);
      this.ctx.textAlign = 'start';
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
