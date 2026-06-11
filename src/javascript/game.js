import Camera from "./camera.js";
import InputHandler from "./inputHandler.js";
import { Player, Enemy } from "./character.js";
import { drawRectangle, drawText } from "./utility.js";

import Background from "./background.js";

export default class Game{
    constructor(GAME_WIDTH = 800, GAME_HEIGHT = 600, CANVAS_WIDTH = 800, CANVAS_HEIGHT = 800) {
        this.GAME_WIDTH = GAME_WIDTH;
        this.GAME_HEIGHT = GAME_HEIGHT;
        this.CANVAS_WIDTH = CANVAS_WIDTH;
        this.CANVAS_HEIGHT = CANVAS_HEIGHT;
        this.gameObjects = [];
        this.camera = new Camera();
        this.inputHandler = new InputHandler(this.camera);
        this.paused = false;
        this.player = null;
        this.background = new Background(this.GAME_WIDTH, this.GAME_HEIGHT);
    }

    setPlayer(player){
        this.player = player;
        this.camera.setPositionAsObject(this.player.pos);
        this.camera.setOffset({x: -this.CANVAS_WIDTH/2, y: -this.CANVAS_HEIGHT/2});
    }

    spawnEnemy(){
        new Enemy({x: game.GAME_WIDTH / 2 - 100, y: game.GAME_HEIGHT / 2 - 100}, 10, {x: 20, y: 20}, 5);        
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
                console.log("User pressed key: " + keyCode);
                break;
        }
    }

    handleMouseClickInput(cursor){
    }

    handleWheelInput(scroll){
    }

    handleMouseMoveInput(cursor){
    }

    addGameObject(object){
        this.gameObjects.push(object);
    }

    removeGameObject(object){
        this.gameObjects.splice(this.gameObjects.indexOf(object), 1);
    }

    update(deltaT){
        if(this.paused) return;

        this.gameObjects.forEach(object => {
            object.update(deltaT);
        });
    }

    draw(ctx, camera){
        if(this.background){
            this.background.draw(ctx, camera);
        }

        this.gameObjects.forEach(object => {
            object.draw(ctx, camera);
        });

        if(this.paused){
            const pausedText = "Game Paused";
            const size = 26;
            ctx.font = size + "px serif";
            ctx.fontSize = size;
            const rectWidth = ctx.measureText(pausedText).width;
            
            drawRectangle(ctx, {x: 0, y: 0}, {x: this.GAME_WIDTH/2 - rectWidth/2, y: this.GAME_HEIGHT/2 - size/2}, rectWidth, size, "white", {x: 10, y: 10}, true, "black", 2);
            drawText(ctx, {x: 0, y: 0}, {x: this.GAME_WIDTH/2, y: this.GAME_HEIGHT/2 + size/4}, pausedText, "black", size);
        }
    }
}

export const game = new Game();