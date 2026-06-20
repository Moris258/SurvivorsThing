import Event from "./event.js";
import ExpOrb from "./expOrb.js";
import { game } from "./game.js";
import GameObject from "./gameObject.js";
import HPPotion from "./hpPotion.js";
import MagnetItem from "./magnetItem.js";
import MoveableObject from "./moveableObject.js";
import Stats from "./stat.js";
import UIObject from "./UIObjects/UIObject.js";
import { UpgradeCard } from "./UIObjects/upgradeCard.js";
import { drawCircle, drawRectangle, moveTowards, pointsDistance, randomFloat, randomInt } from "./utility.js";
import AimedWeapon from "./weapons/aimedWeapon.js";
import AuraWeapon from "./weapons/auraWeapon.js";
import ExplosiveWeapon from "./weapons/explosiveWeapon.js";
import HomingWeapon from "./weapons/homingWeapon.js";
import LightningWeapon from "./weapons/lightningWeapon.js";

export default class Character extends MoveableObject{
    constructor(pos, HP, size) {
        super(pos, size, true);
        this.MAX_HP = HP;
        this.HP = HP;
        this.invincibilitySeconds = 0;
        this.invincibility = 0;
        this.onHit = new Event();
        this.buffs = [];
    }

    addBuff(buff){
        if(this.buffs.includes(buff)) return;

        this.buffs.push(buff);
    }

    removeBuff(buff){
        if(!this.buffs.includes(buff)) return;

        this.buffs.splice(this.buffs.indexOf(buff), 1);
    }

    takeDamage(damage){        
        if(this.isInvincible()) return;

        
        this.HP -= damage;
        this.onHit.callEvents({target: this, damage: damage});
        game.onCharacterHit.callEvents({target: this, damage: damage});
        this.invincibility = this.invincibilitySeconds;
        if(this.HP <= 0)
            this.died();
    }

    healHP(heal){
        this.HP += heal;
        this.HP = Math.min(this.getMaxHP(), this.HP);
    }

    update(deltaT){
        super.update(deltaT);

        for (const buff of this.buffs) {
            buff.update(deltaT);
        }

        if(this.invincibility > 0){
            this.invincibility -= deltaT;
        }
    }

    isInvincible(){
        return this.invincibility > 0;
    }

    draw(ctx, camera){
        super.draw(ctx, camera);
        this.drawHPBar(ctx, camera);
    }

    getMaxHP(){
        return this.MAX_HP;
    }

    died(){
        this.remove()
    }

    onCollision(other){
        super.onCollision(other);
    }

    drawHPBar(ctx, camera){
        let hpBarMargin = 0;
        let hpBarMarginBottom = 6;
        let pos = this.getCenteredPos();
        let hpBarWidth = this.size.x - hpBarMargin * 2;
        let hpBarHeight = 6;
        let hpBarPos = {x: pos.x + hpBarMargin, y: pos.y + this.size.y + hpBarHeight + hpBarMarginBottom};
        drawRectangle(ctx, camera.getPosition(), hpBarPos, hpBarWidth, hpBarHeight, "red", {x: 0, y:0}, true, "black");
        let hpBarHealthWidth = hpBarWidth * (this.HP/ this.getMaxHP());
        drawRectangle(ctx, camera.getPosition(), hpBarPos, hpBarHealthWidth, hpBarHeight, "green");
    }
}

export class Player extends Character{
    constructor(pos, HP, size, level) {
        super(pos, HP, size);
        this.level = level;
        this.XP = 0;
        this.nextLevelXP = 50;
        this.weapons = [];
        this.upgrades = [];
        this.tag = "Player";
        this.invincibilitySeconds = 1;

        this.stats = new Stats();
        this.stats.addStat("MaxHP", 100, -1, 20);
        this.stats.addStat("Speed", 200, -1, 5);
        this.stats.addStat("Defense", 0, -1, 1);
        this.stats.addStat("MaxUpgradesPerLevel", 2, -1, 1, false);
        this.stats.addStat("AttractionRange", 100, -1, 0, false);

        this.interactKey = "KeyE";
        this.interactable = null;

        this.controls = ["KeyW", "KeyA", "KeyS", "KeyD"];
        this.controlMovement = {
            KeyW: {x: 0, y: -1},
            KeyA: {x: -1, y: 0},
            KeyS: {x: 0, y: 1},
            KeyD: {x: 1, y: 0},
        }

        this.MAX_WEAPONS = 6;
        this.MAX_UPGRADES = 6;
        this.numUpgradeOptionsToGenerate = 3;

        this.onLevelUp = new Event();
        this.onLevelUp.addEvent(this.onLevelUpHandler);

        
        let XPBar = new UIObject({x: 0, y: 0}, {x: 0, y: 0});
        XPBar.draw = this.drawXPBar;
        XPBar.player = this;

        this.upgradeCards = [];        
        //TODO: handle HP upgrades properly.
    
    }

