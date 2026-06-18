import AttractableObject from "./attractableObject.js";
import { Player } from "./character.js";
import { drawCircle, lightenColor, randomColorHex } from "./utility.js";

export default class ExpOrb extends AttractableObject{
    /**
     *
     */
    constructor(pos, size, value = 5) {
        super(pos, size);
        this.value  = value;
        this.color = randomColorHex();
        this.tag == "XP";
    }

    draw(ctx, camera){
        drawCircle(ctx, camera.getPosition(), this.getPosition(), this.size.x/2, this.color, true, "#000000", 1);
        drawCircle(ctx, camera.getPosition(), this.getPosition(), this.size.x/4, lightenColor(this.color, 50));
    }

    onCollision(other){
        if(other.tag != "Player" || !(other instanceof Player)) return;
    
        other.addExp(this.value);
        this.remove();
    }

}