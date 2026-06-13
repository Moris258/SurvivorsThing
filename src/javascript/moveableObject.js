import { game } from "./game.js";
import GameObject from "./gameObject.js";
import { checkOverlap, normalizeVector } from "./utility.js";

export default class MoveableObject extends GameObject{
    /**
     * Parent class for all moveable objects. Contains methods for moving GameObjects every frame.
     * @param {{x: number, y: number}} pos - position of the GameObject.
     * @param {{x: number, y: number}} size - size of the GameObject.
     * @param {boolean} checkCollision - whether collisions will be checked for this GameObject against other GameObjects.
     * @param {number}[speed=100] - speed of the moveable object.
     * @param {{x: number, y: number}} [dir={x: 0, y: 0}] - direction the object should move in.
     */
    constructor(pos, size, checkCollision, speed = 100, dir = {x: 0, y: 0}) {
        super(pos, size, checkCollision);
        this.speed = speed;
        this.moveDirection = {x: 0, y: 0};
        this.setMoveDirection(dir);
            
        this.moveable = true;
        this.prevPos = {x: pos.x, y: pos.y};
    }

    setMoveDirection(dir){
        if(isNaN(dir.x) || isNaN(dir.y)) {
            console.error("Tried to set move direction of GameObject with invalid values.");       
            return;
        }
        dir = normalizeVector(dir);
        
        this.moveDirection.x = dir.x;
        this.moveDirection.y = dir.y;
    }

    setMoveable(moveable){
        this.moveable = moveable;
    }
    
    update(deltaT){
        //if(this.canMove(deltaT))
        this.prevPos = {x: this.pos.x, y: this.pos.y};
        this.move(this.getMovementVector(deltaT));
        super.update(deltaT);
    }

    getMovementVector(deltaT){
        return {x: this.moveDirection.x * this.speed * deltaT, y: this.moveDirection.y * this.speed * deltaT};
    }

    canMove(deltaT){
        let rigidObjects = game.gameObjects.filter(object => object.rigidObject);
        const nextMoveVector = this.getMovementVector(deltaT);
        const nextPos = {x: this.pos.x + nextMoveVector.x, y: this.pos.y + nextMoveVector.y};

        for(let i = 0; i < rigidObjects.length; i++){
            const obstacle = rigidObjects[i];

            if(checkOverlap(nextPos, this.size, obstacle.getCenteredPos(), obstacle.getSize())){
                
                return false;
            }
        }
        
        return true;
    }

    move(movement){
        if(!this.moveable) return;
        if(isNaN(movement.x) || isNaN(movement.y)) {
            console.error("Tried to move GameObject with invalid values.");
                  
            return;
        }

        this.pos.x += movement.x;
        this.pos.y += movement.y;
    }

    onCollision(other){
        super.onCollision(other);
        if(other.isRigid()){
            this.pos.x = this.prevPos.x;
            this.pos.y = this.prevPos.y;
        }
    }
}