function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        // const rad = Math.random() * Math.PI * 2;
        // if (rad > Math.PI / 3 && rad < Math.PI * 2 / 3)
        //    this.vectorRadians = rad + Math.PI / 2;
        // else if (rad > Math.PI * 5 / 4 && rad < Math.PI * 7 / 4)
        //     this.vectorRadians = rad + Math.PI / 2;
        // else if(rad > Math.PI * 5 / 6 && rad < Math.PI * 7 / 6)
        //     this.vectorRadians = rad + Math.PI / 2;
        // else
        //     this.vectorRadians = rad;
        const rad = Math.PI;
    }

    getBallData() {
        return ({x: this.x, y: this.y, radius: this.radius});
    }
    checkCollision(screen: Screen, paddle1: Paddle, paddle2: Paddle) {
        if (this.x - this.radius <= 0)
            return (2);
        if (this.x + this.radius >= screen.width)
            return (1);
        if (this.y - this.radius <= 0 || this.y + this.radius >= screen.height)
        {
            this.vectorRadians = Math.PI * 2 - this.vectorRadians;
            return (3);
        }
        if (this.x - this.radius <= paddle2.x &&
            this.y < paddle2.y &&
            this.y > paddle2.y - paddle2.height)
        {
            this.vectorRadians = Math.PI - this.vectorRadians;
            this.speed = this.speed + 1;
            return (3);
        }
        if (this.x + this.radius >= paddle1.x &&
            this.y < paddle1.y &&
            this.y > paddle1.y - paddle1.height)
        {
            this.vectorRadians = Math.PI - this.vectorRadians;
            this.speed = this.speed + 1;
            return (3);
        }
        return (0);
    }

    moveBall() {
        this.x += Math.cos(this.vectorRadians) * this.speed;
        this.y += Math.sin(this.vectorRadians) * this.speed;
    }
}

export class Paddle {
    y: number;
    x: number;
    public width: number;
    height: number;
    private paddleSpeed: number;
    movingPaddle: number;

    constructor() {
        this.y = 0;
        this.height = 200
        this.width = 10;
        this.paddleSpeed = 20;
    }

    paddleInit(screen: Screen, paddlePlayer: number) {
        this.y = screen.height / 2 + this.height / 2;
        if (paddlePlayer === 1)
            this.x = (screen.width - 20) - this.width / 2;
        else if (paddlePlayer === 2)
            this.x = 20;
    }

    getPaddleData() {
        return ({x: this.x, y: this.y, width: this.width, height: this.height});
    }

    async movePaddle(direction:number, socket1: any, socket2: any, paddlePlayer: number, screen: Screen) {
        this.movingPaddle = 1;
        if (direction === 1)
        {
            while (this.movingPaddle)
            {
                if (this.y + this.paddleSpeed >= screen.height)
                    this.y = screen.height;
                else
                    this.y += this.paddleSpeed;
                if (socket1 !== null)
                    socket1.send(JSON.stringify({type: 'paddlePos', paddle: this.getPaddleData(), paddlePlayer: paddlePlayer, screen: screen}));
                if (socket2 !== null)
                    socket2.send(JSON.stringify({type: 'paddlePos', paddle: this.getPaddleData(), paddlePlayer: paddlePlayer, screen: screen}));
                await wait(40);
                console.log("paddle data up = ", this.getPaddleData());
            }
        }
        else if (direction === -1)
        {
            while(this.movingPaddle)
            {
                if ((this.y - this.height) - this.paddleSpeed <= 0)
                    this.y = this.height;
                else
                    this.y -= this.paddleSpeed;
                if (socket1 !== null)
                    socket1.send(JSON.stringify({type: 'paddlePos', paddle: this.getPaddleData(), paddlePlayer: paddlePlayer, screen: screen}));
                if (socket2 !== null)
                    socket2.send(JSON.stringify({type: 'paddlePos',  paddle: this.getPaddleData(), paddlePlayer: paddlePlayer, screen: screen}));
                await wait(40);
                console.log("paddle data down = ", this.getPaddleData());
            }
        }
    }

    async stopPaddle() {
        this.movingPaddle = 0;
    }
}

export class Player {
    private score: number;
    private playerId: number;
    public paddle: Paddle;
    private winner: boolean;

    constructor() {
        this.score = 0;
        this.paddle = new Paddle();
        this.winner = false;
    }

    destroyPlayer() {
        delete this.paddle;
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

    updateScore() {
        this.score++;
    }

    getWinner() {
        return (this.winner);
    }

    setWinner(winner: boolean) {
        this.winner = winner;
    }
}

export class Game {
    public player1: Player;
    public player2: Player;
    public ball: Ball;
    private screen: Screen;
    typeOfGame: number;

