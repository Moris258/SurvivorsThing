import { game } from "./game.js";
import GameObject from "./gameObject.js";
import { drawRectangle, drawText, pointsDistance } from "./utility.js";

export default class InteractableObject extends GameObject {
    constructor(pos, size) {
        super(pos, size, false, "");
        this.interactRange = this.size.x * 2;
        this.interactable = false;
    }

    update(deltaT){
        const distanceToPlayer = pointsDistance(this.getPosition(), game.player.getPosition());
        
        if(distanceToPlayer <= this.interactRange){
            if(game.player.getInteractable() != this){
                this.interactable = game.player.setInteractable(this, distanceToPlayer);                
            }
        }        
    }

    draw(ctx, camera){
        if(this.interactable){
            let keyPos = this.getCenteredPos();
            keyPos.x += this.size.x / 2;
            const promptWidth = 20;
            const promptHeight = 20;
            const fontSize = 14;
            keyPos.x -= promptWidth / 2;
            keyPos.y -= promptHeight;
            drawRectangle(ctx, camera.getPosition(), keyPos, promptWidth, promptHeight, "#888888", {x: 0, y: 0}, true);
            drawText(ctx, camera.getPosition(), {x: keyPos.x + promptWidth / 2, y: keyPos.y + fontSize}, "E", "black", fontSize);
        }

        drawRectangle(ctx, camera.getPosition(), this.getCenteredPos(), this.size.x, this.size.y, "orange");        
    }

    setInteractable(value){
        this.interactable = value;
    }

    onInteract(){
        if(!this.interactable) return;

        console.log("Success");
    }

    checkValidity(playerPos){
        return this.interactRange >= pointsDistance(this.getPosition(), playerPos);
    }

}