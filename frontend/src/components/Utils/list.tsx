import React from "react";
import "../Styles/listStyles.css";
import { useState, useEffect } from "react";
import { get } from "./Request.tsx";

async function getPublicChannels() {
    const result = await get("channel/public");
    return result;
}

function ChannelList({onClick, showList = false}) {
    const [list, setList] = useState([]);

    useEffect(() => {
        (async () => {
            const channels = await getPublicChannels();
            setList(channels);
        })();
    }, []);

    return (
        <div className="list">
            {showList &&
                list.length > 0 &&
                list.map((item, key) => {
                    if (item.type !== "dm") {
                        return (
                            <li key={key} onClick={() => onClick(item)}>
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