    constructor() {
        this.player1 = new Player();
        this.player2 = new Player();
        this.ball = new Ball();
        this.screen = {
            width: 1000,
            height: 1000,
        };
    }

    destroyGame() {
        this.player1.destroyPlayer();
        this.player2.destroyPlayer();
        delete this.player1;
        delete this.player2;
        delete this.ball;
    }

    async gameInit(player1Id: number, player2Id: number, socket1: any, socket2: any) {
        await this.player1.setPlayerId(player1Id);
        await this.player2.setPlayerId(player2Id);
        await this.player1.paddle.paddleInit(this.screen, 1);
        await this.player2.paddle.paddleInit(this.screen, 2);
        await this.ball.ballInit(this.screen);
        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'initBoard', ball: this.ball.getBallData(), paddle1: this.player1.paddle.getPaddleData(), paddle2: this.player2.paddle.getPaddleData(), screen: this.screen}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'initBoard', ball: this.ball.getBallData(), paddle2: this.player2.paddle.getPaddleData(), paddle1: this.player1.paddle.getPaddleData(), screen: this.screen}));
    }

    async getTypeOfGame() {
        return (this.typeOfGame);
    }

    async movePaddle(playerId: number, direction: number, socket1: WebSocket, socket2: WebSocket) {
        if (playerId === this.player1.getPlayerId())
            await this.player1.paddle.movePaddle(direction, socket1, socket2, 1, this.screen);
        if (playerId === this.player2.getPlayerId())
            await this.player2.paddle.movePaddle(direction, socket1, socket2, 2, this.screen);
    }

    async stopPaddle(playerId: number) {
        if (playerId === this.player1.getPlayerId())
            await this.player1.paddle.stopPaddle();
        else if (playerId === this.player2.getPlayerId())
            await this.player2.paddle.stopPaddle();
    }

    async checkIfWinner(player: Player, socket1: WebSocket, socket2: WebSocket): Promise<boolean> {

        player.updateScore();

        if (player.getScore() >= 5)
            return (true);
        return (false);
    }

    async getScreen() {
        return (this.screen);
    }

    async boardReset(socket1: any, socket2: any) {
        this.ball.ballInit(this.screen);
        console.log(this.player1.getScore(), this.player2.getScore());
        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'updateScore', score1: this.player1.getScore(), score2: this.player2.getScore()}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'updateScore', score2: this.player2.getScore(), score1: this.player1.getScore()}));
    }

    async moveBall() {
        this.ball.moveBall();
    }

    async checkCollision(socket1: WebSocket, socket2: WebSocket): Promise<boolean> {
        const collision = this.ball.checkCollision(this.screen, this.player1.paddle, this.player2.paddle);
        if (collision === 1)
        {
            if (await this.checkIfWinner(this.player1, socket1, socket2) === true)
            {
                this.player1.setWinner(true);
                this.player2.setWinner(false);
                return (false);
            }

            this.boardReset(socket1, socket2);
        }
        else if (collision === 2)
        {
            if (await this.checkIfWinner(this.player2, socket1, socket2) === true)
            {
                this.player2.setWinner(true);
                this.player1.setWinner(false);
                return (false);
            }
            this.boardReset(socket1, socket2);
        }
        return (true);
    }

    async sendBallPos(socket1: any, socket2: any) {
        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'ballPos', ball: this.ball.getBallData(), screen: this.screen}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'ballPos', ball: this.ball.getBallData(), screen: this.screen}));
    }

    async gameEffect(socket1: any, socket2: any)
    {
        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'gameEffect'}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'gameEffect'}));
    }

    async setWinner(playerId: number) {
        if (playerId === this.player1.getPlayerId())
            this.player1.setWinner(true);
        else if (playerId === this.player2.getPlayerId())
            this.player2.setWinner(true);
    }

    async whoWin(): Promise<Player> {
        if (this.player1.getWinner() === true)
            return (this.player1);
        else if (this.player2.getWinner() === true)
            return (this.player2);
        return (null);
    }

    async whoLose(): Promise<Player> {
        if (this.player1.getWinner() === false)
            return (this.player1);
        else if (this.player2.getWinner() === false)
            return (this.player2);
        return (null);
    }

    async playerDisconnect(playerId: number) {
        if (playerId === this.player1.getPlayerId())
        {
            this.player2.setWinner(true);
            this.player1.setWinner(false);
        }
        else if (playerId === this.player2.getPlayerId())
        {
            this.player1.setWinner(true);
            this.player2.setWinner(false);
        }
    }

    async getPaddlePos(playerId: number) {
        if (playerId === this.player1.getPlayerId())
            return (this.player1.paddle.getPaddleData());
        else if (playerId === this.player2.getPlayerId())
            return (this.player2.paddle.getPaddleData());
        return (null);
    }
}

export interface Screen {
    width: number;
    height: number;
}