import { Player } from './character.js';
import { game } from './game.js';
import GameObject from './gameObject.js'
import { drawRectangle, drawText } from './utility.js';
import { AimedWeapon, AuraWeapon, ExplosiveWeapon, HomingWeapon } from './weapon.js';

export default class UIObject extends GameObject{
    constructor(pos, size) {
        super(pos, size, false, "UI");
    }

    onClick(cursorPos){

    }

}


export class UpgradeCard extends UIObject{   
    /**
     * 
     * @param {{x: number, y: number}} pos 
     * @param {{x: number, y: number}} size 
     * @param {{type: 'Stat'|'AddWeapon', any}} upgradeArgs 
     * @param {GameObject} toUpgrade 
     */
    constructor(pos, size, name, upgradeArgs, toUpgrade, color = "#777777") {
        super(pos, size);
        this.name = name;
        this.upgradesArgs = upgradeArgs;
        this.toUpgrade = toUpgrade;
        this.color = color;
        console.log(this);
        
    }

    applyUpgrades(){
        switch (this.upgradesArgs.type) {
            case "Stat":
                for (const upgrade of this.upgradesArgs.upgrades) {
                    let stat = this.toUpgrade.stats.getStat(upgrade.name);
                    stat.upgrade(upgrade.value);
                }
                break;
            case "AddWeapon":
                if(!this.toUpgrade instanceof Player){
                    console.error("Trying to give weapon to non-player.");
                    return;
                }
                let weapon = null;
                let upgradeArgs = this.upgradesArgs;

                switch(this.upgradesArgs.weaponName){
                    case "AimedWeapon":
                        weapon = new AimedWeapon(this.toUpgrade, upgradeArgs.target);
                        break;
                    case "AuraWeapon":
                        weapon = new AuraWeapon(this.toUpgrade);
                        break;
                    case "ExplosiveWeapon":
                        weapon = new ExplosiveWeapon(this.toUpgrade);
                        break;
                    case "HomingWeapon":
                        weapon = new HomingWeapon(this.toUpgrade);
                        break;
                }

                this.toUpgrade.addWeapon(weapon);
                break;        
            default:
                break;
        }
    }

    onClick(cursorPos){
        this.applyUpgrades();
        game.player.dismissUpgrades();
    }

    draw(ctx, camera){
        let pos = this.getCenteredPos();
        drawRectangle(ctx, {x: 0, y: 0}, pos, this.size.x, this.size.y, this.color, {x: 0, y: 0}, true);
        let headerHeight = 100;
        drawRectangle(ctx, {x: 0, y: 0}, {x: pos.x, y: pos.y + headerHeight}, this.size.x, 1, "black");
        let size = 40;
        drawText(ctx, {x: 0, y: 0}, {x: this.pos.x, y: pos.y + headerHeight/2 + size/4}, this.name, "#ffffff", size);
        pos.y += headerHeight;
        let textMargin = 20;
        pos.x += textMargin;
        pos.y += textMargin;

        switch(this.upgradesArgs.type){
            case "Stat":
                {
                    let size = 30;
                    let textGap = 50;
                    pos.y += size;
                    for (const upgrade of this.upgradesArgs.upgrades) {
                        drawText(ctx, {x: 0, y: 0}, pos, upgrade.name + ": " + upgrade.value, "#ffffff", size, false, "#fff", "left");
                        pos.y += textGap;
                    }

                }
                break;
            case "AddWeapon":
                break;
            default:
                break;
        }



    }
}