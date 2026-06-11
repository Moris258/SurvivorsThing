import MoveableObject from "./moveableObject.js";
import { moveTowards } from "./utility.js";

export default class Bullet extends MoveableObject{
    constructor(pos, size, speed, dir, target = null, homing = false) {
        super(pos, size, speed, dir);
        this.target = target;
        this.homing = homing;
    }

    update(deltaT){
        super.update(deltaT);
        if(this.homing && this.target != null){
            this.setMoveDirection(moveTowards(this.target, this.pos));
        }
    }
}