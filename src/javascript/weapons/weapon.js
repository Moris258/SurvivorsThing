import Event from '../event.js';
import GameObject from '../gameObject.js';
import Stats from '../stat.js';

export default class Weapon extends GameObject{    
    /**
     * @param {Character} owner - The object that owns the weapon (must have position and direction).
     * @param {number} initialDamage - Initial damage value.
     * @param {number} initialSpeed - Initial bullet speed.
     * @param {number} initialSize - Visual size of the weapon model/attachment point.
     * @param {number} fireRate - Time interval (in seconds) between shots.
     */
    constructor(owner, initialDamage = 10, initialSpeed = 15, initialSize = 2, fireRate = 5) {
        super({x: 0, y: 0}, {x: 0, y: 0}, false, owner.tag);
        this.owner = owner;
        this.name = "Weapon";
        this.level = 1;

        // Firing state variables
        this.fireCooldown = 1/fireRate;
        
        this.onWeaponFired = new Event();

        this.stats = new Stats();
        this.stats.addStat("Damage", initialDamage, -1, 5);
        this.stats.addStat("Speed", initialSpeed, -1, 10);
        this.stats.addStat("Size", initialSize, -1, 5);
        this.stats.addStat("FireRate", fireRate, -1, 0.1);
        this.stats.addStat("Spread", 0.15, -1, 1, false);
    }

    /**
     * Updates the weapon's state, handling firing logic.
     * @param {number} deltaT - Time elapsed since the last frame (in seconds).
     */
    update(deltaT) {
        this.fireCooldown -= deltaT; // Get current time in second

        // Check if enough time has passed since the last shot
        while(this.fireCooldown <= 0) {
            this.shoot();
            this.fireCooldown += 1 / this.stats.getStatValue("FireRate");
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