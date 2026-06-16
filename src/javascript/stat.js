export class Stat{
    constructor(name, value, maxValue = -1, upgradeable = true) {
        this.name = name;
        this.value = value;
        this.maxValue = maxValue;
        this.upgradeable = upgradeable;
    }

    getValue(){
        return this.value;
    }

    canUpgrade(){
        if(!this.upgradeable) return false;
        if(this.maxValue != -1 && this.value >= this.maxValue) return false;
        return true;
    }

    setUpgradeable(value){
        this.upgradeable = value;
    }

    upgrade(amount){
        //TODO: add logic for inversely scaling stats.
        if(!this.canUpgrade()) return;

        if(this.maxValue == -1){
            this.value += amount;
            return;
        }

        this.value += amount;
        this.value = Math.min(this.value, this.maxValue);
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
     * @throws {Error} If a stat with the given name already exists.
     */
    addStat(name, value, maxValue = -1){
        if(this.getStat(name) != undefined){
            throw new Error("Stat already exists. Adding " + name);            
            return;
        }
        this.stats.push(new Stat(name, value, maxValue));
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