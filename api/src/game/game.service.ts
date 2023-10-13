function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class Ball {
    private x: number;
    private y: number;
    private radius: number;
    private speed: number;
    private vectorRadians: number;
    private maxSpeed: number;

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
        this.radius = 13;
        this.speed = 8;
        this.maxSpeed = 15;
        const rand = Math.floor(Math.random() * 3);
        if (rand === 0)
            this.vectorRadians = Math.PI / 4;
        else if (rand === 1)
            this.vectorRadians = Math.PI * 3 / 4;
        else if (rand === 2)
            this.vectorRadians = Math.PI * 5 / 4;
        else 
            this.vectorRadians = Math.PI * 7 / 4;
    }

    setBallX(x: number) {
        this.x = x;
    }

    updateSpeed() {
        if (this.speed < this.maxSpeed)
            this.speed = this.speed + 1;
    }

    getBallData() {
        return ({x: this.x, y: this.y, radius: this.radius});
    }

    getBallPos() {
        return (this.x, this.y);
    }

    setVectorRadians(vector: number) {
        this.vectorRadians = vector;
    }

    getVectorRadians() {
        return (this.vectorRadians);
    }

    boardCollision(screen: Screen, paddle1: Paddle, paddle2: Paddle) {
        if (this.y - this.radius <= 0 || this.y + this.radius > screen.height)
        {
            this.vectorRadians = Math.PI * 2 - this.vectorRadians;
            return (3);
        }
        else if (this.x + this.radius >= screen.width)
            return (2);
        else if (this.x - this.radius <= 0)
            return (1);
        return (0);
    }


    moveBall() {
        this.x += Math.cos(this.vectorRadians) * this.speed;
        this.y += Math.sin(this.vectorRadians) * this.speed;
    }
}

export class Paddle {
    public y: number;
    public x: number;
    public width: number;
    public height: number;
    public paddleSpeed: number;
    public movingPaddle: boolean;

    constructor() {
        this.y = 0;
        this.height = 200
        this.width = 20;
        this.paddleSpeed = 20;
        this.movingPaddle = true;
    }

    paddleInit(screen: Screen, paddlePlayer: number) {
        this.y = screen.height / 2 + this.height / 2;
        if (paddlePlayer === 1)
            this.x = (screen.width - 20) - this.width;
        else if (paddlePlayer === 2)
            this.x = 20;
    }

    getPaddleData() {
        return ({x: this.x, y: this.y, width: this.width, height: this.height});
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

    setScore(score: number) {
        this.score = score;
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
        this.score += 1;
    }

    getWinner() {
        return (this.winner);
    }

    setWinner(winner: boolean) {
        this.winner = winner;
    }

    isInsidePaddle(x: number, y: number, ballRadius: number) {
        if (x >= this.paddle.x && x <= this.paddle.x + this.paddle.width && y - ballRadius <= this.paddle.y && y + ballRadius >= this.paddle.y - this.paddle.height)
            return ((y - (this.paddle.y - this.paddle.height / 2)) / (this.paddle.height / 2));
        return (null);
    }


    async movePaddle(direction: number, socket1: any, socket2: any, screen: Screen) {
        const move = this.paddle.paddleSpeed * direction;
        this.paddle.movingPaddle = true;
        while (this.paddle.movingPaddle)
        {
            this.paddle.y += move;
            if (this.paddle.y + move >= screen.height)
            {
                this.paddle.movingPaddle = false;
                this.paddle.y = screen.height;
            }
            else if ((this.paddle.y - this.paddle.height) <= 0)
            {
                this.paddle.movingPaddle = false;
                this.paddle.y = this.paddle.height;
            }
            if (socket1 !== null)
                socket1.send(JSON.stringify({type: 'paddlePos', paddle: this.paddle.getPaddleData(), paddlePlayer: this.playerId, screen: screen}));
            if (socket2 !== null)
                socket2.send(JSON.stringify({type: 'paddlePos', paddle: this.paddle.getPaddleData(), paddlePlayer: this.playerId, screen: screen}));
            await wait(16);
        }
    }

    stopPaddle() {
        this.paddle.movingPaddle = false;
    }
}

export class Game {
    public player1: Player;
    public player2: Player;
    public ball: Ball;
    private screen: Screen;
    private ballEffect: boolean;
    typeOfGame: number;
    private collision: boolean;

    constructor() {
        this.player1 = new Player();
        this.player2 = new Player();
        this.ball = new Ball();
        this.screen = {
            width: 1000,
            height: 1000,
        };
        this.ballEffect = false;
    }

    destroyGame() {
        this.player1.destroyPlayer();
        this.player2.destroyPlayer();
        delete this.player1;
        delete this.player2;
        delete this.ball;
    }

