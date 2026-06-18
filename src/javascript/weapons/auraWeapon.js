import Character from "../character.js";
import { game } from "../game.js";
import { checkCircleRectangleOverlap, drawCircle, randomFloat } from "../utility.js";
import Weapon from "./weapon.js";

/**
 * AuraWeapon deals damage in a continuous area around the owner.
 * It does not fire projectiles but rather applies periodic AoE damage.
 */
export default class AuraWeapon extends Weapon {
    /**
     * Creates a new AuraWeapon instance.
     * @param {GameObject} owner - The owner of this weapon.
     * @param {number} initialDamage - The initial damage per tick (default: 2).
     * @param {number} initialRadius - The initial radius of the aura (default: 100).
     * @param {number} fireRate - The rate at which the weapon fires (default: 0.5).
     * @param {string} auraColor - The color of the aura (default: '#ffff0099').
     */
    constructor(owner, initialDamage = 2, initialRadius = 100, fireRate = 2, auraColor = "#ffff0099") {
        super(owner, initialDamage, 0, initialRadius, fireRate);
        this.stats.getStat("Speed").setUpgradeable(false);
        this.stats.getStat("Size").scaling = 10;
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
