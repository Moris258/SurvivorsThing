import { HomingBullet } from "../bullet.js";
import GameObject from "../gameObject.js";
import { moveTowards, randomFloat, rotateVector } from "../utility.js";
import Weapon from "./weapon.js";


export default class HomingWeapon extends Weapon {
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

        this.stats.addStat("Pierce", pierce, -1, 1);
        this.stats.addStat("RotationSpeed", rotationSpeed, -1, 10);
        this.stats.addStat("BulletCount", 2, -1, 1);
        
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
