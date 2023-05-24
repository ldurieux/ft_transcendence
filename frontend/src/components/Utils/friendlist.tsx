import React, {useEffect, useState} from "react";
import {get, post} from "./Request.tsx";
import Popup from "./popup.tsx";

function Friendlist() {
    const [list, setList] = useState([]);
    const [friend, setFriend] = useState("");
    const [request, setRequest] = useState([]);
    const [show, setShow] = useState(false);
    const [selectedFriendIndex, setSelectedFriendIndex] = useState(null);


    const popupCloseHandler = (e) => {
        setShow(e);
    }
    async function RemoveFriend(selectedFriend) {
        try {
            await post('user/friend/delete', { id: selectedFriend.id });
            setList(list.filter((item) => item.id !== selectedFriend.id));
            setSelectedFriendIndex(null);
        } catch (error) {
            console.log(error);
        }
    }


    async function AddToList() {
        try {
            let newList = list;
            console.log(friend)
            const user = await get('user?username=' + friend);
            if (!user.id) {
                return ;
            }
            const result = await post('user/friend', {id: user.id});
            if (result.ok) {
                newList.push(user);
                setList(newList);
                setFriend(" ");
                setRequest(request.filter((item) => item.id !== user.id));
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        (async () => {
            const result = await get('user/self');
            setList(result.friends);
            setRequest(result.receivedRequests);
        })()
    }, [])

  return (
      <div>
          <div className="FriendsList">
            <h2>Friends</h2>
              <div className="FriendsListSearch">
                  <ul>
                      {list.length > 0 &&
                          list.map((item, index) => (
                              <li onClick={() => setSelectedFriendIndex(selectedFriendIndex === index ? null : index)}>
                                  {item?.display_name}
                              </li>
                          ))}
                  </ul>
              </div>
              <Popup title={list[selectedFriendIndex]?.display_name} show={selectedFriendIndex !== null} onClose={popupCloseHandler}>
                  {selectedFriendIndex !== null && (
                      <div className="Popup">
                          <ul>
                              <li className="PopupMessage" onClick={event => window.location.href = "/chat"}>
                                  Send Message
                              </li>
                              <li className="PopupRemoveFriend" onClick={() => RemoveFriend(list[selectedFriendIndex])}>
                                  Remove Friend
                              </li>
                          </ul>
                      </div>
                  )}
              </Popup>

          </div>
          <div className="AddFriend">
              <h2>Add Friend</h2>
              <input type="text" placeholder="Username"
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
              />
              <button onClick={AddToList}>Add</button>
          </div>
          <div className="RequestReceived">
                <h2>Request Received</h2>
                <ul>{request.length > 0 && request.map((item) => (<li>{item?.display_name}</li>))}</ul>
          </div>
      </div>
  );
}

export default Friendlist;