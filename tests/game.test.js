const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Girl Flapper Game', () => {
    let dom;
    let html;

    beforeAll(() => {
        const htmlPath = path.resolve(__dirname, '../src/index.html');
        html = fs.readFileSync(htmlPath, 'utf8');
        dom = new JSDOM(html);
    });

    describe('HTML Structure', () => {
        test('HTML has correct title', () => {
            const title = dom.window.document.querySelector('title').textContent;
            expect(title).toBe('Girl Flapper');
        });

        test('Canvas element exists', () => {
            const canvas = dom.window.document.querySelector('#game-canvas');
            expect(canvas).toBeDefined();
            expect(canvas.getAttribute('width')).toBe('400');
            expect(canvas.getAttribute('height')).toBe('600');
        });

        test('Start screen exists', () => {
            const startScreen = dom.window.document.querySelector('#start-screen');
            expect(startScreen).toBeDefined();
            expect(startScreen.querySelector('h1')).toBeDefined();
            expect(startScreen.querySelector('button')).toBeDefined();
        });

        test('Game over screen exists', () => {
            const gameOverScreen = dom.window.document.querySelector('#game-over-screen');
            expect(gameOverScreen).toBeDefined();
            expect(gameOverScreen.querySelector('h1')).toBeDefined();
            expect(gameOverScreen.querySelector('button')).toBeDefined();
        });

        test('Score display exists', () => {
            const scoreDisplay = dom.window.document.querySelector('#score-display');
            expect(scoreDisplay).toBeDefined();
        });
    });

    describe('JavaScript Logic', () => {
        test('script.js file exists', () => {
            const scriptPath = path.resolve(__dirname, '../src/script.js');
            expect(fs.existsSync(scriptPath)).toBe(true);
        });

        test('script.js contains game constants', () => {
            const scriptPath = path.resolve(__dirname, '../src/script.js');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            expect(scriptContent).toContain('GRAVITY');
            expect(scriptContent).toContain('JUMP_STRENGTH');
            expect(scriptContent).toContain('PIPE_SPEED');
        });

        test('script.js contains game functions', () => {
            const scriptPath = path.resolve(__dirname, '../src/script.js');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            expect(scriptContent).toContain('drawGirl');
            expect(scriptContent).toContain('drawPipe');
            expect(scriptContent).toContain('update');
            expect(scriptContent).toContain('render');
            expect(scriptContent).toContain('jump');
            expect(scriptContent).toContain('startGame');
            expect(scriptContent).toContain('endGame');
        });

        test('script.js contains collision detection', () => {
            const scriptPath = path.resolve(__dirname, '../src/script.js');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            expect(scriptContent).toContain('checkCollision');
        });

        test('script.js contains storage for high score', () => {
            const scriptPath = path.resolve(__dirname, '../src/script.js');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            expect(scriptContent).toContain('localStorage');
        });
    });

    describe('CSS Styling', () => {
        test('CSS contains game container styles', () => {
            const match = html.match(/#game-container[\s\S]*?}/);
            expect(match).not.toBeNull();
            expect(match[0]).toContain('position: relative');
            expect(match[0]).toContain('width: 400px');
            expect(match[0]).toContain('height: 600px');
        });

        test('CSS contains score display styles', () => {
            const match = html.match(/#score-display[\s\S]*?}/);
            expect(match).not.toBeNull();
            expect(match[0]).toContain('font-size');
            expect(match[0]).toContain('z-index');
        });

        test('CSS contains start screen styles', () => {
            const match = html.match(/#start-screen[\s\S]*?}/);
            expect(match).not.toBeNull();
            expect(match[0]).toContain('background');
            expect(match[0]).toContain('color: white');
        });

        test('CSS contains button styles', () => {
            const match = html.match(/button[\s\S]*?}/);
            expect(match).not.toBeNull();
            expect(match[0]).toContain('cursor: pointer');
            expect(match[0]).toContain('border: none');
        });
    });
});
