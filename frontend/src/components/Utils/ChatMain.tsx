import React, { useEffect, useState } from "react";
import { get, post } from "./Request.tsx";
import Channel from "./Channel.tsx";

function ChatMain() {
    const [friendsList, setFriendsList] = useState([]);
    const [channelList, setChannelList] = useState([]);
    const [selectedList, setSelectedList] = useState("ChatMain");
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [ChannelName, setChannelName] = useState("");
    const [channel, setChannel] = useState("");
    const [chanSettings, setChanSettings] = useState(false);
    const [showList, setShowList] = useState(false);

    // useEffect to get the list of channels and friends
    useEffect(() => {
        (async () => {
            const result = await get("user/self");
            const channels = await get("channel");
            setFriendsList(result.friends);
            setChannelList(channels);
        })();
    }, []);

    // Function to handle button click and update the selected list
    function switchList(listType) {
        setSelectedList(listType);
    }

    const handlePlusButtonClick = (e) => {
        setChanSettings(true);
        setChannel(e);
    }

    const openPopup = () => {
        setShowPopup(true);
    };

    const openChannel = (channel) => {
        setChannel(channel);
        console.log(channelList);
    }

    async function leaveChannel() {
        try {
            console.log(channel);
            await post("channel/leave", { id: channel.id });
            //update channelList to remove the channel
            const newChannelList = channelList.filter((item) => item.id !== channel.id);
            setChannelList(newChannelList);
            setChanSettings(false);
        } catch (error) {
            console.error(error);
        }
    }

    async function createPublicChannel(chan) {
        try {
            const result = await post("channel", { type: "public", name: chan });
            setChannelList([...channelList, result]);
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
                        ChatMain
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
                        {channelList.length > 0 &&
                            channelList.map((item, index) => (
                                <li key={index} onClick={() => openChannel(item)}>
                                    {item?.display_name}
                                    <i className="bx bx-plus" onClick={() => handlePlusButtonClick(item)}></i>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <ul className="Channels">
                        {friendsList.length > 0 &&
                            friendsList.map((item, index) => (
                                <li key={index} onClick={() => openChannel(item)}>
                                    {item?.display_name}
                                    <i className="bx bx-plus"></i>
                                </li>
                            ))}
                    </ul>
                )}
                <div className="bx-cog-container">
                    <i className="bx bx-cog bx-cog-icon" onClick={openPopup}></i>
                </div>
            </div>
            <div className="Chat">
                <div className="ChatBox">
                    <Channel channel={channel} />
                </div>
                <div className="ChatInput">
                    <input
                        type="text"
                        placeholder="Enter Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
            </div>
            {showPopup && (
                <div className="popup">
                    <i className='bx bx-x bx-x-icon' onClick={() => setShowPopup(false)}></i>
                    <div className="popupContent">
                    {/*    input with button to create a public channel */}
                        <div className="CreateChannel">
                            <h3>Create a public channel</h3>
                            <div className="inputButtonWrapper">
                            <input
                                type="text"
                                placeholder="Enter ChatMain Name"
                                value={ChannelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="CreateButton" onClick={() => createPublicChannel(ChannelName)}>Create</button>
                            </div>
                        </div>
                        <div className="ShowPublicChannel">
                            <button>
                                Show Public Channels
                            </button>
                        </div>
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