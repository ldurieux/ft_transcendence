import React, {Component} from "react";
import "../components/Styles/ChatStyles.css";
import ChatMain from "../components/Utils/ChatMain.tsx";

class Chat extends Component {

    render() {
        return (
            <div>
                <ChatMain/>
            </div>
        );
    }
}

export default Chat;