import React from "react";
import "../../Styles/messageStyles.css";

function Message(message) {


    return (
        <div className="message">
            {/*<img*/}
            {/*    src={message.owner.avatar_url ? message.owner.avatar_url : defaultAvatar}*/}
            {/*    alt="avatar"*/}
            {/*    className="message-avatar"*/}
            {/*/>*/}
            <div className="message-content">
                <div className="message-header">
                    {/*<div className="message-username">{message.owner}</div>*/}
                    <div className="message-time">{message.created_at}</div>
                </div>
                <div className="message-body">{message.text}</div>
            </div>
        </div>
    );
}

export default Message;