// Girl Flapper - Flappy Bird clone

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let highScore = 0;

// Bird
const bird = {
  x: 150,
  y: canvas.height / 2,
  width: 34,
  height: 24,
  velocity: 0,
  gravity: 0.5,
  jumpPower: -8
};

// Pipes
const pipes = [];
const pipeWidth = 52;
const pipeGap = 150;
const pipeSpeed = 2;
let pipeSpawnTimer = 0;
const pipeSpawnInterval = 100;

// Game loop variables
let animationId;
let lastTime = 0;

// Elements
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Event listeners
document.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('click', handleClick);
restartBtn.addEventListener('click', restartGame);

function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'start') {
      startGame();
    } else if (gameState === 'playing') {
      bird.velocity = bird.jumpPower;
    }
  }
}

function handleClick() {
  if (gameState === 'start') {
    startGame();
  } else if (gameState === 'playing') {
    bird.velocity = bird.jumpPower;
  }
}

function startGame() {
  gameState = 'playing';
  score = 0;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes.length = 0;
  pipeSpawnTimer = 0;
  scoreEl.textContent = score;
  gameOverEl.style.display = 'none';
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (gameState !== 'playing') return;

  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update();
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Boundary check (top and bottom)
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
  }
  if (bird.y + bird.height > canvas.height) {
    bird.y = canvas.height - bird.height;
    gameOver();
  }

  // Pipe spawning
  pipeSpawnTimer++;
  if (pipeSpawnTimer >= pipeSpawnInterval) {
    pipeSpawnTimer = 0;
    const gapCenter = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
      x: canvas.width,
      gapCenter: gapCenter,
      passed: false
    });
  }

  // Move pipes and check collisions
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= pipeSpeed;

    // Collision detection
    const topPipeBottom = pipe.gapCenter - pipeGap / 2;
    const bottomPipeTop = pipe.gapCenter + pipeGap / 2;

    // Bird rectangle
    const birdLeft = bird.x;
    const birdRight = bird.x + bird.width;
    const birdTop = bird.y;
    const birdBottom = bird.y + bird.height;

    // Pipe rectangle
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;

    // Check collision with top pipe
    if (
      birdRight > pipeLeft &&
      birdLeft < pipeRight &&
      birdTop < topPipeBottom
    ) {
      gameOver();
      return;
    }

    // Check collision with bottom pipe
    if (
      birdRight > pipeLeft &&
      birdLeft < pipeRight &&
      birdBottom > bottomPipeTop
    ) {
      gameOver();
      return;
    }

    // Score
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      pipe.passed = true;
      score++;
      scoreEl.textContent = score;
    }

    // Remove off-screen pipes
    if (pipe.x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bird (girl character simplified)
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width / 2 + 6, bird.y + bird.height / 2 - 6, 2, 0, Math.PI * 2);
  ctx.fill();
  // Bow
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width / 2 - 5, bird.y + bird.height / 2 - 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 10, 4, 0, Math.PI * 2);
  ctx.fill();

  // Draw pipes
  ctx.fillStyle = '#228B22';
  for (const pipe of pipes) {
    const topPipeBottom = pipe.gapCenter - pipeGap / 2;
    const bottomPipeTop = pipe.gapCenter + pipeGap / 2;

    // Top pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, topPipeBottom);
    // Bottom pipe
    ctx.fillRect(pipe.x, bottomPipeTop, pipeWidth, canvas.height - bottomPipeTop);

    // Pipe caps
    ctx.fillStyle = '#006400';
    ctx.fillRect(pipe.x - 5, topPipeBottom - 20, pipeWidth + 10, 20);
    ctx.fillRect(pipe.x - 5, bottomPipeTop, pipeWidth + 10, 20);
    ctx.fillStyle = '#228B22';
  }
}

function gameOver() {
  gameState = 'gameover';
  cancelAnimationFrame(animationId);
  if (score > highScore) {
    highScore = score;
  }
  finalScoreEl.textContent = `Score: ${score} | High Score: ${highScore}`;
  gameOverEl.style.display = 'block';
}

function restartGame() {
  startGame();
}

// Initial draw for start screen
function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Press Space or Click to Start', canvas.width / 2, canvas.height / 2);
  ctx.font = '18px Arial';
  ctx.fillText('Girl Flapper', canvas.width / 2, canvas.height / 2 - 40);
}

drawStartScreen();
