import React, { useEffect, useState, useRef } from "react";
import "../Styles/GameStyle.css";
import * as request from "./gameRequest";

export default function Game(socket) {
    return (
        <body>
            <canvas id="gameCanvas" width="480" height="320"
                style={{border: "1px solid #000000"}}>
            </canvas>
        </body>
    );
}