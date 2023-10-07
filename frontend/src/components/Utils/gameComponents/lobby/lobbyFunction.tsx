import { post } from "../../Request.tsx";
import React from 'react';
import "../../../Styles/lobbyStyles.css"

export function inviteFriend(friendId:number, typeOfGame:number) {
    const friends = post("game/invite", {id: friendId, typeOfGame: typeOfGame});
    return friends;
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

export const isInGame = (isInGame) => {
    console.log("truc = ", isInGame);
    if (isInGame === true)
    {
        return(
            <div className="resume-container">
                <button className="button" onClick={() => {window.location.href = "/game"}}>RESUME</button>
            </div>
        )
    }
    return null;
}