import Bullet, { ExplosiveBullet, HomingBullet } from './bullet.js'; // Assuming Bullet class is exported here
import Character from './character.js';
import Event from './event.js';
import { game } from './game.js';
import GameObject from './gameObject.js';
import Stats from './stat.js';
import { checkCircleRectangleOverlap, drawCircle, moveTowards, pointsDistance, randomFloat, rotateVector } from './utility.js';

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
        this.name = "Weapon";
        this.level = 1;

        // Firing state variables
        this.lastFireTime = Date.now() / 1000;
        
        this.onWeaponFired = new Event();

        this.stats = new Stats();
        this.stats.addStat("Damage", initialDamage, -1);
        this.stats.addStat("Speed", initialSpeed, -1);
        this.stats.addStat("Size", initialSize, -1);
        this.stats.addStat("FireRate", fireRate, -1, -1);
        this.stats.addStat("Spread", 0.15, -1, 1, false);
    }

    /**
     * Updates the weapon's state, handling firing logic.
     * @param {number} deltaT - Time elapsed since the last frame (in seconds).
     */
    update(deltaT) {
        const currentTime = Date.now() / 1000; // Get current time in second

        // Check if enough time has passed since the last shot
        if (currentTime - this.lastFireTime >= this.stats.getStatValue("FireRate")) {
            this.shoot();
            this.lastFireTime = currentTime;
        }
    }

    shoot() {    
        this.onWeaponFired.callEvents({target: this});
    }

    upgrade(upgradeLevel = 1) {
        this.level += upgradeLevel;
        this.damage *= (1 + 0.2 * upgradeLevel); // Increase damage by 20% per level
        this.speed *= (1 + 0.1 * upgradeLevel);  // Increase speed by 10% per level
        this.fireRate = Math.max(0.05, this.fireRate * (1 - 0.08 * upgradeLevel)); // Reduce fire rate, minimum 0.05s
        console.log(`Weapon upgraded to Level ${this.level}. \nDamage: ${this.damage.toFixed(2)}, 
        \nSpeed: ${this.speed.toFixed(2)}, 
        \nFire Rate: ${this.fireRate.toFixed(2)}`);
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
    constructor(owner, target, initialDamage = 10, initialSpeed = 250, initialSize = 20, fireRate = 1, bulletColor = "yellow", pierce = 1) {
        super(owner, initialDamage, initialSpeed, initialSize, fireRate);
        this.target = target;
        this.name = "AimedWeapon";
        
        this.bulletColor = bulletColor;
        this.stats.addStat("Pierce", pierce, -1);
    }

    update(deltaT){
        super.update(deltaT);
    }

    /**
     * Creates and launches a new bullet object from the weapon owner's position.
     */
    shoot() {
        const origin = this.owner.getPosition();
        const size = this.stats.getStatValue("Size");

        // Create the bullet instance
        const bullet = new Bullet(
            origin,
            {x: size, y: size},
            this.stats.getStatValue("Speed"),
            moveTowards(this.target, origin, this.stats.getStatValue("Spread")),
            this.stats.getStatValue("Damage"),
            10, this.bulletColor, 
            this.stats.getStatValue("Pierce")
        );
        bullet.tag = this.owner.tag;

        super.shoot();
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
        this.pierce += upgradeLevel;
    }
}


export class HomingWeapon extends Weapon {
    /**
     * HomingWeapon fires bullets that home in on the closest target.
     * It creates multiple bullets per shot, each with randomized initial direction.
     * The bullets rotate toward the target and maintain a specified pierce value.
     * 
     * @param {GameObject} owner - The owner of this weapon.
     * @param {number} initialDamage - The base damage of the bullet (default: 2).
     * @param {number} initialSpeed - The speed of the bullet (default: 100).
     * @param {number} initialSize - The size of the bullet (default: 10).
     * @param {number} fireRate - The rate at which the weapon fires (default: 1).
     * @param {number} rotationSpeed - The rotation speed of the bullet (default: 75).
     * @param {string} bulletColor - The color of the bullet (default: "yellow").
     * @param {number} pierce - The number of enemies the bullet can pierce (default: 1).
     */

    constructor(owner, initialDamage = 2, initialSpeed = 100, initialSize = 10, fireRate = 1, rotationSpeed = 75, bulletColor = "yellow", pierce = 1) {
        super(owner, initialDamage, initialSpeed, initialSize, fireRate);
        this.bulletColor = bulletColor;
        this.closestTarget = null;
        this.name = "HomingWeapon";

        this.stats.addStat("Pierce", pierce, -1);
        this.stats.addStat("RotationSpeed", rotationSpeed, -1);
        this.stats.addStat("BulletCount", 2, -1);
        
    }

    update(deltaT){
        this.closestTarget = GameObject.findClosestTarget(this);
        super.update(deltaT);
    }