    onLevelUpHandler(args){
        let player = args.player;
        player.XP -= player.nextLevelXP;
        player.nextLevelXP *= 1.1;
        player.level += 1;
        game.pauseGame(true);
        player.generateUpgradeCards();
        
    }

    dismissUpgrades(){
        for (const upgrade of this.upgradeCards) {
            upgrade.remove();
        }
        this.upgradeCards = [];
        game.pauseGame(false);
    }

    generateUpgradeCards() {
        //TODO: scale upgrade numbers

        const upgradeOptions = [];
        
        // Add player stat upgrade options
        upgradeOptions.push({ 
            type: 'StatMultiplier', 
            target: this, 
            stats: this.stats,
            name: 'Player'
        });

        upgradeOptions.push({ 
            type: 'StatBase', 
            target: this, 
            stats: this.stats,
            name: 'Player'
        });
        
        // Add weapon stat upgrade options
        for (const weapon of this.weapons) {
            upgradeOptions.push({ 
                type: 'StatMultiplier', 
                target: weapon, 
                stats: weapon.stats,
                name: weapon.name
            });
        }

        for (const weapon of this.weapons) {
            upgradeOptions.push({ 
                type: 'StatBase', 
                target: weapon, 
                stats: weapon.stats,
                name: weapon.name
            });
        }

        if(this.weapons.length < this.MAX_WEAPONS){
            // Add new weapon options (weapons player doesn't have)
            const availableWeaponNames = ['AimedWeapon', 'ExplosiveWeapon', 'AuraWeapon', 'HomingWeapon', 'LightningWeapon'];
            const playerWeaponNames = this.weapons.map(w => w.name);
            const newWeaponOptions = availableWeaponNames.filter(weaponName => !playerWeaponNames.includes(weaponName));
            
            for (const weaponName of newWeaponOptions) {
                upgradeOptions.push({ 
                    type: 'newWeapon', 
                    weaponName: weaponName,
                    name: `New: ${weaponName}`
                });
            }
        }
        
        
        // Randomly select the specified number of upgrades
        const selectedUpgrades = [];
        const optionsCopy = [...upgradeOptions];
        const numToGenerate = Math.min(this.numUpgradeOptionsToGenerate, optionsCopy.length);
        
        for (let i = 0; i < numToGenerate; i++) {
            const randomIndex = Math.floor(Math.random() * optionsCopy.length);
            selectedUpgrades.push(optionsCopy[randomIndex]);
            optionsCopy.splice(randomIndex, 1);
        }
            
        const cardWidth = 350;
        const cardHeight = 600;
        const spacing = 30;
        
        // Create UpgradeCards for each selected upgrade
        for (const upgrade of selectedUpgrades) {
            let upgradeConfig;
            
            if (upgrade.type === 'StatMultiplier' || upgrade.type === 'StatBase') {
                let upgrades = [];
                let upgradesCount = randomInt(1, this.stats.getStatValue("MaxUpgradesPerLevel"));
                let upgradeableStats = upgrade.target.stats.getUpgradeableStatNames();

                for (let i = 0; i < upgradesCount; i++) {
                    let value = 0;
                    switch(upgrade.type){
                        case 'StatBase':
                            value = randomFloat(0.25, 1.25);
                            break;
                        case 'StatMultiplier':
                            value = Math.floor(randomFloat(3, 10)*100)/10000;
                            break;
                    }

                    const statName = upgradeableStats[randomInt(0, upgradeableStats.length - 1)];
                    upgrades.push({name: statName, value: value})
                }

                upgradeConfig = {
                    type: upgrade.type,
                    target: upgrade.target,
                    upgrades: upgrades
                };
            }   
            else if (upgrade.type === 'newWeapon') {
                upgradeConfig = {
                    type: 'AddWeapon',
                    target: this,
                    weaponName: upgrade.weaponName
                };
            }
            

            const card = new UpgradeCard(
                { x: game.CANVAS_WIDTH / 2, y: game.CANVAS_HEIGHT / 2 },
                { x: cardWidth, y: cardHeight },
                upgrade.name,
                upgradeConfig,
                upgradeConfig.target
            );
            this.upgradeCards.push(card);
        }

        // Center all cards horizontally around the center of the screen
        const totalWidth = (cardWidth + spacing) * this.upgradeCards.length - spacing;
        const startX = game.CANVAS_WIDTH / 2 - totalWidth / 2;

        for (let i = 0; i < this.upgradeCards.length; i++) {
            this.upgradeCards[i].pos.x = startX + (cardWidth + spacing) * i + cardWidth / 2;
            this.upgradeCards[i].pos.y = game.CANVAS_HEIGHT / 2;
        }
    }

