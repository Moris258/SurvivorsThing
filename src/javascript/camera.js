

export default class Camera{
    constructor(pos = {x: 0, y: 0}) {
        this.pos = {x: 0, y: 0};
        this.offset = {x: 0, y:0};
        this.setPosition(pos);
    }

    setOffset(offset){
        if(isNaN(offset.x) || isNaN(offset.y)){
            console.error("Tried to set camera offset with invalid values.");       
            return;
        }

        this.offset.x = offset.x;
        this.offset.y = offset.y;
    }

    getPosition(){        
        return {x: this.pos.x + this.offset.x, y: this.pos.y + this.offset.y};
    }

    setPositionAsObject(pos){
        this.pos = pos;
    }

    setPosition(newPos){
        if(isNaN(newPos.x) || isNaN(newPos.y)){
            console.error("Tried to set camera position with invalid values.");       
            return;
        }

        this.pos.x = newPos.x;
        this.pos.y = newPos.y;
    }

    moveCamera(move){
        if(isNaN(move.x) || isNaN(move.y)){
            console.error("Tried to move camera position with invalid values.");       
            return;
        }

        this.pos.x += move.x;
        this.pos.y += move.y;
    }
}