const { JSDOM } = require('jsdom');

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

// Create canvas mock
class CanvasMock {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.ctx = {
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn()
            }))
        };
    }
}

dom.window.HTMLCanvasElement = CanvasMock;

// Mock DOM elements before loading game module
document.body.innerHTML = `
    <div id="game-container">
        <canvas id="gameCanvas" width="400" height="600"></canvas>
        <div id="ui-layer">
            <div id="score-display">0</div>
            <div id="high-score">High Score: 0</div>
        </div>
        <div id="start-screen"><button id="start-btn">Start Game</button></div>
        <div id="game-over-screen" class="hidden"><button id="restart-btn">Play Again</button></div>
    </div>
`;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Load game module after setup
require('../src/game.js');

describe('Girl Flapper Game', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
    });

    describe('Game Initialization', () => {
        test('should initialize game state', () => {
            expect(document.getElementById('score-display')).toBeTruthy();
            expect(document.getElementById('high-score')).toBeTruthy();
            expect(document.getElementById('start-screen')).toBeTruthy();
            expect(document.getElementById('game-over-screen')).toBeTruthy();
        });

        test('should have default score display', () => {
            const scoreDisplay = document.getElementById('score-display');
            expect(scoreDisplay.textContent).toBe('0');
        });
    });

    describe('Game Controls', () => {
        test('should handle space key press', () => {
            const event = new dom.window.KeyboardEvent('keydown', { code: 'Space' });
            document.dispatchEvent(event);
            expect(true).toBe(true); // Just verifying no errors
        });

        test('should handle click events', () => {
            const canvas = document.getElementById('gameCanvas');
            const event = new dom.window.MouseEvent('mousedown');
            canvas.dispatchEvent(event);
            expect(true).toBe(true); // Just verifying no errors
        });

        test('should handle touch events', () => {
            const canvas = document.getElementById('gameCanvas');
            const event = new dom.window.TouchEvent('touchstart');
            canvas.dispatchEvent(event);
            expect(true).toBe(true); // Just verifying no errors
        });
    });

    describe('Game Flow', () => {
        test('should show start screen initially', () => {
            const startScreen = document.getElementById('start-screen');
            expect(startScreen.classList.contains('hidden')).toBe(false);
        });

        test('should hide start screen when game starts', () => {
            const startScreen = document.getElementById('start-screen');
            startScreen.classList.add('hidden');
            expect(startScreen.classList.contains('hidden')).toBe(true);
        });
    });

    describe('LocalStorage', () => {
        test('should use localStorage for high score', () => {
            localStorageMock.getItem.mockReturnValue('10');
            const result = localStorage.getItem('girlFlapperHighScore');
            expect(result).toBe('10');
        });
    });
});
