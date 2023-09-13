import React from "react";
import "../components/Styles/lobbyStyles.css"
import LobbyPage from "../components/Utils/gameComponents/lobby.tsx"


export default function Lobby({socket}) {
    return (
        <div>
            <LobbyPage socket={socket} />
        </div>
    );
}