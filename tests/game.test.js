import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock canvas for Node.js environment
const mockCanvas = {
  width: 400,
  height: 600,
  getContext: () => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    measureText: () => ({ width: 50 }),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    closePath: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
  }),
};

// Import the actual game module
import * as gameModule from '../src/game.js';

const { Bird, Pipe, Game } = gameModule;

describe('Game Mechanics', () => {
  let bird;
  let pipe;
  let game;

  beforeEach(() => {
    bird = new Bird(150, 300);
    pipe = new Pipe(200, 60);
    game = new Game(mockCanvas);
  });

  test('Bird initializes with correct position', () => {
    expect(bird.x).toBe(150);
    expect(bird.y).toBe(300);
    expect(bird.velocity).toBe(0);
    expect(bird.radius).toBe(15);
  });

  test('Player jumps on spacebar press', () => {
    bird.jump();
    expect(bird.velocity).toBe(-10);
    bird.update();
    expect(bird.y).toBeLessThan(300);
  });

  test('Bird falls due to gravity', () => {
    const initialY = bird.y;
    bird.update();
    expect(bird.y).toBeGreaterThan(initialY);
    expect(bird.velocity).toBeGreaterThan(0);
  });

  test('Bird velocity caps at terminal velocity', () => {
    bird.velocity = 20;
    bird.update();
    expect(bird.velocity).toBeLessThanOrEqual(12);
  });

  test('Pipe initializes with correct properties', () => {
    expect(pipe.x).toBe(200);
    expect(pipe.width).toBe(60);
    expect(pipe.gap).toBe(150);
    expect(pipe.height).toBeGreaterThanOrEqual(50);
    expect(pipe.height).toBeLessThanOrEqual(400);
    expect(pipe.passed).toBe(false);
  });

  test('Pipe moves left on update', () => {
    const initialX = pipe.x;
    pipe.update();
    expect(pipe.x).toBeLessThan(initialX);
  });

  test('Collision detection - bird hits top pipe', () => {
    pipe.x = 150;
    pipe.height = 200;
    pipe.gap = 150;
    bird.x = 150;
    bird.y = 50; // Top of screen, hitting top pipe
    
    expect(game.checkCollision(bird, pipe)).toBe(true);
  });

  test('Collision detection - bird hits bottom pipe', () => {
    pipe.x = 150;
    pipe.height = 200;
    pipe.gap = 150;
    bird.x = 150;
    bird.y = 400; // Bottom pipe area
    
    expect(game.checkCollision(bird, pipe)).toBe(true);
  });

  test('Collision detection - bird passes through gap', () => {
    pipe.x = 150;
    pipe.height = 200;
    pipe.gap = 150;
    bird.x = 150;
    bird.y = 275; // Middle of gap (200 + 150/2 = 275)
    
    expect(game.checkCollision(bird, pipe)).toBe(false);
  });

  test('Collision detection - bird hits pipe side', () => {
    pipe.x = 130;
    pipe.height = 200;
    pipe.gap = 150;
    bird.x = 175; // Right edge of pipe (130 + 60 - 15 radius)
    bird.y = 275;
    
    expect(game.checkCollision(bird, pipe)).toBe(true);
  });

  test('Game initializes with correct state', () => {
    expect(game.bird).toBeInstanceOf(Bird);
    expect(game.pipes).toEqual([]);
    expect(game.score).toBe(0);
    expect(game.gameOver).toBe(false);
    expect(game.frameCount).toBe(0);
  });

  test('Game spawns pipes at intervals', () => {
    game.frameCount = 90; // Just before spawn
    game.update();
    expect(game.pipes.length).toBe(0);
    
    game.frameCount = 120; // Spawn interval
    game.update();
    expect(game.pipes.length).toBe(1);
  });

  test('Game increments score when pipe passed', () => {
    const pipe = new Pipe(100, 60);
    pipe.x = 50; // Behind bird
    pipe.passed = false;
    game.pipes = [pipe];
    game.bird.x = 150;
    
    game.update();
    expect(pipe.passed).toBe(true);
    expect(game.score).toBe(1);
  });

  test('Game over on collision', () => {
    const pipe = new Pipe(150, 60);
    pipe.height = 200;
    pipe.gap = 150;
    game.pipes = [pipe];
    game.bird.x = 150;
    game.bird.y = 50; // Collision
    
    game.update();
    expect(game.gameOver).toBe(true);
  });

  test('Game over on ground collision', () => {
    game.bird.y = 590; // Near bottom
    game.bird.velocity = 10;
    
    game.update();
    expect(game.gameOver).toBe(true);
  });

  test('Game over on ceiling collision', () => {
    game.bird.y = -10;
    game.bird.velocity = -10;
    
    game.update();
    expect(game.gameOver).toBe(true);
  });

  test('Reset restores initial state', () => {
    game.score = 10;
    game.gameOver = true;
    game.pipes = [new Pipe(200, 60)];
    game.bird.y = 100;
    game.bird.velocity = 5;
    
    game.reset();
    
    expect(game.score).toBe(0);
    expect(game.gameOver).toBe(false);
    expect(game.pipes).toEqual([]);
    expect(game.bird.y).toBe(300);
    expect(game.bird.velocity).toBe(0);
  });
});
