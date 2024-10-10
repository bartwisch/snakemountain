// HTML setup
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Player setup
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  speed: 3,
  trail: [],
  isDrawing: false
};

let closedAreas = [];

// Game controller
let gamepad = null;
window.addEventListener("gamepadconnected", (e) => {
  gamepad = navigator.getGamepads()[e.gamepad.index];
});

window.addEventListener("gamepaddisconnected", () => {
  gamepad = null;
});

// Game loop
function update() {
  if (gamepad) {
    gamepad = navigator.getGamepads()[gamepad.index];
    const leftStickX = gamepad.axes[0] || 0;
    const leftStickY = gamepad.axes[1] || 0;

    // Update player position
    if (Math.abs(leftStickX) > 0.2) player.x += leftStickX * player.speed;
    if (Math.abs(leftStickY) > 0.2) player.y += leftStickY * player.speed;

    // Ensure player doesn't go out of bounds
    player.x = Math.max(0, Math.min(canvas.width - 5, player.x));
    player.y = Math.max(0, Math.min(canvas.height - 5, player.y));

    // Add to trail when drawing
    if (gamepad.buttons[0] && gamepad.buttons[0].pressed) {
      if (!player.isDrawing) player.trail = [];
      player.isDrawing = true;
      player.trail.push({ x: player.x, y: player.y });
    } else if (player.isDrawing) {
      player.isDrawing = false;
      if (player.trail.length > 1) {
        closedAreas.push(player.trail);
      }
    }
  }

  draw();
  requestAnimationFrame(update);
}

// Draw the game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw closed areas
  ctx.fillStyle = 'rgba(0, 150, 0, 1)'; // 0% transparency
  for (const area of closedAreas) {
    ctx.beginPath();
    for (let i = 0; i < area.length; i++) {
      if (i === 0) ctx.moveTo(area[i].x, area[i].y);
      else ctx.lineTo(area[i].x, area[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Draw player trail
  if (player.isDrawing && player.trail.length > 0) {
    ctx.strokeStyle = 'lightgreen'; // Same color as player, but brighter
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < player.trail.length; i++) {
      if (i === 0) ctx.moveTo(player.trail[i].x, player.trail[i].y);
      else ctx.lineTo(player.trail[i].x, player.trail[i].y);
    }
    ctx.stroke();
  }

  // Draw player
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x - 5, player.y - 5, 10, 10);
}

// Start game loop
update();