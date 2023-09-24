export class Ball {
    protected x: number;
    protected y: number;
    protected radius: number;
    protected color: string;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.color = '';
    }

    setBallData(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    setBallColor(color: string) {
        this.color = color;
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();
    }
}