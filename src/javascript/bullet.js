import Character from "./character.js";
import MoveableObject from "./moveableObject.js";
import { drawCircle, moveTowards } from "./utility.js";

export default class Bullet extends MoveableObject{
    constructor(pos, size, speed, dir, damage = 10, lifespan = 10, color = "yellow", target = null, homing = false) {
        super(pos, size, true, speed, dir);
        this.target = target;
        this.damage = damage;
        this.homing = homing;
        this.lifespan = lifespan;
        this.color = color;
    }

    update(deltaT){
        super.update(deltaT);
        if(this.homing && this.target != null){
            this.setMoveDirection(moveTowards(this.target, this.pos));
        }
        this.lifespan -= deltaT;
        if(this.lifespan <= 0)
            this.remove();
    }

    draw(ctx, camera){
        drawCircle(ctx, camera.getPosition(), this.pos, this.size.x/2, this.color);
    }

    setTarget(target){
        this.target.x = target.x;
        this.target.y = target.y;
    }

    onCollision(other){        
        if(other instanceof Character){
            if(other.tag != this.tag){
                other.takeDamage(this.damage);
                this.remove();
            }
        }
    }
}