import { useState, useEffect } from 'react';
import { get } from "../Request.tsx";
import * as React from 'react';
import "../../Styles/lobbyStyles.css" 
import * as lobbyFunction from "./lobby/lobbyFunction.tsx"

export default function LobbyPage() {
    const [invitePopup, setInvitePopup] = useState(false);
    const [matchPopup, setMatchPopup] = useState(false);
    const [matchMakingSearch, setMatchMakingSearch] = useState(false);
    const [friend, setFriend] = useState([]);
    const [matchHistory, setMatchHistory] = useState([]);

    useEffect(() => {
        getFriendsList();
        getMatchHistory();
    }, []);

    const toggleinvitePopup = () => {
        setInvitePopup(!invitePopup);
    }

    const toggleMatchPopup = () => {
        setMatchPopup(!matchPopup);
    }

    const cancelMatchMaking = () => {
        lobbyFunction.matchMaking(0);
        setMatchMakingSearch(false);
    }

    const toggleMatchmaking = (gameType) => {
        lobbyFunction.matchMaking(gameType);
        toggleMatchPopup();
        setMatchMakingSearch(true);
    }

    async function getFriendsList() {
        const me = await get("user/self");
        setFriend(me.friends);
    }

    async function getMatchHistory() {
        const me = await get("game/matchHistory");
        setMatchHistory(me);
    }

    const handleInvite = (friendId, typeOfGame) => {
        lobbyFunction.inviteFriend(friendId, typeOfGame);
        toggleinvitePopup();
    }

    useEffect(() => {
        lobbyFunction.getIsInMatchMaking().then((res) => {
            console.log(res);
            try {
                if (res === "true") {
                    setMatchMakingSearch(true);
                }
                else {
                    setMatchMakingSearch(false);
                }
            }
            catch (error) {
                setMatchMakingSearch(false);
            }
        });
    }, []);

    function IsInGame() {
        const [isInGame, setIsInGame] = useState(false);
        useEffect(() => {
            async function isInGame() {
                await get("game/isInGame").then((res) => {
                    try {
                        if (res === "true") {
                            setIsInGame(true);
                        }
                        else {
                            setIsInGame(false);
                        }
                    }
                    catch (error) {
                        setIsInGame(false);
                    }
                });
            }
            isInGame();
        },[]);
        if (isInGame) {
            return (
                <div className="resume-container">
                    <button className="button" onClick={() => {window.location.href = "/game"}}>RESUME</button>
                </div>
            )
        }
        else {
            return (
                <div></div>
            )
        }
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
                                                    <button onClick={() => handleInvite(item?.id, 1)}>ClassicGame</button>
                                                    <div className="button-separator"></div>
                                                    <button onClick={() => handleInvite(item?.id, 2)}>DeluxeGame</button>
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
                    { matchMakingSearch ?
                        <button className="lds-dual-ring" onClick={cancelMatchMaking}></button>
                        :
                        <button className="button" onClick={toggleMatchPopup}>MATCHMAKING</button>
                    }
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
                {IsInGame()}
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