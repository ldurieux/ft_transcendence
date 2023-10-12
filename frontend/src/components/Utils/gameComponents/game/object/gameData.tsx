export class Ball {
    public x: number;
    public y: number;
    public radius: number;
    public color: string;

    setBall(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    setColor(color: string) {
        this.color = color;
    }

    getRadius() {
        return this.radius;
    }

    drawBall(ball: HTMLElement, cssElement: HTMLElement, screen: Screen) {
        const left = (this.x) * cssElement.offsetWidth / screen.width;
        const top = ((screen.height - this.y) * (cssElement.offsetHeight) / screen.height);
        const width = this.radius * cssElement.offsetWidth / screen.width;
        const height = this.radius * cssElement.offsetHeight / screen.height;
        ball.style.left = `${left}px`;
        ball.style.top = `${top}px`;
        ball.style.width = `${width}px`;
        ball.style.height = `${height}px`;
    }

    undrawBall(ball: HTMLElement) {
        this.x = 0;
        this.y = 0;
        this.radius = 0;
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
    public paddle: HTMLElement;

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

    drawPaddle(cssElement: HTMLElement, screen: Screen) {
            const width:number = this.width * cssElement.offsetWidth / screen.width;
            const left = (this.x * cssElement.offsetWidth / screen.width);
            const top:number = (cssElement.offsetHeight - this.y * cssElement.offsetHeight / screen.height);
            const height:number = this.height * cssElement.offsetHeight / screen.height;
            this.paddle.style.left = `${left}px`;
            this.paddle.style.top = `${top}px`;
            this.paddle.style.width = `${width}px`;
            this.paddle.style.height = `${height}px`;
    }

    undrawPaddle() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.paddle.style.left = `0px`;
        this.paddle.style.top = `0px`;
        this.paddle.style.width = `0px`;
        this.paddle.style.height = `0px`;
    }
}