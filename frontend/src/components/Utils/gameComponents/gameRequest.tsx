import React from 'react';
import { get } from '../Request.tsx';

export async function friendList(socket, id: number) {
    const message = {action: "friendList", id: id};
    socket.send(JSON.stringify(message));
}

export function getMyself()
{
    const user = get('user/self');
    return user;
}

export function sendPadPosition(socket, id: number, position: number) {
    const message = {action: "padPosition", id: id, position: position};
    socket.send(JSON.stringify(message));
}

export function gameInvit(socket, id: number, friendId: number) {
    const message = {action: "gameInvit", id: id, friendId: friendId};
    socket.send(JSON.stringify(message));
}

export function MatchMaking(socket, id: number) {
    const message = {action: "MatchMaking", id: id};
    socket.send(JSON.stringify(message));
}