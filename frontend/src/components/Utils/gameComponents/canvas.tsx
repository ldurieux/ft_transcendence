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
    width: number;
    height: number;
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

    resetBall(radianVector, speed) {
        this.ball.x = canvas.width/2;
        this.ball.y = canvas.height/2;
        this.ball.radianVector = radianVector;
        this.ball.speed = speed;
    }

    async move(ballData: BallData) {
        this.ball.x = ballData.x;
        this.ball.y = ballData.y;
        this.ball.radianVector = ballData.radianVector;
        this.updateSpeed(ballData.speed);
    }

    updateSpeed(speed: number) {
        this.ball.speed = speed / (originalScreen.width / screen.width + originalScreen.height / screen.height) * 2;
    }

    getBall() {
        return this.ball;
    }

    async render() {
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
        this.render();
    }
}

class Player {
    private paddle: PaddleData;
    private score: Score;

    constructor(paddle: PaddleData) {
        this.resetPaddle();
    }

    resetPaddle() {
        this.paddle.y = (canvas.height - this.paddle.height) / 2;
    }

    updatePaddle(paddleData: PaddleData) {
        this.paddle.x = paddleData.x;
        this.paddle.y = paddleData.y;
    }

    updatePaddleY(y: number) {
        this.paddle.y = y;
    }

    getPaddle() {
        return this.paddle;
    }

    updateScore(score: Score) {
        this.score = score;
    }
}


function Game(socket: WebSocket) {
    let me: Player;
    let opponent: Player;
    let ball: Ball;
    let data: Data;
    let gameStarted = false;
    let gameEnded = false;
}