    addExp(exp){
        this.XP += exp;
        if(this.XP > this.nextLevelXP){
            this.onLevelUp.callEvents({player: this, level: this.level})
        }
    }

    addWeapon(weapon){
        if(this.weapons.length >= this.MAX_WEAPONS) return;
        this.weapons.push(weapon);
        this.addChildObject(weapon);
    }

    takeDamage(damage){
        super.takeDamage(Math.max(0, damage - this.stats.getStatValue("Defense")));
    }
    
    getMovementVector(deltaT){
        let speed = this.stats.getStatValue("Speed");
        return {x: this.moveDirection.x * speed * deltaT, y: this.moveDirection.y * speed * deltaT};
    }

    died(){
        //Show game over screen
        game.endGame();
        super.died();
    }

    getMovementInputs(inputs){
        let dir = {x: 0, y: 0};
        
        this.controls.forEach(control => {
            if(inputs[control]){
                dir.x += this.controlMovement[control].x;
                dir.y += this.controlMovement[control].y;
            }
        });
        return dir;
    }

    setInteractable(interactableObject, distance){
        if(this.interactable == null){
            this.interactable = interactableObject;
            return true;
        }

        if(distance < pointsDistance(this.getPosition(), this.interactable.getPosition())){
            this.interactable = interactableObject;
            return true;
        }

        return false;
    }

    getInteractable(){
        return this.interactable;
    }

    interact(inputs){
        if(inputs[this.interactKey]){
            if(this.interactable != null){
                this.interactable.onInteract();
            }
        }
    }

    update(deltaT){
        super.update(deltaT);
        let inputs = game.inputHandler.keysPressed;
        this.setMoveDirection(this.getMovementInputs(inputs)); 
        if(this.interactable != null){
            if(this.interactable.checkValidity(this.getPosition())){
                this.interact(inputs);
            }
            else{
                this.interactable.setInteractable(false);
                this.interactable = null;
            }
        }  
    }

    draw(ctx, camera){
        super.draw(ctx, camera);

        drawCircle(ctx, camera.getPosition(), this.pos, this.size.x/2, "red", true, "black", 1);
    }

    drawXPBar(ctx, camera){        
        let xpBarMargin = 20;
        let pos = this.pos;
        let player = this.player;
        let xpBarWidth = game.CANVAS_WIDTH - xpBarMargin * 2;
        let xpBarHeight = 6;
        let xpBarPos = {x: pos.x + xpBarMargin, y: pos.y + xpBarHeight + xpBarMargin/4};
        drawRectangle(ctx, {x: 0, y: 0}, xpBarPos, xpBarWidth, xpBarHeight, "#9e9e9e", {x: 0, y:0}, true, "black");
        let xpBarHealthWidth = xpBarWidth * (player.XP/player.nextLevelXP);
        drawRectangle(ctx, {x: 0, y: 0}, xpBarPos, xpBarHealthWidth, xpBarHeight, "#d4ad00");        
    }

    getMaxHP(){
        return this.stats.getStatValue("MaxHP");
    }
}


export class Enemy extends Character {
    constructor(pos, HP, size, damage) {        
        super(pos, HP, size);
        this.damage = damage;
        this.tag = "Enemy";
        this.invincibilitySeconds = 0;
    }

