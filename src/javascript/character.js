import Event from "./event.js";
import { game } from "./game.js";
import GameObject from "./gameObject.js";
import MoveableObject from "./moveableObject.js";
import { drawCircle, drawRectangle } from "./utility.js";

export default class Character extends MoveableObject{
    constructor(pos, HP, size) {
        super(pos, size, true);
        this.MAX_HP = HP;
        this.HP = HP;
    }

    takeDamage(damage){
        this.HP -= damage;
        if(this.HP <= 0)
            this.died();
    }

    update(deltaT){
        super.update(deltaT);
    }

    draw(ctx, camera){
        super.draw(ctx, camera);
        this.drawHPBar(ctx, camera);
    }

    died(){
        this.remove()
    }

    onCollision(other){
        console.log(other);
    }

    drawHPBar(ctx, camera){
        let hpBarMargin = 0;
        let hpBarMarginBottom = 6;
        let pos = this.getCenteredPos();
        let hpBarWidth = this.size.x - hpBarMargin * 2;
        let hpBarHeight = 6;
        let hpBarPos = {x: pos.x + hpBarMargin, y: pos.y - hpBarHeight - hpBarMarginBottom};
        drawRectangle(ctx, camera.getPosition(), hpBarPos, hpBarWidth, hpBarHeight, "red", {x: 0, y:0}, true, "black");
        let hpBarHealthWidth = hpBarWidth * (this.HP/this.MAX_HP);
        drawRectangle(ctx, camera.getPosition(), hpBarPos, hpBarHealthWidth, hpBarHeight, "green");
    }
}

export class Player extends Character{
    constructor(pos, HP, size, level) {
        super(pos, HP, size);
        this.speed = 200;
        this.level = level;
        this.XP = 0;
        this.defense = 0;
        this.weapons = [];
        this.upgrades = [];

        this.controls = ["KeyW", "KeyA", "KeyS", "KeyD"];
        this.controlMovement = {
            KeyW: {x: 0, y: -1},
            KeyA: {x: -1, y: 0},
            KeyS: {x: 0, y: 1},
            KeyD: {x: 1, y: 0},
        }

        this.MAX_WEAPONS = 6;
        this.MAX_UPGRADES = 6;

        this.onLevelUp = new Event();
        this.onLevelUp.addEvent(this.onLevelUpHandler);
    }

    onLevelUpHandler(args){
        this.XP = 0;
        this.level += 1;
        //TODO: display upgrade options
    }

    takeDamage(damage){
        super.takeDamage(Math.max(0, damage - this.defense));
    }

    died(){
        //Show game over screen
        super.died();
    }

    getMovementInputs(inputs){
        let dir = {x: 0, y: 0};
        
        this.controls.forEach(control => {
            if(inputs[control]){
                dir.x += this.controlMovement[control].x;
                dir.y += this.controlMovement[control].y;
            }
        });
        return dir;
    }

    update(deltaT){
        super.update(deltaT);
        let inputs = game.inputHandler.keysPressed;
        this.setMoveDirection(this.getMovementInputs(inputs));
        
    }

    draw(ctx, camera){
        super.draw(ctx, camera);

        drawRectangle(ctx, camera.getPosition(), this.getCenteredPos(), this.size.x, this.size.y, "#00000000", {x: 0, y: 0}, true, "black", 1)
        drawCircle(ctx, camera.getPosition(), this.pos, this.size.x/2, "red", true, "black", 1);
    }
}


export class Enemy extends Character{
    constructor(pos, HP, size, damage) {        
        super(pos, HP, size);
        this.damage = damage;
    }

    died(){
        //TODO: spawn XP orbs
        super.died();
    }

    update(deltaT){
        super.update(deltaT);
    }

    draw(ctx, camera){    
        super.draw(ctx, camera);

        drawRectangle(ctx, camera.getPosition(), this.getCenteredPos(), this.size.x, this.size.y, "black");
    }
}