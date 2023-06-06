import React, { useEffect, useState } from "react";
import "../Styles/ChatStyles.css";
import { webSocket } from 'ws';

function MyGame() {
    const [message, setMessage] = useState("");
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    const socket = new WebSocket(url);

    async function sendWebSocketMessage(message) {
        try {
            console.log(message);
            const result = socket.send(JSON.stringify({ message }));
            console.log(result);
        }
        catch (error) {
            console.error(error);
        }
    }

    const handlekeydown = (e) => {
        if (e.key === "Enter") {
            sendWebSocketMessage({type: "message", text: "truc"});
            setMessage("")
        }
    }

    socket.onopen = () => {
        socket.send(JSON.stringify({type: "message", text: "truc"}));
        console.log('Connected to server');
    }

    socket.onclose = () => {
        console.log('Disconnected from server');
    }

    return (
        <div> 
            <h1>text test</h1>
            <input type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handlekeydown}
            />
        </div>
    );
}

export default MyGame;