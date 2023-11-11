import React, {useContext, useEffect, useState, useRef} from "react";
import "../../Styles/channelStyles.css";
import { get, post } from "../Request.tsx";
import {PopupContext} from "./PopupContext.tsx";
import "../../Styles/messageStyles.css";
import "../../Styles/PopupStyles.css";
import Popup from "../popup.tsx";
import InvitePopup from "../popupComponents/invitePopup/popupInvite.tsx";
import Linkify from 'react-linkify';

function Channel({ socket, channel, currentUser, setChanParams, setChannelList, updateChannelUsers, closeChannel }) {
    const bottomChat = useRef<null | HTMLDivElement>(null);
    const [owner, setOwner] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const { showPopup, setShowPopup } = useContext(PopupContext);
    const isDM: boolean = channel.type === "dm";
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [username, setUsername] = useState("");
    const defaultAvatar = require("./42-logo.png");
    const [id, setId] = useState<number>(0);
    const [userName, setUserName] = useState<string>("");
    const [typeOfGame, setTypeOfGame] = useState<string>("");
    const [popupVisible, setPopupVisible] = useState<boolean>(false);

    useEffect(() => {
        if (bottomChat.current) {
            bottomChat.current?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
        }
    }, [socket, messages]);

    useEffect(() => {
        (async () => {
            try {
                if (channel.id !== undefined) {
                    setNewPassword("");
                    const message = await get("channel/message?id=" + channel.id);
                    const userMap = channel.users.reduce((map, user) => {
                        map[user.id] = user;
                        return map;
                    }, {});
                    setUsers(userMap);
                    setOwner(channel.owner)
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
            }
            catch (error) {
                return error;
            }
        })();
    }, [channel, currentUser.id]);

    const handleClose = () => {
        setPopupVisible(false);
    }

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const ret = JSON.parse(event.data)
                if (ret.event === "leave" && ret.data.channel === channel.id) {
                    //remove the user who left from the channel
                    setUsers(prev => {
                        const updatedUsers = { ...prev };
                        delete updatedUsers[ret.data.user];
                        return updatedUsers;
                    });
                    if (ret.data.user === currentUser.id)
                        closeChannel();
                }
                else if (ret.event === "delete" && ret.data.channel === channel.id) {
                    closeChannel();
                }
                if (ret.event === "join" && ret.data.channel === channel.id) {
                    //add the user who joined to the channel
                    setUsers(prev => {
                        const updatedUsers = { ...prev };
                        updatedUsers[ret.data.user.id] = ret.data.user;
                        return updatedUsers;
                    });
                }
                else if (ret.event === "message") {
                    //add the message to the messages list
                    if (ret.data.channel === channel.id)
                        setMessages((prev) => [...prev, ret.data]);
                }
                // else if (ret.event === "connect") {
                //     //update user status to online in userlist
                //     setUsers(prev => {
                //         const updatedUsers = { ...prev };
                //         updatedUsers[ret.data.user].status = "online";
                //         return updatedUsers;
                //     }
                //     );
                // }
                // else if (ret.event === "disconnect") {
                //     //update user status to offline in userlist
                //     setUsers(prev => {
                //         const updatedUsers = { ...prev };
                //         updatedUsers[ret.data.user].status = "offline";
                //         return updatedUsers;
                //     }
                //     );
                // }
                else if (ret.type === "gameStart") {
                    window.location.href = "/game";
                }
                else if (ret.type === "invite") {
                    setId(ret.id);
                    setUserName(ret.user);
                    if (ret.typeOfGame === 1)
                        setTypeOfGame("classic game");
                    if (ret.typeOfGame === 2)
                        setTypeOfGame("deluxe game");
                    setPopupVisible(true);
                }
                else if (ret.type === "inviteTimeout")
                    setPopupVisible(false);
                else if (ret.type === "inviteRefused")
                    setPopupVisible(false);
            };
        }
    }, [socket, channel, currentUser.id, closeChannel]);

    if (!channel) {
        return null;
    }

    async function sendMessage(channelId) {
        if (message.length !== 0)
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
                const result = await post(`channel/kick`, { userId: userId, channelId: channel.id });
                if (result) {
                    // Update the users list
                    setUsers(prev => {
                        const updatedUsers = {...prev};
                        delete updatedUsers[userId];
                        return updatedUsers;
                    });

                    // Update the channel list in the parent component
                    updateChannelUsers(channel, users);
                }
                return result;

        } catch (error) {
            // Gérer l'erreur ici
            console.error("Erreur lors de la suppression de l'utilisateur :", error);
        }
    }

    async function banUser(channel, userId) {
        try {
            const ret = await post(`channel/ban`, { userId: userId, channelId: channel.id, duration: 86400 });
            if (ret) {
                //update the users list
                setUsers(prev => {
                    const updatedUsers = { ...prev };
                    delete updatedUsers[userId];
                    return updatedUsers;
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
            if (currentUser.id !== selectedUser.id) {
                ret = await get(`user/block?id=` + selectedUser.id);
                if (ret) {
                    await post("channel/delete", { id: selectedUser.id });
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

    async function inviteClassicGame() {
        try {
            if (currentUser.id !== selectedUser.id) {
                post("game/invite", {id: selectedUser.id, typeOfGame: 1});
                setSelectedUser(null);
            }
        }
        catch (error) {
        }
    }

    async function inviteDeluxeGame() {
        try {
            if (currentUser.id !== selectedUser.id) {
                post("game/invite", {id: selectedUser.id, typeOfGame: 2});
                setSelectedUser(null);
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
            if (ret.status === "added") {
                setUsername("");
            }
        }
        catch (error) {
            setUsername("");
        }
    }

    async function changePassword(channel) {
        try {
            const ret = await post(`channel/update`, { id: channel.id, password: newPassword });
            if (ret.status === "updated") {
                setNewPassword("");
            }
        }
        catch (error) {
        }
    }

    const KeyPressPassword = (e) => {
        if (e.key === "Enter") {
            changePassword(channel)
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
            {
                    popupVisible ? (
                        <div className="popup-container">
                            <InvitePopup
                                props={{userName, typeOfGame, id}}
                                handleClose={handleClose}
                            />
                        </div>
                    ) : null
            }
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
                            <p>{users[selectedUser?.id]?.status}</p>
                        </div>
                        <div className="FriendsOptions">
                            <ul>
                                <li
                                    className="PopupClose"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    Close
                                </li>
                                <li
                                    className="PopupBlockUser"
                                    onClick={blockUser}
                                >
                                    Block
                                </li>
                                <li
                                    className="classicGame"
                                    onClick={inviteClassicGame}
                                >
                                    Classic game
                                </li>
                                <li
                                    className="deluxeGame"
                                    onClick={inviteDeluxeGame}
                                >
                                    Deluxe game
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
                                    <div className="message-username">{users[item.owner?.id]?.display_name}</div>
                                    {/*<div className="message-time">{item.created_at}</div>*/}
                                </div>
                                    <div className="message-body">
                                        <Linkify componentDecorator={(decoratedHref, decoratedText, key) => ( <a target="blank" href={decoratedHref} key={key}> {decoratedText} </a> )} >
                                            {item.text}
                                        </Linkify>
                                    </div>
                                </div>
                                :
                                <div className="message-content-other">
                                    <div className="message-header">
                                        <div className="message-username"
                                            onClick={() => setSelectedUser(item?.owner)}
                                        >{item.owner?.display_name}</div>
                                        {/*<div className="message-time">{item.created_at}</div>*/}
                                    </div>
                                    <div className="message-body">
                                        <Linkify componentDecorator={(decoratedHref, decoratedText, key) => ( <a target="blank" href={decoratedHref} key={key}> {decoratedText} </a> )} >
                                            {item.text}
                                        </Linkify>
                                    </div>
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
                                {owner?.id === currentUser?.id &&
                                    channel.type !== "dm" && channel.type !== "private" &&
                                    <div className="ChangePassword">
                                        <input
                                            type="text"
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            onKeyDown={KeyPressPassword}
                                        />
                                    </div>
                                }
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
                                                        {
                                                            (currentUser.id === channel.owner?.id) &&
                                                            currentUser.id !== item.id &&
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
                                        {Object.values(users).map((user) => (
                                            <div key={user?.id}>
                                                <p>{user?.display_name}</p>
                                                {currentUser.id === channel.owner?.id &&
                                                    currentUser.id !== user.id &&
                                                    <div>
                                                        <button onClick={() => promoteUser(channel, user)}>Promote</button>
                                                        <button onClick={() => kickUser(channel, user.id)}>Kick</button>
                                                        <button onClick={() => banUser(channel, user.id)}>Ban</button>
                                                        <button onClick={() => muteUser(channel, user.id)}>Mute</button>
                                                    </div>
                                                }
                                                {
                                                    currentUser.id !== user.id &&
                                                    isAdmin && !admins.includes(user.id) &&
                                                    <div>
                                                        <button onClick={() => promoteUser(channel, user)}>Promote</button>
                                                        <button onClick={() => kickUser(channel, user.id)}>Kick</button>
                                                        <button onClick={() => banUser(channel, user.id)}>Ban</button>
                                                        <button onClick={() => muteUser(channel, user.id)}>Mute</button>
                                                    </div>
                                                }
                                                {/* Display other user information */}
                                            </div>
                                        ))}
                                    </ul>
                                    {(currentUser.id === channel.owner?.id || isAdmin) &&
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