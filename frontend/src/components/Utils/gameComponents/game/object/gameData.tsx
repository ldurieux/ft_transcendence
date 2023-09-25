export class Ball {
    public x: number;
    public y: number;
    public radius: number;
    public color: string;

    constructor() {}

    setBall(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    setColor(color: string) {
        this.color = color;
    }
}

export interface Screen {
    width: number;
    height: number;
}

export class Player {
    public id:number;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public color: string;
    public score: number;

    constructor() {}

    setPaddlePosition(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setColor(color: string) {
        this.color = color;
    }

    setScore(score: number) {
        this.score = score;
    }

    drawPaddle(paddle1: HTMLElement, paddle2: HTMLElement, cssElement: HTMLElement, screen: Screen, id:number) {
        if (id === 1)
        {
            const left = this.x * cssElement.offsetWidth / screen.width;
            const top = this.y * cssElement.offsetHeight / screen.height;
            paddle1.style.left = `${left}px`;
            paddle1.style.top = `${top}px`;
            paddle1.style.width = `${this.width}px`;
            paddle1.style.height = `${this.height}px`;
        }
        else if (id === 2)
        {
            const left = this.x * cssElement.offsetWidth / screen.width;
            const top = this.y * cssElement.offsetHeight / screen.height;
            paddle2.style.left = `${left}px`;
            paddle2.style.top = `${top}px`;
            paddle2.style.width = `${this.width}px`;
            paddle2.style.height = `${this.height}px`;
        }
    }
}