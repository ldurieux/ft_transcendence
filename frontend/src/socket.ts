import { io } from "socket.io-client";

const socket = io(`http://${process.env.REACT_APP_WEB_HOST}:5000`, {
    autoConnect: false
});

export default socket;