/**
 * Girl Flapper Game
 * A Flappy Bird-style game featuring a girl character
 */

// Game Configuration
const CONFIG = {
    GAME_WIDTH: 400,
    GAME_HEIGHT: 600,
    GRAVITY: 0.5,
    JUMP_STRENGTH: -8,
    GIRL_SIZE: 30,
    GIRL_X: 80,
    PIPE_WIDTH: 60,
    PIPE_GAP: 150,
    PIPE_SPEED: 3,
    PIPE_SPAWN_RATE: 1500,
    FPS: 60
};

class GirlFlapperGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.GAME_WIDTH;
        this.canvas.height = CONFIG.GAME_HEIGHT;
        
        // Game State
        this.girlY = CONFIG.GAME_HEIGHT / 2;
        this.girlVelocity = 0;
        this.isJumping = false;
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.isPlaying = false;
        this.pipes = [];
        this.lastPipeSpawn = 0;
        this.animationFrame = null;
        
        // Event Listeners
        this.bindEvents();
    }
    
    bindEvents() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    }
    
    handleKeyDown(event) {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault();
            this.jump();
        }
    }
    
    handleKeyUp(event) {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            this.isJumping = false;
        }
    }
    
    handleClick(event) {
        event.preventDefault();
        this.jump();
    }
    
    handleTouch(event) {
        event.preventDefault();
        this.jump();
    }
    
    jump() {
        if (this.gameOver && !this.isPlaying) {
            this.reset();
            return;
        }
        
        if (!this.isPlaying) {
            this.start();
        } else {
            this.girlVelocity = CONFIG.JUMP_STRENGTH;
        }
    }
    
    start() {
        this.isPlaying = true;
        this.gameOver = false;
        this.score = 0;
        this.pipes = [];
        this.girlY = CONFIG.GAME_HEIGHT / 2;
        this.girlVelocity = 0;
        this.lastPipeSpawn = performance.now();
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.update();
    }
    
    reset() {
        this.start();
    }
    
    update() {
        if (this.gameOver) return;
        
        const now = performance.now();
        
        // Spawn pipes
        if (now - this.lastPipeSpawn > CONFIG.PIPE_SPAWN_RATE) {
            this.spawnPipe(now);
            this.lastPipeSpawn = now;
        }
        
        // Update physics
        this.girlVelocity += CONFIG.GRAVITY;
        this.girlY += this.girlVelocity;
        
        // Update pipes
        this.updatePipes();
        
        // Check collisions
        if (this.checkCollisions()) {
            this.endGame();
            return;
        }
        
        // Check boundaries
        if (this.girlY < 0 || this.girlY + CONFIG.GIRL_SIZE > CONFIG.GAME_HEIGHT) {
            this.endGame();
            return;
        }
        
        // Draw everything
        this.draw();
        
        this.animationFrame = requestAnimationFrame(this.update.bind(this));
    }
    
    spawnPipe(timestamp) {
        const minHeight = 50;
        const maxHeight = CONFIG.GAME_HEIGHT - CONFIG.PIPE_GAP - minHeight;
        const pipeY = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: CONFIG.GAME_WIDTH,
            topY: pipeY,
            bottomY: pipeY + CONFIG.PIPE_GAP,
            passed: false,
            id: timestamp
        });
    }
    
    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= CONFIG.PIPE_SPEED;
            
            // Score when passing a pipe
            if (!this.pipes[i].passed && this.pipes[i].x + CONFIG.PIPE_WIDTH < CONFIG.GIRL_X) {
                this.pipes[i].passed = true;
                this.score++;
            }
            
            // Remove off-screen pipes
            if (this.pipes[i].x + CONFIG.PIPE_WIDTH < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        const girlLeft = CONFIG.GIRL_X;
        const girlRight = CONFIG.GIRL_X + CONFIG.GIRL_SIZE;
        const girlTop = this.girlY;
        const girlBottom = this.girlY + CONFIG.GIRL_SIZE;
        
        for (const pipe of this.pipes) {
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + CONFIG.PIPE_WIDTH;
            
            // Check if overlapping horizontally
            if (girlRight > pipeLeft && girlLeft < pipeRight) {
                // Check vertical collision (hit top or bottom pipe)
                if (girlTop < pipe.topY || girlBottom > pipe.bottomY) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    endGame() {
        this.gameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.draw();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#70c5ce';
        this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.GAME_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F7FA');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // Draw pipes
        this.ctx.fillStyle = '#6b8e23';
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, CONFIG.PIPE_WIDTH, pipe.topY);
            this.ctx.strokeStyle = '#556b2f';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(pipe.x, 0, CONFIG.PIPE_WIDTH, pipe.topY);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, CONFIG.PIPE_WIDTH, CONFIG.GAME_HEIGHT - pipe.bottomY);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, CONFIG.PIPE_WIDTH, CONFIG.GAME_HEIGHT - pipe.bottomY);
        }
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, CONFIG.GAME_HEIGHT - 50, CONFIG.GAME_WIDTH, 50);
        
        // Draw grass on top of ground
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, CONFIG.GAME_HEIGHT - 50, CONFIG.GAME_WIDTH, 10);
        
        // Draw girl (simplified sprite)
        this.drawGirl();
        
        // Draw score
        this.drawScore();
        
        // Draw game over message
        if (this.gameOver) {
            this.drawGameOver();
        }
        
        // Draw start message
        if (!this.isPlaying && !this.gameOver) {
            this.drawStartMessage();
        }
    }
    
    drawGirl() {
        const x = CONFIG.GIRL_X;
        const y = this.girlY;
        const size = CONFIG.GIRL_SIZE;
        
        // Body
        this.ctx.fillStyle = '#FF69B4'; // Pink dress
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Head
        this.ctx.fillStyle = '#FFE0BD'; // Skin tone
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/4, size/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair
        this.ctx.fillStyle = '#8B4513'; // Brown hair
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/4, size/4 + 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bow
        this.ctx.fillStyle = '#FF1493';
        this.ctx.fillRect(x + size/2 - 5, y + size/4 - 2, 10, 5);
        
        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x + size/2 - 4, y + size/4 - 2, 2, 0, Math.PI * 2);
        this.ctx.arc(x + size/2 + 4, y + size/4 - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wings (small flutter effect based on velocity)
        const wingOffset = Math.sin(performance.now() / 100) * 5;
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.beginPath();
        this.ctx.moveTo(x + size/2 - 10, y + size/2);
        this.ctx.lineTo(x - 5, y + size/2 + wingOffset);
        this.ctx.lineTo(x + size/2 - 10, y + size/2 + 10);
        this.ctx.fill();
    }
    
    drawScore() {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Score: ${this.score}`, CONFIG.GAME_WIDTH / 2, 50);
        
        if (this.highScore > 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Best: ${this.highScore}`, CONFIG.GAME_WIDTH / 2, 80);
        }
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 - 40);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2);
        this.ctx.fillText(`Press SPACE or TAP to restart`, CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 + 40);
    }
    
    drawStartMessage() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GIRL FLAPPER', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 - 30);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press SPACE or TAP to fly', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2);
        this.ctx.fillText('Avoid the pipes!', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 + 40);
    }
    
    getGameState() {
        return {
            girlY: this.girlY,
            girlVelocity: this.girlVelocity,
            score: this.score,
            highScore: this.highScore,
            gameOver: this.gameOver,
            pipes: [...this.pipes]
        };
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('touchstart', this.handleTouch);
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GirlFlapperGame, CONFIG };
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const game = new GirlFlapperGame('game-canvas');
            window.gameInstance = game;
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    });
}
