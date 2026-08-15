// Girl Flapper - Main Game Logic
(function() {
    'use strict';

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');
    const highScoreEl = document.getElementById('high-score');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Game constants
    const GRAVITY = 0.5;
    const FLAP_STRENGTH = -8;
    const PIPE_SPEED = 3;
    const PIPE_SPAWN_INTERVAL = 2000;
    const PIPE_GAP = 150;
    const GIRL_WIDTH = 30;
    const GIRL_HEIGHT = 30;
    const PIPE_WIDTH = 60;

    // Game state
    let gameState = 'menu'; // menu, playing, gameover
    let score = 0;
    let highScore = localStorage.getItem('girlFlapperHighScore') || 0;
    let lastPipeSpawn = 0;

    // Girl object
    let girl = {
        x: 100,
        y: 300,
        velocity: 0,
        rotation: 0
    };

    // Pipes array
    let pipes = [];

    // Background clouds
    let clouds = [];

    // Initialize clouds
    function initClouds() {
        clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height / 2,
                size: 30 + Math.random() * 40,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    }

    // Draw girl character
    function drawGirl() {
        ctx.save();
        ctx.translate(girl.x + GIRL_WIDTH / 2, girl.y + GIRL_HEIGHT / 2);
        
        // Rotation based on velocity
        girl.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, girl.velocity * 0.1));
        ctx.rotate(girl.rotation);

        // Body/Dress
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(GIRL_WIDTH / 2, 15);
        ctx.lineTo(-GIRL_WIDTH / 2, 15);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = '#ffe4c4';
        ctx.beginPath();
        ctx.arc(0, -15, 12, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(0, -17, 13, Math.PI, Math.PI * 2);
        ctx.fill();

        // Face details
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-4, -15, 1.5, 0, Math.PI * 2); // Left eye
        ctx.arc(4, -15, 1.5, 0, Math.PI * 2);  // Right eye
        ctx.fill();

        // Blush
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.arc(-6, -12, 2, 0, Math.PI * 2);
        ctx.arc(6, -12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Bow/Hair accessory
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.arc(0, -22, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Draw pipe
    function drawPipe(pipe) {
        ctx.fillStyle = '#e91e63';
        
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeStyle = '#c2185b';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        // Bottom pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, PIPE_WIDTH, pipe.bottomHeight);
        ctx.strokeRect(pipe.x, canvas.height - pipe.bottomHeight, PIPE_WIDTH, pipe.bottomHeight);

        // Pipe caps
        ctx.fillStyle = '#f48fb1';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, PIPE_WIDTH + 6, 20);
        ctx.fillRect(pipe.x - 3, canvas.height - pipe.bottomHeight, PIPE_WIDTH + 6, 20);
    }

    // Draw background clouds
    function drawClouds() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.5, cloud.y - cloud.size * 0.3, cloud.size * 0.7, 0, Math.PI * 2);
            ctx.arc(cloud.x - cloud.size * 0.5, cloud.y - cloud.size * 0.3, cloud.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Update clouds
    function updateClouds() {
        if (gameState !== 'playing') return;
        
        clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size * 2 < 0) {
                cloud.x = canvas.width + cloud.size;
                cloud.y = Math.random() * canvas.height / 2;
            }
        });
    }

    // Spawn new pipe
    function spawnPipe(timestamp) {
        if (timestamp - lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
            const minHeight = 100;
            const maxHeight = canvas.height - PIPE_GAP - minHeight;
            const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
            
            pipes.push({
                x: canvas.width,
                topHeight: topHeight,
                bottomHeight: canvas.height - PIPE_GAP - topHeight,
                passed: false
            });
            
            lastPipeSpawn = timestamp;
        }
    }

    // Update pipes
    function updatePipes() {
        if (gameState !== 'playing') return;
        
        pipes.forEach((pipe, index) => {
            pipe.x -= PIPE_SPEED;
            
            // Check if passed
            if (!pipe.passed && pipe.x + PIPE_WIDTH < girl.x) {
                pipe.passed = true;
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
            }
            
            // Remove off-screen pipes
            if (pipe.x + PIPE_WIDTH < 0) {
                pipes.splice(index, 1);
            }
        });
    }

    // Collision detection
    function checkCollision() {
        // Ground collision
        if (girl.y + GIRL_HEIGHT > canvas.height) {
            return true;
        }
        
        // Ceiling collision
        if (girl.y < 0) {
            return true;
        }
        
        // Pipe collision
        for (let pipe of pipes) {
            if (
                girl.x < pipe.x + PIPE_WIDTH &&
                girl.x + GIRL_WIDTH > pipe.x &&
                (
                    girl.y < pipe.topHeight ||
                    girl.y + GIRL_HEIGHT > canvas.height - pipe.bottomHeight
                )
            ) {
                return true;
            }
        }
        
        return false;
    }

    // Flap action
    function flap() {
        if (gameState === 'playing') {
            girl.velocity = FLAP_STRENGTH;
        }
    }

    // Start game
    function startGame() {
        gameState = 'playing';
        score = 0;
        scoreDisplay.textContent = 'Score: 0';
        girl.y = 300;
        girl.velocity = 0;
        pipes = [];
        lastPipeSpawn = performance.now();
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        loop();
    }

    // Game over
    function gameOver() {
        gameState = 'gameover';
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('girlFlapperHighScore', highScore);
        }
        
        finalScoreEl.textContent = score;
        highScoreEl.textContent = highScore;
        gameOverScreen.style.display = 'block';
    }

    // Main game loop
    function loop(timestamp) {
        if (gameState !== 'playing') return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update physics
        girl.velocity += GRAVITY;
        girl.y += girl.velocity;
        
        // Spawn and update pipes
        spawnPipe(timestamp);
        updateClouds();
        updatePipes();
        
        // Draw everything
        drawClouds();
        pipes.forEach(drawPipe);
        drawGirl();
        
        // Check collisions
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        requestAnimationFrame(loop);
    }

    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameState === 'menu') {
                startGame();
            } else if (gameState === 'playing') {
                flap();
            } else if (gameState === 'gameover') {
                startGame();
            }
        }
    });
    
    canvas.addEventListener('mousedown', () => {
        if (gameState === 'playing') {
            flap();
        }
    });
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState === 'playing') {
            flap();
        }
    });

    // Initialize
    initClouds();
    
    // Initial render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawClouds();
    drawGirl();
})();
