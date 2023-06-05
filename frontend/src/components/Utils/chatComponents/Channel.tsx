import React, {useEffect, useState} from "react";
import Message from "./Message.tsx";
import "../../Styles/channelStyles.css";
import { get } from "../Request.tsx";
import PopupSettings from "./chanSettingsPopup.tsx";

function Channel({ channel }) {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <div className="channel">
            {/*{showPopup && PopupSettings(channelParams, setShowPopup)}*/}
            {/*<div className="channel-name">{channel.display_name}</div>*/}
            {/*<div className="channel-settings">*/}
            {/*    <i className="bx bx-cog" onClick={() => setShowPopup(true)}></i>*/}
            {/*</div>*/}
            {/*<div className="channel-messages">*/}
            {/*    /!*{channel.messages.map((message) => (*!/*/}
            {/*    /!*    <Message message={message} />*!/*/}
            {/*    /!*))}*!/*/}
            {/*</div>*/}
        </div>
    );
}

export default Channel;