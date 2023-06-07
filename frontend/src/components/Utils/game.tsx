import React, { useEffect, useState, useRef } from "react";
import "../Styles/ChatStyles.css";
import { websocketRef } from 'ws';


function MyGame() {
    const [message, setMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    let socketRef: websocketRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;
        socket.onopen = () => {
            console.log('Connected to server');
            setIsConnected(true);
        }

        socket.onmessage = (event) => {
            const receiveMessage = event.data;
            console.log('Message recu: ', receiveMessage);
        }

        socket.onclose = () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);


    const sendMessage = () => {
        console.log(socketRef);
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log('Sending message: ', message);
            const baguette = {event: 'message', data: message};
            socketRef.current.send(JSON.stringify(baguette));
        }
    };

    const handlekeydown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
            setMessage("")
        }
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