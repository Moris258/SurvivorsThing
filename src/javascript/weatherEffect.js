import { game } from "./game.js";
import { randomFloat, randomInt } from "./utility.js";

export default class WeatherEffect{
    constructor(width, height, intensity = 1) {     
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.intensity = intensity;
        this.weatherEffects = [];
    }

    setSize(width, height){
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    addWeatherEffect(weatherEffect){
        if(this.weatherEffects.includes(weatherEffect)) return;
        this.weatherEffects.push(weatherEffect);
    }

    removeWeatherEffect(weatherEffect){
        if(!this.weatherEffects.includes(weatherEffect)) return;
        this.weatherEffects.splice(this.weatherEffects.indexOf(weatherEffect), 1);
    }

    resetWeatherEffects(){
        this.weatherEffects.splice(0, this.weatherEffects.length);
    }

    draw(ctx, camera){
        for(const weatherEffect of this.weatherEffects){
            weatherEffect.draw(ctx, camera);
        }
    }

    update(deltaT){
        for(const weatherEffect of this.weatherEffects){
            weatherEffect.update(deltaT);
        }
    }

    setIntensity(intensity){
        this.intensity = Math.max(0, Math.min(1, intensity));
    }
}

export class RainWeatherEffect extends WeatherEffect {
    constructor(width, height, intensity = 1, baseDropCount = 500, baseSpeed = 600, baseWindSpeed = 50) {
        super(width, height, intensity);
        this.baseDropCount = baseDropCount;
        this.baseSpeed = baseSpeed;
        this.baseWindSpeed = baseWindSpeed;
        this.dropCount = 0;
        this.speed = 0;
        this.windSpeed = 0;
        this.raindrops = [];     
        this.setIntensity(intensity); 
    }

    initializeRaindrops() {
        this.raindrops = [];
        for (let i = 0; i < this.dropCount; i++) {
            this.raindrops.push({
                x: Math.random() * this.viewportWidth,
                y: Math.random() * this.viewportHeight,
                length: Math.random() * 8 + 5,
                opacity: Math.random() * 0.3 + 0.7
            });
        }
    }

    update(deltaT) {     
        for (let drop of this.raindrops) {
            // Move rain downward
            drop.y += this.speed * deltaT;
            
            // Apply wind effect
            drop.x += this.windSpeed * 3 * deltaT;
            
            // Reset rain drops that fall off screen
            if (drop.y > this.viewportHeight) {
                drop.y = -10;
                drop.x = Math.random() * this.viewportWidth;
            }
            
            // Reset rain drops that blow off screen horizontally
            if (drop.x > this.viewportWidth) {
                drop.x = 0;
            } else if (drop.x < 0) {
                drop.x = this.viewportWidth;
            }
        }

        super.update(deltaT);
    }

    getDimmingOpacity() {
        // Returns a dimming opacity scaled by intensity (0 to 0.4)
        return this.intensity * 0.4;
    }

    draw(ctx, camera) {     
        
        ctx.strokeStyle = "rgba(200, 220, 255, 0.9)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        for (let drop of this.raindrops) {
            // Render directly to viewport coordinates, independent of camera
            ctx.globalAlpha = drop.opacity;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + this.windSpeed * 0.1, drop.y + drop.length);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // Draw dimming overlay based on rain intensity
        const dimmingOpacity = this.getDimmingOpacity();
        if (dimmingOpacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${dimmingOpacity})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        


        super.draw(ctx, camera);   
    }

    setSize(width, height) {
        super.setSize(width, height);
        this.initializeRaindrops();
    }

    setIntensity(intensity) {
        super.setIntensity(intensity);  
        this.resetWeatherEffects();
        if(this.intensity >= 0.8)
            this.addWeatherEffect(new LightningWeatherEffect(this.viewportWidth, this.viewportHeight, this.intensity));

        this.dropCount = Math.floor(this.baseDropCount * this.intensity);
        this.speed = Math.max(500, this.baseSpeed * this.intensity);
        this.windSpeed = this.baseWindSpeed * this.intensity;
        this.initializeRaindrops();        
    }
}


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


/**
 * Represents a snow particle (snowflake).
 */
class Snowflake {
    constructor(x, y, viewportWidth, viewportHeight) {
        this.x = x;
        this.y = y;
        this.viewportWidth = viewportWidth;
        this.viewportHeight  = viewportHeight;
        // Randomize size and speed for varied visual effect
        this.size = Math.random() * 5 + 2; // between 2 and 7 pixels
        this.speed = randomFloat(0.5, 2);
        this.fallSpeed = randomInt(50, 200); // between 0.5 and 2.0
        // Random horizontal drift for a more natural fall pattern
        this.driftX = (Math.random() - 0.5) * 1.5; 
    }

