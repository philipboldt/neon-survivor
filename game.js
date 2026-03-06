/**
 * Neon Survivor - Core Game Loop
 */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const gameState = {
  running: false,
  score: 0,
  player: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 5,
    color: '#00f5ff'
  },
  enemies: [],
  lastTime: 0
};

const init = () => {
  gameState.running = false;
  gameState.score = 0;
  gameState.player.x = canvas.width / 2;
  gameState.player.y = canvas.height / 2;
  gameState.enemies = [];
  
  const startScreen = document.getElementById('start-screen');
  startScreen.classList.remove('hidden');
  
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
};

const startGame = () => {
  gameState.running = true;
  gameState.lastTime = performance.now();
  
  const startScreen = document.getElementById('start-screen');
  startScreen.classList.add('hidden');
  
  requestAnimationFrame(gameLoop);
};

const update = (deltaTime) => {
  if (!gameState.running) return;
  
  // Basic movement (WASD)
  // This will be expanded with proper input handling
};

const draw = () => {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw Player
  ctx.fillStyle = gameState.player.color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = gameState.player.color;
  ctx.fillRect(
    gameState.player.x - gameState.player.size / 2,
    gameState.player.y - gameState.player.size / 2,
    gameState.player.size,
    gameState.player.size
  );
  ctx.shadowBlur = 0;
};

const gameLoop = (time) => {
  const deltaTime = time - gameState.lastTime;
  gameState.lastTime = time;
  
  update(deltaTime);
  draw();
  
  if (gameState.running) {
    requestAnimationFrame(gameLoop);
  }
};

// Event Listeners
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !gameState.running) {
    startGame();
  }
});

canvas.addEventListener('click', () => {
  if (!gameState.running) {
    startGame();
  }
});

// Initialize the game
init();
