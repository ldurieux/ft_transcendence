import React from "react";
import Message from "./Message.tsx";
import "../Styles/channelStyles.css";

function Channel({ channel }) {
    return (
        <div className="channel">
            <div className="channel-name">{channel.display_name}</div>
            <div className="channel-messages">
                {/*{channel.messages.map((message) => (*/}
                {/*    <Message message={message} />*/}
                {/*))}*/}
            </div>
        </div>
    );
}

export default Channel;