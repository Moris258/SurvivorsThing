export default class Buff {
    constructor(target, duration, permanent = false) {
        this.target = target;
        this.duration = duration;
        this.permanent = permanent;
    }

    onBuffStart(){

    }

    update(deltaT){
        if(this.permanent) return;

        this.duration -= deltaT;

        if(this.duration <= 0)
            this.onBuffEnd()
    }

    onBuffEnd(){
        this.target.removeBuff(this);
    }
}