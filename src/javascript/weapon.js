import Bullet from './bullet.js'; // Assuming Bullet class is exported here
import Character, { Enemy } from './character.js';
import { game } from './game.js';
import GameObject from './gameObject.js';
import { drawCircle, moveTowards, pointsDistance, randomFloat } from './utility.js';

export default class Weapon extends GameObject{    
    /**
     * @param {Character} owner - The object that owns the weapon (must have position and direction).
     * @param {number} initialDamage - Initial damage value.
     * @param {number} initialSpeed - Initial bullet speed.
     * @param {number} initialSize - Visual size of the weapon model/attachment point.
     * @param {number} fireRate - Time interval (in seconds) between shots.
     */
    constructor(owner, initialDamage = 10, initialSpeed = 15, initialSize = 2, fireRate = 0.2) {
        super({x: 0, y: 0}, {x: 0, y: 0}, false, owner.tag);
        this.owner = owner;

        this.damage = initialDamage;
        this.speed = initialSpeed;
        this.size = initialSize;
        this.spread = 0.15;
        this.level = 1;

        // Firing state variables
        this.fireRate = fireRate;
        this.lastFireTime = 0;
    }

    /**
     * Updates the weapon's state, handling firing logic.
     * @param {number} deltaT - Time elapsed since the last frame (in seconds).
     */
    update(deltaT) {
        const currentTime = Date.now() / 1000; // Get current time in seconds

        // Check if enough time has passed since the last shot
        if (currentTime - this.lastFireTime >= this.fireRate) {
            this.shoot();
            this.lastFireTime = currentTime;
        }
    }

    shoot() {    

    }

    upgrade(upgradeLevel = 1) {
        this.level += upgradeLevel;
        this.damage *= (1 + 0.2 * upgradeLevel); // Increase damage by 20% per level
        this.speed *= (1 + 0.1 * upgradeLevel);  // Increase speed by 10% per level
        this.fireRate = Math.max(0.05, this.fireRate * (1 - 0.08 * upgradeLevel)); // Reduce fire rate, minimum 0.05s
        console.log(`Weapon upgraded to Level ${upgradeLevel}. Damage: ${this.damage.toFixed(2)}, Speed: ${this.speed.toFixed(2)}, Fire Rate: ${this.fireRate.toFixed(2)}`);
    }
}


export class AimedWeapon extends Weapon{
    /**
     * @param {Character} owner - The object that owns the weapon (must have position and direction).
     * @param {{x: number, y: number}} target - The target the weapon is aiming at.
     * @param {number} initialDamage - Initial damage value.
     * @param {number} initialSpeed - Initial bullet speed.
     * @param {number} initialSize - Visual size of the weapon model/attachment point.
     * @param {number} fireRate - Time interval (in seconds) between shots.
     */
    constructor(owner, target, initialDamage = 10, initialSpeed = 15, initialSize = 2, fireRate = 0.2, bulletColor = "yellow") {
        super(owner, initialDamage, initialSpeed, initialSize, fireRate);
        this.target = target;
        
        this.spread = 0.15;
        this.bulletColor = bulletColor;
    }

    update(deltaT){
        super.update(deltaT);
    }

    /**
     * Creates and launches a new bullet object from the weapon owner's position.
     */
    shoot() {
        // For simplicity, we use the owner's current position as the bullet origin.
        const origin = this.owner.getPosition();

        // Create the bullet instance
        const bullet = new Bullet(origin, {x: this.size, y: this.size}, this.speed, moveTowards(this.target, origin, this.spread), this.damage, 10, this.bulletColor);
        bullet.tag = this.owner.tag;
    }


    /**
     * Sets the target of this weapon to the target object.
     * @param {{x: number, y: number}} target - position of the target.
     */
    setTarget(target){
        this.target = target;
    }

    /**
     * Upgrades the weapon's stats, increasing damage and slightly reducing fire rate.
     * @param {number} upgradeLevel - The level of upgrade to apply (e.g., 1).
     */
    upgrade(upgradeLevel) {
        super.upgrade(upgradeLevel);
    }
}

/**
 * AuraWeapon deals damage in a continuous area around the owner.
 * It does not fire projectiles but rather applies periodic AoE damage.
 */
export class AuraWeapon extends Weapon {
    /**
     *
     */
    constructor(owner, initialDamage = 10, initialRadius = 60, fireRate = 2, auraColor = "#ffff0099") {
        super(owner, initialDamage, 0, initialRadius, fireRate);
        this.auraColor = auraColor;
    }

    update(deltaT){
        super.update(deltaT);
    }

    draw(ctx, camera){
        const ownerPos = this.owner.getPosition();
        
        // 1. Draw the main aura circle (retaining original functionality)
        drawCircle(ctx, camera.getPosition(), ownerPos, this.size, this.auraColor);

        // 2. Draw spinning stars effect
        const starCount = 30;
        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2 + (Date.now() / 4000)  * Math.PI * 2; // Distribute points evenly around a circle
            const radiusOffset = this.size * 0.8; // Stars are slightly inside the main aura radius
            
            
            // Calculate position for the star, adding a slight rotation component over time for dynamism
            const x = ownerPos.x + Math.cos(angle) * radiusOffset * (1 + Math.sin((Date.now() / 500)) * 0.2);
            const y = ownerPos.y + Math.sin(angle) * radiusOffset * (1 + Math.cos((Date.now() / 500)) * 0.2);
            

            // Draw the star (using a small white circle for visibility)
            drawCircle(ctx, camera.getPosition(), {x: x, y: y}, randomFloat(1, 2), 'rgba(255, 255, 255, 0.8)');
        }
    }

    getNearbyEnemies(){
        let targets = game.gameObjects.filter(value => {
            return value instanceof Character && value.tag != this.tag;
        })      

        return targets;        
    }

    shoot(){
        const origin = this.owner.getPosition();       
        const targets = this.getNearbyEnemies();
        targets.forEach(target => {
            if(pointsDistance(this.owner.getPosition(), target.getPosition()) <= this.size){
                target.takeDamage(this.damage);
            }
        });
    }

    upgrade(upgradeLevel){
        super.upgrade(upgradeLevel);
    }
}
