// Flappy Bird Game Implementation
class Game {
  constructor(canvas, options = {}) {
    if (!canvas) {
      throw new Error('Game requires a canvas element');
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Bird properties
    this.bird = {
      x: 50,
      y: this.height / 2,
      radius: 15,
      velocity: 0,
      gravity: 0.5,
      jumpPower: -8,
      color: '#FFD700'
    };

    // Pipes
    this.pipes = [];
    this.pipeWidth = 60;
    this.pipeGap = 150;
    this.pipeSpeed = 2;
    this.pipeSpawnInterval = 100;
    this.frameCount = 0;

    // Game state
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.animationFrameId = null;
  }

  start() {
    this.gameLoop();
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
    } else {
      this.gameStarted = true;
      this.bird.velocity = this.bird.jumpPower;
    }
  }

  reset() {
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.frameCount = 0;
  }

  gameLoop() {
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (!this.gameStarted || this.gameOver) return;

    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    if (this.bird.y - this.bird.radius < 0) {
      this.bird.y = this.bird.radius;
      this.bird.velocity = 0;
    }
    if (this.bird.y + this.bird.radius > this.height) {
      this.gameOver = true;
    }

    if (this.frameCount % this.pipeSpawnInterval === 0) {
      let pipeY = Math.random() * (this.height - this.pipeGap - 100) + 50;
      this.pipes.push({
        x: this.width,
        y: pipeY,
        passed: false
      });
    }
    this.frameCount++;

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;

      if (this.checkCollision(this.pipes[i])) {
        this.gameOver = true;
      }

      if (!this.pipes[i].passed && this.pipes[i].x + this.pipeWidth < this.bird.x) {
        this.pipes[i].passed = true;
        this.score++;
      }

      if (this.pipes[i].x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }
  }

  checkCollision(pipe) {
    const birdLeft = this.bird.x - this.bird.radius;
    const birdRight = this.bird.x + this.bird.radius;
    const birdTop = this.bird.y - this.bird.radius;
    const birdBottom = this.bird.y + this.bird.radius;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + this.pipeWidth;
    const topPipeBottom = pipe.y;
    const bottomPipeTop = pipe.y + this.pipeGap;

    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
        return true;
      }
    }
    return false;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#73bf2e';
    for (let pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.y);
      this.ctx.fillRect(pipe.x, pipe.y + this.pipeGap, this.pipeWidth, this.height - pipe.y - this.pipeGap);
      this.ctx.fillStyle = '#558b2f';
      this.ctx.fillRect(pipe.x - 5, pipe.y - 20, this.pipeWidth + 10, 20);
      this.ctx.fillRect(pipe.x - 5, pipe.y + this.pipeGap, this.pipeWidth + 10, 20);
      this.ctx.fillStyle = '#73bf2e';
    }

    this.ctx.fillStyle = this.bird.color;
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + 5, this.bird.y - 5, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.moveTo(this.bird.x + this.bird.radius, this.bird.y);
    this.ctx.lineTo(this.bird.x + this.bird.radius + 10, this.bird.y);
    this.ctx.lineTo(this.bird.x + this.bird.radius, this.bird.y + 5);
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
    } else if (!this.gameStarted) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Press Space to start', this.width / 2, this.height / 2);
      this.ctx.textAlign = 'start';
    }
  }
}