    /**
     * Updates the position of a snowflake.
     * @param {number} deltaT - The time elapsed since the last frame (in seconds).
     * @param {number} windSpeed - The current global wind speed affecting horizontal movement.
     */
    update(deltaT, windSpeed = 0) { // Added windSpeed parameter with default value
        // Move downwards
        this.y += this.fallSpeed * deltaT * 0.8; 
        
        // Apply combined horizontal drift (random + wind)
        // We keep a small random component and add the scaled global wind speed
        const randomDrift = this.driftX * (this.speed / 1.5);
        this.x += (randomDrift + windSpeed * deltaT * 0.5); // Scaled by deltaT for consistency

        // Reset if fallen off screen
        if (this.y > this.viewportHeight) {
            this.y = -10;
            this.x = Math.random() * this.viewportWidth;
        }
        
        // Boundary checks remain the same
        if (this.x > this.viewportWidth) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = this.viewportWidth;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // White color with slight transparency
        ctx.beginPath();
        // Draw a slightly oval shape for the flake
        ctx.ellipse(this.x, this.y, this.size / 2, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

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
            this.snowflakes.push(new Snowflake(startX, startY, this.viewportWidth, this.viewportHeight));
        }
    }

    /**
     * Updates the position of all snowflakes in the snowfield.
     * @param {number} deltaT - The time elapsed since the last frame (in seconds).
     */
    update(deltaT) {
        // Update every snowflake
        this.snowflakes.forEach(flake => flake.update(deltaT, this.windSpeed));
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
        this.snowflakes.forEach(flake => flake.draw(ctx));

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

/**
 * Handles darkness effect with light sources around the player and additional light areas.
 */
export class DarknessWeatherEffect extends WeatherEffect {
    constructor(canvasWidth, canvasHeight, intensity = 1, playerLightRadius = 500, additionalLights = []) {
        super(canvasWidth, canvasHeight, intensity);
        this.playerLightRadius = playerLightRadius;
        this.additionalLights = additionalLights; // Array of {x, y, radius} objects
        this.basePlayerLightRadius = playerLightRadius;
        this.setIntensity(intensity);
    }

    /**
     * Gets the player position from the global game object.
     * @returns {{x: number, y: number}} Player position {x, y} or null if player not available.
     */
    getPlayerPosition() {
        if (game && game.player) {
            const player = game.player;
            if (player && typeof player.getPosition === 'function') {
                return player.getPosition();
            }
        }
        return null;
    }

    /**
     * Adds a light source to the darkness effect.
     * @param {number} x - X coordinate of light source.
     * @param {number} y - Y coordinate of light source.
     * @param {number} radius - Radius of light effect.
     */
    addLight(x, y, radius) {
        this.additionalLights.push({ x, y, radius });
    }

    /**
     * Clears all additional light sources.
     */
    clearLights() {
        this.additionalLights = [];
    }

    draw(ctx, camera) {
        const cameraPos = camera && typeof camera.getPosition === "function" ? camera.getPosition() : camera;

        // Save the current canvas state
        ctx.save();

        // Draw a full-screen dark overlay
        //const darkness = this.intensity; // Darkness correlates with intensity
        // ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
        // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Create light effects by using composite operations
        ctx.globalAlpha = this.intensity * 0.3 + 0.7;

        // Draw light around the player
        const playerPos = this.getPlayerPosition();
        if (playerPos) {
            // Adjust player position to screen coordinates relative to camera
            const screenPlayerX = playerPos.x - cameraPos.x;
            const screenPlayerY = playerPos.y - cameraPos.y;

            // Create radial gradient for player light
            const gradient = ctx.createRadialGradient(
                screenPlayerX, screenPlayerY, 0,
                screenPlayerX, screenPlayerY, this.playerLightRadius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
            
        }

        // Draw additional light sources
        for (const light of this.additionalLights) {
            const screenLightX = light.x - cameraPos.x;
            const screenLightY = light.y - cameraPos.y;

            const gradient = ctx.createRadialGradient(
                screenLightX, screenLightY, 0,
                screenLightX, screenLightY, light.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenLightX, screenLightY, light.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Restore composite operation
        ctx.globalAlpha = 1;

        // Restore the canvas state
        ctx.restore();
    }

    setSize(width, height) {
        super.setSize(width, height);
    }

    setIntensity(intensity) {
        super.setIntensity(intensity);
        // Scale the light radius slightly based on intensity for gameplay variety
        this.playerLightRadius = this.basePlayerLightRadius * (0.6 + (1 - this.intensity) * 0.4);
    }
}