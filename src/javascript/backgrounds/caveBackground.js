import { drawRectangle } from "../utility.js";
import Background from "./background.js";


// Caves-specific background implementation
export class CavesBackground extends Background {
    static STALACTITE_COLORS = ["#4B4B4B", "#5D5D5D", "#707070"];
    static STALAGMITE_COLORS = ["#696969", "#8B8B8B", "#A0A0A0"];
    static ROCK_COLORS = ["#333333", "#555555", "#777777"];

    constructor(width, height) {
        super(width, height);
    }

    setSize(width, height) {
        super.setSize(width, height);
        this.caveColor = "#111111";
        let stalactiteScale = 150000;
        let stalagmiteScale = 120000;
        let rockScale = 300000;
        // Initialize cave features
        this.stalactites = this.generateStalactites((width*height)/stalactiteScale);
        this.stalagmites = this.generateStalagmites((width*height)/stalagmiteScale);
        this.rocks = this.generateRocks((width*height)/rockScale);
    }

    generateStalactites(count) {
        const stalactites = [];

        for (let i = 0; i < count; i++) {
            const x = this.randomInt(20, Math.max(0, this.width - 20));
            const y = this.randomInt(20, this.height - 20);
            const width = this.randomInt(8, 20);
            const height = this.randomInt(10, 30);
            const color = CavesBackground.STALACTITE_COLORS[this.randomInt(0, CavesBackground.STALACTITE_COLORS.length)];
            
            // Stalactites hang from the ceiling
            stalactites.push({
                x, y, width, height, color, type: "stalactite"
            });
        }

        return stalactites;
    }

    generateStalagmites(count) {
        const stalagmites = [];

        for (let i = 0; i < count; i++) {
            const x = this.randomInt(20, Math.max(0, this.width - 20));
            const y = this.randomInt(20, this.height - 20);
            const width = this.randomInt(8, 20);
            const height = this.randomInt(10, 30);
            const color = CavesBackground.STALAGMITE_COLORS[this.randomInt(0, CavesBackground.STALAGMITE_COLORS.length)];
            
            // Stalagmites grow from the floor
            stalagmites.push({
                x, y, width, height, color, type: "stalagmite"
            });
        }

        return stalagmites;
    }

    generateRocks(count) {
        const rocks = [];

        for (let i = 0; i < count; i++) {
            const x = this.randomInt(20, Math.max(0, this.width - 20));
            const y = this.randomInt(20, this.height - 20);
            const width = this.randomInt(50, 150);
            const height = this.randomInt(25, 100);
            const color = CavesBackground.ROCK_COLORS[this.randomInt(0, CavesBackground.ROCK_COLORS.length)];

            rocks.push({ x, y, width, height, color });
        }

        return rocks;
    }

    draw(ctx, camera) {
        const cameraPos = camera && typeof camera.getPosition === "function" ? camera.getPosition() : camera;

        // 1. Draw Cave Wall Base
        drawRectangle(ctx, cameraPos, { x: 0, y: 0 }, this.width, this.height, this.caveColor);

        // 2. Draw stalactites (hanging from ceiling)
        for (const stalactite of this.stalactites) {
            drawRectangle(ctx, cameraPos, { x: stalactite.x, y: stalactite.y + stalactite.height }, stalactite.width, stalactite.height, stalactite.color);
        }

        // 3. Draw stalagmites (growing from floor)
        for (const stalagmite of this.stalagmites) {
            drawRectangle(ctx, cameraPos, { x: stalagmite.x, y: stalagmite.y }, stalagmite.width, stalagmite.height, stalagmite.color);
        }

        // 4. Draw rocks (underneath other elements)
        for (const rock of this.rocks) {
            drawRectangle(ctx, cameraPos, { x: rock.x, y: rock.y }, rock.width, rock.height, rock.color);
        }
    }
}