import React, { useEffect, useState } from "react";
import { get, post } from "./Request.tsx";
import Popup from "./popup.tsx";

function Friendlist() {
    const [list, setList] = useState([]);
    const [friend, setFriend] = useState("");
    const [request, setRequest] = useState([]);
    const [show, setShow] = useState(false);
    const [selectedFriendIndex, setSelectedFriendIndex] = useState(null);
    const [error, setError] = useState(null);
    const defaultAvatar = require("./42-logo.png");

    const popupCloseHandler = (e) => {
        setShow(e);
    };

    async function RemoveFriend(selectedFriend) {
        try {
            await post("user/friend/delete", { id: selectedFriend.id });
            setList(list.filter((item) => item.id !== selectedFriend.id));
            setSelectedFriendIndex(null);
        } catch (error) {
            setError("Error removing friend");
            await timeout(3000);
            setError(null);
        }
    }

    async function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function AddToList() {
        try {
            const user = await get("user?username=" + friend);
            if (!user.id) {
                setFriend("");
                return;
            }
            const result = await post("user/friend", { id: user.id });
            if (result.status === "created") {
                setRequest(request.filter((item) => item.id !== user.id));
                const result = await get("user/self");
                setList(result.friends);
            }
            setFriend("");
        } catch (error) {
            setFriend("");
            setError("User not found");
            await timeout(3000);
            setError(null);
        }
    }

    async function AcceptRequest(selectedFriend) {
        try {
            const user = await get("user?username=" + selectedFriend.display_name);
            if (!user.id) {
                return;
            }
            await post("user/friend", { id: user.id });
            await post("channel", { type: 'dm', other: user.id });
            setList([...list, user]);
            setRequest(request.filter((item) => item.id !== user.id));
        } catch (error) {
            setError("Error accepting friend");
            await timeout(3000);
            setError(null);
        }
    }

    useEffect(() => {
        const handleOutsideClick = (event) => {
            const listElement = document.querySelector(".FriendsList ul");
            const clickedElement = event.target;

            if (listElement && !listElement.contains(clickedElement)) {
                setShow(false);
            }
        };

        document.body.addEventListener("click", handleOutsideClick);

        return () => {
            document.body.removeEventListener("click", handleOutsideClick);
        };
    }, []);


    useEffect(() => {
        (async () => {
            const result = await get("user/self");
            setList(result.friends);
            setRequest(result.receivedRequests);
        })();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            (async () => {
                const result = await get("user/self");
                setList(result.friends);
                setRequest(result.receivedRequests);
            })();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <Popup
                title={list[selectedFriendIndex]?.display_name}
                show={selectedFriendIndex !== null}
                onClose={popupCloseHandler}
            >
                {selectedFriendIndex !== null && (
                    <div className="Popup">
                        <div className="FriendInformation">
                            <img
                                src={list[selectedFriendIndex]?.profile_picture ?? defaultAvatar}/>
                            <p>{list[selectedFriendIndex]?.display_name}</p>
                        </div>
                        <div className="FriendsOptions">
                        <ul>
                            <li
                                className="PopupMessage"
                                onClick={(event) => (window.location.href = "/chat")}
                            >
                                Send Message
                            </li>
                            <li
                                className="PopupRemoveFriend"
                                onClick={() => RemoveFriend(list[selectedFriendIndex])}
                            >
                                Remove Friend
                            </li>
                            <li
                                className="PopupClose"
                                onClick={() => setSelectedFriendIndex(null)}
                            >
                                Close
                            </li>
                        </ul>
                        </div>
                    </div>
                )}
            </Popup>
            <p className="popupError">{error}</p>
            <div className="FriendsList">
                <h2>Friends</h2>
                <div className="FriendsListSearch">
                    <ul>
                        {list.length > 0 &&
                            list.map((item, index) => (
                                <li
                                    key={index}
                                    onClick={() =>
                                        setSelectedFriendIndex(selectedFriendIndex === index ? null : index)
                                    }
                                >
                                    {item?.display_name}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
            <h2>Add Friend</h2>
            <div className="AddFriend">

                <input
                    type="text"
                    placeholder="Username"
                    value={friend}
                    onChange={(e) => setFriend(e.target.value)}
                />
                <button onClick={AddToList}>Add</button>
            </div>
            <div className="RequestReceived">
                <h2>Request Received</h2>
                <ul>
                    {request.length > 0 &&
                        request.map((item) => (
                            <li onClick={() => AcceptRequest(item)}>{item?.display_name}</li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

export default Friendlist;
