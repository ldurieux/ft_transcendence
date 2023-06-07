import React, { useContext} from "react";
import Message from "./Message.tsx";
import "../../Styles/channelStyles.css";
import { get } from "../Request.tsx";
import PopupSettings from "./chanSettingsPopup.tsx";
import {PopupContext} from "./PopupContext.tsx";

function Channel({ channel }) {
    const { showPopup, setShowPopup } = useContext(PopupContext);
    const isDM: boolean = channel.type === "dm";

    if (!channel) {
        return null;
    }

    const handleTogglePopup = () => {
        setShowPopup(!showPopup);
    };

    return (
        <div className="channel">
            <div className="channel-name">{channel.display_name}</div>
            <div className="channel-settings">
                {!isDM &&
                    <i className="bx bx-cog" onClick={handleTogglePopup}></i>
                }
            </div>
            <div className="channel-messages">
                {/*{channel.messages.map((message) => (*/}
                {/*    <Message message={message} />*/}
                {/*))}*/}
            </div>
                <PopupSettings
                settings={channel}
                showPopup={showPopup}
                setShowPopup={setShowPopup}
            />
        </div>
    );
}

export default Channel;