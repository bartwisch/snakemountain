// HTML setup
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Player setup
let player1 = {
  x: canvas.width / 3,
  y: canvas.height / 2,
  speed: 3,
  trail: [],
  isDrawing: false
};

let player2 = {
  x: (2 * canvas.width) / 3,
  y: canvas.height / 2,
  speed: 3,
  trail: [],
  isDrawing: false
};

let closedAreasPlayer1 = [];
let closedAreasPlayer2 = [];
let timer = 60;
let gameEnded = false;

// Game controllers
let gamepad1 = null;
let gamepad2 = null;
window.addEventListener("gamepadconnected", (e) => {
  if (!gamepad1) {
    gamepad1 = navigator.getGamepads()[e.gamepad.index];
  } else if (!gamepad2) {
    gamepad2 = navigator.getGamepads()[e.gamepad.index];
  }
});

window.addEventListener("gamepaddisconnected", (e) => {
  if (gamepad1 && gamepad1.index === e.gamepad.index) {
    gamepad1 = null;
  } else if (gamepad2 && gamepad2.index === e.gamepad.index) {
    gamepad2 = null;
  }
});

// Timer countdown
function startTimer() {
  const timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
    } else {
      clearInterval(timerInterval);
      gameEnded = true;
      calculateFilledPercentage();
    }
  }, 1000);
}

function calculateFilledPercentage() {
  let filledPixelsPlayer1 = 0;
  let filledPixelsPlayer2 = 0;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i] === 0 && imageData[i + 1] === 128 && imageData[i + 2] === 0 && imageData[i + 3] === 255) {
      filledPixelsPlayer1++;
    } else if (imageData[i] === 255 && imageData[i + 1] === 0 && imageData[i + 2] === 0 && imageData[i + 3] === 255) {
      filledPixelsPlayer2++;
    }
  }

  const totalPixels = canvas.width * canvas.height;
  const filledPercentagePlayer1 = ((filledPixelsPlayer1 / totalPixels) * 100).toFixed(2);
  const filledPercentagePlayer2 = ((filledPixelsPlayer2 / totalPixels) * 100).toFixed(2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.fillText(`Player 1 (Green): ${filledPercentagePlayer1}%`, canvas.width / 4 - 150, canvas.height / 2 - 30);
  ctx.fillText(`Player 2 (Red): ${filledPercentagePlayer2}%`, (3 * canvas.width) / 4 - 150, canvas.height / 2 - 30);

  if (filledPercentagePlayer1 > filledPercentagePlayer2) {
    ctx.fillText('Player 1 Wins!', canvas.width / 2 - 150, canvas.height / 2 + 60);
  } else if (filledPercentagePlayer2 > filledPercentagePlayer1) {
    ctx.fillText('Player 2 Wins!', canvas.width / 2 - 150, canvas.height / 2 + 60);
  } else {
    ctx.fillText('Its a Tie!', canvas.width / 2 - 150, canvas.height / 2 + 60);
  }
}

// Game loop
function update() {
  if (gameEnded) return;

  if (gamepad1) {
    gamepad1 = navigator.getGamepads()[gamepad1.index];
    const leftStickX1 = gamepad1.axes[0] || 0;
    const leftStickY1 = gamepad1.axes[1] || 0;

    // Update player 1 position
    if (Math.abs(leftStickX1) > 0.2) player1.x += leftStickX1 * player1.speed;
    if (Math.abs(leftStickY1) > 0.2) player1.y += leftStickY1 * player1.speed;

    // Ensure player 1 doesn't go out of bounds
    player1.x = Math.max(0, Math.min(canvas.width - 5, player1.x));
    player1.y = Math.max(0, Math.min(canvas.height - 5, player1.y));

    // Add to player 1 trail when drawing
    if (gamepad1.buttons[0] && gamepad1.buttons[0].pressed) {
      if (!player1.isDrawing) player1.trail = [];
      player1.isDrawing = true;
      player1.trail.push({ x: player1.x, y: player1.y });
    } else if (player1.isDrawing) {
      player1.isDrawing = false;
      if (player1.trail.length > 1) {
        closedAreasPlayer1.push(player1.trail);
      }
    }
  }

  if (gamepad2) {
    gamepad2 = navigator.getGamepads()[gamepad2.index];
    const leftStickX2 = gamepad2.axes[0] || 0;
    const leftStickY2 = gamepad2.axes[1] || 0;

    // Update player 2 position
    if (Math.abs(leftStickX2) > 0.2) player2.x += leftStickX2 * player2.speed;
    if (Math.abs(leftStickY2) > 0.2) player2.y += leftStickY2 * player2.speed;

    // Ensure player 2 doesn't go out of bounds
    player2.x = Math.max(0, Math.min(canvas.width - 5, player2.x));
    player2.y = Math.max(0, Math.min(canvas.height - 5, player2.y));

    // Add to player 2 trail when drawing
    if (gamepad2.buttons[0] && gamepad2.buttons[0].pressed) {
      if (!player2.isDrawing) player2.trail = [];
      player2.isDrawing = true;
      player2.trail.push({ x: player2.x, y: player2.y });
    } else if (player2.isDrawing) {
      player2.isDrawing = false;
      if (player2.trail.length > 1) {
        closedAreasPlayer2.push(player2.trail);
      }
    }
  }

  draw();
  requestAnimationFrame(update);
}

// Draw the game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw timer
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Time: ${timer}s`, 20, 30);

  // Draw closed areas for player 1
  ctx.fillStyle = 'green'; // Player 1 color
  for (const area of closedAreasPlayer1) {
    ctx.beginPath();
    for (let i = 0; i < area.length; i++) {
      if (i === 0) ctx.moveTo(area[i].x, area[i].y);
      else ctx.lineTo(area[i].x, area[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Draw closed areas for player 2
  ctx.fillStyle = 'red'; // Player 2 color
  for (const area of closedAreasPlayer2) {
    ctx.beginPath();
    for (let i = 0; i < area.length; i++) {
      if (i === 0) ctx.moveTo(area[i].x, area[i].y);
      else ctx.lineTo(area[i].x, area[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Draw player 1 trail
  if (player1.isDrawing && player1.trail.length > 0) {
    ctx.strokeStyle = 'lightgreen'; // Same color as player 1, but brighter
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < player1.trail.length; i++) {
      if (i === 0) ctx.moveTo(player1.trail[i].x, player1.trail[i].y);
      else ctx.lineTo(player1.trail[i].x, player1.trail[i].y);
    }
    ctx.stroke();
  }

  // Draw player 2 trail
  if (player2.isDrawing && player2.trail.length > 0) {
    ctx.strokeStyle = 'pink'; // Same color as player 2, but brighter
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < player2.trail.length; i++) {
      if (i === 0) ctx.moveTo(player2.trail[i].x, player2.trail[i].y);
      else ctx.lineTo(player2.trail[i].x, player2.trail[i].y);
    }
    ctx.stroke();
  }

  // Draw player 1
  ctx.fillStyle = 'green';
  ctx.fillRect(player1.x - 5, player1.y - 5, 10, 10);

  // Draw player 2
  ctx.fillStyle = 'red';
  ctx.fillRect(player2.x - 5, player2.y - 5, 10, 10);
}

// Start game loop and timer
startTimer();
update();