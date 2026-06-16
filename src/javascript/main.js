import { CavesBackground, DesertBackground, ForestBackground, MeadowsBackground } from "./background.js";
import Camera from "./camera.js";
import { Player } from "./character.js";
import { game } from "./game.js";
import GameObject from "./gameObject.js";
import InputHandler from "./inputHandler.js";
import { calculateAngleBetweenVectors, calculateRotationDegrees, drawRectangle, rotateVector } from "./utility.js";
import Weapon, { AimedWeapon, AuraWeapon, ExplosiveWeapon, HomingWeapon } from "./weapon.js";
import { DarknessWeatherEffect, LightningWeatherEffect, RainWeatherEffect, SnowWeatherEffect } from "./weatherEffect.js";

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
game.setInputHandler(new InputHandler(camera));

let background = new ForestBackground(game.GAME_WIDTH, game.GAME_HEIGHT);
background.addWeatherEffect(new SnowWeatherEffect(CANVAS_WIDTH, CANVAS_WIDTH, 0.7));
game.setBackground(background);

let playerPos = {x: game.GAME_WIDTH / 2, y: game.GAME_HEIGHT / 2};
let playerSize = {x: 40, y: 40};
let player = new Player(playerPos, 100, playerSize, 1)
player.addWeapon(new AimedWeapon(player, game.inputHandler.cursorWorldPos, 5, 250, 20, 0.2, "#ff9900", 1));
// player.addWeapon(new HomingWeapon(player, 2, 150, 10, 1, 90, "#0044ff", 1));
// player.addWeapon(new AuraWeapon(player, 2, 100, 0.1, "#00ccff99"));
// player.addWeapon(new ExplosiveWeapon(player, 10, 150, 30, 1, 100));

game.setCanvasSize(CANVAS_WIDTH, CANVAS_HEIGHT);
game.setPlayer(player);
game.addSpawner();

const wallObject = new GameObject({x: playerPos.x + 500, y: playerPos.y + 500}, {x: 300, y: 300}, true, "Wall");
wallObject.rigidObject = true;
wallObject.draw = ((ctx, camera) => {    
    drawRectangle(ctx, camera.getPosition(), wallObject.getCenteredPos(), wallObject.getSize().x, wallObject.getSize().y, "#838383")
    if(wallObject.drawHitBoxes) 
        drawRectangle(ctx, camera.getPosition(), wallObject.getCenteredPos(), wallObject.size.x, wallObject.size.y, "#00000000", {x: 0, y: 0}, true, "black", 1);
});



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
