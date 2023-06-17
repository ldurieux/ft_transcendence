import React, { Component } from "react";
// import { MyGame } from "../components/Utils/game.tsx";
// import "../components/Styles/GameStyle.css";
import GameComponent from "../components/Utils/gameComponents/game.tsx";

function Game({socket}) {
    return (
            <div>
                <GameComponent socket={socket}/>
            </div>
        );
}

export default Game;