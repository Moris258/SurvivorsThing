import { game } from "./game.js";
import { checkOverlap } from "./utility.js";


export default class GameObject{
    /**
     * Base class for all objects in the game that should be regularly updated and drawn.
     * @param {{x: number, y: number}} pos - position of the GameObject.
     * @param {{x: number, y: number}} size - size of the GameObject.
     * @param {boolean} checkCollisions - whether collisions will be checked for this GameObject against
     * other GameObjects.
     * @param {string} tag - the GameObject's tag.
     */
    constructor(pos, size = {x: 0, y: 0}, checkCollisions = false, tag = "") {
        this.pos = {x: pos.x, y: pos.y};
        this.size = {x: size.x, y: size.y};
        this.tag = tag;
        this.checkCollisions = checkCollisions;
        this.childObjects = [];
        game.addGameObject(this);
    }

    update(deltaT){
        if(this.checkCollisions){
            game.gameObjects.slice().forEach(gameObject => {
                if(gameObject === this) return;
                if(!gameObject.checkCollisions) return;

                let thisPos = this.getCenteredPos();
                let otherPos = gameObject.getCenteredPos();
                if(checkOverlap(thisPos, this.size, otherPos, gameObject.size)){
                    this.onCollision(gameObject);            
                }
            }, this);
        }
    }

    getCenteredPos(){
        return {x: this.pos.x - this.size.x/2, y: this.pos.y - this.size.y/2};
    }

    getPosition(){
        return this.pos;
    }

    addChildObject(object){
        if(!(object instanceof GameObject)) return;
        this.childObjects.push(object);
    }

    removeChildObject(object){
        if(!this.childObjects.includes(object)) return;
        this.childObjects.splice(this.childObjects.indexOf(object), 1);
    }

    draw(ctx, camera){

    }

    onCollision(other){

    }

    remove(){
        this.childObjects.forEach(object => {
            game.removeGameObject(object);
        });
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