import { drawRectangle, drawText } from "../utility.js";
import UIObject from "./UIObject.js";

export default class GameTimer extends UIObject{
    constructor(pos, size) {
        super(pos, size);
        this.secondsElapsed = 0;
    }

    update(deltaT){
        this.secondsElapsed += deltaT;
    }

    getTime(){
        return this.secondsElapsed;
    }

    getFormattedTime(){
        const minutes = Math.floor(this.secondsElapsed/60);
        const seconds = Math.floor(this.secondsElapsed - minutes * 60);        

        return `${minutes.toString(10).padStart(2, "0")}:${seconds.toString(10).padStart(2, "0")}`;
    }

    draw(ctx, camera){
        let pos = this.getCenteredPos();
        const time = this.getFormattedTime();
        const size = 30;
        
        ctx.font = size + "px serif";
        ctx.fontSize = size;
        const width = ctx.measureText(time).width;        
        drawRectangle(ctx, {x: 0, y: 0}, {x: pos.x - width/2, y: pos.y}, this.size.x + width, this.size.y, "#00000099", {x: 0, y: 0}, true);
        drawText(ctx, {x: 0, y: 0}, {x: this.pos.x, y: this.pos.y + size/4}, time, "white", size);
    }
}