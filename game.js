// Einfache Implementierung eines "Quix"-ähnlichen Spiels in JavaScript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let closedShapes = [];

const player1 = {
  x: 100,
  y: 100,
  speed: 0.2, // Gleiche Geschwindigkeit für beide Spieler
  trail: [],
  isDrawing: true, // Spieler zeichnet immer
  color: 'blue',
  trailColor: 'lightblue'
};

const player2 = {
  x: 200,
  y: 200,
  speed: 0.2, // Gleiche Geschwindigkeit für beide Spieler
  trail: [],
  isDrawing: true, // Spieler zeichnet immer
  color: 'red',
  trailColor: 'lightcoral'
};

function drawPlayer(player) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, gridSize, gridSize);
}

function drawTrail(player) {
  ctx.strokeStyle = player.trailColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  for (let i = 0; i < player.trail.length - 1; i++) {
    ctx.moveTo(player.trail[i].x, player.trail[i].y);
    ctx.lineTo(player.trail[i + 1].x, player.trail[i + 1].y);
  }
  ctx.stroke();
}

function drawShapes() {
  closedShapes.forEach(shape => {
    ctx.fillStyle = shape.player.color;
    ctx.beginPath();
    shape.points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
  });
}

function updatePlayerPosition(player, direction) {
  let newX = player.x;
  let newY = player.y;

  if (direction === 'up') newY -= player.speed * gridSize;
  if (direction === 'down') newY += player.speed * gridSize;
  if (direction === 'left') newX -= player.speed * gridSize;
  if (direction === 'right') newX += player.speed * gridSize;

  // Begrenzung der Spielfläche
  if (newX >= 0 && newX <= canvas.width - gridSize && newY >= 0 && newY <= canvas.height - gridSize) {
    player.x = newX;
    player.y = newY;

    if (player.isDrawing) {
      player.trail.push({ x: player.x, y: player.y });
      checkForClosedShape(player);
      player.isDrawing = true;
    }
  }
}

function checkForClosedShape(player) {
  const lastPoint = player.trail[player.trail.length - 1];
  for (let i = 0; i < player.trail.length - 2; i++) {
    if (player.trail[i].x === lastPoint.x && player.trail[i].y === lastPoint.y) {
      closedShapes.push({ points: player.trail.slice(i), player: player });
      player.trail = [{ x: player.x, y: player.y }];
      return true;
    }
  }
  return false;
}

function handleInput(event) {
  if (event.key === 'ArrowUp') updatePlayerPosition(player1, 'up');
  if (event.key === 'ArrowDown') updatePlayerPosition(player1, 'down');
  if (event.key === 'ArrowLeft') updatePlayerPosition(player1, 'left');
  if (event.key === 'ArrowRight') updatePlayerPosition(player1, 'right');

  if (event.key === 'w') updatePlayerPosition(player2, 'up');
  if (event.key === 's') updatePlayerPosition(player2, 'down');
  if (event.key === 'a') updatePlayerPosition(player2, 'left');
  if (event.key === 'd') updatePlayerPosition(player2, 'right');
}

document.addEventListener('keydown', handleInput);

// Xbox und Bluetooth Controller Unterstützung
window.addEventListener("gamepadconnected", (event) => {
  console.log("Gamepad connected:", event.gamepad);
});

function handleGamepadInput() {
  const gamepads = navigator.getGamepads();
  if (gamepads[0]) {
    const gp1 = gamepads[0];
    if (gp1.axes[1] < -0.5) updatePlayerPosition(player1, 'up');
    if (gp1.axes[1] > 0.5) updatePlayerPosition(player1, 'down');
    if (gp1.axes[0] < -0.5) updatePlayerPosition(player1, 'left');
    if (gp1.axes[0] > 0.5) updatePlayerPosition(player1, 'right');
  }
  if (gamepads[1]) {
    const gp2 = gamepads[1];
    if (gp2.axes[1] < -0.5) updatePlayerPosition(player2, 'up');
    if (gp2.axes[1] > 0.5) updatePlayerPosition(player2, 'down');
    if (gp2.axes[0] < -0.5) updatePlayerPosition(player2, 'left');
    if (gp2.axes[0] > 0.5) updatePlayerPosition(player2, 'right');
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShapes();
  drawTrail(player1);
  drawTrail(player2);
  drawPlayer(player1);
  drawPlayer(player2);
  handleGamepadInput();
  requestAnimationFrame(gameLoop);
}

gameLoop();