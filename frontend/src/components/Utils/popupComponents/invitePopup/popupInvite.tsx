import React from 'react';
import { post } from "../../Request.tsx";
import "./popupStyle.css";


export default function InvitePopup(props: any) {
    
    console.log("props = ", props);
    
    async function acceptInvite(id) {
        console.log(id);
        await post("game/inviteResponse", {inviteId: id, response: true});
        props.handleClose();
    }

    async function declineInvite(id) {
        console.log(id);
        await post("game/inviteResponse", {inviteId: id, response: false});
        props.handleClose();
    }

    return (
        <div className="popup">
            <div className="popup-inner">
                <div className="popup-header">
                    <h1>Invite</h1>
                </div>
                <div className="popup-content">
                    <p>{props.props.userName} invited you to a {props.props.typeOfGame}.</p>
                </div>
                <button id="accept-button" onClick={() => acceptInvite(props.props.id)}>Accept</button>
                <button id="decline-button" onClick={() => declineInvite(props.props.id)}>Decline</button>
            </div>
            <button className="close-button" onClick={() => props.handleClose()}>X</button>
        </div>
    );
}