import { drawCircle, drawRectangle } from "../utility.js";
import Background from "./background.js";

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