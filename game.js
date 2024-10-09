// Einfache Implementierung eines "Quix"-ähnlichen Spiels in JavaScript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: 100,
  y: 100,
  speed: 2,
  trail: [],
  isDrawing: true, // Spieler zeichnet immer
};

const gridSize = 20;
let closedShapes = [];

function drawPlayer() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, gridSize, gridSize);
}

function drawTrail() {
  ctx.strokeStyle = 'orange'; // Geänderte Farbe der Linie, solange sie noch nicht gefüllt ist
  ctx.lineWidth = 2; // Setzt die Breite der Linie
  ctx.setLineDash([]); // Entfernt gestrichelte Linien
  ctx.beginPath();
  for (let i = 0; i < player.trail.length - 1; i++) {
    ctx.moveTo(player.trail[i].x, player.trail[i].y);
    ctx.lineTo(player.trail[i + 1].x, player.trail[i + 1].y);
  }
  ctx.stroke();
}

function drawShapes() {
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
  closedShapes.forEach(shape => {
    ctx.beginPath();
    shape.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
  });
}

function updatePlayerPosition(direction) {
  if (direction === 'up') player.y -= gridSize;
  if (direction === 'down') player.y += gridSize;
  if (direction === 'left') player.x -= gridSize;
  if (direction === 'right') player.x += gridSize;

  if (player.isDrawing) {
    player.trail.push({ x: player.x, y: player.y });
    checkForClosedShape();
    player.isDrawing = true; // Zeichnen sicherstellen
  }
}

function checkForClosedShape() {
  const lastPoint = player.trail[player.trail.length - 1];
  for (let i = 0; i < player.trail.length - 2; i++) {
    if (player.trail[i].x === lastPoint.x && player.trail[i].y === lastPoint.y) {
      closedShapes.push(player.trail.slice(i));
      player.trail = [{ x: player.x, y: player.y }]; // Spieler beginnt eine neue Linie ab der aktuellen Position
      return true;
    }
  }
  return false;
}

function handleInput(event) {
  if (event.key === 'ArrowUp') updatePlayerPosition('up');
  if (event.key === 'ArrowDown') updatePlayerPosition('down');
  if (event.key === 'ArrowLeft') updatePlayerPosition('left');
  if (event.key === 'ArrowRight') updatePlayerPosition('right');
}

document.addEventListener('keydown', handleInput);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShapes();
  drawTrail();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

gameLoop();