    async gameInit(player1Id: number, player2Id: number, socket1: any, socket2: any) {
        this.player1.setPlayerId(player1Id);
        this.player2.setPlayerId(player2Id);
        this.player1.paddle.paddleInit(this.screen, 1);
        this.player2.paddle.paddleInit(this.screen, 2);
        this.ball.ballInit(this.screen);
        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'initBoard', ball: this.ball.getBallData(), paddle1: this.player1.paddle.getPaddleData(), paddle2: this.player2.paddle.getPaddleData(), screen: this.screen, score1: this.player1.getScore(), score2: this.player2.getScore()}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'initBoard', ball: this.ball.getBallData(), paddle1: this.player2.paddle.getPaddleData(), paddle2: this.player1.paddle.getPaddleData(), screen: this.screen, score1: this.player1.getScore(), score2: this.player2.getScore()}));
    }

    async getTypeOfGame() {
        return (this.typeOfGame);
    }

    async movePaddle(playerId: number, direction: number, socket1: WebSocket, socket2: WebSocket) {
        if (playerId === this.player1.getPlayerId())
            this.player1.movePaddle(direction, socket1, socket2, this.screen);
        if (playerId === this.player2.getPlayerId())
            this.player2.movePaddle(direction, socket1, socket2, this.screen);
    }

    async stopPaddle(playerId: number) {
        if (playerId === this.player1.getPlayerId())
            this.player1.stopPaddle();
        else if (playerId === this.player2.getPlayerId())
            this.player2.stopPaddle();
    }

    async getPlayer(playerId: number): Promise<Player> {
        if (playerId === this.player1.getPlayerId())
            return (this.player1);
        else if (playerId === this.player2.getPlayerId())
            return (this.player2);
        return (null);
    }

    async checkIfWinner(player: Player, socket1: WebSocket, socket2: WebSocket): Promise<boolean> {
        this.ball.ballInit(this.screen);
        player.updateScore();

        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'updateScore', score1: this.player1.getScore(), score2: this.player2.getScore()}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'updateScore', score2: this.player2.getScore(), score1: this.player1.getScore()}));

        if (player.getScore() >= 6)
        {
            player.setWinner(true);
            return (false);
        }
        return (true);
    }

    async getScreen() {
        return (this.screen);
    }

    async moveBall() {
        this.ball.moveBall();
    }

    async checkPaddleCollision() {
        var colision: {relativePos:number, player:number} = {relativePos: null, player: null};
        colision.player = 1;
        colision.relativePos = this.player1.isInsidePaddle(this.ball.getBallData().x, this.ball.getBallData().y, this.ball.getBallData().radius);
        if (colision.relativePos === null)
        {
            colision.player = 2;
            colision.relativePos = this.player2.isInsidePaddle(this.ball.getBallData().x, this.ball.getBallData().y, this.ball.getBallData().radius);
        }
        if (colision.relativePos !== null)
        {
            var angle = colision.relativePos * (Math.PI * 3 / 4);
            if (colision.player === 1)
                angle = Math.PI - angle;
            this.ball.setVectorRadians(angle);
            this.ball.updateSpeed();
            this.collision = true;
        }
    }

    async checkBoardCollision(socket1: WebSocket, socket2: WebSocket): Promise<boolean> {
        const collision = this.ball.boardCollision(this.screen, this.player1.paddle, this.player2.paddle);
        if (collision)
            this.collision = true;
        if (collision === 1)
            return (await this.checkIfWinner(this.player1, socket1, socket2));
        else if (collision === 2)
            return (await this.checkIfWinner(this.player2, socket2, socket1));
        return (true);
    }

    async checkCollision(socket1:WebSocket, socket2:WebSocket): Promise<boolean> {
        await this.checkPaddleCollision();
        return (await this.checkBoardCollision(socket1, socket2));
    }

    async sendBallPos(socket1: WebSocket, socket2: WebSocket) {
        if (this.collision === false)
        {
            if (socket1 !== null && this.ballEffect === false)
                socket1.send(JSON.stringify({type: 'ballPos', ball: this.ball.getBallData(), screen: this.screen}));
            if (socket2 !== null && this.ballEffect === false)
                socket2.send(JSON.stringify({type: 'ballPos', ball: this.ball.getBallData(), screen: this.screen}));
        }
        this.collision = false;
    }

    async releaseGameEffect() {
        this.ballEffect = false;
    }

    async gameEffect(socket1: WebSocket, socket2: WebSocket)
    {
        this.ballEffect = !this.ballEffect;
        if (socket1 !== null && this.ballEffect === true)
            socket1.send(JSON.stringify({type: 'gameEffect'}));
        if (socket2 !== null && this.ballEffect === true)
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

    async getPaddlePos(playerId: number) {
        if (playerId === this.player1.getPlayerId())
            return (this.player1.paddle.getPaddleData());
        else if (playerId === this.player2.getPlayerId())
            return (this.player2.paddle.getPaddleData());
        return (null);
    }

    async reconnect(socket:WebSocket, playerId: number)
    {
        if (socket !== null && playerId === this.player1.getPlayerId())
            socket.send(JSON.stringify({type: 'initBoard', ball: this.ball.getBallData(), paddle1: this.player1.paddle.getPaddleData(), paddle2: this.player2.paddle.getPaddleData(), screen: this.screen, score1: this.player1.getScore(), score2: this.player2.getScore()}));
        else if (socket !== null && playerId === this.player2.getPlayerId())
            socket.send(JSON.stringify({type: 'initBoard', ball: this.ball.getBallData(), paddle1: this.player2.paddle.getPaddleData(), paddle2: this.player1.paddle.getPaddleData(), screen: this.screen, score1: this.player1.getScore(), score2: this.player2.getScore()}));
    }
}

export interface Screen {
    width: number;
    height: number;
}