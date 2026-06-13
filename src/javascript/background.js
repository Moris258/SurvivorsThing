import { drawRectangle, drawCircle, lightenColor } from "./utility.js";

// Generalized Background base class
export default class Background {
    constructor(width, height) {
        this.setSize(width, height);
        this.weatherEffects = [];
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    addWeatherEffect(weatherEffect){
        if(this.weatherEffects.includes(weatherEffect)) return;

        this.weatherEffects.push(weatherEffect);
    }

    draw(ctx, camera) {
        // Base implementation - to be overridden by subclasses
        
    }

    drawWeatherEffects(ctx, camera){
        for(const weatherEffect of this.weatherEffects){
            weatherEffect.draw(ctx, camera);
        }
    }

    update(deltaT){
        for(const weatherEffect of this.weatherEffects){
            weatherEffect.update(deltaT);
        }
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    randomInt(min, max) {
        return Math.floor(this.randomRange(min, max));
    }
}

// Meadows-specific background implementation
export class MeadowsBackground extends Background {
    static FLOWER_COLORS = ["#FF6BAA", "#FFD35C", "#F4A261", "#D46B9A", "#A9D973"];
    static FLOWER_CENTER_COLORS = ["#FFF3A3", "#F7E176", "#FFE09C"];
    static STEM_COLOR = "#2F6A2D";
    static ROCK_COLORS = ["#8B4513", "#696969", "#4B4C48"];

    constructor(width, height) {
        super(width, height);
    }

    setSize(width, height) {
        super.setSize(width, height);
        this.grassColor = "#4A8B2F";
        this.patchColor = "#6EB94E";
        let patchScale = 100000;
        let flowerScale = 60000;
        let rockScale = 500000;
        // Initialize patches, flowers, and rocks
        this.patches = this.generatePatches((width*height)/patchScale);
        this.flowers = this.generateFlowers((width*height)/flowerScale);
        this.rocks = this.generateRocks((width*height)/rockScale);
    }

    generatePatches(count) {
        const patches = [];

        for (let i = 0; i < count; i++) {
            const patchWidth = this.randomInt(this.width * 0.12, this.width * 0.30);
            const patchHeight = this.randomInt(this.height * 0.08, this.height * 0.18);
            const x = this.randomInt(0, Math.max(0, this.width - patchWidth));
            const y = this.randomInt(0, Math.max(0, this.height - patchHeight));
            const color = lightenColor(this.patchColor, this.randomInt(6, 18));

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
            const petalColor = MeadowsBackground.FLOWER_COLORS[this.randomInt(0, MeadowsBackground.FLOWER_COLORS.length)];
            const centerColor = MeadowsBackground.FLOWER_CENTER_COLORS[this.randomInt(0, MeadowsBackground.FLOWER_CENTER_COLORS.length)];
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

    generateRocks(count) {
        const rocks = [];

        for (let i = 0; i < count; i++) {
            // Rocks are generally placed on the ground level
            const x = this.randomInt(20, Math.max(0, this.width - 20));
            const y = this.randomInt(20, this.height -20); // Constrain Y to lower part of background
            const width = this.randomInt(15, 40);
            const height = this.randomInt(10, 30);
            // Pick a random rock color
            const color = MeadowsBackground.ROCK_COLORS[this.randomInt(0, MeadowsBackground.ROCK_COLORS.length)];

            rocks.push({ x, y, width: width, height: height, color });
        }

        return rocks;
    }

    draw(ctx, camera) {
        const cameraPos = camera && typeof camera.getPosition === "function" ? camera.getPosition() : camera;

        // 1. Draw Grass/Background base
        drawRectangle(ctx, cameraPos, { x: 0, y: 0 }, this.width, this.height, this.grassColor);

        // 2. Draw patches (e.g., bushes)
        for (const patch of this.patches) {
            drawRectangle(ctx, cameraPos, { x: patch.x, y: patch.y }, patch.width, patch.height, patch.color, { x: 0, y: 0 }, false);
        }

        // 3. Draw rocks (underneath other elements)
        for (const rock of this.rocks) {
            drawRectangle(ctx, cameraPos, { x: rock.x, y: rock.y }, rock.width, rock.height, rock.color);
        }

        // 4. Draw flowers
        for (const flower of this.flowers) {
            this.drawFlower(ctx, cameraPos, flower);
        }
    }

    drawFlower(ctx, cameraPos, flower) {
        const stemX = flower.pos.x - flower.stemWidth / 2;
        // Adjust start Y to account for potential rock/patch coverage if necessary, but keeping original logic for now.
        const stemY = flower.pos.y; 
        drawRectangle(ctx, cameraPos, { x: stemX, y: stemY }, flower.stemWidth, flower.stemHeight, MeadowsBackground.STEM_COLOR);

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
}

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

// Forest-specific background implementation
export class ForestBackground extends Background {
    static FOLIAGE_COLORS = ["#1E4D2B", "#60ca32", "#415c2a"]; // Dark to medium greens
    static TRUNK_COLORS = ["#654321", "#8B4513", "#966F4D"];   // Browns
    static UNDERGROWTH_COLOR = "#4F6E48";

    constructor(width, height) {
        super(width, height);
    }

    setSize(width, height) {
        super.setSize(width, height);
        this.forestHeightScale = 100000;
        let treeScale = 300000; // Trees are large features
        let undergrowthScale = 50000;

        // Initialize elements by dividing the area based on their scale factors
        this.trees = this.generateTrees((width * height) / treeScale);
        this.undergrowth = this.generateUndergrowth((width * height) / undergrowthScale);
    }

    /**
     * Generates random trees in the forest. (MODIFIED: Increased size ranges)
     * @param {number} count - The number of trees to generate.
     * @returns {Array<Object>} An array of tree objects.
     */
    generateTrees(count) {
        const trees = [];
        for (let i = 0; i < count; i++) {
            // Trees are generally placed in the lower half and shouldn't be too close to edges
            const x = this.randomInt(20, Math.max(0, this.width - 20));
            const y = this.randomInt(this.height * 0.05, this.height - 20); 
            // INCREASED RANGE: Height now up to 350 pixels for massive trees
            const height = this.randomInt(160, 700); 
            // INCREASED RANGE: Width/base size up to 40 pixels
            const width = this.randomInt(40, 80);    

            trees.push({
                x: x,
                y: y,
                width: width,
                height: height,
                canopyColor: ForestBackground.FOLIAGE_COLORS[this.randomInt(0, ForestBackground.FOLIAGE_COLORS.length)],
                trunkColor: ForestBackground.TRUNK_COLORS[this.randomInt(0, ForestBackground.TRUNK_COLORS.length)]
            });
        }
        return trees;
    }

    /**
     * Generates random patches of undergrowth/bushes on the forest floor.
     * @param {number} count - The number of undergrowth patches to generate.
     * @returns {Array<Object>} An array of undergrowth patch objects.
     */
    generateUndergrowth(count) {
        const undergrowths = [];

        for (let i = 0; i < count; i++) {
            // Place undergrowth in the lower third of the screen
            const x = this.randomInt(20, Math.max(0, this.width - 20));
            const y = this.randomInt(20, this.height - 20);
            const width = this.randomInt(30, 80);
            const height = this.randomInt(15, 40);

            undergrowths.push({ x, y, width, height, color: ForestBackground.UNDERGROWTH_COLOR });
        }

        return undergrowths;
    }

    draw(ctx, camera) {
        const cameraPos = camera && typeof camera.getPosition === "function" ? camera.getPosition() : camera;

        // 1. Draw Ground Base (Forest Floor Grass/Dirt)
        drawRectangle(ctx, cameraPos, { x: 0, y: 0 }, this.width, this.height, "#55773D"); // General forest floor color

        // 2. Draw undergrowth (Foreground elements)
        for (const patch of this.undergrowth) {
            drawRectangle(ctx, cameraPos, { x: patch.x, y: patch.y }, patch.width, patch.height, patch.color);
        }


        // 3. Draw trees (Canopy on top of ground/undergrowth)
        for (const tree of this.trees) {
            this.drawTree(ctx, cameraPos, tree);
        }
    }

    /**
     * Draws a single tree structure.
     */
    drawTree(ctx, cameraPos, tree) {
        // Draw Trunk
        const trunkWidth = tree.width * 0.4;
        const trunkX = tree.x - trunkWidth / 2;
        // The trunk starts slightly above the ground base (y=height-y offset)
        const canopyRadius = Math.max(tree.width / 2, tree.height / 3);
        drawRectangle(ctx, cameraPos, { x: trunkX, y: tree.y + canopyRadius }, trunkWidth, tree.height * 0.6, tree.trunkColor);

        drawCircle(ctx, cameraPos, { x: tree.x, y: tree.y }, canopyRadius, tree.canopyColor);

        // Optional: Draw subtle ground shadow/base for the tree
        drawRectangle(ctx, cameraPos, { x: tree.x - tree.width / 2, y: tree.y + tree.height * 0.6 }, tree.width, 10, 'rgba(0, 0, 0, 0.1)');
    }
}

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