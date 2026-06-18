import Bullet from "../bullet.js";
import { moveTowards } from "../utility.js";
import Weapon from "./weapon.js";


export default class AimedWeapon extends Weapon{
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
        this.stats.addStat("Pierce", pierce, -1, 1);
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

