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

export function drawImage(ctx, camera, pos, width, height, pictureURL){
    pos = {x: pos.x - camera.x, y: pos.y - camera.y};
    let img = new Image(width, height);
    img.src = pictureURL;
    ctx.drawImage(img,  pos.x, pos.y, width, height );

}

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

export function randomInt(from, to){
    return Math.floor(from + Math.random() * (to - from));
}

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

export function pointsDistance(pos1, pos2){
    let distanceX = pos1.x - pos2.x;
    let distanceY = pos1.y - pos2.y;
    return Math.pow((distanceX * distanceX + distanceY * distanceY), 0.5);
}

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

export function normalizeVector(vector){
    let vectorSize = pointsDistance({x: 0, y:0}, vector);
    if(vectorSize == 0) vectorSize = 1;
    return {x: vector.x / vectorSize, y: vector.y / vectorSize};
}

export async function loadJSONFile(path){
    let response = await fetch(path);
    return await response.json();
}

export function moveTowards(target, origin, spread = 0){
    let dir = {x: target.x - origin.x, y: target.y - origin.y};
    dir = normalizeVector(dir);
    dir.x += randomInt(-spread, spread);
    dir.y += randomInt(-spread, spread);
    dir = normalizeVector(dir);

    return dir;
}