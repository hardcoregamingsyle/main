// Flappy Bird Game - Girl Flapper
// Works in browser and Node.js (for testing)

(function (global) {
  class Game {
    constructor(canvas) {
      if (!canvas) {
        throw new Error('Canvas element is required');
      }
      this.canvas = canvas;
      this.ctx = canvas.getContext ? canvas.getContext('2d') : null;
      if (!this.ctx) {
        // Provide a mock context for testing environments
        this.ctx = {
          fillStyle: '',
          font: '',
          drawImage: () => {},
          fillRect: () => {},
          fillText: () => {},
          clearRect: () => {},
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          stroke: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          scale: () => {},
          measureText: () => ({ width: 0 }),
          strokeStyle: '',
          lineWidth: 1,
          lineCap: 'butt',
          lineJoin: 'miter',
          miterLimit: 10,
          globalAlpha: 1,
          globalCompositeOperation: 'source-over',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'low',
          setTransform: () => {},
          resetTransform: () => {},
        };
      }
      this.cWidth = canvas.width || 400;
      this.cHeight = canvas.height || 600;
      this.reset();
      this.animationId = null;
      this.running = false;
    }

    reset() {
      this.bird = {
        x: this.cWidth * 0.2,
        y: this.cHeight * 0.4,
        velocity: 0,
        size: 20,
        gravity: 0.5,
        lift: -8,
      };
      this.pipes = [];
      this.score = 0;
      this.gameOver = false;
      this.gameStarted = false;
      this.frameCount = 0;
      this.pipeGap = 150;
      this.pipeWidth = 50;
      this.pipeSpeed = 2;
      this.pipeSpawnInterval = 100; // frames
    }

    handleInput() {
      if (this.gameOver) {
        this.reset();
        this.start();
        return;
      }
      if (!this.gameStarted) {
        this.gameStarted = true;
      }
      this.bird.velocity = this.bird.lift;
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.gameOver = false;
      this.gameStarted = false;
      this.reset();
      this.loop();
    }

    stop() {
      this.running = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    loop() {
      if (!this.running) return;
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(() => this.loop());
    }

    update() {
      if (this.gameOver) return;
      if (!this.gameStarted) return;

      // Bird physics
      this.bird.velocity += this.bird.gravity;
      this.bird.y += this.bird.velocity;

      // Check floor/ceiling collision
      if (this.bird.y + this.bird.size > this.cHeight) {
        this.bird.y = this.cHeight - this.bird.size;
        this.endGame();
      }
      if (this.bird.y - this.bird.size < 0) {
        this.bird.y = this.bird.size;
        this.endGame();
      }

      // Pipe spawning
      if (this.frameCount % this.pipeSpawnInterval === 0) {
        this.spawnPipe();
      }

      // Move pipes and check collisions
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];
        pipe.x -= this.pipeSpeed;

        // Collision detection
        if (
          this.bird.x + this.bird.size > pipe.x &&
          this.bird.x - this.bird.size < pipe.x + this.pipeWidth
        ) {
          if (pipe.top) {
            // Top pipe
            if (this.bird.y - this.bird.size < pipe.height) {
              this.endGame();
            }
          } else {
            // Bottom pipe
            if (this.bird.y + this.bird.size > pipe.y) {
              this.endGame();
            }
          }
        }

        // Score
        if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
          pipe.passed = true;
          this.score++;
        }

        // Remove off-screen pipes
        if (pipe.x + this.pipeWidth < 0) {
          this.pipes.splice(i, 1);
        }
      }

      this.frameCount++;
    }

    spawnPipe() {
      const gapCenter = Math.random() * (this.cHeight - this.pipeGap - 100) + 50;
      const topPipeHeight = gapCenter - this.pipeGap / 2;
      const bottomPipeY = gapCenter + this.pipeGap / 2;

      this.pipes.push({
        x: this.cWidth,
        y: 0,
        height: topPipeHeight,
        top: true,
        passed: false,
      });

      this.pipes.push({
        x: this.cWidth,
        y: bottomPipeY,
        height: this.cHeight - bottomPipeY,
        top: false,
        passed: false,
      });
    }

    endGame() {
      this.gameOver = true;
      this.gameStarted = false;
    }

    draw() {
      if (!this.ctx) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);

      // Background
      this.ctx.fillStyle = '#70c5ce';
      this.ctx.fillRect(0, 0, this.cWidth, this.cHeight);

      // Ground
      this.ctx.fillStyle = '#ded895';
      this.ctx.fillRect(0, this.cHeight - 50, this.cWidth, 50);

      // Pipes
      this.ctx.fillStyle = '#73bf2e';
      for (const pipe of this.pipes) {
        this.ctx.fillRect(pipe.x, pipe.y, this.pipeWidth, pipe.height);
        // Pipe cap
        this.ctx.fillRect(pipe.x - 5, pipe.top ? pipe.height - 20 : pipe.y, this.pipeWidth + 10, 20);
      }

      // Bird
      this.ctx.fillStyle = '#f5c542';
      this.ctx.fillRect(
        this.bird.x - this.bird.size / 2,
        this.bird.y - this.bird.size / 2,
        this.bird.size,
        this.bird.size
      );

      // Score
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Score: ${this.score}`, 10, 30);

      if (this.gameOver) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, this.cWidth, this.cHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.fillText('Game Over', this.cWidth / 2 - 80, this.cHeight / 2 - 20);
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press Space to restart', this.cWidth / 2 - 100, this.cHeight / 2 + 30);
      } else if (!this.gameStarted) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press Space to start', this.cWidth / 2 - 100, this.cHeight / 2);
      }
    }

    restart() {
      this.stop();
      this.reset();
      this.start();
    }
  }

  // Export for both browser and Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
  } else {
    global.Game = Game;
  }
})(typeof window !== 'undefined' ? window : global);
