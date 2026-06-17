import { game } from "../game.js";
import { randomFloat, randomInt } from "../utility.js";

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