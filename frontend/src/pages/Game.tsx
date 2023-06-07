import React, { Component } from "react";
import MyGame from "../components/Utils/game.tsx";
import "../components/Styles/GameStyle.css";

class Game extends Component {
    render() {
        return (
            <div className="gameBody">
                <MyGame />
            </div>
        );
    }
}

export default Game;