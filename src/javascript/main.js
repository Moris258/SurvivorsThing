import Camera from "./camera.js";
import { Player } from "./character.js";
import { game } from "./game.js";

// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
if (!canvas) {
    console.error("Canvas element with ID 'myCanvas' not found.");
}

const ctx = canvas.getContext('2d');
const camera = game.camera;

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
game.setGameSize(CANVAS_WIDTH * 4, CANVAS_HEIGHT * 4);
let playerPos = {x: game.GAME_WIDTH / 2, y: game.GAME_HEIGHT / 2};
let playerSize = {x: 40, y: 40};
game.setCanvasSize(CANVAS_WIDTH, CANVAS_HEIGHT);
game.setPlayer(new Player(playerPos, 100, playerSize, 1));
game.spawnEnemy();
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let lastTime = performance.now();

function animationLoop(currentTime) {
    const deltaT = currentTime - lastTime;
    lastTime = currentTime;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    game.update(deltaT/1000);
    game.draw(ctx, camera);

    // Request the next frame
    requestAnimationFrame(animationLoop);
}

console.log("Starting animation loop...");
requestAnimationFrame(animationLoop);
