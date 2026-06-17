import Camera from "./camera.js";
import InputHandler from "./inputHandler.js";
import { checkOverlap, drawRectangle, drawText } from "./utility.js";
import EnemySpawner from "./enemySpawner.js";
import GameObject from "./gameObject.js";
import UIObject from "./UIObject.js";
import Character from "./character.js";
import Event from "./event.js";

export default class Game{
    constructor(GAME_WIDTH = 800, GAME_HEIGHT = 600, CANVAS_WIDTH = 800, CANVAS_HEIGHT = 800) {
        this.GAME_WIDTH = GAME_WIDTH;
        this.GAME_HEIGHT = GAME_HEIGHT;
        this.CANVAS_WIDTH = CANVAS_WIDTH;
        this.CANVAS_HEIGHT = CANVAS_HEIGHT;
        this.gameObjects = [];
        this.UIObjects = [];
        this.camera = new Camera();

        //Events
        this.onCharacterDied = new Event();
        this.onCharacterHit = new Event();
        this.onEnemySpawned = new Event();


        this.inputHandler = null;
        this.paused = false;
        this.gameEnd = false;
        this.player = null;
        this.background = null;
    }

    setPlayer(player){
        this.player = player;
        this.camera.setPositionAsObject(this.player.pos);
        this.camera.setOffset({x: -this.CANVAS_WIDTH/2, y: -this.CANVAS_HEIGHT/2});
    }

    setBackground(background){
        this.background = background;
    }

    addSpawner(){
        new EnemySpawner({x: game.GAME_WIDTH / 2 + 100, y: game.GAME_HEIGHT / 2 + 100}, 1);
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

    pauseGame(pause){
        this.paused = pause;
    }

    handleKeyInput(keyCode){
        switch(keyCode){
            case "Backquote":
                this.pauseGame(!this.paused);
                break;
            default:
                break;
        }
    }

    handleMouseClickInput(cursor){
        for (const UIElement of this.UIObjects){
            if(!UIElement instanceof UIObject) continue;
            if(checkOverlap(cursor, {x: 0, y: 0}, UIElement.getCenteredPos(), UIElement.getSize()))
                UIElement.onClick(cursor);
        }
    }

    handleWheelInput(scroll){

    }

    handleMouseMoveInput(args){

    }

    addGameObject(object){
        if(!(object instanceof GameObject)) return;
        if(object.tag === "UI"){
            if(this.UIObjects.includes(object)) return;
            this.UIObjects.push(object);
            return;
        }
        if(this.gameObjects.includes(object)) return;
        this.gameObjects.push(object);
    }

    removeGameObject(object){
        if(object.tag === "UI"){
            if(!this.UIObjects.includes(object)) return;
            this.UIObjects.splice(this.UIObjects.indexOf(object), 1);
            return;
        }

        if(!this.gameObjects.includes(object)) return;

        if(object instanceof Character) this.onCharacterDied.callEvents({target: object});
        this.gameObjects.splice(this.gameObjects.indexOf(object), 1);
    }

    isPaused(){
        return this.paused || this.gameEnd;
    }

    update(deltaT){
        if(this.isPaused()) return;
        if(this.background){
            this.background.update(deltaT);
        }

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
        
        drawRectangle(ctx, {x: 0, y: 0}, {x: this.CANVAS_WIDTH/2 - rectWidth/2, y: size*2}, rectWidth, size, "#ffffff99", {x: 10, y: 10}, true, "black", 2);
        drawText(ctx, {x: 0, y: 0}, {x: this.CANVAS_WIDTH/2, y: size*2.75}, pausedText, "black", size);
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

    drawUI(ctx, camera){
        this.UIObjects.forEach(object => {
            object.draw(ctx, camera);
        });
    }

    draw(ctx, camera){
        if(this.background){
            this.background.draw(ctx, camera);
        }

        this.gameObjects.forEach(object => {
            object.draw(ctx, camera);
        });

        if(this.background)
            this.background.drawWeatherEffects(ctx, camera);

        this.drawUI(ctx, camera);

        if(this.paused) this.drawPauseBox(ctx, camera);
        if(this.gameEnd) this.drawGameEndBox(ctx, camera);
    }
}

export const game = new Game();