import { drawRectangle, drawCircle } from "./utility.js";

const FLOWER_COLORS = ["#FF6BAA", "#FFD35C", "#F4A261", "#D46B9A", "#A9D973"];
const FLOWER_CENTER_COLORS = ["#FFF3A3", "#F7E176", "#FFE09C"];
const STEM_COLOR = "#2F6A2D";

export default class Background {
    constructor(width, height) {
        this.setSize(width, height);
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.grassColor = "#4A8B2F";
        this.patchColor = "#6EB94E";
        let patchScale = 100000;
        let flowerScale = 60000;
        this.patches = this.generatePatches((width*height)/patchScale);
        this.flowers = this.generateFlowers((width*height)/flowerScale);
    }

    generatePatches(count) {
        const patches = [];

        for (let i = 0; i < count; i++) {
            const patchWidth = this.randomInt(this.width * 0.12, this.width * 0.30);
            const patchHeight = this.randomInt(this.height * 0.08, this.height * 0.18);
            const x = this.randomInt(0, Math.max(0, this.width - patchWidth));
            const y = this.randomInt(0, Math.max(0, this.height - patchHeight));
            const color = this.lightenColor(this.patchColor, this.randomInt(6, 18));

            patches.push({ x, y, width: patchWidth, height: patchHeight, color });
        }

        return patches;
    }

    generateFlowers(count) {
        const flowers = [];

        for (let i = 0; i < count; i++) {
            const center = {
                x: this.randomInt(20, this.width - 20),
                y: this.randomInt(20, this.height - 20)
            };
            const petalRadius = this.randomInt(4, 8);
            const centerRadius = Math.max(3, Math.round(petalRadius * 0.45));
            const stemHeight = this.randomInt(petalRadius * 4, petalRadius * 7);
            const stemWidth = Math.max(2, Math.round(petalRadius * 0.35));
            const petalColor = FLOWER_COLORS[this.randomInt(0, FLOWER_COLORS.length)];
            const centerColor = FLOWER_CENTER_COLORS[this.randomInt(0, FLOWER_CENTER_COLORS.length)];
            const petalCount = this.randomInt(4, 7);
            const angleOffset = Math.random() * Math.PI * 2;

            flowers.push({
                pos: center,
                petalRadius,
                centerRadius,
                stemHeight,
                stemWidth,
                petalColor,
                centerColor,
                petalCount,
                angleOffset
            });
        }

        return flowers;
    }

    draw(ctx, camera) {
        const cameraPos = camera && typeof camera.getPosition === "function" ? camera.getPosition() : camera;

        drawRectangle(ctx, cameraPos, { x: 0, y: 0 }, this.width, this.height, this.grassColor);

        for (const patch of this.patches) {
            drawRectangle(ctx, cameraPos, { x: patch.x, y: patch.y }, patch.width, patch.height, patch.color, { x: 0, y: 0 }, false);
        }

        for (const flower of this.flowers) {
            this.drawFlower(ctx, cameraPos, flower);
        }
    }

    drawFlower(ctx, cameraPos, flower) {
        const stemX = flower.pos.x - flower.stemWidth / 2;
        const stemY = flower.pos.y;
        drawRectangle(ctx, cameraPos, { x: stemX, y: stemY }, flower.stemWidth, flower.stemHeight, STEM_COLOR);

        const center = { x: flower.pos.x, y: flower.pos.y };
        const ringRadius = flower.petalRadius * 2.2;

        for (let i = 0; i < flower.petalCount; i++) {
            const angle = flower.angleOffset + (i / flower.petalCount) * Math.PI * 2;
            const petalX = center.x + Math.cos(angle) * ringRadius;
            const petalY = center.y + Math.sin(angle) * ringRadius;

            drawCircle(ctx, cameraPos, { x: petalX, y: petalY }, flower.petalRadius, flower.petalColor);
        }

        drawCircle(ctx, cameraPos, center, flower.centerRadius, flower.centerColor, true, "#FFFFFF", 1);
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    randomInt(min, max) {
        return Math.floor(this.randomRange(min, max));
    }

    lightenColor(color, amount) {
        const rgb = color.replace(/^#/, "");
        const num = parseInt(rgb, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
}