    died(){
        super.died();

        this.spawnXPOrbs(randomInt(1, 5));
        this.spawnHPPotion();
        this.spawnMagnet();
    }

    spawnXPOrbs(count){
        for(let i = 0; i < count; i++){
            const enemyPos = this.getPosition();
            const xpOrbPos = {x: enemyPos.x + randomInt(-20, 20), y: enemyPos.y + randomInt(-20, 20)};

            let value = randomInt(2, 7);
            let orb = new ExpOrb(xpOrbPos, {x: value*2, y: value*2}, value);
        }
    }

    spawnMagnet(){
        if(randomInt(1, Math.floor(1/MAGNET_DROP_RATE)) >= 2) return;

        const enemyPos = this.getPosition();
        const magnetPosition = {x: enemyPos.x + randomInt(-20, 20), y: enemyPos.y + randomInt(-20, 20)};

        let magnet = new MagnetItem(magnetPosition, {x: 40, y: 40}, 4, 1000);
    }

    spawnHPPotion(){
        if(randomInt(1, Math.floor(1/HPPOTION_DROP_RATE)) >= 2) return;

        const enemyPos = this.getPosition();
        const hpPotionPos = {x: enemyPos.x + randomInt(-20, 20), y: enemyPos.y + randomInt(-20, 20)};

        let potion = new HPPotion(hpPotionPos, {x: 40, y: 40}, 20);
    }

    update(deltaT){
        super.update(deltaT);
        this.setMoveDirection(moveTowards(game.player.pos, this.pos));
    }

    draw(ctx, camera){    
        super.draw(ctx, camera);
    }

    onCollision(other){
        super.onCollision(other);
        if(other.tag != "Player" || !(other instanceof Player)) return;       

        other.takeDamage(this.damage);
    }
}

export class Bruiser extends Enemy {
    constructor(pos, HP, size, damage) {
        super(pos, HP, size, damage);
        this.speed = 100;
    }

    draw(ctx, camera){
        const centered = this.getCenteredPos();
        const cameraPos = camera.getPosition();
        const scaleBase = Math.min(this.size.x, this.size.y);
        
        // Dark red outline for aggression
        drawRectangle(ctx, cameraPos, centered, this.size.x, this.size.y, "#CC2222", {x: 0, y: 0}, true, "#660000", Math.max(1, Math.round(scaleBase * 0.15)));
        centered.x = this.pos.x;
        centered.y = this.pos.y;
        // Draw spikes on shoulders
        const spikeY = this.pos.y - this.size.y / 2 + 2;
        const spikeSize = Math.max(2, scaleBase * 0.3);
        drawCircle(ctx, cameraPos, {x: centered.x - this.size.x / 3, y: spikeY}, spikeSize, "#990000");
        drawCircle(ctx, cameraPos, {x: centered.x + this.size.x / 3, y: spikeY}, spikeSize, "#990000");
        
        // Draw metal chest plate
        const plateWidth = this.size.x * 0.6;
        const plateHeight = this.size.y * 0.5;
        drawRectangle(ctx, cameraPos, {x: centered.x - (this.size.x/2) * 0.6, y: centered.y - (this.size.y/2) * 0.5}, plateWidth, plateHeight, "#444444");
        
        // HP Bar
        super.draw(ctx, camera);
    }
}

export class Fighter extends Enemy {
    constructor(pos, HP, size, damage) {
        super(pos, HP, size, damage);
        this.rangeDistance = 100;
        this.speed = 120;
    }

