import React, { useEffect, useState } from "react";


function MyGame() {
    const [message, setMessage] = useState("");
    return (
        <div style={{textaline:"center"}}>
            <h1>text test</h1>
            <input type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}/>
        </div>
    );
}

export default MyGame;