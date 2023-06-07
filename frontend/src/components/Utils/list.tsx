import React from "react";
import "../Styles/listStyles.css";
import { useState, useEffect } from "react";
import { get } from "./Request.tsx";

async function getPublicChannels() {
    const result = await get("channel/public");
    if (result) {
        return result;
    }
    return null;
}

function ChannelList({onClick, showList = false}) {
    const [list, setList] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const channels = await getPublicChannels();
                if (channels)
                    setList(channels);
            }
            catch (error) {
                return error;
            }
        })();
    }, []);

    const handleChannelClick = (e) => {
        onClick(e);
        //remove the channel from the list
        setList(list.filter((item) => item.id !== e.id));
    }

    return (
        <div className="list">
            {showList &&
                list.length > 0 &&
                list.map((item, key) => {
                    if (item.type !== "dm") {
                        return (
                            <li key={key} onClick={() => handleChannelClick(item)}>
                                {item?.display_name}
                            </li>
                        );
                }
                return null;
            })}
        </div>
    );
}

export default ChannelList;