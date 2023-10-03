import React, { Component } from "react";
import "../components/Styles/LeaderboardStyles.css";

class Leaderboard extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            data: []
        }
    }

    async Board() {
        try {
            const url = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/leaderboard`;
            const token = localStorage.getItem('token');
            const options: RequestInit = {
                method: 'GET',
                headers: {"Content-Type": "application/json", "authorization": "Bearer " + token}
            };
            const response = await fetch(url, options);
            if (response.status === 200) {
                let data = await response.json();
                this.setState({data: data});
            }
            else if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    async componentDidMount() {
        await this.Board();
    }

    render() {
        const {data} = this.state;

        return (
            <div className="Leaderboard">
                <div className="LeaderboardHeader">
                <h1>Leaderboard</h1>
                </div>
                <div className="LeaderboardBody">
                    <div className="LeaderboardList">
                        <ul>
                            {data.map((item: any) => (
                                <li key={item.id}>
                                    <div className="nickname"> {item.display_name} </div>
                                    <div className="score"> {item.points} </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default Leaderboard;