import { Player } from "./character.js";
import { game } from "./game.js";
import MoveableObject from "./moveableObject.js";
import { drawCircle, lightenColor, moveTowards, pointsDistance, randomColorHex } from "./utility.js";

export default class ExpOrb extends MoveableObject{
    /**
     *
     */
    constructor(pos, size, value = 5) {
        super(pos, size, true, 0);
        this.value  = value;
        this.color = randomColorHex();
        this.maxSpeed = 500;
        this.tag == "XP";
        
    }

    update(deltaT){
        super.update(deltaT);
        const player = game.player;
        let distanceToPlayer = pointsDistance(player.getPosition(), this.getPosition());
        let XPAttractionRange = player.stats.getStatValue("XPAttractionRange");
        

        if(distanceToPlayer < XPAttractionRange){
            this.speed = (1 - distanceToPlayer/XPAttractionRange) * this.maxSpeed;
            
            this.setMoveDirection(moveTowards(player.getPosition(), this.getPosition()));
        }
        else{
            this.speed = 0;
        }
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