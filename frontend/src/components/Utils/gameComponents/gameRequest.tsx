import React from 'react';
import { get } from '../Request';

export function friendList(socket, id: number) {
    const message = {action: "friendList", id: id};
    socket.send(JSON.stringify(message));
}

export function getMyself()
{
    const user = get('user/self');
    return user;
}