import React, {Component, useEffect} from "react";
import "../components/Styles/ChatStyles.css";
import ChatMain from "../components/Utils/ChatMain.tsx";

class Chat extends Component {

    render() {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
        }

        return (
            <div>
                <ChatMain/>
            </div>
        );
    }
}

export default Chat;