import React, {Component, useEffect} from "react";

class Chat extends Component {

    render() {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
        }

        return (
            <div>
                <h1>Chat</h1>
            </div>
        );
    }
}

export default Chat;