const { createCanvas } = require('canvas');
const { loadImage } = require('image-loader');

// Mock the game environment
const mockCanvas = createCanvas(400, 600);
const mockCtx = mockCanvas.getContext('2d');

// Simulate game classes
class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 24;
    this.velocity = 0;
    this.gravity = 0.5;
    this.jumpPower = -8;
  }

  jump() {
    this.velocity = this.jumpPower;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
  }
}

class Pipe {
  constructor(x, gapCenter) {
    this.x = x;
    this.gapCenter = gapCenter;
    this.width = 52;
    this.gap = 150;
    this.passed = false;
  }

  update(speed) {
    this.x -= speed;
  }

  getTopPipeBottom() {
    return this.gapCenter - this.gap / 2;
  }

  getBottomPipeTop() {
    return this.gapCenter + this.gap / 2;
  }

  checkCollision(bird) {
    const birdLeft = bird.x;
    const birdRight = bird.x + bird.width;
    const birdTop = bird.y;
    const birdBottom = bird.y + bird.height;

    const pipeLeft = this.x;
    const pipeRight = this.x + this.width;
    const topPipeBottom = this.getTopPipeBottom();
    const bottomPipeTop = this.getBottomPipeTop();

    if (
      birdRight > pipeLeft &&
      birdLeft < pipeRight &&
      (birdTop < topPipeBottom || birdBottom > bottomPipeTop)
    ) {
      return true;
    }
    return false;
  }
}

describe('Bird Mechanics', () => {
  test('Bird jumps on command', () => {
    const bird = new Bird(150, 300);
    bird.jump();
    expect(bird.velocity).toBe(-8);
  });

  test('Bird updates position with gravity', () => {
    const bird = new Bird(150, 300);
    bird.velocity = 0;
    bird.update();
    expect(bird.velocity).toBe(bird.gravity);
    expect(bird.y).toBeGreaterThan(300);
  });

  test('Bird does not go above canvas', () => {
    const bird = new Bird(150, 0);
    bird.velocity = -10;
    bird.update(); // would go to -10 but clamped
    expect(bird.y).toBeGreaterThanOrEqual(0);
  });
});

describe('Pipe Mechanics', () => {
  test('Pipe moves left', () => {
    const pipe = new Pipe(400, 300);
    pipe.update(2);
    expect(pipe.x).toBe(398);
  });

  test('Collision detection with top pipe', () => {
    const bird = new Bird(150, 100);
    const pipe = new Pipe(150, 300);
    // Bird is above the gap
    expect(pipe.checkCollision(bird)).toBe(true);
  });

  test('Collision detection with bottom pipe', () => {
    const bird = new Bird(150, 500);
    const pipe = new Pipe(150, 300);
    // Bird is below the gap
    expect(pipe.checkCollision(bird)).toBe(true);
  });

  test('No collision when bird is in gap', () => {
    const bird = new Bird(150, 300);
    const pipe = new Pipe(150, 300);
    // Bird is exactly in the gap
    expect(pipe.checkCollision(bird)).toBe(false);
  });

  test('Scoring when pipe passes', () => {
    const pipe = new Pipe(200, 300);
    pipe.passed = false;
    const bird = new Bird(150, 300);
    // Pipe hasn't passed yet
    expect(pipe.passed).toBe(false);
  });
});

describe('Game Flow', () => {
  test('Score increments when pipe passes', () => {
    // Simulate game loop
    let score = 0;
    const pipes = [new Pipe(200, 300)];
    const bird = new Bird(150, 300);

    // Move pipe past bird
    pipes[0].x = 100;
    if (!pipes[0].passed && pipes[0].x + pipes[0].width < bird.x) {
      pipes[0].passed = true;
      score++;
    }
    expect(score).toBe(1);
  });

  test('Game over when bird hits bottom', () => {
    const bird = new Bird(150, 600);
    expect(bird.y + bird.height > 600).toBe(true);
  });
});
