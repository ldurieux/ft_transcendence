import React, { useEffect, useState, useRef } from "react";
import "../../Styles/GameStyle.css";
import * as request from "./gameRequest.tsx";
import { WebSocket } from "ws";
import Canvas from "./canvas.tsx";
import { log } from "console";

interface BallData {
    x: number;
    y: number;
    radianVector: number;
    speed: number;
    radius: number;
}

interface PaddleData {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Score {
    myScore: number;
    opponentScore: number;
}

interface Screen {
    width: number;
    height: number;
}

interface Data {
    ball: BallData;
    paddle1: PaddleData;
    paddle2: PaddleData;
    score1: Score;
    score2: Score;
    originalScreen: Screen;
}

let paddlePosition: number = 0;

function GameComponent({ socket }) {
    const [gameData, setData] = useState<Data>({
        ball: {
            x: 0,
            y: 0,
            radianVector: 0,
            speed: 0,
            radius: 0,
        },
        paddle1: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        paddle2: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        score1: {
            myScore: 0,
            opponentScore: 0,
        },
        score2: {
            myScore: 0,
            opponentScore: 0,
        },
        originalScreen: {
            width: 0,
            height: 0,
        },
    });


    const [id, setId] = useState(0);
    const [opponentId, setOpponentId] = useState(0);
    const [isMatchMaking, setIsMatchMaking] = useState(false);
    const [isInvited, setIsInvited] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [isInvitingMe, setIsInvitingMe] = useState(false);
    const [yaxe, setYaxe] = useState(0);

    // useEffect(() => {
    //         const user = request.getMyself();
    //         user.then((result) => {
    //             setId(result.id);
    //         });
    //         socket.onmessage = (event) => {
    //             const message = JSON.parse(event.data);
    //             console.log(message);
    //             if (message.action === "MatchMaking") {
    //                 setIsMatchMaking(true);
    //             }
    //             if (message.action === "gameInvit") {
    //                 setIsInvitingMe(true);
    //                 setOpponentId(message.id);
    //             }
    //             if (message.action === "gameInvitAccepted") {
    //                 setIsInvited(true);
    //                 setOpponentId(message.id);
    //             }
    //             if (message.action === "gameInvitRefused") {
    //                 setIsInviting(false);
    //             }
    //             if (message.action === "gameInvitCanceled") {
    //                 setIsInvited(false);
    //             }
    //             if (message.action === "gameStart") {
    //                 setIsInviting(false);
    //                 setIsInvited(false);
    //                 setIsInvitingMe(false);
    //                 setData(message.data);
    //             }
    //             if (message.action === "padPosition") {
    //                 if (message.id !== id) {
    //                     setData(message.data);
    //                 }
    //             }
    //             if (message.action === "ballPosition") {
    //                 setData(message.data);
    //             }
    //             if (message.action === "score") {
    //                 setData(message.data);
    //             }
    //         };
    // }, []);


    const movePad = (event) => {
        if (event.key === "ArrowUp") {
            // socket.emit(
            //     'movePad',
            //     {id: id, direction: "up"}
            // );
        }
        if (event.key === "ArrowDown") {
            console.log("down");
            const data = {event: 'movePad', data: {id: id, paddleAction: "down"}};
            socket.send(JSON.stringify(data));
        }
    };


    useEffect(() => {
        if (socket) {
            document.addEventListener("keydown", movePad);
            document.addEventListener("keyup", movePad);
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log(message);
            }
        }
    }, [socket]);

    console.log(paddlePosition);
    
    return (
        <div className="game">

            <div className="canvas-game">
                <Canvas paddle={paddlePosition} />
            </div>
        </div>
    );
} 

export default GameComponent;