import { post, get } from "../../Request.tsx";
import React, { useEffect } from 'react';
import "../../../Styles/lobbyStyles.css"

export function inviteFriend(friendId:number, typeOfGame:number) {
    const friends = post("game/invite", {id: friendId, typeOfGame: typeOfGame});
    return friends;
}

export const Popup = props => {
    const hanfleClickOutside = (e) => {
        if (e.target.className === "Popup-box") {
            props.handleclose();
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", hanfleClickOutside);
        return () => {
            document.removeEventListener("mousedown", hanfleClickOutside);
        }
    }, []);

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

async function matchMakingRequest(typeOfGame): Promise<boolean>
{
    const response = await post('game/MatchMaking', {typeOfGame});
    return (response);
}

export const getIsInMatchMaking = () => {
    const isInMatchMaking = get("game/isInMatchMaking");
    return isInMatchMaking;
}

export const isInGame = () => {
    return(
        <div className="resume-container">
            <button className="button" onClick={() => {window.location.href = "/game"}}>RESUME</button>
        </div>
    )
}