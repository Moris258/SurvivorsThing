import { game } from "../game.js";
import { randomFloat, randomInt } from "../utility.js";
import WeatherEffect from "./weatherEffect.js";

export default class SandstormWeatherEffect extends WeatherEffect {
    constructor(width, height, intensity = 1, baseParticleCount = 1000, baseSpeed = 800, baseWindSpeed = 500) {
        super(width, height, intensity);
        this.baseParticleCount = baseParticleCount;
        this.baseSpeed = baseSpeed;
        this.baseWindSpeed = baseWindSpeed;
        this.speed = 0;
        this.windSpeed = 0;
        this.particles = [];
        this.windDirection = -1;
        this.tumbleweeds = [];
        this.setIntensity(intensity);
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.viewportWidth,
                y: Math.random() * this.viewportHeight,
                size: Math.random() * 3 + 1,
                speed: randomFloat(200, Math.max(400, this.speed)),
                windSpeed: randomFloat(0, Math.max(20, this.windSpeed)),
                angle: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.3 + 0.7
            });
        }
    }

    initializeTumbleweeds() {
        this.tumbleweeds = [];
        for (let i = 0; i < Math.floor(this.baseParticleCount * 0.02); i++) {
            this.tumbleweeds.push({
                x: Math.random() * this.viewportWidth,
                y: Math.random() * this.viewportHeight,
                size: Math.random() * 6 + 4, // Made larger
                speed: randomFloat(10, Math.max(80, this.speed)),
                windSpeed: randomFloat(100, Math.max(200, this.windSpeed)),
                angle: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.3 + 0.7,
                bounceAmplitude: randomFloat(0.5, 1.5), // Added bounce amplitude
                bounceFrequency: randomFloat(0.1, 0.3), // Added bounce frequency
                bouncePhase: randomFloat(0, Math.PI * 2) // Added bounce phase
            });
        }
    }

    update(deltaT) {
        for (let particle of this.particles) {
            // Move sand particles in the direction of the wind
            particle.x += particle.windSpeed * deltaT * this.windDirection;
            particle.y += particle.speed * deltaT * 0.8;

            // Apply wind effect with a slight drift
            //particle.x += this.windSpeed * 3 * deltaT;

            // Reset particles that fall off screen
            if (particle.y > this.viewportHeight) {
                particle.y = -10;
                particle.x = Math.random() * this.viewportWidth;
            }

            // Reset particles that blow off screen horizontally
            if (particle.x > this.viewportWidth) {
                particle.x = 0;
            } else if (particle.x < 0) {
                particle.x = this.viewportWidth;
            }
        }

        for (let tumbleweed of this.tumbleweeds) {
            // Calculate bounce motion
            const bounceOffset = Math.sin(tumbleweed.bouncePhase + tumbleweed.bounceFrequency * tumbleweed.windSpeed * deltaT) * tumbleweed.bounceAmplitude;
            tumbleweed.bouncePhase += Math.PI * (deltaT);
            tumbleweed.y += bounceOffset;

            // Move tumbleweed in the direction of the wind
            tumbleweed.x += tumbleweed.windSpeed * deltaT * this.windDirection;
            tumbleweed.y += tumbleweed.speed * deltaT * 0.3;

            // Reset tumbleweed that falls off screen
            if (tumbleweed.y > this.viewportHeight + 20) {
                tumbleweed.y = -20;
                tumbleweed.x = Math.random() * this.viewportWidth;
            }

            if (tumbleweed.y < -20) {
                tumbleweed.y = this.viewportHeight + 20;
                tumbleweed.x = Math.random() * this.viewportWidth;
            }

            // Reset tumbleweed that blows off screen horizontally
            if (tumbleweed.x > this.viewportWidth) {
                tumbleweed.x = 0;
            } else if (tumbleweed.x < 0) {
                tumbleweed.x = this.viewportWidth;
            }
        }

        super.update(deltaT);
    }

    getDimmingOpacity() {
        // Returns a dimming opacity scaled by intensity (0 to 0.4)
        return this.intensity * 0.4;
    }

    draw(ctx, camera) {
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "rgba(255, 220, 150, 0.9)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        // Draw sand particles as lines
        for (let particle of this.particles) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x + particle.windSpeed * 0.1, particle.y + particle.size);
            ctx.stroke();
        }

        // Draw tumbleweeds as circles
        for (let tumbleweed of this.tumbleweeds) {
            ctx.globalAlpha = tumbleweed.opacity;
            ctx.beginPath();
            ctx.arc(tumbleweed.x, tumbleweed.y, tumbleweed.size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(139, 69, 19, 1)"; // Changed to brown
            ctx.fill();
            ctx.globalAlpha = 0.9;
        }

        ctx.globalAlpha = 1;
        
        // Draw dimming overlay based on sandstorm intensity
        const dimmingOpacity = this.getDimmingOpacity();
        if (dimmingOpacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${dimmingOpacity})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        super.draw(ctx, camera);
    }

    setSize(width, height) {
        super.setSize(width, height);
        this.initializeParticles();
        this.initializeTumbleweeds();
    }

    setIntensity(intensity) {
        super.setIntensity(intensity);
        this.resetWeatherEffects();
        this.particleCount = Math.floor(this.baseParticleCount * intensity);
        this.speed = Math.max(500, this.baseSpeed * intensity);
        this.windSpeed = this.baseWindSpeed * intensity;
        this.initializeParticles();
        this.initializeTumbleweeds();
    }
}