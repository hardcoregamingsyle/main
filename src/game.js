function startGame() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('game-container');
  container.appendChild(canvas);

  const girl = {
    x: 50,
    y: canvas.height - 100,
    radius: 20,
    vy: 0,
    gravity: 0.5,
    jump: -10,
  };

  const pipes = [];
  const pipeWidth = 60;
  const pipeGap = 150;
  const pipeSpeed = 2;

  function initPipes() {
    const topY = Math.random() * (canvas.height - pipeGap - 50) + 25;
    const bottomY = topY + pipeGap;
    pipes.push({
      x: canvas.width,
      topY,
      bottomY,
      width: pipeWidth,
    });
  }

  function update() {
    // Girl physics
    girl.vy += girl.gravity;
    girl.y += girl.vy;

    // Ground collision
    if (girl.y + girl.radius > canvas.height - 10) {
      reset();
      return;
    }
    // Ceiling collision
    if (girl.y - girl.radius < 0) {
      reset();
      return;
    }

    // Pipe collision
    for (const p of pipes) {
      // top pipe
      if (girl.x + girl.radius > p.x && girl.x - girl.radius < p.x + pipeWidth && girl.y - girl.radius < p.topY) {
        reset();
        return;
      }
      // bottom pipe
      if (girl.x + girl.radius > p.x && girl.x - girl.radius < p.x + pipeWidth && girl.y + girl.radius > p.bottomY) {
        reset();
        return;
      }
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Girl
    ctx.beginPath();
    ctx.arc(girl.x, girl.y, girl.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff69b4';
    ctx.fill();

    // Pipes
    ctx.fillStyle = '#ff69b4';
    for (const p of pipes) {
      ctx.fillRect(p.x, 0, p.width, p.topY);
      ctx.fillRect(p.x, p.bottomY, p.width, canvas.height - p.bottomY);
    }

    requestAnimationFrame(update);
  }

  function reset() {
    girl.y = canvas.height - 100;
    girl.vy = 0;
    pipes = [];
    initPipes();
  }

  function spawnPipe() {
    const topY = Math.random() * (canvas.height - pipeGap - 50) + 25;
    const bottomY = topY + pipeGap;
    pipes.push({
      x: canvas.width,
      topY,
      bottomY,
      width: pipeWidth,
    });
  }

  function loop() {
    update();
    // Move pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= pipeSpeed;
      if (pipes[i].x + pipeWidth < 0) {
        pipes.splice(i, 1);
      }
    }
    // Add new pipe
    if (pipes.length > 0 && pipes[0].x < canvas.width - 150) {
      spawnPipe();
    }
    requestAnimationFrame(loop);
  }

  // Input
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      girl.vy = girl.jump;
    }
  });
  canvas.addEventListener('click', () => {
    girl.vy = girl.jump;
  });

  initPipes();
  requestAnimationFrame(loop);
}

// Start the game when the page loads
window.addEventListener('load', startGame);