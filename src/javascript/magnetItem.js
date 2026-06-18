import AttractableObject from "./attractableObject.js";
import StatBuff from "./buffs/statBuff.js";
import { Player } from "./character.js";
import { drawImage } from "./utility.js";

export default class MagnetItem extends AttractableObject{
    constructor(pos, size, duration, attractionRadius) {
        super(pos, size);
        console.log(this.getPosition());
        
        this.duration = duration;
        this.attractionRadius = attractionRadius;
    }

    draw(ctx, camera){
        drawImage(ctx, camera.getPosition(), this.pos, this.size.x, this.size.y, './assets/images/magnet_icon.png');
    }

    onCollision(other){
        if(other.tag != "Player" || !(other instanceof Player)) return;

        other.addBuff(new StatBuff(other, "AttractionRange", this.attractionRadius, this.duration));
        this.remove();
    }

}