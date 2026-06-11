import GameObject from "./gameObject.js";
// Import all concrete enemies available in character.js
import { Enemy, Dog, Bruiser, Fighter, Tank, Mage } from "./character.js"; 
import { game } from "./game.js";

export default class EnemySpawner extends GameObject{
    /**
     * @param {{x: number, y: number}} pos - position from which enemies spawn.
     * @param {number} spawnInterval - rate at which enemies spawn in seconds.
     */
    constructor(pos, spawnInterval) {
        super(pos);
        this.availableEnemies = [Dog, Bruiser, Fighter, Tank, Mage];
        this.spawnInterval = spawnInterval * 1000; // Spawn every 1.5 seconds
        this.lastSpawnTime = Date.now() + spawnInterval;
    }

    // Override update to handle spawning logic
    update(deltaT) {
        super.update(deltaT);

        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime; // Reset timer after spawning
        }
    }

    // Method to spawn a random enemy type
    spawnEnemy() {
        // Randomly select an enemy class from the list
        const EnemyClass = this.availableEnemies[Math.floor(Math.random() * this.availableEnemies.length)];

        // Generate semi-random parameters based on spawner's position and size
        // We assume a standard starting size/HP for simplicity here, but in a real game, these might scale or randomize more heavily.
        const randomHP = Math.floor(Math.random() * 50) + 30;
        const randomSize = { x: Math.random() * 20 + 15, y: Math.random() * 20 + 15 };
        let damage;

        // Set base parameters based on the chosen class type's typical role
        if (EnemyClass === Bruiser) {
            damage = Math.floor(Math.random() * 10) + 8; // High damage, tanky
        } else if (EnemyClass === Fighter) {
            damage = Math.floor(Math.random() * 8) + 5; // Medium damage, balanced
        } else if (EnemyClass === Tank) {
             damage = Math.floor(Math.random() * 10) + 5; // Moderate damage, high defense implicitly
        } else if (EnemyClass === Mage) {
            damage = Math.floor(Math.random() * 7) + 3; // Lower physical damage, relies on magic
        } else { // Dog or Enemy base case
             damage = Math.floor(Math.random() * 5) + 2;
        }


        // Spawn the new enemy at a slightly offset position from the spawner to avoid immediate overlap
        const spawnOffset = randomSize.x * 10;
        const spawnPos = {
            x: this.pos.x + Math.random() * spawnOffset,
            y: this.pos.y - (Math.random() * spawnOffset) // Spawn slightly above/around spawner
        };

        // Instantiate and add the new enemy
        const newEnemy = new EnemyClass(spawnPos, randomHP, randomSize, damage);
        
        // Assuming 'game' object exists globally or is accessible via some manager
        if (typeof game !== 'undefined') {
            console.log(`Spawned ${EnemyClass.name} at (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)})`);
        } else {
             console.warn("Could not spawn enemy: Game object manager is not available.");
        }
    }
}