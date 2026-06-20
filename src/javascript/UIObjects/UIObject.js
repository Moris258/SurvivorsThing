import { Player } from '../character.js';
import { game } from '../game.js';
import GameObject from '../gameObject.js'
import { drawRectangle, drawText } from '../utility.js';
import AimedWeapon from '../weapons/aimedWeapon.js';
import AuraWeapon from '../weapons/auraWeapon.js';
import ExplosiveWeapon from '../weapons/explosiveWeapon.js';
import HomingWeapon from '../weapons/homingWeapon.js';
import LightningWeapon from '../weapons/lightningWeapon.js';

export default class UIObject extends GameObject{
    constructor(pos, size) {
        super(pos, size, false, "UI");
    }

    onClick(cursorPos){

    }

}