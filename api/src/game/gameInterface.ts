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
            JSON.stringify({Ballx: this.x, Bally: this.y, rad: this.radius})
        );
    }

    checkCollision(screen: Screen, paddle1: Paddle, paddle2: Paddle) {
        if (this.x - this.radius <= 0)
            return (2);
        if (this.x + this.radius >= screen.width)
            return (1);
        if (this.y - this.radius <= 0 || this.y + this.radius >= screen.height)
        {
            this.vectorRadians = Math.PI * 2 - this.vectorRadians + 180;
            return (3);
        }
        if (this.x - this.radius <= paddle2.x + paddle2.width / 2 && this.y > paddle2.y - paddle2.height / 2 && this.y < paddle2.y + paddle2.height / 2)
        {
            this.vectorRadians = Math.PI * 2 - this.vectorRadians + 180;
            this.speed = this.speed * 1.1;
            return (3);
        }
        if (this.x + this.radius >= paddle1.x - paddle1.width / 2 && this.y > paddle1.y - paddle1.height / 2 && this.y < paddle1.y + paddle1.height / 2)
        {
            this.vectorRadians = Math.PI * 2 - this.vectorRadians + 180;
            this.speed = this.speed * 1.1;
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
        this.height = 100
        this.width = 5;
        this.paddleSpeed = 0.5;
    }

    paddleInit(screen: Screen, paddlePlayer: number) {
        this.y = screen.height / 2;
        if (paddlePlayer === 1)
            this.x = screen.width - 20;
        else if (paddlePlayer === 2)
            this.x = 20;
    }

    getPaddleData() {
        return (
            JSON.stringify({Paddley: this.y, Paddlewidth: this.width, Paddleheight: this.height})
        );
    }


    movePaddle(direction:number, socket1: WebSocket, socket2: WebSocket, paddlePlayer: number) {
        this.movingPaddle = 1;
        if (direction === 1)
        {
            while (this.movingPaddle)
            {
                if (this.y - this.paddleSpeed <= this.height / 2)
                    this.y = this.height / 2;
                else
                    this.y -= this.paddleSpeed;
                socket1.send(JSON.stringify({type: 'paddlePos', data: {y: this.y, paddlePlayer: paddlePlayer}}))
                socket2.send(JSON.stringify({type: 'paddlePos', data: {y: this.y, paddlePlayer: paddlePlayer}}))
                wait(4);
            }
        }
        if (direction === -1)
        {
            while(this.movingPaddle)
            {
                if (this.y + this.paddleSpeed >= screen.height - this.height / 2)
                    this.y = screen.height - this.height / 2;
                else
                    this.y += this.paddleSpeed;
                socket1.send(JSON.stringify({type: 'paddlePos', data: {y: this.y, paddlePlayer: paddlePlayer}}))
                socket2.send(JSON.stringify({type: 'paddlePos', data: {y: this.y, paddlePlayer: paddlePlayer}}))
                wait(4);
            }
        }
    }
    stopPaddle() {
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

    async gameInit(player1Id: number, player2Id: number, socket1: WebSocket, socket2: WebSocket) {
        this.player1.setPlayerId(player1Id);
        this.player2.setPlayerId(player2Id);
        this.player1.paddle.paddleInit(this.screen, 1);
        this.player2.paddle.paddleInit(this.screen, 2);
        this.ball.ballInit(this.screen);
        socket1.send(JSON.stringify({type: 'gameStart', data: {player1: this.player1.getScoreData(), player2: this.player2.getScoreData(), ball: this.ball.getBallData(), screen: JSON.stringify(this.screen)}}));
        socket2.send(JSON.stringify({type: 'gameStart', data: {player1: this.player2.getScoreData(), player2: this.player1.getScoreData(), ball: this.ball.getBallData(), screen: JSON.stringify(this.screen)}}));
    }

    async getTypeOfGame() {
        return (this.typeOfGame);
    }

    async getGameData() {
        return (
            ({player1: this.player1.getScoreData(), player2: this.player2.getScoreData(), ball: this.ball.getBallData(), screen: JSON.stringify(this.screen)})
        );
    }

    async getPlayerData(playerId: number) {
        if (playerId === this.player1.getPlayerId())
            return (this.player1.getScoreData());
        if (playerId === this.player2.getPlayerId())
            return (this.player2.getScoreData());
    }

    async movePaddle(playerId: number, direction: number, socket1: WebSocket, socket2: WebSocket) {
        if (playerId === this.player1.getPlayerId())
            this.player1.paddle.movePaddle(direction, socket1, socket2, 1);
        if (playerId === this.player2.getPlayerId())
            this.player2.paddle.movePaddle(direction, socket1, socket2, 2);
    }

    async stopPaddle(playerId: number) {
        if (playerId === this.player1.getPlayerId())
            this.player1.paddle.stopPaddle();
        else if (playerId === this.player2.getPlayerId())
            this.player2.paddle.stopPaddle();
    }

    async playerScore(player: Player, socket1: WebSocket, socket2: WebSocket): Promise<number> {
        player.updateScore();
        if (player.getScore() === 5)
            return (1);
        return (0);
    }

    async boardReset(socket1: WebSocket, socket2: WebSocket) {
        this.ball.ballInit(this.screen);
        socket1.send(JSON.stringify({type: 'boardReset', data: {player1: this.player1.getScoreData(), player2: this.player2.getScoreData(), ball: this.ball.getBallData(), screen: JSON.stringify(this.screen)}}));
        socket2.send(JSON.stringify({type: 'boardReset', data: {player1: this.player1.getScoreData(), player2: this.player2.getScoreData(), ball: this.ball.getBallData(), screen: JSON.stringify(this.screen)}}));
    }

    async moveBall() {
        this.ball.moveBall();
    }

    async checkCollision(socket1: WebSocket, socket2: WebSocket): Promise<boolean> {
        const collision = this.ball.checkCollision(this.screen, this.player1.paddle, this.player2.paddle);
        if (collision === 1)
        {
            if (await this.playerScore(this.player1, socket1, socket2) === 1)
            {
                this.player1.setWinner(true);
                this.player2.setWinner(false);
                return (false);
            }
            this.boardReset(socket1, socket2);
        }
        else if (collision === 2)
        {
            if (await this.playerScore(this.player2, socket1, socket2) === 1)
            {
                this.player2.setWinner(true);
                this.player1.setWinner(false);
                return (false);
            }
            this.boardReset(socket1, socket2);
        }
        else if (collision === 3)
        {
            this.ball.moveBall();
        }
        return (true);
    }

    async sendBallPos(socket1: WebSocket, socket2: WebSocket) {
        socket1.send(JSON.stringify({type: 'ballPos', data: {ball: this.ball.getBallData()}}));
        socket2.send(JSON.stringify({type: 'ballPos', data: {ball: this.ball.getBallData()}}));
    }

    async gameEffect(activeGameEffect: boolean, socket1: WebSocket, socket2: WebSocket)
    {
        const gameEffect: number = Math.floor(Math.random() * 4);
        socket1.send(JSON.stringify({type: 'gameEffect', data: {gameEffect: gameEffect}}));
        socket2.send(JSON.stringify({type: 'gameEffect', data: {gameEffect: gameEffect}}));
    }

    async releaseGameEffect(activeGameEffect: boolean, socket1: WebSocket, socket2: WebSocket)
    {
        if (activeGameEffect === false)
            return;
        socket1.send(JSON.stringify({type: 'releaseGameEffect'}));
        socket2.send(JSON.stringify({type: 'releaseGameEffect'}));
        activeGameEffect = false;
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
            this.player2.setWinner(true);
        else if (playerId === this.player2.getPlayerId())
            this.player1.setWinner(true);
    }
}

export interface Screen {
    width: number;
    height: number;
}