    draw(ctx, camera){
        const centered = this.getCenteredPos();
        const cameraPos = camera.getPosition();
        const scaleBase = Math.min(this.size.x, this.size.y);
        
        // Purple outline
        drawRectangle(ctx, cameraPos, centered, this.size.x * 0.8, this.size.y, "#7B2CBF", {x: 0, y: 0}, true, "#3A0055", Math.max(1, Math.round(scaleBase * 0.15)));

        const bodyCenter = {x: this.pos.x, y: this.pos.y};
        
        // Distinct head
        const headRadius = this.size.x * 0.25;
        const headPos = {x: bodyCenter.x, y: bodyCenter.y - this.size.y * 0.35};
        drawCircle(ctx, cameraPos, headPos, headRadius, "#9D4EDD");
        drawCircle(ctx, cameraPos, headPos, headRadius, "#9D4EDD", true, "#3A0055", Math.max(1, Math.round(scaleBase * 0.15)));
        
        // Eyes (targeting)
        const eyeRadius = Math.max(1, scaleBase * 0.05);
        const eyeSpacing = this.size.x * 0.20;
        const eyeOffsetY = this.size.y * 0.05;
        drawCircle(ctx, cameraPos, {x: headPos.x - eyeSpacing / 2, y: headPos.y - eyeOffsetY}, eyeRadius, "#FFD700");
        drawCircle(ctx, cameraPos, {x: headPos.x + eyeSpacing / 2, y: headPos.y - eyeOffsetY}, eyeRadius, "#FFD700");
        
        // Weapon arm (cyan line)
        const armStart = {x: bodyCenter.x + this.size.x * 0.35, y: bodyCenter.y - this.size.y * 0.1};
        const armLength = this.size.x * 0.6;
        const armEnd = {x: armStart.x + armLength, y: armStart.y - this.size.y * 0.15};
        ctx.strokeStyle = "#00D9FF";
        ctx.lineWidth = Math.max(1, scaleBase * 0.2);
        ctx.beginPath();
        ctx.moveTo(armStart.x - cameraPos.x, armStart.y - cameraPos.y);
        ctx.lineTo(armEnd.x - cameraPos.x, armEnd.y - cameraPos.y);
        ctx.stroke();
        
        // HP Bar
        super.draw(ctx, camera);
    }
}

export class Tank extends Enemy {
    constructor(pos, HP, size, damage) {
        super(pos, HP, size, damage);
        this.speed = 80;
    }

    draw(ctx, camera){
        const centered = this.getCenteredPos();
        const cameraPos = camera.getPosition();
        const scaleBase = Math.min(this.size.x, this.size.y);
        
        drawRectangle(ctx, cameraPos, centered, this.size.x, this.size.y, "#1F77D2", {x: 0, y: 0}, true, "#0A3E6B", Math.max(2, Math.round(scaleBase * 0.2)));
 
        const bodyCenter = {x: this.pos.x, y: this.pos.y};
        
        // Large protective shield on front
        const shieldWidth = this.size.x * 0.85;
        const shieldHeight = this.size.y * 0.9;
        const shieldOffset = scaleBase * 0.4;
        const shieldPos = {x: bodyCenter.x + shieldOffset, y: bodyCenter.y - shieldHeight/2};
        
        // Inner reinforced plating
        const plateWidth = this.size.x * 0.7;
        const plateHeight = this.size.y * 0.6;
        drawRectangle(ctx, cameraPos, {x: bodyCenter.x - plateWidth/2, y: bodyCenter.y - plateHeight/2}, plateWidth, plateHeight, "#36648B");

        drawRectangle(ctx, cameraPos, shieldPos, shieldWidth, shieldHeight, "#4A90E2", {x: 0, y: 0}, true, "#87CEEB", Math.max(1, Math.round(scaleBase * 0.15)));
        
        
        // Shield studs for extra visual interest
        const studRadius = Math.max(1, scaleBase * 0.12);
        const studVerticalOffset = scaleBase * 0.5;
        for (let i = -1; i <= 1; i++) {
            const studY = centered.y + (this.size.y * 0.3 * i);
            drawCircle(ctx, cameraPos, {x: bodyCenter.x + shieldOffset + this.size.x * 0.4, y: studY + studVerticalOffset}, studRadius, "#FFD700");
        }
        
        // HP Bar
        super.draw(ctx, camera);
    }
}

export class Mage extends Enemy {
    constructor(pos, HP, size, damage) {
        super(pos, HP, size, damage);
        this.speed = 100;
        this.shotLead = randomInt(0, 10);
        
        this.giveWeapon(randomInt(0, 4));
        this.addChildObject(this.weapon);
    }

    died(){
        super.died();
    }

    giveWeapon(weaponIndex){
        switch(weaponIndex){
            case 0:
                this.weapon = new AimedWeapon(this, game.player.pos, this.damage, this.speed * 2, this.size.x/2, 1, "#9932CC");
                break;
            case 1:
                this.weapon = new ExplosiveWeapon(this, this.damage, this.speed * 2, this.size.x/2, 1, 50, "#9932CC");
                break;
            case 2:
                this.weapon = new AuraWeapon(this, this.damage/2, this.size.x * 3, 1, "#a252ca93");
                break;
            case 3:
                this.weapon = new HomingWeapon(this, this.damage/2, this.speed * 1.5, this.size.x/2, 0.5, 90, "#9932CC");
                break;  
            case 4:
                this.weapon = new LightningWeapon(this, this.damage/2, 0.5, 0.5, 50, 1, "#9932CC");
                break;  
        }

        this.addChildObject(this.weapon);
    }

