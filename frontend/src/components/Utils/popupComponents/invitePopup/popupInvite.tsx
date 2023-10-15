import React from 'react';
import { post } from "../../Request.tsx";
import "./popupStyle.css";


export default function InvitePopup(props: any) {
    
    
    async function acceptInvite(id) {
        await post("game/inviteResponse", {inviteId: id, response: true});
        props.handleClose();
    }

    async function declineInvite(id) {
        await post("game/inviteResponse", {inviteId: id, response: false});
        props.handleClose();
    }

    return (
        <div className="popup-invite">
            <h1 className="popup-invite-title">Invite</h1>
            <div className="popup-invite-content">
                <p>{props.props.userName} invited you to a {props.props.typeOfGame}.</p>
            </div>
            <button id="accept-invite-button" onClick={() => acceptInvite(props.props.id)}>Accept</button>
            <button id="decline-invite-button" onClick={() => declineInvite(props.props.id)}>Decline</button>
        </div>
    );
}