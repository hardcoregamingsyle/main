class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.bird = { x: 50, y: this.height/2, radius: 15, velocity: 0, gravity: 0.5, jump: -8 };
    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 150;
    this.pipeSpeed = 2;
    this.score = 0;
    this.gameOver = false;
    this.frame = 0;
    this.pipeInterval = 100;
    this.boundHandleInput = this.handleInput.bind(this);
    this.boundLoop = this.loop.bind(this);
  }

  start() {
    this.reset();
    document.addEventListener('keydown', this.boundHandleInput);
    this.canvas.addEventListener('click', this.boundHandleInput);
    requestAnimationFrame(this.boundLoop);
  }

  reset() {
    this.bird.y = this.height/2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frame = 0;
  }

  handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    e.preventDefault();
    if (this.gameOver) {
      this.reset();
      this.start();
      return;
    }
    this.bird.velocity = this.bird.jump;
  }

  loop() {
    if (this.gameOver) {
      this.draw();
      return;
    }
    this.update();
    this.draw();
    requestAnimationFrame(this.boundLoop);
  }

  update() {
    this.frame++;
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.height) {
      this.gameOver = true;
    }

    if (this.frame % this.pipeInterval === 0) {
      const gapY = Math.random() * (this.height - this.pipeGap - 100) + 50;
      this.pipes.push({ x: this.width, gapY: gapY, passed: false });
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      if (
        this.bird.x + this.bird.radius > pipe.x &&
        this.bird.x - this.bird.radius < pipe.x + this.pipeWidth &&
        (this.bird.y - this.bird.radius < pipe.gapY || this.bird.y + this.bird.radius > pipe.gapY + this.pipeGap)
      ) {
        this.gameOver = true;
      }

      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }

      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#3e8e41';
    for (const pipe of this.pipes) {
      ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
      ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.height - pipe.gapY - this.pipeGap);
    }

    ctx.fillStyle = '#f4d03f';
    ctx.beginPath();
    ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + this.score, 10, 30);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#fff';
      ctx.font = '36px Arial';
      ctx.fillText('Game Over', this.width/2 - 80, this.height/2);
      ctx.font = '18px Arial';
      ctx.fillText('Press Space or Click to restart', this.width/2 - 120, this.height/2 + 40);
    }
  }
}
