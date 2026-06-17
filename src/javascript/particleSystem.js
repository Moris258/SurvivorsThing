import { game } from "./game.js";
import GameObject from "./gameObject.js";
import { drawCircle, drawRectangle, normalizeVector, randomFloat } from "./utility.js";

export class Particle {
    constructor(pos, size, moveDirection, speed, color, followCamera = true, lifetime = 2, 
        drift = {x: 0, y: 0}, acceleration = 0, shape = "Rectangle") {
        this.pos = {x: pos.x, y: pos.y};
        this.size = {x: size.x, y: size.y};
        this.moveDirection = {x: 0, y: 0};
        this.setMoveDirection(moveDirection);
        this.speed = speed;
        this.color = color;
        this.lifetime = lifetime;
        this.drift = {x: drift.x, y: drift.y};
        this.acceleration = acceleration;
        this.followCamera = followCamera;
    }

    setMoveDirection(dir){
        if(isNaN(dir.x) || isNaN(dir.y)) {
            console.error("Tried to set move direction of Particle with invalid values.");       
            return;
        }
        dir = normalizeVector(dir);
        
        this.moveDirection.x = dir.x;
        this.moveDirection.y = dir.y;
    }

    move(movement){
        if(isNaN(movement.x) || isNaN(movement.y)) {
            console.error("Tried to move Particle with invalid values.");
            return;
        }

        this.pos.x += movement.x;
        this.pos.y += movement.y;
    }

    getMovementVector(deltaT){
        return {x: this.moveDirection.x * this.speed * deltaT, y: this.moveDirection.y * this.speed * deltaT};
    }

    update(deltaT){
        this.move(this.getMovementVector(deltaT));
        this.speed += this.acceleration * deltaT;
        this.lifetime -= deltaT;
    }

    draw(ctx, camera){
        const pos = {x: this.pos.x, y: this.pos.y};
        let cameraPos = {x: 0, y: 0};
        if(this.followCamera){
            cameraPos = camera.getPosition();
        }

        switch(this.shape){
            case "Rectangle":
                drawRectangle(ctx, cameraPos, pos, this.size.x, this.size.y, this.color);
                break;
            case "Circle":
                drawCircle(ctx, cameraPos, pos, this.size.x/2, this.color);
                break;
            default:
                drawRectangle(ctx, cameraPos, pos, this.size.x, this.size.y, this.color);
                break;
        }
    }
}



export default class ParticleSystem extends GameObject{
    constructor(pos, size, generationSpeed, particleSpeed, particleColor, particleLifetime, moveDirection, spread, particleClass, followCamera = true) {
        super(pos, size, false, "ParticleSystem");
        this.particles = [];
        this.particleSize = {x: size.x, y: size.y};
        this.generationSpeed = generationSpeed;
        this.particleSpeed = particleSpeed;
        this.particleColor = particleColor;
        this.particleLifetime = particleLifetime;

        this.moveDirection = {x: moveDirection.x, y: moveDirection.y};
        this.spread = spread;
        this.generating = false;
        
        this.generationCooldown = 0;
        this.particleClass = particleClass;
        this.followCamera = followCamera;

    }

    resetParticles(){
        this.particles.splice(this.particles.length, 0);
    }

    start(){
        this.generating = true;
    }

    stop(){
        this.generating = false;
    }

    generateParticle(){
        let moveDir = this.moveDirection;
        const spread = this.spread;
        
        moveDir = normalizeVector(moveDir);
        moveDir.x += randomFloat(-spread, spread);
        moveDir.y += randomFloat(-spread, spread);
        moveDir = normalizeVector(moveDir);

        this.particles.push(new this.particleClass(this.pos, 
            this.particleSize, moveDir, this.particleSpeed, 
            this.particleColor, this.followCamera, this.particleLifetime));
    }

    setGenerationFunction(func){
        this.generateParticle = func;
    }

    update(deltaT){
        if(this.followCamera){
            if(!game.camera.isVisible(this.pos, {x: 0, y: 0})) return;
        }       

        if(this.generating){
            
            this.generationCooldown -= deltaT;
    
            while(this.generationCooldown <= 0){
                this.generateParticle();
                this.generationCooldown += 1 / this.generationSpeed;
            }
        }
        this.particles = this.particles.filter(particle => particle.lifetime > 0);

        for (const particle of this.particles) {
            particle.update(deltaT);
        }
    }

    draw(ctx, camera){
        for (const particle of this.particles) {
            particle.draw(ctx, camera);
        }
    }
}