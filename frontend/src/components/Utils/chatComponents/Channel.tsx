import React, {useContext, useEffect, useState} from "react";
import Message from "./Message.tsx";
import "../../Styles/channelStyles.css";
import { get, post } from "../Request.tsx";
import PopupSettings from "./chanSettingsPopup.tsx";
import {PopupContext} from "./PopupContext.tsx";
import { websocketRef} from "ws";
import { SocketContext } from "../context.tsx";

async function getChannelMessages(channelId) {
    try {
        const result = await get("channel/message?id=" + channelId);
        if (result) {
            return result;
        }
    }
    catch (error) {
        return null;
    }
}

function Channel({ socket, channel, currentUser, setChanParams }) {
    const { showPopup, setShowPopup } = useContext(PopupContext);
    const isDM: boolean = channel.type === "dm";
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    console.log(messages);

    useEffect(() => {
        (async () => {
            try {
                const message = await getChannelMessages(channel.id);
                if (message) {
                    setMessages(message);
                }
            }
            catch (error) {
                return error;
            }
        })();
    }, [channel]);

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const ret = JSON.parse(event.data)
                if (ret.event === "leave") {
                    //remove the user who lived from the channel with his user id
                    setChanParams((prev) => {
                        const newParams = {...prev};
                        newParams.users = newParams.users.filter((user) => user.id !== ret.user_id);
                        return newParams;
                    });
                }
            };
        }
    }, [socket, channel]);

    if (!channel) {
        return null;
    }

    async function sendMessage(channelId) {
        try {
            const result = await post("channel/message", { id: channelId, text: message });
            if (!(result.status >= 400 && result.status <= 500)) {
                //add our message to messages list
                setMessages((prev) => [...prev, result]);
            }
        }
        catch (error) {

        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage(channel.id);
            setMessage("");
        }
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
                {messages &&
                    messages.length > 0 &&
                    messages.map((item, key) => (
                        <Message message={item} />
                ))}
            </div>
            <div className="channel-input">
                <input
                    type="text"
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <div className="channel-input-button">
                    <button
                        onClick={() => {
                            sendMessage(channel.id);
                            setMessage("");
                        }
                        }
                    >
                        Send
                    </button>
                </div>
            </div>
            {channel &&
                <PopupSettings
                settings={channel}
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                currentUser={currentUser}
            />
            }
        </div>
    );
}

export default Channel;