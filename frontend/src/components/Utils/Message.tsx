import React from "react";
import "../Styles/messageStyles.css";

function Message({message}) {
    const defaultAvatar = require("./42-logo.png");

    return (
        <div className="message">
            <img
                src={message.user.avatar_url ? message.user.avatar_url : defaultAvatar}
                alt="avatar"
                className="message-avatar"
            />
            <div className="message-content">
                <div className="message-header">
                    <div className="message-username">{message.user.display_name}</div>
                    <div className="message-time">{message.created_at}</div>
                </div>
                <div className="message-body">{message.content}</div>
            </div>
        </div>
    );
}

export default Message;