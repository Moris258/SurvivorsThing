import { randomInt } from "../utility.js";
import WeatherEffect from "./weatherEffect.js";



export class LightningWeatherEffect extends WeatherEffect {
    constructor(width, height, intensity, flashMinTime = 5, flashMaxTime = 30) {
        // Pass initial dimensions and default intensity (1)
        super(width, height, intensity);
        this.flashMinTime = flashMinTime * 1000; // Minimum time between flashes (ms)
        this.flashMaxTime = flashMaxTime * 1000; // Maximum time between flashes (ms)
        this.nextFlashDuration = 2000;

        // Internal state for flashing logic
        this.timeUntilNextFlash = this.calculateRandomCooldown();
        this.setIntensity(intensity);
    }

    /**
     * Calculates a random initial cooldown period in milliseconds.
 * @returns {number} The time until the first flash (ms).
 */
    calculateRandomCooldown() {
        return randomInt(this.flashMinTime, this.flashMaxTime);
    }

    /**
     * Updates the internal state based on deltaT, checking if a flash should occur.
     * @param {number} deltaT The time elapsed since the last frame in milliseconds.
     */
    update(deltaT) {
        // Decrease the cooldown timer by the time passed this frame
        deltaT *= 1000;
        this.timeUntilNextFlash -= deltaT;

        if (this.timeUntilNextFlash <= 0) {
            // Flash triggered! Set a new random cooldown period.
            this.lastFlashTime = Date.now(); // Use actual time for flash timing reference if needed, but mainly set state
            this.timeUntilNextFlash = this.calculateRandomCooldown();
            this.nextFlashDuration = randomInt(500, 2000);
        }
    }

    draw(ctx, camera) {
        // Check if a flash is active (or just happened)
        const now = Date.now();
        const flashDuration = this.nextFlashDuration; // Visual duration of the flash in ms
        
        if (now - this.lastFlashTime < flashDuration) {
            // Calculate brightness factor: fades from full intensity to zero over 'flashDuration'
            
            const timeSinceFlashStart = Math.max(Math.abs(now - this.lastFlashTime), flashDuration*0.8); 
            const brightnessFactor = (flashDuration - timeSinceFlashStart) / flashDuration;
            console.log(timeSinceFlashStart);
            

            // Draw bright white/blue overlay, fading out over the duration
            ctx.fillStyle = `rgba(255, 255, ${Math.floor(200 + 100 * brightnessFactor)}, ${brightnessFactor})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    setSize(width, height) {
        super.setSize(width, height);
        // Reset timing on resize to prevent immediate flash bugs
        this.lastFlashTime = Date.now() - 1000;
        this.timeUntilNextFlash = this.calculateRandomCooldown();
    }

    setIntensity(intensity) {
        super.setIntensity(intensity);
        // Intensity primarily affects visual parameters (like flash color/opacity), 
        // but for timing, we can scale the frequency range or just let it affect brightness.
        // For simplicity here, we'll keep intensity affecting dimming and rely on base timing for randomness.
    }
}
