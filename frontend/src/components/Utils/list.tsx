import React, { useState, useEffect } from "react";
import "../Styles/listStyles.css";
import { get } from "./Request.tsx";

async function getPublicChannels() {
    const result = await get("channel/public");
    if (result) {
        return result;
    }
    return null;
}

function ChannelList({ onClick }) {
    const [list, setList] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [password, setPassword] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const channels = await getPublicChannels();
                if (channels) setList(channels);
            } catch (error) {
                return error;
            }
        })();
    }, []);

    const handleChannelClick = (channel) => {
        // if (selectedChannel === channel) {
        //     setSelectedChannel(null);
        //     setPassword("");
        //     return;
        // }
        setSelectedChannel(channel);
        setPassword("");
    };

    const handleJoinClick = async () => {
        let error = true;
        if (password === "") {
            error = await onClick(selectedChannel);
        }
        else
            error = await onClick(selectedChannel, password);
        console.log(error)
        if (error === true) {
            console.log("error")
            setSelectedChannel(null);
            setPassword("");
        }
        else {
            console.log("no error")
            //remove channel we join from list
            setList(list.filter((item) => item.id !== selectedChannel.id));
            setSelectedChannel(null);
            setPassword("");
        }
    };

    return (
        <div className="list">
            <ul>
                {list.length > 0 &&
                    list.map((item, key) => {
                        if (item.type !== "dm") {
                            return (
                                <li key={key} onClick={() => handleChannelClick(item)}>
                                    {item?.display_name}
                                    <div className="password">
                                        {selectedChannel === item && (
                                            <>
                                                <input
                                                    type="password"
                                                    placeholder="password ?"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <button onClick={handleJoinClick}>Join</button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        }
                        return null;
                    })}
            </ul>
        </div>
    );
}

export default ChannelList;
