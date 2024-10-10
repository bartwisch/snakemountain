// game.js

// Canvas und Kontext initialisieren
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Spielvariablen
let gamepads = {};
let prevButtonStates = {}; // Vorherige Zustände der Gamepad-Tasten
let gameTime = 60; // Spielzeit in Sekunden
let startTime; // Spielstartzeit
let gameOver = false; // Status, ob das Spiel beendet ist

// Spielerobjekte
let players = [
    {
        id: 1,
        x: canvas.width / 4,
        y: canvas.height - 20,
        speed: 5,
        size: 10,
        color: 'white',
        isDrawing: false,
        path: [],
        controls: 'gamepad', // Steuerung über Gamepad
        gamepadIndex: null, // Index des zugewiesenen Gamepads
        filledArea: 0 // Gesamtfläche, die der Spieler gefüllt hat
    },
    {
        id: 2,
        x: (canvas.width / 4) * 3,
        y: canvas.height - 20,
        speed: 5,
        size: 10,
        color: 'green',
        isDrawing: false,
        path: [],
        controls: 'gamepad', // Steuerung über Gamepad
        gamepadIndex: null, // Index des zugewiesenen Gamepads
        filledArea: 0 // Gesamtfläche, die der Spieler gefüllt hat
    }
];

let enemies = [];
let lines = [];
let filledAreas = [];

// Spiel starten
window.onload = function() {
    window.addEventListener('gamepadconnected', gamepadHandler);
    window.addEventListener('gamepaddisconnected', gamepadHandler);
    initEnemies();
    startGameTimer();
    gameOver = false;
    requestAnimationFrame(gameLoop);
};

// Gamepad-Ereignisfunktion
function gamepadHandler(event) {
    const gp = navigator.getGamepads()[event.gamepad.index];
    if (event.type === 'gamepadconnected') {
        gamepads[gp.index] = gp;
        // Vorherige Tasten-Zustände initialisieren
        prevButtonStates[gp.index] = gp.buttons.map(b => false);
        console.log('Gamepad verbunden:', gp.id);

        // Einem Spieler das Gamepad zuweisen, der noch keins hat
        for (let player of players) {
            if (player.gamepadIndex === null) {
                player.gamepadIndex = gp.index;
                console.log('Spieler', player.id, 'wurde Gamepad', gp.index, 'zugewiesen.');
                break;
            }
        }
    } else {
        delete gamepads[gp.index];
        delete prevButtonStates[gp.index];
        console.log('Gamepad getrennt:', gp.id);

        // Entferne die Gamepad-Zuordnung von Spielern, deren Gamepad getrennt wurde
        for (let player of players) {
            if (player.gamepadIndex === gp.index) {
                player.gamepadIndex = null;
                console.log('Spieler', player.id, 'hat sein Gamepad verloren.');
            }
        }
    }
}

// Spiel-Timer starten
function startGameTimer() {
    startTime = Date.now();
}

// Gewinner bestimmen
function determineWinner() {
    let totalCanvasArea = canvas.width * canvas.height;
    let player1Percent = (players[0].filledArea / totalCanvasArea) * 100;
    let player2Percent = (players[1].filledArea / totalCanvasArea) * 100;

    if (player1Percent > player2Percent) {
        alert('Zeit abgelaufen! Spieler 1 hat gewonnen mit ' + player1Percent.toFixed(2) + '%!');
    } else if (player2Percent > player1Percent) {
        alert('Zeit abgelaufen! Spieler 2 hat gewonnen mit ' + player2Percent.toFixed(2) + '%!');
    } else {
        alert('Zeit abgelaufen! Unentschieden mit jeweils ' + player1Percent.toFixed(2) + '%!');
    }
    resetGame();
}

// Spielschleife
function gameLoop() {
    update();
    render();

    // Spielzeit überprüfen
    if (!gameOver) {
        let elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= gameTime) {
            gameOver = true;
            determineWinner();
        }
    }

    // Nächsten Frame anfordern
    requestAnimationFrame(gameLoop);
}

// Aktualisiere Spielzustand
function update() {
    if (!gameOver) {
        handleInput();
        moveEnemies();
        checkCollisions();
        // Weitere Spielaktualisierungen hier hinzufügen
    }
}

// Eingaben verarbeiten
function handleInput() {
    for (let player of players) {
        if (player.controls === 'gamepad' && player.gamepadIndex !== null) {
            let moveX = 0;
            let moveY = 0;

            const gp = navigator.getGamepads()[player.gamepadIndex];
            if (gp) {
                // Analog-Stick-Achsen
                const xAxis = gp.axes[0];
                const yAxis = gp.axes[1];
                moveX += xAxis * player.speed;
                moveY += yAxis * player.speed;

                // Tasten A (0) und B (1) zum Starten/Stoppen des Zeichnens
                for (let i of [0, 1]) {
                    const buttonPressed = gp.buttons[i].pressed;
                    const prevButtonPressed = prevButtonStates[gp.index][i];

                    if (buttonPressed && !prevButtonPressed) {
                        // Taste wurde gerade gedrückt
                        player.isDrawing = !player.isDrawing;
                        if (player.isDrawing) {
                            player.path = [{ x: player.x, y: player.y }];
                        } else {
                            completePath(player);
                        }
                    }
                    // Vorherigen Tasten-Zustand aktualisieren
                    prevButtonStates[gp.index][i] = buttonPressed;
                }

                player.x += moveX;
                player.y += moveY;

                // Begrenzung innerhalb des Canvas
                player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
                player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

                // Pfad verfolgen, wenn Zeichnen aktiv ist
                if (player.isDrawing) {
                    player.path.push({ x: player.x, y: player.y });
                }
            }
        }
    }
}

