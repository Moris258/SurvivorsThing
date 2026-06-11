import Bullet from './bullet.js'; // Assuming Bullet class is exported here
import { moveTowards } from './utility.js';
export default class Weapon {
    /**
     * @param {object} owner - The object that owns the weapon (must have position and direction).
     * @param {number} initialDamage - Initial damage value.
     * @param {number} initialSpeed - Initial bullet speed.
     * @param {number} initialSize - Visual size of the weapon model/attachment point.
     * @param {number} fireRate - Time interval (in seconds) between shots.
     */
    constructor(owner, initialDamage = 10, initialSpeed = 15, initialSize = 2, fireRate = 0.2, bulletColor = "yellow") {
        this.owner = owner;
        this.target = {x: 1, y: 0};
        this.damage = initialDamage;
        this.speed = initialSpeed;
        this.size = initialSize;
        this.spread = 0.15;
        this.bulletColor = bulletColor;

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
     * 
     * @param {{x: number, y: number}} target - position of the target.
     */
    setTarget(target){
        this.target.x = target.x;
        this.target.y = target.y;
    }

    /**
     * Upgrades the weapon's stats, increasing damage and slightly reducing fire rate.
     * @param {number} upgradeLevel - The level of upgrade to apply (e.g., 1).
     */
    upgrade(upgradeLevel) {
        this.damage *= (1 + 0.2 * upgradeLevel); // Increase damage by 20% per level
        this.speed *= (1 + 0.1 * upgradeLevel);  // Increase speed by 10% per level
        this.fireRate = Math.max(0.05, this.fireRate * (1 - 0.08 * upgradeLevel)); // Reduce fire rate, minimum 0.05s
        console.log(`Weapon upgraded to Level ${upgradeLevel}. Damage: ${this.damage.toFixed(2)}, Speed: ${this.speed.toFixed(2)}, Fire Rate: ${this.fireRate.toFixed(2)}`);
    }

    // Add getters or other methods if needed for external access (e.g., getDamage())
}