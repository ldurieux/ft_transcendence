import React, { useEffect, useState } from "react";
import { get, post } from "./Request.tsx";
import Popup from "./popup.tsx";

function Friendlist() {
    const [list, setList] = useState([]);
    const [friend, setFriend] = useState("");
    const [request, setRequest] = useState([]);
    const [selectedFriendIndex, setSelectedFriendIndex] = useState(null);
    const [error, setError] = useState(null);
    const [blocked, setBlocked] = useState([]);
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

    // useEffect(() => {
    //     const handleOutsideClick = (event) => {
    //         const listElement = document.querySelector(".FriendsList ul");
    //         const clickedElement = event.target;
    //
    //     };
    //
    //     document.body.addEventListener("click", handleOutsideClick);
    //
    //     return () => {
    //         document.body.removeEventListener("click", handleOutsideClick);
    //     };
    // }, []);

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            AddToList();
        }
    }

    async function blockUser() {
        try {
            await post("user/block", { id: list[selectedFriendIndex].id });
            setBlocked([...blocked, list[selectedFriendIndex]]);
            setList(list.filter((item) => item.id !== list[selectedFriendIndex].id));
            setSelectedFriendIndex(null);
        }
        catch (error) {
            setError("Error blocking user");
            await timeout(3000);
            setError(null);
        }
    }

    async function unblockUser(userId) {
        try {
            let ret = await get(`user/unblock?id=` + userId);
            if (ret)
                setBlocked(blocked.filter((item) => item.id !== userId));
            setSelectedFriendIndex(null);
        }
        catch (error) {
            setError("Error unblocking user");
            await timeout(3000);
            setError(null);
        }
    }

    useEffect(() => {
        (async () => {
            const result = await get("user/self");
            setList(result.friends);
            setRequest(result.receivedRequests);
            setBlocked(result.blocked);
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
                                alt={list[selectedFriendIndex]?.display_name}
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
                                className="PopupBlock"
                                onClick={() => blockUser()}
                            >
                                Block User
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
                    maxLength={15}
                    placeholder="Username"
                    value={friend}
                    onChange={(e) => setFriend(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={AddToList}>Add</button>
            </div>
            <div className="RequestReceived">
                <h2>Request Received</h2>
                <ul>
                    {request.length > 0 &&
                        request.map((item, key) => (
                            <li key={key} onClick={() => AcceptRequest(item)}>{item?.display_name}</li>
                        ))}
                </ul>
            </div>
            <div className="BlockedUser">
                <h2>Blocked User</h2>
                <ul>
                    {blocked.length > 0 &&
                        blocked.map((item, key) => (
                            <li key={key}>
                                {item.display_name}
                                <button onClick={() => unblockUser(item.id)}>Unblock</button>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

export default Friendlist;
