import React from "react";
import "../components/Styles/ChatStyles.css";
import ChatMain from "../components/Utils/chatComponents/ChatMain.tsx";

function Chat ({socket}) {
    console.log(socket)
    return (
        <div>
            <ChatMain socket={socket}/>
        </div>
    );
}

export default Chat;