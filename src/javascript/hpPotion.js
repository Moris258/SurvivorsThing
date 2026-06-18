import AttractableObject from "./attractableObject.js";
import { Player } from "./character.js";
import { drawImage } from "./utility.js";

export default class HPPotion extends AttractableObject{
    constructor(pos, size, value = 20) {
        super(pos, size);
        this.value  = value;
        this.tag == "HPPotion";
        this.attractionMultiplier = 2;
    }

    draw(ctx, camera){
        drawImage(ctx, camera.getPosition(), this.pos, this.size.x, this.size.y, './assets/images/hp_potion.png');
    }

    onCollision(other){
        if(other.tag != "Player" || !(other instanceof Player)) return;
    
        other.healHP(this.value);
        this.remove();
    }

}