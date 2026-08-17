class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.bird = {
      x: 50,
      y: this.height / 2,
      vy: 0,
      radius: 15,
      gravity: 0.5,
      lift: -8
    };
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.pipeGap = 150;
    this.pipeWidth = 60;
    this.pipeSpeed = 2;
    this.animationId = null;
  }

  start() {
    this.reset();
    this.loop();
  }

  reset() {
    this.bird.y = this.height / 2;
    this.bird.vy = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
  }

  loop() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
    } else {
      this.bird.vy = this.bird.lift;
    }
  }

  update() {
    if (this.gameOver) return;

    this.bird.vy += this.bird.gravity;
    this.bird.y += this.bird.vy;

    // check top/bottom boundaries
    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.height) {
      this.gameOver = true;
    }

    // spawn pipes
    if (this.frameCount % 100 === 0) {
      const topHeight = Math.random() * (this.height - this.pipeGap - 100) + 50;
      this.pipes.push({
        x: this.width,
        topHeight: topHeight,
        bottomY: topHeight + this.pipeGap
      });
    }
    this.frameCount++;

    // move pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;
      if (this.pipes[i].x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
        this.score++;
      }
    }

    // collision detection
    for (const pipe of this.pipes) {
      if (this.bird.x + this.bird.radius > pipe.x && this.bird.x - this.bird.radius < pipe.x + this.pipeWidth) {
        if (this.bird.y - this.bird.radius < pipe.topHeight || this.bird.y + this.bird.radius > pipe.bottomY) {
          this.gameOver = true;
        }
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // background
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, this.width, this.height);

    // pipes
    ctx.fillStyle = '#73bf2e';
    for (const pipe of this.pipes) {
      ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
    }

    // bird
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // score
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + this.score, 10, 30);

    // game over
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#fff';
      ctx.font = '36px Arial';
      ctx.fillText('Game Over', this.width / 2 - 100, this.height / 2);
      ctx.font = '18px Arial';
      ctx.fillText('Press Space to restart', this.width / 2 - 100, this.height / 2 + 40);
    }
  }
}
