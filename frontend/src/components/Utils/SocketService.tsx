// socketService.js ou socketService.ts
export default class SocketService {
    constructor() {
        this.socket = null;
        this.url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
            this.socket.send(JSON.stringify(baguette));
            console.log('connected to server');
        };

        this.socket.onclose = () => {
            console.log('disconnected from server');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'gameStart') {
                window.location.href = '/game';
            }
            if (data.type === 'invite') {
                // Gérer la logique des invitations ici
            }
        };
    }

    disconnect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('closing socket');
            this.socket.close();
        }
    }

    getSocket() {
        return this.socket;
    }
}
