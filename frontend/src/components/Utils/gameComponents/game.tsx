import React, { useEffect, useState, useRef } from "react";
import "../../Styles/GameStyle.css";
import * as gameData from "./game/object/gameData.tsx"

export default function GameComponent() {
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001/game`;
    const gameSocket = new WebSocket(url);
    const [boardColor, setBoardColor] = useState<string>("black");
    var gameId = 0;
    var MyId = 0;
    const ballData = new gameData.Ball();
    const players = new Map<number, gameData.Player>;
    const score = useRef([0, 0]);
    const screen: gameData.Screen = {
        width: 0,
        height: 0
    };
    useEffect(() => {
        gameSocket.onopen = () => {
            const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
            gameSocket.send(JSON.stringify(baguette));
            console.log("connected to game server");
        };
        gameSocket.onclose = () => {
            console.log("disconnected from game server");
        };
        
        return () => {
            if (gameSocket.readyState === WebSocket.OPEN)
            {
                console.log("closing game socket");
                gameSocket.close();
            }
        };
    }, []);

    useEffect(() => {
        let alreadyPressed = {
            up: false,
            down: false
        };
        const onKeydown = (e) => {
            if (e.key === 'ArrowDown' && !alreadyPressed.down && !alreadyPressed.up)
            {
                const data = { gameId: gameId, player: MyId, direction: -1};
                gameSocket.send(JSON.stringify({ event: 'movePaddle', data: data}));
                alreadyPressed.down = true;
            }
            else if (e.key === 'ArrowUp' && !alreadyPressed.up && !alreadyPressed.down)
            {
                const data = { gameId: gameId, player: MyId, direction: 1};
                gameSocket.send(JSON.stringify({ event: 'movePaddle', data: data}));
                alreadyPressed.up = true;
            }
        }
    
        const onKeyup = (e) => {
            if (e.key === 'ArrowDown' && alreadyPressed.down && !alreadyPressed.up)
            {
                const data = { gameId: gameId, player: MyId};
                gameSocket.send(JSON.stringify({ event: 'stopPaddle', data: data}));
                alreadyPressed.down = false;
            }
            else if (e.key === 'ArrowUp' && alreadyPressed.up && !alreadyPressed.down)
            {
                const data = { gameId: gameId, player: MyId};
                gameSocket.send(JSON.stringify({ event: 'stopPaddle', data: data}));
                alreadyPressed.up = false;
            }
        }

        const onResize = () => {
            const cssElement = document.getElementById("game-board");
            const paddle1 = document.getElementById("paddle1");
            const paddle2 = document.getElementById("paddle2");
            const ball = document.getElementById("ball");

            if (ball && cssElement && paddle1 && paddle2)
            {
                players.forEach((player, key) => {
                    player.drawPaddle(paddle1, paddle2, cssElement, screen, key);
                    ballData.drawBall(ball, cssElement, screen);
                });
            }
        }
    
        window.addEventListener('resize', onResize, false);
        window.addEventListener('keydown', onKeydown, false);
        window.addEventListener('keyup', onKeyup, false);
    }, []);

    useEffect(() => {
        const cssElement = document.getElementById("game-board");
        if (cssElement)
            cssElement.style.backgroundColor = boardColor;
    }, [boardColor]);

    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'synchronized')
        {
            gameId = data.gameId;
            MyId = data.myId;
            players.set(1, new gameData.Player());
            players.set(2, new gameData.Player());
        }
        else if (data.type === 'initBoard')
        {
            const ball = document.getElementById("ball");
            const paddle1 = document.getElementById("paddle1");
            const paddle2 = document.getElementById("paddle2");
            const cssElement = document.getElementById("game-board");
            const player1 = players.get(1);
            const player2 = players.get(2);
            ballData.setBall(
                data.ball.x,
                data.ball.y,
                data.ball.radius
            );
            if (player1 && player2)
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
                score[0] = 0;
                score[1] = 0;
            }
            if (ball && paddle1 && paddle2 && cssElement && player1 && player2)
            {
                player1.drawPaddle(paddle1, paddle2, cssElement, screen, 1);
                player2.drawPaddle(paddle1, paddle2, cssElement, screen, 2);
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
            const paddle1 = document.getElementById("paddle1");
            const paddle2 = document.getElementById("paddle2");
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
                if (paddle1 && paddle2 && cssElement)
                {
                    player.drawPaddle(paddle1, paddle2, cssElement, screen, data.paddlePlayer);
                }
            }
        }
        else if (data.type === "updateScore")
        {
            score[0] = data.score1;
            score[1] = data.score2;
        }
        else if (data.type === "gameEffect")
        {
            ballData.setBallEffect();
            if (ballData.getBallEffect())
            {
                const ball = document.getElementById("ball");
                if (ball)
                    ballData.undrawBall(ball);
            }
        }
    }

    // const button = document.getElementById("arrow");
    
    return (
        <div id="game-board">
            {/* <div className="ready-button-container">
                <button className="ready-button">Ready</button>
            </div> */}
            <div className="color-button-container">
                <button className="change-board-color" onClick={() => setBoardColor("darkred")}>Red</button>
                <button className="change-board-color" onClick={() => setBoardColor("black")}>black</button>
            </div>
            <div className="score-container">
                <p id="score1">{score[0]}</p>
                <p id="score2">{score[1]}</p>
            </div>
            <div id="ball"></div>
            <div id="paddle1"></div>
            <div id="paddle2"></div>
        </div>
    );
} 