import React from 'react';
import { get, post} from '../../Request.tsx';

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

export function gameInvit(id: number, friendId: number) {
    const response = post('game/invite', {myId: id, friendId: friendId}); 
}

export function MatchMaking(socket, id: number) {
    const message = {action: "MatchMaking", id: id};
    socket.send(JSON.stringify(message));
}

export function postPaddleDirection(socket, playerId: number, direction: string, gameId: number) {
    const message = {action: "paddleDirection", id: playerId, gameId: gameId, direction: direction};
    socket.send(JSON.stringify(message));
}