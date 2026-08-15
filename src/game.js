/**
 * Girl Flapper - A Flappy Bird style game
 * Main branch - 2026-08-15
 */

(function() {
    'use strict';

    // Game constants
    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;
    const GRAVITY = 0.5;
    const JUMP_STRENGTH = -10;
    const PIPE_SPEED = 3;
    const PIPE_SPAWN_INTERVAL = 1500;
    const PIPE_GAP = 150;
    const GIRL_SIZE = 30;
    const GIRL_X = 80;

    // Game state
    let canvas, ctx;
    let girl = { y: 250, velocity: 0 };
    let pipes = [];
    let score = 0;
    let highScore = parseInt(localStorage.getItem('girlFlapperHighScore')) || 0;
    let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
    let lastPipeSpawn = 0;
    let animationFrameId = null;

    // DOM elements
    let menuScreen, gameOverScreen, scoreDisplay, highScoreDisplay;

    /**
     * Initialize the game
     */
    function init() {
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        
        menuScreen = document.getElementById('menu-screen');
        gameOverScreen = document.getElementById('game-over-screen');
        scoreDisplay = document.getElementById('score-display');
        highScoreDisplay = document.getElementById('high-score-display');

        updateScoreDisplay();

        // Event listeners
        document.addEventListener('keydown', handleInput);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', handleTouch);

        // Start game loop
        gameLoop(0);
    }

    /**
     * Handle keyboard input
     */
    function handleInput(event) {
        if (event.code === 'Space' || event.key === ' ') {
            event.preventDefault();
            if (gameState === 'MENU') {
                startGame();
            } else if (gameState === 'PLAYING') {
                jump();
            } else if (gameState === 'GAMEOVER') {
                resetGame();
            }
        }
    }

    /**
     * Handle mouse click
     */
    function handleClick(event) {
        if (gameState === 'MENU') {
            startGame();
        } else if (gameState === 'PLAYING') {
            jump();
        } else if (gameState === 'GAMEOVER') {
            resetGame();
        }
    }

    /**
     * Handle touch events for mobile
     */
    function handleTouch(event) {
        event.preventDefault();
        if (gameState === 'MENU') {
            startGame();
        } else if (gameState === 'PLAYING') {
            jump();
        } else if (gameState === 'GAMEOVER') {
            resetGame();
        }
    }

    /**
     * Start a new game
     */
    function startGame() {
        gameState = 'PLAYING';
        menuScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        score = 0;
        girl.y = 250;
        girl.velocity = 0;
        pipes = [];
        lastPipeSpawn = performance.now();
    }

    /**
     * Reset game after game over
     */
    function resetGame() {
        gameState = 'MENU';
        menuScreen.style.display = 'flex';
        gameOverScreen.style.display = 'none';
        girl.y = 250;
        girl.velocity = 0;
        pipes = [];
    }

    /**
     * Make the girl jump
     */
    function jump() {
        girl.velocity = JUMP_STRENGTH;
    }

    /**
     * Update game physics
     */
    function updatePhysics(deltaTime) {
        // Apply gravity
        girl.velocity += GRAVITY;
        girl.y += girl.velocity;

        // Check floor collision
        if (girl.y + GIRL_SIZE >= GAME_HEIGHT) {
            girl.y = GAME_HEIGHT - GIRL_SIZE;
            gameOver();
        }

        // Check ceiling collision
        if (girl.y <= 0) {
            girl.y = 0;
            girl.velocity = 0;
        }

        // Spawn pipes
        const now = performance.now();
        if (now - lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
            spawnPipe();
            lastPipeSpawn = now;
        }

        // Move pipes
        movePipes();

        // Check collisions
        checkCollisions();
    }

    /**
     * Spawn a new pipe pair
     */
    function spawnPipe() {
        const minHeight = 100;
        const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        pipes.push({
            x: GAME_WIDTH,
            topHeight: topHeight,
            bottomY: topHeight + PIPE_GAP,
            passed: false
        });
    }

    /**
     * Move pipes left
     */
    function movePipes() {
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= PIPE_SPEED;

            // Remove off-screen pipes
            if (pipes[i].x + 50 < 0) {
                pipes.splice(i, 1);
            }
        }
    }

    /**
     * Check for collisions between girl and pipes
     */
    function checkCollisions() {
        for (const pipe of pipes) {
            // Horizontal collision
            if (
                GIRL_X + GIRL_SIZE > pipe.x &&
                GIRL_X < pipe.x + 50
            ) {
                // Vertical collision (top or bottom pipe)
                if (
                    girl.y < pipe.topHeight ||
                    girl.y + GIRL_SIZE > pipe.bottomY
                ) {
                    gameOver();
                    return;
                }
            }

            // Score when passing a pipe
            if (!pipe.passed && GIRL_X + GIRL_SIZE > pipe.x + 50) {
                pipe.passed = true;
                score++;
                updateScoreDisplay();
            }
        }
    }

    /**
     * Handle game over
     */
    function gameOver() {
        gameState = 'GAMEOVER';
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('girlFlapperHighScore', highScore);
        }
        gameOverScreen.style.display = 'flex';
    }

    /**
     * Update score display
     */
    function updateScoreDisplay() {
        scoreDisplay.textContent = `Score: ${score}`;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }

    /**
     * Draw the girl character
     */
    function drawGirl() {
        const centerX = GIRL_X + GIRL_SIZE / 2;
        const centerY = girl.y + GIRL_SIZE / 2;

        // Body (pink dress)
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 5, GIRL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FFE0BD';
        ctx.beginPath();
        ctx.arc(centerX, centerY - GIRL_SIZE / 4, GIRL_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(centerX, centerY - GIRL_SIZE / 4, GIRL_SIZE / 3 + 3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - GIRL_SIZE / 4, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY - GIRL_SIZE / 4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Bow on head
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY - GIRL_SIZE / 4 - GIRL_SIZE / 5);
        ctx.lineTo(centerX - 15, centerY - GIRL_SIZE / 4 - 10);
        ctx.lineTo(centerX - 10, centerY - GIRL_SIZE / 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX + 10, centerY - GIRL_SIZE / 4 - GIRL_SIZE / 5);
        ctx.lineTo(centerX + 15, centerY - GIRL_SIZE / 4 - 10);
        ctx.lineTo(centerX + 10, centerY - GIRL_SIZE / 4);
        ctx.fill();

        // Wings (simple flapping effect)
        const wingOffset = Math.sin(performance.now() / 100) * 5;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(
            centerX - 15,
            centerY + 5,
            10,
            5 + wingOffset,
            Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
            centerX + 15,
            centerY + 5,
            10,
            5 + wingOffset,
            -Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    /**
     * Draw pipes
     */
    function drawPipes() {
        ctx.fillStyle = '#228B22';
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 3;

        for (const pipe of pipes) {
            // Top pipe
            ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
            ctx.strokeRect(pipe.x, 0, 50, pipe.topHeight);
            
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.bottomY, 50, GAME_HEIGHT - pipe.bottomY);
            ctx.strokeRect(pipe.x, pipe.bottomY, 50, GAME_HEIGHT - pipe.bottomY);

            // Pipe caps
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, 56, 20);
            ctx.fillRect(pipe.x - 3, pipe.bottomY, 56, 20);
            ctx.fillStyle = '#228B22';
        }
    }

    /**
     * Draw background
     */
    function drawBackground() {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        drawCloud(50, 80, 40);
        drawCloud(200, 120, 50);
        drawCloud(320, 60, 35);
        drawCloud(150, 200, 45);

        // Ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 5);
    }

    /**
     * Draw a cloud
     */
    function drawCloud(x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x + size * 1.4, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render everything
     */
    function render() {
        // Clear canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw background
        drawBackground();

        // Draw pipes
        drawPipes();

        // Draw girl
        drawGirl();

        // Draw score in game
        if (gameState === 'PLAYING') {
            ctx.fillStyle = '#000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Score: ${score}`, 10, 30);
        }
    }

    /**
     * Main game loop
     */
    function gameLoop(timestamp) {
        if (gameState === 'PLAYING') {
            updatePhysics();
        }
        render();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    /**
     * Initialize on DOM ready
     */
    document.addEventListener('DOMContentLoaded', init);
})();
