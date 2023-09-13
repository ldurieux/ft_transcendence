
export class Ball {
    private x: number;
    private y: number;
    private radius: number;
    private speed: number;
    private vectorRadians: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.speed = 0;
        this.vectorRadians = 0;
    }

    ballInit(screen: Screen) {
        this.x = screen.width / 2;
        this.y = screen.height / 2;
        this.radius = 10;
        this.speed = 5;
        const rad = Math.random() * Math.PI * 2;
        if (rad > Math.PI / 4 && rad < Math.PI * 3 / 4)
           this.vectorRadians = rad + Math.PI / 2;
        else if (rad > Math.PI * 5 / 4 && rad < Math.PI * 7 / 4)
            this.vectorRadians = rad + Math.PI / 2;
        else
            this.vectorRadians = rad;
    }

    getBallData() {
        return (
            JSON.stringify({Ballx: this.x, Bally: this.y, rad: this.radius, speed: this.speed, vcRad: this.vectorRadians})
        );
    }

    // checkCollision(screen: Screen, paddle1: Paddle, paddle2: Paddle) {
    //     if (this.x - this.radius <= 0)
    //     {
    //         return (1);
    //     }
    //     if (this.x + this.radius >= screen.width)
    //     {
    //         return (2);
    //     }
    //     if (this.y - this.radius <= 0 || this.y + this.radius >= screen.height)
    //     {
    //         this.vectorRadians = Math.PI * 2 - this.vectorRadians + 180;
    //     }
    //     if (this.x - this.radius <= paddle2.x + paddle2.width / 2 && this.y > paddle2.y - paddle2.height / 2 && this.y < paddle2.y + paddle2.height / 2)
    //     {
    //         this.vectorRadians = Math.PI * 2 - this.vectorRadians + 180;
    //         this.speed = this.speed * 1.1;
    //     }
    //     if (this.x + this.radius >= paddle1.x - paddle1.width / 2 && this.y > paddle1.y - paddle1.height / 2 && this.y < paddle1.y + paddle1.height / 2)
    //     {
    //         this.vectorRadians = Math.PI * 2 - this.vectorRadians + 180;
    //         this.speed = this.speed * 1.1;
    //     }
    //     return (0);
    // }

    moveBall() {
        this.x += Math.cos(this.vectorRadians) * this.speed;
        this.y += Math.sin(this.vectorRadians) * this.speed;
    }
}

export class Paddle {
    public y: number;
    public width: number;
    private height: number;
    private paddleSpeed: number;

    constructor() {
        this.y = 0;
        this.height = 100
        this.width = 5;
        this.paddleSpeed = 0.5;
    }

    paddleInit(screen: Screen) {
        this.y = screen.height / 2;
    }

    getPaddleData() {
        return (
            JSON.stringify({Paddley: this.y, Paddlewidth: this.width, Paddleheight: this.height})
        );
    }

    movePaddle(direction:number) {
        if (direction === 1)
        {
            if (this.y - this.paddleSpeed <= this.height / 2)
                this.y = this.height / 2;
            else
                this.y -= this.paddleSpeed;
        }
        if (direction === -1)
        {
            if (this.y + this.paddleSpeed >= screen.height - this.height / 2)
                this.y = screen.height - this.height / 2;
            else
                this.y += this.paddleSpeed;
        }
    }
}

export class Player {
    private score: number;
    private playerId: number;
    public paddle: Paddle;

    constructor() {
        this.score = 0;
        this.paddle = new Paddle();
    }

    getPlayerId() {
        return (this.playerId);
    }

    setPlayerId(id: number) {
        this.playerId = id;
    }

    getScore() {
        return (this.score);
    }

    getScoreData() {
        return (
            JSON.stringify({score: this.score})
        );
    }

    updateScore() {
        this.score++;
    }
}

export class Game {
    public player1: Player;
    public player2: Player;
    public ball: Ball;
    private screen: Screen;
    private typeOfGame: number;

    constructor() {
        this.player1 = new Player();
        this.player2 = new Player();
        this.ball = new Ball();
        this.screen = {
            width: 1000,
            height: 1000,
        };
    }

    gameInit(typeOfGame: number, player1Id: number, player2Id: number) {
        this.player1.setPlayerId(player1Id);
        this.player2.setPlayerId(player2Id);
        this.player1.paddle.paddleInit(this.screen);
        this.player2.paddle.paddleInit(this.screen);
        this.ball.ballInit(this.screen);
        this.typeOfGame = typeOfGame;
    }

    getGameData() {
        return (
            ({player1: this.player1.getScoreData(), player2: this.player2.getScoreData(), ball: this.ball.getBallData(), screen: JSON.stringify(this.screen)})
        );
    }

    getPlayer1Data() {
        return (
            ({ball: this.ball.getBallData(), paddle2: this.player2.paddle.getPaddleData()})
        );
    }

    movePaddle(playerId: number, direction: number) {
        if (playerId === this.player1.getPlayerId())
            this.player1.paddle.movePaddle(direction);
        else if (playerId === this.player2.getPlayerId())
            this.player2.paddle.movePaddle(direction);
    }
}

export interface Screen {
    width: number;
    height: number;
}