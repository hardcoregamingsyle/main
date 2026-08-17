(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Game = factory();
  }
}(this, function() {
  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.bird = { x: 50, y: 200, width: 30, height: 30, vy: 0, gravity: 0.5, jump: -8 };
      this.pipes = [];
      this.score = 0;
      this.gameOver = false;
      this.frameCount = 0;
      this.pipeGap = 150;
      this.pipeWidth = 60;
      this.pipeSpeed = 2;
      this.running = false;
    }

    start() {
      this.running = true;
      this.gameOver = false;
      this.score = 0;
      this.pipes = [];
      this.bird.y = 200;
      this.bird.vy = 0;
      this.frameCount = 0;
      this.loop();
    }

    handleInput() {
      if (this.gameOver) {
        this.start();
        return;
      }
      this.bird.vy = this.bird.jump;
    }

    loop() {
      if (!this.running) return;
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }

    update() {
      if (this.gameOver) return;
      this.bird.vy += this.bird.gravity;
      this.bird.y += this.bird.vy;

      // Collision with top/bottom
      if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) {
        this.gameOver = true;
      }

      // Generate pipes
      this.frameCount++;
      if (this.frameCount % 80 === 0) {
        const gapY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
        this.pipes.push({
          x: this.canvas.width,
          topHeight: gapY,
          bottomY: gapY + this.pipeGap,
          passed: false
        });
      }

      // Move pipes
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];
        pipe.x -= this.pipeSpeed;

        // Check collision with bird
        if (
          this.bird.x + this.bird.width > pipe.x &&
          this.bird.x < pipe.x + this.pipeWidth &&
          (this.bird.y < pipe.topHeight || this.bird.y + this.bird.height > pipe.bottomY)
        ) {
          this.gameOver = true;
        }

        // Score when bird passes pipe
        if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
          pipe.passed = true;
          this.score++;
        }

        // Remove off-screen pipes
        if (pipe.x + this.pipeWidth < 0) {
          this.pipes.splice(i, 1);
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw pipes
      ctx.fillStyle = '#4caf50';
      this.pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
      });

      // Draw bird
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText('Score: ' + this.score, 10, 30);

      if (this.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '36px Arial';
        ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2);
        ctx.font = '18px Arial';
        ctx.fillText('Press Space to restart', this.canvas.width / 2 - 90, this.canvas.height / 2 + 40);
      }
    }
  }

  return Game;
}));
