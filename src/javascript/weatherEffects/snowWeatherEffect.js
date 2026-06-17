import { randomFloat, randomInt } from "../utility.js";
import { DarknessWeatherEffect } from "./darknessWeatherEffect.js";
import WeatherEffect from "./weatherEffect.js";

/**
 * Handles snowy weather visuals for the game.
 */
export class SnowWeatherEffect extends WeatherEffect {
    constructor(canvasWidth, canvasHeight, intensity, baseSnowflakeCount = 500, baseWindSpeed = 500) {
        super(canvasWidth, canvasHeight, intensity); // Call parent constructor if applicable (e.g., Event or base class)
        this.snowflakes = [];
        this.baseSnowflakeCount = baseSnowflakeCount;
        this.baseWindSpeed = baseWindSpeed;
        this.windSpeed = 0;
        this.windDirection = 1;
        this.snowflakeCount = 0;
        this.setIntensity(intensity);
    }

    /**
     * Initializes the snow field by creating initial snowflakes across the screen.
     * @param {number} width - The width of the game canvas.
     * @param {number} height - The height of the game canvas.
     */
    createSnowfield() {
        this.snowflakes = [];
        for (let i = 0; i < this.snowflakeCount; i++) {
            // Start flakes at random X position and near the top edge of the screen
            const startX = Math.random() * this.viewportWidth;
            const startY = Math.random() * this.viewportHeight; // Start slightly above viewable area
            this.snowflakes.push({
                x: startX,
                y: startY,
                size: Math.random() * 5 + 2,
                speed: randomFloat(0.5, 2),
                fallSpeed: randomInt(50, 200),
                driftX: (Math.random() - 0.5) * 1.5                
            });

        }
    }

    /**
     * Updates the position of all snowflakes in the snowfield.
     * @param {number} deltaT - The time elapsed since the last frame (in seconds).
     */
    update(deltaT) {
        // Update every snowflake
        for (const snowflake of this.snowflakes) {
            // Move downwards
            
            snowflake.y += snowflake.fallSpeed * deltaT * 0.8; 
            
            // Apply combined horizontal drift (random + wind)
            // We keep a small random component and add the scaled global wind speed
            const randomDrift = snowflake.driftX * (snowflake.speed / 1.5);
            snowflake.x += (randomDrift + this.windSpeed * deltaT * 0.5); // Scaled by deltaT for consistency

            // Reset if fallen off screen
            if (snowflake.y > this.viewportHeight) {
                snowflake.y = -10;
                snowflake.x = Math.random() * this.viewportWidth;
            }
            
            // Boundary checks remain the same
            if (snowflake.x > this.viewportWidth) {
                snowflake.x = 0;
            } else if (snowflake.x < 0) {
                snowflake.x = this.viewportWidth;
            }
        }


        super.update(deltaT);
    }

    
    getDimmingOpacity() {
        // Returns a dimming opacity scaled by intensity (0 to 0.4)
        return this.intensity * 0.4;
    }

    /**
     * Draws all snowflakes on the canvas context.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the game canvas.
     */
    draw(ctx, camera) {
        // Draw each snowflake
        for (const snowflake of this.snowflakes) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // White color with slight transparency
            ctx.beginPath();
            // Draw a slightly oval shape for the flake
            ctx.ellipse(snowflake.x, snowflake.y, snowflake.size / 2, snowflake.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw dimming overlay based on snow intensity
        const dimmingOpacity = this.getDimmingOpacity();
        if (dimmingOpacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${dimmingOpacity})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        super.draw(ctx, camera);
    }

    /**
     * Sets internal dimensions needed for calculations.
     * @param {number} width - Canvas width.
     * @param {number} height - Canvas height.
     */
    setSize(width, height){
        super.setSize(width, height);
        this.createSnowfield();
    }

    setIntensity(intensity){
        super.setIntensity(intensity);
        this.resetWeatherEffects();
        if(this.intensity >= 0.8)
            this.addWeatherEffect(new DarknessWeatherEffect(this.viewportWidth, this.viewportHeight, this.intensity));
        this.snowflakeCount = this.baseSnowflakeCount * this.intensity;
        this.windSpeed = this.baseWindSpeed * this.intensity; 
        this.createSnowfield();
    }
}