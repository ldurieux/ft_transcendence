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
    const [score1, setScore1] = useState<number>(0);
    const [score2, setScore2] = useState<number>(0);
    const [whowin, setWhowin] = useState<string>("");
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

    const Score = ({id, score}) => {
        return (
            <p id={id}>{score}</p>
        );
    };

    const WhoWin = ({id, whoWin}) => {
        const ball = document.getElementById("ball");
        if (ball)
            ballData.undrawBall(ball);
        return (
            <p id={id}>{whoWin}</p>
        );
    };

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
            console.log(MyId)
            const ball = document.getElementById("ball");
            const paddle1 = document.getElementById("paddle1");
            const paddle2 = document.getElementById("paddle2");
            const cssElement = document.getElementById("game-board");
            const player1 = players.get(1);
            const player2 = players.get(2);
            screen.width = data.screen.width;
            screen.height = data.screen.height;
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
                setScore1(0);
                setScore2(0);
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
                player1.undrawPaddle(paddle1, paddle2, 1);
                player2.undrawPaddle(paddle1, paddle2, 2);
                ballData.undrawBall(ball);
            }   
            setWhowin(data.whoWin);
        }
        else if (data.type === "reconnect")
        {
            console.log(data);
            console.log("reconnect");
            const paddle1 = document.getElementById("paddle1");
            const paddle2 = document.getElementById("paddle2");
            const cssElement = document.getElementById("game-board");
            screen.width = data.screen.width;
            screen.height = data.screen.height;
            setScore1(data.score1);
            setScore2(data.score2);
            if (paddle1 && paddle2 && cssElement)
            {
                console.log(players);
                players.forEach((player, key) => {
                    console.log(player);
                    console.log(key);
                    player.drawPaddle(paddle1, paddle2, cssElement, screen, key);
                });
            }
        }
    }

    // const button = document.getElementById("arrow");
    
    return (
        <div id="game-board">
            <div className="color-button-container">
                <button className="change-board-color" onClick={() => setBoardColor("darkred")}>Red</button>
                <button className="change-board-color" onClick={() => setBoardColor("black")}>black</button>
            </div>
            <div className="score-container">
                <Score id={"score1"} score={score1}/>
                <Score id={"score2"} score={score2}/>
            </div>
            <div id="ball"></div>
            <div id="paddle1"></div>
            <div id="paddle2"></div>
            <div className="whoWin-container">
                <WhoWin id={"whoWin"} whoWin={whowin}/>
            </div>
        </div>
    );
} 