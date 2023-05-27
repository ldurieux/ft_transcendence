import React, { useEffect, useState } from "react";
import { get, post } from "./Request.tsx";

function Channel() {
    const [list, setList] = useState([]);
    const [friend, setFriend] = useState("");
    const [channel, setChannel] = useState([]);
    const [error, setError] = useState(null);
    const [selectedList, setSelectedList] = useState("Channel");
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [ChannelName, setChannelName] = useState("");

    // useEffect to get the list of channels and friends
    useEffect(() => {
        (async () => {
            const result = await get("user/self");
            const channels = await get("channel");
            setChannel(channels);
            setList(result.friends);
        })();
    }, []);

    // Function to handle button click and update the selected list
    function switchList(listType) {
        setSelectedList(listType);
    }

    const openPopup = () => {
        setShowPopup(true);
    };

    async function createPublicChannel(chan:string) {
        try {
            const result = await post("channel", { type: "public", name: chan });
            setChannel([...channel, result]);
        }
        catch (error) {
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            // 👇 Get input value
            createPublicChannel(event.target.value);
        }
    };
    console.log(channel);
    return (

        <div className="baguette">
            <div className="ChanList">
                <ul className="ChooseList">
                    {/* 2 buttons to choose channel or friends list */}
                    <button
                        className={`ChanButton ${selectedList === "Channel" ? "ChanButtonSelected" : "ButtonUnselected"}`}
                        onClick={() => switchList("Channel")}
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
                <ul className="Channels">
                    {selectedList === "Channel" &&
                        list.length > 0 &&
                        list.map((item, index) => (
                            <li key={index}>{item?.display_name}</li>
                        ))}
                </ul>
                <div className="bx-cog-container">
                    <i className='bx bx-cog bx-cog-icon' onClick={openPopup}></i>
                </div>
            </div>
            <div className="Chat">
                <div className="ChatBox">
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
                        <input
                            type="text"
                            placeholder="Enter Channel Name"
                            value={ChannelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Channel;
