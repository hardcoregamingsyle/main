export class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 24;
    this.velocity = 0;
    this.gravity = 0.5;
    this.jumpStrength = -8;
    this.frame = 0;
  }

  jump() {
    this.velocity = this.jumpStrength;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    this.frame++;
  }

  draw(ctx) {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(this.x + this.width, this.y + 8, 10, 8);
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

export class Pipe {
  constructor(x, canvasHeight) {
    this.x = x;
    this.width = 52;
    this.gap = 150;
    this.speed = 3;
    this.canvasHeight = canvasHeight;
    this.top = Math.random() * (canvasHeight - 200) + 50;
    this.bottom = this.top + this.gap;
    this.passed = false;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(this.x, 0, this.width, this.top);
    ctx.fillRect(this.x, this.bottom, this.width, this.canvasHeight - this.bottom);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x - 2, this.top - 20, this.width + 4, 20);
    ctx.fillRect(this.x - 2, this.bottom, this.width + 4, 20);
  }

  getTopBounds() {
    return {
      x: this.x,
      y: 0,
      width: this.width,
      height: this.top
    };
  }

  getBottomBounds() {
    return {
      x: this.x,
      y: this.bottom,
      width: this.width,
      height: this.canvasHeight - this.bottom
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.bird = new Bird(50, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.highScore = 0;
    this.gameState = 'start';
    this.pipeSpawnTimer = 0;
    this.pipeSpawnInterval = 90;
    this.backgroundColor = '#87CEEB';
    this.groundHeight = 50;
    this.groundY = this.height - this.groundHeight;
    this.groundOffset = 0;
  }

  start() {
    this.gameState = 'playing';
    this.bird = new Bird(50, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.pipeSpawnTimer = 0;
  }

  reset() {
    this.gameState = 'start';
    this.bird = new Bird(50, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.pipeSpawnTimer = 0;
  }

  update() {
    if (this.gameState !== 'playing') return;

    this.bird.update();
    this.pipeSpawnTimer++;

    if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
      this.pipes.push(new Pipe(this.width, this.height));
      this.pipeSpawnTimer = 0;
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();

      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
        continue;
      }

      if (this.checkCollision(this.bird, pipe)) {
        this.gameOver();
        return;
      }

      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
        if (this.score > this.highScore) {
          this.highScore = this.score;
        }
      }
    }

    if (this.bird.y + this.bird.height >= this.groundY) {
      this.bird.y = this.groundY - this.bird.height;
      this.gameOver();
    }

    if (this.bird.y <= 0) {
      this.bird.y = 0;
      this.bird.velocity = 0;
    }

    this.groundOffset = (this.groundOffset + 3) % 32;
  }

  checkCollision(bird, pipe) {
    const birdBounds = bird.getBounds();
    const topBounds = pipe.getTopBounds();
    const bottomBounds = pipe.getBottomBounds();

    return this.rectsIntersect(birdBounds, topBounds) ||
           this.rectsIntersect(birdBounds, bottomBounds);
  }

  rectsIntersect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  gameOver() {
    this.gameState = 'gameover';
  }

  draw() {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#DEB887';
    this.ctx.fillRect(0, this.groundY, this.width, this.groundHeight);
    this.ctx.fillStyle = '#8B7355';
    for (let x = -this.groundOffset; x < this.width; x += 32) {
      this.ctx.fillRect(x, this.groundY, 16, this.groundHeight);
    }

    for (const pipe of this.pipes) {
      pipe.draw(this.ctx);
    }

    this.bird.draw(this.ctx);

    this.ctx.fillStyle = '#000';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`High Score: ${this.highScore}`, 10, 60);

    if (this.gameState === 'start') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('FLAPPY BIRD', this.width / 2, this.height / 2 - 50);
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press SPACE or Click to Start', this.width / 2, this.height / 2 + 20);
      this.ctx.textAlign = 'left';
    } else if (this.gameState === 'gameover') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
      this.ctx.fillText('Press SPACE or Click to Restart', this.width / 2, this.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }

  handleInput() {
    if (this.gameState === 'start') {
      this.start();
    } else if (this.gameState === 'playing') {
      this.bird.jump();
    } else if (this.gameState === 'gameover') {
      this.reset();
      this.start();
    }
  }
}
