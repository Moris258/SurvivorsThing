/**
 * Draws a rectangle on the canvas relative to the camera view.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {{x: number, y: number}} camera - The current camera position.
 * @param {{x: number, y: number}} pos - The center position of the rectangle.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @param {string} color - The fill color of the rectangle.
 * @param {{x: number, y: number}} [margin={x: 0, y: 0}] - Margin offset from the center position.
 * @param {boolean} [drawBorder=false] - Whether to draw a border around the rectangle.
 * @param {string} [borderColor="black"] - The color of the border.
 * @param {number} [borderSize=1] - The width of the border line.
 */
export function drawRectangle(ctx, camera, pos, width, height, color, margin = {x: 0, y: 0}, drawBorder = false, borderColor = "black", borderSize = 1){
    pos = {x: pos.x - camera.x, y: pos.y - camera.y};
    ctx.fillStyle = color;
    ctx.fillRect(pos.x - margin.x, pos.y - margin.y, width + margin.x * 2, height + margin.y * 2);
    if(drawBorder){
        ctx.beginPath();
        ctx.lineWidth = borderSize;
        ctx.strokeStyle = borderColor;
        ctx.rect(pos.x - margin.x, pos.y - margin.y, width + margin.x * 2, height + margin.y * 2);
        ctx.stroke();
    }
}

/**
 * Draws a circle on the canvas relative to the camera view.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {{x: number, y: number}} camera - The current camera position.
 * @param {{x: number, y: number}} pos - The center position of the circle.
 * @param {number} radius - The radius of the circle.
 * @param {string} color - The fill color of the circle.
 * @param {boolean} [drawBorder=false] - Whether to draw a border around the circle.
 * @param {string} [borderColor="black"] - The color of the border.
 * @param {number} [borderSize=1] - The width of the border line.
 */
export function drawCircle(ctx, camera, pos, radius, color, drawBorder = false, borderColor = "black", borderSize = 1){
    pos = {x: pos.x - camera.x, y: pos.y - camera.y};
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    if(drawBorder){
        ctx.lineWidth = borderSize;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
}

/**
 * Draws an image onto the canvas at a specific position, relative to the camera view.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {{x: number, y: number}} camera - The current camera position.
 * @param {{x: number, y: number}} pos - The top-left position of the image on the screen.
 * @param {number} width - The desired display width of the image.
 * @param {number} height - The desired display height of the image.
 * @param {string} pictureURL - The URL or path to the image file.
 */
export function drawImage(ctx, camera, pos, width, height, pictureURL){
    pos = {x: pos.x - camera.x, y: pos.y - camera.y};
    let img = new Image(width, height);
    img.src = pictureURL;
    ctx.drawImage(img,  pos.x, pos.y, width, height );

}

/**
 * Draws text on the canvas relative to the camera view.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {{x: number, y: number}} camera - The current camera position.
 * @param {{x: number, y: number}} pos - The anchor position for the text.
 * @param {string} text - The text content to display.
 * @param {string} color - The fill color of the text.
 * @param {number} [size=24] - The font size in pixels.
 * @param {boolean} [outline=false] - Whether to draw a stroke outline around the text.
 * @param {string} [outlineColor="black"] - The color of the outline.
 * @param {'center'|'left'|'right'} [align='center'] - Text alignment relative to the position.
 */
export function drawText(ctx, camera, pos, text, color, size = 24, outline = false, outlineColor = "black", align = "center"){
    pos = {x: pos.x - camera.x, y: pos.y - camera.y};

    ctx.font = size + "px serif";
    ctx.fontSize = size;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, pos.x, pos.y);
    if(outline){
        ctx.strokeStyle = outlineColor;
        ctx.strokeText(text, pos.x, pos.y);
    }
}

/**
 * Generates a random integer between two inclusive bounds (inclusive).
 * @param {number} from - The minimum possible integer value.
 * @param {number} to - The maximum possible integer value.
 * @returns {number} A random integer between `from` and `to`.
 */
export function randomInt(from, to){
    if(to < from){
        console.error("Upper bound of random lower than lower bound.");
        return;
    }
    return Math.floor(from + Math.random() * (to + 1 - from));
}

/**
 * Generates a random float between two bounds.
 * @param {number} from - The minimum possible float value (inclusive).
 * @param {number} to - The maximum possible float value (exclusive).
 * @returns {number} A random float between `from` and `to`.
 */
