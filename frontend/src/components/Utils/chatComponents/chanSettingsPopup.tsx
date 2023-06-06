import React, {useContext} from "react";
import PopupContext from "./PopupContext.tsx";
import "../../Styles/PopupStyles.css";
import {post} from "../Request.tsx";

async function kickUser(channelId, userId) {
    try {
        const result = await post(`channel/kick`, {user_id: userId, channel_id: channelId});
        return result;
    }
    catch (e) {
    }
}

function PopupSettings({ settings }) {
    const { showPopup, setShowPopup } = useContext(PopupContext);
    const users = settings.users;
    const owner = settings.owner;

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    console.log(settings);

    return (
        showPopup && (
        <div className="popup-settings">
            <div className="popup-settings-inner">
                <div className="popup-settings-header">
                    <div className="popup-settings-title">{settings.display_name}</div>
                    <div className="popup-settings-close" onClick={handlePopupClose}>
                        <i className="bx bx-x"></i>
                    </div>
                </div>
                <div className="popup-settings-content">
                    <ul>
                        <li style={{fontWeight: "700"}}>Owner:
                            <p style={{fontWeight: "100"}}>{owner.display_name}</p>
                        </li>
                        <li style={{fontWeight: "700"}}>Users:</li>
                        <ul>
                            {users.map((user) => (
                                <li key={user.id}>{user.display_name}</li>
                            ))}
                        </ul>
                    </ul>
                </div>
            </div>
        </div>
        )
    );
}

export default PopupSettings;
