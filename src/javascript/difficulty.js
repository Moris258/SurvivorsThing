import GameObject from "./gameObject.js";

export default class Difficulty extends GameObject{
    static #instance;

    constructor() {
        if (Difficulty.#instance) {
            throw new Error("This class is a Singleton! Use Difficulty.getInstance() instead.");
        }
        super({x: 0, y: 0});

        this.difficultyNames = ["Easy", "Medium", "Hard", "Very Hard", "Impossible", "PLS DIE", "WUT?"];
        this.difficulties = defaultDifficulties;
        this.timer = null;
        this.currentDifficulty = this.difficulties[0];
    }

    static getInstance() {
        if (!Difficulty.#instance) {
            Difficulty.#instance = new Difficulty();
        }
        return Difficulty.#instance;
    }

    getDifficulty(time){
        return this.difficulties.find(value => value.time > time || value.time == -1);
    }

    shouldChangeDifficulty(time){
        return this.currentDifficulty.time <= time && this.currentDifficulty.time != -1;

    }

    setTimer(timer){
        this.timer = timer;
    }

    update(deltaT){
        if(!this.timer) return;
        const time = this.timer.getTime();

        if(this.shouldChangeDifficulty(time)){
            const lastDifficulty = this.currentDifficulty;
            this.currentDifficulty = this.getDifficulty(time);
            if(this.currentDifficulty.time == -1){
                this.currentDifficulty.time = lastDifficulty.time + 60;
                const newScale = Math.floor((this.currentDifficulty.scale * 1.15) * 100) / 100;     //Increase scale by 15%, round to 2 decimals.
                this.difficulties.push({name: this.currentDifficulty.name + "?", time: -1, scale: newScale});
            }            
        }
    }

    draw(ctx, camera){
        //TODO: draw the difficulty display somewhere
    }
}

const defaultDifficulties = [
    {name: "Easy", time: 1.5*60, scale: 1},
    {name: "Medium", time: 3*60, scale: 1.5},
    {name: "Hard", time: 5*60, scale: 2},
    {name: "Very Hard", time: 7.5*60, scale: 4},
    {name: "Impossible", time: 10*60, scale: 7},
    {name: "PLS DIE", time: 12*60, scale: 10},
    {name: "WUT?", time: -1, scale: 14},
];