export function randomFloat(from, to){
    if(to < from){
        console.error("Upper bound of random lower than lower bound.");
        return;
    }
    return from + Math.random() * (to - from);
}

/**
 * Checks if two rectangular areas overlap on the canvas. Can check for side-only overlap.
 * @param {{x: number, y: number}} pos1 - Top-left position of the first rectangle.
 * @param {{x: number, y: number}} size1 - Dimensions (width and height) of the first rectangle.
 * @param {{x: number, y: number}} pos2 - Top-left position of the second rectangle.
 * @param {{x: number, y: number}} size2 - Dimensions (width and height) of the second rectangle.
 * @param {boolean} [sideOverlap=false] - If true, only checks for side overlap (touching edges). Otherwise, performs full intersection check.
 * @returns {boolean} True if the rectangles overlap or touch based on `sideOverlap`, false otherwise.
 */
export function checkOverlap(pos1, size1, pos2, size2, sideOverlap = false){
    let left1 = pos1.x;
    let right1 = pos1.x + size1.x;
    let top1 = pos1.y;
    let bottom1 = pos1.y + size1.y;
    let left2 = pos2.x;
    let right2 = pos2.x + size2.x;
    let top2 = pos2.y;
    let bottom2 = pos2.y + size2.y;
    if(sideOverlap){
        if(right1 > left2 && left1 < right2){
            if(bottom1 > top2 && top1 < bottom2){
                return true;
            }
        }
    }
    else{
        if(right1 >= left2 && left1 <= right2){
            if(bottom1 >= top2 && top1 <= bottom2){
                return true;
            }   
        }
    }
    
    return false;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {{x: number, y: number}} pos1 - The first point {x, y}.
 * @param {{x: number, y: number}} pos2 - The second point {x, y}.
 * @returns {number} The distance between the two points.
 */
export function pointsDistance(pos1, pos2){
    let distanceX = pos1.x - pos2.x;
    let distanceY = pos1.y - pos2.y;
    return Math.pow((distanceX * distanceX + distanceY * distanceY), 0.5);
}

/**
 * Finds the lowest value and its index within an array of numbers.
 * @param {number[]} numbers - An array of numbers to search through.
 * @returns {[number, number]} A tuple containing [lowest_value, index_of_lowest].
 */
export function findLowest(numbers){
    let lowest = -1;
    let index = 0;
    for(let i = 0; i < numbers.length; i++){
        if(i == 0){
            lowest = numbers[i];
            continue;
        }
        if(numbers[i] < lowest){
            lowest = numbers[i];
            index = i;
        }
    }

    return lowest, index;
}

/**
 * Normalizes a given vector (rescales it to have a magnitude of 1).
 * @param {{x: number, y: number}} vector - The vector to normalize.
 * @returns {{x: number, y: number}} The normalized vector. Returns {x: 1/size, y: 1/size} if original size is 0.
 */
export function normalizeVector(vector){
    let vectorSize = pointsDistance({x: 0, y:0}, vector);
    if(vectorSize == 0) vectorSize = 1;
    return {x: vector.x / vectorSize, y: vector.y / vectorSize};
}

/**
 * Fetches and parses content from a JSON file located at the given path.
 * @param {string} path - The full URL or path to the JSON file.
 * @returns {Promise<object>} A promise that resolves with the parsed JSON object.
 */
export async function loadJSONFile(path){
    let response = await fetch(path);
    return await response.json();
}

/**
 * Calculates a direction vector pointing towards the target, starting from the origin.
 * Incorporates random spread to introduce variability in movement.
 * @param {{x: number, y: number}} target - The destination coordinates.
 * @param {{x: number, y: number}} origin - The starting coordinates.
 * @param {number} [spread=0] - The magnitude of randomness applied to the direction vector.
 * @returns {{x: number, y: number}} A normalized direction vector from origin to target with added spread.
 */
export function moveTowards(target, origin, spread = 0){
    let dir = {x: target.x - origin.x, y: target.y - origin.y};
    dir = normalizeVector(dir);
    dir.x += randomFloat(-spread, spread);
    dir.y += randomFloat(-spread, spread);
    dir = normalizeVector(dir);

    return dir;
}