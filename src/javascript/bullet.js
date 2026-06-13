import Character from "./character.js";
import { game } from "./game.js";
import GameObject from "./gameObject.js";
import MoveableObject from "./moveableObject.js";
import { calculateRotationDegrees, checkCircleRectangleOverlap, drawCircle, moveTowards, pointsDistance, rotateVector } from "./utility.js";

export default class Bullet extends MoveableObject{
    constructor(pos, size, speed, dir, damage = 10, lifespan = 10, color = "yellow", pierce = 1) {
        super(pos, size, true, speed, dir);
        this.damage = damage;
        this.lifespan = lifespan;
        this.color = color;
        this.pierce = pierce;
    }

    update(deltaT){
        super.update(deltaT);
        this.lifespan -= deltaT;
        if(this.lifespan <= 0)
            this.remove();
    }

    draw(ctx, camera){
        drawCircle(ctx, camera.getPosition(), this.pos, this.size.x/2, this.color, true);
    }


    onCollision(other){        
        super.onCollision(other);
        if(this.pierce <= 0) return;
        if ((other instanceof Character && other.tag != this.tag)) {            
            this.pierce -= 1;
            other.takeDamage(this.damage);
            if(this.pierce <= 0)
                this.remove();
        }
        else if(other.isRigid()){
            this.remove();
        }
    }
}

export class HomingBullet extends Bullet {
    constructor(pos, size, speed, dir, damage = 10, rotationSpeed = 20, lifespan = 10, color = "yellow", pierce = 1, target = null) {
        super(pos, size, speed, dir, damage, lifespan, color, pierce);
        this.rotationSpeed = rotationSpeed;   
        this.target = null;
        this.setTarget(target);
    }
    
    setTarget(target){
        this.target = target;
    }

    update(deltaT){
        super.update(deltaT);
        if(this.target == null)
            this.target = GameObject.findClosestTarget(this);
        this.homeOn(deltaT);        
    }

    draw(ctx, camera){
        super.draw(ctx, camera);
    }

    homeOn(deltaT){        
        if(this.target == null) return;
        if(!game.gameObjects.includes(this.target)){
            this.target = null;
            return;
        }
        
        const tolerance = 0.5;
        const rotateTarget = calculateRotationDegrees(moveTowards(this.target.pos, this.pos), this.moveDirection);
        if(Math.abs(rotateTarget) <= tolerance) return;

        const rotateDir = rotateTarget < 0 ? -1 : 1

        let rotateDegrees = (deltaT / 1) * this.rotationSpeed * rotateDir;
        if(Math.abs(rotateDegrees) > Math.abs(rotateTarget))
            rotateDegrees = rotateTarget;        

        this.setMoveDirection(rotateVector(this.moveDirection, rotateDegrees));
    }
}

/**
 * ExplosiveBullet is a bullet that explodes on enemy impact, dealing AoE damage.
 */
export class ExplosiveBullet extends Bullet {
    /**
     * @param {Object} pos - Starting position.
     * @param {Object} size - Bullet size.
     * @param {number} speed - Bullet speed.
     * @param {Object} dir - Direction of travel.
     * @param {number} damage - Base damage on direct hit.
     * @param {number} explosionRadius - Radius of explosion effect.
     * @param {number} lifespan - How long the bullet lasts.
     * @param {string} color - Bullet color.
     * @param {number} ownerTag - Tag of the weapon owner.
     */
    constructor(pos, size, speed, dir, damage = 10, explosionRadius = 80, lifespan = 10, color = "#ff0000", ownerTag = "") {
        super(pos, size, speed, dir, damage, lifespan, color);
        this.explosionRadius = explosionRadius;
        this.tag = ownerTag;
        this.pierce = 1;
    }

    drawExplosion(){
        let explosionEffect = new GameObject(this.pos, {x: this.explosionRadius, y: this.explosionRadius}, false, "");
        explosionEffect.lifespan = 1;
        explosionEffect.maxLifespan = 1;
        explosionEffect.draw = (ctx, camera) => {
            let color = this.color + Math.floor((explosionEffect.lifespan/explosionEffect.maxLifespan) * 255).toString(16).padStart(2, "0");
            
            drawCircle(ctx, camera.getPosition(), explosionEffect.getPosition(), explosionEffect.size.x/2, color);
        }
        explosionEffect.update = (deltaT) => {
            explosionEffect.lifespan -= deltaT;
            if(explosionEffect.lifespan <= 0) explosionEffect.remove();
        }
    }

    remove(){
        this.explode();
        this.drawExplosion();
        super.remove();
    }

    /**
     * Create an explosion effect and damage all nearby enemies.
     */
    explode() {
        const nearbyEnemies = game.gameObjects.filter(value => {
            return value instanceof Character && value.tag != this.tag;
        });

        nearbyEnemies.forEach(enemy => {
            const distance = pointsDistance(this.pos, enemy.getPosition());
            if (checkCircleRectangleOverlap(this.pos, this.explosionRadius, enemy.pos, enemy.size)) {
                // Apply reduced damage based on distance from explosion center
                const damageMultiplier = 1 - (distance / this.explosionRadius) * 0.5; // 50% damage reduction at max range
                const finalDamage = this.damage * damageMultiplier;
                enemy.takeDamage(finalDamage);
            }
        });
    }
}
