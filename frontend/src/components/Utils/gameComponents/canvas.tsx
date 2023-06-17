import React from "react";
import GameComponent from "./game";

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function drawBall(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

function drawBoard(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    drawBoard(ctx);
    drawBall(ctx);
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);