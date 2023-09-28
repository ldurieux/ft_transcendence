export class Ball {
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    private ballEffect: boolean;

    constructor() {
        this.ballEffect = false;
    }

    setBall(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    setColor(color: string) {
        this.color = color;
    }

    getBallEffect() {
        return this.ballEffect;
    }

    setBallEffect() {
        this.ballEffect = !this.ballEffect;
    }

    drawBall(ball: HTMLElement, cssElement: HTMLElement, screen: Screen) {
        if (this.ballEffect === false)
        {
            const left = this.x * cssElement.offsetWidth / screen.width;
            const top = this.y * cssElement.offsetHeight / screen.height;
            ball.style.left = `${left}px`;
            ball.style.top = `${top}px`;
            ball.style.width = `${this.radius}px`;
            ball.style.height = `${this.radius}px`;
        }
    }

    undrawBall(ball: HTMLElement) {
        ball.style.left = `0px`;
        ball.style.top = `0px`;
        ball.style.width = `0px`;
        ball.style.height = `0px`;
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
            const width:number = this.width * cssElement.offsetWidth / screen.width;
            const right:number = this.x * cssElement.offsetWidth / screen.width - width;
            const top:number = cssElement.offsetHeight - this.y * cssElement.offsetHeight / screen.height;
            const height:number = this.height * cssElement.offsetHeight / screen.height;
            paddle1.style.left = `${right}px`;
            paddle1.style.top = `${top}px`;
            paddle1.style.width = `${width}px`;
            paddle1.style.height = `${height}px`;
        }
        else if (id === 2)
        {
            console.log('paddle2');
            const width:number = this.width * cssElement.offsetWidth / screen.width;
            const left:number = this.x * cssElement.offsetWidth / screen.width;
            const top:number = cssElement.offsetHeight - this.y * cssElement.offsetHeight / screen.height;
            const height:number = this.height * cssElement.offsetHeight / screen.height;
            paddle2.style.left = `${left}px`;
            paddle2.style.top = `${top}px`;
            paddle2.style.width = `${width}px`;
            paddle2.style.height = `${height}px`;
        }
    }
}