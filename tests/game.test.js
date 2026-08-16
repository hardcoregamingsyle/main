import { describe, test } from '@jest/globals';
import { createCanvas } from 'canvas';
import { loadImage } from 'image-loader';

describe('Game Mechanics', () => {
  test('Player jumps on spacebar press', () => {
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
    const pipe = new Pipe(200, 60);

    pipe.x = 100;
    pipe.height = 200;
    pipe.gap = 150;

    // Bird colliding with bottom of pipe
    bird.x = 150;
    bird.y = 200;
    expect(bird.collidesWith(pipe)).toBe(true);

    // Bird passing through gap
    bird.y = 100;
    expect(bird.collidesWith(pipe)).toBe(false);
  });

  test('Score increments on pipe passage', () => {
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    const game = new Game();

    game.pipes = [{ x: 0, width: 60, height: 200, gap: 150 }];

    game.update();
    expect(game.score).toBe(1);
  });
});