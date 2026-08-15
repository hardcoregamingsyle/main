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

        test('Canvas element exists with correct dimensions', () => {
            const canvas = dom.window.document.querySelector('#game-canvas');
            expect(canvas).toBeDefined();
            expect(canvas.getAttribute('width')).toBe('400');
            expect(canvas.getAttribute('height')).toBe('600');
        });

        test('Score display element exists', () => {
            const scoreDisplay = dom.window.document.querySelector('#score-display');
            expect(scoreDisplay).toBeDefined();
        });

        test('Start message element exists', () => {
            const startMessage = dom.window.document.querySelector('#start-message');
            expect(startMessage).toBeDefined();
        });

        test('Game script is included', () => {
            const scriptTags = dom.window.document.querySelectorAll('script[src]');
            const gameScript = Array.from(scriptTags).find(
                tag => tag.getAttribute('src') === 'game.js'
            );
            expect(gameScript).toBeDefined();
        });
    });

    describe('Game Logic', () => {
        test('game.js file exists', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            expect(fs.existsSync(gameJsPath)).toBe(true);
        });

        test('game.js contains required functions', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');

            expect(gameContent).toContain('GRAVITY');
            expect(gameContent).toContain('JUMP_STRENGTH');
            expect(gameContent).toContain('PIPE_SPEED');
            expect(gameContent).toContain('drawGirl');
            expect(gameContent).toContain('update');
            expect(gameContent).toContain('draw');
        });

        test('game.js uses requestAnimationFrame', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('requestAnimationFrame');
        });
    });

    describe('Game Constants', () => {
        test('Gravity constant is defined', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toMatch(/GRAVITY\s*=\s*[\d.]+/);
        });

        test('Jump strength is negative (upward)', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toMatch(/JUMP_STRENGTH\s*=\s*-\d+/);
        });

        test('Pipe gap is reasonable', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toMatch(/PIPE_GAP\s*=\s*\d+/);
        });
    });

    describe('Player Character', () => {
        test('Girl object has required properties', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('girl');
            expect(gameContent).toContain('velocity');
            expect(gameContent).toContain('rotation');
        });

        test('Girl drawing function exists', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('function drawGirl');
        });

        test('Girl has head drawn', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('arc');
        });

        test('Girl has hair drawn', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('brown') || expect(gameContent).toContain('8B4513');
        });
    });

    describe('Pipe System', () => {
        test('Pipe spawning is implemented', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('spawnPipe');
        });

        test('Collision detection exists', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('collision');
        });
    });

    describe('Scoring System', () => {
        test('Score tracking is implemented', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('score');
        });

        test('Score display updates', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('scoreDisplay');
        });
    });

    describe('Input Handling', () => {
        test('Keyboard event listener exists', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('keydown');
        });

        test('Space key triggers jump', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('Space');
        });

        test('Click/touch events are handled', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('addEventListener');
        });
    });

    describe('Game State Management', () => {
        test('Running state exists', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('running');
        });

        test('Game over state exists', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('gameOver');
        });

        test('Reset functionality exists', () => {
            const gameJsPath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gameJsPath, 'utf8');
            expect(gameContent).toContain('resetGame');
        });
    });
});
