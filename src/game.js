class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.gravity = 0.5;
    this.jumpForce = -8;
    this.pipeSpeed = 2;
    this.pipeSpacing = 150;
    this.pipeWidth = 60;
    this.pipeGap = 150;

    this.bird = {
      x: 80,
      y: this.height / 2,
      radius: 15,
      velocity: 0
    };

    this.pipes = [];
    this.score = 0;
    this.gameActive = false;
    this.gameOverTriggered = false;

    this.frameCount = 0;
    this.pipeInterval = 90;

    this.boundKeydown = this.onKeydown.bind(this);
    this.boundClick = this.onClick.bind(this);
  }

  start() {
    this.gameActive = true;
    this.gameOverTriggered = false;
    this.score = 0;
    this.pipes = [];
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.frameCount = 0;

    document.addEventListener('keydown', this.boundKeydown);
    this.canvas.addEventListener('click', this.boundClick);
    this.loop();
  }

  onKeydown(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      this.handleInput();
    }
  }

  onClick() {
    this.handleInput();
  }

  handleInput() {
    if (this.gameActive) {
      this.bird.velocity = this.jumpForce;
    } else if (!this.gameActive && this.gameOverTriggered) {
      this.start();
    }
  }

  loop() {
    if (!this.gameActive) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;

    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.height) {
      this.gameOver();
      return;
    }

    this.frameCount++;
    if (this.frameCount % this.pipeInterval === 0) {
      const gapY = Math.random() * (this.height - this.pipeGap - 100) + 50;
      this.pipes.push({
        x: this.width,
        topHeight: gapY,
        bottomY: gapY + this.pipeGap,
        scored: false
      });
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;

      if (
        this.bird.x + this.bird.radius > pipe.x &&
        this.bird.x - this.bird.radius < pipe.x + this.pipeWidth &&
        (this.bird.y - this.bird.radius < pipe.topHeight ||
         this.bird.y + this.bird.radius > pipe.bottomY)
      ) {
        this.gameOver();
        return;
      }

      if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
        this.score++;
        pipe.scored = true;
      }

      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#4CAF50';
    for (const pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
    }

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (!this.gameActive && this.gameOverTriggered) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '30px Arial';
      this.ctx.fillText('Game Over', this.width/2 - 80, this.height/2 - 20);
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Click or press Space to restart', this.width/2 - 120, this.height/2 + 20);
    }
  }

  gameOver() {
    this.gameActive = false;
    this.gameOverTriggered = true;
    document.removeEventListener('keydown', this.boundKeydown);
    this.canvas.removeEventListener('click', this.boundClick);
  }
}