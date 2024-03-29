import React, { useEffect, useState, useMemo } from "react";
import "../../Styles/GameStyle.css";
import * as gameData from "./game/object/gameData.tsx"

export default function GameComponent() {
    const [score1, setScore1] = useState<number>(0);
    const [score2, setScore2] = useState<number>(0);
    const [whowin, setWhowin] = useState<string>("");
    const [pause, setPause] = useState<string>("");
    const [boardColor, setBoardColor] = useState<string>("black");

    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001/game`;

    var gameId = 0;
    var MyId = 0;
    var opponentId = 0;

    const gameSocket = useMemo(() => new WebSocket(url), [url]);
    const ballData = useMemo(() => new gameData.Ball(), []);
    const players = useMemo(() => new Map<number, gameData.Player>(), []);
    const screen = useMemo(() => new gameData.screen(), []);

    const redirect = () => {
        setTimeout(() => {
            window.location.href = "/lobby";
        }, 3000);
    }
    
    useEffect(() => {
        gameSocket.onopen = () => {
            const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
            gameSocket.send(JSON.stringify(baguette));
        };
        gameSocket.onclose = () => {};
        
        return () => {
            if (gameSocket.readyState === WebSocket.OPEN) {
                gameSocket.close();
            }
        };
    }, [gameSocket]);

    useEffect(() => {
        let alreadyPressed = {
            up: false,
            down: false
        };
        const onKeydown = (e) => {
            if (e.key === 'ArrowDown' && !alreadyPressed.down && !alreadyPressed.up)
            {
                alreadyPressed.down = true;
                const data = { gameId: gameId, player: MyId, direction: -1};
                gameSocket.send(JSON.stringify({ event: 'movePaddle', data: data}));
            }
            else if (e.key === 'ArrowUp' && !alreadyPressed.up && !alreadyPressed.down)
            {
                alreadyPressed.up = true;
                const data = { gameId: gameId, player: MyId, direction: 1};
                gameSocket.send(JSON.stringify({ event: 'movePaddle', data: data}));
            }
        }
    
        const onKeyup = (e) => {
            if (e.key === 'ArrowDown' && alreadyPressed.down)
            {
                alreadyPressed.down = false;
                const data = { gameId: gameId, player: MyId};
                gameSocket.send(JSON.stringify({ event: 'stopPaddle', data: data}));
            }
            else if (e.key === 'ArrowUp' && alreadyPressed.up)
            {
                alreadyPressed.up = false;
                const data = { gameId: gameId, player: MyId};
                gameSocket.send(JSON.stringify({ event: 'stopPaddle', data: data}));
            }
        }

        const onResize = () => {
            const cssElement = document.getElementById("game-board");
            const ball = document.getElementById("ball");

            if (ball && cssElement)
            {
                players.forEach((player, key) => {
                    player.drawPaddle(cssElement, screen);
                    ballData.drawBall(ball, cssElement, screen);
                });
            }
        }
    
        window.addEventListener('resize', onResize, false);
        window.addEventListener('keydown', onKeydown, false);
        window.addEventListener('keyup', onKeyup, false);
        return () => {
            window.removeEventListener('resize', onResize, false);
            window.removeEventListener('keydown', onKeydown, false);
            window.removeEventListener('keyup', onKeyup, false);
        }
    }, [players, ballData, screen, gameSocket, gameId, MyId]);

    useEffect(() => {
        const cssElement = document.getElementById("game-board");
        if (cssElement)
            cssElement.style.backgroundColor = boardColor;
    }, [boardColor]);

    const Score = ({id, score}) => {
        return (
            <p id={id}>{score}</p>
        );
    };

    useEffect(() => {
        const upButton = () => {
            const data = { gameId: gameId, player: MyId, direction: 1 };
            gameSocket.send(JSON.stringify({ event: 'movePaddle', data: data }));
        }
    
        const downButton = () => {
            const data = { gameId: gameId, player: MyId, direction: -1 };
            gameSocket.send(JSON.stringify({ event: 'movePaddle', data: data }));
        }
    
        const releaseButton = () => {
            const data = { gameId: gameId, player: MyId };
            gameSocket.send(JSON.stringify({ event: 'stopPaddle', data: data }));
        }
    
        const downButtonElement = document.getElementById("down-button");
        const upButtonElement = document.getElementById("up-button");
    
        if (downButtonElement && upButtonElement) {
            downButtonElement.addEventListener("touchstart", downButton);
            upButtonElement.addEventListener("touchstart", upButton);
            downButtonElement.addEventListener("touchend", releaseButton);
            upButtonElement.addEventListener("touchend", releaseButton);
        }
    
        return () => {
            if (downButtonElement && upButtonElement) {
                downButtonElement.removeEventListener("touchstart", downButton);
                upButtonElement.removeEventListener("touchstart", upButton);
                downButtonElement.removeEventListener("touchend", releaseButton);
                upButtonElement.removeEventListener("touchend", releaseButton);
            }
        };
    }, [gameId, MyId, gameSocket]); // Assurez-vous d'ajouter gameId et MyId comme dépendances si nécessaire
    
    const WhoWin = ({id, whoWin}) => {
        const ball = document.getElementById("ball");
        if (ball)
            ballData.undrawBall(ball);
        return (
            <p id={id}>{whoWin}</p>
        );
    };

    const Pause = ({id, pause}) => {
        return (
            <p id={id}>{pause}</p>
        );
    };

    if (gameSocket)
    {
        gameSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'synchronized')
            {
                gameId = data.gameId;
                MyId = data.myId;
                opponentId = data.opponentId;
                players.set(MyId, new gameData.Player());
                players.set(opponentId, new gameData.Player());
            }

            else if (data.type === 'initBoard')
            {
                const ball = document.getElementById("ball");
                const cssElement = document.getElementById("game-board");
                const paddle1 = document.getElementById("paddle1");
                const paddle2 = document.getElementById("paddle2");
                const player1 = players.get(MyId);
                const player2 = players.get(opponentId);
                if (player1 && paddle1)
                    player1.paddle = paddle1;
                if (player2 && paddle2)
                    player2.paddle = paddle2;
                screen.width = data.screen.width;
                screen.height = data.screen.height;
                setScore1(data.score1);
                setScore2(data.score2);
                ballData.setBall(
                    data.ball.x,
                    data.ball.y,
                    data.ball.radius
                );
                if (player1 && player2 && ball && cssElement)
                {
                    player1.setPaddlePosition(
                        data.paddle1.x,
                        data.paddle1.y,
                        data.paddle1.width,
                        data.paddle1.height
                    );
                    player2.setPaddlePosition(
                        data.paddle2.x,
                        data.paddle2.y,
                        data.paddle2.width,
                        data.paddle2.height
                    );
                    player1.drawPaddle(cssElement, screen);
                    player2.drawPaddle(cssElement, screen);
                    ballData.drawBall(ball, cssElement, screen);
                }
            }

            else if (data.type === 'ballPos')
            {
                const ball = document.getElementById("ball");
                const cssElement = document.getElementById("game-board");
                ballData.setBall(
                    data.ball.x,
                    data.ball.y,
                    data.ball.radius
                );
                screen.width = data.screen.width;
                screen.height = data.screen.height;
                if (ball && cssElement)
                    ballData.drawBall(ball, cssElement, screen);
            }

            else if (data.type === 'paddlePos')
            {
                const cssElement = document.getElementById("game-board");
                const player = players.get(data.paddlePlayer);
                if (player)
                {
                    player.setPaddlePosition(
                        data.paddle.x,
                        data.paddle.y,
                        data.paddle.width,
                        data.paddle.height
                    );
                    screen.width = data.screen.width;
                    screen.height = data.screen.height;
                    if (cssElement)
                        player.drawPaddle(cssElement, screen);
                }
            }

            else if (data.type === "updateScore")
            {
                setScore1(data.score1);
                setScore2(data.score2);
            }

            else if (data.type === "gameEffect")
            {
                    const ball = document.getElementById("ball");
                    if (ball)
                        ballData.undrawBall(ball);
            }

            else if (data.type === "whoWin")
            {
                const ball = document.getElementById("ball");
                const paddle1 = document.getElementById("paddle1");
                const paddle2 = document.getElementById("paddle2");
                const player1 = players.get(1);
                const player2 = players.get(2);
                if (ball && paddle1 && paddle2 && player1 && player2 && score1 && score2)
                {
                    player1.undrawPaddle();
                    player2.undrawPaddle();
                    ballData.undrawBall(ball);
                }   
                setPause("");
                setWhowin(data.whoWin);
                redirect();
            }

            if (data.type === "PAUSE")
                setPause("PAUSE");
            else if (data.type === "RESUME")
                setPause("");
            if (data.type === "notConnected")
                window.location.href = "/lobby";
        }
    }

    // const button = document.getElementById("arrow");
    
    return (
        <div>
            <div id="game-board">
                <div className="color-button-container">
                    <button className="change-board-color" onClick={() => setBoardColor("darkred")}>Red</button>
                    <button className="change-board-color" onClick={() => setBoardColor("black")}>black</button>
                </div>
                <div className="score-container">
                    <Score id={"score2"} score={score2}/>
                    <Score id={"score1"} score={score1}/>
                </div>
                <div id="ball"></div>
                <div id="paddle1"></div>
                <div id="paddle2"></div>
                <div className="whoWin-container">
                    <WhoWin id={"whoWin"} whoWin={whowin}/>
                </div>
                <div className="Pause-container">
                    <Pause id={"Pause"} pause={pause}/>
                </div>
                <div id="arrow-container">
                    <button id="down-button" className="arrow-button">▼</button>
                    <button id="up-button" className="arrow-button">▲</button>
                </div>
            </div>
        </div>
    );
} 