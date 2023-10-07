// socketService.js ou socketService.ts
export default class SocketService {

    socket: WebSocket | null;
    url: string;

    constructor() {
        this.socket = null;
        this.url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
            if (this.socket)
                this.socket.send(JSON.stringify(baguette));
        };

        this.socket.onclose = () => {
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'gameStart') {
                window.location.href = '/game';
            }
            if (data.type === 'invite') {
            }
        };
    }

    disconnect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
    }

    getSocket() {
        return this.socket;
    }
}
