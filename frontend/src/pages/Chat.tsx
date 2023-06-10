import React, {Component} from "react";
import "../components/Styles/ChatStyles.css";
import ChatMain from "../components/Utils/ChatMain.tsx";

function Chat ({socket}) {
    return (
        <div>
            <ChatMain socket={socket}/>
        </div>
    );
}

export default Chat;