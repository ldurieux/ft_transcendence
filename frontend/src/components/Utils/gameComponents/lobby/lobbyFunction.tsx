import { get, post } from "../../Request.tsx";
import React, { component } from 'react';
import "../../../Styles/lobbyStyles.css"

export function getFriendsList() {
    const friends = get("user/friends");
    return friends;
}

export function inviteFriend(friendId) {
    const friends = post("game/invite", {friend_id: friendId});
    return friends;
}

export function cancelMatchMaking() {
    const friends = post("game/CancelMatchMaking");
}

export const Popup = props => {
    return (
        <div className='Popup-box'>
            <div className='box'>
                <span className='close-icon' onClick={props.handleclose}>x</span>
                {props.Content}
            </div>
        </div>
    );
}

export const matchMaking = (typeOfGame) => {
    matchMakingRequest(typeOfGame);
}

function matchMakingRequest(typeOfGame)
{
        post('game/MatchMaking', {typeOfGame});
}

export const Friends = () => {
}