    shoot(){
        if (this.closestTarget === null) return;

        const origin = this.owner.getPosition();
        const target = this.closestTarget;

        const size = this.stats.getStatValue("Size");

        // Create a homing bullet
        for(let i = 0; i < this.stats.getStatValue("BulletCount"); i++){
            const bullet = new HomingBullet(
                origin,
                {x: size, y: size},
                this.stats.getStatValue("Speed"),
                rotateVector(moveTowards(target.pos, origin, this.stats.getStatValue("Spread")), randomFloat(-180, 180)),
                this.stats.getStatValue("Damage"),
                this.stats.getStatValue("RotationSpeed"),
                5, 
                this.bulletColor, 
                this.stats.getStatValue("Pierce"),
                target
            );
            bullet.tag = this.owner.tag;
        }

        super.shoot();
    }
}

/**
 * AuraWeapon deals damage in a continuous area around the owner.
 * It does not fire projectiles but rather applies periodic AoE damage.
 */
export class AuraWeapon extends Weapon {
    /**
     * Creates a new AuraWeapon instance.
     * @param {GameObject} owner - The owner of this weapon.
     * @param {number} initialDamage - The initial damage per tick (default: 2).
     * @param {number} initialRadius - The initial radius of the aura (default: 100).
     * @param {number} fireRate - The rate at which the weapon fires (default: 0.5).
     * @param {string} auraColor - The color of the aura (default: '#ffff0099').
     */
    constructor(owner, initialDamage = 2, initialRadius = 100, fireRate = 0.5, auraColor = "#ffff0099") {
        super(owner, initialDamage, 0, initialRadius, fireRate);
        this.stats.getStat("Speed").setUpgradeable(false);
        this.auraColor = auraColor;
        this.name = "AuraWeapon";
    }

    update(deltaT){
        super.update(deltaT);
    }

    draw(ctx, camera){
        const ownerPos = this.owner.getPosition();
        
        // 1. Draw the main aura circle (retaining original functionality)
        const size = this.stats.getStatValue("Size");
        drawCircle(ctx, camera.getPosition(), ownerPos, size, this.auraColor);

        // 2. Draw spinning stars effect
        const starCount = 30;
        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2 + (Date.now() / 4000)  * Math.PI * 2; // Distribute points evenly around a circle
            const radiusOffset = size * 0.8; // Stars are slightly inside the main aura radius
            
            
            // Calculate position for the star, adding a slight rotation component over time for dynamism
            const x = ownerPos.x + Math.cos(angle) * radiusOffset * (1 + Math.sin((Date.now() / 500)) * 0.2);
            const y = ownerPos.y + Math.sin(angle) * radiusOffset * (1 + Math.cos((Date.now() / 500)) * 0.2);
            

            // Draw the star (using a small white circle for visibility)
            drawCircle(ctx, camera.getPosition(), {x: x, y: y}, randomFloat(size/100, size/50), 'rgba(255, 255, 255, 0.8)');
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
            if(checkCircleRectangleOverlap(origin, this.stats.getStatValue("Size"), target.pos, target.size)){
                target.takeDamage(this.stats.getStatValue("Damage"));
            }
        });

        super.shoot();
    }

    upgrade(upgradeLevel){
        super.upgrade(upgradeLevel);
    }
}

/**
 * ExplosiveWeapon targets the closest enemy and fires explosive bullets.
 * On impact, bullets explode and damage enemies in a radius.
 */
export class ExplosiveWeapon extends Weapon {
    /**
     * @param {Character} owner - The object that owns the weapon.
     * @param {number} initialDamage - Initial damage value.
     * @param {number} initialSpeed - Initial bullet speed.
     * @param {number} initialSize - Visual size of the weapon.
     * @param {number} fireRate - Time interval (in seconds) between shots.
     * @param {number} explosionRadius - Radius of explosion effect.
     * @param {string} bulletColor - Color of the bullet.
     */
    constructor(owner, initialDamage = 10, initialSpeed = 150, initialSize = 30, fireRate = 2, explosionRadius = 50, bulletColor = "#ff0000") {
        super(owner, initialDamage, initialSpeed, initialSize, fireRate);
        this.stats.addStat("ExplosionRadius", explosionRadius, -1);
        this.closestTarget = null;
        this.bulletColor = bulletColor;
        this.name = "ExplosiveWeapon";
    }

    update(deltaT) {
        // Update closest target each frame
        this.closestTarget = GameObject.findClosestTarget(this.owner);
        super.update(deltaT);
    }

    /**
     * Fire an explosive bullet at the closest target.
     */
    shoot() {
        if (this.closestTarget === null) return;

        const origin = this.owner.getPosition();
        const targetPos = this.closestTarget.getPosition();
        const size = this.stats.getStatValue("Size");

        // Create an explosive bullet
        const bullet = new ExplosiveBullet(
            origin,
            {x: size, y: size},
            this.stats.getStatValue("Speed"),
            moveTowards(targetPos, origin, this.stats.getStatValue("Spread")),
            this.stats.getStatValue("Damage"),
            this.stats.getStatValue("ExplosionRadius"),
            10,
            this.bulletColor,
            this.owner.tag
        );
        
        super.shoot();
    }

    upgrade(upgradeLevel = 1) {
        super.upgrade(upgradeLevel);
        // Also upgrade explosion radius
        this.explosionRadius *= (1 + 0.15 * upgradeLevel);
    }
}


