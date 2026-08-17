const { createCanvas } = require('canvas');
const { Bird, Pipe, GirlFlapper } = require('../src/game');

describe('Game Mechanics', () => {
  test('Bird jumps on spacebar press', () => {
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    const bird = new Bird(150, 300);

    bird.jump();
    expect(bird.velocity).toBe(-10);
    bird.update();
    expect(bird.y).toBeLessThan(300);
  });

  test('Collision detection works', () => {
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    const bird = new Bird(150, 300);
    const pipe = new Pipe(200, 60, 150);

    pipe.x = 100;
    pipe.gapY = 200;
    pipe.gapHeight = 150;

    // Bird colliding with top pipe
    bird.x = 150;
    bird.y = 100;
    expect(pipe.collidesWith(bird)).toBe(true);

    // Bird inside gap
    bird.y = 250;
    expect(pipe.collidesWith(bird)).toBe(false);

    // Bird below gap
    bird.y = 400;
    expect(pipe.collidesWith(bird)).toBe(true);
  });

  test('Bird falls due to gravity', () => {
    const bird = new Bird(150, 300);
    const initialY = bird.y;
    bird.update();
    expect(bird.y).toBeGreaterThan(initialY);
  });

  test('Pipe moves left', () => {
    const pipe = new Pipe(400, 200);
    const initialX = pipe.x;
    pipe.update(2);
    expect(pipe.x).toBeLessThan(initialX);
  });
});
