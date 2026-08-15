// Girl Flapper Game
(function() {
    'use strict';

    // Game Constants
    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 600;
    const GRAVITY = 0.5;
    const JUMP_STRENGTH = -10;
    const PIPE_SPEED = 3;
    const PIPE_GAP = 150;
    const PIPE_WIDTH = 60;
    const PIPE_SPAWN_INTERVAL = 1800;

    // DOM Elements
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const highScoreDisplay = document.getElementById('high-score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const finalScoreDisplay = document.getElementById('final-score');

    // Game State
    let gameState = {
        isPlaying: false,
        score: 0,
        highScore: parseInt(localStorage.getItem('girlFlapperHighScore')) || 0,
        lastPipeSpawn: 0,
        frames: 0
    };

    // Girl Character
    let girl = {
        x: 100,
        y: 300,
        width: 40,
        height: 40,
        velocity: 0,
        rotation: 0
    };

    // Pipes array
    let pipes = [];

    // Clouds for background
    let clouds = [];

    // Initialize clouds
    function initClouds() {
        clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * 300,
                size: 30 + Math.random() * 20,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    }

    // Draw girl character
    function drawGirl() {
        ctx.save();
        ctx.translate(girl.x + girl.width / 2, girl.y + girl.height / 2);
        
        // Calculate rotation based on velocity
        girl.rotation = Math.min(Math.max(girl.velocity * 3, -45), 90) * Math.PI / 180;
        ctx.rotate(girl.rotation);
        
        // Body/Dress
        ctx.fillStyle = '#FF6B9C';
        ctx.beginPath();
        ctx.ellipse(0, 10, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Dress details
        ctx.fillStyle = '#C44569';
        ctx.beginPath();
        ctx.arc(0, 8, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms
        ctx.strokeStyle = '#FFE0E6';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Left arm
        ctx.beginPath();
        ctx.moveTo(-12, 5);
        ctx.lineTo(-20, 10);
        ctx.stroke();
        
        // Right arm
        ctx.beginPath();
        ctx.moveTo(12, 5);
        ctx.lineTo(20, 10);
        ctx.stroke();
        
        // Head
        ctx.fillStyle = '#FFE0E6';
        ctx.beginPath();
        ctx.arc(0, -15, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(0, -16, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        
        // Hair sides
        ctx.beginPath();
        ctx.arc(-14, -10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(14, -10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Face features
        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-5, -15, 2, 0, Math.PI * 2);
        ctx.arc(5, -15, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#C44569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -10, 4, 0, Math.PI);
        ctx.stroke();
        
        // Blush
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(-8, -10, 2, 0, Math.PI * 2);
        ctx.arc(8, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Draw pipe
    function drawPipe(pipe) {
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        gradient.addColorStop(0, '#FF6B9C');
        gradient.addColorStop(0.5, '#FF9BC4');
        gradient.addColorStop(1, '#FF6B9C');
        
        ctx.fillStyle = gradient;
        
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#C44569';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
        
        // Bottom pipe
        const bottomY = pipe.topHeight + PIPE_GAP;
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY);
        ctx.fillStyle = '#C44569';
        ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 30);
    }

    // Draw cloud
    function drawCloud(cloud) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.7, cloud.y - cloud.size * 0.2, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 1.3, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.65, cloud.y + cloud.size * 0.3, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Update clouds
    function updateClouds(deltaTime) {
        clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size * 2 < 0) {
                cloud.x = CANVAS_WIDTH + cloud.size;
                cloud.y = Math.random() * 300;
            }
        });
    }

    // Spawn new pipe
    function spawnPipe() {
        const minHeight = 50;
        const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight;
        const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
        
        pipes.push({
            x: CANVAS_WIDTH,
            topHeight: topHeight,
            passed: false
        });
    }

    // Update pipes
    function updatePipes(deltaTime) {
        pipes.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
        });
        
        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
    }

    // Check collision
    function checkCollision() {
        // Ground collision
        if (girl.y + girl.height >= CANVAS_HEIGHT) {
            return true;
        }
        
        // Ceiling collision
        if (girl.y < 0) {
            return true;
        }
        
        // Pipe collision
        for (const pipe of pipes) {
            if (
                girl.x < pipe.x + PIPE_WIDTH &&
                girl.x + girl.width > pipe.x &&
                (
                    girl.y < pipe.topHeight ||
                    girl.y + girl.height > pipe.topHeight + PIPE_GAP
                )
            ) {
                return true;
            }
        }
        
        return false;
    }

    // Jump function
    function jump() {
        if (gameState.isPlaying) {
            girl.velocity = JUMP_STRENGTH;
        }
    }

    // Update game state
    function update(deltaTime) {
        gameState.frames++;
        
        // Gravity
        girl.velocity += GRAVITY;
        girl.y += girl.velocity;
        
        // Spawn pipes
        if (gameState.frames - gameState.lastPipeSpawn > PIPE_SPAWN_INTERVAL / deltaTime) {
            spawnPipe();
            gameState.lastPipeSpawn = gameState.frames;
        }
        
        // Update pipes
        updatePipes(deltaTime);
        
        // Update clouds
        updateClouds(deltaTime);
        
        // Check collisions
        if (checkCollision()) {
            endGame();
            return;
        }
        
        // Score
        pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + PIPE_WIDTH < girl.x) {
                pipe.passed = true;
                gameState.score++;
                scoreDisplay.textContent = gameState.score;
            }
        });
    }

    // Draw everything
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw clouds
        clouds.forEach(drawCloud);
        
        // Draw pipes
        pipes.forEach(drawPipe);
        
        // Draw girl
        drawGirl();
    }

    // Game loop
    let lastTime = Date.now();
    
    function gameLoop() {
        if (!gameState.isPlaying) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        update(deltaTime);
        draw();
        
        requestAnimationFrame(gameLoop);
    }

    // Start game
    function startGame() {
        gameState.isPlaying = true;
        gameState.score = 0;
        gameState.highScore = parseInt(localStorage.getItem('girlFlapperHighScore')) || 0;
        pipes = [];
        girl.y = 300;
        girl.velocity = 0;
        girl.rotation = 0;
        scoreDisplay.textContent = '0';
        highScoreDisplay.textContent = 'High Score: ' + gameState.highScore;
        
        initClouds();
        gameState.lastPipeSpawn = gameState.frames;
        
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        
        lastTime = Date.now();
        gameLoop();
    }

    // End game
    function endGame() {
        gameState.isPlaying = false;
        
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('girlFlapperHighScore', gameState.highScore);
            highScoreDisplay.textContent = 'High Score: ' + gameState.highScore;
        }
        
        finalScoreDisplay.textContent = 'Score: ' + gameState.score;
        gameOverScreen.classList.remove('hidden');
    }

    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });
    
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        jump();
    });
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    }, { passive: false });
    
    // Initial draw
    initClouds();
    draw();
})();
