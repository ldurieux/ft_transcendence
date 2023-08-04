interface GameScreen {
    width: number;
    height: number;
}

interface Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    vectorRadians: number;
}

interface Paddle {
    y: number;
    width: number;
    height: number;
}

interface Score {
    player1Score: number;
    player2Score: number;
}

export interface PlayerId {
    player1Id: number;
    player2Id: number;
}

export interface PlayerReady {
    player1Ready: boolean;
    player2Ready: boolean;
}

export interface GameData {
    playerId: PlayerId;
    ball: Ball;
    paddle1: Paddle;
    paddle2: Paddle;
    score: Score;
    screen: GameScreen;
}

export interface playersWithReady {
    Players: PlayerId;
    Ready: PlayerReady;
}