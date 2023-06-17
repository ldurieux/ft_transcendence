import React, {useContext, useEffect, useState, useRef} from "react";
import { useNavigate } from 'react-router-dom';
import "../../Styles/channelStyles.css";
import { get, post } from "../Request.tsx";
import {PopupContext} from "./PopupContext.tsx";
import "../../Styles/messageStyles.css";
import "../../Styles/PopupStyles.css";
import Popup from "../popup.tsx";

function Channel({ socket, channel, currentUser, setChanParams, setChannelList, updateChannelUsers, closeChannel }) {
    const bottomChat = useRef<null | HTMLDivElement>(null);
    const { showPopup, setShowPopup } = useContext(PopupContext);
    const isDM: boolean = channel.type === "dm";
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [Owner, setOwner] = useState({});
    const [admins, setAdmins] = useState([]);
    const [username, setUsername] = useState("");
    const defaultAvatar = require("./42-logo.png");

    useEffect(() => {
        if (bottomChat.current) {
            bottomChat.current?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
        }
    }, [socket, messages]);

    useEffect(() => {
        (async () => {
            try {
                if (channel.id !== undefined) {
                    const message = await get("channel/message?id=" + channel.id);
                    const userMap = channel.users.reduce((map, user) => {
                        map[user.id] = user;
                        return map;
                    }, {});
                    setUsers(userMap);
                    if (message) {
                        setMessages(message);
                    }
                }
                //search if the current user is in admins list
                if (channel.admins) {
                    setAdmins(channel.admins)
                    const admin = channel.admins.find((admin) => admin.id === currentUser.id);
                    if (admin) {
                        setIsAdmin(true);
                    }
                }
                //search if the current user is the owner of the channel
                if (channel.owner) {
                    setOwner(channel.owner);
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

    async function blockUser() {
        try {
            let ret;
            console.log(currentUser.id, selectedUser.id)
            if (currentUser.id !== selectedUser.id) {
                ret = await get(`user/block?id=` + selectedUser.id);
                if (ret) {
                    //get message
                    const message = await get("channel/message?id=" + channel.id);
                    if (message) {
                        setMessages(message);
                        setSelectedUser(null);
                    }
                }
            }
        }
        catch (error) {

        }
    }

    async function promoteUser(channel,user) {
        try {
            const ret = await post(`channel/promote`, { userId: user.id, channelId: channel.id });
            if (ret) {
                //add in admin list
                setAdmins((prev) => [...prev, user]);
            }
        }
        catch (error) {
        }
    }

    async function demoteUser(channel,user) {
        try {
            const ret = await post(`channel/demote`, { userId: user.id, channelId: channel.id });
            if (ret) {
                //remove from admin list
                setAdmins((prev) => {
                    return prev.filter((admin) => admin.id !== user.id);
                });
            }
        }
        catch (error) {
        }
    }

    async function inviteUser(channel) {
        try {
            const ret = await post(`channel/add`, { username: username, channelId: channel.id });
            if (ret?.status === "added") {
                setUsername("");
            }
        }
        catch (error) {
            setUsername("");
        }
    }

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    const popupCloseHandler = (e) => {
        setShow(e);
    };

    return (
        <div className="channel">
            <Popup
                title={selectedUser?.display_name}
                show={selectedUser !== null}
                onClose={popupCloseHandler}
            >
                {setSelectedUser !== null && (
                    <div className="Popup">
                        <div className="FriendInformation">
                            <img
                                alt={selectedUser?.display_name}
                                src={users[selectedUser?.id]?.profile_picture ?? defaultAvatar}/>
                            <p>{selectedUser?.display_name}</p>
                        </div>
                        <div className="FriendsOptions">
                            <ul>
                                <li
                                    className="PopupBlockUser"
                                    onClick={blockUser}
                                >
                                    Block
                                </li>
                                <li
                                    className="PopupClose"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    Close
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </Popup>
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
                        console.log(item)
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
                                    <div className="message-username">{users[item.owner.id].display_name}</div>
                                    {/*<div className="message-time">{item.created_at}</div>*/}
                                </div>
                                <div className="message-body">{item.text}</div>
                                </div>
                                :
                                <div className="message-content-other">
                                    <div className="message-header">
                                        <div className="message-username"
                                            onClick={() => setSelectedUser(item.owner)}
                                        >{item.owner.display_name}</div>
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
                    maxLength={4096}
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
                                    <ul style={{ fontWeight: "700" }}>Moderators:
                                        <p style={{ fontWeight: "100" }}>
                                            {
                                            admins &&
                                            admins.length > 0 &&
                                            admins.map((item, key) => {
                                                return (
                                                    <li key={key}>
                                                        {item?.display_name}
                                                        {currentUser.id === Owner.id &&
                                                            <button onClick={() => demoteUser(channel, item)}>Demote</button>
                                                        }
                                                    </li>
                                                )
                                            })
                                        }
                                        </p>
                                    </ul>
                                    <li style={{ fontWeight: "700" }}>Users:</li>
                                    <ul>
                                        {users &&
                                            users.length > 0 &&
                                            users.map((item, key) => {
                                                return (
                                                    <li key={key}>
                                                        {item.display_name}
                                                        {/*add or condition if user is in list admin*/}
                                                        {(currentUser.id === channel.owner.id || isAdmin) &&
                                                            currentUser.id !== item.id && item.id !== channel.owner.id &&
                                                            <button onClick={() => kickUser(channel, item.id)}>Kick</button>
                                                        }
                                                        {(currentUser.id === channel.owner.id || isAdmin) &&
                                                            currentUser.id !== item.id && item.id !== channel.owner.id &&
                                                            <button onClick={() => banUser(channel, item.id)}>Ban</button>
                                                        }
                                                        {(currentUser.id === channel.owner.id || isAdmin) &&
                                                            currentUser.id !== item.id && item.id !== channel.owner.id &&
                                                            <button onClick={() => muteUser(channel, item.id)}>Mute</button>
                                                        }
                                                        {(currentUser.id === channel.owner.id || isAdmin) &&
                                                            currentUser.id !== item.id && item.id !== channel.owner.id &&
                                                            <button onClick={() => promoteUser(channel, item)}>Promote</button>
                                                        }
                                                    </li>
                                                );
                                            })
                                        }
                                    </ul>
                                    {(currentUser.id === channel.owner.id || isAdmin) &&
                                        channel.type === "private" &&
                                    <ul>
                                        <input
                                            type="text"
                                            placeholder="Invite user"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                        <button onClick={() => inviteUser(channel)}>Invite</button>
                                    </ul>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}

export default Channel;