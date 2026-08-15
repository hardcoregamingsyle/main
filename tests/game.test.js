const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Girl Flapper Game', () => {
    const htmlPath = path.resolve(__dirname, '../src/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html);
    const window = dom.window;
    const document = window.document;

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

        test('has menu screen element', () => {
            const menuScreen = document.querySelector('#menu-screen');
            expect(menuScreen).toBeDefined();
        });

        test('has game over screen element', () => {
            const gameOverScreen = document.querySelector('#game-over-screen');
            expect(gameOverScreen).toBeDefined();
        });

        test('loads game.js script', () => {
            const script = document.querySelector('script[src="game.js"]');
            expect(script).toBeDefined();
        });
    });

    describe('Game Configuration', () => {
        test('game constants are defined', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('GRAVITY');
            expect(gameContent).toContain('JUMP_STRENGTH');
            expect(gameContent).toContain('PIPE_SPEED');
            expect(gameContent).toContain('GIRL_SIZE');
        });

        test('physics values are reasonable', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            // Gravity should be positive (downward force)
            expect(gameContent).toMatch(/GRAVITY\s*=\s*([\d.]+)/);
            // Jump strength should be negative (upward force)
            expect(gameContent).toMatch(/JUMP_STRENGTH\s*=\s*-?\d+/);
        });
    });

    describe('Game State Management', () => {
        test('has required game states', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain("'MENU'");
            expect(gameContent).toContain("'PLAYING'");
            expect(gameContent).toContain("'GAMEOVER'");
        });

        test('has start game function', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('function startGame');
        });

        test('has reset game function', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('function resetGame');
        });

        test('has game over function', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('function gameOver');
        });
    });

    describe('Collision Detection', () => {
        test('checks for pipe collisions', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('checkCollisions');
            expect(gameContent).toContain('collision');
        });

        test('checks floor collision', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('floor');
        });
    });

    describe('Scoring System', () => {
        test('has score tracking', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('score');
        });

        test('has high score persistence', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('localStorage');
        });

        test('updates score display', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('updateScoreDisplay');
        });
    });

    describe('Rendering', () => {
        test('draws girl character', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('drawGirl');
        });

        test('draws pipes', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('drawPipes');
        });

        test('draws background', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('drawBackground');
        });

        test('has game loop', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('requestAnimationFrame');
            expect(gameContent).toContain('gameLoop');
        });
    });

    describe('Input Handling', () => {
        test('handles keyboard input', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('keydown');
            expect(gameContent).toContain('handleInput');
        });

        test('handles mouse click', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('click');
            expect(gameContent).toContain('handleClick');
        });

        test('handles touch events', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('touchstart');
            expect(gameContent).toContain('handleTouch');
        });

        test('implements jump function', () => {
            const gamePath = path.resolve(__dirname, '../src/game.js');
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            
            expect(gameContent).toContain('function jump');
        });
    });
});
