import { randomInt } from "../utility.js";
import { LightningWeatherEffect } from "./lightningWeatherEffect.js";
import WeatherEffect from "./weatherEffect.js";


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