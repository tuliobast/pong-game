import './style.css';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;
let ballRotation = 0;

let playerScore = 0;
let aiScore = 0;
let difficulty = 'medium';
let gameRunning = false;

// Create audio context
const bounceSound = new Audio('../Sounds/boing.wav');


function playHitSound() {
  bounceSound.currentTime = 0; // Reinicia el sonido al principio
  bounceSound.play();
}


function setDifficulty(level) {
  difficulty = level;
  resetGame();
}

document.getElementById('easy').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('medium').addEventListener('click', () => setDifficulty('medium'));
document.getElementById('hard').addEventListener('click', () => setDifficulty('hard'));

function resetGame() {
  playerY = canvas.height / 2 - paddleHeight / 2;
  aiY = canvas.height / 2 - paddleHeight / 2;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
  playerScore = 0;
  aiScore = 0;
  updateScore();
  gameRunning = true;
  document.getElementById('gameOver').style.display = 'none';
}

function updateScore() {
  document.getElementById('playerScore').textContent = playerScore;
  document.getElementById('aiScore').textContent = aiScore;
}

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawRotatedBall(x, y, radius, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function movePaddle(e) {
  const rect = canvas.getBoundingClientRect();
  playerY = e.clientY - rect.top - paddleHeight / 2;
  
  if (playerY < 0) playerY = 0;
  if (playerY > canvas.height - paddleHeight) playerY = canvas.height - paddleHeight;
}

canvas.addEventListener('mousemove', movePaddle);

function moveAI() {
  const aiSpeed = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
  const aiCenter = aiY + paddleHeight / 2;
  if (aiCenter < ballY - 35) {
    aiY += aiSpeed;
  } else if (aiCenter > ballY + 35) {
    aiY -= aiSpeed;
  }
}

function updateBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;
  ballRotation += 0.1;

  // Top and bottom collision
  if (ballY - ballSize < 0 || ballY + ballSize > canvas.height) {
    ballSpeedY = -ballSpeedY;
    playHitSound();
  }

  // Paddle collision
  if (ballX - ballSize < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
    ballSpeedX = -ballSpeedX;
    let deltaY = ballY - (playerY + paddleHeight / 2);
    ballSpeedY = deltaY * 0.35;
    playHitSound();
  }

  if (ballX + ballSize > canvas.width - paddleWidth && ballY > aiY && ballY < aiY + paddleHeight) {
    ballSpeedX = -ballSpeedX;
    let deltaY = ballY - (aiY + paddleHeight / 2);
    ballSpeedY = deltaY * 0.35;
    playHitSound();
  }

  // Scoring
  if (ballX < 0) {
    aiScore++;
    checkGameOver();
  } else if (ballX > canvas.width) {
    playerScore++;
    checkGameOver();
  }

  if (ballX < 0 || ballX > canvas.width) {
    if (gameRunning) {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX = -ballSpeedX;
      ballSpeedY = Math.random() > 0.5 ? 5 : -5;
    }
  }
}

function checkGameOver() {
  updateScore();
  if (playerScore >= 11 && playerScore - aiScore >= 2) {
    endGame("¡Has ganado!");
  } else if (aiScore >= 11 && aiScore - playerScore >= 2) {
    endGame("Has perdido.");
  } else if (playerScore >= 10 && aiScore >= 10 && Math.abs(playerScore - aiScore) < 2) {
    // Continue playing
  } else {
    resetBall();
  }
}

function endGame(result) {
  gameRunning = false;
  document.getElementById('gameResult').textContent = result;
  document.getElementById('gameOver').style.display = 'block';
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function draw() {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw paddles
  drawRect(0, playerY, paddleWidth, paddleHeight, 'white');
  drawRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight, 'white');

  // Draw ball
  drawRotatedBall(ballX, ballY, ballSize, ballRotation);

  // Draw center line
  for (let i = 0; i < canvas.height; i += 40) {
    drawRect(canvas.width / 2 - 1, i, 2, 20, 'white');
  }
}

function gameLoop() {
  if (gameRunning) {
    moveAI();
    updateBall();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

document.getElementById('restartButton').addEventListener('click', resetGame);

resetGame();
gameLoop();