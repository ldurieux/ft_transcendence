import React, { useEffect, useState } from "react";
import "../Styles/ChatStyles.css";


async function sendMessage(message) {
    try {
        console.log(message);
    } catch (error) {
        console.error(error);
    }
}


function MyGame() {
    const [message, setMessage] = useState("");

    const handlekeydown = (e) => {
        if (e.key === "Enter") {
            sendMessage(message);
            setMessage("");
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