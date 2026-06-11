import Camera from "./camera.js";
import InputHandler from "./inputHandler.js";
import { Player, Enemy, Bruiser, Tank, Fighter, Mage, Dog } from "./character.js";
import { drawRectangle, drawText } from "./utility.js";

import Background from "./background.js";
import EnemySpawner from "./enemySpawner.js";

export default class Game{
    constructor(GAME_WIDTH = 800, GAME_HEIGHT = 600, CANVAS_WIDTH = 800, CANVAS_HEIGHT = 800) {
        this.GAME_WIDTH = GAME_WIDTH;
        this.GAME_HEIGHT = GAME_HEIGHT;
        this.CANVAS_WIDTH = CANVAS_WIDTH;
        this.CANVAS_HEIGHT = CANVAS_HEIGHT;
        this.gameObjects = [];
        this.camera = new Camera();
        this.inputHandler = null;
        this.paused = false;
        this.gameEnd = false;
        this.player = null;
        this.background = new Background(this.GAME_WIDTH, this.GAME_HEIGHT);
    }

    setPlayer(player){
        this.player = player;
        this.camera.setPositionAsObject(this.player.pos);
        this.camera.setOffset({x: -this.CANVAS_WIDTH/2, y: -this.CANVAS_HEIGHT/2});
    }

    addSpawner(){
        new EnemySpawner({x: game.GAME_WIDTH / 2 + 100, y: game.GAME_HEIGHT / 2 + 100}, 1)
    }

    endGame(){
        this.gameEnd = true;
    }

    setGameSize(GAME_WIDTH = 800, GAME_HEIGHT = 600){
        this.GAME_WIDTH = GAME_WIDTH;
        this.GAME_HEIGHT = GAME_HEIGHT;
        if(this.background){
            this.background.setSize(GAME_WIDTH, GAME_HEIGHT);
        }
    }

    setCanvasSize(CANVAS_WIDTH, CANVAS_HEIGHT){
        this.CANVAS_WIDTH = CANVAS_WIDTH;
        this.CANVAS_HEIGHT = CANVAS_HEIGHT;
    }

    setCamera(camera){
        this.camera = camera;
        this.inputHandler.camera = camera;
    }

    setInputHandler(handler){
        this.inputHandler = handler;
    }

    handleKeyInput(keyCode){
        switch(keyCode){
            case "Backquote":
                this.paused = !this.paused;
                break;
            default:
                break;
        }
    }

    handleMouseClickInput(cursor){
    }

    handleWheelInput(scroll){
    }

    handleMouseMoveInput(args){
    }

    addGameObject(object){
        this.gameObjects.push(object);
    }

    removeGameObject(object){
        if(!this.gameObjects.includes(object)) return;
        this.gameObjects.splice(this.gameObjects.indexOf(object), 1);
    }

    isPaused(){
        return this.paused || this.gameEnd;
    }

    update(deltaT){
        if(this.isPaused()) return;

        this.gameObjects.slice().forEach(gameObject => {
            gameObject.update(deltaT);
        });
    }

    drawPauseBox(ctx, camera){
        const pausedText = "Game Paused";
        const size = 26;
        ctx.font = size + "px serif";
        ctx.fontSize = size;
        const rectWidth = ctx.measureText(pausedText).width;            
        
        drawRectangle(ctx, {x: 0, y: 0}, {x: this.CANVAS_WIDTH/2 - rectWidth/2, y: this.CANVAS_HEIGHT/2 - size/2}, rectWidth, size, "#ffffff99", {x: 10, y: 10}, true, "black", 2);
        drawText(ctx, {x: 0, y: 0}, {x: this.CANVAS_WIDTH/2, y: this.CANVAS_HEIGHT/2 + size/4}, pausedText, "black", size);
    }

    drawGameEndBox(ctx, camera){
        const pausedText = "Game Over";
        const size = 26;
        ctx.font = size + "px serif";
        ctx.fontSize = size;
        const rectWidth = ctx.measureText(pausedText).width;            
        
        drawRectangle(ctx, {x: 0, y: 0}, {x: this.CANVAS_WIDTH/2 - rectWidth/2, y: this.CANVAS_HEIGHT/2 - size/2}, rectWidth, size, "#bb0000ff", {x: 10, y: 10}, true, "black", 2);
        drawText(ctx, {x: 0, y: 0}, {x: this.CANVAS_WIDTH/2, y: this.CANVAS_HEIGHT/2 + size/4}, pausedText, "black", size);
    }

    draw(ctx, camera){
        if(this.background){
            this.background.draw(ctx, camera);
        }

        this.gameObjects.forEach(object => {
            object.draw(ctx, camera);
        });

        if(this.paused) this.drawPauseBox(ctx, camera);
        if(this.gameEnd) this.drawGameEndBox(ctx, camera);
    }
}

export const game = new Game();