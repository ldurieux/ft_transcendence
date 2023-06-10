import React, {useContext, useEffect, useState, useRef} from "react";
import { useNavigate } from 'react-router-dom';
import "../../Styles/channelStyles.css";
import { get, post } from "../Request.tsx";
import {PopupContext} from "./PopupContext.tsx";
import "../../Styles/messageStyles.css";
import "../../Styles/PopupStyles.css";

async function getChannelMessages(channelId) {
    try {
        const result = await get("channel/message?id=" + channelId);
        if (result) {
            return result;
        }
    }
    catch (error) {
    }
}

function Channel({ socket, channel, currentUser, setChanParams, setChannelList, updateChannelUsers, closeChannel }) {
    const bottomChat = useRef<null | HTMLDivElement>(null);
    const { showPopup, setShowPopup } = useContext(PopupContext);
    const isDM: boolean = channel.type === "dm";
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const defaultAvatar = require("../42-logo.png");

    useEffect(() => {
        if (bottomChat.current) {
            bottomChat.current?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
        }
    }, [socket, messages]);

    useEffect(() => {
        (async () => {
            try {
                if (channel.id !== "undefined") {
                    const message = await getChannelMessages(channel.id);
                    setUsers(channel.users)
                    if (message) {
                        setMessages(message);
                    }
                }
                else {
                    setMessages([]);
                }
            }
            catch (error) {
                return error;
            }
        })();
    }, [channel.id]);

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const ret = JSON.parse(event.data)
                console.log(ret)
                if (ret.event === "leave" && ret.data.channel === channel.id) {
                    //remove the user who lived from users list
                    setUsers((prev) => {
                        return prev.filter((user) => user.id !== ret.data.user);
                    });
                    if (ret.data.user === currentUser.id)
                        closeChannel();
                }
                if (ret.event === "join" && ret.data.channel === channel.id) {
                    //add the user who joined to the channel
                    setUsers((prev) => [...prev, ret.data.user]);
                }
                else if (ret.event === "message") {
                    //add the message to the messages list
                    if (ret.data.channel === channel.id)
                        setMessages((prev) => [...prev, ret.data]);
                }
            };
        }
    }, [socket, channel]);

    if (!channel) {
        return null;
    }

    async function sendMessage(channelId) {
        await post("channel/message", { id: channelId, text: message });
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

    async function kickUser(channel, userId) {
        try {
            if (currentUser.id === channel.owner.id) {
                const result = await post(`channel/kick`, { userId: userId, channelId: channel.id });
                if (result) {
                    // Update the users list
                    const updatedUsers = users.filter(user => user.id !== userId);
                    setUsers(updatedUsers);

                    // Update the channel list in the parent component
                    updateChannelUsers(channel, updatedUsers);
                }
                return result;
            }
        } catch (error) {
            // Gérer l'erreur ici
            console.error("Erreur lors de la suppression de l'utilisateur :", error);
        }
    }

    async function banUser(channel, userId) {
        try {
            const ret = await post(`channel/ban`, { userId: userId, channelId: channel.id, duration: 60 });
            if (ret) {
                //update the users list
                setUsers((prev) => {
                    return prev.filter((user) => user.id !== userId);
                });
            }
        }
        catch (error) {
        }
    }

    async function muteUser(channel, userId) {
        try {
            const ret = await post(`channel/mute`, { userId: userId, channelId: channel.id, duration: 60 });
            if (ret) {
            }
        }
        catch (error) {
        }
    }

    const handlePopupClose = () => {
        setShowPopup(false);
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
                    messages.map((item, key) => {
                    return (
                        <div key={key} className="message">
                            {/*<img*/}
                            {/*    src={item.owner.profile_picture ? item.owner.profile_picture : defaultAvatar}*/}
                            {/*    alt="avatar"*/}
                            {/*    className="message-avatar"*/}
                            {/*/>*/}
                            {
                                item.owner?.id === currentUser?.id ?
                                <div className="message-content-user">
                                <div className="message-header">
                                    <div className="message-username">{item.owner.display_name}</div>
                                    {/*<div className="message-time">{item.created_at}</div>*/}
                                </div>
                                <div className="message-body">{item.text}</div>
                                </div>
                                :
                                <div className="message-content-other">
                                    <div className="message-header">
                                        <div className="message-username">{item.owner.display_name}</div>
                                        {/*<div className="message-time">{item.created_at}</div>*/}
                                    </div>
                                    <div className="message-body">{item.text}</div>
                                </div>
                            }
                        </div>
                    );
                })
                }
                <div ref={bottomChat}></div>
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
            {showPopup &&
                    <div className="popup-settings">
                        <div className="popup-settings-inner">
                            <div className="popup-settings-header">
                                <div className="popup-settings-title">{channel?.display_name}</div>
                                <div className="popup-settings-close" onClick={handlePopupClose}>
                                    <i className="bx bx-x"></i>
                                </div>
                            </div>
                            <div className="popup-settings-content">
                                <ul>
                                    <li style={{ fontWeight: "700" }}>Owner:
                                        <p style={{ fontWeight: "100" }}>{channel.owner?.display_name}</p>
                                    </li>
                                    <li style={{ fontWeight: "700" }}>Users:</li>
                                    <ul>
                                        {users &&
                                            users.length > 0 &&
                                            users.map((item, key) => {
                                                return (
                                                    <li key={key}>
                                                        {item.display_name}
                                                        {currentUser.id === channel.owner.id &&
                                                            currentUser.id !== item.id &&
                                                            <button onClick={() => kickUser(channel, item.id)}>Kick</button>
                                                        }
                                                        {currentUser.id === channel.owner.id &&
                                                            currentUser.id !== item.id &&
                                                            <button onClick={() => banUser(channel, item.id)}>Ban</button>
                                                        }
                                                        {currentUser.id === channel.owner.id &&
                                                            currentUser.id !== item.id &&
                                                            <button onClick={() => muteUser(channel, item.id)}>Mute</button>
                                                        }
                                                    </li>
                                                );
                                            })
                                        }
                                    </ul>
                                </ul>
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}

export default Channel;