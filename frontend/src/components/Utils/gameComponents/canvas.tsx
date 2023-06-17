import React from "react";
import GameComponent from "./game";

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function drawBoard() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}