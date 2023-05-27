import React, {Component, useEffect} from "react";
import "../components/Styles/ChatStyles.css";
import Channel from "../components/Utils/Channel.tsx";

class Chat extends Component {

    render() {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
        }

        return (
            <div>
                <Channel/>
            </div>
        );
    }
}

export default Chat;