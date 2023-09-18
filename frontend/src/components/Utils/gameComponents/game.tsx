import React, { useEffect, useState, useRef } from "react";
import "../../Styles/GameStyle.css";
import * as request from "./gameRequest.tsx";
import Canvas from "./canvas.tsx";
import { log } from "console";
import { Route } from "react-router-dom";

export default function GameComponent() {
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001/game`;
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

    
    return (
        <div className="gameBoard">
        </div>
    );
} 