    update(deltaT){
        super.update(deltaT);
        this.aimWeapon();
    }

    aimWeapon(){
        if(!(this.weapon instanceof AimedWeapon)) return;
        
        let distance = pointsDistance(this.pos, game.player.pos);
        let shotLeadMultiplier = distance / 10;
        const shootDir = {x: game.player.pos.x + game.player.moveDirection.x*this.shotLead*shotLeadMultiplier,
            y: game.player.pos.y + game.player.moveDirection.y*this.shotLead* shotLeadMultiplier};
        this.weapon.setTarget(shootDir);
    }

    draw(ctx, camera){
        const centered = this.getCenteredPos();
        const cameraPos = camera.getPosition();
        const scaleBase = Math.min(this.size.x, this.size.y);
        
        const bodyCenter = {x: this.pos.x, y: this.pos.y};
        
        // Magical aura (glowing circle around the mage)
        const auraRadius = (this.size.x * 0.8) + (scaleBase * 0.1 * Math.sin(Date.now() / 500));
        ctx.fillStyle = "rgba(138, 43, 226, 0.2)";
        ctx.beginPath();
        ctx.arc(bodyCenter.x - cameraPos.x, bodyCenter.y - cameraPos.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();
                
        // Main robed body (dark purple)
        // Purple outline
        drawRectangle(ctx, cameraPos, centered, this.size.x, this.size.y, "#4B0082", {x: 0, y: 0}, true, "#9932CC", Math.max(1, Math.round(scaleBase * 0.08)));
        
        // Magical robe folds (darker accents)
        const foldWidth = this.size.x * 0.25;
        const foldHeight = this.size.y * 0.4;
        drawRectangle(ctx, cameraPos, {x: bodyCenter.x - this.size.x * 0.25, y: bodyCenter.y - foldHeight / 2}, foldWidth, foldHeight, "#2F004F", {x: 0, y: 0}, false);
        drawRectangle(ctx, cameraPos, {x: bodyCenter.x + this.size.x * 0.25 - foldWidth, y: bodyCenter.y - foldHeight / 2}, foldWidth, foldHeight, "#2F004F", {x: 0, y: 0}, false);
        
        // Pointed hat (wizard hat)
        const hatPeakY = bodyCenter.y - this.size.y * 0.25 - this.size.y * 0.45;
        const hatBaseWidth = this.size.x * 1.1;
        const hatBaseY = bodyCenter.y - this.size.y * 0.3 - this.size.y * 0.2;
        ctx.fillStyle = "#6A0DAD";
        ctx.beginPath();
        ctx.moveTo(bodyCenter.x - cameraPos.x, hatPeakY - cameraPos.y);
        ctx.lineTo((bodyCenter.x - hatBaseWidth / 2) - cameraPos.x, hatBaseY - cameraPos.y);
        ctx.lineTo((bodyCenter.x + hatBaseWidth / 2) - cameraPos.x, hatBaseY - cameraPos.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#9932CC";
        ctx.lineWidth = Math.max(1, Math.round(scaleBase * 0.05));
        ctx.stroke();

        // Magical staff (thin glowing line)
        const staffStart = {x: bodyCenter.x + this.size.x * 0.3, y: bodyCenter.y + this.size.y * 0.2};
        const staffEnd = {x: bodyCenter.x + this.size.x * 0.4, y: bodyCenter.y - this.size.y * 0.6};
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = Math.max(1, scaleBase * 0.15);
        ctx.beginPath();
        ctx.moveTo(staffStart.x - cameraPos.x, staffStart.y - cameraPos.y);
        ctx.lineTo(staffEnd.x - cameraPos.x, staffEnd.y - cameraPos.y);
        ctx.stroke();
        
        // Staff orb at the top (magical energy)
        const orbRadius = Math.max(2, scaleBase * 0.25);
        drawCircle(ctx, cameraPos, staffEnd, orbRadius, "#00FF00");
        drawCircle(ctx, cameraPos, staffEnd, orbRadius, "#00FF00", true, "#00FFFF", Math.max(1, Math.round(scaleBase * 0.05)));
        
        // Magical stars around the mage (floating energy)
        for (let i = 0; i < 4; i++) {
            const angle = (Date.now() / 1000) + (i * Math.PI / 2);
            const starDist = this.size.x * 0.7;
            const starX = bodyCenter.x + Math.cos(angle) * starDist;
            const starY = bodyCenter.y + Math.sin(angle) * starDist;
            const starRadius = Math.max(1, scaleBase * 0.12);
            drawCircle(ctx, cameraPos, {x: starX, y: starY}, starRadius, "#FFD700");
        }
        
        
        // HP Bar
        super.draw(ctx, camera);
    }
}

export class Dog extends Enemy {
    constructor(pos, HP, size, damage) {
        super(pos, HP, size, damage);
        this.speed = 150;
        this.tailWagSpeed = 0; // For animation effect
    }

    draw(ctx, camera){
        const centered = this.getCenteredPos();
        const cameraPos = camera.getPosition();
        const scaleBase = Math.min(this.size.x, this.size.y);

        
        const bodyCenter = {x: this.pos.x, y: this.pos.y};

        // Body (Brown/Tan) - Main rectangle
        const bodyWidth = this.size.x * 0.8;
        const bodyHeight = this.size.y * 0.9;
        drawRectangle(ctx, cameraPos, {x: bodyCenter.x - bodyWidth/2, y: bodyCenter.y - bodyHeight/2}, bodyWidth, bodyHeight, "#A0522D", {x: 0, y: 0}, true, "#7B3F00", Math.max(1, Math.round(scaleBase * 0.1)));

        // Snout/Muzzle (Lighter color)
        const snoutWidth = this.size.x * 0.4;
        const snoutHeight = this.size.y * 0.3;
        drawRectangle(ctx, cameraPos, {x: centered.x + bodyWidth * 0.5 - snoutWidth/2, y: centered.y + bodyHeight * 0.15}, snoutWidth, snoutHeight, "#D2B48C");

        // Ears (Triangles using circles for simplicity)
        const earRadius = Math.max(2, scaleBase * 0.15);
        drawCircle(ctx, cameraPos, {x: bodyCenter.x - bodyWidth * 0.3, y: bodyCenter.y - this.size.y * 0.5}, earRadius, "#696969");
        drawCircle(ctx, cameraPos, {x: bodyCenter.x + bodyWidth * 0.3, y: bodyCenter.y - this.size.y * 0.5}, earRadius, "#696969");

        // Tail (Wagging effect)
        const tailLength = this.size.x * 0.2;
        const tailBaseY = bodyCenter.y + bodyHeight * 0.15;
        
        // Calculate tail position based on a simple sine wave animation for wagging
        this.tailWagSpeed += 0.08;
        const angle = Math.sin(this.tailWagSpeed) * 0.5; // -0.5 to 0.5 radians
        
        // Tail base attachment point (right side of body)
        const tailBaseX = bodyCenter.x + bodyWidth * 0.4;
        const tailBaseYOffset = this.size.y * 0.15;

        // Drawing the tail segment (using a slightly curved rectangle approximation for simplicity, or just drawing circles/lines if needed)
        // For now, we'll draw a simple curved shape using two overlapping rectangles or a single complex path, but sticking to basic shapes:
        drawRectangle(ctx, cameraPos, {x: tailBaseX, y: bodyCenter.y + tailBaseYOffset}, 5 * (scaleBase * 0.05), Math.max(1, scaleBase * 0.2), "#8B4513"); // Base attachment
        // Simplified wagging tail using a circle/oval for the main visible part
        drawCircle(ctx, cameraPos, {x: tailBaseX + tailLength*Math.cos(angle)*1.5, y: bodyCenter.y + Math.max(3, scaleBase * 0.1) + tailBaseYOffset - Math.sin(angle) * 0.5}, Math.max(3, scaleBase * 0.2), "#8B4513");

        // HP Bar
        super.draw(ctx, camera);
    }
}


const HPPOTION_DROP_RATE = 1/25;
const MAGNET_DROP_RATE = 1/50;