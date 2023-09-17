import React, { useEffect, useState, useRef } from "react";
import "../../Styles/GameStyle.css";
import * as request from "./gameRequest.tsx";
import { WebSocket } from "ws";
import Canvas from "./canvas.tsx";
import { log } from "console";
import { Route } from "react-router-dom";

interface BallData {
    x: number;
    y: number;
    radianVector: number;
    speed: number;
    radius: number;
}

interface PaddleData {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Score {
    myScore: number;
    opponentScore: number;
}

interface Screen {
    width: number;
    height: number;
}

interface Data {
    ball: BallData;
    paddle1: PaddleData;
    paddle2: PaddleData;
    score1: Score;
    score2: Score;
    originalScreen: Screen;
}

let paddlePosition: number = 0;

function GameComponent() {

    const url = `ws://${process.env.REACT_APP_WEB_HOST}/game:3001`;
    const gameSocket = new WebSocket(url);
    useEffect(() => {
        gameSocket.onopen = () => {
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

    gameSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
    }

    const button = document.getElementById("arrow");

    function up() {
        console.log("up");
        this.removeEventListener("ArrowUp", up);
    }

    function down() {
        console.log("down");
        this.removeEventListener("ArrowDown", down);
    }

    console.log(paddlePosition);
    
    return (
        <div>
        </div>
    );
} 

export default GameComponent;