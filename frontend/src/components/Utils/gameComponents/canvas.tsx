interface BallData {
    x: number;
    y: number;
    radianVector: number;
    speed: number;
    radius: number;
}

interface PaddleData {
    x: number;
    y: number;
}

interface Score {
    myScore: number;
    opponentScore: number;
}

interface Screen {
    width: number;
    height: number;
}

interface Data {
    ball: BallData;
    paddle1: PaddleData;
    paddle2: PaddleData;
    score1: Score;
    score2: Score;
    originalScreen: Screen;
}

let canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
let screen = {width: canvas.width, height: canvas.height};
let originalScreen: Screen;

export class Ball {
    private ball: BallData;

    constructor(ballData: BallData) {
        this.ball.x = ballData.x;
        this.ball.y = ballData.y;
        this.ball.radianVector = ballData.radianVector;
        this.ball.speed = ballData.speed;
        this.ball.radius = ballData.radius;
     }

    async updateBall(ballData: BallData) {
        this.ball.x = ballData.x;
        this.ball.y = ballData.y;
        this.ball.radianVector = ballData.radianVector;
        this.ball.speed = ballData.speed;
    }

    getBall() {
        return this.ball;
    }

    async drawBall() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    moveBall() {
        this.ball.x += this.ball.speed * Math.cos(this.ball.radianVector);
        this.ball.y += this.ball.speed * Math.sin(this.ball.radianVector);
    }
}

export class Paddle {
    private paddle: PaddleData;

    constructor(paddleData: PaddleData) {
        this.paddle.x = paddleData.x;
        this.paddle.y = paddleData.y;
    }

    async movePaddleUp() {
        this.paddle.y -= 7;
    }

    async movePaddleDown() {
        this.paddle.y += 7;
    }

    getPaddle() {
        return this.paddle;
    }

    async render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.paddle.x, this.paddle.y, 10, 75);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

