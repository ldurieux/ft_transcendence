import { useState, useEffect } from 'react';
import { get } from "../Request.tsx";
import * as React from 'react';
import "../../Styles/lobbyStyles.css" 
import * as lobbyFunction from "./lobby/lobbyFunction.tsx"

export default function LobbyPage() {
    const [invitePopup, setInvitePopup] = useState(false);
    const [matchPopup, setMatchPopup] = useState(false);
    const [isIngame, setIsIngame] = useState(false);
    const [friend, setFriend] = useState([]);
    const [matchHistory, setMatchHistory] = useState([]);

    async function fetchData() {
        await getFriendsList();
        await getMatchHistory();
        await getIsIngame();
    }

    useEffect(() => {
        fetchData();
    }, [])

    const toggleinvitePopup = () => {
        setInvitePopup(!invitePopup);
    }

    const toggleMatchPopup = () => {
        setMatchPopup(!matchPopup);
    }

    const toggleMatchmaking = (gameType) => {
        lobbyFunction.matchMaking(gameType);
    }

    async function getFriendsList() {
        const me = await get("user/self");
        setFriend(me.friends);
    }

    async function getMatchHistory() {
        const me = await get("game/matchHistory");
        console.log(me);
        setMatchHistory(me);
    }

    async function getIsIngame() {
        const me = await get("game/isIngame");
        console.log(me);
        setIsIngame(me);
    }

    return (
        <div className="lobby-container">
            <div className="button-container">
                <div className="Invite-container">
                    <button className="button" onClick={toggleinvitePopup}>INVITE</button>
                    {invitePopup && <lobbyFunction.Popup
                    Content={<>
                    <p className="PopupTitle">Invite</p>
                        <div className="list-container">
                            <ul>
                                {friend?.length > 0 && 
                                    friend.map((item, index) => (
                                        <li key={index}>
                                            <div className="player-container">
                                                <p className="playerName">{item?.display_name}</p>
                                                <div className="button-invite-container">
                                                    <button onClick={() => lobbyFunction.inviteFriend(item?.id, 1)}>ClassicGame</button>
                                                    <div className="button-separator"></div>
                                                    <button onClick={() => lobbyFunction.inviteFriend(item?.id, 2)}>DeluxeGame</button>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </>}
                    handleclose={toggleinvitePopup}
                    />}
                </div>
                <div className="matchmaking-container">
                    <button className="button" onClick={toggleMatchPopup}>MATCHMAKING</button>
                    {matchPopup && <lobbyFunction.Popup
                        Content={<>
                            <p className="PopupTitle">Matchmaking</p>
                            <div className="elementPopupCenter-h elementPopupCenter-l">
                                <button className="matchMaking-button" onClick={() => toggleMatchmaking(1)}>ClassicGame</button>
                                <div className="matchMaking-button-separator"></div>
                                <button className="matchMaking-button" onClick={() => toggleMatchmaking(2)}>DeluxeGame</button>
                            </div>
                        </>}
                        handleclose={toggleMatchPopup}
                    />}
                </div>
                {lobbyFunction.isInGame(isIngame)}
            </div>
            <div className="matchHistory-container">
                <div className="matchHistory-title-container">
                    <label className="matchHistory-title">Match History</label>
                </div>
                <div className="overflow-container">
                    <div className="matchHistory-list">
                        <ul>
                            {matchHistory?.length > 0 && 
                                matchHistory.map((item, index) => (
                                    <li key={index}>
                                        <div className={`matchHistory-element ${item?.Win ? 'winner' : ''}`}>
                                            <div className="score1-container">
                                                <p id="matchHistory-element-score">{item?.myScore === -1 ? 'Disconnect' : item?.myScore}</p>
                                            </div>
                                            <div className="name-container">
                                                <p id="matchHistory-element-player2">{item?.opponentName}</p>
                                            </div>
                                            <div className="score2-container">
                                                <p id="matchHistory-element-score">{item?.enemyScore === -1 ? 'Disconnect' : item?.enemyScore}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}