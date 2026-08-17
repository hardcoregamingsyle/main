const Game = require('../src/game.js');

describe('Game', () => {
  let canvas;
  let game;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    canvas.getContext = jest.fn().mockReturnValue({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
    });
    global.requestAnimationFrame = jest.fn().mockReturnValue(1);
    game = new Game(canvas);
  });

  test('constructor initializes properties', () => {
    expect(game.canvas).toBe(canvas);
    expect(game.bird).toBeDefined();
    expect(game.gravity).toBe(0.5);
    expect(game.score).toBe(0);
    expect(game.isGameOver).toBe(false);
  });

  test('start sets isRunning and calls gameLoop', () => {
    const spy = jest.spyOn(game, 'gameLoop');
    game.start();
    expect(game.isRunning).toBe(true);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('handleInput sets velocity on jump', () => {
    game.bird.velocity = 0;
    game.handleInput();
    expect(game.bird.velocity).toBe(game.jumpForce);
  });

  test('handleInput restarts on game over', () => {
    game.isGameOver = true;
    const startSpy = jest.spyOn(game, 'start');
    game.handleInput();
    expect(startSpy).toHaveBeenCalled();
    startSpy.mockRestore();
  });

  test('update increases frameCount', () => {
    game.isRunning = true;
    game.update();
    expect(game.frameCount).toBe(1);
  });

  test('update generates pipes', () => {
    game.isRunning = true;
    game.frameCount = 99;
    game.update();
    expect(game.pipes.length).toBe(1);
  });

  test('gameOver sets flags', () => {
    game.gameOver();
    expect(game.isGameOver).toBe(true);
    expect(game.isRunning).toBe(false);
  });
});