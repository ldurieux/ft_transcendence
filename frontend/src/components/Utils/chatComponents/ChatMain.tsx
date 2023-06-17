import React, { useEffect, useState } from "react";
import { get, post } from "../Request.tsx";
import Channel from "./Channel.tsx";
import ChannelList from "../list.tsx";

function ChatMain({socket}) {
    const [channelList, setChannelList] = useState([]);
    const [selectedList, setSelectedList] = useState("ChatMain");
    const [showPopup, setShowPopup] = useState(false);
    const [ChannelName, setChannelName] = useState("");
    const [channel, setChannel] = useState(null);
    const [chanSettings, setChanSettings] = useState(false);
    const [chanParams, setChanParams] = useState({});
    const [user, setUser] = useState({});
    const [ChannelPassword, setChannelPassword] = useState("");
    const [popupSelectedList, setPopupSelectedList] = useState("Join");
    const [check, setCheck] = useState(false);

    async function leaveChannel() {
        try {
            const result = await post("channel/leave", { id: channel.id });
            if (result.status >= 400 && result.status <= 500) {
                return ;
            }
            else {
                //update channelList to remove the channel
                const newChannelList = channelList.filter((item) => item.id !== channel.id);
                setChannelList(newChannelList);
                setChanSettings(false);
                setChannel(null);
            }
        } catch (error) {
            console.error(error);
        }
    }

    // useEffect to get the list of channels and friends
    useEffect(() => {
        (async () => {
            try {
                const tmp = await get("user/self");
                setUser(tmp);
                const channels = await get("channel");
                if (channels) {
                    setChannelList(channels);
                }
            }
            catch (error) {
            }
        })();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log(data)
                if (data.event === "leave" && data.user === user.id) {
                    const newChannelList = channelList.filter((item) => item.id !== channel.id);
                    setChannelList(newChannelList);
                    setChanSettings(null);
                    setChannel(null);
                }
            }
        }
    }, [socket, channelList, channel, user]);

    // Function to handle button click and update the selected list
    function switchList(listType) {
        setSelectedList(listType);
    }

    function switchPopupList(listType) {
        setPopupSelectedList(listType);
        setChannelName("");
    }

    const handlePlusButtonClick = (e) => {
        setChanSettings(true);
        setChannel(e);
    }

    const openPopup = () => {
        setShowPopup(true);
    };

    async function openChannel(channel)  {
        setChannel(channel);
        const result = await get ("channel?id=" + channel.id);
        if (result >= 400 && result <= 599) {
            return;
        }
        setChanParams(result);
    }

    async function closeChannel() {
        //remove the channel from the list
        const newChannelList = channelList.filter((item) => item.id !== channel.id);
        setChannelList(newChannelList);
        setChannel(null);
        setChanParams({});
    }

    function updateChannelUsers(channel, updatedUsers) {
        setChannelList(prevChannelList => {
            return prevChannelList.map(prevChannel => {
                if (prevChannel.id === channel.id) {
                    return { ...prevChannel, users: updatedUsers };
                }
                return prevChannel;
            });
        });
    }

    async function createPublicChannel(chan) {
        try {
            if (!check) {
                let result;
                if (chan === "")
                    return;
                if (ChannelPassword !== "")
                    result = await post("channel", {type: "public", name: chan, password: ChannelPassword});
                else
                    result = await post("channel", {type: "public", name: chan});
                console.log(result)
                if (result.status >= 400 && result.status <= 500) {
                    return;
                } else {
                    setChannelList([...channelList, result]);
                    setChannelPassword("");
                    setChannelName("");
                }
            }
            else {
                let result;
                if (chan === "")
                    return;
                result = await post("channel", {type: "private", name: chan});
                console.log(result)
                if (result.status >= 400 && result.status <= 500) {
                    return;
                } else {
                    setChannelList([...channelList, result]);
                    setChannelPassword("");
                    setChannelName("");
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function joinChannel(chan, password = "") {
        try {
            console.log(password)
            let result;
            if (password === "")
                result = await post("channel/join", { id: chan.id });
            else
                result = await post("channel/join", { id: chan.id, password: password });
            console.log(result)
            if (!result) {
                return true;
            }
            else
                setChannelList([...channelList, chan]);
            return false;
        } catch (error) {
            console.error(error);
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            // 👇 Get input value
            createPublicChannel(event.target.value);
            // 👇 Reset input value
            event.target.value = '';
            setChannelName("");
        }
    };

    return (

        <div className="baguette">
            <div className="ChanList">
                <ul className="ChooseList">
                    {/* 2 buttons to choose channel or friends list */}
                    <button
                        className={`ChanButton ${selectedList === "ChatMain" ? "ChanButtonSelected" : "ButtonUnselected"}`}
                        onClick={() => switchList("ChatMain")}
                    >
                        Channel
                    </button>
                    <button
                        className={`ChanButton ${selectedList === "Friends" ? "ChanButtonSelected" : "ButtonUnselected"}`}
                        onClick={() => switchList("Friends")}
                    >
                        Friends
                    </button>
                </ul>
                {selectedList === "ChatMain" ? (
                    <ul className="Channels">
                        {channelList && channelList.length > 0 &&
                            channelList.map((item, index) => {
                                if (item.type !== "dm") {
                                    return (
                                        <li key={index} onClick={() => openChannel(item)}>
                                            {item?.display_name}
                                            {channel?.id === item?.id &&
                                                <i className='bx bx-exit' onClick={leaveChannel}></i>
                                            }
                                        </li>
                                    );
                                }
                                return null;
                            })}
                    </ul>
                ) : (
                    <ul className="Channels">
                        {channelList && channelList.length > 0 &&
                            channelList.map((item, index) => {
                                if (item.type === "dm") {
                                    return (
                                        <li key={index} onClick={() => openChannel(item)}>
                                            {item?.display_name}
                                            <i className="bx bx-plus" onClick={() => handlePlusButtonClick(item)}></i>
                                        </li>
                                    );
                                }
                                return null;
                            })}
                    </ul>
                )}
                <div className="bx-cog-container">
                    <i className="bx bx-cog bx-cog-icon" onClick={openPopup}></i>
                </div>
            </div>
            <div className="Chat">
                {channel &&
                    chanParams &&
                    (
                    <div className="ChatBox">
                        <Channel
                            socket={socket}
                            channel={chanParams}
                            currentUser={user}
                            setChanParams={setChanParams}
                            setChannelList={setChannelList}
                            updateChannelUsers={updateChannelUsers}
                            closeChannel={closeChannel}
                        />
                    </div>
                )}
            </div>
            {showPopup && (
                <div className="popup">
                    <i className='bx bx-x bx-x-icon' onClick={() => setShowPopup(false)}></i>
                    <div className="popupContent">
                        <ul className="ChooseList">
                            <button
                                className={`ChanButton ${selectedList === "ChatMain" ? "ChanButtonSelected" : "ButtonUnselected"}`}
                                onClick={() => switchPopupList("Join")}
                            >
                                Join channel
                            </button>
                            <button
                                className={`ChanButton ${selectedList === "Friends" ? "ChanButtonSelected" : "ButtonUnselected"}`}
                                onClick={() => switchPopupList("Create")}
                            >
                                Create channel
                            </button>
                        </ul>
                        {popupSelectedList === "Join" ? (
                            <div className="JoinChannel">
                            <h3>Join channel</h3>
                            <ChannelList
                                onClick={joinChannel}
                            />
                        </div>
                            ) : (
                        <div className="CreateChannel">
                            <h3>Create a channel</h3>
                            <div className="inputButtonWrapper">
                                <div className="privateChannel">
                                    <input
                                        type="checkbox"
                                        id="private"
                                        name="private"
                                        checked={check}
                                        onChange={() => setCheck(!check)}
                                    />
                                    Private
                                </div>
                            <input className="nameInput"
                                type="text"
                                maxLength={15}
                                placeholder="Name"
                                value={ChannelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                                {!check &&
                                    <input className="passwordInput"
                                        type="text"
                                        maxLength={15}
                                        placeholder="Password: optional"
                                        value={ChannelPassword}
                                        onChange={(e) => setChannelPassword(e.target.value)}
                                        />
                                }
                            <button className="CreateButton" onClick={() => createPublicChannel(ChannelName)}>Create</button>
                            </div>
                        </div>
                        )
                        }
                    </div>
                </div>
            )}
            {chanSettings && (
                <div className="popup">
                    <i className='bx bx-x bx-x-icon' onClick={() => setChanSettings(false)}></i>
                    <div className="popupContent">
                        <button className="leaveButton" onClick={leaveChannel}>Leave ChatMain</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatMain;
