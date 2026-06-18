import { LightningBolt } from '../bullet.js';
import Character from '../character.js';
import { game } from '../game.js';
import GameObject from '../gameObject.js';
import Weapon from './weapon.js';


export default class LightningWeapon extends Weapon {
    /**
     * LightningWeapon fires lightning bolts that target random visible enemies
     * and strike the area around each enemy after a short delay.
     * 
     * @param {GameObject} owner - The owner of this weapon.
     * @param {number} initialDamage - The base damage of the weapon (default: 20).
     * @param {number} fireRate - The rate at which the weapon fires per second (default: 0.5).
     * @param {number} delayTime - Time before strike hits (default: 1).
     * @param {number} strikeRadius - Radius of the strike damage area (default: 80).
     * @param {number} numTargets - Number of random targets to strike (default: 1).
     * @param {string} lightningColor - Color of the lightning effect (default: "#00f7ff").
     */
    constructor(owner, initialDamage = 10, fireRate = 0.5, delayTime = 1, strikeRadius = 80, numTargets = 1, lightningColor = "#00f7ff") {
        super(owner, initialDamage, 0, 0, fireRate);
        this.stats.getStat("Speed").setUpgradeable(false);
        this.stats.getStat("Size").setUpgradeable(false);
        this.name = "LightningWeapon";
        this.lightningColor = lightningColor;
        
        // Set up the weapon stats
        this.stats.addStat("DelayTime", delayTime, -1, 0.1);
        this.stats.addStat("StrikeRadius", strikeRadius, -1, 5);
        this.stats.addStat("NumTargets", numTargets, -1, 1);
    }

    /**
     * Updates the weapon's state and handles firing logic.
     * @param {number} deltaT - Time elapsed since the last frame (in seconds).
     */
    update(deltaT) {
        super.update(deltaT);
    }

    /**
     * Gets a list of visible enemies on screen.
     * @returns {Character[]} Array of visible enemy characters.
     */
    getVisibleEnemies() {
        return game.gameObjects.filter(value => {
            if(value instanceof Character && value.tag !== this.owner.tag){
                if(game.camera.isVisible(value.getPosition(), value.getSize()))
                    return true;
            }
            return false;
        });
    }

    /**
     * Selects random unique targets from the visible enemies.
     * @param {Character[]} visibleEnemies - Array of visible enemy characters.
     * @param {number} numTargets - Number of targets to select.
     * @returns {Character[]} Array of randomly selected targets.
     */
    getRandomTargets(visibleEnemies, numTargets) {
        if (visibleEnemies.length === 0) return [];
        
        // Clamp numTargets to available enemies
        const actualNumTargets = Math.min(numTargets, visibleEnemies.length);
        
        // Create a shuffled copy of visible enemies
        const shuffled = [...visibleEnemies].sort(() => Math.random() - 0.5);
        
        // Return the first actualNumTargets enemies
        return shuffled.slice(0, actualNumTargets);
    }

    /**
     * Fires the weapon, creating lightning bolts that target random enemies.
     */
    shoot() {
        const visibleEnemies = this.getVisibleEnemies();
        if (visibleEnemies.length === 0) return;
        
        const numTargets = Math.floor(this.stats.getStatValue("NumTargets"));
        const targets = this.getRandomTargets(visibleEnemies, numTargets);
        
        // Create a lightning bolt for each target
        targets.forEach(target => {
            const targetPos = target.getPosition();
            
            const lightningBolt = new LightningBolt(
                {x: targetPos.x, y: targetPos.y},
                this.stats.getStatValue("Damage"),
                this.stats.getStatValue("StrikeRadius"),
                this.owner.tag,
                1/this.stats.getStatValue("DelayTime"),
                this.lightningColor
            );
        });
        
        super.shoot();
    }
}