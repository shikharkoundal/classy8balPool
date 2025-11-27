// script/input/Mouse.js

class MouseInput {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.left = { pressed: false, released: false };
        this.canvas = null;
        this.gsm = null; // <-- ADD THIS
    }

    // We pass gsm when attaching mouse
    attach(canvas, gsm) {
        this.canvas = canvas;
        this.gsm = gsm;

        // -----------------------
        // MOUSE MOVE
        // -----------------------
        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            this.position.x = e.clientX - rect.left;
            this.position.y = e.clientY - rect.top;

            // forward to GSM
            if (this.gsm && this.gsm.handleMouseMove)
                this.gsm.handleMouseMove(this.position.x, this.position.y);
        });

        // -----------------------
        // MOUSE DOWN
        // -----------------------
        canvas.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return; // only left click

            this.left.pressed = true;
            this.left.released = false;

            if (this.gsm && this.gsm.handleMouseDown)
                this.gsm.handleMouseDown();
        });

        // -----------------------
        // MOUSE UP
        // -----------------------
        canvas.addEventListener("mouseup", (e) => {
            if (e.button !== 0) return;

            this.left.pressed = false;
            this.left.released = true;

            if (this.gsm && this.gsm.handleMouseUp)
                this.gsm.handleMouseUp();
        });
    }

    // Reset release flag each frame
    resetFrameState() {
        this.left.released = false;
    }
}

const Mouse = new MouseInput();
export default Mouse;
