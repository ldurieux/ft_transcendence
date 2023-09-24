import { Paddle } from "./paddle.tsx";

interface Screen {
    width: number;
    height: number;
}

export class Game {
    protected gameId: number;
    myId: number;
    player1Score: number;
    player2Score: number;
    screen: Screen;
    paddle1: Paddle;
    paddle2: Paddle;

    constructor() {
        this.gameId = 0;
        this.myId = 0;
        this.player1Score = 0;
        this.player2Score = 0;
        this.paddle1 = new Paddle();
        this.paddle2 = new Paddle();
    }

    setGameId(gameId: number) {
        this.gameId = gameId;
    }

    setMyId(myId: number) {
        this.myId = myId;
    }

    getMyPaddle(id:number) {
        if (id === 1)
            return this.paddle1;
        else if (id === 2)
            return this.paddle2;
    }

    getMyScore(id:number) {
        if (id === 1)
            return this.player1Score;
        else if (id === 2)
            return this.player2Score;
    }

    getOpponentScore(id:number) {
        if (id === 1)
            return this.player2Score;
        else if (id === 2)
            return this.player1Score;
    }

    setScores(player1Score: number, player2Score: number) {
        this.player1Score = player1Score;
        this.player2Score = player2Score;
    }

    setScreenRef(screen: Screen) {
        this.screen = screen;
    }
}