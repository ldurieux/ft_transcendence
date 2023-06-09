import React, {useContext} from "react";
import PopupContext from "./PopupContext.tsx";
import "../../Styles/PopupStyles.css";
import {post} from "../Request.tsx";



function PopupSettings({ settings, currentUser }) {
    const { showPopup, setShowPopup } = useContext(PopupContext);
    const users = settings.users;
    const owner = settings.owner;

    async function kickUser(channel, userId) {
        try {
            if (currentUser.id === channel.owner.id) {
                const result = await post(`channel/kick`, {userId: userId, channelId: channel.id});
                return result;
            }
        }
        catch (e) {
        }
    }

    const handlePopupClose = () => {
        setShowPopup(false);
    };


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
                                <li key={user.id}>
                                    {user.display_name}
                                    {currentUser.id === owner.id && currentUser.id !== user.id &&
                                        <button onClick={() => kickUser(settings, user.id)}>Kick</button>
                                    }
                                </li>
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
