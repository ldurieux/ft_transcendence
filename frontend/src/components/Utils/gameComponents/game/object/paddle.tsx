export class Paddle {
    paddleId: number;
    protected x: number;
    protected y: number;
    protected width: number;
    protected height: number;
    protected color: string;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.color = '';
    }

    setPaddleData(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setPaddleColor(color: string) {
        this.color = color;
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();
    }
}