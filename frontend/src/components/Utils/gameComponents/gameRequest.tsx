import { get } from "src/components/Utils/requests";

export default function friendList(socket, id: number) {
    const message = {action: "friendList", id: id};
    socket.send(JSON.stringify(message));
}