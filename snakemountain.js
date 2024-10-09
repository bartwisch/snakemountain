// Grundlegendes Setup des Spiels mit einem Spieler
// Das Spiel ist in JavaScript mit HTML Canvas

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PLAYER_COLOR = 'blue';
const PLAYER_SPEED = 2;
const LINE_DASH = [10, 10]; // für gestrichelte Linien

let player = { x: 100, y: 100, color: PLAYER_COLOR, path: [], score: 0 };
let filledAreas = [];

// Eingabesteuerung für den Spieler
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function updatePlayer(player, upKey, downKey, leftKey, rightKey) {
  let moved = false;
  if (keys[upKey]) {
    player.y = Math.max(0, player.y - PLAYER_SPEED);
    moved = true;
  }
  if (keys[downKey]) {
    player.y = Math.min(canvas.height, player.y + PLAYER_SPEED);
    moved = true;
  }
  if (keys[leftKey]) {
    player.x = Math.max(0, player.x - PLAYER_SPEED);
    moved = true;
  }
  if (keys[rightKey]) {
    player.x = Math.min(canvas.width, player.x + PLAYER_SPEED);
    moved = true;
  }

  if (moved && (player.path.length === 0 || (player.path[player.path.length - 1].x !== player.x || player.path[player.path.length - 1].y !== player.y))) {
    player.path.push({ x: player.x, y: player.y });
  }
}

function drawPath(player) {
  if (player.path.length === 0) return;

  ctx.beginPath();
  ctx.setLineDash(LINE_DASH);
  ctx.strokeStyle = player.color;
  ctx.moveTo(player.path[0].x, player.path[0].y);
  for (let i = 1; i < player.path.length; i++) {
    ctx.lineTo(player.path[i].x, player.path[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function checkClosedPath(player) {
  if (player.path.length > 20) {
    const start = player.path[0];
    const end = player.path[player.path.length - 1];
    if (Math.abs(start.x - end.x) < 10 && Math.abs(start.y - end.y) < 10) {
      fillClosedArea(player);
      player.path = [];
    }
  }
}

function fillClosedArea(player) {
  if (player.path.length === 0) return;

  filledAreas.push({ path: [...player.path], color: player.color });

  // Punkte berechnen (Größe der geschlossenen Fläche)
  const areaSize = player.path.length * 10; // Vereinfachte Berechnung
  player.score += areaSize;
  updateScoreboard();
}

function drawFilledAreas() {
  filledAreas.forEach(area => {
    ctx.fillStyle = area.color;
    ctx.beginPath();
    ctx.moveTo(area.path[0].x, area.path[0].y);
    for (let i = 1; i < area.path.length; i++) {
      ctx.lineTo(area.path[i].x, area.path[i].y);
    }
    ctx.closePath();
    ctx.fill();
  });
}

function updateScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  if (scoreboard) {
    scoreboard.innerHTML = `Player Score: ${player.score}`;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawFilledAreas();

  updatePlayer(player, 'w', 's', 'a', 'd');
  drawPath(player);
  checkClosedPath(player);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);