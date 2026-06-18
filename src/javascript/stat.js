export class Stat{
    constructor(name, value, maxValue = -1, scaling = 1, upgradeable = true) {
        this.name = name;
        this.value = value;
        this.buffValue = 0;
        this.maxValue = maxValue;
        this.upgradeable = upgradeable;
        this.scaling = scaling;
        this.multiplier = 1;
    }

    getValue(){
        return (this.value + this.buffValue) * this.multiplier;
    }

    getBufflessValue(){
        return this.value * this.multiplier;
    }

    canUpgrade(){
        if(!this.upgradeable) return false;
        if(this.maxValue != -1 && this.value >= this.maxValue) return false;
        return true;
    }

    setUpgradeable(value){
        this.upgradeable = value;
    }

    addBuffValue(amount){
        this.buffValue += amount;
    }

    upgradeMultiplier(amount){
        this.multiplier += amount;
        this.multiplier = Math.max(0.05, this.multiplier);
        console.log(amount);
        
        
    }

    upgrade(amount){
        //TODO: add logic for inversely scaling stats.
        if(!this.canUpgrade()) return;
        amount = Math.floor(amount * this.scaling * 100) / 100;

        if(this.maxValue == -1){
            this.value += amount;
            return;
        }
        if(this.scaling >= 0){
            this.value += amount;
            this.value = Math.min(this.value, this.maxValue);
        }
        else{
            this.value += amount;
            this.value = Math.max(this.value, this.maxValue);
        }

    }
}

export default class Stats{
    constructor() {
        this.stats = [];
    }


    /**
     * Adds a new stat with the given name, value, and optional maximum value.
     * @param {String} name - The name of the stat to add.
     * @param {Number} value - The initial value of the stat.
     * @param {Number} maxValue - The maximum value the stat can reach. If -1, there is no maximum.
     * @param {Number} scaling - Sets the number that multiplies any upgrades of this stat.
     * @throws {Error} If a stat with the given name already exists.
     */
    addStat(name, value, maxValue = -1, scaling = 1, upgradeable = true){
        if(this.getStat(name) != undefined){
            throw new Error("Stat already exists. Adding " + name);            
            return;
        }
        this.stats.push(new Stat(name, value, maxValue, scaling, upgradeable));
    }

    /**
     * 
     * @returns An array containing the names of all stats.
     */
    getStatNames(){
        return this.stats.map(value => value.name);
    }

    /**
     * 
     * @returns An array containing the names of all upgradeable stats.
     */
    getUpgradeableStatNames(){
        return this.stats.filter(stat => stat.canUpgrade()).map(stat => stat.name);
    }
    /**
     * @param {String} name Name of the requested stat.
     * @returns {Stat} The requested stat, or undefined if stat doesn't exist.
     */
    getStat(name){
        return this.stats.find(value => value.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * @param {String} name Name of the requested stat.
     * @returns {number} The requested stat's value, or undefined if stat doesn't exist.
     */
    getStatValue(name){
        const stat = this.getStat(name);
        if(stat == undefined) return undefined;
        return stat.getValue();
    }
}