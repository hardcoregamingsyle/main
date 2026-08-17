class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.bird = { x: 50, y: this.height / 2, radius: 15, velocity: 0, gravity: 0.5, jump: -8 };
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.pipeGap = 150;
    this.pipeWidth = 60;
    this.pipeSpeed = 2;
    this.frameCount = 0;
    this.spawnInterval = 100;
    this.boundHandleInput = this.handleInput.bind(this);
  }

  start() {
    this.gameLoop();
  }

  gameLoop() {
    this.update();
    this.draw();
    if (!this.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
      return;
    }
    this.gameStarted = true;
    this.bird.velocity = this.bird.jump;
  }

  reset() {
    this.bird = { x: 50, y: this.height / 2, radius: 15, velocity: 0, gravity: 0.5, jump: -8 };
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.frameCount = 0;
    this.gameLoop();
  }

  update() {
    if (!this.gameStarted || this.gameOver) return;

    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Check boundaries
    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.height) {
      this.gameOver = true;
    }

    // Spawn pipes
    if (this.frameCount % this.spawnInterval === 0) {
      this.spawnPipe();
    }

    // Move pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;
      if (this.pipes[i].x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
        this.score++;
      }
    }

    // Collision detection
    for (let pipe of this.pipes) {
      if (this.collides(this.bird, pipe)) {
        this.gameOver = true;
      }
    }

    this.frameCount++;
  }

  spawnPipe() {
    const minHeight = 50;
    const maxHeight = this.height - this.pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    this.pipes.push({
      x: this.width,
      topHeight: topHeight,
      bottomY: topHeight + this.pipeGap
    });
  }

  collides(bird, pipe) {
    // Bird is a circle, pipe is a rectangle
    // Check if bird's bounding box overlaps with pipe
    const birdLeft = bird.x - bird.radius;
    const birdRight = bird.x + bird.radius;
    const birdTop = bird.y - bird.radius;
    const birdBottom = bird.y + bird.radius;

    // Top pipe
    const topPipeLeft = pipe.x;
    const topPipeRight = pipe.x + this.pipeWidth;
    const topPipeTop = 0;
    const topPipeBottom = pipe.topHeight;

    // Bottom pipe
    const bottomPipeLeft = pipe.x;
    const bottomPipeRight = pipe.x + this.pipeWidth;
    const bottomPipeTop = pipe.bottomY;
    const bottomPipeBottom = this.height;

    // Check intersection with top pipe
    if (birdRight > topPipeLeft && birdLeft < topPipeRight && birdTop < topPipeBottom) {
      return true;
    }
    // Check intersection with bottom pipe
    if (birdRight > bottomPipeLeft && birdLeft < bottomPipeRight && birdBottom > bottomPipeTop) {
      return true;
    }

    return false;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw pipes
    this.ctx.fillStyle = '#73bf2e';
    for (let pipe of this.pipes) {
      // Top pipe
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      // Bottom pipe
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
    }

    // Draw bird
    this.ctx.fillStyle = '#f4d03f';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      this.ctx.fillText('Game Over', this.width / 2 - 80, this.height / 2);
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Press Space to restart', this.width / 2 - 80, this.height / 2 + 30);
    }
  }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
} else if (typeof window !== 'undefined') {
  window.Game = Game;
}