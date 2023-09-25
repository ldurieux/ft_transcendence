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
    const players = new Array<gameData.Player>(2);
    const screen: gameData.Screen = {
        width: 0,
        height: 0
    };
    const [score, setScore] = useState({
        score1: 0,
        score2: 0
    });
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
                console.log(gameId, MyId);
                const data = { gameId: gameId, player: MyId, direction: 'down'};
                gameSocket.send(JSON.stringify({ event: 'movePaddle', data: data}));
                alreadyPressed.down = true;
                console.log('keydown', e.key);
            }
            else if (e.key === 'ArrowUp' && !alreadyPressed.up && !alreadyPressed.down)
            {
                console.log(gameId, MyId);
                const data = { gameId: gameId, player: MyId, direction: 'up'};
                gameSocket.send(JSON.stringify({ event: 'movePaddle', data: {gameId: gameId, player: MyId, direction: 'up' } }));
                alreadyPressed.up = true;
                console.log('keydown', e.key);
            }
        }
    
        const onKeyup = (e) => {
            if (e.key === 'ArrowDown' && alreadyPressed.down && !alreadyPressed.up)
            {
                console.log(gameId, MyId);
                const data = { gameId: gameId, player: MyId};
                gameSocket.send(JSON.stringify({ event: 'stopPaddle', data: data}));
                alreadyPressed.down = false;
                console.log('keyup', e.key);
            }
            else if (e.key === 'ArrowUp' && alreadyPressed.up && !alreadyPressed.down)
            {
                console.log(gameId, MyId);
                const data = { gameId: gameId, player: MyId};
                gameSocket.send(JSON.stringify({ event: 'stopPaddle', data: data}));
                alreadyPressed.up = false;
                console.log('keyup', e.key);
            }
        }
    
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
            console.log('synchronized');
            console.log(data.gameId, data.myId);
            gameId = data.gameId;
            MyId = data.myId;
            console.log(gameId, MyId);
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
            {
                console.log('truc');
                const left = ballData.x * cssElement.offsetWidth / screen.width;
                const top = ballData.y * cssElement.offsetHeight / screen.height;
                ball.style.left = `${left}px`;
                ball.style.top = `${top}px`;
                ball.style.width = `${ballData.radius}px`;
                ball.style.height = `${ballData.radius}px`;
            }
        }
        else if (data.type === 'paddlePos')
        {
            const paddle1 = document.getElementById("paddle1");
            const paddle2 = document.getElementById("paddle2");
            const cssElement = document.getElementById("game-board");
            console.log('paddle data = ', data.paddle);
            console.log('truc = ', players[data.paddlePlayer - 1]);
            players[data.paddlePlayer - 1].setPaddlePosition(
                data.paddle.x,
                data.paddle.y,
                data.paddle.width,
                data.paddle.height
            );
            screen.width = data.screen.width;
            screen.height = data.screen.height;
            if (paddle1 && paddle2 && cssElement)
            {
                players[data.paddlePlayer - 1].drawPaddle(paddle1, paddle2, cssElement, screen, data.paddlePlayer);
            }
        }
    }

    // const button = document.getElementById("arrow");
    
    return (
        <div>
            <div id="game-board">
                <div className="button-container">
                    <button className="change-board-color" onClick={() => setBoardColor("darkred")}>Red</button>
                    <button className="change-board-color" onClick={() => setBoardColor("black")}>black</button>
                    <div id="ball"></div>
                    <div id="paddle1"></div>
                    <div id="paddle2"></div>
                </div>
            </div>
        </div>
    );
} 