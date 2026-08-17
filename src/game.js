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
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x, 0, this.width, this.top);
    ctx.fillRect(this.x - 5, this.top - 20, this.width + 10, 20);
    ctx.fillRect(this.x, this.bottom, this.width, this.canvasHeight - this.bottom);
    ctx.fillRect(this.x - 5, this.bottom, this.width + 10, 20);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  collidesWith(bird) {
    if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
      if (bird.y < this.top || bird.y + bird.height > this.bottom) {
        return true;
      }
    }
    return false;
  }
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bird = new Bird(50, canvas.height / 2);
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
    this.pipeInterval = 100;
    this.groundY = canvas.height - 30;
  }

  reset() {
    this.bird = new Bird(50, this.canvas.height / 2);
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
  }

  update() {
    if (this.gameOver) return;
    this.bird.update();
    this.frameCount++;

    if (this.frameCount % this.pipeInterval === 0) {
      this.pipes.push(new Pipe(this.canvas.width, this.canvas.height));
    }

    for (let pipe of this.pipes) {
      pipe.update();
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
    }

    this.pipes = this.pipes.filter(p => !p.isOffScreen());

    for (let pipe of this.pipes) {
      if (pipe.collidesWith(this.bird)) {
        this.gameOver = true;
        break;
      }
    }

    if (this.bird.y < 0 || this.bird.y + this.bird.height > this.groundY) {
      this.gameOver = true;
    }
  }

  draw() {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let pipe of this.pipes) {
      pipe.draw(this.ctx);
    }

    this.bird.draw(this.ctx);

    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '40px Arial';
      this.ctx.fillText('Game Over', this.canvas.width/2 - 100, this.canvas.height/2);
    }
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
    } else {
      this.bird.jump();
    }
  }
}