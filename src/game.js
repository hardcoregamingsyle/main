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
    this.speed = 2;
    this.passed = false;
    
    const minTop = 50;
    const maxTop = canvasHeight - this.gap - 50;
    this.topHeight = Math.random() * (maxTop - minTop) + minTop;
    this.bottomY = this.topHeight + this.gap;
    this.bottomHeight = canvasHeight - this.bottomY;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx, canvasHeight) {
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
    
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x - 2, this.topHeight - 20, this.width + 4, 20);
    ctx.fillRect(this.x - 2, this.bottomY, this.width + 4, 20);
  }

  getTopBounds() {
    return {
      x: this.x,
      y: 0,
      width: this.width,
      height: this.topHeight
    };
  }

  getBottomBounds() {
    return {
      x: this.x,
      y: this.bottomY,
      width: this.width,
      height: this.bottomHeight
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
    this.pipeSpawnInterval = 1500;
    this.lastTime = 0;
    
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleInput();
      }
    });

    this.canvas.addEventListener('click', () => {
      this.handleInput();
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleInput();
    });
  }

  handleInput() {
    if (this.gameState === 'start') {
      this.gameState = 'playing';
    } else if (this.gameState === 'playing') {
      this.bird.jump();
    } else if (this.gameState === 'gameover') {
      this.reset();
    }
  }

  reset() {
    this.bird = new Bird(50, this.height / 2);
    this.pipes = [];
    this.score = 0;
    this.gameState = 'start';
    this.pipeSpawnTimer = 0;
  }

  spawnPipe() {
    this.pipes.push(new Pipe(this.width, this.height));
  }

  checkCollision() {
    const birdBounds = this.bird.getBounds();
    
    if (birdBounds.y <= 0 || birdBounds.y + birdBounds.height >= this.height) {
      return true;
    }

    for (const pipe of this.pipes) {
      const topBounds = pipe.getTopBounds();
      const bottomBounds = pipe.getBottomBounds();

      if (this.rectsCollide(birdBounds, topBounds) ||
          this.rectsCollide(birdBounds, bottomBounds)) {
        return true;
      }
    }

    return false;
  }

  rectsCollide(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  updateScore() {
    for (const pipe of this.pipes) {
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
        if (this.score > this.highScore) {
          this.highScore = this.score;
        }
      }
    }
  }

  update(deltaTime) {
    if (this.gameState !== 'playing') return;

    this.bird.update();

    this.pipeSpawnTimer += deltaTime;
    if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
      this.spawnPipe();
      this.pipeSpawnTimer = 0;
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].update();
      if (this.pipes[i].isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }

    if (this.checkCollision()) {
      this.gameState = 'gameover';
    }

    this.updateScore();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (const pipe of this.pipes) {
      pipe.draw(this.ctx, this.height);
    }

    this.bird.draw(this.ctx);

    this.ctx.fillStyle = '#000';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`High Score: ${this.highScore}`, 10, 60);

    if (this.gameState === 'start') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Flappy Bird', this.width / 2, this.height / 2 - 40);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press SPACE, Click, or Tap to Start', this.width / 2, this.height / 2 + 20);
      this.ctx.textAlign = 'left';
    } else if (this.gameState === 'gameover') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 40);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
      this.ctx.fillText(`High Score: ${this.highScore}`, this.width / 2, this.height / 2 + 50);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Press SPACE, Click, or Tap to Restart', this.width / 2, this.height / 2 + 100);
      this.ctx.textAlign = 'left';
    }
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame((ts) => this.loop(ts));
  }

  start() {
    requestAnimationFrame((ts) => this.loop(ts));
  }
}
