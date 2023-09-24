import React, { useEffect, useState, useRef } from "react";
import  { Ball } from "./game/object/ball.tsx";
import { Game } from "./game/object/game.tsx";
import "../../Styles/GameStyle.css";

export default function GameComponent() {
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001/game`;
    const gameSocket = new WebSocket(url);
    const canvasRef = useRef(null);
    const colorsRef = useRef(null);
    const ballRef = new Ball();
    const gameRef = new Game();

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
        const canvas = canvasRef.current;
        const ballColor = colorsRef.current;
        const context = canvas.getContext("2d");
        const socketRef = gameSocket;
        let alreadyPressed = {
            up: false,
            down: false
        }

        const colors = document.getElementsByClassName('color');
        console.log(colors, 'the colors');
        console.log(ballColor, 'the ball color');

        const currentColor = {
            color: 'black'
        }
        console.log(currentColor, 'the current color');

        const onColorUpdate = (e) => {
            currentColor.color = e.target.className.split(' ')[1];
        };

        for (let i = 0; i < colors.length; i++) {
            colors[i].addEventListener('click', onColorUpdate, false);
        }
    
        const onResize = () => {
            console.log(canvas.width, canvas.height);
        }

        window.addEventListener('resize', onResize, false);
        onResize();

        const onKeydown = (e) => {
            if (e.key === 'ArrowDown' && !alreadyPressed.down && !alreadyPressed.up)
            {
                gameSocket.send(JSON.stringify({ event: 'move', data: { direction: 'down' } }));
                alreadyPressed.down = true;
                console.log('keyup', e.key);
            }
            else if (e.key === 'ArrowUp' && !alreadyPressed.up && !alreadyPressed.down)
            {
                gameSocket.send(JSON.stringify({ event: 'move', data: { direction: 'up' } }));
                alreadyPressed.up = true;
                console.log('keyup', e.key);
            }
        }

        const onKeyup = (e) => {
            if (e.key === 'ArrowDown' && alreadyPressed.down && !alreadyPressed.up)
            {
                gameSocket.send(JSON.stringify({ event: 'stop', data: { direction: 'down' } }));
                alreadyPressed.down = false;
                console.log('keydown', e.key);
            }
            else if (e.key === 'ArrowUp' && alreadyPressed.up && !alreadyPressed.down)
            {
                gameSocket.send(JSON.stringify({ event: 'stop', data: { direction: 'up' } }));
                alreadyPressed.up = false;
                console.log('keydown', e.key);
            }
        }

        window.addEventListener('keydown', onKeydown, false);
        window.addEventListener('keyup', onKeyup, false);

        gameSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.type === 'synchronized')
            {
                gameRef.setGameId(data.gameId);
                gameRef.setMyId(data.myId);
            }
            if (data.type === 'gameStart')
            {
                gameRef.setScores(data.data.myScore, data.data.oponentScore);
                gameRef.setScreenRef(data.data.screen);
                ballRef.setBallData(data.data.ball.x, data.data.ball.y, data.data.ball.radius);
                ballRef.draw(context);
            }
            if (data.type === 'ballPos')
            {
                ballRef.setBallData(data.data.x, data.data.y, data.data.radius);
                ballRef.draw(context);
            }
        }
    }, []);

    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
    }

    const button = document.getElementById("arrow");
    
    return (
        <div>
            <canvas ref={canvasRef} className="gameBoard">
                <div ref={colorsRef} className="colors">
                    <div className="color white"/>
                    <div className="color red"/>
                    <div className="color green"/>
                    <div className="color blue"/>
                </div>
            </canvas>
        </div>
    );
} 
