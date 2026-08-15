const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlPath = path.resolve(__dirname, '../src/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const dom = new JSDOM(html);
const window = dom.window;
const document = window.document;

describe('Girl Flapper Game', () => {
    describe('HTML Structure', () => {
        test('has correct title', () => {
            const title = document.querySelector('title').textContent;
            expect(title).toBe('Girl Flapper');
        });

        test('has canvas element with correct dimensions', () => {
            const canvas = document.querySelector('#game-canvas');
            expect(canvas).toBeDefined();
            expect(canvas.getAttribute('width')).toBe('400');
            expect(canvas.getAttribute('height')).toBe('600');
        });

        test('has score display element', () => {
            const scoreDisplay = document.querySelector('#score-display');
            expect(scoreDisplay).toBeDefined();
        });

        test('has start screen', () => {
            const startScreen = document.querySelector('#start-screen');
            expect(startScreen).toBeDefined();
            expect(startScreen.querySelector('.btn')).toBeDefined();
        });

        test('has game over screen', () => {
            const gameOverScreen = document.querySelector('#game-over-screen');
            expect(gameOverScreen).toBeDefined();
            expect(gameOverScreen.querySelector('.btn')).toBeDefined();
        });
    });

    describe('CSS Styling', () => {
        test('has required CSS styles', () => {
            const styleSheet = Array.from(document.styleSheets)[0];
            expect(styleSheet).toBeDefined();
        });

        test('game container has proper styling', () => {
            const container = document.querySelector('#game-container');
            expect(container).toBeDefined();
        });
    });

    describe('Game Functionality', () => {
        test('game script loads correctly', () => {
            const script = document.querySelector('script[src="game.js"]');
            expect(script).toBeDefined();
        });

        test('all required elements have IDs', () => {
            const requiredIds = [
                'game-canvas',
                'score-display',
                'start-screen',
                'game-over-screen',
                'start-btn',
                'restart-btn',
                'final-score'
            ];

            requiredIds.forEach(id => {
                const element = document.getElementById(id);
                expect(element).toBeDefined();
            });
        });
    });
});
