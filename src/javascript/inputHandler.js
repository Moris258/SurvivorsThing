import { game } from "./game.js";

export default class InputHandler{
    constructor(camera) {
        this.cursorPos = {
            x: 0,
            y: 0,
        };
        this.camera = camera;
        this.keysPressed = {};


        document.addEventListener("keydown", event => {
            this.keysPressed[event.code] = true;
            
            game.handleKeyInput(event.code);
        })

        document.addEventListener("keyup", event => {
            this.keysPressed[event.code] = false;
        })

        document.addEventListener("wheel", event => {
            game.handleWheelInput(event.deltaY);
        });

        document.addEventListener("mousedown", event => {
            game.handleMouseClickInput(this.cursorPos);
        });

        document.addEventListener("mousemove", event => {
            this.cursorPos.x = event.clientX;
            this.cursorPos.y = event.clientY;
            game.handleMouseMoveInput(this.cursorPos);

        });
    }
}