// Feinde initialisieren
function initEnemies() {
    // Beispielhaft zwei Feinde hinzufügen
    enemies.push({
        x: 100,
        y: 100,
        speedX: 2,
        speedY: 2,
        size: 10,
        color: 'red'
    });
    enemies.push({
        x: 200,
        y: 200,
        speedX: -2,
        speedY: -2,
        size: 10,
        color: 'red'
    });
}

// Feinde bewegen
function moveEnemies() {
    for (let enemy of enemies) {
        enemy.x += enemy.speedX;
        enemy.y += enemy.speedY;

        // An Wänden abprallen
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.size) {
            enemy.speedX *= -1;
        }
        if (enemy.y <= 0 || enemy.y >= canvas.height - enemy.size) {
            enemy.speedY *= -1;
        }
    }
}

// Kollisionen überprüfen
function checkCollisions() {
    for (let player of players) {
        for (let enemy of enemies) {
            // Kollision mit Spieler
            if (isColliding(player, enemy)) {
                // Spiel endet oder Leben verlieren
                alert('Spieler ' + player.id + ' wurde getroffen!');
                resetGame();
                return;
            }

            // Kollision mit dem Pfad
            if (player.isDrawing) {
                for (let point of player.path) {
                    if (Math.hypot(enemy.x - point.x, enemy.y - point.y) < enemy.size) {
                        alert('Der Pfad von Spieler ' + player.id + ' wurde getroffen!');
                        resetGame();
                        return;
                    }
                }
            }
        }
    }
}

// Pfad abschließen und Bereich füllen
function completePath(player) {
    if (player.path.length > 2) {
        let area = calculatePolygonArea(player.path);
        if (area > 0) {
            // Bereich füllen
            filledAreas.push({
                points: [...player.path],
                color: player.color,
                area: area,
                playerId: player.id
            });

            // Gefüllte Fläche zum Spieler hinzufügen
            player.filledArea += area;
        }
    }
    player.path = [];
}

// Fläche eines Polygons berechnen (Shoelace-Formel)
function calculatePolygonArea(points) {
    let area = 0;
    let n = points.length;
    for (let i = 0; i < n; i++) {
        let j = (i + 1) % n;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
}

// Spiel zurücksetzen
function resetGame() {
    // Spielerpositionen und gefüllte Flächen zurücksetzen
    for (let player of players) {
        player.x = player.id === 1 ? canvas.width / 4 : (canvas.width / 4) * 3;
        player.y = canvas.height - 20;
        player.isDrawing = false;
        player.path = [];
        player.filledArea = 0; // Gefüllte Fläche zurücksetzen
    }

    enemies = [];
    lines = [];
    filledAreas = [];

    // Spiel neu starten
    initEnemies();
    startGameTimer();
    gameOver = false;
}

// Kollisionserkennung
function isColliding(a, b) {
    return (
        a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y
    );
}

// Spielfeld zeichnen
function render() {
    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gefüllte Bereiche zeichnen
    for (let area of filledAreas) {
        ctx.fillStyle = area.color === 'white' ? 'rgba(0, 0, 255, 0.5)' : 'rgba(128, 0, 128, 0.5)';
        ctx.beginPath();
        ctx.moveTo(area.points[0].x, area.points[0].y);
        for (let point of area.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Gezeichnete Linien zeichnen
    ctx.lineWidth = 2;
    for (let line of lines) {
        ctx.strokeStyle = line.color === 'white' ? 'yellow' : 'lightgreen';
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let point of line.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    // Aktuelle Pfade der Spieler zeichnen
    for (let player of players) {
        if (player.isDrawing && player.path.length > 0) {
            ctx.strokeStyle = player.color;
            ctx.beginPath();
            ctx.moveTo(player.path[0].x, player.path[0].y);
            for (let point of player.path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    }

    // Spieler zeichnen
    for (let player of players) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    // Feinde zeichnen
    for (let enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    }

    // Punktestände anzeigen
    let totalCanvasArea = canvas.width * canvas.height;
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';

    let player1Percent = (players[0].filledArea / totalCanvasArea) * 100;
    let player2Percent = (players[1].filledArea / totalCanvasArea) * 100;

    ctx.fillText('Spieler 1: ' + player1Percent.toFixed(2) + '%', 10, 20);
    ctx.fillText('Spieler 2: ' + player2Percent.toFixed(2) + '%', 10, 50);

    // Verbleibende Zeit anzeigen
    let elapsed = (Date.now() - startTime) / 1000;
    let remainingTime = Math.max(0, Math.ceil(gameTime - elapsed));
    ctx.fillText('Zeit: ' + remainingTime + 's', canvas.width - 100, 20);
}
