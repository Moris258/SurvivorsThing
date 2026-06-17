import { game } from "../game.js";
import WeatherEffect from "./weatherEffect.js";


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

