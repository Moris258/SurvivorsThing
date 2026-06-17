import { drawRectangle, drawCircle, lightenColor } from "../utility.js";

// Generalized Background base class
export default class Background {
    constructor(width, height) {
        this.setSize(width, height);
        this.weatherEffects = [];
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    addWeatherEffect(weatherEffect){
        if(this.weatherEffects.includes(weatherEffect)) return;

        this.weatherEffects.push(weatherEffect);
    }

    draw(ctx, camera) {
        // Base implementation - to be overridden by subclasses
        
    }

    drawWeatherEffects(ctx, camera){
        for(const weatherEffect of this.weatherEffects){
            weatherEffect.draw(ctx, camera);
        }
    }

    update(deltaT){
        for(const weatherEffect of this.weatherEffects){
            weatherEffect.update(deltaT);
        }
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    randomInt(min, max) {
        return Math.floor(this.randomRange(min, max));
    }
}