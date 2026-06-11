import { game } from "./game.js";
import { checkOverlap } from "./utility.js";


export default class GameObject{
    constructor(pos, size = {x: 0, y: 0}, checkCollisions = false) {
        this.pos = {x: pos.x, y: pos.y};
        this.size = {x: size.x, y: size.y};
        this.checkCollisions = checkCollisions;
        game.addGameObject(this);
    }

    update(deltaT){
        if(this.checkCollisions){
            game.gameObjects.forEach(gameObject => {
                if(gameObject === this) return;
                if(!gameObject.checkCollisions) return;

                let thisPos = this.getCenteredPos();
                let otherPos = gameObject.getCenteredPos();
                if(checkOverlap(thisPos, this.size, otherPos, gameObject.size)){
                    this.onCollision(gameObject);
                }
            });
        }
    }

    getCenteredPos(){
        return {x: this.pos.x - this.size.x/2, y: this.pos.y - this.size.y/2};
    }

    draw(ctx, camera){

    }

    onCollision(other){

    }

    remove(){
        game.removeGameObject(this);
    }

    setPosition(newPos){
        if(isNaN(newPos.x) || isNaN(newPos.y)) {
            console.error("Tried to set GameObject position with invalid values.");       
            return;
        }

        this.pos.x = newPos.x;
        this.pos.y = newPos.y;
    }
}