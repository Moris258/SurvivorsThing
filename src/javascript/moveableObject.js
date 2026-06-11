import GameObject from "./gameObject.js";
import { normalizeVector } from "./utility.js";

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
    }

    setMoveDirection(dir){
        dir = normalizeVector(dir);
        if(isNaN(dir.x) || isNaN(dir.y)) {
            console.error("Tried to set move direction of GameObject with invalid values.");       
            return;
        }
        
        this.moveDirection.x = dir.x;
        this.moveDirection.y = dir.y;
    }

    setMoveable(moveable){
        this.moveable = moveable;
    }
    
    update(deltaT){
        super.update(deltaT);
        
        this.move({x: this.moveDirection.x * this.speed * deltaT, y: this.moveDirection.y * this.speed * deltaT});
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
}