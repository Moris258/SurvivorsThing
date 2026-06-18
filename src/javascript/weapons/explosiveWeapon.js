import { ExplosiveBullet } from "../bullet.js";
import GameObject from "../gameObject.js";
import { moveTowards } from "../utility.js";
import Weapon from "./weapon.js";


/**
 * ExplosiveWeapon targets the closest enemy and fires explosive bullets.
 * On impact, bullets explode and damage enemies in a radius.
 */
export default class ExplosiveWeapon extends Weapon {
    /**
     * @param {Character} owner - The object that owns the weapon.
     * @param {number} initialDamage - Initial damage value.
     * @param {number} initialSpeed - Initial bullet speed.
     * @param {number} initialSize - Visual size of the weapon.
     * @param {number} fireRate - Time interval (in seconds) between shots.
     * @param {number} explosionRadius - Radius of explosion effect.
     * @param {string} bulletColor - Color of the bullet.
     */
    constructor(owner, initialDamage = 10, initialSpeed = 150, initialSize = 30, fireRate = 0.5, explosionRadius = 50, bulletColor = "#ff0000") {
        super(owner, initialDamage, initialSpeed, initialSize, fireRate);
        this.stats.addStat("ExplosionRadius", explosionRadius, -1, 5);
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

