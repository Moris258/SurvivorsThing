import Event from "./event.js";
import { game } from "./game.js";
import GameObject from "./gameObject.js";
import MoveableObject from "./moveableObject.js";
import { drawCircle, drawRectangle, moveTowards, pointsDistance, randomFloat, randomInt } from "./utility.js";
import Weapon from "./weapon.js";

export default class Character extends MoveableObject{
    constructor(pos, HP, size) {
        super(pos, size, true);
        this.MAX_HP = HP;
        this.HP = HP;
        this.invincibilitySeconds = 0;
        this.invincibility = 0;

    }

    takeDamage(damage){        
        if(this.isInvincible()) return;

        
        this.HP -= damage;
        this.invincibility = this.invincibilitySeconds;
        if(this.HP <= 0)
            this.died();
    }

    update(deltaT){
        super.update(deltaT);
        if(this.invincibility > 0){
            this.invincibility -= deltaT;
        }
    }

    isInvincible(){
        return this.invincibility > 0;
    }

    draw(ctx, camera){
        super.draw(ctx, camera);
        drawRectangle(ctx, camera.getPosition(), this.getCenteredPos(), this.size.x, this.size.y, "#00000000", {x: 0, y: 0}, true, "black", 1)
        this.drawHPBar(ctx, camera);
    }

    died(){
        this.remove()
    }

    onCollision(other){
    }

    drawHPBar(ctx, camera){
        let hpBarMargin = 0;
        let hpBarMarginBottom = 6;
        let pos = this.getCenteredPos();
        let hpBarWidth = this.size.x - hpBarMargin * 2;
        let hpBarHeight = 6;
        let hpBarPos = {x: pos.x + hpBarMargin, y: pos.y + this.size.y + hpBarHeight + hpBarMarginBottom};
        drawRectangle(ctx, camera.getPosition(), hpBarPos, hpBarWidth, hpBarHeight, "red", {x: 0, y:0}, true, "black");
        let hpBarHealthWidth = hpBarWidth * (this.HP/this.MAX_HP);
        drawRectangle(ctx, camera.getPosition(), hpBarPos, hpBarHealthWidth, hpBarHeight, "green");
    }
}

export class Player extends Character{
    constructor(pos, HP, size, level) {
        super(pos, HP, size);
        this.speed = 200;
        this.level = level;
        this.XP = 0;
        this.defense = 0;
        this.weapons = [];
        this.upgrades = [];
        this.tag = "Player";
        this.invincibilitySeconds = 1;

        this.controls = ["KeyW", "KeyA", "KeyS", "KeyD"];
        this.controlMovement = {
            KeyW: {x: 0, y: -1},
            KeyA: {x: -1, y: 0},
            KeyS: {x: 0, y: 1},
            KeyD: {x: 1, y: 0},
        }

        this.MAX_WEAPONS = 6;
        this.MAX_UPGRADES = 6;

        this.onLevelUp = new Event();
        this.onLevelUp.addEvent(this.onLevelUpHandler);
    }

    onLevelUpHandler(args){
        this.XP = 0;
        this.level += 1;
        //TODO: display upgrade options
    }

    addWeapon(weapon){
        this.weapons.push(weapon);
    }

    takeDamage(damage){
        super.takeDamage(Math.max(0, damage - this.defense));
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

    updateTarget(cursorPos){
        const cameraPos = game.camera.getPosition();
        const target = {x: cameraPos.x + cursorPos.x, y: cameraPos.y + cursorPos.y};        
        
        this.weapons.forEach(weapon => {
            weapon.setTarget(target);
        });
    }

    update(deltaT){
        super.update(deltaT);
        let inputs = game.inputHandler.keysPressed;
        this.setMoveDirection(this.getMovementInputs(inputs));

        this.updateTarget(game.inputHandler.cursorPos);
        this.weapons.forEach(weapon => {
            weapon.update(deltaT);
        });
        
    }

    draw(ctx, camera){
        super.draw(ctx, camera);

        drawCircle(ctx, camera.getPosition(), this.pos, this.size.x/2, "red", true, "black", 1);
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
        //TODO: spawn XP orbs
        super.died();
    }

    update(deltaT){
        super.update(deltaT);
        this.setMoveDirection(moveTowards(game.player.pos, this.pos));
    }

    draw(ctx, camera){    
        super.draw(ctx, camera);
    }

    onCollision(other){
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
                
        console.log(this.shotLead);
        
        this.weapon = new Weapon(this, this.damage, this.speed * 2, this.size.x/2, 1, "#9932CC");
    }

    update(deltaT){
        super.update(deltaT);
        let distance = pointsDistance(this.pos, game.player.pos);
        let shotLeadMultiplier = distance / 10;
        const shootDir = {x: game.player.pos.x + game.player.moveDirection.x*this.shotLead*shotLeadMultiplier,
            y: game.player.pos.y + game.player.moveDirection.y*this.shotLead* shotLeadMultiplier};
        this.weapon.setTarget(shootDir);
        this.weapon.update(deltaT);
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