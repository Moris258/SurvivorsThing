import { game } from "./game.js";
import MoveableObject from "./moveableObject.js";
import { moveTowards, pointsDistance } from "./utility.js";

export default class AttractableObject extends MoveableObject{
    /**
     *
     */
    constructor(pos, size) {
        super(pos, size, true, 0);
        this.maxSpeed = 500;
        this.attractionMultiplier = 1;
    }

    update(deltaT){
        super.update(deltaT);
        const player = game.player;
        let distanceToPlayer = pointsDistance(player.getPosition(), this.getPosition()) / this.attractionMultiplier;
        let attractionRange = player.stats.getStatValue("AttractionRange");
        

        if(distanceToPlayer < attractionRange){
            this.speed = (1 - distanceToPlayer/attractionRange) * this.maxSpeed;
            
            this.setMoveDirection(moveTowards(player.getPosition(), this.getPosition()));
        }
        else{
            this.speed = 0;
        }
    }
}