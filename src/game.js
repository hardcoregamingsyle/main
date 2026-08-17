// Flappy Bird Game
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.bird = {
      x: 50,
      y: this.height / 2,
      radius: 15,
      velocity: 0,
      gravity: 0.5,
      jump: -8
    };
    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 120;
    this.pipeSpeed = 2;
    this.score = 0;
    this.gameOver = false;
    this.started = false;
    this.animationId = null;
    this.frameInterval = 1000/60;
    this.lastFrameTime = 0;
  }

  start() {
    this.started = true;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  gameLoop(timestamp) {
    if (!this.started) return;
    const delta = timestamp - this.lastFrameTime;
    if (delta >= this.frameInterval) {
      this.update();
      this.draw();
      this.lastFrameTime = timestamp - (delta % this.frameInterval);
    }
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update() {
    if (this.gameOver) return;
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;
    if (this.bird.y - this.bird.radius < 0) {
      this.bird.y = this.bird.radius;
      this.bird.velocity = 0;
    }
    if (this.bird.y + this.bird.radius > this.height) {
      this.bird.y = this.height - this.bird.radius;
      this.gameOver = true;
    }
    if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.width - 200) {
      this.addPipe();
    }
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed;
      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
      if (this.checkCollision(pipe)) {
        this.gameOver = true;
      }
    }
  }

  addPipe() {
    const minHeight = 50;
    const maxHeight = this.height - this.pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    this.pipes.push({
      x: this.width,
      topHeight: topHeight,
      bottomY: topHeight + this.pipeGap,
      passed: false
    });
  }

  checkCollision(pipe) {
    const birdLeft = this.bird.x - this.bird.radius;
    const birdRight = this.bird.x + this.bird.radius;
    const birdTop = this.bird.y - this.bird.radius;
    const birdBottom = this.bird.y + this.bird.radius;
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + this.pipeWidth;
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
        return true;
      }
    }
    return false;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#2ecc71';
    this.pipes.forEach(pipe => {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
    });
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#e67e22';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x - 5, this.bird.y, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 30);
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 20);
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Press Space to restart', this.width / 2, this.height / 2 + 20);
      this.ctx.textAlign = 'start';
    }
  }

  handleInput() {
    if (this.gameOver) {
      this.restart();
    } else {
      this.bird.velocity = this.bird.jump;
    }
  }

  restart() {
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
  }

  stop() {
    this.started = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
if (typeof window !== 'undefined') {
  window.Game = Game;
}