/**
 * Girl Flapper - A Flappy Bird-style game
 * Main game logic module
 */

// Game configuration constants
const CONFIG = {
    GRAVITY: 0.5,
    JUMP_STRENGTH: -8,
    PIPE_SPEED: 3,
    PIPE_WIDTH: 60,
    PIPE_GAP: 170,
    PIPE_SPAWN_INTERVAL: 1500,
    GAME_WIDTH: 400,
    GAME_HEIGHT: 600,
    GROUND_HEIGHT: 50
};

// Character colors
const CHARACTER_COLORS = {
    SKIN: '#FFDAB9',
    HAIR: '#E6C28F',
    DRESS: '#FF69B4',
    EYES: '#4A235A',
    MOUTH: '#FF1493'
};

class GirlFlapperGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.gameWidth = CONFIG.GAME_WIDTH;
        this.gameHeight = CONFIG.GAME_HEIGHT;
        
        // Set canvas dimensions
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
        
        // Game state
        this.isPlaying = false;
        this.isGameOver = false;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.pipes = [];
        this.lastPipeSpawn = 0;
        
        // Girl character state
        this.girl = {
            x: 80,
            y: this.gameHeight / 2,
            width: 40,
            height: 30,
            velocity: 0
        };
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Spacebar jump
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Click/tap jump
        this.canvas.addEventListener('mousedown', () => this.jump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('girlFlapperHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }
    
    saveHighScore(score) {
        try {
            localStorage.setItem('girlFlapperHighScore', score.toString());
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    reset() {
        this.girl.y = this.gameHeight / 2;
        this.girl.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.lastPipeSpawn = 0;
        this.isPlaying = true;
        this.isGameOver = false;
    }
    
    jump() {
        if (this.isPlaying && !this.isGameOver) {
            this.girl.velocity = CONFIG.JUMP_STRENGTH;
        }
    }
    
    spawnPipe() {
        const minHeight = 50;
        const maxHeight = this.gameHeight - CONFIG.GROUND_HEIGHT - CONFIG.PIPE_GAP - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.gameWidth,
            topHeight: topHeight,
            bottomY: topHeight + CONFIG.PIPE_GAP,
            passed: false
        });
    }
    
    update(timestamp) {
        if (!this.isPlaying || this.isGameOver) {
            return;
        }
        
        // Update girl physics
        this.girl.velocity += CONFIG.GRAVITY;
        this.girl.y += this.girl.velocity;
        
        // Check ground collision
        if (this.girl.y + this.girl.height > this.gameHeight - CONFIG.GROUND_HEIGHT) {
            this.girl.y = this.gameHeight - CONFIG.GROUND_HEIGHT - this.girl.height;
            this.girl.velocity = 0;
            this.endGame();
        }
        
        // Check ceiling collision
        if (this.girl.y < 0) {
            this.girl.y = 0;
            this.girl.velocity = 0;
        }
        
        // Spawn pipes at intervals
        if (timestamp - this.lastPipeSpawn > CONFIG.PIPE_SPAWN_INTERVAL) {
            this.spawnPipe();
            this.lastPipeSpawn = timestamp;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= CONFIG.PIPE_SPEED;
            
            // Check if pipe has passed
            if (!pipe.passed && pipe.x + CONFIG.PIPE_WIDTH < this.girl.x) {
                pipe.passed = true;
                this.score++;
            }
            
            // Remove off-screen pipes
            if (pipe.x + CONFIG.PIPE_WIDTH < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Collision detection
            if (this.checkCollision(pipe)) {
                this.endGame();
            }
        }
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
        }
    }
    
    checkCollision(pipe) {
        // Horizontal overlap
        const horizontalOverlap = (
            this.girl.x < pipe.x + CONFIG.PIPE_WIDTH &&
            this.girl.x + this.girl.width > pipe.x
        );
        
        if (!horizontalOverlap) return false;
        
        // Vertical collision (hit top pipe OR hit bottom pipe)
        const hitTopPipe = this.girl.y < pipe.topHeight;
        const hitBottomPipe = this.girl.y + this.girl.height > pipe.bottomY;
        
        return hitTopPipe || hitBottomPipe;
    }
    
    endGame() {
        this.isPlaying = false;
        this.isGameOver = true;
        this.saveHighScore(Math.max(this.score, this.highScore));
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw gradient sky background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight);
        gradient.addColorStop(0, '#FFE4E1');
        gradient.addColorStop(1, '#FFB6C1');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw ground
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, this.gameHeight - CONFIG.GROUND_HEIGHT, this.gameWidth, CONFIG.GROUND_HEIGHT);
        
        // Draw grass detail
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.gameHeight - CONFIG.GROUND_HEIGHT, this.gameWidth, 10);
        
        // Draw pipes
        this.drawPipes();
        
        // Draw girl character
        this.drawGirl();
        
        // Draw UI
        this.drawUI();
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#FF1493'; // Hot pink color
        
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, CONFIG.PIPE_WIDTH, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(
                pipe.x,
                pipe.bottomY,
                CONFIG.PIPE_WIDTH,
                this.gameHeight - CONFIG.GROUND_HEIGHT - pipe.bottomY
            );
            
            // Pipe caps
            this.ctx.fillStyle = '#C71585';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, CONFIG.PIPE_WIDTH + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, CONFIG.PIPE_WIDTH + 10, 20);
            this.ctx.fillStyle = '#FF1493';
        }
    }
    
    drawGirl() {
        const { x, y, width, height } = this.girl;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Draw dress body
        this.ctx.fillStyle = CHARACTER_COLORS.DRESS;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, y + height * 0.7);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.fill();
        
        // Draw head
        this.ctx.fillStyle = CHARACTER_COLORS.SKIN;
        this.ctx.beginPath();
        this.ctx.arc(centerX, y + height * 0.4, width * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw hair
        this.ctx.fillStyle = CHARACTER_COLORS.HAIR;
        this.ctx.beginPath();
        this.ctx.arc(centerX, y + height * 0.4, width * 0.38, Math.PI, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(centerX - width * 0.35, y + height * 0.45, width * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(centerX + width * 0.35, y + height * 0.45, width * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = CHARACTER_COLORS.EYES;
        this.ctx.beginPath();
        this.ctx.arc(centerX - width * 0.12, y + height * 0.4, width * 0.08, 0, Math.PI * 2);
        this.ctx.arc(centerX + width * 0.12, y + height * 0.4, width * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw mouth
        this.ctx.strokeStyle = CHARACTER_COLORS.MOUTH;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, y + height * 0.5, width * 0.1, 0, Math.PI, false);
        this.ctx.stroke();
        
        // Draw arms
        this.ctx.strokeStyle = CHARACTER_COLORS.DRESS;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.2, y + height * 0.7);
        this.ctx.lineTo(x + width * 0.2, y + height * 0.85);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.8, y + height * 0.7);
        this.ctx.lineTo(x + width * 0.8, y + height * 0.85);
        this.ctx.stroke();
    }
    
    drawUI() {
        // Draw score
        this.ctx.fillStyle = '#4A235A';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        
        // Draw high score
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`High Score: ${this.highScore}`, this.gameWidth - 20, 40);
        
        // Draw game over message
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.gameWidth / 2, this.gameHeight / 2 - 50);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.gameWidth / 2, this.gameHeight / 2);
            this.ctx.fillText(`High Score: ${this.highScore}`, this.gameWidth / 2, this.gameHeight / 2 + 40);
            
            this.ctx.font = '18px Arial';
            this.ctx.fillText('Click or Press SPACE to restart', this.gameWidth / 2, this.gameHeight / 2 + 90);
        }
    }
    
    start() {
        this.reset();
        this.loop(0);
    }
    
    loop(timestamp) {
        if (!this.isPlaying) return;
        
        this.update(timestamp);
        this.draw();
        
        requestAnimationFrame((ts) => this.loop(ts));
    }
    
    getGameState() {
        return {
            isPlaying: this.isPlaying,
            isGameOver: this.isGameOver,
            score: this.score,
            highScore: this.highScore,
            girlPosition: {
                x: this.girl.x,
                y: this.girl.y,
                velocity: this.girl.velocity
            },
            pipeCount: this.pipes.length
        };
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GirlFlapperGame, CONFIG, CHARACTER_COLORS };
}
