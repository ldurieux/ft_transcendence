import { useState, useEffect } from 'react';
import * as React from 'react';
import "../../Styles/lobbyStyles.css" 
import * as lobbyFunction from "./lobby/lobbyFunction.tsx"

export default function LobbyPage() {
    const [invitePopup, setInvitePopup] = useState(false);
    const [matchPopup, setMatchPopup] = useState(false);

    const toggleinvitePopup = () => {
        setInvitePopup(!invitePopup);
    }

    const toggleMatchPopup = () => {
        setMatchPopup(!matchPopup);
    }

    const toggleMatchmaking = (gameType) => {
        lobbyFunction.matchMaking(gameType);
    }

    return (
        <div className="Lobby">
            <div className="center">
                <button className="button" onClick={toggleinvitePopup}>INVITE</button>
                    {invitePopup && <lobbyFunction.Popup
                        Content={<>
                            <p className="PopupTitle">Invite</p>
                            <lobbyFunction.Friends/>
                        </>}
                        handleclose={toggleinvitePopup}
                    />}
                <button className="button" onClick={toggleMatchPopup}>MATCHMAKING</button>
                    {matchPopup && <lobbyFunction.Popup
                        Content={<>
                            <p className="PopupTitle">Matchmaking</p>
                            <div className="elementPopupCenter-h elementPopupCenter-l">
                                <button className="button" onClick={() => toggleMatchmaking(1)}>ClassicGame</button>
                                <button className="button" onClick={() => toggleMatchmaking(2)}>DeluxeGame</button>
                            </div>
                        </>}
                        handleclose={toggleMatchPopup}
                    />}
            </div>
        </div>
    )
}