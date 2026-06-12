import Character from "./character.js";
import { game } from "./game.js";
import GameObject from "./gameObject.js";
import MoveableObject from "./moveableObject.js";
import { drawCircle, moveTowards, pointsDistance } from "./utility.js";

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

    /**
     * On collision, trigger an explosion that damages nearby enemies.
     */
    onCollision(other) {
        if (other instanceof Character && other.tag != this.tag) {
            // Damage the hit target
            other.takeDamage(this.damage);
            
            // Trigger explosion and damage nearby enemies
            this.remove();
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
            if (distance <= this.explosionRadius) {
                // Apply reduced damage based on distance from explosion center
                const damageMultiplier = 1 - (distance / this.explosionRadius) * 0.5; // 50% damage reduction at max range
                const finalDamage = this.damage * damageMultiplier;
                enemy.takeDamage(finalDamage);
            }
        });
    }
}
