import { drawRectangle } from "../utility.js";
import Background from "./background.js";

// Desert-specific background implementation
export class DesertBackground extends Background {
    static SAND_COLORS = ["#D4A574", "#E8C17E", "#DEB887"];
    static DUNE_COLORS = ["#C9A566", "#D4A574", "#D2B48C"];
    static CACTUS_COLOR = "#6B8E23";
    static CACTUS_SPINE_COLOR = "#E8D4A0";
    static ROCK_COLORS = ["#8B7355", "#A0826D", "#9B8B7E"];

    constructor(width, height) {
        super(width, height);
    }

    setSize(width, height) {
        super.setSize(width, height);
        this.sandColor = DesertBackground.SAND_COLORS[this.randomInt(0, DesertBackground.SAND_COLORS.length)];
        let duneScale = 80000;
        let cactusScale = 100000;
        let rockScale = 400000;
        // Initialize dunes, cacti, and rocks
        this.dunes = this.generateDunes((width*height)/duneScale);
        this.cacti = this.generateCacti((width*height)/cactusScale);
        this.rocks = this.generateRocks((width*height)/rockScale);
    }

    generateDunes(count) {
        const dunes = [];

        for (let i = 0; i < count; i++) {
            const duneWidth = this.randomInt(this.width * 0.15, this.width * 0.40);
            const duneHeight = this.randomInt(this.height * 0.05, this.height * 0.15);
            const x = this.randomInt(0, Math.max(0, this.width - duneWidth));
            const y = this.randomInt(this.height * 0.3, Math.max(0, this.height - duneHeight));
            const color = DesertBackground.DUNE_COLORS[this.randomInt(0, DesertBackground.DUNE_COLORS.length)];

            dunes.push({ x, y, width: duneWidth, height: duneHeight, color });
        }

        return dunes;
    }

    generateCacti(count) {
        const cacti = [];

        for (let i = 0; i < count; i++) {
            const x = this.randomInt(20, this.width - 20);
            const y = this.randomInt(this.height * 0.3, this.height - 20);
            const height = this.randomInt(40, 100);
            const width = this.randomInt(20, 40);
            const armCount = this.randomInt(1, 4);
            const spineCount = this.randomInt(5, 10);
            let spines = [];
            for (let i = 0; i < spineCount; i++) {
                const spineX = x - width * 0.6 / 2 + Math.random() * width * 0.6;
                const spineY = y + Math.random() * height * 0.9;
                spines.push({x: spineX, y: spineY});
            }

            cacti.push({
                x,
                y,
                width,
                height,
                armCount,
                spines
            });
        }

        return cacti;
    }

    generateRocks(count) {
        const rocks = [];

        for (let i = 0; i < count; i++) {
            const x = this.randomInt(20, Math.max(0, this.width - 20));
            const y = this.randomInt(20, this.height - 20);
            const width = this.randomInt(10, 35);
            const height = this.randomInt(8, 25);
            const color = DesertBackground.ROCK_COLORS[this.randomInt(0, DesertBackground.ROCK_COLORS.length)];

            rocks.push({ x, y, width, height, color });
        }

        return rocks;
    }

    draw(ctx, camera) {
        const cameraPos = camera && typeof camera.getPosition === "function" ? camera.getPosition() : camera;

        // 1. Draw Sand/Background base
        drawRectangle(ctx, cameraPos, { x: 0, y: 0 }, this.width, this.height, this.sandColor);

        // 2. Draw dunes
        for (const dune of this.dunes) {
            drawRectangle(ctx, cameraPos, { x: dune.x, y: dune.y }, dune.width, dune.height, dune.color, { x: 0, y: 0 }, false);
        }

        // 3. Draw rocks
        for (const rock of this.rocks) {
            drawRectangle(ctx, cameraPos, { x: rock.x, y: rock.y }, rock.width, rock.height, rock.color);
        }

        // 4. Draw cacti
        for (const cactus of this.cacti) {
            this.drawCactus(ctx, cameraPos, cactus);
        }
    }

    drawCactus(ctx, cameraPos, cactus) {
        // Draw main trunk
        const trunkWidth = cactus.width * 0.6;
        const trunkX = cactus.x - trunkWidth / 2;
        drawRectangle(ctx, cameraPos, { x: trunkX, y: cactus.y }, trunkWidth, cactus.height, DesertBackground.CACTUS_COLOR);

        // Draw arms
        const armHeight = cactus.height * 0.3;
        const armWidth = cactus.width * 0.5;
        
        for (let i = 0; i < cactus.armCount; i++) {
            const angle = (i / cactus.armCount) * Math.PI * 2;
            const armX = cactus.x + Math.cos(angle) * trunkWidth
            const armY = cactus.y + cactus.height * 0.4 + Math.sin(angle) * cactus.height * 0.2;
            
            drawRectangle(ctx, cameraPos, { x: armX - armWidth / 2, y: armY }, armWidth, armHeight, DesertBackground.CACTUS_COLOR);
        }

        // Draw spines
        const spines = cactus.spines;
        for (const spine of spines) {
            drawRectangle(ctx, cameraPos, spine, 2, 6, DesertBackground.CACTUS_SPINE_COLOR);
        }
    }
}
