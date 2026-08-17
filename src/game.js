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
    this.gap = 120;
    this.topHeight = Math.floor(Math.random() * (canvasHeight - this.gap - 100)) + 50;
    this.bottomY = this.topHeight + this.gap;
    this.speed = 2;
    this.scored = false;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    ctx.fillStyle = '#006400';
    ctx.fillRect(this.x - 2, this.topHeight - 20, this.width + 4, 20);

    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x, this.bottomY, this.width, ctx.canvas.height - this.bottomY);
    ctx.fillStyle = '#006400';
    ctx.fillRect(this.x - 2, this.bottomY, this.width + 4, 20);
  }

  getBounds() {
    return {
      topPipe: {
        x: this.x,
        y: 0,
        width: this.width,
        height: this.topHeight
      },
      bottomPipe: {
        x: this.x,
        y: this.bottomY,
        width: this.width,
        height: 9999 // effectively infinite
      }
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
    this.bird = new Bird(50, canvas.height / 2 - 12);
    this.pipes = [];
    this.score = 0;
    this.isGameOver = false;
    this.frameCount = 0;
    this.pipeSpawnInterval = 100; // frames between pipes
    this.bgX = 0;
    this.bgSpeed = 1;

    this.setupEventListeners();
    this.loop = this.loop.bind(this);
  }

  setupEventListeners() {
    const handleInput = (e) => {
      e.preventDefault();
      if (this.isGameOver) {
        this.reset();
      } else {
        this.bird.jump();
      }
    };

    this.canvas.addEventListener('click', handleInput);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleInput(e);
      }
    });
  }

  reset() {
    this.bird = new Bird(50, this.canvas.height / 2 - 12);
    this.pipes = [];
    this.score = 0;
    this.isGameOver = false;
    this.frameCount = 0;
    this.bgX = 0;
  }

  update() {
    if (this.isGameOver) return;

    this.frameCount++;
    this.bird.update();

    // Spawn new pipes
    if (this.frameCount % this.pipeSpawnInterval === 0) {
      this.pipes.push(new Pipe(this.canvas.width, this.canvas.height));
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();

      // Check scoring
      if (!pipe.scored && pipe.x + pipe.width < this.bird.x) {
        pipe.scored = true;
        this.score++;
      }

      // Remove off-screen pipes
      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }

    // Collision detection
    if (this.checkCollision()) {
      this.isGameOver = true;
    }

    // Ground/ceiling collision
    if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
      this.isGameOver = true;
    }

    // Scroll background
    this.bgX = (this.bgX - this.bgSpeed) % this.canvas.width;
  }

  checkCollision() {
    const birdBounds = this.bird.getBounds();
    for (const pipe of this.pipes) {
      const pipeBounds = pipe.getBounds();
      if (this.rectCollide(birdBounds, pipeBounds.topPipe) ||
          this.rectCollide(birdBounds, pipeBounds.bottomPipe)) {
        return true;
      }
    }
    return false;
  }

  rectCollide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#4ec0ca');
    gradient.addColorStop(1, '#7dd3e8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Scrolling clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 3; i++) {
      const cloudX = (this.bgX + i * 200) % (w + 100) - 50;
      this.drawCloud(ctx, cloudX, 50 + i * 30);
    }

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, h - 20, w, 20);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, h - 25, w, 10);

    // Pipes
    for (const pipe of this.pipes) {
      pipe.draw(ctx);
    }

    // Bird
    this.bird.draw(ctx);

    // Score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.score, w / 2, 50);
    ctx.fillText(this.score, w / 2, 50);

    // Game over overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Game Over', w / 2 - 80, h / 2 - 20);
      ctx.font = '16px Arial';
      ctx.fillText('Click or press Space to restart', w / 2 - 130, h / 2 + 20);
    }
  }

  drawCloud(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }

  start() {
    this.loop();
  }
}
