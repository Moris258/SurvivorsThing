import Character from "./character.js";
import { game } from "./game.js";
import GameObject from "./gameObject.js";
import MoveableObject from "./moveableObject.js";
import { calculateRotationDegrees, checkCircleRectangleOverlap, drawCircle, drawRectangle, moveTowards, pointsDistance, rotateVector } from "./utility.js";

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


    onCollisionEnter(other){        
        if(this.pierce <= 0) return;
        if ((other instanceof Character && other.tag != this.tag)) {            
            this.pierce -= 1;
            other.takeDamage(this.damage);
            if(Math.floor(this.pierce) <= 0)
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

/**
 * LightningBolt is a projectile that travels to a target location and strikes with AoE damage after a delay.
 */
export class LightningBolt extends GameObject {
    /**
     * @param {number} startX - Starting X position.
     * @param {number} startY - Starting Y position.
     * @param {number} damage - Damage dealt in the strike area.
     * @param {number} strikeRadius - Radius of the strike damage area.
     * @param {string} ownerTag - Tag of the weapon owner.
     * @param {number} delayTime - Time before striking (in seconds).
     * @param {string} color - Color of the lightning effect.
     */
    constructor(pos, damage = 20, strikeRadius = 80, ownerTag = "", delayTime = 0.5, color = "#ffff00") {
        super(pos, {x: strikeRadius*2, y: strikeRadius*2}, false, ownerTag);
        this.damage = damage;
        this.strikeRadius = strikeRadius;
        this.delayTime = delayTime;
        this.color = color;
    }

    update(deltaT) {
        this.delayTime -= deltaT;

        if(this.delayTime <= 0){
            this.remove();
        }
    }

    drawStrike(){
        let lightningEffect = new GameObject(this.pos, {x: this.strikeRadius*2, y: this.strikeRadius*2}, false, "");
        lightningEffect.lifespan = 1;
        lightningEffect.maxLifespan = 1;
        lightningEffect.draw = (ctx, camera) => {
            const color = this.color + Math.floor((lightningEffect.lifespan/lightningEffect.maxLifespan) * 255).toString(16).padStart(2, "0");

            drawCircle(ctx, camera.getPosition(), lightningEffect.getPosition(), lightningEffect.size.x/2, color);
        }
        lightningEffect.update = (deltaT) => {
            lightningEffect.lifespan -= deltaT;
            if(lightningEffect.lifespan <= 0) lightningEffect.remove();
        }
    }

    remove(){
        this.strike();
        this.drawStrike();
        super.remove();
    }

    /**
     * Create a lightning strike effect and damage all nearby enemies.
     */
    strike() {
        const nearbyEnemies = game.gameObjects.filter(value => {
            return value instanceof Character && value.tag != this.tag;
        });

        nearbyEnemies.forEach(enemy => {
            const distance = pointsDistance(this.pos, enemy.getPosition());
            if (checkCircleRectangleOverlap(this.pos, this.strikeRadius, enemy.pos, enemy.size)) {
                // Apply reduced damage based on distance from strike center
                const damageMultiplier = 1 - (distance / this.strikeRadius) * 0.3; // 30% damage reduction at max range
                const finalDamage = this.damage * damageMultiplier;
                enemy.takeDamage(finalDamage);
            }
        });
    }

    draw(ctx, camera) {
        const screenPos = camera.getPosition();
        
        drawCircle(ctx, screenPos, this.pos, this.size.x/2, "#00000000", true, this.color, 5);
    }
}
