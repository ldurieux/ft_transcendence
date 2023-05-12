import React, { Component, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../components/Styles/LeaderboardStyles.css";



class Leaderboard extends Component {
    render() {
        if (localStorage.getItem("token") === null) {
            window.location.href = "/login";
        }
        return (
            <div className="Leaderboard">
                <div className="LeaderboardHeader">
                <h1>Leaderboard</h1>
                </div>
                <div className="LeaderboardBody">
                    <div className="LeaderboardList">

                    </div>
                </div>
            </div>
        );
    }
}

export default Leaderboard;