import Buff from "./buff.js";

export default class StatBuff extends Buff{
    constructor(target, statName, value, duration, permanent = false) {
        super(target, duration);
        this.statName = statName;
        this.value = value;
        this.onBuffStart();
    }

    onBuffStart(){
        const stat = this.target.stats.getStat(this.statName);
        if(stat == undefined) return;

        stat.addBuffValue(this.value);
    }

    onBuffEnd(){
        const stat = this.target.stats.getStat(this.statName);
        if(stat == undefined) return;

        stat.addBuffValue(-this.value);
        
        super.onBuffEnd();
    }
}
